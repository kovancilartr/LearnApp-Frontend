// Quiz Types
export interface CreateQuizRequest {
  title: string;
  courseId: string;
  duration?: number; // in seconds
  attemptsAllowed?: number;
}

export interface UpdateQuizRequest {
  title?: string;
  duration?: number;
  attemptsAllowed?: number;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  duration?: number | null;
  attemptsAllowed: number;
  createdAt: string;
  course?: {
    id: string;
    title: string;
  };
  questions?: QuestionWithChoices[];
  attempts?: AttemptWithStudent[];
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface QuizWithDetails extends Quiz {
  course: {
    id: string;
    title: string;
  };
  questions: QuestionWithChoices[];
  attempts: AttemptWithStudent[];
  _count: {
    questions: number;
    attempts: number;
  };
}

export interface QuizListItem {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  duration?: number | null;
  attemptsAllowed: number;
  createdAt: string;
  questionCount: number;
  attemptCount: number;
}

// Question Types
export interface CreateQuestionRequest {
  quizId: string;
  text: string;
  imageUrl?: string;
  order?: number;
  choices: CreateChoiceRequest[];
}

export interface UpdateQuestionRequest {
  text?: string;
  imageUrl?: string;
  order?: number;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  imageUrl?: string | null;
  order: number;
  choices: Choice[];
}

export interface QuestionWithChoices extends Question {
  choices: Choice[];
}

export interface QuestionWithDetails extends Question {
  quiz: {
    id: string;
    title: string;
  };
  choices: Choice[];
}

// Choice Types
export interface CreateChoiceRequest {
  label: string; // A, B, C, D, E
  text: string;
  correct: boolean;
}

export interface UpdateChoiceRequest {
  label?: string;
  text?: string;
  correct?: boolean;
}

export interface Choice {
  id: string;
  questionId: string;
  label: string; // A, B, C, D, E
  text: string;
  correct: boolean;
}

// Attempt Types
export interface StartQuizAttemptRequest {
  quizId: string;
  studentId: string;
}

export interface SubmitQuizAttemptRequest {
  attemptId: string;
  responses: SubmitResponseRequest[];
}

export interface SubmitResponseRequest {
  questionId: string;
  choiceId: string;
}

export interface Attempt {
  id: string;
  studentId: string;
  quizId: string;
  startedAt: string;
  finishedAt?: string | null;
  score?: number | null;
  responses?: Response[];
}

export interface AttemptWithDetails extends Attempt {
  student: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  quiz: {
    id: string;
    title: string;
    duration?: number;
  };
  responses: ResponseWithDetails[];
}

export interface AttemptWithStudent extends Attempt {
  student: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface Response {
  id: string;
  attemptId: string;
  questionId: string;
  choiceId?: string | null;
}

export interface ResponseWithDetails extends Response {
  question: {
    id: string;
    text: string;
    choices: Choice[];
  };
  choice?: Choice;
}

// Quiz Results Types
export interface QuizResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  finishedAt: string;
  duration: number; // in seconds
  responses: QuizResponseResult[];
}

export interface QuizResponseResult {
  questionId: string;
  questionText: string;
  selectedChoiceId?: string | null;
  selectedChoiceText?: string;
  correctChoiceId: string;
  correctChoiceText: string;
  isCorrect: boolean;
}

// Quiz Statistics Types
export interface QuizStatistics {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
  questionStatistics: QuestionStatistics[];
}

export interface QuestionStatistics {
  questionId: string;
  questionText: string;
  totalResponses: number;
  correctResponses: number;
  correctPercentage: number;
  choiceStatistics: ChoiceStatistics[];
}

export interface ChoiceStatistics {
  choiceId: string;
  choiceText: string;
  choiceLabel: string;
  responseCount: number;
  responsePercentage: number;
  isCorrect: boolean;
}

// Student Quiz Progress Types
export interface StudentQuizProgress {
  studentId: string;
  quizId: string;
  quizTitle: string;
  attemptsUsed: number;
  attemptsAllowed: number;
  bestScore?: number;
  lastAttemptDate?: string;
  canTakeQuiz: boolean;
  attempts: StudentQuizAttempt[];
}

export interface StudentQuizAttempt {
  id: string;
  score?: number | null;
  startedAt: string;
  finishedAt?: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
}

// Quiz Search and Filter Types
export interface QuizSearchQuery {
  courseId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QuizValidationResult {
  isValid: boolean;
  errors: string[];
}