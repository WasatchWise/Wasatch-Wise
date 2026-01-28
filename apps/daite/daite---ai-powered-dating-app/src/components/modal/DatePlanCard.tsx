import React from 'react';
import { Coins, Clock, MapPin, Star, Car, Gift } from 'lucide-react';
import { DatePlanType } from '../../types';

interface DatePlanCardProps {
  datePlan: DatePlanType;
  currentTokens: number;
  onBook: (datePlan: DatePlanType) => void;
}

const DatePlanCard: React.FC<DatePlanCardProps> = ({ datePlan, currentTokens, onBook }) => {
  const canAfford = currentTokens >= datePlan.totalTokens;
  return (
    <div className="border border-gray-200 rounded-lg p-5 sm:p-6 hover:shadow-xl transition-shadow duration-300 bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
        <div className="flex-1 mb-3 sm:mb-0">
          <div className="flex items-center mb-2">
            <h3 className="text-xl font-bold text-gray-800 mr-3">{datePlan.type}</h3>
            <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">
              {datePlan.match}% Date Fit
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3">{datePlan.description}</p>
          {datePlan.customization && <p className="text-sm text-purple-600 font-medium italic">✨ {datePlan.customization}</p>}
        </div>
        <div className="text-left sm:text-right ml-0 sm:ml-4 flex-shrink-0">
          <div className="text-3xl font-bold text-purple-600 flex items-center">
            {datePlan.totalTokens} <Coins className="w-6 h-6 ml-1.5 text-purple-500" />
          </div>
          <div className="text-xs text-gray-500">Total Cost</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Date Details</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center"><Clock className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" /><span>{datePlan.duration}</span></div>
            <div className="flex items-center"><MapPin className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" /><span>{datePlan.restaurant}</span></div>
            <div className="flex items-center"><Star className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" /><span>{datePlan.activity}</span></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Included Services</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center"><Car className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" /><span>{datePlan.transportation}</span></div>
            <div className="flex items-center"><Gift className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" /><span>{datePlan.gift}</span></div>
            <div className="flex items-center"><span className="w-4 h-4 text-center text-gray-500 mr-2 font-bold flex-shrink-0">$</span><span>Approx. Value: ${datePlan.cost}</span></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="text-xs text-gray-600 mb-3 sm:mb-0 sm:mr-4">
          <span className="font-semibold">Includes:</span> Reservations, transport coordination, gift, real-time CYRAINO coaching.
        </div>
        <button
          onClick={() => onBook(datePlan)}
          disabled={!canAfford}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold transition-colors text-base flex items-center justify-center ${
            canAfford
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canAfford ? 'Book This Date' : 'Not Enough Tokens'}
          {canAfford && <Coins className="w-4 h-4 ml-2" />}
        </button>
      </div>
    </div>
  );
};

export default DatePlanCard;