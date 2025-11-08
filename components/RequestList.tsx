import React, { useState, useMemo } from 'react';
import { AvailableRequest } from '../types';
import { MapPinIcon, ShareIcon, ShoppingBagIcon, UserIcon } from './icons';

interface RequestListProps {
  requests: AvailableRequest[];
  claimRequest: (id: string) => void;
  onOpenGroceryHelper: (request: AvailableRequest) => void;
  onShare: (request: AvailableRequest) => void;
}

interface RequestCardProps {
    request: AvailableRequest;
    onClaim: (id: string) => void;
    onOpenGroceryHelper: (request: AvailableRequest) => void;
    onShare: (request: AvailableRequest) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onClaim, onOpenGroceryHelper, onShare }) => {
    const canShare = typeof navigator.share === 'function';

    const urgencyBadge = () => {
      switch (request.urgency_level) {
        case 'today':
          return <span className="px-2 py-1 text-xs font-semibold bg-kindness-coral text-white rounded-full">Today</span>;
        case 'tomorrow':
          return <span className="px-2 py-1 text-xs font-semibold bg-amber-500 text-white rounded-full">Tomorrow</span>;
        default:
          return null;
      }
    };

    const getDistanceDisplay = () => {
      if (!request.distance_meters) return null;
      const miles = (request.distance_meters / 1609.34).toFixed(1);
      return parseFloat(miles) < 10 ? `${miles} mi` : null;
    };

    return (
        <div className="bg-surface-primary rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-surface-tertiary animate-fade-in">
            <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-tertiary">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-dignity-purple/20 flex items-center justify-center mr-3">
                        <UserIcon className="w-5 h-5 text-dignity-purple" />
                      </div>
                      <h3 className="text-lg font-bold font-display text-secure-slate">{request.requester_display_name}</h3>
                    </div>
                    {urgencyBadge()}
                </div>
                <div className="space-y-3 text-gray-700">
                    <div className="flex items-start">
                        <ShoppingBagIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-1 text-gray-400" />
                        <p>{request.need}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPinIcon className="w-5 h-5 mr-3 flex-shrink-0 text-gray-400" />
                          <p>{request.city || request.location_description}</p>
                        </div>
                        {getDistanceDisplay() && (
                          <span className="text-xs font-semibold text-trust-teal bg-trust-teal/10 px-2 py-1 rounded-full">
                            {getDistanceDisplay()} away
                          </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => onOpenGroceryHelper(request)}
                        className="flex-1 bg-white text-sanctuary-green border border-sanctuary-green font-semibold py-2 px-4 rounded-md hover:bg-sanctuary-green/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dignity-purple transition-colors text-sm"
                    >
                        Organize List
                    </button>
                    {canShare && (
                        <button
                            onClick={() => onShare(request)}
                            className="flex-1 flex items-center justify-center bg-white text-sanctuary-green border border-sanctuary-green font-semibold py-2 px-4 rounded-md hover:bg-sanctuary-green/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dignity-purple transition-colors text-sm"
                        >
                            <ShareIcon className="w-4 h-4 mr-2" />
                            Share
                        </button>
                    )}
                </div>
                <button
                    onClick={() => onClaim(request.id)}
                    className="w-full bg-sanctuary-green text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dignity-purple transition-colors text-sm"
                >
                    Claim Request
                </button>
            </div>
        </div>
    );
};


export const RequestList: React.FC<RequestListProps> = ({ requests, claimRequest, onOpenGroceryHelper, onShare }) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Extract unique cities from requests
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    requests.forEach(req => {
      const city = req.city || req.location_description;
      if (city) cities.add(city);
    });
    return Array.from(cities).sort();
  }, [requests]);

  // Filter requests based on selected city
  const filteredRequests = useMemo(() => {
    const filtered = selectedCity === 'all'
      ? requests
      : requests.filter(req => {
          const city = req.city || req.location_description;
          return city === selectedCity;
        });

    // Sort by urgency level (today first)
    const urgencyOrder = { 'today': 0, 'tomorrow': 1, 'this_week': 2, 'flexible': 3 };
    return [...filtered].sort((a, b) => {
      const urgencyA = urgencyOrder[a.urgency_level as keyof typeof urgencyOrder] ?? 4;
      const urgencyB = urgencyOrder[b.urgency_level as keyof typeof urgencyOrder] ?? 4;
      if (urgencyA !== urgencyB) return urgencyA - urgencyB;
      // If same urgency, sort by created_at (oldest first)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [requests, selectedCity]);

  return (
    <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-3xl font-bold font-display text-secure-slate mb-4 sm:mb-0">Open Requests</h2>

          {availableCities.length > 1 && (
            <div className="flex items-center gap-2">
              <label htmlFor="city-filter" className="text-sm font-medium text-gray-700">
                Filter by city:
              </label>
              <select
                id="city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 bg-white border border-surface-tertiary rounded-lg text-sm text-secure-slate focus:outline-none focus:ring-2 focus:ring-dignity-purple focus:border-transparent"
              >
                <option value="all">All Cities</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredRequests.length === 0 ? (
            <div className="text-center py-10 px-6 bg-surface-primary rounded-xl shadow-md border border-surface-tertiary">
                <h3 className="text-xl font-semibold font-display text-gray-700">
                  {selectedCity === 'all'
                    ? 'All requests have been claimed!'
                    : `No open requests in ${selectedCity}`
                  }
                </h3>
                <p className="text-gray-500 mt-2">
                  {selectedCity === 'all'
                    ? 'Thank you for being willing to help. Please check back later.'
                    : 'Try selecting a different city or check back later.'
                  }
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map(req => (
                    <RequestCard key={req.id} request={req} onClaim={claimRequest} onOpenGroceryHelper={onOpenGroceryHelper} onShare={onShare} />
                ))}
            </div>
        )}
    </div>
  );
};
