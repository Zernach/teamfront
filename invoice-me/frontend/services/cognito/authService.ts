// services/cognito/authService.ts
import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { Platform } from 'react-native';
import { tokenStorage } from '../tokenStorage';
import { COGNITO_CONFIG } from './config';
import { computeSecretHash } from './secretHash';

// Import AWS SDK for web when client secret is present
let CognitoIdentityProviderClient: any;
let InitiateAuthCommand: any;
let SignUpCommand: any;
let ConfirmSignUpCommand: any;
let ResendConfirmationCodeCommand: any;

if (Platform.OS === 'web' && COGNITO_CONFIG.clientSecret) {
  // Dynamically import AWS SDK only on web when client secret is present
  import('@aws-sdk/client-cognito-identity-provider').then((module) => {
    CognitoIdentityProviderClient = module.CognitoIdentityProviderClient;
    InitiateAuthCommand = module.InitiateAuthCommand;
    SignUpCommand = module.SignUpCommand;
    ConfirmSignUpCommand = module.ConfirmSignUpCommand;
    ResendConfirmationCodeCommand = module.ResendConfirmationCodeCommand;
  });
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
}

class CognitoAuthService {
  /**
   * Use AWS SDK directly on web when client secret is present
   * Otherwise use Amplify (which handles SECRET_HASH automatically on native)
   */
  private async useDirectSDK(): Promise<boolean> {
    return Platform.OS === 'web' && !!COGNITO_CONFIG.clientSecret;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // On web with client secret, use AWS SDK directly
      if (await this.useDirectSDK()) {
        return await this.loginWithSDK(credentials);
      }

      // Otherwise use Amplify (native or web without secret)
      const { isSignedIn, nextStep } = await signIn({
        username: credentials.email,
        password: credentials.password,
      });

      if (!isSignedIn) {
        throw new Error('Login failed. Please check your credentials.');
      }

      // Get the current user and session
      const user = await getCurrentUser();
      const session = await fetchAuthSession();

      if (!session.tokens) {
        throw new Error('Failed to retrieve authentication tokens');
      }

      const accessToken = session.tokens.accessToken.toString();
      const idToken = session.tokens.idToken?.toString() || '';
      const refreshToken = session.tokens.refreshToken?.toString() || '';

      // Store tokens
      await tokenStorage.setAuthToken(accessToken);
      if (refreshToken) {
        await tokenStorage.setRefreshToken(refreshToken);
      }

      // Extract user info from ID token (if available) or user object
      let userId = user.userId;
      let email = credentials.email;
      let fullName = '';

      if (idToken) {
        try {
          // Decode ID token to get user info (simple base64 decode)
          const payload = JSON.parse(atob(idToken.split('.')[1]));
          userId = payload.sub || userId;
          email = payload.email || email;
          fullName = payload.name || payload['custom:fullName'] || '';
        } catch (e) {
          console.warn('Failed to decode ID token:', e);
        }
      }

      return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600, // 1 hour default
        user: {
          id: userId,
          email,
          fullName,
          role: 'USER', // Default role, can be extracted from token claims
        },
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Login using AWS SDK directly (for web with client secret)
   */
  private async loginWithSDK(credentials: LoginRequest): Promise<LoginResponse> {
    if (!CognitoIdentityProviderClient) {
      // Wait for SDK to load
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (!CognitoIdentityProviderClient) {
        const module = await import('@aws-sdk/client-cognito-identity-provider');
        CognitoIdentityProviderClient = module.CognitoIdentityProviderClient;
        InitiateAuthCommand = module.InitiateAuthCommand;
      }
    }

    const client = new CognitoIdentityProviderClient({
      region: COGNITO_CONFIG.region,
    });

    // Compute SECRET_HASH
    const secretHash = await computeSecretHash(
      credentials.email,
      COGNITO_CONFIG.clientId,
      COGNITO_CONFIG.clientSecret!
    );

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CONFIG.clientId,
      AuthParameters: {
        USERNAME: credentials.email,
        PASSWORD: credentials.password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await client.send(command);

    if (!response.AuthenticationResult) {
      throw new Error('Login failed. Please check your credentials.');
    }

    const accessToken = response.AuthenticationResult.AccessToken || '';
    const idToken = response.AuthenticationResult.IdToken || '';
    const refreshToken = response.AuthenticationResult.RefreshToken || '';

    // Store tokens
    await tokenStorage.setAuthToken(accessToken);
    if (refreshToken) {
      await tokenStorage.setRefreshToken(refreshToken);
    }

    // Extract user info from ID token
    let userId = '';
    let email = credentials.email;
    let fullName = '';

    if (idToken) {
      try {
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        userId = payload.sub || '';
        email = payload.email || email;
        fullName = payload.name || payload['custom:fullName'] || '';
      } catch (e) {
        console.warn('Failed to decode ID token:', e);
      }
    }

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
      user: {
        id: userId,
        email,
        fullName,
        role: 'USER',
      },
    };
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      // On web with client secret, use AWS SDK directly
      if (await this.useDirectSDK()) {
        return await this.registerWithSDK(data);
      }

      // Otherwise use Amplify
      const { userId, nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            ...(data.fullName && { name: data.fullName }),
          },
        },
      });

      return {
        id: userId,
        email: data.email,
        fullName: data.fullName || '',
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Register using AWS SDK directly (for web with client secret)
   */
  private async registerWithSDK(data: RegisterRequest): Promise<RegisterResponse> {
    if (!CognitoIdentityProviderClient) {
      const module = await import('@aws-sdk/client-cognito-identity-provider');
      CognitoIdentityProviderClient = module.CognitoIdentityProviderClient;
      SignUpCommand = module.SignUpCommand;
    }

    const client = new CognitoIdentityProviderClient({
      region: COGNITO_CONFIG.region,
    });

    // Compute SECRET_HASH
    const secretHash = await computeSecretHash(
      data.email,
      COGNITO_CONFIG.clientId,
      COGNITO_CONFIG.clientSecret!
    );

    const command = new SignUpCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: data.email,
      Password: data.password,
      SecretHash: secretHash,
      UserAttributes: [
        { Name: 'email', Value: data.email },
        ...(data.fullName ? [{ Name: 'name', Value: data.fullName }] : []),
      ],
    });

    const response = await client.send(command);

    return {
      id: response.UserSub || '',
      email: data.email,
      fullName: data.fullName || '',
    };
  }

  async confirmRegistration(email: string, confirmationCode: string): Promise<void> {
    try {
      // On web with client secret, use AWS SDK directly
      if (await this.useDirectSDK()) {
        if (!CognitoIdentityProviderClient) {
          const module = await import('@aws-sdk/client-cognito-identity-provider');
          CognitoIdentityProviderClient = module.CognitoIdentityProviderClient;
          ConfirmSignUpCommand = module.ConfirmSignUpCommand;
        }

        const client = new CognitoIdentityProviderClient({
          region: COGNITO_CONFIG.region,
        });

        const secretHash = await computeSecretHash(
          email,
          COGNITO_CONFIG.clientId,
          COGNITO_CONFIG.clientSecret!
        );

        const command = new ConfirmSignUpCommand({
          ClientId: COGNITO_CONFIG.clientId,
          Username: email,
          ConfirmationCode: confirmationCode,
          SecretHash: secretHash,
        });

        await client.send(command);
        return;
      }

      // Otherwise use Amplify
      await confirmSignUp({
        username: email,
        confirmationCode,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Confirmation failed';
      throw new Error(errorMessage);
    }
  }

  async resendConfirmationCode(email: string): Promise<void> {
    try {
      // On web with client secret, use AWS SDK directly
      if (await this.useDirectSDK()) {
        if (!CognitoIdentityProviderClient) {
          const module = await import('@aws-sdk/client-cognito-identity-provider');
          CognitoIdentityProviderClient = module.CognitoIdentityProviderClient;
          ResendConfirmationCodeCommand = module.ResendConfirmationCodeCommand;
        }

        const client = new CognitoIdentityProviderClient({
          region: COGNITO_CONFIG.region,
        });

        const secretHash = await computeSecretHash(
          email,
          COGNITO_CONFIG.clientId,
          COGNITO_CONFIG.clientSecret!
        );

        const command = new ResendConfirmationCodeCommand({
          ClientId: COGNITO_CONFIG.clientId,
          Username: email,
          SecretHash: secretHash,
        });

        await client.send(command);
        return;
      }

      // Otherwise use Amplify
      await resendSignUpCode({
        username: email,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to resend confirmation code';
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut();
      await tokenStorage.clearAuthToken();
      await tokenStorage.clearRefreshToken();
    } catch (error) {
      // Even if logout fails on server, we should clear local state
      console.error('Logout error:', error);
      await tokenStorage.clearAuthToken();
      await tokenStorage.clearRefreshToken();
    }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      
      if (!session.tokens) {
        throw new Error('Failed to refresh tokens');
      }

      const accessToken = session.tokens.accessToken.toString();
      const refreshToken = session.tokens.refreshToken?.toString() || '';

      await tokenStorage.setAuthToken(accessToken);
      if (refreshToken) {
        await tokenStorage.setRefreshToken(refreshToken);
      }

      return { accessToken, refreshToken };
    } catch (error: any) {
      const errorMessage = error.message || 'Token refresh failed';
      throw new Error(errorMessage);
    }
  }

  async getCurrentUser(): Promise<{ id: string; email: string; fullName: string } | null> {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      if (!session.tokens?.idToken) {
        return null;
      }

      const idToken = session.tokens.idToken.toString();
      const payload = JSON.parse(atob(idToken.split('.')[1]));

      return {
        id: payload.sub || user.userId,
        email: payload.email || '',
        fullName: payload.name || payload['custom:fullName'] || '',
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }
}

export const cognitoAuthService = new CognitoAuthService();

