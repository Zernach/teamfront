import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  showCountdown?: boolean;
  onDismiss?: () => void;
}

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  showCountdown = false,
  onDismiss,
}: ToastProps) {
  const [countdown, setCountdown] = useState(Math.ceil(duration / 1000));
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset countdown when toast becomes visible
      setCountdown(Math.ceil(duration / 1000));

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Countdown timer
      let interval: ReturnType<typeof setInterval> | null = null;
      if (showCountdown) {
        interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, duration, showCountdown, fadeAnim]);

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return COLORS.primary;
      case 'error':
        return COLORS.red;
      case 'info':
      default:
        return COLORS.grey;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
      {showCountdown && countdown > 0 && (
        <Text style={styles.countdown}>{countdown}s</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  message: {
    flex: 1,
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  countdown: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    opacity: 0.8,
  },
});
