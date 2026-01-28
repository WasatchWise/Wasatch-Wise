import React from 'react';
import { Heart, Eye, Coins, X as XIcon, Bot, Loader2 } from 'lucide-react';
import { ProfileType } from '../../types';
import { PIXELATION_LEVEL_CONFIG } from '../../constants';
import { useTokens } from '../../contexts/TokenContext';
import { useCyrainoAI } from '../../contexts/CyrainoAIContext';
import { useProfileInteractions } from '../../hooks/useProfileInteractions';


interface ProfileCardProps {
  profile: ProfileType;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const { tokens } = useTokens();
  const { getAIFirstImpressionHandler, isAIServiceAvailable } = useCyrainoAI();
  const { revealProfileHandler, likeProfileHandler, passProfileHandler } = useProfileInteractions();


  const isFullyRevealed = profile.pixelationLevel === 1;
  const currentPixelConfig = PIXELATION_LEVEL_CONFIG[profile.pixelationLevel];
  const costToRevealNext = currentPixelConfig?.tokensToNext;
  const glimpseCost = 1; // Cost for AI Glimpse

  const showInsight = profile.pixelationLevel <= 3; // This logic can be refined if needed
  const showBioAndInterests = isFullyRevealed;

  const canGetGlimpse = tokens >= glimpseCost && isAIServiceAvailable && !profile.isFetchingImpression && !profile.aiFirstImpression;
  let glimpseButtonTitle = "";
  if (!isAIServiceAvailable) {
    glimpseButtonTitle = "CYRAINO AI service is unavailable.";
  } else if (tokens < glimpseCost) {
    glimpseButtonTitle = "Not enough tokens for a glimpse.";
  } else if (profile.aiFirstImpression) {
    glimpseButtonTitle = "Glimpse already revealed.";
  } else if (profile.isFetchingImpression) {
    glimpseButtonTitle = "Fetching glimpse...";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 duration-300 flex flex-col">
      <div className="relative">
        <img
          src={profile.image}
          alt={profile.name} // Pseudonym
          className="w-full h-80 object-cover"
          style={{ filter: `blur(${currentPixelConfig?.blur || 0}px)` }}
        />
        {!isFullyRevealed && currentPixelConfig && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-4 text-center text-white">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-80" />
            <p className="text-lg font-semibold mb-1">{currentPixelConfig.description}</p>
            <p className="text-sm opacity-90 mb-3">CYRAINO found someone with {profile.compatibility}% compatibility.</p>
            {costToRevealNext !== null && (
                <button
                onClick={() => revealProfileHandler(profile.id)}
                className={`mt-2 bg-white text-purple-600 px-5 py-2.5 rounded-full font-semibold shadow-md transition-all hover:scale-105 ${
                    (tokens < costToRevealNext) ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                disabled={tokens < costToRevealNext}
                aria-label={`Reveal next level for ${profile.name}`}
                >
                Reveal ({costToRevealNext} <Coins className="w-4 h-4 inline-block -mt-0.5" />)
                </button>
            )}
          </div>
        )}
         {isFullyRevealed && currentPixelConfig &&(
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
               {/* Potential to add some text here if needed when fully revealed, or keep it clean */}
            </div>
        )}
        <div className="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow">
          {profile.compatibility}% Match
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {profile.name} {/* Pseudonym */}
            {isFullyRevealed && `, ${profile.age}`}
          </h3>
          {isFullyRevealed && <p className="text-gray-500 text-sm mb-2">{profile.location}</p>}

          {/* AI First Glimpse Section */}
          {!isFullyRevealed && (
            <div className="my-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              {profile.isFetchingImpression ? (
                <div className="flex items-center text-purple-700">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-xs font-medium">CYRAINO is thinking...</span>
                </div>
              ) : profile.aiFirstImpression ? (
                <div>
                  <div className="flex items-center mb-1">
                    <Bot className="w-4 h-4 text-purple-600 mr-1.5 flex-shrink-0" />
                    <span className="text-xs font-semibold text-purple-800">CYRAINO's Glimpse:</span>
                  </div>
                  <p className="text-xs text-purple-700 italic">"{profile.aiFirstImpression}"</p>
                </div>
              ) : (
                <button
                  onClick={() => getAIFirstImpressionHandler(profile.id)}
                  className={`w-full text-xs bg-purple-200 text-purple-700 px-3 py-1.5 rounded-md font-semibold hover:bg-purple-300 transition-colors flex items-center justify-center ${
                    !canGetGlimpse ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  disabled={!canGetGlimpse}
                  title={glimpseButtonTitle}
                >
                  <Bot className="w-3 h-3 mr-1.5" /> Get CYRAINO's Glimpse ({glimpseCost} <Coins className="w-3 h-3 inline-block ml-1" />)
                </button>
              )}
            </div>
          )}
          
          {showInsight && !isFullyRevealed && !profile.aiFirstImpression && ( 
            <div className="my-3">
              <div className="flex items-center mb-1">
                <Heart className="w-4 h-4 text-pink-500 mr-1.5 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-700">CYRAINO Match Insight:</span>
              </div>
              <p className="text-xs text-gray-600 bg-pink-50 p-2 rounded-md border border-pink-100">
                Shares interest in {profile.interests[0]?.toLowerCase() || 'new experiences'} & values meaningful connections.
              </p>
            </div>
          )}


          {showBioAndInterests && (
            <>
              <div className="my-3">
                <div className="flex items-center mb-1">
                  <Heart className="w-4 h-4 text-pink-500 mr-1.5 flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-700">CYRAINO Match Insight:</span>
                </div>
                <p className="text-xs text-gray-600 bg-pink-50 p-2 rounded-md border border-pink-100">
                   {profile.name} shares your interest in {profile.interests[0]?.toLowerCase() || 'new experiences'}! You both seem to value meaningful connections and have complementary communication styles.
                </p>
              </div>
              {profile.aiFirstImpression && ( 
                <div className="my-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-1">
                        <Bot className="w-4 h-4 text-purple-600 mr-1.5 flex-shrink-0" />
                        <span className="text-xs font-semibold text-purple-800">CYRAINO's Glimpse:</span>
                    </div>
                    <p className="text-xs text-purple-700 italic">"{profile.aiFirstImpression}"</p>
                </div>
              )}
              <p className="text-sm text-gray-700 mb-3 h-16 overflow-y-auto">{profile.bio}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {profile.interests.slice(0, 4).map(interest => (
                  <span key={interest} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex space-x-3 mt-auto pt-3 border-t border-gray-100">
          <button
            onClick={() => passProfileHandler(profile.id)}
            className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center font-semibold text-sm"
            aria-label={`Pass on ${profile.name}`}
          >
            <XIcon className="w-4 h-4 mr-1.5" />
            Pass
          </button>
          <button
            onClick={() => likeProfileHandler(profile.id)}
            disabled={!isFullyRevealed}
            className={`flex-1 bg-pink-500 text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center font-semibold text-sm ${
              !isFullyRevealed ? 'opacity-50 cursor-not-allowed hover:bg-pink-500' : 'hover:bg-pink-600'
            }`}
            aria-label={`Like ${profile.name}`}
          >
            <Heart className="w-4 h-4 mr-1.5" />
            Like
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;