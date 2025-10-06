export interface EnquiryProduct {
  categorySlug: string;
  productSlug: string;
  name: string;
  image: string;
  notes: string; // Personal notes for this specific product
}

export interface ContactDetails {
  name: string;
  email: string;
  phone?: string;
}

export interface EnquirySubmission {
  products: EnquiryProduct[];
  generalMessage: string;
  contactDetails: ContactDetails;
  timestamp: string;
}

export interface EnquiryCartContextValue {
  // Cart state
  items: EnquiryProduct[];
  isOpen: boolean;
  
  // Actions
  addProduct: (categorySlug: string, productSlug: string, name: string, image: string) => void;
  removeProduct: (categorySlug: string, productSlug: string) => void;
  updateProductNotes: (categorySlug: string, productSlug: string, notes: string) => void;
  clearCart: () => void;
  
  // Panel control
  openCart: () => void;
  closeCart: () => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Submission
  generalMessage: string;
  setGeneralMessage: (message: string) => void;
  contactDetails: ContactDetails;
  setContactDetails: (details: ContactDetails) => void;
  
  // Send enquiry
  sendEnquiry: () => Promise<{ success: boolean; error?: string }>;
  isSending: boolean;
}