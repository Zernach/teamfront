import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomTitle } from 'components/custom-title';
import { CustomText } from 'components/custom-text/CustomText';
import { CustomCard } from 'components/custom-card/custom-card';
import { CustomTextInput } from 'components/custom-text-input/CustomTextInput';
import { CustomButton } from 'components/custom-button';
import { COLORS } from 'constants/colors';
import { contractorService } from 'services/contractorService';
import { ContractorListItem, ContractorType, PagedResult } from 'services/types/contractor';
import { PADDING } from 'constants/styles/commonStyles';
import { Feather } from '@expo/vector-icons';
import { Screen } from 'components/screen';

export default function ContractorListScreen() {
  const router = useRouter();
  const [contractors, setContractors] = useState<ContractorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalPages: 1 });

  useEffect(() => {
    loadContractors();
  }, [searchName]);

  const loadContractors = async (page = 1) => {
    setLoading(true);
    try {
      const result: PagedResult<ContractorListItem> = await contractorService.listContractors({
        name: searchName || undefined,
        page,
        pageSize: 20,
      });
      setContractors(result.items);
      setPagination({
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load contractors');
    } finally {
      setLoading(false);
    }
  };

  const handleContractorPress = (id: string) => {
    router.push(`/screens/contractors/detail?id=${id}`);
  };

  const handleCreate = () => {
    router.push('/screens/contractors/create');
  };

  const typeLabels: Record<ContractorType, string> = {
    [ContractorType.Flooring]: 'Flooring',
    [ContractorType.Tile]: 'Tile',
    [ContractorType.Carpet]: 'Carpet',
    [ContractorType.Multi]: 'Multi',
  };

  const renderContractor = ({ item }: { item: ContractorListItem }) => (
    <TouchableOpacity onPress={() => handleContractorPress(item?.id)}>
      <CustomCard
        renderHeader={<View />}
        renderMiddle={
          <View style={styles.contractorCard}>
            <View style={styles.contractorHeader}>
              <CustomText style={styles.contractorName}>{item.name}</CustomText>
              <View style={styles.badge}>
                <CustomText style={styles.badgeText}>{typeLabels[item.type]}</CustomText>
              </View>
            </View>
            <CustomText style={styles.contractorInfo}>{item.email}</CustomText>
            <CustomText style={styles.contractorInfo}>{item.phoneNumber}</CustomText>
            <View style={styles.contractorFooter}>
              <CustomText style={styles.location}>
                {item.city}, {item.state}
              </CustomText>
              <View style={styles.rating}>
                <Feather name="star" size={16} color={COLORS.yellow || '#FFD700'} />
                <CustomText style={styles.ratingText}>{item.rating?.toFixed(1)}</CustomText>
              </View>
            </View>
          </View>
        }
        renderFooter={<View />}
      />
    </TouchableOpacity>
  );

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <CustomTitle title="Contractors" style={styles.title} />
        <CustomButton title="+ Add" onPress={handleCreate} style={styles.addButton} />
      </View>

      <View style={styles.searchContainer}>
        <CustomTextInput
          placeholder="Search by name..."
          value={searchName}
          onChangeText={setSearchName}
          style={styles.searchInput}
        />
        {searchName.length > 0 && (
          <TouchableOpacity onPress={() => setSearchName('')} style={styles.clearButton}>
            <Feather name="x" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      ) : contractors.length === 0 ? (
        <View style={styles.center}>
          <CustomText>No contractors found</CustomText>
        </View>
      ) : (
        <>
          <FlatList
            data={contractors}
            renderItem={renderContractor}
            keyExtractor={(item) => item?.id}
            contentContainerStyle={styles.list}
            onRefresh={() => loadContractors(pagination.page)}
            refreshing={loading}
          />
          {pagination.totalPages > 1 && (
            <View style={styles.pagination}>
              <CustomButton
                title="Previous"
                onPress={() => loadContractors(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={styles.paginationButton}
              />
              <CustomText style={styles.pageInfo}>
                Page {pagination.page} of {pagination.totalPages}
              </CustomText>
              <CustomButton
                title="Next"
                onPress={() => loadContractors(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                style={styles.paginationButton}
              />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: PADDING.md,
  },
  title: {
    flex: 1,
  },
  addButton: {
    minWidth: 80,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: PADDING.md,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
  },
  clearButton: {
    marginLeft: PADDING.sm,
    padding: PADDING.xs,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: PADDING.md,
    gap: PADDING.md,
  },
  contractorCard: {
    padding: PADDING.sm,
  },
  contractorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PADDING.xs,
  },
  contractorName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.blue || '#007AFF',
    paddingHorizontal: PADDING.sm,
    paddingVertical: PADDING.xs,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
  },
  contractorInfo: {
    marginBottom: PADDING.xs,
    color: COLORS.gray || '#999',
  },
  contractorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: PADDING.xs,
  },
  location: {
    color: COLORS.gray || '#999',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PADDING.xs,
  },
  ratingText: {
    color: COLORS.white,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: PADDING.md,
  },
  paginationButton: {
    minWidth: 80,
  },
  pageInfo: {
    color: COLORS.white,
  },
});



