import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useEnquiryCart } from '../context/EnquiryCartProvider';
import fallbackPlaceholder from '../assets/images/placeholder.jpg';
import { getApiUrl, getDefaultHeaders, API_CONFIG } from '../config/api';
import { chatService } from '../services/chatService';

const EnquiryCartPanel = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeProduct,
    updateProductNotes,
    searchQuery,
    setSearchQuery,
    generalMessage,
    setGeneralMessage,
    contactDetails,
    setContactDetails,
    clearCart,
  } = useEnquiryCart();

  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.categorySlug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.productSlug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Focus trap and close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
        return;
      }
      
      // Basic focus trapping
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'button, input, textarea, select, a[href]'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus search input when panel opens
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeCart]);

  const handleSendEnquiry = async () => {
    setErrorMessage('');
    setShowSuccess(false);
    setIsSending(true);

    try {
      // 1) Create or update chat room with enquiry first
      let chatRoomId = null;
      try {
        const chatRoom = await chatService.createOrGetChatRoom(
          contactDetails.email,
          contactDetails.name
        );
        
        // Add enquiry message to chat room
        await chatService.addEnquiryMessage(
          chatRoom.id,
          {
            products: items,
            generalMessage,
            contactDetails
          },
          {
            name: contactDetails.name,
            email: contactDetails.email
          }
        );
        
        chatRoomId = chatRoom.id;
        console.log('Chat room created/updated successfully:', chatRoom.id);
      } catch (chatError) {
        console.error('Error creating chat room:', chatError);
        // Continue without chat room if it fails
      }

      // Build shared strings
      const prettyCategory = (slug: string) => slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const productsHtml = items.map((item, index) => (
        `<div style="margin-bottom:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#ffffff">
           <div style="font-weight:600;color:#065f46;margin-bottom:4px">${index + 1}. ${item.name}</div>
           <div style="font-size:14px;color:#374151">Category: ${prettyCategory(item.categorySlug)}</div>
           ${item.notes ? `<div style=\"font-size:14px;color:#6b7280;margin-top:6px\"><em>Notes:</em> ${item.notes}</div>` : ''}
         </div>`
      )).join('');

      // Create chat link sections
      const adminChatLinkSection = chatRoomId 
        ? `<div style="margin-top:20px;text-align:center">
             <a href="${window.location.origin}/admin/chat" 
                style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;margin:8px">
               💬 Open Admin Chat Dashboard
             </a>
             <p style="color:#6b7280;font-size:12px;margin-top:8px">
               Click above to respond to ${contactDetails.name} in the chat dashboard.
             </p>
           </div>`
        : '';
      
      const customerChatLinkSection = chatRoomId 
        ? `<div style="margin-top:20px;text-align:center">
             <a href="${window.location.origin}/chat/${chatRoomId}" 
                style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;margin:8px">
               💬 Continue Conversation in Chat
             </a>
             <p style="color:#6b7280;font-size:12px;margin-top:8px">
               Click above to access your personal chat room where you can communicate directly with our team.
             </p>
           </div>`
        : '';

      // 2) Send business notification email
      const businessSubject = `New Product Enquiry – ${contactDetails.name} (${items.length} item${items.length !== 1 ? 's' : ''})`;
      const businessMessage = `
        <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:24px">
          <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
            <div style="background:#0ea5e9;color:#fff;padding:18px 20px;font-weight:700;font-size:18px">New Enquiry</div>
            <div style="padding:20px">
              <div style="margin-bottom:16px">
                <div style="font-weight:600;color:#1f2937;margin-bottom:6px">Customer</div>
                <div style="color:#374151;font-size:14px">Name: ${contactDetails.name}</div>
                <div style="color:#374151;font-size:14px">Email: ${contactDetails.email}</div>
                <div style="color:#374151;font-size:14px">Phone: ${contactDetails.phone || 'Not provided'}</div>
              </div>
              <div style="margin-bottom:16px">
                <div style="font-weight:600;color:#1f2937;margin-bottom:6px">Products (${items.length})</div>
                ${productsHtml || '<div style="color:#6b7280;font-style:italic">No products listed</div>'}
              </div>
              ${generalMessage ? `<div style="margin-top:12px"><div style=\"font-weight:600;color:#1f2937;margin-bottom:6px\">Customer Message</div><div style=\"background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;color:#92400e\">${generalMessage.replace(/\n/g, '<br/>')}</div></div>` : ''}
              ${adminChatLinkSection}
              <div style="margin-top:20px;color:#6b7280;font-size:12px">Reply to this message to contact the customer directly.</div>
            </div>
          </div>
        </div>`;

      const controller1 = new AbortController();
      const timeout1 = setTimeout(() => controller1.abort(), API_CONFIG.TIMEOUT);
      const businessResp = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SEND_EMAIL), {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          to: API_CONFIG.RECIPIENT_EMAIL,
          subject: businessSubject,
          message: businessMessage,
          replyTo: contactDetails.email,
        }),
        signal: controller1.signal,
      });
      clearTimeout(timeout1);

      if (!businessResp.ok) {
        const errText = await businessResp.text();
        throw new Error(`Business email failed: ${errText}`);
      }

      // 3) Send customer confirmation email
      const customerSubject = `Thank you for your enquiry, ${contactDetails.name}! - Global XT`;
      const customerMessage = `
        <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:24px">
          <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
            <div style="background:#10b981;color:#fff;padding:18px 20px;font-weight:700;font-size:18px">We received your enquiry</div>
            <div style="padding:20px">
              <p style="color:#374151">Hi ${contactDetails.name},</p>
              <p style="margin-top:8px;color:#374151">Thanks for reaching out to Global XT. Our team will review your request and get back to you within 24 hours.</p>
              <div style="margin-top:16px">
                <div style="font-weight:600;color:#1f2937;margin-bottom:6px">Summary</div>
                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:12px">
                  <div style="color:#374151;font-size:14px">Items: ${items.length}</div>
                  ${generalMessage ? `<div style=\"color:#374151;font-size:14px;margin-top:6px\">Your message: ${generalMessage.replace(/\n/g, '<br/>')}</div>` : ''}
                </div>
              </div>
              <div style="margin-top:16px">
                <div style="font-weight:600;color:#1f2937;margin-bottom:6px">Products</div>
                ${productsHtml || '<div style="color:#6b7280;font-style:italic">No products listed</div>'}
              </div>
              ${customerChatLinkSection}
              <p style="margin-top:16px;color:#6b7280;font-size:12px">If you didn\'t request this, please ignore this email.</p>
            </div>
          </div>
        </div>`;

      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), API_CONFIG.TIMEOUT);
      const customerResp = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SEND_EMAIL), {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          to: contactDetails.email,
          subject: customerSubject,
          message: customerMessage,
          replyTo: API_CONFIG.RECIPIENT_EMAIL,
        }),
        signal: controller2.signal,
      });
      clearTimeout(timeout2);

      if (!customerResp.ok) {
        const errText = await customerResp.text();
        throw new Error(`Customer email failed: ${errText}`);
      }

      // Success UI
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.error('Error sending enquiry:', error);
      handleMailtoFallback();
    } finally {
      setIsSending(false);
    }
  };

  const handleMailtoFallback = () => {
    try {
      const subject = `🌾 Product Enquiry from ${contactDetails.name} - Global XT`;
      const body = `
Hi Global XT Team,

I'm interested in the following products:

📋 CUSTOMER DETAILS:
• Name: ${contactDetails.name}
• Email: ${contactDetails.email}
• Phone: ${contactDetails.phone || 'Not provided'}
• Date: ${new Date().toLocaleDateString()}

🛒 SELECTED PRODUCTS (${items.length}):
${items.map((item, index) => 
  `${index + 1}. ${item.name}
   Category: ${item.categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
   ${item.notes ? `Notes: ${item.notes}` : 'No specific notes'}
`
).join('\n')}

💬 ADDITIONAL MESSAGE:
${generalMessage || 'No additional message provided.'}

---
Please get back to me with pricing, availability, and delivery information.

Best regards,
${contactDetails.name}
${contactDetails.email}
${contactDetails.phone || ''}
      `;
      
      const mailtoLink = `mailto:${API_CONFIG.RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      // Show success message
      setTimeout(() => {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      }, 500);
      
    } catch (error) {
      console.error('Error creating email:', error);
      setErrorMessage(`Failed to create email. Please contact us directly at ${API_CONFIG.RECIPIENT_EMAIL}`);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear all items from your enquiry cart?')) {
      clearCart();
      setShowSuccess(false);
      setErrorMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Enhanced with blur */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-sm z-50 
                   transition-all duration-500 ease-out"
        onClick={closeCart}
        aria-hidden="true"
      />
      
      {/* Panel - Completely scrollable design */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl z-50
                   transform transition-all duration-500 ease-out
                   md:max-w-lg xl:max-w-xl
                   border-l border-white/20
                   before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none
                   overflow-y-auto scrollbar-thin scrollbar-thumb-brand-primary/30 scrollbar-track-gray-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-cart-title"
      >
        {/* Header - Sticky header with stunning animation */}
        <div className="sticky top-0 z-20 relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-lime via-brand-chartreuse to-brand-yellow 
                          animate-gradient-x bg-[length:400%_400%]" />
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-8 w-2 h-2 bg-white/30 rounded-full animate-float" style={{animationDelay: '0s'}} />
            <div className="absolute top-12 right-16 w-1 h-1 bg-white/40 rounded-full animate-float" style={{animationDelay: '1s'}} />
            <div className="absolute bottom-8 left-16 w-1.5 h-1.5 bg-white/25 rounded-full animate-float" style={{animationDelay: '2s'}} />
            <div className="absolute top-6 right-8 w-1 h-1 bg-white/35 rounded-full animate-float" style={{animationDelay: '1.5s'}} />
          </div>
          
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-between p-6 md:p-8">
            <div className="flex items-center gap-4">
              {/* Animated cart icon */}
              <div className="relative flex-shrink-0">
                <div className="p-3 md:p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 shadow-2xl
                               transform hover:scale-105 transition-all duration-300">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {/* Pulsing indicator */}
                  {items.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-brand-yellow rounded-full border-2 border-white
                                   flex items-center justify-center animate-bounce">
                      <span className="text-xs font-bold text-brand-deep">{items.length}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Title section */}
              <div className="space-y-1 min-w-0">
                <h2 id="enquiry-cart-title" className="text-lg md:text-2xl font-bold text-white drop-shadow-lg">
                  Enquiry Cart
                </h2>
                {items.length > 0 ? (
                  <p className="text-white/90 font-medium text-sm md:text-base">
                    {items.length} premium product{items.length !== 1 ? 's' : ''} selected
                  </p>
                ) : (
                  <p className="text-white/80 text-xs md:text-sm">
                    Build your custom enquiry
                  </p>
                )}
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={closeCart}
              className="group p-2 md:p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 
                         hover:bg-white/30 transition-all duration-300 transform hover:scale-105
                         focus:outline-none focus:ring-4 focus:ring-white/30 text-white shadow-2xl flex-shrink-0"
              aria-label="Close enquiry cart"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content - Natural flow */}
        {items.length === 0 ? (
          /* Empty State - Spectacular empty state */
          <div className="min-h-[70vh] flex items-center justify-center p-8 md:p-12 relative overflow-hidden bg-gradient-to-b from-white/50 to-gray-50/30 backdrop-blur-sm">
              {/* Background decoration */}
              <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-brand-lime/10 to-brand-chartreuse/10 rounded-full blur-2xl" />
                <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-brand-primary/10 to-brand-yellow/10 rounded-full blur-xl" />
              </div>
              
              <div className="text-center max-w-md relative z-10">
                {/* Stunning icon container */}
                <div className="relative mx-auto mb-8 w-32 h-32">
                  {/* Rotating ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-brand-primary/30 via-brand-lime/30 to-brand-chartreuse/30 animate-spin-slow" />
                  
                  {/* Main icon container */}
                  <div className="absolute inset-4 bg-gradient-to-br from-white via-gray-50 to-white rounded-full shadow-2xl 
                                flex items-center justify-center border border-gray-200/50 backdrop-blur-xl">
                    <svg className="w-12 h-12 text-brand-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-yellow rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-brand-chartreuse rounded-full animate-bounce" style={{animationDelay: '1s'}} />
                </div>
                
                {/* Content */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-brand-primary via-brand-lime to-brand-chartreuse 
                                 bg-clip-text text-transparent leading-tight">
                      Your Enquiry Journey Starts Here
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Discover premium agro commodities tailored to your business needs. 
                      Add products and let our experts craft the perfect solution for you.
                    </p>
                  </div>
                  
                  {/* CTA Buttons */}
                  <div className="space-y-4">
                    <Link
                      to="/products"
                      onClick={closeCart}
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-primary via-brand-lime to-brand-chartreuse 
                                 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl 
                                 transform hover:-translate-y-1 transition-all duration-300
                                 hover:scale-105 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Explore Products</span>
                    </Link>
                    
                    <p className="text-sm text-gray-500">
                      Or browse by category: 
                      <Link to="/products" onClick={closeCart} className="text-brand-primary hover:underline font-medium">Spices</Link>, 
                      <Link to="/products" onClick={closeCart} className="text-brand-primary hover:underline font-medium">Grains</Link>, 
                      <Link to="/products" onClick={closeCart} className="text-brand-primary hover:underline font-medium">Nuts</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
        ) : (
          <div className="bg-gradient-to-b from-white/50 to-gray-50/30 backdrop-blur-sm">
            {/* Search Box - Glassmorphism search */}
            <div className="relative p-4 md:p-6 bg-gradient-to-r from-white/80 via-white/60 to-white/80 backdrop-blur-xl border-b border-white/20">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-lime/5 via-transparent to-brand-chartreuse/5" />
              
              <div className="relative">
                {/* Search label */}
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Your Products
                </label>
                
                {/* Search input */}
                <div className="relative group">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Type to filter your selected products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 md:py-4 bg-white/90 backdrop-blur-md border-2 border-white/50 rounded-2xl shadow-lg
                               focus:outline-none focus:ring-4 focus:ring-brand-primary/30 focus:border-brand-primary/50
                               transition-all duration-300 placeholder-gray-400 text-gray-900 font-medium
                               hover:bg-white hover:shadow-xl group-hover:border-brand-primary/30 text-sm md:text-base"
                  />
                  
                  {/* Search icon */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-brand-primary group-focus-within:scale-110 transition-transform duration-200" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Clear button */}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-gray-100 hover:bg-red-100 
                                 text-gray-400 hover:text-red-500 transition-all duration-200 group"
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4 group-hover:rotate-90 transition-transform duration-200" 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Search results count */}
                {searchQuery && (
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                    {filteredItems.length} of {items.length} products match your search
                  </p>
                )}
              </div>
            </div>

            {/* Products List - Natural scrolling */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {filteredItems.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-500 text-center">
                    {searchQuery ? 'No products match your search.' : 'Your enquiry list is empty.'}
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div key={`${item.categorySlug}-${item.productSlug}`} 
                       className="bg-gradient-to-r from-white to-gray-50/50 rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
                    {/* Product Info */}
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover bg-gray-200 shadow-sm border border-gray-100"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = fallbackPlaceholder as unknown as string;
                          }}
                        />
                        <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                          ✓
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-base md:text-lg mb-1 group-hover:text-brand-primary transition-colors line-clamp-2">
                          {item.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-lime/20 text-brand-deep">
                            {item.categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <Link
                            to={`/products/${item.categorySlug}/${item.productSlug}`}
                            onClick={closeCart}
                            className="text-xs font-medium text-brand-primary hover:text-brand-deep transition-colors underline"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                      <button
                        onClick={() => removeProduct(item.categorySlug, item.productSlug)}
                        className="p-1.5 md:p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-200
                                   focus:outline-none focus:ring-2 focus:ring-red-300 group flex-shrink-0"
                        aria-label={`Remove ${item.name} from enquiry`}
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Notes - Improved textarea */}
                    <div className="mt-3 md:mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product-specific notes
                      </label>
                      <textarea
                        placeholder="e.g., Need 50kg bags, premium grade, delivery to Lagos..."
                        value={item.notes}
                        onChange={(e) => updateProductNotes(item.categorySlug, item.productSlug, e.target.value)}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl text-sm bg-white
                                   focus:outline-none focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary
                                   transition-all duration-200 placeholder-gray-500 resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* General Message - Enhanced design */}
            <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50/50 to-white p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <label htmlFor="general-message" className="text-sm md:text-base font-semibold text-gray-800">
                  General Message
                </label>
                <span className="text-xs md:text-sm text-gray-500">(Optional)</span>
              </div>
              <textarea
                id="general-message"
                placeholder="Share any overall requirements, preferred delivery timeline, budget considerations, or questions about your enquiry..."
                value={generalMessage}
                onChange={(e) => setGeneralMessage(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm
                           focus:outline-none focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary
                           transition-all duration-200 placeholder-gray-500 resize-none text-sm md:text-base"
                rows={4}
              />
            </div>

            {/* Contact Details - Beautiful contact form */}
            <div className="border-t border-gray-200 bg-gradient-to-br from-white to-brand-lime/5 p-4 md:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-5">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-sm md:text-base font-semibold text-gray-800">Contact Details</h3>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Required</span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="Your full name"
                      value={contactDetails.name}
                      onChange={(e) => setContactDetails({ ...contactDetails, name: e.target.value })}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm
                                 focus:outline-none focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary
                                 transition-all duration-200 placeholder-gray-500 text-sm md:text-base"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="e.g., +234 801 234 5678"
                      value={contactDetails.phone || ''}
                      onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm
                                 focus:outline-none focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary
                                 transition-all duration-200 placeholder-gray-500 text-sm md:text-base"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="your.email@company.com"
                    value={contactDetails.email}
                    onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm
                               focus:outline-none focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary
                               transition-all duration-200 placeholder-gray-500 text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Actions - Beautiful action section */}
            <div className="border-t border-gray-200 bg-gradient-to-r from-white to-gray-50/30 p-4 md:p-6">
                {/* Success Message - Enhanced */}
                {showSuccess && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-green-900 font-semibold text-sm">Enquiry Sent Successfully!</h4>
                        <p className="text-green-700 text-xs mt-1">
                          We've received your enquiry and sent a confirmation to your email. Our team will respond within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message - Enhanced */}
                {errorMessage && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-red-900 font-semibold text-sm">Unable to Send Enquiry</h4>
                        <p className="text-red-700 text-xs mt-1">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons - Beautiful gradient buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSendEnquiry}
                    disabled={isSending || items.length === 0 || !contactDetails.name || !contactDetails.email}
                    className="w-full px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-brand-primary via-brand-lime to-brand-chartreuse 
                               text-white rounded-2xl font-semibold text-sm md:text-base shadow-lg hover:shadow-xl
                               hover:from-brand-deep hover:via-brand-primary hover:to-brand-lime
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
                               focus:outline-none focus:ring-4 focus:ring-brand-primary/30
                               transition-all duration-200 transform hover:-translate-y-0.5 disabled:hover:transform-none
                               relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-noise-light opacity-10" />
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {isSending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending Enquiry...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Send Enquiry</span>
                        </>
                      )}
                    </div>
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleClearCart}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium
                                 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                                 focus:outline-none focus:ring-4 focus:ring-gray-200"
                    >
                      Clear All
                    </button>
                    
                    <Link
                      to="/products"
                      onClick={closeCart}
                      className="flex-1 px-4 py-3 border-2 border-brand-primary text-brand-primary rounded-xl font-medium text-center
                                 hover:bg-brand-primary hover:text-white transition-all duration-200
                                 focus:outline-none focus:ring-4 focus:ring-brand-primary/30"
                    >
                      Add More
                    </Link>
                  </div>
                </div>

                {/* Footer text - Enhanced */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Your information is secure and will only be used to respond to this enquiry</span>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
    </>
  );
};

export default EnquiryCartPanel;
