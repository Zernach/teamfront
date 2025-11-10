// components/filter-buttons/index.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export interface FilterButtonsProps {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.filterButton,
            selectedValue === option && styles.filterButtonActive,
          ]}
          onPress={() => onSelect(option)}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedValue === option && styles.filterButtonTextActive,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: Colors.surface,
    fontWeight: '600',
  },
});

