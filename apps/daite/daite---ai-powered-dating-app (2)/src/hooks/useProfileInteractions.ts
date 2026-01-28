import { useCallback } from 'react';
import { useProfilesContext } from '../contexts/ProfileContext';
import { useTokens } from '../contexts/TokenContext';
import { PIXELATION_LEVEL_CONFIG } from '../constants';
import { ProfileType } from '../types';


export const useProfileInteractions = () => {
  const { profiles, updateProfileInState, removeProfileFromDiscover, addMatch } = useProfilesContext();
  const { tokens, spendTokens, earnTokens } = useTokens();

  const revealProfileHandler = useCallback((profileId: number) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile || profile.pixelationLevel === 1) return;

    const currentLevelConfig = PIXELATION_LEVEL_CONFIG[profile.pixelationLevel];
    const costToRevealNext = currentLevelConfig?.tokensToNext;

    if (costToRevealNext === null || costToRevealNext === undefined) return;

    if (spendTokens(costToRevealNext)) {
      const nextPixelationLevel = profile.pixelationLevel - 1;
      updateProfileInState(profileId, { pixelationLevel: nextPixelationLevel });
    } else {
      alert(`Not enough tokens. You need ${costToRevealNext} tokens to reveal the next level.`);
    }
  }, [profiles, spendTokens, updateProfileInState]);

  const likeProfileHandler = useCallback((profileId: number) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile && profile.pixelationLevel === 1) {
      addMatch(profile);
      earnTokens(1); // Earn 1 token for a successful match
      removeProfileFromDiscover(profileId);
    } else if (profile && profile.pixelationLevel !== 1) {
      alert("Profile must be fully revealed before liking.");
    }
  }, [profiles, addMatch, earnTokens, removeProfileFromDiscover]);

  const passProfileHandler = useCallback((profileId: number) => {
    removeProfileFromDiscover(profileId);
  }, [removeProfileFromDiscover]);

  return {
    revealProfileHandler,
    likeProfileHandler,
    passProfileHandler,
  };
};