// app/customers/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { customerApi, CustomerSummary } from '../../services/api/customerApi';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Screen } from '../../components/screen';

export default function CustomerListScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, [searchTerm, statusFilter]);

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
        setCustomers(response.customers);
      } else {
        setCustomers((prev) => [...prev, ...response.customers]);
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
              ${item.outstandingBalance.toFixed(2)}
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
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={Colors.textSecondary}
        />
        <View style={styles.filterRow}>
          {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                statusFilter === status && styles.filterButtonActive,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  statusFilter === status && styles.filterButtonTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/customers/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
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
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: Colors.surface,
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
  fab: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: Colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

// Add Text import
import { Text } from 'react-native';

