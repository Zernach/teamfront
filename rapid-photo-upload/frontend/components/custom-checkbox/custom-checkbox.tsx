import React, { memo, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, DEFAULT_BORDER_COLOR } from 'constants/colors';
import { CustomText } from 'components/custom-text/CustomText';
import { size } from 'react-native-responsive-sizes';
import { PADDING } from 'constants/styles/commonStyles';
import { DEFAULT_BORDER_WIDTH, DEFAULT_BORDER_RADIUS } from 'constants/Styles';

type CustomCheckboxProps = {
    isChecked?: boolean;
    onPress?: () => void;
    label?: string;
    style?: ViewStyle;
    isDisabled?: boolean;
    footer?: React.ReactNode;
};

export const CustomCheckbox = memo(
    ({
        isChecked,
        onPress,
        label,
        style,
        isDisabled,
        footer,
    }: CustomCheckboxProps) => {
        const memoizedStyles = useMemo(() => {
            return StyleSheet.create({
                container: {
                    alignItems: 'flex-start',
                    marginBottom: PADDING,
                    paddingVertical: size(8),
                    borderWidth: DEFAULT_BORDER_WIDTH,
                    borderRadius: DEFAULT_BORDER_RADIUS,
                    borderColor: isChecked
                        ? COLORS.primary
                        : DEFAULT_BORDER_COLOR,
                    paddingHorizontal: PADDING,
                    marginVertical: PADDING / 2,
                    backgroundColor: COLORS.black,
                    ...style,
                },
                label: {
                    marginLeft: size(8),
                    color: isChecked
                        ? COLORS.primary
                        : footer
                            ? COLORS.white
                            : COLORS.grey,
                },
            });
        }, [isChecked, style, footer]);

        return (
            <TouchableOpacity
                disabled={isDisabled}
                onPress={onPress}
                style={memoizedStyles.container}
            >
                <View style={styles.container}>
                    <View style={styles.checkbox}>
                        {isChecked && <View style={styles.checkedView} />}
                    </View>
                    {!!label && (
                        <CustomText style={memoizedStyles.label}>
                            {label}
                        </CustomText>
                    )}
                </View>
                {footer}
            </TouchableOpacity>
        );
    },
);

CustomCheckbox.displayName = 'CustomCheckbox';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        height: PADDING * 2,
        width: PADDING * 2,
        borderWidth: size(2),
        borderColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedView: {
        height: PADDING * 1.5,
        width: PADDING * 1.5,
        backgroundColor: COLORS.primary,
    },
});
