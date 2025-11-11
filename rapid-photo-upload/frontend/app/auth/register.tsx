import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/screen';
import { CustomTextInput } from '../../components/custom-text-input/CustomTextInput';
import { CustomButton } from '../../components/custom-button';
import { CustomText } from '../../components/custom-text/CustomText';
import { useRegister, useLogin, useConfirmRegistration } from '../../hooks/auth';
import { useAppSelector } from '../../hooks/redux';
import { COLORS } from '../../constants/colors';
import { PADDING } from '../../constants/styles/commonStyles';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Verification state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const registerMutation = useRegister();
  const loginMutation = useLogin();
  const confirmMutation = useConfirmRegistration();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Reset errors
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    // Validation
    if (!username.trim()) {
      setUsernameError('Full Name is required');
      return;
    }

    if (username.trim().length < 3) {
      setUsernameError('Full Name must be at least 3 characters');
      return;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    try {
      console.log('[Register] Attempting registration with:', {
        username: username.trim(),
        email: email.trim(),
        passwordLength: password.length,
      });
      
      await registerMutation.mutateAsync({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      
      console.log('[Register] Registration successful, showing verification input...');
      
      // Show verification code input instead of auto-login
      setNeedsVerification(true);
      setGeneralError(''); // Clear any errors
    } catch (error: any) {
      console.error('[Register] Registration error:', {
        message: error?.message,
        code: error?.code,
      });
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle timeout errors
      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      }
      // Handle network errors
      else if (error?.code === 'ERR_NETWORK' || !error?.response) {
        errorMessage = 'Network error. Please check your internet connection and ensure the server is running.';
      }
      // Handle server errors
      else if (error?.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      // Handle validation errors
      else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Handle other errors
      else if (error?.message) {
        errorMessage = error.message;
      }
      
      setGeneralError(errorMessage);
    }
  };

  const handleVerification = async () => {
    // Reset errors
    setVerificationError('');
    setGeneralError('');

    // Validate verification code
    if (!verificationCode.trim()) {
      setVerificationError('Verification code is required');
      return;
    }

    if (verificationCode.trim().length !== 6) {
      setVerificationError('Verification code must be 6 digits');
      return;
    }

    try {
      console.log('[Register] Confirming registration...');
      
      // Confirm registration with verification code
      await confirmMutation.mutateAsync({
        email: email.trim(),
        confirmationCode: verificationCode.trim(),
      });
      
      console.log('[Register] Registration confirmed, logging in automatically...');
      
      // Automatically log in the user after successful verification
      await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
      
      console.log('[Register] Auto-login successful');
      // Navigation will happen via useEffect when isAuthenticated changes
      router.replace('/');
    } catch (error: any) {
      console.error('[Register] Verification or login error:', {
        message: error?.message,
      });
      
      const errorMessage = error?.message || 'Verification failed. Please check your code and try again.';
      setVerificationError(errorMessage);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <CustomText style={styles.title}>
                {needsVerification ? 'Verify Email' : 'Create Account'}
              </CustomText>
              <CustomText style={styles.subtitle}>
                {needsVerification 
                  ? 'Enter the 6-digit code sent to your email' 
                  : 'Sign up to get started'}
              </CustomText>
            </View>

            <View style={styles.form}>
              {!needsVerification ? (
                <>
                  <CustomTextInput
                    id="username"
                    label="Full Name"
                    placeholder="Enter your full name"
                    formattedText={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setUsernameError('');
                      setGeneralError('');
                    }}
                    errorMessage={usernameError}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />

                  <CustomTextInput
                    id="email"
                    label="Email"
                    placeholder="Enter your email"
                    formattedText={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError('');
                      setGeneralError('');
                    }}
                    errorMessage={emailError}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />

                  <CustomTextInput
                    id="password"
                    label="Password"
                    placeholder="Enter your password"
                    formattedText={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError('');
                      setGeneralError('');
                    }}
                    errorMessage={passwordError}
                    isPasswordField
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />

                  <CustomTextInput
                    id="confirmPassword"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    formattedText={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setConfirmPasswordError('');
                      setGeneralError('');
                    }}
                    errorMessage={confirmPasswordError}
                    isPasswordField
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />

                  {generalError ? (
                    <View style={styles.errorContainer}>
                      <CustomText color={COLORS.red} style={styles.errorText}>
                        {generalError}
                      </CustomText>
                    </View>
                  ) : null}

                  <CustomButton
                    title="Sign Up"
                    onPress={handleRegister}
                    disabled={registerMutation.isPending}
                    style={styles.registerButton}
                  />

                  {registerMutation.isPending && (
                    <View style={styles.loadingContainer}>
                      <CustomText color={COLORS.grey} style={styles.loadingText}>
                        Creating account...
                      </CustomText>
                    </View>
                  )}

                  <View style={styles.loginLinkContainer}>
                    <CustomText color={COLORS.grey} style={styles.loginLinkText}>
                      Already have an account?{' '}
                    </CustomText>
                    <TouchableOpacity onPress={() => router.push('/auth/login')}>
                      <CustomText color={COLORS.primary} style={styles.loginLink}>
                        Sign In
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <CustomTextInput
                    id="verificationCode"
                    label="Verification Code"
                    placeholder="Enter 6-digit code"
                    formattedText={verificationCode}
                    onChangeText={(text) => {
                      // Only allow numbers and limit to 6 digits
                      const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                      setVerificationCode(numericText);
                      setVerificationError('');
                      setGeneralError('');
                    }}
                    errorMessage={verificationError}
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={6}
                    returnKeyType="done"
                    onSubmitEditing={handleVerification}
                  />

                  {generalError ? (
                    <View style={styles.errorContainer}>
                      <CustomText color={COLORS.red} style={styles.errorText}>
                        {generalError}
                      </CustomText>
                    </View>
                  ) : null}

                  <CustomButton
                    title="Verify"
                    onPress={handleVerification}
                    disabled={confirmMutation.isPending || loginMutation.isPending || verificationCode.length !== 6}
                    style={styles.registerButton}
                  />

                  {(confirmMutation.isPending || loginMutation.isPending) && (
                    <View style={styles.loadingContainer}>
                      <CustomText color={COLORS.grey} style={styles.loadingText}>
                        {confirmMutation.isPending ? 'Verifying...' : 'Signing you in...'}
                      </CustomText>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: PADDING * 2,
    justifyContent: 'center',
  },
  header: {
    marginBottom: PADDING * 3,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: PADDING,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.grey,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  errorContainer: {
    marginTop: PADDING,
    marginBottom: PADDING,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: PADDING * 2,
    width: '100%',
  },
  loadingContainer: {
    marginTop: PADDING,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: PADDING * 2,
  },
  loginLinkText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

