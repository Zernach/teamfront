import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CustomTitle } from 'components/custom-title';
import { CustomText } from 'components/custom-text/CustomText';
import { CustomButton } from 'components/custom-button';
import { COLORS } from 'constants/colors';
import { jobService, Job, JobType, JobStatus } from 'services/jobService';
import { PADDING_SIZES } from 'constants/styles/commonStyles';
import { Screen } from 'components/screen';
import { LoadingSpinner } from 'components/loading-spinner/loading-spinner';
import { BackButton } from 'components/back-button/back-button';

export default function JobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await jobService.getById(id);
      setJob(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = () => {
    if (job?.status === JobStatus.Open) {
      router.push(`/screens/jobs/recommendations?jobId=${job.id}`);
    } else {
      Alert.alert('Info', 'Only open jobs can have recommendations');
    }
  };

  if (loading) {
    return (
      <Screen>
        <LoadingSpinner animating={true} />
      </Screen>
    );
  }

  if (!job) {
    return (
      <Screen>
        <BackButton />
        <View style={styles.container}>
          <CustomText>Job not found</CustomText>
        </View>
      </Screen>
    );
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Screen>
      <BackButton />
      <ScrollView style={styles.container}>
        <CustomTitle title={job.jobNumber} />
        <View style={styles.section}>
          <CustomText style={styles.label}>Type:</CustomText>
          <CustomText style={styles.value}>{typeLabels[job.type]}</CustomText>
        </View>
        <View style={styles.section}>
          <CustomText style={styles.label}>Status:</CustomText>
          <CustomText style={styles.value}>{statusLabels[job.status]}</CustomText>
        </View>
        <View style={styles.section}>
          <CustomText style={styles.label}>Desired Date:</CustomText>
          <CustomText style={styles.value}>{formatDate(job.desiredDate)}</CustomText>
        </View>
        <View style={styles.section}>
          <CustomText style={styles.label}>Duration:</CustomText>
          <CustomText style={styles.value}>{job.duration}</CustomText>
        </View>
        <View style={styles.section}>
          <CustomText style={styles.label}>Location:</CustomText>
          <CustomText style={styles.value}>{job.location.address}</CustomText>
          <CustomText style={styles.value}>{job.location.city}, {job.location.state} {job.location.zipCode}</CustomText>
        </View>
        {job.assignedContractorName && (
          <View style={styles.section}>
            <CustomText style={styles.label}>Assigned Contractor:</CustomText>
            <CustomText style={styles.value}>{job.assignedContractorName}</CustomText>
          </View>
        )}
        {job.specialRequirements.length > 0 && (
          <View style={styles.section}>
            <CustomText style={styles.label}>Special Requirements:</CustomText>
            {job.specialRequirements.map((req, index) => (
              <CustomText key={index} style={styles.value}>• {req}</CustomText>
            ))}
          </View>
        )}
        {job.status === JobStatus.Open && (
          <CustomButton
            title="Get Recommendations"
            onPress={handleGetRecommendations}
            textColor='black'
            style={styles.button}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: PADDING_SIZES.md,
  },
  section: {
    marginBottom: PADDING_SIZES.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: PADDING_SIZES.xs,
  },
  value: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  button: {
    marginTop: PADDING_SIZES.lg,
  },
});

