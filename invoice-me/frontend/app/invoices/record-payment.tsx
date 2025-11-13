// app/invoices/record-payment.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { invoiceApi, InvoiceSummary, RecordPaymentRequest } from '../../services/api/invoiceApi';
import { showToast } from '../../store/toastSlice';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Text } from 'react-native';
import { Screen } from '../../components/screen';
import { CustomList } from '../../components/custom-list/custom-list';

const PAYMENT_METHODS: Array<'CASH' | 'CHECK' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER'> = [
  'CASH',
  'CHECK',
  'CREDIT_CARD',
  'BANK_TRANSFER',
  'OTHER',
];

type Step = 'select-invoice' | 'enter-payment';

export default function RecordPaymentStandaloneScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [step, setStep] = useState<Step>('select-invoice');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Payment form fields
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CHECK' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER'>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      // Load only SENT invoices with outstanding balance
      const data = await invoiceApi.listInvoices({
        status: 'SENT',
        pageSize: 100,
      });
      // Filter to only show invoices with balance > 0
      const unpaidInvoices = data.invoices.filter(inv => inv.balance > 0);
      setInvoices(unpaidInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleSelectInvoice = (invoice: InvoiceSummary) => {
    setSelectedInvoice(invoice);
    setAmount(invoice.balance.toString());
    setStep('enter-payment');
  };

  const handleBackToSelect = () => {
    setStep('select-invoice');
    setSelectedInvoice(null);
    setAmount('');
    setReferenceNumber('');
    setNotes('');
  };

  const handleSetFullAmount = () => {
    if (selectedInvoice) {
      setAmount(selectedInvoice.balance.toString());
    }
  };

  const handleSetHalfAmount = () => {
    if (selectedInvoice) {
      setAmount((selectedInvoice.balance / 2).toFixed(2));
    }
  };

  const handleSubmit = async () => {
    if (!selectedInvoice) return;

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert('Validation Error', 'Payment amount must be greater than zero');
      return;
    }

    if (paymentAmount > selectedInvoice.balance) {
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

      await invoiceApi.recordPayment(selectedInvoice.id, request);
      
      // Show success toast and navigate back
      dispatch(showToast({
        message: 'Payment recorded successfully',
        type: 'success',
        duration: 3000,
      }));
      router.back();
    } catch (error: any) {
      dispatch(showToast({
        message: error.message || 'Failed to record payment',
        type: 'error',
        duration: 4000,
      }));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderInvoiceItem = useCallback(
    ({ item }: { item: InvoiceSummary }) => (
      <TouchableOpacity
        style={styles.invoiceItem}
        onPress={() => handleSelectInvoice(item)}
      >
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceNumber}>
            {item.invoiceNumber || 'DRAFT'}
          </Text>
          <Text style={styles.invoiceBalance}>
            {formatCurrency(item.balance)}
          </Text>
        </View>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <View style={styles.invoiceFooter}>
          <Text style={styles.invoiceDate}>Due: {formatDate(item.dueDate)}</Text>
          {item.overdue && (
            <Text style={styles.overdueLabel}>OVERDUE</Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    []
  );

  // Step 1: Select Invoice
  if (step === 'select-invoice') {
    return (
      <Screen style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Invoice</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by invoice # or customer..."
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filteredInvoices.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'No invoices match your search'
                : 'No outstanding invoices found'}
            </Text>
          </View>
        ) : (
          <CustomList
            flatListProps={{
              data: filteredInvoices,
              renderItem: renderInvoiceItem,
              keyExtractor: (item: InvoiceSummary) => item.id,
              contentContainerStyle: styles.listContent,
            }}
          />
        )}
      </Screen>
    );
  }

  // Step 2: Enter Payment Details
  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToSelect}>
          <Text style={styles.cancelButton}>← Back</Text>
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

      <CustomList
        scrollViewProps={{
          contentContainerStyle: styles.scrollContent,
        }}
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Information</Text>
            <Text style={styles.textContent}>
              Invoice: {selectedInvoice?.invoiceNumber || 'DRAFT'}
            </Text>
            <Text style={styles.textContent}>
              Customer: {selectedInvoice?.customerName}
            </Text>
            <Text style={styles.balanceLabel}>Balance Due:</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(selectedInvoice?.balance || 0)}
            </Text>
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
      </CustomList>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
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
    width: 60,
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
    width: 60,
    textAlign: 'right',
  },
  searchContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  listContent: {
    padding: Spacing.md,
  },
  invoiceItem: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  invoiceBalance: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  customerName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  overdueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
    backgroundColor: Colors.error + '20',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
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

