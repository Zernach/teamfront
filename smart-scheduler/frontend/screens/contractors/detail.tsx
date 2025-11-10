import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CustomTitle } from 'components/custom-title';
import { CustomText } from 'components/custom-text/CustomText';
import { CustomCard } from 'components/custom-card/custom-card';
import { CustomButton } from 'components/custom-button';
import { COLORS } from 'constants/colors';
import { contractorService } from 'services/contractorService';
import { Contractor, ContractorType, ContractorStatus } from 'services/types/contractor';
import { PADDING } from 'constants/styles/commonStyles';
import { Feather } from '@expo/vector-icons';
import { Screen } from 'components/screen';

export default function ContractorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    loadContractor();
  }, [id]);

  const loadContractor = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await contractorService.getContractorById(id);
      setContractor(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load contractor');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (contractor) {
      router.push(`/screens/contractors/edit?id=${contractor.id}`);
    }
  };

  const handleDeactivate = () => {
    if (!contractor) return;

    Alert.alert(
      'Deactivate Contractor',
      'Are you sure you want to deactivate this contractor?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            setDeactivating(true);
            try {
              await contractorService.deactivateContractor(contractor.id);
              Alert.alert('Success', 'Contractor deactivated successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to deactivate contractor');
            } finally {
              setDeactivating(false);
            }
          },
        },
      ]
    );
  };

  const handleRestore = async () => {
    if (!contractor) return;

    setDeactivating(true);
    try {
      await contractorService.restoreContractor(contractor.id);
      Alert.alert('Success', 'Contractor restored successfully');
      loadContractor();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to restore contractor');
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      </Screen>
    );
  }

  if (!contractor) {
    return (
      <Screen>
        <View style={styles.center}>
          <CustomText>Contractor not found</CustomText>
        </View>
      </Screen>
    );
  }

  const typeLabels: Record<ContractorType, string> = {
    [ContractorType.Flooring]: 'Flooring',
    [ContractorType.Tile]: 'Tile',
    [ContractorType.Carpet]: 'Carpet',
    [ContractorType.Multi]: 'Multi',
  };

  const statusLabels: Record<ContractorStatus, string> = {
    [ContractorStatus.Active]: 'Active',
    [ContractorStatus.Inactive]: 'Inactive',
    [ContractorStatus.OnLeave]: 'On Leave',
  };

  return (
    <Screen>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <CustomTitle title={contractor.name} style={styles.title} />
          </View>

          <CustomCard
            renderHeader={<View />}
            renderMiddle={
              <View style={styles.details}>
                <DetailRow label="Type" value={typeLabels[contractor.type]} />
                <DetailRow label="Status" value={statusLabels[contractor.status]} />
                <DetailRow label="Rating" value={contractor.rating?.toFixed(2)} />
                <DetailRow label="Email" value={contractor.email} />
                <DetailRow label="Phone" value={contractor.phoneNumber} />
                <DetailRow label="Address" value={contractor.baseLocation.address} />
                <DetailRow
                  label="Location"
                  value={`${contractor.baseLocation.city}, ${contractor.baseLocation.state} ${contractor.baseLocation.zipCode}`}
                />
                {contractor.availabilityStatus && (
                  <DetailRow label="Availability" value={contractor.availabilityStatus} />
                )}
                {contractor.skills && contractor.skills.length > 0 && (
                  <DetailRow label="Skills" value={contractor.skills.join(', ')} />
                )}
              </View>
            }
            renderFooter={
              <View style={styles.footer}>
                {contractor.status === ContractorStatus.Active ? (
                  <>
                    <CustomButton title="Edit" onPress={handleEdit} style={styles.button} />
                    <CustomButton
                      title={deactivating ? 'Deactivating...' : 'Deactivate'}
                      onPress={handleDeactivate}
                      disabled={deactivating}
                      style={[styles.button, styles.dangerButton]}
                    />
                  </>
                ) : (
                  <CustomButton
                    title={deactivating ? 'Restoring...' : 'Restore'}
                    onPress={handleRestore}
                    disabled={deactivating}
                    style={styles.button}
                  />
                )}
              </View>
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <CustomText style={styles.label}>{label}:</CustomText>
      <CustomText style={styles.value}>{value}</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.black,
  },
  content: {
    padding: PADDING.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: PADDING.lg,
  },
  backButton: {
    marginRight: PADDING.md,
  },
  title: {
    flex: 1,
  },
  details: {
    gap: PADDING.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: PADDING.sm,
  },
  label: {
    fontWeight: 'bold',
    marginRight: PADDING.sm,
    minWidth: 100,
  },
  value: {
    flex: 1,
  },
  footer: {
    marginTop: PADDING.lg,
    gap: PADDING.md,
  },
  button: {
    marginBottom: PADDING.sm,
  },
  dangerButton: {
    backgroundColor: COLORS.red || '#ff4444',
  },
});
