// services/api/config.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiException extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiException';
  }
}

