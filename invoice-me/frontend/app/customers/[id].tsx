// app/customers/[id].tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { customerApi, CustomerDetail } from '../../services/api/customerApi';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Text } from 'react-native';
import { Screen } from '../../components/screen';

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCustomer = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await customerApi.getCustomerById(id);
      setCustomer(data);
    } catch (error) {
      console.error('Error loading customer:', error);
      Alert.alert('Error', 'Failed to load customer details');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      loadCustomer();
    }
  }, [id, loadCustomer]);

  // Reload customer data when screen comes into focus (e.g., after editing)
  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        loadCustomer();
      }
    }, [id, loadCustomer])
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await customerApi.deleteCustomer(id!);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer</Text>
          <TouchableOpacity onPress={() => router.push(`/customers/${id}/edit`)}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.name}>{customer.fullName}</Text>
            <Text style={styles.email}>{customer.email}</Text>
            {customer.phone && (
              <Text style={styles.phone}>{customer.phone}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Address</Text>
            <Text style={styles.address}>
              {customer.street}
              {'\n'}
              {customer.city}, {customer.state} {customer.zipCode}
              {'\n'}
              {customer.country}
            </Text>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{customer.status}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Invoiced</Text>
              <Text style={styles.summaryValue}>
                ${customer.totalInvoiced?.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={styles.summaryValue}>
                ${customer.totalPaid?.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Outstanding</Text>
              <Text style={[styles.summaryValue, styles.outstanding]}>
                ${(customer.outstandingBalance ?? 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Active Invoices</Text>
              <Text style={styles.summaryValue}>
                {customer.activeInvoicesCount}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/invoices/new?customerId=${id}`)}
            >
              <Text style={styles.actionButtonText}>Create Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Delete Customer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.background,
  },
  container: {
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  editButton: {
    fontSize: 16,
    color: Colors.primary,
  },
  content: {
    padding: Spacing.md,
  },
  section: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  phone: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  address: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 16,
    color: Colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  outstanding: {
    color: Colors.error,
  },
  actions: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.error,
  },
});

