
import React from 'react';

// Fix: Define and export ClipboardDocumentCheckIcon once using the correct Heroicon SVG.
// This is the version provided by the user in their problem description.
export const ClipboardDocumentCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25c.88-.024 1.73-.024 2.598 0M10.125 2.25a3.375 3.375 0 013.375-3.375h1.5a3.375 3.375 0 013.375 3.375m0 0L10.5 5.25M10.125 2.25L12 5.25m0 0l1.875-3M12 5.25h5.25m-5.25 0h-1.5m1.5 0V1.5m0 3.75c0 .225-.012.447-.035.668M16.875 19.5l1.563-1.562a1.875 1.875 0 000-2.652L15 12.375l-1.563 1.562a1.875 1.875 0 000 2.652L16.875 19.5zm-4.5-4.5L10.5 12.375a1.875 1.875 0 00-2.652 0L4.5 15.75l1.563 1.562a1.875 1.875 0 002.652 0L12.375 15z" />
 </svg>
);
