import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomImage } from '../custom-image/custom-image';

interface AppIconProps {
  size?: number;
  onPress?: () => void;
}

export function AppIcon({ size = 40, onPress }: AppIconProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Replace navigation stack with home screen
      router.replace('/');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <CustomImage
        source={require('../../assets/icon.png')}
        style={[styles.icon, { width: size, height: size }]}
        disableBackground
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  icon: {
    borderRadius: 8,
  },
});

