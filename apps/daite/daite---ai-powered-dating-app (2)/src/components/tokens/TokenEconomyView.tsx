import React from 'react';
import { Coins, Eye, Zap, Gift } from 'lucide-react';
import { INITIAL_TOKENS } from '../../constants';
import { useTokens } from '../../contexts/TokenContext';
import { useProfilesContext } from '../../contexts/ProfileContext';

interface Transaction {
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

const TokenEconomyView: React.FC = () => {
  const { tokens } = useTokens();
  const { matches } = useProfilesContext();
  const matchesCount = matches.length;

  // Mock transaction history - simplified for display
  const transactions: Transaction[] = [
    { description: 'Welcome bonus', amount: INITIAL_TOKENS, type: 'credit' },
  ];
  if (tokens < INITIAL_TOKENS) { 
      transactions.push({ description: 'Revealed profile details/AI Glimpse', amount: INITIAL_TOKENS - tokens, type: 'debit'});
  }
  if (matchesCount > 0) {
      transactions.push({ description: `Engagement bonus (likes)`, amount: matchesCount * 1, type: 'credit' });
  }
  // Note: This transaction logic is illustrative. Real transaction history would need robust state management.

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center mb-8">
        <Coins className="w-10 h-10 text-pink-500 mr-3" />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Token Economy</h1>
      </div>
      
      <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 rounded-xl p-6 sm:p-8 mb-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">How DAiTE Tokens Work</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Our token system fosters genuine connections by allowing you to gradually reveal profiles and access premium features.
          Start with a welcome bonus and earn more through engagement or purchases.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow">
            <Eye className="w-10 h-10 text-pink-500 mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2 text-lg">Reveal Clarity</h3>
            <p className="text-sm text-gray-600">Spend tokens to progressively reveal photos and more details about potential matches.</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow">
            <Zap className="w-10 h-10 text-purple-500 mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2 text-lg">Premium Actions</h3>
            <p className="text-sm text-gray-600">Use tokens for curated date planning, AI insights, or sending virtual gifts.</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow">
            <Gift className="w-10 h-10 text-orange-500 mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2 text-lg">Earn Tokens</h3>
            <p className="text-sm text-gray-600">Gain tokens for active engagement, when others spend to reveal your profile, or by completing challenges.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Your Token Balance</h3>
        <div className="flex items-center justify-between mb-6 bg-pink-100 p-6 rounded-lg">
          <span className="text-4xl font-bold text-pink-600">{tokens} Tokens</span>
          <Coins className="w-12 h-12 text-pink-500 opacity-70" />
        </div>
        
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Recent Activity (Illustrative)</h4>
        <div className="space-y-3 text-sm">
          {transactions.map((transaction, index) => (
            <div key={index} className={`flex justify-between items-center py-3 px-4 rounded-md ${transaction.type === 'credit' ? 'bg-green-50 border-l-4 border-green-300' : 'bg-red-50 border-l-4 border-red-300'}`}>
              <span className="text-gray-700">{transaction.description}</span>
              <span className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'credit' ? '+' : '-'}{Math.abs(transaction.amount)}
              </span>
            </div>
          ))}
           <div className="flex justify-between items-center py-3 px-4 rounded-md bg-blue-50 border-l-4 border-blue-300 mt-4">
              <span className="text-gray-700 font-semibold">Current Actual Balance</span>
              <span className="font-bold text-blue-600">{tokens}</span>
            </div>
        </div>

        <button className="w-full mt-8 bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-semibold text-lg shadow hover:shadow-md">
          Get More Tokens (Not Implemented)
        </button>
      </div>
    </div>
  );
};

export default TokenEconomyView;