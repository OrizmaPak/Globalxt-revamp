import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseApp from '../lib/firebase';
import type { SiteContent } from '../lib/contentTypes';
import { useContent } from './ContentProvider';

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
  saveChanges: () => Promise<void>;
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

  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

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

        const editableElement: EditableElement = {
          id: `${type}-${index}-${Date.now()}`,
          type: getElementType(htmlElement),
          content: textContent,
          dataPath: inferDataPath(htmlElement, textContent),
          element: htmlElement,
          component: inferComponentName(htmlElement)
        };

        elements.push(editableElement);
      });
    });

    setEditableElements(elements);
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
  const inferDataPath = (element: HTMLElement, textContent: string): string => {
    // Check for data attributes that might indicate the content path
    const dataPath = element.getAttribute('data-content-path');
    if (dataPath) return dataPath;
    
    // Try to infer from context
    const classes = element.className || '';
    const parent = element.closest('[data-section]');
    const section = parent?.getAttribute('data-section');
    
    // Look for common patterns
    if (classes.includes('hero') || section === 'hero') {
      if (classes.includes('title') || element.tagName.match(/^H[1-6]$/)) {
        return 'pageCopy.hero.title';
      }
      if (classes.includes('description')) {
        return 'pageCopy.hero.description';
      }
    }
    
    if (classes.includes('nav') || section === 'navigation') {
      return 'navItems';
    }
    
    if (classes.includes('company') || section === 'company') {
      return 'companyInfo';
    }
    
    // Default fallback
    return `content.${textContent.toLowerCase().replace(/\s+/g, '_').substring(0, 20)}`;
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
      console.log('Smart Edit Mode Toggle:', { newMode });
      
      if (newMode) {
        setStatus('Smart edit mode activated');
        console.log('Smart edit activated - scanning for elements...');
        setTimeout(scanForEditableElements, 100); // Small delay to ensure DOM is ready
      } else {
        setStatus('Smart edit mode deactivated');
        console.log('Smart edit deactivated');
        setEditableElements([]);
        removeEditOverlays();
      }
      return newMode;
    });
  }, [scanForEditableElements]);

  // Update element content
  const updateElement = useCallback((id: string, newContent: string) => {
    const element = editableElements.find(el => el.id === id);
    if (!element) return;

    setPendingChanges(prev => ({
      ...prev,
      [id]: newContent
    }));

    // Update the DOM immediately for visual feedback
    if (element.element) {
      element.element.textContent = newContent;
    }

    // If it's a component, update all similar elements
    if (element.component) {
      editableElements
        .filter(el => el.component === element.component && el.content === element.content)
        .forEach(similarElement => {
          if (similarElement.element) {
            similarElement.element.textContent = newContent;
          }
          setPendingChanges(prev => ({
            ...prev,
            [similarElement.id]: newContent
          }));
        });
    }
  }, [editableElements]);

  // Save changes to Firebase
  const saveChanges = useCallback(async () => {
    if (!content || !firebaseApp || Object.keys(pendingChanges).length === 0) {
      setStatus('No changes to save');
      return;
    }

    try {
      setStatus('Saving changes...');
      const db = getFirestore(firebaseApp);
      
      // Create updated content object
      const updatedContent = { ...content };
      
      // Apply changes based on data paths
      Object.entries(pendingChanges).forEach(([elementId, newContent]) => {
        const element = editableElements.find(el => el.id === elementId);
        if (element) {
          applyContentChange(updatedContent, element.dataPath, newContent);
        }
      });

      // Sanitize and save
      const sanitizeForFirebase = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) return obj.map(sanitizeForFirebase).filter(item => item !== null && item !== undefined);
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
      await setDoc(doc(db, 'content/site'), cleanContent, { merge: false });
      
      setStatus('Changes saved successfully!');
      setPendingChanges({});
      
      setTimeout(() => setStatus('Smart edit mode active'), 3000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setTimeout(() => setStatus('Smart edit mode active'), 5000);
    }
  }, [content, pendingChanges, editableElements]);

  // Apply content change to the content object
  const applyContentChange = (content: any, path: string, value: string) => {
    const pathParts = path.split('.');
    let current = content;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = value;
  };

  // Discard changes
  const discardChanges = useCallback(() => {
    setPendingChanges({});
    // Restore original content in DOM
    editableElements.forEach(element => {
      if (element.element) {
        element.element.textContent = element.content;
      }
    });
    setStatus('Changes discarded');
    setTimeout(() => setStatus('Smart edit mode active'), 2000);
  }, [editableElements]);

  // Remove edit overlays
  const removeEditOverlays = () => {
    document.querySelectorAll('.smart-edit-overlay').forEach(overlay => {
      overlay.remove();
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

    // Add click listeners directly to editable elements for reliable clicking
    const handleElementClick = (e: MouseEvent) => {
      if (!isSmartEditMode) return;
      
      const target = e.target as HTMLElement;
      const editableSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'button', 'a[href]', 'span', 'label'];
      
      const isEditable = editableSelectors.some(selector => {
        return target.matches(selector) || target.closest(selector);
      });
      
      if (isEditable && target.textContent && target.textContent.trim().length > 1) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Smart Edit Click Detected:', {
          element: target.tagName,
          content: target.textContent.trim().substring(0, 50),
          position: { x: e.clientX, y: e.clientY }
        });
        
        // Dispatch a custom event that the overlay can listen for
        const clickEvent = new CustomEvent('smartEditElementClicked', {
          detail: {
            element: target,
            content: target.textContent.trim(),
            type: getElementType(target),
            tagName: target.tagName,
            component: inferComponentName(target),
            position: { x: e.clientX, y: e.clientY }
          }
        });
        
        document.dispatchEvent(clickEvent);
      }
    };
    
    document.addEventListener('click', handleElementClick, true); // Use capture phase

    // Helper function for getElementType (moved here for click handler)
    const getElementType = (element: HTMLElement) => {
      const tagName = element.tagName.toLowerCase();
      if (tagName.match(/^h[1-6]$/)) return 'heading';
      if (tagName === 'p') return 'paragraph';
      if (tagName === 'button' || element.getAttribute('role') === 'button') return 'button';
      if (tagName === 'a') return 'link';
      return 'text';
    };

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
      document.removeEventListener('click', handleElementClick, true);
      document.removeEventListener('keydown', handleKeyPress);
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
    </SmartEditContext.Provider>
  );
};