// app/invoices/[id]/record-payment.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { invoiceApi, InvoiceDetail, RecordPaymentRequest } from '../../../services/api/invoiceApi';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/spacing';
import { Text } from 'react-native';
import { Screen } from '../../../components/screen';

const PAYMENT_METHODS: Array<'CASH' | 'CHECK' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER'> = [
  'CASH',
  'CHECK',
  'CREDIT_CARD',
  'BANK_TRANSFER',
  'OTHER',
];

export default function RecordPaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CHECK' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER'>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await invoiceApi.getInvoiceById(id!);
      setInvoice(data);
      setAmount(data.balance.toString());
    } catch (error) {
      console.error('Error loading invoice:', error);
      Alert.alert('Error', 'Failed to load invoice');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSetFullAmount = () => {
    if (invoice) {
      setAmount(invoice.balance.toString());
    }
  };

  const handleSetHalfAmount = () => {
    if (invoice) {
      setAmount((invoice.balance / 2)?.toFixed(2));
    }
  };

  const handleSubmit = async () => {
    if (!invoice) return;

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert('Validation Error', 'Payment amount must be greater than zero');
      return;
    }

    if (paymentAmount > invoice.balance) {
      Alert.alert('Validation Error', 'Payment amount cannot exceed invoice balance');
      return;
    }

    try {
      setSaving(true);
      const request: RecordPaymentRequest = {
        amount: paymentAmount,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      };

      await invoiceApi.recordPayment(invoice.id, request);
      Alert.alert('Success', 'Payment recorded successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  if (!invoice) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.textContent}>Invoice not found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record Payment</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.saveButton}>Record</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Information</Text>
            <Text style={styles.textContent}>
              Invoice: {invoice.invoiceNumber || 'DRAFT'}
            </Text>
            <Text style={styles.textContent}>Customer: {invoice.customer?.fullName || 'Unknown'}</Text>
            <Text style={styles.balanceLabel}>Balance Due:</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(invoice.balance)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>

            <Text style={styles.label}>Payment Amount *</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textSecondary}
            />
            <View style={styles.quickAmounts}>
              <TouchableOpacity style={styles.quickButton} onPress={handleSetFullAmount}>
                <Text style={styles.quickButtonText}>Full</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickButton} onPress={handleSetHalfAmount}>
                <Text style={styles.quickButtonText}>Half</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Payment Date *</Text>
            <TextInput
              style={styles.input}
              value={paymentDate}
              onChangeText={setPaymentDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>Payment Method *</Text>
            <View style={styles.paymentMethods}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethodOption,
                    paymentMethod === method && styles.paymentMethodOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === method && styles.paymentMethodTextSelected,
                    ]}
                  >
                    {method.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Reference Number</Text>
            <TextInput
              style={styles.input}
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              placeholder="Check #, Transaction ID, etc."
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholder="Additional notes..."
              placeholderTextColor={Colors.textSecondary}
            />
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
    flex: 1,
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
  cancelButton: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  textContent: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  paymentMethodOption: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  paymentMethodOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  paymentMethodText: {
    fontSize: 14,
    color: Colors.text,
  },
  paymentMethodTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

