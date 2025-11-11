// services/authService.ts
// Re-export Cognito auth service for backward compatibility
export {
  cognitoAuthService as authService,
  type LoginRequest,
  type RegisterRequest,
  type LoginResponse,
  type RegisterResponse,
} from './cognito/authService';

