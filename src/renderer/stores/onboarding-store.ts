import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  // Project onboarding
  hasSeenProjectsOnboarding: boolean;
  showProjectsOnboardingOnStartup: boolean;

  // Integrations onboarding
  hasSeenIntegrationsOnboarding: boolean;
  showIntegrationsOnboardingOnStartup: boolean;

  // Actions
  setHasSeenProjectsOnboarding: (seen: boolean) => void;
  toggleProjectsOnboardingOnStartup: () => void;
  setHasSeenIntegrationsOnboarding: (seen: boolean) => void;
  toggleIntegrationsOnboardingOnStartup: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Initial state
      hasSeenProjectsOnboarding: false,
      showProjectsOnboardingOnStartup: true,
      hasSeenIntegrationsOnboarding: false,
      showIntegrationsOnboardingOnStartup: true,

      // Actions
      setHasSeenProjectsOnboarding: (seen) => set({ hasSeenProjectsOnboarding: seen }),
      toggleProjectsOnboardingOnStartup: () => 
        set((state) => ({ showProjectsOnboardingOnStartup: !state.showProjectsOnboardingOnStartup })),
      setHasSeenIntegrationsOnboarding: (seen) => set({ hasSeenIntegrationsOnboarding: seen }),
      toggleIntegrationsOnboardingOnStartup: () => 
        set((state) => ({ showIntegrationsOnboardingOnStartup: !state.showIntegrationsOnboardingOnStartup })),
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        hasSeenProjectsOnboarding: state.hasSeenProjectsOnboarding,
        showProjectsOnboardingOnStartup: state.showProjectsOnboardingOnStartup,
        hasSeenIntegrationsOnboarding: state.hasSeenIntegrationsOnboarding,
        showIntegrationsOnboardingOnStartup: state.showIntegrationsOnboardingOnStartup,
      }),
    }
  )
); 