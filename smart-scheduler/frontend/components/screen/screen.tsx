import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from 'constants/colors';
import { UserProfileButton } from '../user-profile-button';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  showUserProfile?: boolean; // Option to show/hide user profile icon
}

export function Screen({ children, style, showUserProfile = true }: ScreenProps) {
  const insets = useSafeAreaInsets();

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
      {children}
      {showUserProfile && <UserProfileButton />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

