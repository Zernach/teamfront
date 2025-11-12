// app/customers/index.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export default function CustomerListScreen() {
  console.log('🔄 CustomerListScreen RENDER');

  const router = useRouter();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  // Get customers from Redux store
  const reduxCustomers = useAppSelector((state) => {
    const customers = state.customers.customers;
    console.log('🔴 Redux selector called', { customersLength: customers.length });
    return customers;
  });
  const [localCustomers, setLocalCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const hasLoadedRef = useRef(false);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Use Redux customers when no search/filter is applied, otherwise use local state
  const customers = searchTerm || statusFilter !== 'ALL' ? localCustomers : reduxCustomers;

  console.log('📊 State values:', {
    searchTerm,
    statusFilter,
    loading,
    reduxCustomersLength: reduxCustomers.length,
    localCustomersLength: localCustomers.length,
    hasLoadedRef: hasLoadedRef.current,
    pageNumber,
    hasMore,
    customersLength: customers.length,
  });

  const loadCustomers = useCallback(async (page = 0, currentSearchTerm?: string, currentStatusFilter?: string) => {
    const search = currentSearchTerm !== undefined ? currentSearchTerm : searchTerm;
    const filter = currentStatusFilter !== undefined ? currentStatusFilter : statusFilter;

    console.log('🚀 loadCustomers CALLED', {
      page,
      currentSearchTerm,
      currentStatusFilter,
      search,
      filter,
      searchTerm,
      statusFilter,
      hasLoadedRef: hasLoadedRef.current,
    });

    try {
      console.log('⏳ setLoading(true)');
      setLoading(true);

      console.log('📡 API call starting...', {
        searchTerm: search || undefined,
        status: filter !== 'ALL' ? filter : undefined,
        pageNumber: page,
      });

      const response = await customerApi.listCustomers({
        searchTerm: search || undefined,
        status: filter !== 'ALL' ? filter : undefined,
        pageNumber: page,
        pageSize: 20,
        sortBy: 'name',
        sortDirection: 'ASC',
      });

      console.log('✅ API call completed', {
        customersCount: response.customers.length,
        pageNumber: response.pageNumber,
        totalPages: response.totalPages,
      });

      if (page === 0) {
        if (search || filter !== 'ALL') {
          // For filtered/searched results, use local state
          console.log('💾 Setting localCustomers (filtered)', response.customers.length);
          setLocalCustomers(response.customers);
        } else {
          // For unfiltered results, update Redux store
          console.log('💾 Dispatching setCustomers to Redux', response.customers.length);
          dispatch(setCustomers(response.customers));
          hasLoadedRef.current = true;
          console.log('✅ hasLoadedRef set to true');
        }
      } else {
        // Pagination: append to local state (only used for filtered/searched results)
        console.log('💾 Appending to localCustomers (pagination)');
        setLocalCustomers((prev) => {
          console.log('📝 Previous localCustomers length:', prev.length);
          const newList = [...prev, ...response.customers];
          console.log('📝 New localCustomers length:', newList.length);
          return newList;
        });
      }

      setHasMore(response.pageNumber < response.totalPages - 1);
      setPageNumber(response.pageNumber);
      console.log('📄 Updated pagination state', {
        hasMore: response.pageNumber < response.totalPages - 1,
        pageNumber: response.pageNumber,
      });
    } catch (error) {
      console.error('❌ Error loading customers:', error);
    } finally {
      console.log('⏳ setLoading(false)');
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dispatch]);

  // Initial load: only run once on mount if Redux is empty
  useEffect(() => {
    console.log('🎯 INITIAL LOAD useEffect', {
      searchTerm,
      statusFilter,
      reduxCustomersLength: reduxCustomers.length,
      hasLoadedRef: hasLoadedRef.current,
    });

    if (!searchTerm && statusFilter === 'ALL' && reduxCustomers.length === 0 && !hasLoadedRef.current) {
      console.log('✅ Initial load condition met - calling loadCustomers');
      loadCustomers(0, '', 'ALL');
    } else {
      console.log('⏭️ Initial load skipped', {
        hasSearchTerm: !!searchTerm,
        isAllFilter: statusFilter === 'ALL',
        reduxEmpty: reduxCustomers.length === 0,
        alreadyLoaded: hasLoadedRef.current,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle search/filter changes
  useEffect(() => {
    console.log('🔍 FILTER CHANGE useEffect', {
      searchTerm: debouncedSearchTerm,
      statusFilter,
      reduxCustomersLength: reduxCustomers.length,
      hasLoadedRef: hasLoadedRef.current,
    });

    if (debouncedSearchTerm || statusFilter !== 'ALL') {
      // Load filtered/searched customers
      console.log('✅ Filter/search active - calling loadCustomers');
      loadCustomers(0, debouncedSearchTerm, statusFilter);
    } else {
      // No search/filter - use Redux data, just ensure loading is false
      console.log('⏭️ No filter/search - using Redux, setting loading to false');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, statusFilter]);

  const handleLoadMore = () => {
    console.log('📄 handleLoadMore called', { loading, hasMore, pageNumber });
    if (!loading && hasMore) {
      console.log('✅ Loading more customers');
      loadCustomers(pageNumber + 1);
    } else {
      console.log('⏭️ Load more skipped', { loading, hasMore });
    }
  };

  const handleRefresh = () => {
    console.log('🔄 handleRefresh called');
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
          onChangeText={(text) => {
            console.log('🔤 searchTerm onChangeText:', text);
            setSearchTerm(text);
          }}
          placeholderTextColor={Colors.textSecondary}
        />
        <View style={styles.filterRow}>
          <FilterButtons
            options={['ALL', 'ACTIVE', 'INACTIVE']}
            selectedValue={statusFilter}
            onSelect={(value) => {
              console.log('🔘 statusFilter onSelect:', value);
              setStatusFilter(value);
            }}
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

