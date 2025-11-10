// app/index.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Screen } from '../components/screen';
import { CustomList } from '../components/custom-list/custom-list';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { clearAuth } from '../store/authSlice';
import { authApi } from '../services/api/authApi';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state
      dispatch(clearAuth());
      // Navigate after state update completes
      setTimeout(() => {
        router.push('/auth/login');
      }, 0);
    }
  };

  return (
    <Screen style={styles.container}>
      <CustomList
        scrollViewProps={{
          contentContainerStyle: styles.scrollContent,
        }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Invoice Me</Text>
          <Text style={styles.subtitle}>Manage your customers and invoices</Text>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/customers')}
          >
            <Text style={styles.menuIcon}>👥</Text>
            <Text style={styles.menuTitle}>Customers</Text>
            <Text style={styles.menuDescription}>
              Manage your customer database
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/invoices')}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuTitle}>Invoices</Text>
            <Text style={styles.menuDescription}>
              View and manage all invoices
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/invoices/new')}
          >
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuTitle}>Create Invoice</Text>
            <Text style={styles.menuDescription}>
              Create a new invoice for a customer
            </Text>
          </TouchableOpacity>
        </View>

        {isAuthenticated && (
          <View style={styles.signOutContainer}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </CustomList>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  menu: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuItem: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  menuDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signOutContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  signOutButton: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '500',
  },
});
