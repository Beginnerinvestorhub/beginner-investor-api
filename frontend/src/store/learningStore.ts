// src/store/learningStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingProfileData {
  name: string;
  email: string;
  experience: string;
  goals: string[];
}

interface LearningState {
  onboardingCompleted: boolean;
  currentModule: string | null;
  completedModules: string[];
  progress: number;
  onboardingStep: number;
  isLoading: boolean;
  error: string | null;
  setOnboardingCompleted: (completed: boolean) => void;
  setCurrentModule: (module: string | null) => void;
  addCompletedModule: (module: string) => void;
  setProgress: (progress: number) => void;
  resetProgress: () => void;
  startOnboarding: () => void;
  completeOnboardingStep: (step: number) => void;
  submitOnboardingProfile: (data: OnboardingProfileData) => void;
  clearError: () => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    set => ({
      onboardingCompleted: false,
      currentModule: null,
      completedModules: [],
      progress: 0,
      onboardingStep: 0,
      isLoading: false,
      error: null,

      setOnboardingCompleted: (completed: boolean) =>
        set({ onboardingCompleted: completed }),

      setCurrentModule: (module: string | null) =>
        set({ currentModule: module }),

      addCompletedModule: (module: string) =>
        set(state => ({
          completedModules: [...state.completedModules, module],
          progress: Math.min(state.progress + 10, 100), // Increment progress by 10% per module
        })),

      setProgress: (progress: number) => set({ progress }),

      resetProgress: () =>
        set({
          onboardingCompleted: false,
          currentModule: null,
          completedModules: [],
          progress: 0,
        }),

      startOnboarding: () => set({ onboardingStep: 1, isLoading: false, error: null }),

      completeOnboardingStep: (step: number) => set({ onboardingStep: step }),

      submitOnboardingProfile: () => {
        set({ isLoading: true, error: null });
        // Simulate API call
        setTimeout(() => {
          set({
            onboardingCompleted: true,
            onboardingStep: 0,
            isLoading: false
          });
        }, 1000);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'learning-storage',
    }
  )
);

// Export the hook that dashboard.tsx is using
export const useOnboardingCompleted = () => {
  const { onboardingCompleted } = useLearningStore();
  return onboardingCompleted;
};
