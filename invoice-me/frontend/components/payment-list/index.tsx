import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import { CustomText } from '../custom-text/CustomText';
import { CustomList } from '../custom-list/custom-list';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { paymentApi, PaymentDetail } from '../../services/api/paymentApi';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface PaymentListProps {
  invoiceId: string;
  onPaymentVoided?: () => void;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  invoiceId,
  onPaymentVoided,
}) => {
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = useCallback(async () => {
    try {
      const data = await paymentApi.listPaymentsForInvoice({ invoiceId });
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Error', 'Failed to load payment history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPayments();
  }, [loadPayments]);

  const handleVoidPayment = useCallback(
    async (paymentId: string) => {
      const confirmVoid =
        Platform.OS === 'web'
          ? window.confirm('Are you sure you want to void this payment? This action cannot be undone.')
          : false;

      const performVoid = async (reason: string) => {
        try {
          await paymentApi.voidPayment(paymentId, { voidReason: reason });
          Alert.alert('Success', 'Payment voided successfully');
          loadPayments();
          onPaymentVoided?.();
        } catch (error) {
          console.error('Error voiding payment:', error);
          Alert.alert('Error', 'Failed to void payment');
        }
      };

      if (Platform.OS === 'web') {
        if (confirmVoid) {
          const reason = window.prompt('Please enter a reason for voiding this payment:');
          if (reason && reason.trim()) {
            await performVoid(reason.trim());
          }
        }
      } else {
        Alert.alert(
          'Void Payment',
          'Are you sure you want to void this payment? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Void',
              style: 'destructive',
              onPress: () => {
                Alert.prompt(
                  'Void Reason',
                  'Please enter a reason for voiding this payment:',
                  async (reason) => {
                    if (reason && reason.trim()) {
                      await performVoid(reason.trim());
                    }
                  }
                );
              },
            },
          ]
        );
      }
    },
    [loadPayments, onPaymentVoided]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPaymentMethod = (method: string) => {
    return method.replace(/_/g, ' ');
  };

  const renderPaymentItem = useCallback(
    ({ item }: { item: PaymentDetail }) => (
      <View style={styles.paymentItem}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentHeaderLeft}>
            <CustomText style={styles.paymentAmount}>
              {formatCurrency(item.amount)}
            </CustomText>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === 'VOIDED' ? Colors.error + '20' : Colors.success + '20',
                },
              ]}
            >
              <CustomText
                style={[
                  styles.statusText,
                  { color: item.status === 'VOIDED' ? Colors.error : Colors.success },
                ]}
              >
                {item.status}
              </CustomText>
            </View>
          </View>
          {item.status === 'APPLIED' && (
            <TouchableOpacity onPress={() => handleVoidPayment(item.id)}>
              <CustomText style={styles.voidButton}>Void</CustomText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <CustomText style={styles.detailLabel}>Payment Date:</CustomText>
            <CustomText style={styles.detailValue}>
              {formatDate(item.paymentDate)}
            </CustomText>
          </View>
          <View style={styles.detailRow}>
            <CustomText style={styles.detailLabel}>Method:</CustomText>
            <CustomText style={styles.detailValue}>
              {formatPaymentMethod(item.paymentMethod)}
            </CustomText>
          </View>
          {item.referenceNumber && (
            <View style={styles.detailRow}>
              <CustomText style={styles.detailLabel}>Reference:</CustomText>
              <CustomText style={styles.detailValue}>{item.referenceNumber}</CustomText>
            </View>
          )}
          {item.notes && (
            <View style={styles.detailRow}>
              <CustomText style={styles.detailLabel}>Notes:</CustomText>
              <CustomText style={styles.detailValue}>{item.notes}</CustomText>
            </View>
          )}
          {item.status === 'VOIDED' && (
            <>
              <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>Voided Date:</CustomText>
                <CustomText style={styles.detailValue}>
                  {item.voidedAt ? formatDate(item.voidedAt) : 'N/A'}
                </CustomText>
              </View>
              <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>Voided By:</CustomText>
                <CustomText style={styles.detailValue}>{item.voidedBy || 'N/A'}</CustomText>
              </View>
              {item.voidReason && (
                <View style={styles.detailRow}>
                  <CustomText style={styles.detailLabel}>Void Reason:</CustomText>
                  <CustomText style={styles.detailValue}>{item.voidReason}</CustomText>
                </View>
              )}
            </>
          )}
        </View>

        <CustomText style={styles.createdInfo}>
          Created on {formatDate(item.createdAt)} by {item.createdBy}
        </CustomText>
      </View>
    ),
    [handleVoidPayment]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner animating={true} color={Colors.primary} />
      </View>
    );
  }

  if (payments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <CustomText style={styles.emptyText}>No payments recorded yet</CustomText>
      </View>
    );
  }

  return (
    <CustomList
      flatListProps={{
        data: payments,
        renderItem: renderPaymentItem,
        keyExtractor: (item: PaymentDetail) => item.id,
        refreshing: refreshing,
        onRefresh: handleRefresh,
        ItemSeparatorComponent: () => <View style={styles.separator} />,
        contentContainerStyle: styles.listContent,
      }}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: Spacing.md,
  },
  separator: {
    height: Spacing.md,
  },
  paymentItem: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  voidButton: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
  paymentDetails: {
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  createdInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});

