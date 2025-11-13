import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useAppSelector } from '../../hooks/redux';

interface UserAvatarProps {
  size?: number;
  onPress?: () => void;
}

export function UserAvatar({ size = 40, onPress }: UserAvatarProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return null;
  }

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(user.fullName || user.email);
  const backgroundColor = Colors.grey;

  const avatarContent = (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.4,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return avatarContent;
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: Colors.background,
    fontWeight: '600',
  },
});

