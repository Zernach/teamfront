// app/customers/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { customerApi, CustomerSummary } from '../../services/api/customerApi';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Screen } from '../../components/screen';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setCustomers } from '../../store/customerSlice';
import { FilterButtons } from '../../components/filter-buttons';

export default function CustomerListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  // Get customers from Redux store
  const reduxCustomers = useAppSelector((state) => state.customers.customers);
  const [localCustomers, setLocalCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Use Redux customers when no search/filter is applied, otherwise use local state
  const customers = searchTerm || statusFilter !== 'ALL' ? localCustomers : reduxCustomers;

  useEffect(() => {
    if (searchTerm || statusFilter !== 'ALL') {
      // Load filtered/searched customers
      loadCustomers();
    } else {
      // When no search/filter, use Redux customers
      // If Redux is empty, load from API
      if (reduxCustomers.length === 0) {
        loadCustomers();
      } else {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, reduxCustomers.length]);

  const loadCustomers = async (page = 0) => {
    try {
      setLoading(true);
      const response = await customerApi.listCustomers({
        searchTerm: searchTerm || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        pageNumber: page,
        pageSize: 20,
        sortBy: 'name',
        sortDirection: 'ASC',
      });

      if (page === 0) {
        if (searchTerm || statusFilter !== 'ALL') {
          // For filtered/searched results, use local state
          setLocalCustomers(response.customers);
        } else {
          // For unfiltered results, update Redux store
          dispatch(setCustomers(response.customers));
        }
      } else {
        // Pagination: append to local state (only used for filtered/searched results)
        setLocalCustomers((prev) => [...prev, ...response.customers]);
      }

      setHasMore(response.pageNumber < response.totalPages - 1);
      setPageNumber(response.pageNumber);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadCustomers(pageNumber + 1);
    }
  };

  const handleRefresh = () => {
    loadCustomers(0);
  };

  const renderCustomerCard = ({ item }: { item: CustomerSummary }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/customers/${item.id}`)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.fullName}</Text>
            <Text style={styles.customerEmail}>{item.email}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.label}>Outstanding</Text>
            <Text style={styles.amount}>
              ${(item.outstandingBalance ?? 0).toFixed(2)}
            </Text>
          </View>
          <View>
            <Text style={styles.label}>Active Invoices</Text>
            <Text style={styles.count}>{item.activeInvoicesCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Customers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/customers/new')}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={Colors.textSecondary}
        />
        <View style={styles.filterRow}>
          <FilterButtons
            options={['ALL', 'ACTIVE', 'INACTIVE']}
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
          />
        </View>
      </View>

      {loading && customers.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomerCard}
          keyExtractor={(item) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onRefresh={handleRefresh}
          refreshing={loading && customers.length > 0}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No customers found. Tap + to add your first customer.
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
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
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  customerEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: Colors.text,
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  count: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

