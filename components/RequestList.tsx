import React from 'react';
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

    return (
        <div className="bg-surface-primary rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 border border-surface-tertiary">
            <div>
                <div className="flex items-center mb-4 pb-4 border-b border-surface-tertiary">
                    <div className="w-10 h-10 rounded-full bg-dignity-purple/20 flex items-center justify-center mr-3">
                      <UserIcon className="w-5 h-5 text-dignity-purple" />
                    </div>
                    <h3 className="text-lg font-bold font-display text-secure-slate">{request.requester_display_name}</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                    <div className="flex items-start">
                        <ShoppingBagIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-1 text-gray-400" />
                        <p>{request.need}</p>
                    </div>
                    <div className="flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-3 flex-shrink-0 text-gray-400" />
                        <p>{request.city || request.location_description}</p>
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
  return (
    <div>
        <h2 className="text-3xl font-bold font-display text-secure-slate mb-6">Open Requests</h2>
        {requests.length === 0 ? (
            <div className="text-center py-10 px-6 bg-surface-primary rounded-xl shadow-md border border-surface-tertiary">
                <h3 className="text-xl font-semibold font-display text-gray-700">All requests have been claimed!</h3>
                <p className="text-gray-500 mt-2">Thank you for being willing to help. Please check back later.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map(req => (
                    <RequestCard key={req.id} request={req} onClaim={claimRequest} onOpenGroceryHelper={onOpenGroceryHelper} onShare={onShare} />
                ))}
            </div>
        )}
    </div>
  );
};
