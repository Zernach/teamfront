import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { CustomText } from '../custom-text/CustomText';
import { CustomButton } from '../custom-button';
import { COLORS } from '../../constants/colors';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { clearAuth } from '../../store/authSlice';
import { authService } from '../../services/authService';

interface UserProfileButtonProps {
  style?: any;
}

export function UserProfileButton({ style }: UserProfileButtonProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  if (!user) {
    return null;
  }

  // Extract first letter from email (fallback to 'U' if no email)
  const getInitial = () => {
    if (user.email && user.email.length > 0) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleSignOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setMenuVisible(false);
      // Clear auth state - AuthGuard will automatically redirect to login
      dispatch(clearAuth());
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.iconContainer, style]}
        onPress={() => setMenuVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.iconCircle}>
          <CustomText style={styles.iconText}>{getInitial()}</CustomText>
        </View>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <View style={styles.menuContent}>
                  <View style={styles.emailContainer}>
                    <CustomText style={styles.emailLabel}>Email:</CustomText>
                    <CustomText style={styles.emailText}>{user.email}</CustomText>
                  </View>
                  <View style={styles.divider} />
                  <CustomButton
                    title="Sign Out"
                    onPress={handleSignOut}
                    variant="outline"
                    style={styles.signOutButton}
                    textColor={COLORS.error}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.tan50,
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuContainer: {
    minWidth: 200,
  },
  menuContent: {
    backgroundColor: COLORS.darkBrown,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.tan50,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emailContainer: {
    marginBottom: 12,
  },
  emailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.tan50,
    marginVertical: 12,
  },
  signOutButton: {
    borderColor: COLORS.error,
  },
});

