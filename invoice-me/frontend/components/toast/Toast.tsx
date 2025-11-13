import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { RootState } from '../../store';
import { hideToast } from '../../store/toastSlice';
import { CustomText } from '../custom-text/CustomText';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export const Toast = () => {
  const dispatch = useDispatch();
  const toast = useSelector((state: RootState) => state.toast);
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toast.visible) {
      // Animate in
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto hide after duration
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(dispatch)(hideToast());
          }
        });
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.visible, toast.duration, dispatch]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!toast.visible) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      case 'info':
        return Colors.info;
      default:
        return Colors.success;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.toast, { backgroundColor: getBackgroundColor() }]}>
        <CustomText style={styles.message}>{toast.message}</CustomText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

