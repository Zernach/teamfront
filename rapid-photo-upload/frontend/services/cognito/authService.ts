// services/cognito/authService.ts
import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { Platform } from 'react-native';
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
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
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

      // Extract user info from ID token (if available) or user object
      let userId = user.userId;
      let email = credentials.email;
      let username = '';

      if (idToken) {
        try {
          // Decode ID token to get user info (simple base64 decode)
          const payload = JSON.parse(atob(idToken.split('.')[1]));
          userId = payload.sub || userId;
          email = payload.email || email;
          username = payload['cognito:username'] || payload.preferred_username || email.split('@')[0];
        } catch (e) {
          console.warn('Failed to decode ID token:', e);
          username = email.split('@')[0];
        }
      } else {
        username = email.split('@')[0];
      }

      return {
        user: {
          id: userId,
          username,
          email,
        },
        accessToken,
        refreshToken,
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

    // Extract user info from ID token
    let userId = '';
    let email = credentials.email;
    let username = '';

    if (idToken) {
      try {
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        userId = payload.sub || '';
        email = payload.email || email;
        username = payload['cognito:username'] || payload.preferred_username || email.split('@')[0];
      } catch (e) {
        console.warn('Failed to decode ID token:', e);
        username = email.split('@')[0];
      }
    } else {
      username = email.split('@')[0];
    }

    return {
      user: {
        id: userId,
        username,
        email,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(data: RegisterRequest): Promise<{ id: string; username: string; email: string }> {
    console.log('[CognitoAuthService] Starting registration:', {
      email: data.email,
      username: data.username,
      useDirectSDK: await this.useDirectSDK(),
      hasClientSecret: !!COGNITO_CONFIG.clientSecret,
      platform: Platform.OS,
    });

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
            preferred_username: data.username,
          },
        },
      });

      console.log('[CognitoAuthService] Registration successful:', { userId, nextStep });

      return {
        id: userId,
        username: data.username,
        email: data.email,
      };
    } catch (error: any) {
      // Enhanced error logging
      console.error('[CognitoAuthService] Registration error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        $metadata: error.$metadata,
        __type: error.__type,
        fullError: error,
      });

      // Provide more specific error messages
      let errorMessage = 'Registration failed';

      if (error.name === 'UsernameExistsException' || error.message?.includes('User already exists')) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.name === 'InvalidPasswordException' || error.message?.includes('Password')) {
        errorMessage = 'Password does not meet requirements. Must be at least 8 characters with uppercase, lowercase, numbers, and special characters.';
      } else if (error.name === 'InvalidParameterException') {
        if (error.message?.includes('SECRET_HASH')) {
          errorMessage = 'Authentication configuration error: The app client requires a SECRET_HASH but this app is configured without a client secret. Please check your Cognito app client settings.';
        } else {
          errorMessage = `Invalid parameter: ${error.message}`;
        }
      } else if (error.name === 'NotAuthorizedException') {
        errorMessage = 'App client is not authorized for this operation. Check that ALLOW_USER_PASSWORD_AUTH is enabled in your Cognito app client settings.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Register using AWS SDK directly (for web with client secret)
   */
  private async registerWithSDK(data: RegisterRequest): Promise<{ id: string; username: string; email: string }> {
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
        { Name: 'preferred_username', Value: data.username },
      ],
    });

    const response = await client.send(command);

    return {
      id: response.UserSub || '',
      username: data.username,
      email: data.email,
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
    } catch (error) {
      console.error('Logout error:', error);
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

      return { accessToken, refreshToken };
    } catch (error: any) {
      const errorMessage = error.message || 'Token refresh failed';
      throw new Error(errorMessage);
    }
  }

  async getCurrentUser(): Promise<{ id: string; username: string; email: string } | null> {
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
        username: payload['cognito:username'] || payload.preferred_username || payload.email?.split('@')[0] || '',
        email: payload.email || '',
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
