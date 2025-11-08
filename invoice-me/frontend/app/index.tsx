// app/index.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Screen } from '../components/screen';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Screen style={styles.container}>
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
          onPress={() => router.push('/invoices/new')}
        >
          <Text style={styles.menuIcon}>📄</Text>
          <Text style={styles.menuTitle}>Create Invoice</Text>
          <Text style={styles.menuDescription}>
            Create a new invoice for a customer
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
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
});
