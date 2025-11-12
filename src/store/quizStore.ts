import { create } from 'zustand';
import { Quiz, Attempt, ApiError } from '@/types';
import { quizService } from '@/lib/services';

interface QuizState {
  // Data
  quizzes: Quiz[];
  selectedQuiz: Quiz | null;
  currentAttempt: Attempt | null;
  attempts: Attempt[];
  availableQuizzes: Quiz[];
  
  // Loading states
  isLoading: boolean;
  isLoadingQuizzes: boolean;
  isLoadingQuiz: boolean;
  isCreatingQuiz: boolean;
  isUpdatingQuiz: boolean;
  isDeletingQuiz: boolean;
  isStartingAttempt: boolean;
  isSubmittingResponse: boolean;
  isFinishingAttempt: boolean;
  
  // Error states
  error: ApiError | null;
  quizzesError: ApiError | null;
  attemptError: ApiError | null;
  
  // Quiz taking state
  currentQuestionIndex: number;
  responses: { [questionId: string]: string };
  timeRemaining: number | null;
  isQuizActive: boolean;
  
  // Actions
  setQuizzes: (quizzes: Quiz[]) => void;
  setSelectedQuiz: (quiz: Quiz | null) => void;
  setCurrentAttempt: (attempt: Attempt | null) => void;
  setAttempts: (attempts: Attempt[]) => void;
  setAvailableQuizzes: (quizzes: Quiz[]) => void;
  
  // CRUD operations
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (quizId: string, updates: Partial<Quiz>) => void;
  removeQuiz: (quizId: string) => void;
  
  // Loading setters
  setLoading: (loading: boolean) => void;
  setLoadingQuizzes: (loading: boolean) => void;
  setLoadingQuiz: (loading: boolean) => void;
  setCreatingQuiz: (loading: boolean) => void;
  setUpdatingQuiz: (loading: boolean) => void;
  setDeletingQuiz: (loading: boolean) => void;
  setStartingAttempt: (loading: boolean) => void;
  setSubmittingResponse: (loading: boolean) => void;
  setFinishingAttempt: (loading: boolean) => void;
  
  // Error setters
  setError: (error: ApiError | null) => void;
  setQuizzesError: (error: ApiError | null) => void;
  setAttemptError: (error: ApiError | null) => void;
  clearErrors: () => void;
  
  // Quiz taking actions
  setCurrentQuestionIndex: (index: number) => void;
  setResponse: (questionId: string, choiceId: string) => void;
  setTimeRemaining: (time: number | null) => void;
  setQuizActive: (active: boolean) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  resetQuizState: () => void;
  
  // Async actions
  fetchQuizzes: (courseId?: string) => Promise<void>;
  fetchAvailableQuizzes: () => Promise<void>;
  fetchQuiz: (id: string) => Promise<Quiz | null>;
  createQuiz: (courseId: string, quizData: Omit<Quiz, 'id' | 'courseId' | 'createdAt' | 'questions' | 'attempts'>) => Promise<Quiz | null>;
  startQuizAttempt: (quizId: string) => Promise<Attempt | null>;
  submitResponse: (questionId: string, choiceId: string) => Promise<void>;
  finishQuizAttempt: () => Promise<Attempt | null>;
  fetchAttempts: (studentId: string, quizId?: string) => Promise<void>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Initial state
  quizzes: [],
  selectedQuiz: null,
  currentAttempt: null,
  attempts: [],
  availableQuizzes: [],
  
  // Loading states
  isLoading: false,
  isLoadingQuizzes: false,
  isLoadingQuiz: false,
  isCreatingQuiz: false,
  isUpdatingQuiz: false,
  isDeletingQuiz: false,
  isStartingAttempt: false,
  isSubmittingResponse: false,
  isFinishingAttempt: false,
  
  // Error states
  error: null,
  quizzesError: null,
  attemptError: null,
  
  // Quiz taking state
  currentQuestionIndex: 0,
  responses: {},
  timeRemaining: null,
  isQuizActive: false,

  // Basic setters
  setQuizzes: (quizzes) => set({ quizzes }),
  setSelectedQuiz: (quiz) => set({ selectedQuiz: quiz }),
  setCurrentAttempt: (attempt) => set({ currentAttempt: attempt }),
  setAttempts: (attempts) => set({ attempts }),
  setAvailableQuizzes: (quizzes) => set({ availableQuizzes: quizzes }),

  // CRUD operations
  addQuiz: (quiz) => {
    set((state) => ({
      quizzes: [...state.quizzes, quiz],
      availableQuizzes: [...state.availableQuizzes, quiz],
    }));
  },

  updateQuiz: (quizId, updates) => {
    set((state) => ({
      quizzes: state.quizzes.map((quiz) =>
        quiz.id === quizId ? { ...quiz, ...updates } : quiz
      ),
      availableQuizzes: state.availableQuizzes.map((quiz) =>
        quiz.id === quizId ? { ...quiz, ...updates } : quiz
      ),
      selectedQuiz: state.selectedQuiz?.id === quizId 
        ? { ...state.selectedQuiz, ...updates } 
        : state.selectedQuiz,
    }));
  },

  removeQuiz: (quizId) => {
    set((state) => ({
      quizzes: state.quizzes.filter((quiz) => quiz.id !== quizId),
      availableQuizzes: state.availableQuizzes.filter((quiz) => quiz.id !== quizId),
      selectedQuiz: state.selectedQuiz?.id === quizId ? null : state.selectedQuiz,
    }));
  },

  // Loading setters
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingQuizzes: (loading) => set({ isLoadingQuizzes: loading }),
  setLoadingQuiz: (loading) => set({ isLoadingQuiz: loading }),
  setCreatingQuiz: (loading) => set({ isCreatingQuiz: loading }),
  setUpdatingQuiz: (loading) => set({ isUpdatingQuiz: loading }),
  setDeletingQuiz: (loading) => set({ isDeletingQuiz: loading }),
  setStartingAttempt: (loading) => set({ isStartingAttempt: loading }),
  setSubmittingResponse: (loading) => set({ isSubmittingResponse: loading }),
  setFinishingAttempt: (loading) => set({ isFinishingAttempt: loading }),

  // Error setters
  setError: (error) => set({ error }),
  setQuizzesError: (error) => set({ quizzesError: error }),
  setAttemptError: (error) => set({ attemptError: error }),
  clearErrors: () => set({ error: null, quizzesError: null, attemptError: null }),

  // Quiz taking actions
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  
  setResponse: (questionId, choiceId) => {
    set((state) => ({
      responses: { ...state.responses, [questionId]: choiceId }
    }));
  },
  
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setQuizActive: (active) => set({ isQuizActive: active }),
  
  nextQuestion: () => {
    const state = get();
    const maxIndex = (state.selectedQuiz?.questions?.length || 1) - 1;
    if (state.currentQuestionIndex < maxIndex) {
      set({ currentQuestionIndex: state.currentQuestionIndex + 1 });
    }
  },
  
  previousQuestion: () => {
    const state = get();
    if (state.currentQuestionIndex > 0) {
      set({ currentQuestionIndex: state.currentQuestionIndex - 1 });
    }
  },
  
  resetQuizState: () => {
    set({
      currentQuestionIndex: 0,
      responses: {},
      timeRemaining: null,
      isQuizActive: false,
      currentAttempt: null,
    });
  },

  // Async actions
  fetchQuizzes: async () => {
    set({ isLoadingQuizzes: true, quizzesError: null });
    try {
      const response = await quizService.getQuizzes();
      const quizzes = response.data;
      set({ quizzes, isLoadingQuizzes: false });
    } catch (error: any) {
      set({ 
        quizzesError: error.response?.data || { 
          success: false, 
          error: { code: 'FETCH_ERROR', message: 'Quizler yüklenirken hata oluştu' },
          timestamp: new Date().toISOString()
        },
        isLoadingQuizzes: false 
      });
    }
  },

  fetchAvailableQuizzes: async () => {
    set({ isLoadingQuizzes: true, quizzesError: null });
    try {
      const response = await quizService.getQuizzes();
      const quizzes = response.data;
      set({ availableQuizzes: quizzes, isLoadingQuizzes: false });
    } catch (error: any) {
      set({ 
        quizzesError: error.response?.data || { 
          success: false, 
          error: { code: 'FETCH_ERROR', message: 'Mevcut quizler yüklenirken hata oluştu' },
          timestamp: new Date().toISOString()
        },
        isLoadingQuizzes: false 
      });
    }
  },

  fetchQuiz: async (id) => {
    set({ isLoadingQuiz: true, error: null });
    try {
      const quiz = await quizService.getQuiz(id);
      set({ selectedQuiz: quiz, isLoadingQuiz: false });
      return quiz;
    } catch (error: any) {
      set({ 
        error: error.response?.data || { 
          success: false, 
          error: { code: 'FETCH_ERROR', message: 'Quiz yüklenirken hata oluştu' },
          timestamp: new Date().toISOString()
        },
        isLoadingQuiz: false 
      });
      return null;
    }
  },

  createQuiz: async (quizData) => {
    set({ isCreatingQuiz: true, error: null });
    try {
      const quiz = await quizService.createQuiz(quizData as any);
      get().addQuiz(quiz);
      set({ isCreatingQuiz: false });
      return quiz;
    } catch (error: any) {
      set({ 
        error: error.response?.data || { 
          success: false, 
          error: { code: 'CREATE_ERROR', message: 'Quiz oluşturulurken hata oluştu' },
          timestamp: new Date().toISOString()
        },
        isCreatingQuiz: false 
      });
      return null;
    }
  },

  startQuizAttempt: async (quizId) => {
    set({ isStartingAttempt: true, attemptError: null });
    try {
      const attempt = await quizService.startQuizAttempt(quizId);
      const state = get();
      
      set({ 
        currentAttempt: attempt,
        isQuizActive: true,
        currentQuestionIndex: 0,
        responses: {},
        timeRemaining: state.selectedQuiz?.duration || null,
        isStartingAttempt: false 
      });
      
      return attempt;
    } catch (error: any) {
      set({ 
        attemptError: error.response?.data || { 
          success: false, 
          error: { code: 'START_ERROR', message: 'Quiz başlatılırken hata oluştu' },
          timestamp: new Date().toISOString()
        },
        isStartingAttempt: false 
      });
      return null;
    }
  },

  submitResponse: async (questionId, choiceId) => {
    const state = get();
    if (!state.currentAttempt) return;

    set({ isSubmittingResponse: true, attemptError: null });
    try {
      // Just update local state, actual submission happens when quiz is completed
      get().setResponse(questionId, choiceId);
      set({ isSubmittingResponse: false });
    } catch (error: any) {
      set({ 
        attemptError: error.response?.data || { 
          success: false, 
          error: { code: 'SUBMIT_ERROR', message: 'Cevap gönderilirken hata oluştu' },
          timestamp: new Date().toISOString()
        },
        isSubmittingResponse: false 
      });
    }
  },

  finishQuizAttempt: async () => {
    const state = get();
    if (!state.currentAttempt) return null;

    set({ isFinishingAttempt: true, attemptError: null });
    try {
      const responses = Object.entries(state.responses).map(([questionId, choiceId]) => ({
        questionId,
        choiceId
      }));
      const finishedAttempt = await quizService.submitQuizAttempt(state.currentAttempt.id, responses);
      get().resetQuizState();
      set({ isFinishingAttempt: false });
      return finishedAttempt;
    } catch (error: any) {
      set({ 
        attemptError: error.response?.data || { 
          success: false, 
          error: { code: 'FINISH_ERROR', message: 'Quiz tamamlanırken hata oluştu' },
          timestamp: new Date().toISOString()
        },
        isFinishingAttempt: false 
      });
      return null;
    }
  },

  fetchAttempts: async (studentId, quizId) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement backend endpoint for fetching quiz attempts
      // This should call quizService.getStudentAttempts(studentId, quizId) when available
      const attempts: any[] = [];
      set({ attempts, isLoading: false });
    } catch (error: unknown) {
      set({ 
        error: (error as any).response?.data || { 
          success: false, 
          error: { code: 'FETCH_ERROR', message: 'Quiz denemeleri yüklenirken hata oluştu' },
          timestamp: new Date().toISOString()
        },
        isLoading: false 
      });
    }
  },
}));