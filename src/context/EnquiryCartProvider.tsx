import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  EnquiryCartContextValue, 
  EnquiryProduct, 
  ContactDetails, 
  EnquirySubmission 
} from '../types/enquiry';

const STORAGE_KEYS = {
  ITEMS: 'enquiry-cart-items',
  GENERAL_MESSAGE: 'enquiry-cart-general-message',
  CONTACT_DETAILS: 'enquiry-cart-contact-details',
};

const EnquiryCartContext = createContext<EnquiryCartContextValue | undefined>(undefined);

export const EnquiryCartProvider = ({ children }: { children: React.ReactNode }) => {
  // State
  const [items, setItems] = useState<EnquiryProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generalMessage, setGeneralMessage] = useState('');
  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    name: '',
    email: '',
    phone: '',
  });
  const [isSending, setIsSending] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
      
      const savedMessage = localStorage.getItem(STORAGE_KEYS.GENERAL_MESSAGE);
      if (savedMessage) {
        setGeneralMessage(savedMessage);
      }
      
      const savedContact = localStorage.getItem(STORAGE_KEYS.CONTACT_DETAILS);
      if (savedContact) {
        setContactDetails(JSON.parse(savedContact));
      }
    } catch (error) {
      console.warn('Failed to load enquiry cart from localStorage:', error);
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to save enquiry cart items:', error);
    }
  }, [items]);

  // Save general message to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GENERAL_MESSAGE, generalMessage);
    } catch (error) {
      console.warn('Failed to save enquiry general message:', error);
    }
  }, [generalMessage]);

  // Save contact details to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACT_DETAILS, JSON.stringify(contactDetails));
    } catch (error) {
      console.warn('Failed to save enquiry contact details:', error);
    }
  }, [contactDetails]);

  // Actions
  const addProduct = useCallback((categorySlug: string, productSlug: string, name: string, image: string) => {
    setItems(prevItems => {
      // Check if product already exists
      const existingIndex = prevItems.findIndex(
        item => item.categorySlug === categorySlug && item.productSlug === productSlug
      );
      
      if (existingIndex >= 0) {
        // Product already in cart, don't add duplicate
        return prevItems;
      }
      
      // Add new product
      const newProduct: EnquiryProduct = {
        categorySlug,
        productSlug,
        name,
        image,
        notes: '',
      };
      
      return [...prevItems, newProduct];
    });
  }, []);

  const removeProduct = useCallback((categorySlug: string, productSlug: string) => {
    setItems(prevItems => 
      prevItems.filter(item => 
        !(item.categorySlug === categorySlug && item.productSlug === productSlug)
      )
    );
  }, []);

  const updateProductNotes = useCallback((categorySlug: string, productSlug: string, notes: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.categorySlug === categorySlug && item.productSlug === productSlug
          ? { ...item, notes }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setGeneralMessage('');
    // Don't clear contact details as they might want to reuse them
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const sendEnquiry = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (items.length === 0) {
      return { success: false, error: 'No products in enquiry cart' };
    }
    
    if (!contactDetails.name || !contactDetails.email) {
      return { success: false, error: 'Name and email are required' };
    }

    setIsSending(true);
    
    try {
      const enquiryData: EnquirySubmission = {
        products: items,
        generalMessage,
        contactDetails,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/send-enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enquiryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Optionally clear cart after successful send
        // clearCart(); // Uncomment if you want to auto-clear
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to send enquiry' };
      }
      
    } catch (error) {
      console.error('Error sending enquiry:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send enquiry' 
      };
    } finally {
      setIsSending(false);
    }
  }, [items, generalMessage, contactDetails]);

  const contextValue: EnquiryCartContextValue = {
    // State
    items,
    isOpen,
    
    // Actions
    addProduct,
    removeProduct,
    updateProductNotes,
    clearCart,
    
    // Panel control
    openCart,
    closeCart,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Submission
    generalMessage,
    setGeneralMessage,
    contactDetails,
    setContactDetails,
    
    // Send
    sendEnquiry,
    isSending,
  };

  return (
    <EnquiryCartContext.Provider value={contextValue}>
      {children}
    </EnquiryCartContext.Provider>
  );
};

export const useEnquiryCart = () => {
  const context = useContext(EnquiryCartContext);
  if (!context) {
    throw new Error('useEnquiryCart must be used within EnquiryCartProvider');
  }
  return context;
};