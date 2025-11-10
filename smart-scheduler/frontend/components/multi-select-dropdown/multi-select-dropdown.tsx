import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CustomText } from 'components/custom-text/CustomText';
import { CustomCheckbox } from 'components/custom-checkbox/custom-checkbox';
import { CustomTextInput } from 'components/custom-text-input/CustomTextInput';
import { COLORS } from 'constants/colors';
import { PADDING_SIZES } from 'constants/styles/commonStyles';
import { DEFAULT_BORDER_WIDTH, DEFAULT_BORDER_RADIUS } from 'constants/Styles';

export interface MultiSelectOption {
  value: string | number;
  label: string;
}

type MultiSelectDropdownProps = {
  options: MultiSelectOption[];
  selectedValues: (string | number)[];
  onSelectionChange: (selectedValues: (string | number)[]) => void;
  placeholder?: string;
  label?: string;
  otherOption?: {
    label: string;
    value: string | number;
  };
  onOtherTextChange?: (text: string) => void;
  otherText?: string;
};

export const MultiSelectDropdown = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select options',
  label,
  otherOption,
  onOtherTextChange,
  otherText = '',
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value: string | number) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    const selectedLabels = selectedValues.map((val) => {
      const option = options.find((opt) => opt.value === val);
      if (otherOption && val === otherOption.value) {
        return otherText ? `Other: ${otherText}` : 'Other';
      }
      return option?.label || String(val);
    });
    return selectedLabels.join(', ');
  };

  return (
    <View style={styles.container}>
      {label && <CustomText style={styles.label}>{label}</CustomText>}
      <TouchableOpacity
        style={[styles.dropdownButton, isOpen && styles.dropdownButtonOpen]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <CustomText
          style={[
            styles.dropdownText,
            selectedValues.length === 0 ? styles.placeholderText : {},
          ]}
        >
          {getDisplayText()}
        </CustomText>
        <CustomText style={styles.arrow}>{isOpen ? '▲' : '▼'}</CustomText>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContent}>
          <ScrollView style={styles.scrollView} nestedScrollEnabled>
            {options.map((option) => (
              <CustomCheckbox
                key={option.value}
                label={option.label}
                isChecked={selectedValues.includes(option.value)}
                onPress={() => toggleOption(option.value)}
                style={styles.checkbox}
              />
            ))}
            {otherOption && (
              <View>
                <CustomCheckbox
                  label={otherOption.label}
                  isChecked={selectedValues.includes(otherOption.value)}
                  onPress={() => toggleOption(otherOption.value)}
                  style={styles.checkbox}
                />
                {selectedValues.includes(otherOption.value) && (
                  <View style={styles.otherInputContainer}>
                    <CustomTextInput
                      placeholder="Please specify..."
                      initialValue={otherText}
                      onChangeText={onOtherTextChange}
                    />
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: PADDING_SIZES.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: PADDING_SIZES.xs,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: PADDING_SIZES.md,
    borderWidth: DEFAULT_BORDER_WIDTH,
    borderRadius: DEFAULT_BORDER_RADIUS,
    borderColor: COLORS.tan50,
    backgroundColor: COLORS.black,
    minHeight: 44,
  },
  dropdownButtonOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
  },
  placeholderText: {
    color: COLORS.grey,
  },
  arrow: {
    color: COLORS.white,
    fontSize: 12,
    marginLeft: PADDING_SIZES.sm,
  },
  dropdownContent: {
    borderWidth: DEFAULT_BORDER_WIDTH,
    borderTopWidth: 0,
    borderColor: COLORS.tan50,
    borderBottomLeftRadius: DEFAULT_BORDER_RADIUS,
    borderBottomRightRadius: DEFAULT_BORDER_RADIUS,
    backgroundColor: COLORS.black,
    maxHeight: 300,
  },
  scrollView: {
    maxHeight: 300,
  },
  checkbox: {
    marginVertical: PADDING_SIZES.xs,
  },
  otherInputContainer: {
    marginLeft: PADDING_SIZES.lg,
    marginTop: PADDING_SIZES.xs,
    marginBottom: PADDING_SIZES.sm,
  },
});

