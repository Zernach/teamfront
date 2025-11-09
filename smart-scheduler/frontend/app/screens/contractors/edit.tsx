import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CustomTitle } from 'components/custom-title';
import { CustomText } from 'components/custom-text/CustomText';
import { CustomTextInput } from 'components/custom-text-input/CustomTextInput';
import { CustomButton } from 'components/custom-button';
import { CustomCard } from 'components/custom-card/custom-card';
import { COLORS } from 'constants/colors';
import { contractorService } from 'services/contractorService';
import { UpdateContractorRequest, Contractor, ContractorType } from 'services/types/contractor';
import { PADDING } from 'constants/styles/commonStyles';
import { Screen } from 'components/screen';

export default function EditContractorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [formData, setFormData] = useState<UpdateContractorRequest>({});

  useEffect(() => {
    loadContractor();
  }, [id]);

  const loadContractor = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await contractorService.getContractorById(id);
      setContractor(data);
      setFormData({
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
        baseLocation: data.baseLocation,
        rowVersion: data.rowVersion,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load contractor');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!contractor || !id) return;

    setSaving(true);
    try {
      await contractorService.updateContractor(id, formData);
      Alert.alert('Success', 'Contractor updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      if (error.message.includes('modified by another user')) {
        Alert.alert(
          'Conflict',
          error.message,
          [
            { text: 'Reload', onPress: loadContractor },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to update contractor');
      }
    } finally {
      setSaving(false);
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

  if (!contractor || !formData.baseLocation) {
    return (
      <Screen>
        <View style={styles.center}>
          <CustomText>Contractor not found</CustomText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container}>
      <View style={styles.content}>
        <CustomTitle title="Edit Contractor" style={styles.title} />
        
        <CustomCard
          renderHeader={<View />}
          renderMiddle={
            <View style={styles.form}>
              <CustomTextInput
                placeholder="Name"
                value={formData.name || ''}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
              />
              
              <CustomTextInput
                placeholder="Email"
                value={formData.email || ''}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              
              <CustomTextInput
                placeholder="Phone Number"
                value={formData.phoneNumber || ''}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                keyboardType="phone-pad"
                style={styles.input}
              />

              <CustomTextInput
                placeholder="Address"
                value={formData.baseLocation.address}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  baseLocation: { ...formData.baseLocation, address: text }
                })}
                style={styles.input}
              />

              <View style={styles.row}>
                <CustomTextInput
                  placeholder="City"
                  value={formData.baseLocation.city}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    baseLocation: { ...formData.baseLocation, city: text }
                  })}
                  style={[styles.input, styles.halfInput]}
                />
                
                <CustomTextInput
                  placeholder="State"
                  value={formData.baseLocation.state}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    baseLocation: { ...formData.baseLocation, state: text }
                  })}
                  style={[styles.input, styles.halfInput]}
                  maxLength={2}
                />
              </View>

              <CustomTextInput
                placeholder="Zip Code"
                value={formData.baseLocation.zipCode}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  baseLocation: { ...formData.baseLocation, zipCode: text }
                })}
                style={styles.input}
              />
            </View>
          }
          renderFooter={
            <View style={styles.footer}>
              <CustomButton
                title={saving ? 'Saving...' : 'Save Changes'}
                onPress={handleSubmit}
                disabled={saving}
              />
            </View>
          }
        />
      </View>
      </ScrollView>
    </Screen>
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
  title: {
    marginBottom: PADDING.lg,
  },
  form: {
    gap: PADDING.md,
  },
  input: {
    marginBottom: PADDING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: PADDING.sm,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    marginTop: PADDING.lg,
  },
});


