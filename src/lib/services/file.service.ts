import { apiClient } from '../api';

interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  cdnUrl?: string;
  createdAt: string;
}

interface UploadProgressCallback {
  (progress: number): void;
}

export class FileService {
  async uploadFile(
    file: File, 
    type: 'image' | 'pdf' | 'video' | 'document',
    onProgress?: UploadProgressCallback
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiClient.client.post<{ success: boolean; data: FileUploadResponse }>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );

    return response.data.data;
  }

  async uploadMultipleFiles(
    files: File[],
    type: 'image' | 'pdf' | 'video' | 'document',
    onProgress?: UploadProgressCallback
  ): Promise<FileUploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('type', type);

    const response = await apiClient.client.post<{ success: boolean; data: FileUploadResponse[] }>(
      '/files/upload-multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );

    return response.data.data;
  }

  async getFile(id: string): Promise<FileUploadResponse> {
    const response = await apiClient.get<FileUploadResponse>(`/files/${id}`);
    return response.data;
  }

  async deleteFile(id: string): Promise<void> {
    await apiClient.delete(`/files/${id}`);
  }

  async getFilesByType(type: 'image' | 'pdf' | 'video' | 'document'): Promise<FileUploadResponse[]> {
    const response = await apiClient.get<FileUploadResponse[]>(`/files?type=${type}`);
    return response.data;
  }

  async getUserFiles(): Promise<FileUploadResponse[]> {
    const response = await apiClient.get<FileUploadResponse[]>('/files/my-files');
    return response.data;
  }

  // Utility methods for file validation
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Predefined file type configurations
  static readonly FILE_TYPES = {
    image: {
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxSize: 5, // MB
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    },
    pdf: {
      allowedTypes: ['application/pdf'],
      maxSize: 10, // MB
      extensions: ['pdf']
    },
    video: {
      allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
      maxSize: 100, // MB
      extensions: ['mp4', 'webm', 'ogg']
    },
    document: {
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ],
      maxSize: 10, // MB
      extensions: ['pdf', 'doc', 'docx', 'txt']
    }
  };
}

export const fileService = new FileService();