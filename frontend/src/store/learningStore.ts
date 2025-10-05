// src/store/learningStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LearningState {
  onboardingCompleted: boolean;
  currentModule: string | null;
  completedModules: string[];
  progress: number;
  setOnboardingCompleted: (completed: boolean) => void;
  setCurrentModule: (module: string | null) => void;
  addCompletedModule: (module: string) => void;
  setProgress: (progress: number) => void;
  resetProgress: () => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      onboardingCompleted: false,
      currentModule: null,
      completedModules: [],
      progress: 0,

      setOnboardingCompleted: (completed: boolean) =>
        set({ onboardingCompleted: completed }),

      setCurrentModule: (module: string | null) =>
        set({ currentModule: module }),

      addCompletedModule: (module: string) =>
        set((state) => ({
          completedModules: [...state.completedModules, module],
          progress: Math.min(state.progress + 10, 100), // Increment progress by 10% per module
        })),

      setProgress: (progress: number) =>
        set({ progress }),

      resetProgress: () =>
        set({
          onboardingCompleted: false,
          currentModule: null,
          completedModules: [],
          progress: 0,
        }),
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
