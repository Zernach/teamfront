// app/customers/[id]/edit.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  customerApi,
  CustomerDetail,
  UpdateCustomerRequest,
} from '../../../services/api/customerApi';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/spacing';
import { Text } from 'react-native';
import { Screen } from '../../../components/screen';
import { usePhoneNumber } from '../../../hooks/usePhoneNumber';

export default function EditCustomerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [formData, setFormData] = useState<UpdateCustomerRequest>({});

  const loadCustomer = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await customerApi.getCustomerById(id);
      setCustomer(data);
      const initialFormData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      };
      setFormData(initialFormData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customer');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      loadCustomer();
    }
  }, [id, loadCustomer]);

  const phoneNumber = usePhoneNumber({
    initialValue: formData.phone,
    onChange: (value) => {
      setFormData((prev) => ({ ...prev, phone: value }));
    },
    onBlur: (value) => {
      setFormData((prev) => ({ ...prev, phone: value }));
    },
  });


  const handleSubmit = async () => {
    // Ensure phone number is in E.164 format before submission
    const finalPhoneValue = phoneNumber.e164Value;
    const submitData = { ...formData, phone: finalPhoneValue };

    // Validate phone number if provided
    if (finalPhoneValue && !phoneNumber.isValid) {
      Alert.alert('Validation Error', 'Please enter a valid phone number in E.164 format (e.g., +1234567890)');
      return;
    }

    // Filter out empty strings - only send fields with actual values
    const cleanedData: UpdateCustomerRequest = {};
    Object.entries(submitData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedData[key as keyof UpdateCustomerRequest] = value as string;
      }
    });

    try {
      setSaving(true);
      await customerApi.updateCustomer(id!, cleanedData);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Customer</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber.value}
              onChangeText={(text) => phoneNumber.onChangeText(text)}
              onBlur={phoneNumber.onBlur}
              placeholder="+1234567890"
              keyboardType="phone-pad"
              placeholderTextColor={Colors.textSecondary}
            />
            {phoneNumber.value && !phoneNumber.isValid && (
              <Text style={styles.errorText}>
                Please enter a valid phone number in E.164 format (e.g., +1234567890)
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Address</Text>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
              style={styles.input}
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholderTextColor={Colors.textSecondary}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(text) =>
                    setFormData({ ...formData, state: text })
                  }
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Zip Code</Text>
                <TextInput
                  style={styles.input}
                  value={formData.zipCode}
                  onChangeText={(text) =>
                    setFormData({ ...formData, zipCode: text })
                  }
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>

            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(text) =>
                setFormData({ ...formData, country: text })
              }
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.background,
  },
  container: {
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  cancelButton: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  form: {
    padding: Spacing.md,
  },
  section: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
});

