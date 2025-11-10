import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { CustomTitle } from 'components/custom-title';
import { CustomTextInput } from 'components/custom-text-input/CustomTextInput';
import { CustomButton } from 'components/custom-button';
import { CustomCard } from 'components/custom-card/custom-card';
import { COLORS } from 'constants/colors';
import { contractorService } from 'services/contractorService';
import { CreateContractorRequest, ContractorType, BaseLocation } from 'services/types/contractor';
import { useRouter } from 'expo-router';
import { PADDING } from 'constants/styles/commonStyles';
import { Screen } from 'components/screen';

export default function CreateContractorScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateContractorRequest>({
    name: '',
    type: ContractorType.Flooring,
    phoneNumber: '',
    email: '',
    baseLocation: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    skills: [],
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.phoneNumber || !formData.email) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (!formData.baseLocation.address || !formData.baseLocation.city || 
        !formData.baseLocation.state || !formData.baseLocation.zipCode) {
      Alert.alert('Validation Error', 'Please fill in all location fields');
      return;
    }

    setLoading(true);
    try {
      await contractorService.createContractor(formData);
      Alert.alert('Success', 'Contractor created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create contractor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.container}>
      <View style={styles.content}>
        <CustomTitle title="Create Contractor" style={styles.title} />
        
        <CustomCard
          renderHeader={<View />}
          renderMiddle={
            <View style={styles.form}>
              <CustomTextInput
                placeholder="Name *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
              />
              
              <CustomTextInput
                placeholder="Email *"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              
              <CustomTextInput
                placeholder="Phone Number *"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                keyboardType="phone-pad"
                style={styles.input}
              />

              <CustomTextInput
                placeholder="Address *"
                value={formData.baseLocation.address}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  baseLocation: { ...formData.baseLocation, address: text }
                })}
                style={styles.input}
              />

              <View style={styles.row}>
                <CustomTextInput
                  placeholder="City *"
                  value={formData.baseLocation.city}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    baseLocation: { ...formData.baseLocation, city: text }
                  })}
                  style={[styles.input, styles.halfInput]}
                />
                
                <CustomTextInput
                  placeholder="State *"
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
                placeholder="Zip Code *"
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
                title={loading ? 'Creating...' : 'Create Contractor'}
                onPress={handleSubmit}
                disabled={loading}
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



