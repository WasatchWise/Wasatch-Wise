import React, { useState, useMemo } from 'react';
import { Request } from '../types';
import { LockIcon, UserIcon } from './icons';
import { CombinedListModal } from './CombinedListModal';

interface MyTasksProps {
  tasks: Request[];
  onComplete: (id: string) => void;
  onOpenGroceryHelper: (request: Request) => void;
}

interface TaskCardProps {
    task: Request;
    onComplete: (id: string) => void;
    onOpenGroceryHelper: (request: Request) => void;
}

type SortKey = 'city' | 'need' | 'default';
type SortDirection = 'asc' | 'desc';
interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

const sortStates: SortConfig[] = [
    { key: 'default', direction: 'asc' },
    { key: 'city', direction: 'asc' },
    { key: 'city', direction: 'desc' },
    { key: 'need', direction: 'asc' },
    { key: 'need', direction: 'desc' },
];

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onOpenGroceryHelper }) => (
    <div className="bg-surface-primary rounded-xl shadow-lg p-6 border-l-4 border-dignity-purple">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-2">
            <div>
                <h3 className="text-lg font-bold font-display text-secure-slate">{task.requester_display_name}</h3>
                <p className="text-sm text-gray-500">{task.city || task.location_description}</p>
            </div>
            {task.helper_display_name && (
                 <div className="flex-shrink-0 flex items-center text-xs sm:text-sm text-anonymous-indigo bg-surface-private px-3 py-1 rounded-full">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium font-mono">Claimed by: {task.helper_display_name}</span>
                </div>
            )}
        </div>
        <p className="text-gray-700 mb-4">{task.need || task.items?.map(i => i.name).join(', ')}</p>

        {/* Contact Information */}
        {task.contactInfo && (
          <div className="bg-sanctuary-green/10 rounded-lg p-4 border-l-4 border-sanctuary-green mb-4">
            <h4 className="font-bold text-sanctuary-green text-sm mb-2">📞 Contact Requester</h4>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">
                  {task.contactMethod === 'text' ? 'Phone:' : 'Email:'}
                </span>
                <span className="text-sm font-mono text-secure-slate">
                  {task.contactInfo}
                </span>
              </div>
              <div className="flex gap-2">
                {task.contactMethod === 'text' ? (
                  <a
                    href={`sms:${task.contactInfo}`}
                    className="px-4 py-2 bg-sanctuary-green text-white rounded-md text-sm font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    Send Text
                  </a>
                ) : (
                  <a
                    href={`mailto:${task.contactInfo}`}
                    className="px-4 py-2 bg-sanctuary-green text-white rounded-md text-sm font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    Send Email
                  </a>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Reach out to coordinate shopping, delivery, and payment details.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
            <button
                onClick={() => onOpenGroceryHelper(task)}
                className="flex-1 bg-white text-dignity-purple border border-dignity-purple font-semibold py-2 px-4 rounded-md hover:bg-surface-private focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dignity-purple transition-colors text-sm"
            >
                Organize List
            </button>
            <button
                onClick={() => onComplete(task.id)}
                className="flex-1 bg-dignity-purple text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dignity-purple transition-colors text-sm"
            >
                Mark as Delivered
            </button>
        </div>
    </div>
);

export const MyTasks: React.FC<MyTasksProps> = ({ tasks, onComplete, onOpenGroceryHelper }) => {
  const [sortStateIndex, setSortStateIndex] = useState(0);
  const [showCombinedList, setShowCombinedList] = useState(false);
  const sortConfig = sortStates[sortStateIndex];

  const sortedTasks = useMemo(() => {
    const sortableTasks = [...tasks];
    if (sortConfig.key !== 'default') {
      sortableTasks.sort((a, b) => {
        const valueA = a[sortConfig.key as 'city' | 'need'] || '';
        const valueB = b[sortConfig.key as 'city' | 'need'] || '';
        const comparison = valueA.localeCompare(valueB);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sortableTasks;
  }, [tasks, sortConfig]);

  const handleSortChange = () => {
    setSortStateIndex((prevIndex) => (prevIndex + 1) % sortStates.length);
  };

  const getSortDescription = () => {
    if (sortConfig.key === 'default') {
      return "Change sort order. Currently default.";
    }
    return `Change sort order. Currently sorted by ${sortConfig.key} in ${sortConfig.direction === 'asc' ? 'ascending' : 'descending'} order.`;
  };

  return (
    <div className="mt-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold font-display text-secure-slate">Your Claimed Requests</h2>
        {tasks.length > 0 && (
          <div className="flex items-center space-x-2 self-end sm:self-center">
            {tasks.length > 1 && (
              <button
                onClick={() => setShowCombinedList(true)}
                className="px-4 py-2 bg-sanctuary-green text-white font-semibold rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sanctuary-green transition-colors text-sm flex items-center gap-2"
              >
                🛒 Combined List
              </button>
            )}
            <button
                onClick={handleSortChange}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dignity-purple"
                aria-label={getSortDescription()}
                title={getSortDescription()}
            >
                {sortConfig.direction === 'asc' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 8a1 1 0 102 0V2.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 2.414V8z" />
                    </svg>
                )}
            </button>
          </div>
        )}
      </div>
      {tasks.length === 0 ? (
           <div className="text-center py-10 px-6 bg-surface-primary rounded-xl shadow-md border border-surface-tertiary">
              <h3 className="text-xl font-semibold font-display text-gray-700">You haven't claimed any requests yet.</h3>
              <p className="text-gray-500 mt-2">Claim a request from the "Open Requests" list to get started.</p>
          </div>
      ) : (
          <div className="space-y-6">
              {sortedTasks.map(task => (
                  <TaskCard key={task.id} task={task} onComplete={onComplete} onOpenGroceryHelper={onOpenGroceryHelper} />
              ))}
          </div>
      )}
      {showCombinedList && <CombinedListModal tasks={tasks} onClose={() => setShowCombinedList(false)} />}
    </div>
  );
};
