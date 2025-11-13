import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { CustomText } from '../custom-text/CustomText';
import { CustomButton } from '../custom-button';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface UserMenuProps {
  visible: boolean;
  email: string;
  onDismiss: () => void;
  onSignOut: () => void;
}

export function UserMenu({ visible, email, onDismiss, onSignOut }: UserMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View style={styles.menuContainer}>
          <View style={styles.menuContent}>
            <CustomText color={Colors.textSecondary} style={styles.menuLabel}>
              Signed in as
            </CustomText>
            <CustomText color={Colors.text} style={styles.menuEmail} numberOfLines={1}>
              {email}
            </CustomText>
            <CustomButton
              title="Sign Out"
              variant="outline"
              onPress={onSignOut}
              style={styles.signOutButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: Spacing.xl + Spacing.sm,
    right: Spacing.md,
  },
  menuContent: {
    minWidth: 240,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  menuLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  menuEmail: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: Spacing.md,
  },
});


