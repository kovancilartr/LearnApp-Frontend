import { apiClient } from '../api';
import { 
  Quiz, 
  Question, 
  Attempt,
  QueryParams,
  PaginatedResponse 
} from '@/types';

export class QuizService {
  // Quiz management
  async getQuizzes(params?: QueryParams): Promise<PaginatedResponse<Quiz>> {
    const response = await apiClient.get<PaginatedResponse<Quiz>>('/quizzes', params);
    return response.data!;
  }

  async getQuiz(id: string): Promise<Quiz> {
    const response = await apiClient.get<Quiz>(`/quizzes/${id}`);
    return response.data!;
  }

  async createQuiz(quizData: { title: string; courseId: string; duration?: number; attemptsAllowed?: number }): Promise<Quiz> {
    const response = await apiClient.post<Quiz>('/quizzes', quizData);
    return response.data!;
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    const response = await apiClient.put<Quiz>(`/quizzes/${id}`, updates);
    return response.data!;
  }

  async deleteQuiz(id: string): Promise<void> {
    await apiClient.delete(`/quizzes/${id}`);
  }

  // Question management
  async createQuestion(
    quizId: string, 
    questionData: { text: string; imageUrl?: string; order?: number; choices: Array<{ label: string; text: string; correct: boolean }> }
  ): Promise<Question> {
    const response = await apiClient.post<Question>(`/quizzes/${quizId}/questions`, questionData);
    return response.data!;
  }

  async updateQuestion(
    questionId: string, 
    updates: Partial<Question>
  ): Promise<Question> {
    const response = await apiClient.put<Question>(`/quizzes/questions/${questionId}`, updates);
    return response.data!;
  }

  async deleteQuestion(questionId: string): Promise<void> {
    await apiClient.delete(`/quizzes/questions/${questionId}`);
  }

  // Choice management - Note: Backend doesn't have separate choice endpoints
  // Choices are managed through question endpoints

  // Quiz attempts
  async startQuizAttempt(quizId: string): Promise<Attempt> {
    const response = await apiClient.post<Attempt>(`/quizzes/${quizId}/attempts`);
    return response.data!;
  }

  async submitQuizAttempt(attemptId: string, responses: Array<{
    questionId: string;
    choiceId: string;
  }>): Promise<Attempt> {
    const response = await apiClient.post<Attempt>(`/quizzes/attempts/${attemptId}/submit`, {
      responses
    });
    return response.data!;
  }

  async getQuizResult(attemptId: string): Promise<Attempt> {
    const response = await apiClient.get<Attempt>(`/quizzes/attempts/${attemptId}/result`);
    return response.data!;
  }

  async canStudentTakeQuiz(quizId: string): Promise<{ canTake: boolean; reason?: string }> {
    const response = await apiClient.get<{ canTake: boolean; reason?: string }>(`/quizzes/${quizId}/can-take`);
    return response.data!;
  }

  // Quiz statistics and progress
  async getQuizStatistics(quizId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    attempts: Attempt[];
  }> {
    const response = await apiClient.get<{
      totalAttempts: number;
      averageScore: number;
      passRate: number;
      attempts: Attempt[];
    }>(`/quizzes/${quizId}/statistics`);
    return response.data!;
  }

  async getStudentQuizProgress(quizId: string): Promise<{
    totalQuizzes: number;
    completedQuizzes: number;
    averageScore: number;
    attempts: Attempt[];
  }> {
    const response = await apiClient.get<{
      totalQuizzes: number;
      completedQuizzes: number;
      averageScore: number;
      attempts: Attempt[];
    }>(`/quizzes/${quizId}/progress`);
    return response.data!;
  }
}

export const quizService = new QuizService();