import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '../back-button/back-button';
import { Colors } from '../../constants/colors';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  showBackButton?: boolean;
}

export function Screen({ children, style, showBackButton }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  const shouldShowBackButton = showBackButton === true && canGoBack;

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
      {shouldShowBackButton && (
        <View style={[styles.backButtonContainer, { top: insets.top }]}>
          <BackButton />
        </View>
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
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
  },
});

