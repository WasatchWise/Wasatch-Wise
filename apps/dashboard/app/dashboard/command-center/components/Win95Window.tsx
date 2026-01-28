'use client';

import React from 'react';

// Since we haven't actually installed styled-components or react95 yet (wait, I did run npm install earlier but 
// setting up the ThemeProvider is a whole thing).
// For now, I will build a lightweight "Win95-ish" component using standard Tailwind classes to move fast.
// This avoids the complexity of setting up the styled-components registry in Next.js App Router for now.

interface Win95WindowProps {
    title: string;
    onClose?: () => void;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function Win95Window({ title, onClose, children, className = '', style }: Win95WindowProps) {
    return (
        <div
            className={`bg-[#c0c0c0] border-2 border-white border-b-black border-r-black p-[2px] shadow-xl ${className}`}
            style={style}
        >
            {/* Title Bar */}
            <div className="bg-[#000080] text-white px-1 py-[2px] flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-sm tracking-wide">{title}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center border border-white border-b-black border-r-black text-[10px] font-bold active:border-black active:border-b-white active:border-r-white active:translate-y-[1px]"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="text-black font-mono text-xs">
                {children}
            </div>
        </div>
    );
}

export function Win95Button({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
    return (
        <button
            onClick={onClick}
            className={`bg-[#c0c0c0] border-t-white border-l-white border-b-black border-r-black border-2 active:border-t-black active:border-l-black active:border-b-white active:border-r-white px-4 py-1 active:translate-y-[1px] font-mono text-xs ${className}`}
        >
            {children}
        </button>
    );
}

export function Win95Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`border-2 border-gray-600 border-b-white border-r-white bg-white p-2 ${className}`}>
            {children}
        </div>
    );
}
