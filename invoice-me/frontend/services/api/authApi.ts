// services/api/authApi.ts
// Re-export Cognito auth service for backward compatibility
export {
  cognitoAuthService as authApi,
  type LoginRequest,
  type RegisterRequest,
  type LoginResponse,
  type RegisterResponse,
} from '../cognito/authService';

