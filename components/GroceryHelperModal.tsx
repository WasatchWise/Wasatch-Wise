import React, { useState, useEffect } from 'react';
import { organizeGroceryList } from '../services/geminiService';
import { Request, AvailableRequest, RequestItem } from '../types';
import { SparklesIcon } from './icons';

interface GroceryHelperModalProps {
  request: Request | AvailableRequest | null;
  onClose: () => void;
}

const formatItemsToString = (items: RequestItem[] | string | undefined): string => {
    if (typeof items === 'string') return items;
    if (Array.isArray(items)) {
        return items.map(item => `${item.quantity} ${item.name}${item.notes ? ` (${item.notes})` : ''}`).join('\n');
    }
    return '';
}

export const GroceryHelperModal: React.FC<GroceryHelperModalProps> = ({ request, onClose }) => {
  const [rawList, setRawList] = useState('');
  const [store, setStore] = useState('');
  const [organizedList, setOrganizedList] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (request) {
      const need = 'items' in request ? formatItemsToString(request.items) : request.need;
      setRawList(need || '');
    }
  }, [request]);

  if (!request) return null;

  const handleOrganize = async () => {
    if (!rawList || !store) {
      setError('Please provide both a grocery list and a store name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOrganizedList('');
    try {
      const result = await organizeGroceryList(rawList, store);
      setOrganizedList(result);
    } catch (err) {
      setError('Could not organize the list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(organizedList)
        .then(() => alert('List copied to clipboard!'))
        .catch(err => console.error('Failed to copy text: ', err));
  };

  const displayName = 'requester_display_name' in request ? request.requester_display_name : (request as any).displayName;

  return (
    <div className="fixed inset-0 bg-secure-slate bg-opacity-50 overflow-y-auto h-full w-full z-20 flex items-center justify-center p-4">
      <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-2xl rounded-xl bg-surface-primary">
        <div className="mt-3">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl leading-6 font-bold font-display text-dignity-purple flex items-center">
                <SparklesIcon className="w-6 h-6 text-dignity-purple mr-2" />
                Smart Grocery List Organizer
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
          </div>
          <p className="text-sm text-gray-500 mt-2">For <span className="font-semibold">{displayName}</span>'s request. Paste their grocery list below to have AI organize it for your shopping trip.</p>
          
          <div className="mt-4 space-y-4">
            <textarea
              value={rawList}
              onChange={(e) => setRawList(e.target.value)}
              placeholder="Paste the raw grocery list here, e.g., milk, bread, apples, chicken breast, paper towels..."
              className="w-full h-32 p-2 border border-surface-tertiary rounded-md focus:ring-dignity-purple focus:border-dignity-purple"
            />
            <input
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Enter store name (e.g., King Soopers, Safeway)"
              className="w-full p-2 border border-surface-tertiary rounded-md focus:ring-dignity-purple focus:border-dignity-purple"
            />
          </div>

          <div className="items-center px-4 py-3 mt-4">
            <button
              onClick={handleOrganize}
              disabled={isLoading}
              className="px-4 py-2 bg-dignity-purple text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-dignity-purple disabled:bg-gray-400"
            >
              {isLoading ? 'Organizing...' : 'Organize List'}
            </button>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
          
          {organizedList && (
            <div className="mt-4 p-4 bg-surface-secondary rounded-md border border-surface-tertiary">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-secure-slate">Your Organized List:</h4>
                <button onClick={handleCopyToClipboard} className="text-sm text-dignity-purple hover:underline font-semibold">Copy</button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-white p-3 rounded-md">{organizedList}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
