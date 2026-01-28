
import React from 'react';

export const VibeTokenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.8} // Slightly thicker for a coin feel
    stroke="currentColor" 
    {...props}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-4-8h8M10 6.5A5.5 5.5 0 0112 5a5.5 5.5 0 012 1.5M10 17.5A5.5 5.5 0 0012 19a5.5 5.5 0 002-1.5" />
    <circle cx="12" cy="12" r="10" strokeOpacity="0.7" />
    {/* Optional subtle shine element for coin-like appearance */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9a3 3 0 00-3-3" strokeOpacity="0.5" />
  </svg>
);
