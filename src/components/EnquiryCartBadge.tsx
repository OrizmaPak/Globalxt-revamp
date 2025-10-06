import { useEnquiryCart } from '../context/EnquiryCartProvider';

const EnquiryCartBadge = () => {
  const { items, openCart } = useEnquiryCart();
  const itemCount = items.length;

  if (itemCount === 0) {
    return null; // Hide badge when cart is empty
  }

  return (
    <button
      onClick={openCart}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 
                 bg-gradient-to-r from-brand-primary via-brand-lime to-brand-chartreuse 
                 hover:from-brand-deep hover:via-brand-primary hover:to-brand-lime
                 text-white rounded-full shadow-xl hover:shadow-2xl
                 transition-all duration-300 ease-out
                 focus:outline-none focus:ring-4 focus:ring-brand-chartreuse/40
                 group transform hover:-translate-y-1 hover:scale-105
                 md:right-6 md:w-16 md:h-16
                 w-14 h-14
                 flex items-center justify-center
                 border-4 border-white/20 backdrop-blur-sm"
      aria-label={`Enquiry cart with ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
      title={`View enquiry cart (${itemCount} item${itemCount !== 1 ? 's' : ''})`}
    >
      {/* Cart Icon */}
      <div className="relative">
        <svg 
          className="w-5 h-5 md:w-6 md:h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" 
          />
        </svg>
        
        {/* Count Badge */}
        <span 
          className="absolute -top-2 -right-2 
                     bg-brand-yellow text-brand-deep 
                     text-xs font-semibold
                     rounded-full min-w-[18px] h-[18px] 
                     flex items-center justify-center
                     border-2 border-white
                     md:min-w-[20px] md:h-[20px] md:text-sm"
          aria-hidden="true"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      </div>
      
      {/* Hover tooltip - hidden on mobile */}
      <span className="absolute right-full mr-3 px-3 py-2 
                       bg-gray-900 text-white text-sm rounded-lg
                       opacity-0 group-hover:opacity-100 
                       transition-opacity duration-200
                       pointer-events-none whitespace-nowrap
                       hidden md:block">
        View enquiry cart
      </span>
    </button>
  );
};

export default EnquiryCartBadge;