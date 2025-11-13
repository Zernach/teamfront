import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePathname, useRouter } from 'expo-router';
import { BackButton } from '../back-button/back-button';
import { HomeButton } from '../home-button';
import { UserAvatar } from '../user-avatar';
import { UserMenu } from '../user-menu';
import { CustomText } from '../custom-text/CustomText';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { clearAuth } from '../../store/authSlice';
import { authApi } from '../../services/api/authApi';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  showBackButton?: boolean;
  title?: string;
}

export function Screen({ children, style, showBackButton, title }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const canGoBack = navigation.canGoBack();
  const shouldShowBackButton = showBackButton === true && canGoBack;
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isHomeScreen = pathname === '/' || pathname === '/index';
  const isAuthScreen = pathname === '/auth/login' || pathname === '/auth/signup';
  const [isUserMenuVisible, setUserMenuVisible] = useState(false);

  const userEmail = user?.email ?? '';
  const shouldRenderUserMenu = isAuthenticated && userEmail.length > 0;

  const handleAvatarPress = useCallback(() => {
    setUserMenuVisible((prev) => !prev);
  }, []);

  const handleDismissUserMenu = useCallback(() => {
    setUserMenuVisible(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      handleDismissUserMenu();
      dispatch(clearAuth());
      router.replace('/auth/login');
    }
  }, [dispatch, handleDismissUserMenu, router]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
    >
      {/* Inline header with back button, app icon, and title */}
      {!isAuthScreen && (
        <View style={styles.headerBar}>
          <View style={styles.leftSection}>
            {shouldShowBackButton && <BackButton style={styles.backButton} />}
            {!isHomeScreen && <HomeButton size={36} />}
            {title && (
              <CustomText style={styles.titleText}>
                {title}
              </CustomText>
            )}
          </View>
          {shouldRenderUserMenu && (
            <View style={styles.rightSection}>
              <UserAvatar size={40} onPress={handleAvatarPress} />
            </View>
          )}
        </View>
      )}
      {shouldRenderUserMenu && (
        <UserMenu
          visible={isUserMenuVisible}
          email={userEmail}
          onDismiss={handleDismissUserMenu}
          onSignOut={handleSignOut}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginHorizontal: 0,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
  },
});

