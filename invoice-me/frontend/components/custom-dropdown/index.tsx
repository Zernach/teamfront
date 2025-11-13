import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    ViewStyle,
} from 'react-native';
import { CustomText } from 'components/custom-text/CustomText';
import { COLORS } from 'constants/colors';
import { PADDING } from 'constants/styles/commonStyles';
import { DEFAULT_BORDER_RADIUS, DEFAULT_BORDER_WIDTH } from 'constants/Styles';
import { FONT_SIZES } from 'constants/typography';
import { Feather } from '@expo/vector-icons';

export type DropdownOption = {
    label: string;
    value: string;
};

export type CustomDropdownProps = {
    options: DropdownOption[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    style?: ViewStyle;
    label?: string;
    errorMessage?: string;
};

export const CustomDropdown = ({
    options,
    value,
    onValueChange,
    placeholder = 'Select an option',
    disabled = false,
    style,
    label,
    errorMessage,
}: CustomDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = useMemo(() => {
        return options.find((option) => option.value === value);
    }, [options, value]);

    const handleSelect = useCallback(
        (optionValue: string) => {
            onValueChange(optionValue);
            setIsOpen(false);
        },
        [onValueChange],
    );

    const memoizedStyles = useMemo(() => {
        return StyleSheet.create({
            container: {
                marginBottom: PADDING,
            },
            dropdownButton: {
                backgroundColor: COLORS.black,
                borderRadius: DEFAULT_BORDER_RADIUS,
                borderWidth: DEFAULT_BORDER_WIDTH,
                borderColor: COLORS.border,
                paddingHorizontal: PADDING,
                paddingVertical: PADDING,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: FONT_SIZES.md + PADDING * 2,
                opacity: disabled ? 0.5 : 1,
            },
            dropdownButtonOpen: {
                borderColor: COLORS.primary,
            },
            dropdownText: {
                fontSize: FONT_SIZES.md,
                color: selectedOption ? COLORS.white : COLORS.textSecondary,
                flex: 1,
            },
            modalOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            },
            modalContent: {
                backgroundColor: COLORS.surface,
                borderRadius: DEFAULT_BORDER_RADIUS,
                maxHeight: '70%',
                width: '85%',
                overflow: 'hidden',
            },
            modalHeader: {
                backgroundColor: COLORS.black,
                padding: PADDING,
                borderBottomWidth: DEFAULT_BORDER_WIDTH,
                borderBottomColor: COLORS.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
            modalHeaderText: {
                fontSize: FONT_SIZES.lg,
                color: COLORS.white,
            },
            optionsList: {
                maxHeight: '100%',
            },
            optionItem: {
                padding: PADDING,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: COLORS.divider,
            },
            optionItemSelected: {
                backgroundColor: COLORS.primary08,
            },
            optionText: {
                fontSize: FONT_SIZES.md,
                color: COLORS.white,
            },
            optionTextSelected: {
                color: COLORS.primary,
                fontWeight: '600',
            },
            emptyState: {
                padding: PADDING * 2,
                alignItems: 'center',
            },
            emptyStateText: {
                fontSize: FONT_SIZES.md,
                color: COLORS.textSecondary,
            },
        });
    }, [disabled, selectedOption]);

    const flattenedContainerStyle = useMemo(() => {
        return StyleSheet.flatten([memoizedStyles.container, style]);
    }, [memoizedStyles.container, style]);

    return (
        <View style={flattenedContainerStyle}>
            {label && (
                <CustomText
                    style={{
                        marginBottom: PADDING / 2,
                        fontSize: FONT_SIZES.md,
                        color: COLORS.white,
                    }}
                >
                    {label}
                </CustomText>
            )}
            
            <TouchableOpacity
                style={[
                    memoizedStyles.dropdownButton,
                    isOpen && memoizedStyles.dropdownButtonOpen,
                ]}
                onPress={() => !disabled && setIsOpen(true)}
                disabled={disabled}
            >
                <CustomText style={memoizedStyles.dropdownText}>
                    {selectedOption ? selectedOption.label : placeholder}
                </CustomText>
                <Feather
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={FONT_SIZES.lg}
                    color={COLORS.textSecondary}
                />
            </TouchableOpacity>

            {errorMessage && (
                <CustomText style={{ color: COLORS.red, fontSize: FONT_SIZES.sm }}>
                    {errorMessage}
                </CustomText>
            )}

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={memoizedStyles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={memoizedStyles.modalContent}>
                        <View style={memoizedStyles.modalHeader}>
                            <CustomText style={memoizedStyles.modalHeaderText}>
                                {label || 'Select an option'}
                            </CustomText>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <Feather
                                    name="x"
                                    size={FONT_SIZES.xl}
                                    color={COLORS.white}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={memoizedStyles.optionsList}>
                            {options.length === 0 ? (
                                <View style={memoizedStyles.emptyState}>
                                    <CustomText style={memoizedStyles.emptyStateText}>
                                        No options available
                                    </CustomText>
                                </View>
                            ) : (
                                options.map((option) => {
                                    const isSelected = option.value === value;
                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                memoizedStyles.optionItem,
                                                isSelected && memoizedStyles.optionItemSelected,
                                            ]}
                                            onPress={() => handleSelect(option.value)}
                                        >
                                            <CustomText
                                                style={[
                                                    memoizedStyles.optionText,
                                                    isSelected && memoizedStyles.optionTextSelected,
                                                ]}
                                            >
                                                {option.label}
                                            </CustomText>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};


