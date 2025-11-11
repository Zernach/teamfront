import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../hooks/redux';
import { useLogout } from '../../hooks/auth';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { CustomButton } from '../custom-button';

export function UserAvatar() {
  const [menuVisible, setMenuVisible] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const logoutMutation = useLogout();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!user) {
    return null;
  }

  // Get user's initial (first letter of email or username)
  const getInitial = () => {
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return '?';
  };

  const handleSignOut = async () => {
    try {
      await logoutMutation.mutateAsync();
      setMenuVisible(false);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.avatarContainer,
          {
            top: insets.top + 16,
          },
        ]}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Pressable
            style={[
              styles.menuContainer,
              {
                top: insets.top + 60,
                right: 16,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.menuContent}>
              <View style={styles.emailContainer}>
                <Text style={styles.emailLabel}>Email</Text>
                <Text style={styles.emailText}>{user.email}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <CustomButton
                title="Sign Out"
                onPress={handleSignOut}
                disabled={logoutMutation.isPending}
                variant="outline"
                style={styles.signOutButton}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 1000,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.tan50,
  },
  avatarText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    minWidth: 200,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.tan50,
  },
  menuContent: {
    padding: 16,
  },
  emailContainer: {
    marginBottom: 12,
  },
  emailLabel: {
    color: COLORS.grey,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emailText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.tan50,
    marginVertical: 12,
  },
  signOutButton: {
    width: '100%',
  },
});

