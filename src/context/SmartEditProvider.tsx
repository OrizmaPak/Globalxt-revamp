import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import firebaseApp from '../lib/firebase';
import type { SiteContent } from '../lib/contentTypes';
import { useContent } from './ContentProvider';
import MinimalEditModal from '../components/admin/MinimalEditModal';

interface EditableElement {
  id: string;
  type: 'text' | 'button' | 'link' | 'heading' | 'paragraph';
  content: string;
  dataPath: string; // Path to the data in the content structure
  element: HTMLElement;
  component?: string; // Component name for global updates
}

interface SmartEditContextType {
  isSmartEditMode: boolean;
  editableElements: EditableElement[];
  hasUnsavedChanges: boolean;
  status: string;
  toggleSmartEdit: () => void;
  saveChanges: () => Promise<boolean>;
  discardChanges: () => void;
  updateElement: (id: string, newContent: string) => void;
  scanForEditableElements: () => void;
}

const SmartEditContext = createContext<SmartEditContextType | null>(null);

export const useSmartEdit = () => {
  const context = useContext(SmartEditContext);
  if (!context) {
    throw new Error('useSmartEdit must be used within a SmartEditProvider');
  }
  return context;
};

interface SmartEditProviderProps {
  children: React.ReactNode;
}

export const SmartEditProvider = ({ children }: SmartEditProviderProps) => {
  const { content } = useContent();
  const [isSmartEditMode, setIsSmartEditMode] = useState(false);
  const [editableElements, setEditableElements] = useState<EditableElement[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('Ready');

  const pendingChangesRef = useRef<Record<string, string>>({});
  const editableElementsRef = useRef<EditableElement[]>([]);

  // Modal state for click-to-edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialValue, setModalInitialValue] = useState('');
  const [modalElementId, setModalElementId] = useState<string | null>(null);
  const [modalElementLabel, setModalElementLabel] = useState<string | undefined>(undefined);

  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  useEffect(() => {
    editableElementsRef.current = editableElements;
  }, [editableElements]);

  // Scan the DOM for editable elements
  const scanForEditableElements = useCallback(() => {
    if (!isSmartEditMode) return;

    const elements: EditableElement[] = [];
    const seenTexts = new Set<string>();

    // Define selectors for different types of editable content
    const selectors = {
      headings: 'h1, h2, h3, h4, h5, h6',
      paragraphs: 'p',
      buttons: 'button, .btn, [role="button"]',
      links: 'a[href]',
      spans: 'span',
      labels: 'label',
      texts: '[data-editable]' // Elements specifically marked as editable
    };

    // Scan each type of element
    Object.entries(selectors).forEach(([type, selector]) => {
      const foundElements = document.querySelectorAll(selector);
      
      foundElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        
        // Skip elements that are likely not content
        if (shouldSkipElement(htmlElement)) return;
        
        const textContent = htmlElement.textContent?.trim();
        if (!textContent || textContent.length < 2) return;
        
        // Avoid duplicates
        const elementKey = `${type}-${textContent}`;
        if (seenTexts.has(elementKey)) return;
        seenTexts.add(elementKey);

        // Create a stable ID based on element properties instead of timestamp
        const stableId = `${type}-${textContent.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}-${index}`;
        
        const dataPath = inferDataPath(htmlElement, textContent);
        if (!dataPath) {
          return;
        }

        const editableElement: EditableElement = {
          id: stableId,
          type: getElementType(htmlElement),
          content: textContent,
          dataPath,
          element: htmlElement,
          component: inferComponentName(htmlElement)
        };

        // Mark element so we can easily ignore inside modal/backdrop
        htmlElement.setAttribute('data-smart-edit-id', editableElement.id);

        elements.push(editableElement);
      });
    });

    setEditableElements(elements);
    editableElementsRef.current = elements;
  }, [isSmartEditMode]);

  // Determine if an element should be skipped
  const shouldSkipElement = (element: HTMLElement): boolean => {
    // Skip hidden elements
    if (element.offsetParent === null) return true;
    
    // Skip script tags, style tags, etc.
    const tagName = element.tagName.toLowerCase();
    if (['script', 'style', 'meta', 'link', 'title'].includes(tagName)) return true;
    
    // Skip elements with certain classes (admin controls, etc.)
    const skipClasses = ['admin-', 'edit-', 'preview-', 'control-'];
    const className = element.className || '';
    if (skipClasses.some(cls => className.includes(cls))) return true;
    
    // Skip very small text
    const text = element.textContent?.trim() || '';
    if (text.length < 2) return true;
    
    return false;
  };

  // Determine element type
  const getElementType = (element: HTMLElement): EditableElement['type'] => {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName.match(/^h[1-6]$/)) return 'heading';
    if (tagName === 'p') return 'paragraph';
    if (tagName === 'button' || element.getAttribute('role') === 'button') return 'button';
    if (tagName === 'a') return 'link';
    
    return 'text';
  };

  // Infer the data path in content structure
  const inferDataPath = (element: HTMLElement, textContent: string): string | null => {
    const dataPath = element.getAttribute('data-content-path');
    if (dataPath) {
      return dataPath;
    }

    console.debug('SmartEdit: element skipped (no data-content-path)', {
      sample: textContent.substring(0, 60),
      tag: element.tagName,
      classes: element.className
    });

    return null;
  };

  // Infer component name for global updates
  const inferComponentName = (element: HTMLElement): string | undefined => {
    const classes = element.className || '';
    
    // Common component patterns
    if (classes.includes('btn') || element.tagName === 'BUTTON') {
      return 'Button';
    }
    if (element.tagName === 'A') {
      return 'Link';
    }
    if (element.tagName.match(/^H[1-6]$/)) {
      return 'Heading';
    }
    
    return undefined;
  };

  // Toggle smart edit mode
  const toggleSmartEdit = useCallback(() => {
    setIsSmartEditMode(prev => {
      const newMode = !prev;
      if (newMode) {
        setStatus('Smart edit mode activated');
        setTimeout(scanForEditableElements, 100); // Small delay to ensure DOM is ready
      } else {
        setStatus('Smart edit mode deactivated');
        setEditableElements([]);
        editableElementsRef.current = [];
        removeEditOverlays();
      }
      return newMode;
    });
  }, [scanForEditableElements]);

  // Update element content
  const updateElement = useCallback((id: string, newContent: string) => {
    const elements = editableElementsRef.current;
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const originalContent = element.content;
    const updates: Record<string, string> = { [id]: newContent };

    if (element.element) {
      element.element.textContent = newContent;
    }

    if (element.component) {
      elements
        .filter(el => el.component === element.component && el.content === originalContent)
        .forEach(similarElement => {
          if (similarElement.element) {
            similarElement.element.textContent = newContent;
          }
          updates[similarElement.id] = newContent;
        });
    }

    pendingChangesRef.current = { ...pendingChangesRef.current, ...updates };
    setPendingChanges(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Dedicated Firebase save function with comprehensive error handling
  const saveToFirebase = useCallback(async (updatedContent: SiteContent): Promise<boolean> => {
    console.log('🔥 Starting Firebase save operation...');
    
    // Verify Firebase connection
    if (!firebaseApp) {
      console.error('❌ Firebase app not initialized');
      throw new Error('Firebase app not initialized');
    }

    const db = getFirestore(firebaseApp);
    if (!db) {
      console.error('❌ Firebase database not initialized');
      throw new Error('Firebase database not initialized');
    }

    try {
      // Sanitize content for Firebase
      const sanitizeForFirebase = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) {
          return obj.map(sanitizeForFirebase).filter(item => item !== null && item !== undefined);
        }
        if (typeof obj === 'object') {
          const cleaned: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined && value !== null) {
              const sanitized = sanitizeForFirebase(value);
              if (sanitized !== undefined && sanitized !== null) {
                cleaned[key] = sanitized;
              }
            }
          }
          return cleaned;
        }
        return obj;
      };

      const cleanContent = sanitizeForFirebase(updatedContent);
      
      console.log('📡 Writing to Firebase document: content/site');
      console.log('📊 Full content being saved to Firebase:', cleanContent);
      console.log('📊 Content structure being saved:', {
        hasCompanyInfo: !!cleanContent.companyInfo,
        hasHeroSlides: !!cleanContent.heroSlides,
        hasPageCopy: !!cleanContent.pageCopy,
        hasNavItems: !!cleanContent.navItems,
        heroSlidesCount: cleanContent.heroSlides?.length || 0,
        firstHeroSlide: cleanContent.heroSlides?.[0] || 'none'
      });
      
      // Use merge: false to ensure complete document update
      console.log('?? Saving complete document to Firebase...');
      await setDoc(doc(db, 'content/site'), cleanContent, { merge: false });
      
      console.log('✅ Successfully saved to Firebase!');
      
      // Verify the save by reading back from Firebase
      try {
        const verifyDoc = await getDoc(doc(db, 'content/site'));
        if (verifyDoc.exists()) {
          const savedData = verifyDoc.data();
          console.log('🔍 Verification read from Firebase:', {
            heroSlides: savedData?.heroSlides?.[0] || 'none',
            companyInfo: {
              phone: savedData?.companyInfo?.phone,
              hours: savedData?.companyInfo?.hours
            },
            pageCopyKeys: Object.keys(savedData?.pageCopy || {})
          });
        } else {
          console.error('❌ Verification failed: Document does not exist after save');
        }
      } catch (verifyError) {
        console.error('❌ Verification read failed:', verifyError);
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Firebase save failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  }, []);

  // Save changes function that orchestrates the save process
  const saveChanges = useCallback(async (): Promise<boolean> => {
    console.log('?? SmartEdit: Starting save process...');

    const currentPending = { ...pendingChangesRef.current };

    console.log('?? Save Debug Info:', {
      contentExists: !!content,
      firebaseAppExists: !!firebaseApp,
      pendingChangesCount: Object.keys(currentPending).length,
      pendingChanges: currentPending,
      editableElementsCount: editableElementsRef.current.length
    });

    if (!content) {
      console.log('? Save aborted: No content loaded');
      setStatus('Error: No content loaded');
      return false;
    }

    if (Object.keys(currentPending).length === 0) {
      console.log('? Save aborted: No pending changes');
      setStatus('No changes to save');
      return false;
    }

    try {
      setStatus('Saving changes...');

      const updatedContent = JSON.parse(JSON.stringify(content)) as SiteContent;

      console.log('?? Applying pending changes...');
      console.log('?? Current content structure before changes:', {
        heroSlides: updatedContent.heroSlides?.map((slide: any, index: number) => ({ 
          index, 
          title: slide.title, 
          subtitle: slide.subtitle, 
          ctaLabel: slide.ctaLabel 
        })) || [],
        companyInfo: updatedContent.companyInfo || {},
        pageCopy: Object.keys(updatedContent.pageCopy || {})
      });

      Object.entries(currentPending).forEach(([elementId, newContent]) => {
        const element = editableElementsRef.current.find(el => el.id === elementId);
        if (element) {
          console.log(`?? Applying change for element ${elementId}:`, {
            dataPath: element.dataPath,
            oldContent: element.content,
            newContent,
            elementType: element.type,
            elementClasses: element.element.className
          });
          try {
            applyContentChange(updatedContent, element.dataPath, newContent);
          } catch (pathError) {
            console.error(`? Failed to apply change at path ${element.dataPath}:`, pathError);
          }
        } else {
          console.warn(`?? Element not found for ID: ${elementId}`);
        }
      });

      console.log('?? Content structure after applying changes:', {
        heroSlides: updatedContent.heroSlides?.map((slide: any, index: number) => ({ 
          index, 
          title: slide.title, 
          subtitle: slide.subtitle, 
          ctaLabel: slide.ctaLabel 
        })) || [],
        companyInfo: updatedContent.companyInfo || {},
        pageCopy: Object.keys(updatedContent.pageCopy || {})
      });

      const saveSuccess = await saveToFirebase(updatedContent);

      if (saveSuccess) {
        setStatus('? Changes saved successfully!');
        pendingChangesRef.current = {};
        setPendingChanges({});

        console.log('✅ Save successful, content will update via Firebase listener');
        
        // Wait a bit and then check if content was updated
        setTimeout(() => {
          const currentContent = content;
          console.log('🔍 Checking if content was updated after save:', {
            currentContent: currentContent?.heroSlides?.[0]?.title || 'no hero title',
            expectedUpdates: Object.entries(currentPending).map(([id, newContent]) => {
              const el = editableElementsRef.current.find(e => e.id === id);
              return { path: el?.dataPath, newValue: newContent };
            })
          });
          setStatus('Smart edit mode active');
        }, 2000);

        return true;
      }

      return false;
    } catch (error: any) {
      console.error('? Save operation failed:', error);
      setStatus(`? Save failed: ${error.message}`);

      setTimeout(() => {
        setStatus('Smart edit mode active');
      }, 5000);

      return false;
    }
  }, [content, saveToFirebase, scanForEditableElements]);

  // Apply content change to the content object
  const applyContentChange = (content: any, path: string, value: string) => {
    console.log('🔧 Applying content change:', { path, value });
    
    try {
      const pathParts = path.split('.');
      let current = content;
      
      // Navigate/create the path structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        
        // Handle array indices (e.g., "0", "1", etc.)
        if (/^\d+$/.test(part)) {
          const index = parseInt(part, 10);
          if (!Array.isArray(current)) {
            console.warn(`⚠️ Expected array at path segment ${i}, but found:`, typeof current);
            return;
          }
          if (!current[index]) {
            console.log(`🏠 Creating missing array element at index: ${index}`);
            current[index] = {};
          }
          current = current[index];
        } else {
          // Handle regular object properties
          if (!current[part]) {
            console.log(`🏠 Creating missing path segment: ${part}`);
            current[part] = {};
          }
          current = current[part];
        }
      }
      
      const lastPart = pathParts[pathParts.length - 1];
      
      // Handle array index in the last part too
      if (/^\d+$/.test(lastPart)) {
        const index = parseInt(lastPart, 10);
        if (!Array.isArray(current)) {
          console.warn(`⚠️ Expected array for final path segment, but found:`, typeof current);
          return;
        }
        const oldValue = current[index];
        current[index] = value;
        console.log(`✅ Successfully applied change at ${path}:`, { oldValue, newValue: value });
      } else {
        // Handle regular property
        const oldValue = current[lastPart];
        current[lastPart] = value;
        console.log(`✅ Successfully applied change at ${path}:`, { oldValue, newValue: value });
      }
      
    } catch (error) {
      console.error(`❌ Failed to apply content change at path ${path}:`, error);
      throw error;
    }
  };

  // Discard changes
  const discardChanges = useCallback(() => {
    pendingChangesRef.current = {};
    setPendingChanges({});
    editableElementsRef.current.forEach(element => {
      if (element.element) {
        element.element.textContent = element.content;
      }
    });
    setStatus('Changes discarded');
    setTimeout(() => setStatus('Smart edit mode active'), 2000);
  }, []);

  // Remove edit overlays
  const removeEditOverlays = () => {
    document.querySelectorAll('.smart-edit-overlay').forEach(overlay => {
      overlay.remove();
    });
    // Also remove element markers
    editableElementsRef.current.forEach(el => {
      el.element.removeAttribute('data-smart-edit-id');
    });
  };

  // Add edit overlays when in smart edit mode
  useEffect(() => {
    // Add/remove CSS class for fallback styling
    if (isSmartEditMode) {
      document.body.classList.add('smart-edit-active');
    } else {
      document.body.classList.remove('smart-edit-active');
      removeEditOverlays();
      return;
    }

    scanForEditableElements();

    // Intercept clicks to open a futuristic edit modal for text elements
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Ignore clicks inside any element explicitly opted-out
      if (target.closest('[data-smart-edit-ignore]')) return;

      // Find the closest tracked editable element
      const clickedEditable = editableElementsRef.current.find(el => el.element === target || el.element.contains(target));
      if (clickedEditable) {
        e.preventDefault();
        e.stopPropagation();
        // Prepare and open modal
        setModalInitialValue(clickedEditable.element.textContent?.trim() || clickedEditable.content);
        setModalElementId(clickedEditable.id);
        setModalElementLabel(clickedEditable.type + (clickedEditable.component ? ` (${clickedEditable.component})` : ''));
        setIsModalOpen(true);
      }
    };

    // Use capture phase so we catch link/button clicks before navigation
    document.addEventListener('click', handleClick, true);

    // Add event listeners for keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          saveChanges();
        } else if (e.key === 'z') {
          e.preventDefault();
          discardChanges();
        }
      }
      if (e.key === 'Escape') {
        toggleSmartEdit();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('click', handleClick, true);
      removeEditOverlays();
      document.body.classList.remove('smart-edit-active');
    };
  }, [isSmartEditMode, saveChanges, discardChanges, toggleSmartEdit, scanForEditableElements]);

  const contextValue: SmartEditContextType = {
    isSmartEditMode,
    editableElements,
    hasUnsavedChanges,
    status,
    toggleSmartEdit,
    saveChanges,
    discardChanges,
    updateElement,
    scanForEditableElements,
  };

  return (
    <SmartEditContext.Provider value={contextValue}>
      {children}

      {/* Futuristic minimal edit modal for smart editing */}
      <MinimalEditModal
        isOpen={isModalOpen}
        initialValue={modalInitialValue}
        elementLabel={modalElementLabel}
        onClose={() => setIsModalOpen(false)}
        onSave={async (newContent) => {
          if (!modalElementId) {
            console.error('❌ Modal save failed: No element ID');
            return;
          }
          
          console.log('🚀 MODAL SAVE: Starting save process for element:', modalElementId);
          console.log('📝 Content to save:', newContent);
          
          try {
            // First, update the element for immediate visual feedback
            updateElement(modalElementId, newContent);
            console.log('🔄 Element updated in DOM');
            
            // Set status to show saving is in progress
            setStatus('🔄 Saving to Firebase...');
            
            // Force a small delay to ensure state updates
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Now save to Firebase
            console.log('💾 Triggering Firebase save...');
            const saveResult = await saveChanges();
            
            if (saveResult) {
              console.log('✅ MODAL SAVE: Successfully saved to Firebase!');
              setStatus('✅ Saved to Firebase!');
            } else {
              console.error('❌ MODAL SAVE: Firebase save returned false');
              setStatus('❌ Save failed - check console');
            }
          } catch (error: any) {
            console.error('❌ MODAL SAVE: Critical error during save process:', error);
            console.error('Error stack:', error.stack);
            setStatus(`❌ Save error: ${error.message}`);
          }
        }}
      />
    </SmartEditContext.Provider>
  );
};

