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

export default function CreateCustomerScreen() {
  const router = useRouter();
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
    taxId: '',
  });

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await customerApi.createCustomer(formData);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
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
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) =>
              setFormData({ ...formData, firstName: text })
            }
            placeholder="First Name"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) =>
              setFormData({ ...formData, lastName: text })
            }
            placeholder="Last Name"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="+1-555-123-4567"
            keyboardType="phone-pad"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Address</Text>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.street}
            onChangeText={(text) => setFormData({ ...formData, street: text })}
            placeholder="123 Main St"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            placeholder="City"
            placeholderTextColor={Colors.textSecondary}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) =>
                  setFormData({ ...formData, state: text })
                }
                placeholder="State"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Zip Code *</Text>
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(text) =>
                  setFormData({ ...formData, zipCode: text })
                }
                placeholder="12345"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <Text style={styles.label}>Country *</Text>
          <TextInput
            style={styles.input}
            value={formData.country}
            onChangeText={(text) =>
              setFormData({ ...formData, country: text })
            }
            placeholder="Country"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>Tax ID</Text>
          <TextInput
            style={styles.input}
            value={formData.taxId}
            onChangeText={(text) => setFormData({ ...formData, taxId: text })}
            placeholder="XX-XXXXXXX"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
});

