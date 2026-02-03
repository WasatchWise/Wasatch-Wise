'use client';

export function OpenWhoModalButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('abya-open-who-modal'))}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-colors"
    >
      Who are you?
    </button>
  );
}
