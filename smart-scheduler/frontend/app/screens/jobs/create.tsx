import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomTitle } from 'components/custom-title';
import { CustomText } from 'components/custom-text/CustomText';
import { CustomTextInput } from 'components/custom-text-input/CustomTextInput';
import { CustomButton } from 'components/custom-button';
import { COLORS } from 'constants/colors';
import { jobService, JobType, Priority, BaseLocation, CreateJobRequest } from 'services/jobService';
import { PADDING_SIZES } from 'constants/styles/commonStyles';
import { Screen } from 'components/screen';
import { BackButton } from 'components/back-button/back-button';
import { MultiSelectDropdown, MultiSelectOption } from 'components/multi-select-dropdown';

export default function CreateJobScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>([]);
  const [otherTypeText, setOtherTypeText] = useState('');
  const [formData, setFormData] = useState<CreateJobRequest>({
    type: JobType.Flooring,
    desiredDate: new Date().toISOString(),
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    duration: '04:00:00',
    priority: Priority.Medium,
    specialRequirements: [],
  });

  const jobTypeOptions: MultiSelectOption[] = [
    { value: JobType.Flooring, label: 'Flooring' },
    { value: JobType.Tile, label: 'Tile' },
    { value: JobType.Carpet, label: 'Carpet' },
    { value: JobType.Hardwood, label: 'Hardwood' },
    { value: JobType.Laminate, label: 'Laminate' },
    { value: JobType.Vinyl, label: 'Vinyl' },
    { value: JobType.Linoleum, label: 'Linoleum' },
    { value: JobType.Bamboo, label: 'Bamboo' },
    { value: JobType.Cork, label: 'Cork' },
    { value: JobType.Concrete, label: 'Concrete' },
    { value: JobType.Marble, label: 'Marble' },
    { value: JobType.Granite, label: 'Granite' },
    { value: JobType.Stone, label: 'Stone' },
  ];

  const handleSubmit = async () => {
    if (selectedTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one job type');
      return;
    }

    if (!formData.location.address || !formData.location.city || !formData.location.state) {
      Alert.alert('Error', 'Please fill in all required location fields');
      return;
    }

    // Validate "Other" option
    if (selectedTypes.includes(JobType.Other) && !otherTypeText.trim()) {
      Alert.alert('Error', 'Please specify the job type in the "Other" field');
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateJobRequest = {
        ...formData,
        type: selectedTypes[0], // Primary type (first selected)
        types: selectedTypes,
        otherTypeText: selectedTypes.includes(JobType.Other) ? otherTypeText : undefined,
      };
      await jobService.create(submitData);
      Alert.alert('Success', 'Job created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <BackButton />
      <ScrollView style={styles.container}>
        <CustomTitle title="Create New Job" />

        <View style={styles.section}>
          <MultiSelectDropdown
            label="Type *"
            options={jobTypeOptions}
            selectedValues={selectedTypes}
            onSelectionChange={(values) => setSelectedTypes(values as JobType[])}
            placeholder="Select job types"
            otherOption={{
              value: JobType.Other,
              label: 'Other',
            }}
            otherText={otherTypeText}
            onOtherTextChange={setOtherTypeText}
          />
        </View>

        <View style={styles.section}>
          <CustomText style={styles.label}>Desired Date *</CustomText>
          <CustomTextInput
            placeholder="YYYY-MM-DDTHH:mm:ss"
            initialValue={formData.desiredDate}
            onChangeText={(text) => setFormData({ ...formData, desiredDate: text })}
          />
        </View>

        <View style={styles.section}>
          <CustomText style={styles.label}>Duration *</CustomText>
          <CustomTextInput
            placeholder="HH:mm:ss (e.g., 04:00:00)"
            initialValue={formData.duration}
            onChangeText={(text) => setFormData({ ...formData, duration: text })}
          />
        </View>

        <View style={styles.section}>
          <CustomText style={styles.label}>Address *</CustomText>
          <CustomTextInput
            placeholder="Street address"
            initialValue={formData.location.address}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                location: { ...formData.location, address: text },
              })
            }
          />
        </View>

        <View style={styles.section}>
          <CustomText style={styles.label}>City *</CustomText>
          <CustomTextInput
            placeholder="City"
            initialValue={formData.location.city}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                location: { ...formData.location, city: text },
              })
            }
          />
        </View>

        <View style={styles.section}>
          <CustomText style={styles.label}>State *</CustomText>
          <CustomTextInput
            placeholder="State (2 letters)"
            initialValue={formData.location.state}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                location: { ...formData.location, state: text.toUpperCase().slice(0, 2) },
              })
            }
            maxLength={2}
          />
        </View>

        <View style={styles.section}>
          <CustomText style={styles.label}>Zip Code</CustomText>
          <CustomTextInput
            placeholder="Zip code"
            initialValue={formData.location.zipCode}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                location: { ...formData.location, zipCode: text },
              })
            }
          />
        </View>

        <CustomButton
          title="Create Job"
          onPress={handleSubmit}
          textColor='black'
          disabled={loading}
          style={styles.button}
        />
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
  button: {
    marginTop: PADDING_SIZES.lg,
  },
});

