// app/invoices/[id]/edit.tsx
import React, { useState, useEffect } from 'react';
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
import { invoiceApi, InvoiceDetail, UpdateInvoiceRequest } from '../../../services/api/invoiceApi';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/spacing';
import { Text } from 'react-native';
import { Screen } from '../../../components/screen';

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
}

export default function EditInvoiceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxAmount, setTaxAmount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await invoiceApi.getInvoiceById(id!);
      setInvoice(data);
      setInvoiceDate(data.invoiceDate.split('T')[0]);
      setDueDate(data.dueDate.split('T')[0]);
      setLineItems(
        data.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
        }))
      );
      setTaxAmount(data.taxAmount.toString());
      setNotes(data.notes || '');
    } catch (error) {
      console.error('Error loading invoice:', error);
      Alert.alert('Error', 'Failed to load invoice');
      router.back();
    } finally {
      setLoading(false);
    }
  };

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
    if (!invoice) return;

    if (invoice.status !== 'DRAFT') {
      Alert.alert('Error', 'Only DRAFT invoices can be edited');
      return;
    }

    if (lineItems.some((item) => !item.description || !item.quantity || !item.unitPrice)) {
      Alert.alert('Validation Error', 'Please fill in all line item fields');
      return;
    }

    try {
      setSaving(true);
      const request: UpdateInvoiceRequest = {
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

      await invoiceApi.updateInvoice(invoice.id, request);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update invoice');
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

  if (!invoice || invoice.status !== 'DRAFT') {
    return (
      <Screen style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.text}>Invoice cannot be edited</Text>
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
          <Text style={styles.headerTitle}>Edit Invoice</Text>
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
  screen: {
    backgroundColor: Colors.background,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.text,
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
});

