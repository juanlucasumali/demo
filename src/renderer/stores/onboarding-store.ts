import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  // Project onboarding
  hasSeenProjectsOnboarding: boolean;
  showProjectsOnboardingOnStartup: boolean;

  // Actions
  setHasSeenProjectsOnboarding: (seen: boolean) => void;
  toggleProjectsOnboardingOnStartup: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Initial state
      hasSeenProjectsOnboarding: false,
      showProjectsOnboardingOnStartup: true,

      // Actions
      setHasSeenProjectsOnboarding: (seen) => set({ hasSeenProjectsOnboarding: seen }),
      toggleProjectsOnboardingOnStartup: () => 
        set((state) => ({ showProjectsOnboardingOnStartup: !state.showProjectsOnboardingOnStartup })),
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        hasSeenProjectsOnboarding: state.hasSeenProjectsOnboarding,
        showProjectsOnboardingOnStartup: state.showProjectsOnboardingOnStartup,
      }),
    }
  )
); 