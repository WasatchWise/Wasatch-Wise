import React, { useState, useEffect } from 'react';
import { Request } from '../types';
import { HelpListAPI } from '../services/supabaseService';

export const MyRequests: React.FC = () => {
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const myRequestIds = JSON.parse(localStorage.getItem('helplist::my_request_ids') || '[]');

        if (myRequestIds.length === 0) {
          setMyRequests([]);
          setIsLoading(false);
          return;
        }

        // Fetch all requests and filter to mine
        const res = await HelpListAPI.getAvailableRequests();
        const allTasksRes = await HelpListAPI.getMyTasks('00000000-0000-0000-0000-000000000001'); // Get all tasks to see claimed ones

        // Combine and filter
        const allRequests = [
          ...(res.data || []),
          ...(allTasksRes.data || [])
        ];

        const mine = allRequests.filter(req => myRequestIds.includes(req.id));
        setMyRequests(mine as Request[]);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch my requests:', error);
        setIsLoading(false);
      }
    };

    fetchMyRequests();
  }, []);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Looking for helper...', color: 'bg-caution-amber/10 text-caution-amber border-caution-amber' };
      case 'claimed':
        return { text: 'Claimed! Helper will contact you', color: 'bg-trust-teal/10 text-trust-teal border-trust-teal' };
      case 'shopping':
        return { text: 'Helper is shopping', color: 'bg-shield-blue/10 text-shield-blue border-shield-blue' };
      case 'delivering':
        return { text: 'Out for delivery', color: 'bg-dignity-purple/10 text-dignity-purple border-dignity-purple' };
      case 'delivered':
        return { text: 'Delivered!', color: 'bg-sanctuary-green/10 text-sanctuary-green border-sanctuary-green' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };

  const getTimeAgo = (createdAt: Date) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg font-semibold text-dignity-purple">Loading your requests...</p>
      </div>
    );
  }

  if (myRequests.length === 0) {
    return (
      <div className="bg-surface-primary p-8 rounded-xl shadow-xl border border-surface-tertiary">
        <h2 className="text-2xl font-bold font-display text-secure-slate mb-4">My Requests</h2>
        <div className="text-center py-10">
          <p className="text-gray-600">You haven't submitted any requests yet.</p>
          <p className="text-sm text-gray-500 mt-2">Use the "Make a Request" tab to submit your first request.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary p-8 rounded-xl shadow-xl border border-surface-tertiary">
      <h2 className="text-2xl font-bold font-display text-secure-slate mb-6">My Requests</h2>

      <div className="space-y-4">
        {myRequests.map((request) => {
          const statusDisplay = getStatusDisplay(request.status);

          return (
            <div key={request.id} className="border border-surface-tertiary rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-secure-slate">{request.need}</h3>
                  <p className="text-sm text-gray-500">{request.city}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusDisplay.color}`}>
                  {statusDisplay.text}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Posted {getTimeAgo(request.created_at)}</span>
                {request.helper_display_name && (
                  <span className="text-dignity-purple font-medium">
                    Helper: {request.helper_display_name}
                  </span>
                )}
              </div>

              {request.status === 'active' && (
                <p className="mt-3 text-xs text-gray-600 bg-caution-amber/5 p-2 rounded">
                  💡 Your request is visible to helpers. You'll be contacted when someone claims it.
                </p>
              )}

              {request.status === 'claimed' && !request.shopping_started_at && (
                <p className="mt-3 text-xs text-gray-600 bg-trust-teal/5 p-2 rounded">
                  ✓ A helper has claimed your request! They should contact you soon to coordinate.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
