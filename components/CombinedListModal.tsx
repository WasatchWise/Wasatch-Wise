import React from 'react';
import { Request } from '../types';

interface CombinedListModalProps {
  tasks: Request[];
  onClose: () => void;
}

export const CombinedListModal: React.FC<CombinedListModalProps> = ({ tasks, onClose }) => {
  // Parse needs into structured items
  const parseItems = (need: string, requesterName: string) => {
    // Split by common separators: commas, newlines, bullets, numbers
    const items = need
      .split(/[,\n•\-\d\.]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    return items.map(item => ({
      text: item,
      requester: requesterName
    }));
  };

  // Combine all items from all tasks
  const allItems = tasks.flatMap(task =>
    parseItems(task.need, task.requester_display_name)
  );

  // Group by requester
  const itemsByRequester = tasks.map(task => ({
    requester: task.requester_display_name,
    items: parseItems(task.need, task.requester_display_name).map(i => i.text),
    city: task.city || task.location_description,
    contactInfo: task.contactInfo,
    contactMethod: task.contactMethod
  }));

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let text = '🛒 COMBINED SHOPPING LIST\n\n';

    itemsByRequester.forEach((group, idx) => {
      text += `${idx + 1}. ${group.requester} (${group.city})\n`;
      group.items.forEach(item => {
        text += `   • ${item}\n`;
      });
      text += `   📞 ${group.contactMethod === 'text' ? 'Text' : 'Email'}: ${group.contactInfo}\n\n`;
    });

    navigator.clipboard.writeText(text);
    alert('List copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print:shadow-none print:max-h-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 print:static">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold font-display text-secure-slate">Combined Shopping List</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold print:hidden"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600">
            All items from your {tasks.length} claimed request{tasks.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-sanctuary-green/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-sanctuary-green">{tasks.length}</div>
              <div className="text-xs text-gray-600">Deliveries</div>
            </div>
            <div className="bg-trust-teal/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-trust-teal">{allItems.length}</div>
              <div className="text-xs text-gray-600">Total Items</div>
            </div>
            <div className="bg-dignity-purple/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-dignity-purple">
                {new Set(itemsByRequester.map(g => g.city)).size}
              </div>
              <div className="text-xs text-gray-600">Location{new Set(itemsByRequester.map(g => g.city)).size > 1 ? 's' : ''}</div>
            </div>
          </div>

          {/* Grouped by Requester */}
          <div className="space-y-6">
            {itemsByRequester.map((group, idx) => (
              <div key={idx} className="bg-surface-secondary rounded-lg p-5 border-l-4 border-sanctuary-green">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-secure-slate">{idx + 1}. {group.requester}</h3>
                    <p className="text-sm text-gray-600">📍 {group.city}</p>
                  </div>
                  <div className="text-xs bg-white px-3 py-1 rounded-full border border-surface-tertiary">
                    {group.items.length} item{group.items.length > 1 ? 's' : ''}
                  </div>
                </div>

                <ul className="space-y-2 mb-3">
                  {group.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start">
                      <span className="text-sanctuary-green mr-2">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-xs text-gray-600 bg-white px-3 py-2 rounded border border-surface-tertiary">
                  <span className="font-semibold">Contact:</span> {group.contactMethod === 'text' ? '📱' : '📧'} {group.contactInfo}
                </div>
              </div>
            ))}
          </div>

          {/* All Items (ungrouped for quick reference) */}
          <div className="mt-6 p-5 bg-dignity-purple/5 rounded-lg border border-dignity-purple/20">
            <h3 className="font-bold text-dignity-purple mb-3">Quick Reference - All Items</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
              {allItems.map((item, idx) => (
                <div key={idx} className="flex items-start">
                  <span className="text-dignity-purple mr-2">✓</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 print:hidden">
            <button
              onClick={handleCopyText}
              className="flex-1 bg-white text-sanctuary-green border border-sanctuary-green font-semibold py-3 px-4 rounded-lg hover:bg-sanctuary-green/5 transition-colors"
            >
              📋 Copy List
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 bg-sanctuary-green text-white font-semibold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              🖨️ Print
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4 print:hidden">
            Tip: Use the print button to save as PDF for offline access
          </p>
        </div>
      </div>
    </div>
  );
};
