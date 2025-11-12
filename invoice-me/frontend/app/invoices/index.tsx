// app/invoices/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { invoiceApi, InvoiceSummary, ListInvoicesParams } from '../../services/api/invoiceApi';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Text } from 'react-native';
import { Screen } from '../../components/screen';
import { FilterButtons } from '../../components/filter-buttons';

export default function InvoiceListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'>('ALL');
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadInvoices = useCallback(async (page = 0) => {
    try {
      setLoading(page === 0);
      const params: ListInvoicesParams = {
        pageNumber: page,
        pageSize: 20,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      };
      const response = await invoiceApi.listInvoices(params);
      if (page === 0) {
        setInvoices(response.invoices);
      } else {
        // Use functional update to avoid stale closure
        setInvoices((prev) => [...prev, ...response.invoices]);
      }
      setHasMore(response.pageNumber < response.totalPages - 1);
      setPageNumber(response.pageNumber);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadInvoices(0);
  }, [loadInvoices]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPageNumber(0);
    loadInvoices(0);
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = pageNumber + 1;
      loadInvoices(nextPage);
    }
  }, [loading, hasMore, pageNumber, loadInvoices]);

  const filteredInvoices = invoices.filter((invoice) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.customerName.toLowerCase().includes(searchLower) ||
        invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
        false
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return Colors.textSecondary;
      case 'SENT':
        return Colors.primary;
      case 'PAID':
        return Colors.success;
      case 'CANCELLED':
        return Colors.textSecondary;
      default:
        return Colors.text;
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

  const renderInvoiceItem = ({ item }: { item: InvoiceSummary }) => (
    <TouchableOpacity
      style={styles.invoiceCard}
      onPress={() => router.push(`/invoices/${item.id}`)}
    >
      <View style={styles.invoiceHeader}>
        <View>
          <Text style={styles.invoiceNumber}>
            {item.invoiceNumber || 'DRAFT'}
          </Text>
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.invoiceDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{formatDate(item.invoiceDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Due:</Text>
          <Text style={[styles.detailValue, item.overdue && styles.overdue]}>
            {formatDate(item.dueDate)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total:</Text>
          <Text style={styles.detailValue}>{formatCurrency(item.totalAmount)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Balance:</Text>
          <Text style={[styles.detailValue, styles.balance]}>
            {formatCurrency(item.balance)}
          </Text>
        </View>
      </View>
      {item.overdue && (
        <View style={styles.overdueBadge}>
          <Text style={styles.overdueText}>OVERDUE</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Screen style={{ backgroundColor: Colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Invoices</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/invoices/new')}
          >
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filters}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoices..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={Colors.textSecondary}
          />
          <View style={styles.statusFilters}>
            <FilterButtons
              options={['ALL', 'DRAFT', 'SENT', 'PAID']}
              selectedValue={statusFilter}
              onSelect={(value) => setStatusFilter(value as typeof statusFilter)}
            />
          </View>
        </View>

        {loading && invoices.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredInvoices}
            renderItem={renderInvoiceItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No invoices found</Text>
              </View>
            }
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    marginRight: Spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginLeft: Spacing.md,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  filters: {
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
    marginBottom: Spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  list: {
    padding: Spacing.md,
  },
  invoiceCard: {
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
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  customerName: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  invoiceDetails: {
    marginTop: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
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
  balance: {
    color: Colors.primary,
    fontWeight: '600',
  },
  overdue: {
    color: Colors.error,
  },
  overdueBadge: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: Colors.error + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  overdueText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

