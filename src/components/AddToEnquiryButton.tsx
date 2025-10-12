import { useState } from 'react';
import { useEnquiryCart } from '../context/EnquiryCartProvider';

interface AddToEnquiryButtonProps {
  categorySlug: string;
  productSlug: string;
  productName: string;
  productImage: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSuccessMessage?: boolean;
}

const AddToEnquiryButton = ({
  categorySlug,
  productSlug,
  productName,
  productImage,
  variant = 'primary',
  size = 'md',
  className = '',
  showSuccessMessage = true,
}: AddToEnquiryButtonProps) => {
  const { items, addProduct, openCart } = useEnquiryCart();
  const [showAdded, setShowAdded] = useState(false);
  
  // Check if product is already in cart
  const isInCart = items.some(
    item => item.categorySlug === categorySlug && item.productSlug === productSlug
  );

  const handleAddToEnquiry = () => {
    if (isInCart) {
      // If already in cart, open the cart to show it
      openCart();
      return;
    }

    // Add product to cart
    addProduct(categorySlug, productSlug, productName, productImage);
    
    if (showSuccessMessage) {
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 2000);
    }
  };

  // Get button styles based on variant and size
  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };
    
    const variantStyles = {
      primary: "bg-brand-primary text-white hover:bg-brand-deep focus:ring-brand-chartreuse/30 shadow-sm hover:shadow-md",
      secondary: "bg-brand-chartreuse text-brand-deep hover:bg-brand-lime focus:ring-brand-primary/30 shadow-sm hover:shadow-md",
      outline: "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white focus:ring-brand-primary/30"
    };
    
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="relative">
      <button
        onClick={handleAddToEnquiry}
        className={getButtonStyles()}
        aria-label={isInCart ? `${productName} is in enquiry cart. Click to view cart.` : `Add ${productName} to enquiry cart`}
        title={isInCart ? 'Already in cart - click to view' : 'Add to enquiry cart'}
      >
        {isInCart ? (
          <>
            <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>In Cart</span>
          </>
        ) : (
          <>
            <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add for Enquiry</span>
          </>
        )}
      </button>

      {/* Success Toast */}
      {showAdded && showSuccessMessage && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                        bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium
                        shadow-lg animate-in slide-in-from-top-2 duration-200
                        whitespace-nowrap">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Added to enquiry!
          </div>
          {/* Arrow pointing up */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 
                          w-0 h-0 border-l-4 border-r-4 border-b-4 
                          border-l-transparent border-r-transparent border-b-green-600"></div>
        </div>
      )}
    </div>
  );
};

export default AddToEnquiryButton;