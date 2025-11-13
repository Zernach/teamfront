import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePathname } from 'expo-router';
import { BackButton } from '../back-button/back-button';
import { HomeButton } from '../home-button';
import { UserAvatar } from '../user-avatar';
import { CustomText } from '../custom-text/CustomText';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useAppSelector } from '../../hooks/redux';

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
  const canGoBack = navigation.canGoBack();
  const shouldShowBackButton = showBackButton === true && canGoBack;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isHomeScreen = pathname === '/' || pathname === '/index';

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
        {isAuthenticated && (
          <View style={styles.rightSection}>
            <UserAvatar size={40} />
          </View>
        )}
      </View>
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

