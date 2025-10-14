import { useEffect, useRef, useState } from 'react';
import { useEnquiryCart } from '../context/EnquiryCartProvider';

const EnquiryCartBadge = () => {
  const { items, openCart } = useEnquiryCart();
  const itemCount = items.length;

  // Animate the badge when the count changes
  const prevCount = useRef(itemCount);
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (itemCount !== prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prevCount.current = itemCount;
      return () => clearTimeout(t);
    }
  }, [itemCount]);

  if (itemCount === 0) return null;

  const label = `Enquiry cart with ${itemCount} item${itemCount !== 1 ? 's' : ''}`;

  return (
    <button
      onClick={openCart}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 group md:right-6 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-chartreuse/40 rounded-full"
      aria-label={label}
      title={`View enquiry cart (${itemCount} item${itemCount !== 1 ? 's' : ''})`}
    >
      {/* Outer glow + gradient ring */}
      <span
        className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-primary/40 via-brand-lime/30 to-brand-chartreuse/40 blur-xl opacity-60 group-hover:opacity-90 transition-opacity"
        aria-hidden
      />

      {/* Ripple on change */}
      {bump && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand-primary/40 animate-ping"
          aria-hidden
        />
      )}

      {/* Button core (glassy) */}
      <span
        className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border border-white/30 bg-white/80 text-brand-primary shadow-[0_10px_35px_-10px_rgba(10,45,18,0.45)] backdrop-blur-xl transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-[1.04]"
      >
        {/* Inner highlight */}
        <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/70 to-transparent" aria-hidden />

        {/* Cart Icon */}
        <svg
          className="h-6 w-6 md:h-7 md:w-7 drop-shadow-sm"
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
          className={
            "absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-brand-deep shadow-sm ring-0 transition-transform md:h-[22px] md:min-w-[22px] md:text-xs "
            + " bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-400 "
            + (bump ? ' scale-110' : '')
          }
          aria-hidden
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      </span>

      {/* Hover tooltip - desktop only */}
      <span
        className="absolute right-full mr-3 hidden whitespace-nowrap rounded-lg border border-white/10 bg-white/90 px-3 py-1.5 text-xs font-medium text-brand-deep shadow-lg backdrop-blur-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block"
      >
        View enquiry cart
      </span>
    </button>
  );
};

export default EnquiryCartBadge;
