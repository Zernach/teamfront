// app/customers/new.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { customerApi, CreateCustomerRequest } from '../../services/api/customerApi';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Text } from 'react-native';
import { Screen } from '../../components/screen';
import { usePhoneNumber } from '../../hooks/usePhoneNumber';
import { useAppDispatch } from '../../hooks/redux';
import { addCustomer } from '../../store/customerSlice';

export default function CreateCustomerScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const phoneNumber = usePhoneNumber({
    initialValue: formData.phone,
    onChange: (value) => {
      setFormData((prev) => ({ ...prev, phone: value }));
    },
    onBlur: (value) => {
      setFormData((prev) => ({ ...prev, phone: value }));
    },
  });

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[fieldName];
      setFieldErrors(newErrors);
    }
  };

  const handleFieldChange = (fieldName: keyof CreateCustomerRequest, value: string) => {
    setFormData({ ...formData, [fieldName]: value });
    clearFieldError(fieldName);

    // Update phone number E.164 value when formData changes
    if (fieldName === 'phone') {
      phoneNumber.setValue(value);
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setFieldErrors({});

    // Ensure phone number is in E.164 format before submission
    const finalPhoneValue = phoneNumber.e164Value;
    const submitData = { ...formData, phone: finalPhoneValue };

    // Basic validation
    if (!submitData.firstName || !submitData.lastName || !submitData.email) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    // Validate phone number if provided
    if (finalPhoneValue && !phoneNumber.isValid) {
      setFieldErrors({ phone: 'Please enter a valid phone number in E.164 format (e.g., +1234567890)' });
      return;
    }

    try {
      setLoading(true);
      const createdCustomer = await customerApi.createCustomer(submitData);
      
      // Convert CustomerDetail to CustomerSummary for Redux store
      const customerSummary = {
        id: createdCustomer.id,
        fullName: createdCustomer.fullName,
        email: createdCustomer.email,
        status: createdCustomer.status,
        outstandingBalance: createdCustomer.outstandingBalance,
        activeInvoicesCount: createdCustomer.activeInvoicesCount,
      };
      
      // Add customer to Redux store
      dispatch(addCustomer(customerSummary));
      
      router.back();
    } catch (error: any) {
      // Handle validation errors from backend
      if (error.errors && typeof error.errors === 'object') {
        const validationErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            validationErrors[key] = value[0];
          } else if (typeof value === 'string') {
            validationErrors[key] = value;
          }
        });
        setFieldErrors(validationErrors);
      } else {
        Alert.alert('Error', error.message || 'Failed to create customer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Customer</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.firstName && styles.inputError,
              ]}
              value={formData.firstName}
              onChangeText={(text) => handleFieldChange('firstName', text)}
              placeholder="First Name"
              placeholderTextColor={Colors.textSecondary}
            />
            {fieldErrors.firstName && (
              <Text style={styles.errorText}>{fieldErrors.firstName}</Text>
            )}

            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.lastName && styles.inputError,
              ]}
              value={formData.lastName}
              onChangeText={(text) => handleFieldChange('lastName', text)}
              placeholder="Last Name"
              placeholderTextColor={Colors.textSecondary}
            />
            {fieldErrors.lastName && (
              <Text style={styles.errorText}>{fieldErrors.lastName}</Text>
            )}

            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.email && styles.inputError,
              ]}
              value={formData.email}
              onChangeText={(text) => handleFieldChange('email', text)}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textSecondary}
            />
            {fieldErrors.email && (
              <Text style={styles.errorText}>{fieldErrors.email}</Text>
            )}

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.phone && styles.inputError,
              ]}
              value={phoneNumber.value}
              onChangeText={(text) => {
                phoneNumber.onChangeText(text);
                clearFieldError('phone');
              }}
              onBlur={phoneNumber.onBlur}
              placeholder="+1234567890"
              keyboardType="phone-pad"
              placeholderTextColor={Colors.textSecondary}
            />
            {fieldErrors.phone && (
              <Text style={styles.errorText}>{fieldErrors.phone}</Text>
            )}
            {phoneNumber.value && !phoneNumber.isValid && (
              <Text style={styles.errorText}>
                Please enter a valid phone number in E.164 format (e.g., +1234567890)
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Address</Text>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.street && styles.inputError,
              ]}
              value={formData.street}
              onChangeText={(text) => handleFieldChange('street', text)}
              placeholder="123 Main St"
              placeholderTextColor={Colors.textSecondary}
            />
            {fieldErrors.street && (
              <Text style={styles.errorText}>{fieldErrors.street}</Text>
            )}

            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.city && styles.inputError,
              ]}
              value={formData.city}
              onChangeText={(text) => handleFieldChange('city', text)}
              placeholder="City"
              placeholderTextColor={Colors.textSecondary}
            />
            {fieldErrors.city && (
              <Text style={styles.errorText}>{fieldErrors.city}</Text>
            )}

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.state && styles.inputError,
                  ]}
                  value={formData.state}
                  onChangeText={(text) => handleFieldChange('state', text)}
                  placeholder="State"
                  placeholderTextColor={Colors.textSecondary}
                />
                {fieldErrors.state && (
                  <Text style={styles.errorText}>{fieldErrors.state}</Text>
                )}
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Zip Code *</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.zipCode && styles.inputError,
                  ]}
                  value={formData.zipCode}
                  onChangeText={(text) => handleFieldChange('zipCode', text)}
                  placeholder="12345"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textSecondary}
                />
                {fieldErrors.zipCode && (
                  <Text style={styles.errorText}>{fieldErrors.zipCode}</Text>
                )}
              </View>
            </View>

            <Text style={styles.label}>Country *</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.country && styles.inputError,
              ]}
              value={formData.country}
              onChangeText={(text) => handleFieldChange('country', text)}
              placeholder="Country"
              placeholderTextColor={Colors.textSecondary}
            />
            {fieldErrors.country && (
              <Text style={styles.errorText}>{fieldErrors.country}</Text>
            )}
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
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
});

