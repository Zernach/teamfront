import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CustomTitle } from 'components/custom-title';
import { CustomText } from 'components/custom-text/CustomText';
import { CustomButton } from 'components/custom-button';
import { CustomCard } from 'components/custom-card/custom-card';
import { COLORS } from 'constants/colors';
import { recommendationService, RecommendationResponse, RankedContractor, TimeSlot } from 'services/recommendationService';
import { PADDING } from 'constants/styles/commonStyles';
import { Screen } from 'components/screen';
import { LoadingSpinner } from 'components/loading-spinner/loading-spinner';
import { BackButton } from 'components/back-button/back-button';

export default function RecommendationsScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState<RankedContractor | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadRecommendations();
    }
  }, [jobId]);

  const loadRecommendations = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const data = await recommendationService.getRecommendations(jobId, 10);
      setRecommendations(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedContractor || !selectedTimeSlot || !jobId) {
      Alert.alert('Error', 'Please select a contractor and time slot');
      return;
    }

    setAssigning(true);
    try {
      await recommendationService.createAssignment({
        jobId,
        contractorId: selectedContractor.contractor.id,
        scheduledStartTime: selectedTimeSlot.startTime,
        scheduledEndTime: selectedTimeSlot.endTime,
      });
      Alert.alert('Success', 'Job assigned successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to assign job');
    } finally {
      setAssigning(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <Screen>
        <BackButton />
        <View style={styles.container}>
          <CustomText>No recommendations available</CustomText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton />
      <ScrollView style={styles.container}>
        <CustomTitle>Recommendations for {recommendations.jobDetails.jobNumber}</CustomTitle>
        <CustomText style={styles.jobInfo}>
          {recommendations.jobDetails.location.address}, {recommendations.jobDetails.location.city}
        </CustomText>
        <CustomText style={styles.jobInfo}>
          Desired Date: {formatDate(recommendations.jobDetails.desiredDate)}
        </CustomText>

        {recommendations.recommendations.map((contractor) => (
          <CustomCard key={contractor.contractor.id} style={styles.contractorCard}>
            <View style={styles.contractorHeader}>
              <View>
                <CustomText style={styles.rank}>#{contractor.rank}</CustomText>
                <CustomText style={styles.contractorName}>{contractor.contractor.name}</CustomText>
                <CustomText style={styles.contractorInfo}>
                  ⭐ {contractor.contractor.rating} • 📍 {contractor.distanceFromJob?.toFixed(1)} miles
                </CustomText>
              </View>
              <View style={styles.scoreContainer}>
                <CustomText style={styles.scoreLabel}>Score</CustomText>
                <CustomText style={styles.scoreValue}>{(contractor.score * 100)?.toFixed(0)}%</CustomText>
              </View>
            </View>

            <View style={styles.scoreBreakdown}>
              <CustomText style={styles.breakdownLabel}>Score Breakdown:</CustomText>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownSegment,
                    {
                      width: `${contractor.scoreBreakdown.availabilityScore * 100}%`,
                      backgroundColor: COLORS.primary,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.breakdownSegment,
                    {
                      width: `${contractor.scoreBreakdown.ratingScore * 100}%`,
                      backgroundColor: COLORS.success,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.breakdownSegment,
                    {
                      width: `${contractor.scoreBreakdown.distanceScore * 100}%`,
                      backgroundColor: COLORS.warning,
                    },
                  ]}
                />
              </View>
              <CustomText style={styles.breakdownText}>
                Availability: {(contractor.scoreBreakdown.availabilityScore * 100)?.toFixed(0)}% •
                Rating: {(contractor.scoreBreakdown.ratingScore * 100)?.toFixed(0)}% •
                Distance: {(contractor.scoreBreakdown.distanceScore * 100)?.toFixed(0)}%
              </CustomText>
            </View>

            <View style={styles.timeSlots}>
              <CustomText style={styles.timeSlotsLabel}>Available Time Slots:</CustomText>
              {contractor.availableTimeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotButton,
                    selectedContractor?.contractor.id === contractor.contractor.id &&
                    selectedTimeSlot?.startTime === slot.startTime &&
                    styles.timeSlotButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedContractor(contractor);
                    setSelectedTimeSlot(slot);
                  }}
                >
                  <CustomText
                    style={[
                      styles.timeSlotText,
                      selectedContractor?.contractor.id === contractor.contractor.id &&
                      selectedTimeSlot?.startTime === slot.startTime &&
                      styles.timeSlotTextSelected,
                    ]}
                  >
                    {formatDate(slot.startTime)} - {formatDate(slot.endTime)}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>

            {selectedContractor?.contractor.id === contractor.contractor.id && (
              <CustomButton
                title="Assign to This Contractor"
                onPress={handleAssign}
                disabled={assigning || !selectedTimeSlot}
                style={styles.assignButton}
              />
            )}
          </CustomCard>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: PADDING.md,
  },
  jobInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: PADDING.sm,
  },
  contractorCard: {
    marginBottom: PADDING.md,
    padding: PADDING.md,
  },
  contractorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: PADDING.md,
  },
  rank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  contractorName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: PADDING.xs,
  },
  contractorInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: PADDING.xs,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scoreBreakdown: {
    marginBottom: PADDING.md,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: PADDING.xs,
  },
  breakdownBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: PADDING.xs,
  },
  breakdownSegment: {
    height: '100%',
  },
  breakdownText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timeSlots: {
    marginBottom: PADDING.md,
  },
  timeSlotsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: PADDING.xs,
  },
  timeSlotButton: {
    padding: PADDING.sm,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.tan50,
    marginBottom: PADDING.xs,
  },
  timeSlotButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  timeSlotText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  timeSlotTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  assignButton: {
    marginTop: PADDING.md,
  },
});

