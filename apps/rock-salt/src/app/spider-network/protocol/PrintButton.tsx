'use client'

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
        >
            <span>🖨️</span>
            <span>Print Protocol</span>
        </button>
    )
}
