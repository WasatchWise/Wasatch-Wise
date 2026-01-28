import React from 'react';
import { Coins, Eye } from 'lucide-react';
import ProfileCard from './ProfileCard';
import { useProfilesContext } from '../../contexts/ProfileContext';
import { useTokens } from '../../contexts/TokenContext';

const DiscoverView: React.FC = () => {
  const { visibleProfiles } = useProfilesContext();
  const { tokens } = useTokens();

  if (visibleProfiles.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <Eye className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-gray-700 mb-3">No More Profiles</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You've seen all available profiles for now. Check back later for new potential matches!
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 space-y-3 sm:space-y-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Discover Potential Dates</h1>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 rounded-full shadow-sm self-start sm:self-center">
          <Coins className="w-6 h-6 text-pink-600" />
          <span className="text-lg font-semibold text-pink-800">{tokens} Tokens</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
        {visibleProfiles.map(profile => (
          <ProfileCard
            key={profile.id}
            profile={profile}
          />
        ))}
      </div>
    </div>
  );
};

export default DiscoverView;
