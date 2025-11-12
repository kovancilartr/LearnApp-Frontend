import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type LessonFocusMode = 'modern' | 'classic' | 'auto';

interface LessonFocusState {
  // Current focus mode
  focusMode: LessonFocusMode;
  
  // User preference (overrides admin setting if allowed)
  userPreference: LessonFocusMode | null;
  
  // Admin settings
  adminDefaultMode: LessonFocusMode;
  allowUserChoice: boolean;
  
  // Actions
  setFocusMode: (mode: LessonFocusMode) => void;
  setUserPreference: (mode: LessonFocusMode | null) => void;
  setAdminSettings: (defaultMode: LessonFocusMode, allowUserChoice: boolean) => void;
  getCurrentMode: () => LessonFocusMode;
  canUserChoose: () => boolean;
}

export const useLessonFocusStore = create<LessonFocusState>()(
  persist(
    (set, get) => ({
      // Initial state
      focusMode: 'auto',
      userPreference: null,
      adminDefaultMode: 'modern',
      allowUserChoice: true,

      // Set focus mode
      setFocusMode: (mode: LessonFocusMode) => {
        set({ focusMode: mode });
      },

      // Set user preference
      setUserPreference: (mode: LessonFocusMode | null) => {
        set({ userPreference: mode });
      },

      // Set admin settings
      setAdminSettings: (defaultMode: LessonFocusMode, allowUserChoice: boolean) => {
        set({ 
          adminDefaultMode: defaultMode, 
          allowUserChoice,
          // Reset user preference if admin doesn't allow choice
          userPreference: allowUserChoice ? get().userPreference : null
        });
      },

      // Get current effective mode
      getCurrentMode: (): LessonFocusMode => {
        const state = get();
        
        // If admin allows user choice and user has preference, use it
        if (state.allowUserChoice && state.userPreference) {
          return state.userPreference;
        }
        
        // If focus mode is set to auto, use admin default
        if (state.focusMode === 'auto') {
          return state.adminDefaultMode;
        }
        
        // Otherwise use the set focus mode
        return state.focusMode;
      },

      // Check if user can choose
      canUserChoose: (): boolean => {
        return get().allowUserChoice;
      },
    }),
    {
      name: 'lesson-focus-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist all state
      partialize: (state) => ({
        focusMode: state.focusMode,
        userPreference: state.userPreference,
        adminDefaultMode: state.adminDefaultMode,
        allowUserChoice: state.allowUserChoice,
      }),
    }
  )
);