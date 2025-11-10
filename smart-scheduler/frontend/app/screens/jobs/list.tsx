import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomTitle } from 'components/custom-title';
import { CustomText } from 'components/custom-text/CustomText';
import { CustomCard } from 'components/custom-card/custom-card';
import { CustomTextInput } from 'components/custom-text-input/CustomTextInput';
import { CustomButton } from 'components/custom-button';
import { COLORS } from 'constants/colors';
import { jobService, JobListItem, JobType, JobStatus, Priority, PagedResult } from 'services/jobService';
import { PADDING_SIZES } from 'constants/styles/commonStyles';
import { Screen } from 'components/screen';
import { LoadingSpinner } from 'components/loading-spinner/loading-spinner';

export default function JobListScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalPages: 1 });

  useEffect(() => {
    loadJobs();
  }, [search]);

  const loadJobs = async (page = 1) => {
    setLoading(true);
    try {
      const result: PagedResult<JobListItem> = await jobService.getAll({
        search: search || undefined,
        page,
        pageSize: 20,
      });
      setJobs(result.data);
      setPagination({
        page: result.currentPage,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleJobPress = (id: string) => {
    router.push(`/screens/jobs/detail?id=${id}`);
  };

  const handleCreate = () => {
    router.push('/screens/jobs/create');
  };

  const typeLabels: Record<JobType, string> = {
    [JobType.Flooring]: 'Flooring',
    [JobType.Tile]: 'Tile',
    [JobType.Carpet]: 'Carpet',
  };

  const statusLabels: Record<JobStatus, string> = {
    [JobStatus.Open]: 'Open',
    [JobStatus.Assigned]: 'Assigned',
    [JobStatus.InProgress]: 'In Progress',
    [JobStatus.Completed]: 'Completed',
    [JobStatus.Cancelled]: 'Cancelled',
  };

  const statusColors: Record<JobStatus, string> = {
    [JobStatus.Open]: COLORS.primary,
    [JobStatus.Assigned]: COLORS.success,
    [JobStatus.InProgress]: COLORS.warning,
    [JobStatus.Completed]: COLORS.textSecondary,
    [JobStatus.Cancelled]: COLORS.error,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderJob = ({ item }: { item: JobListItem }) => (
    <TouchableOpacity onPress={() => handleJobPress(item?.id)}>
      <CustomCard
        renderHeader={<View />}
        renderFooter={<View />}
        renderMiddle={
          <View style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <CustomText style={styles.jobNumber}>{item.jobNumber}</CustomText>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
                <CustomText style={[styles.statusText, item.status === JobStatus.Open && styles.statusTextOpen]}>
                  {statusLabels[item.status]}
                </CustomText>
              </View>
            </View>
            <CustomText style={styles.jobType}>{typeLabels[item.type]}</CustomText>
            <CustomText style={styles.jobInfo}>{item.address}</CustomText>
            <CustomText style={styles.jobInfo}>{item.city}, {item.state}</CustomText>
            <CustomText style={styles.jobInfo}>Desired: {formatDate(item.desiredDate)}</CustomText>
            {item.assignedContractorName && (
              <CustomText style={styles.assignedContractor}>
                Assigned to: {item.assignedContractorName}
              </CustomText>
            )}
          </View>
        }
      />
    </TouchableOpacity>
  );

  if (loading && jobs.length === 0) {
    return (
      <Screen>
        <LoadingSpinner animating={true} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <CustomTitle title="Jobs" />
          <CustomButton textColor='black' onPress={handleCreate} title="+ Create Job" />
        </View>

        <CustomTextInput
          placeholder="Search jobs..."
          initialValue={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item?.id}
          onRefresh={() => loadJobs(1)}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CustomText style={styles.emptyText}>No jobs found</CustomText>
            </View>
          }
        />

        {pagination.totalPages > 1 && (
          <View style={styles.pagination}>
            <CustomButton
              title="Previous"
              onPress={() => loadJobs(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
            />
            <CustomText style={styles.pageInfo}>
              Page {pagination.page} of {pagination.totalPages}
            </CustomText>
            <CustomButton
              title="Next"
              onPress={() => loadJobs(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: PADDING_SIZES.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PADDING_SIZES.md,
  },
  searchInput: {
    marginBottom: PADDING_SIZES.md,
  },
  jobCard: {
    padding: PADDING_SIZES.md,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PADDING_SIZES.sm,
  },
  jobNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: PADDING_SIZES.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextOpen: {
    color: COLORS.black,
  },
  jobType: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: PADDING_SIZES.xs,
  },
  jobInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: PADDING_SIZES.xs,
  },
  assignedContractor: {
    fontSize: 14,
    color: COLORS.success,
    marginTop: PADDING_SIZES.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: PADDING_SIZES.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: PADDING_SIZES.md,
  },
  pageInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

