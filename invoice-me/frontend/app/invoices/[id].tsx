// app/invoices/[id].tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { invoiceApi, InvoiceDetail } from '../../services/api/invoiceApi';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Text } from 'react-native';
import { Screen } from '../../components/screen';
import { PaymentList } from '../../components/payment-list';

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInvoice = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await invoiceApi.getInvoiceById(id);
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
      Alert.alert('Error', 'Failed to load invoice');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  // Reload invoice data whenever the screen comes into focus
  // This ensures payment data is refreshed after recording a payment
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadInvoice();
      }
    }, [id, loadInvoice])
  );

  const handleMarkAsSent = async () => {
    if (!invoice) return;
    try {
      await invoiceApi.markInvoiceAsSent(invoice.id);
      loadInvoice();
      Alert.alert('Success', 'Invoice marked as sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark invoice as sent');
    }
  };

  const handleRecordPayment = () => {
    router.push(`/invoices/${id}/record-payment`);
  };

  const handleCancel = () => {
    if (Platform.OS === 'web') {
      const confirmCancel = window.confirm('Are you sure you want to cancel this invoice?');
      if (confirmCancel) {
        (async () => {
          try {
            await invoiceApi.cancelInvoice(invoice!.id, {
              cancellationReason: 'Cancelled by user',
            });
            loadInvoice();
            Alert.alert('Success', 'Invoice cancelled');
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel invoice');
          }
        })();
      }
      return;
    }

    Alert.alert('Cancel Invoice', 'Are you sure you want to cancel this invoice?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await invoiceApi.cancelInvoice(invoice!.id, {
              cancellationReason: 'Cancelled by user',
            });
            loadInvoice();
            Alert.alert('Success', 'Invoice cancelled');
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel invoice');
          }
        },
      },
    ]);
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
          <Text style={styles.text}>Invoice not found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {invoice.invoiceNumber || 'DRAFT'}
          </Text>
          <View style={styles.headerActions}>
            {invoice.status === 'DRAFT' && (
              <TouchableOpacity onPress={() => router.push(`/invoices/${id}/edit`)}>
                <Text style={styles.actionButton}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
                {invoice.status}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <Text style={styles.text}>{invoice.customer?.fullName || 'Unknown'}</Text>
            <Text style={styles.textSecondary}>{invoice.customer?.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice Date:</Text>
              <Text style={styles.detailValue}>{formatDate(invoice.invoiceDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Line Items</Text>
            {invoice.lineItems.map((item, index) => (
              <View key={index} style={styles.lineItem}>
                <Text style={styles.lineItemDescription}>{item.description}</Text>
                <View style={styles.lineItemDetails}>
                  <Text style={styles.lineItemText}>
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </Text>
                  <Text style={styles.lineItemTotal}>{formatCurrency(item.lineTotal)}</Text>
                </View>
              </View>
            ))}
            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax:</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.totalAmount)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Paid:</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.paidAmount)}</Text>
              </View>
              <View style={[styles.totalRow, styles.balanceRow]}>
                <Text style={styles.balanceLabel}>Balance:</Text>
                <Text style={styles.balanceValue}>{formatCurrency(invoice.balance)}</Text>
              </View>
            </View>
          </View>

          {(invoice.status === 'SENT' || invoice.status === 'PAID') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment History</Text>
              <PaymentList 
                key={`payments-${invoice.id}-${invoice.paidAmount}`}
                invoiceId={invoice.id} 
                onPaymentVoided={loadInvoice}
              />
            </View>
          )}

          {invoice.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.text}>{invoice.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {invoice.status === 'DRAFT' && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleMarkAsSent}>
              <Text style={styles.primaryButtonText}>Mark as Sent</Text>
            </TouchableOpacity>
          )}
          {invoice.status === 'SENT' && invoice.balance > 0 && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleRecordPayment}>
              <Text style={styles.primaryButtonText}>Record Payment</Text>
            </TouchableOpacity>
          )}
          {(invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
            <TouchableOpacity style={styles.dangerButton} onPress={handleCancel}>
              <Text style={styles.dangerButtonText}>Cancel Invoice</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'DRAFT':
      return Colors.textSecondary;
    case 'SENT':
      return Colors.primary;
    case 'PAID':
      return Colors.success;
    case 'CANCELLED':
      return Colors.error;
    default:
      return Colors.text;
  }
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
  backButton: {
    fontSize: 16,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  textSecondary: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  lineItem: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  lineItemDescription: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  lineItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineItemText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  lineItemTotal: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  totals: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  balanceRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  actions: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: Colors.error,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

