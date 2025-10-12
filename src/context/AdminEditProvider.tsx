import React, { createContext, useContext, useState, useCallback } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseApp from '../lib/firebase';
import type { SiteContent } from '../lib/contentTypes';
import { useContent } from './ContentProvider';

interface AdminEditContextType {
  isEditMode: boolean;
  editedContent: SiteContent | null;
  hasUnsavedChanges: boolean;
  status: string;
  enterEditMode: () => void;
  exitEditMode: () => void;
  updateContent: <T extends keyof SiteContent>(section: T, updates: Partial<SiteContent[T]>) => void;
  updatePageCopy: (page: string, section: string, field: string, value: any) => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
}

const AdminEditContext = createContext<AdminEditContextType | null>(null);

export const useAdminEdit = () => {
  const context = useContext(AdminEditContext);
  if (!context) {
    throw new Error('useAdminEdit must be used within an AdminEditProvider');
  }
  return context;
};

interface AdminEditProviderProps {
  children: React.ReactNode;
}

export const AdminEditProvider = ({ children }: AdminEditProviderProps) => {
  const { content } = useContent();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<SiteContent | null>(null);
  const [status, setStatus] = useState('Ready');

  const hasUnsavedChanges = React.useMemo(() => {
    if (!content || !editedContent || !isEditMode) return false;
    return JSON.stringify(content) !== JSON.stringify(editedContent);
  }, [content, editedContent, isEditMode]);

  const enterEditMode = useCallback(() => {
    if (content) {
      setEditedContent(structuredClone(content));
      setIsEditMode(true);
      setStatus('Edit mode active');
    }
  }, [content]);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setEditedContent(null);
    setStatus('Ready');
  }, []);

  const updateContent = useCallback(<T extends keyof SiteContent>(section: T, updates: Partial<SiteContent[T]>) => {
    if (!editedContent || !isEditMode) return;
    setEditedContent(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        ...updates
      }
    }));
  }, [editedContent, isEditMode]);

  const updatePageCopy = useCallback((page: string, section: string, field: string, value: any) => {
    if (!editedContent?.pageCopy || !isEditMode) return;
    setEditedContent(prev => {
      if (!prev) return null;
      
      const currentPageCopy = prev.pageCopy[page as keyof typeof prev.pageCopy] as any;
      const currentSection = currentPageCopy?.[section] || {};
      
      return {
        ...prev,
        pageCopy: {
          ...prev.pageCopy,
          [page]: {
            ...currentPageCopy,
            [section]: {
              ...currentSection,
              [field]: value
            }
          }
        }
      };
    });
  }, [editedContent, isEditMode]);

  const saveChanges = useCallback(async () => {
    if (!editedContent || !firebaseApp) {
      setStatus('Error: Firebase not configured');
      return;
    }

    try {
      setStatus('Saving changes...');
      const db = getFirestore(firebaseApp);
      
      // Sanitize content before saving
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

      const cleanContent = sanitizeForFirebase(editedContent);
      await setDoc(doc(db, 'content/site'), cleanContent, { merge: false });
      
      setStatus('Changes saved successfully!');
      
      setTimeout(() => {
        if (isEditMode) {
          setStatus('Edit mode active');
        } else {
          setStatus('Ready');
        }
      }, 3000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setTimeout(() => {
        if (isEditMode) {
          setStatus('Edit mode active');
        } else {
          setStatus('Ready');
        }
      }, 5000);
    }
  }, [editedContent, isEditMode]);

  const discardChanges = useCallback(() => {
    if (content) {
      setEditedContent(structuredClone(content));
      setStatus('Changes discarded');
      setTimeout(() => {
        if (isEditMode) {
          setStatus('Edit mode active');
        } else {
          setStatus('Ready');
        }
      }, 2000);
    }
  }, [content, isEditMode]);

  const contextValue: AdminEditContextType = {
    isEditMode,
    editedContent: editedContent || content,
    hasUnsavedChanges,
    status,
    enterEditMode,
    exitEditMode,
    updateContent,
    updatePageCopy,
    saveChanges,
    discardChanges,
  };

  return (
    <AdminEditContext.Provider value={contextValue}>
      {children}
    </AdminEditContext.Provider>
  );
};