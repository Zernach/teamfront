// app/invoices/new.tsx
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
import { useFocusEffect } from '@react-navigation/native';
import { invoiceApi, CreateInvoiceRequest } from '../../services/api/invoiceApi';
import { customerApi } from '../../services/api/customerApi';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Text } from 'react-native';
import { Screen } from '../../components/screen';

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
}

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: '1', unitPrice: '0' },
  ]);
  const [taxAmount, setTaxAmount] = useState('');
  const [notes, setNotes] = useState('');

  const loadCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      const response = await customerApi.listCustomers({ status: 'ACTIVE' });
      setCustomers(response.customers);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    if (!customerId) {
      loadCustomers();
    }
  }, [customerId, loadCustomers]);

  // Reload customers when screen comes into focus (e.g., after creating a customer)
  useFocusEffect(
    React.useCallback(() => {
      if (!customerId) {
        loadCustomers();
      }
    }, [customerId, loadCustomers])
  );

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: '1', unitPrice: '0' }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Validation Error', 'Please select a customer');
      return;
    }

    if (lineItems.some((item) => !item.description || !item.quantity || !item.unitPrice)) {
      Alert.alert('Validation Error', 'Please fill in all line item fields');
      return;
    }

    try {
      setLoading(true);
      const request: CreateInvoiceRequest = {
        customerId: selectedCustomerId,
        invoiceDate,
        dueDate,
        lineItems: lineItems.map((item) => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
        })),
        taxAmount: taxAmount ? parseFloat(taxAmount) : undefined,
        notes: notes || undefined,
      };

      await invoiceApi.createInvoice(request);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ backgroundColor: Colors.background }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Invoice</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {!customerId && (
            <View style={styles.section}>
              <Text style={styles.label}>Customer *</Text>
              {loadingCustomers ? (
                <ActivityIndicator />
              ) : customers.length === 0 ? (
                <View style={styles.emptyCustomerState}>
                  <Text style={styles.emptyCustomerText}>
                    No customers found. Create your first customer to get started.
                  </Text>
                  <TouchableOpacity
                    style={styles.createCustomerButton}
                    onPress={() => router.push('/customers/new')}
                  >
                    <Text style={styles.createCustomerButtonText}>
                      Create Customer
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.customerList}>
                  {customers.map((customer) => (
                    <TouchableOpacity
                      key={customer.id}
                      style={[
                        styles.customerOption,
                        selectedCustomerId === customer.id &&
                        styles.customerOptionSelected,
                      ]}
                      onPress={() => setSelectedCustomerId(customer.id)}
                    >
                      <Text
                        style={[
                          styles.customerOptionText,
                          selectedCustomerId === customer.id &&
                          styles.customerOptionTextSelected,
                        ]}
                      >
                        {customer.fullName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <Text style={styles.label}>Invoice Date *</Text>
            <TextInput
              style={styles.input}
              value={invoiceDate}
              onChangeText={setInvoiceDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>Due Date *</Text>
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>Tax Amount</Text>
            <TextInput
              style={styles.input}
              value={taxAmount}
              onChangeText={setTaxAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholder="Additional notes..."
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              <TouchableOpacity onPress={addLineItem}>
                <Text style={styles.addButton}>+ Add Item</Text>
              </TouchableOpacity>
            </View>

            {lineItems.map((item, index) => (
              <View key={index} style={styles.lineItem}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={styles.input}
                  value={item.description}
                  onChangeText={(text) =>
                    updateLineItem(index, 'description', text)
                  }
                  placeholder="Product or service description"
                  placeholderTextColor={Colors.textSecondary}
                />

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Quantity *</Text>
                    <TextInput
                      style={styles.input}
                      value={item.quantity}
                      onChangeText={(text) =>
                        updateLineItem(index, 'quantity', text)
                      }
                      keyboardType="decimal-pad"
                      placeholderTextColor={Colors.textSecondary}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Unit Price *</Text>
                    <TextInput
                      style={styles.input}
                      value={item.unitPrice}
                      onChangeText={(text) =>
                        updateLineItem(index, 'unitPrice', text)
                      }
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={Colors.textSecondary}
                    />
                  </View>
                </View>

                {lineItems.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeLineItem(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  customerList: {
    gap: Spacing.sm,
  },
  customerOption: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  customerOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  customerOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  customerOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  lineItem: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  addButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: Colors.error,
    fontSize: 14,
  },
  emptyCustomerState: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCustomerText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  createCustomerButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  createCustomerButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

