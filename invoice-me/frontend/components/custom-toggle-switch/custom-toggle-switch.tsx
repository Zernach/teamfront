import React, { useEffect, useState } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { COLORS } from 'constants/colors';
import { CustomText } from 'components/custom-text/CustomText';
import { CustomLabel } from 'components/custom-label';
import { DISABLED_OPACITY } from 'constants/constants';
import { PADDING } from 'constants/styles/commonStyles';

export type CustomToggleSwitchProps = {
    label?: string;
    initialValue?: string;
    onValueChange?: (value: string) => void;
    informationIconText?: string;
    toggleNames?: {
        true: string;
        false: string;
    };
    incomingValue?: string;
    isEnabled?: string;
};

export const CustomToggleSwitch = ({
    label,
    initialValue,
    informationIconText,
    onValueChange,
    toggleNames,
    incomingValue,
    isEnabled = 'false',
}: CustomToggleSwitchProps) => {
    const [value, setValue] = useState(initialValue);
    const isDisabled = isEnabled === 'false' ? false : true;

    useEffect(() => {
        if (incomingValue === undefined) return;
        setValue(incomingValue);
    }, [incomingValue]);

    const onPressSwitch = (newValue: string) => {
        onValueChange?.(newValue);
        setValue(newValue);
    };

    return (
        <View style={styles.container}>
            <CustomLabel
                color={COLORS.white}
                disabled={isDisabled}
                informationIconText={informationIconText}
                title={label}
            />
            <View style={styles.innerContainer}>
                <Switch
                    disabled={isDisabled}
                    ios_backgroundColor={COLORS.grey}
                    onValueChange={newValue =>
                        onPressSwitch(newValue?.toString() ?? 'false')
                    }
                    thumbColor={value === 'true' ? COLORS.primary : COLORS.red}
                    trackColor={{ false: COLORS.grey, true: COLORS.grey }}
                    value={value === 'true' ? true : false}
                />
                <CustomText
                    style={[styles.text, isDisabled ? styles.disabled : {}]}
                >
                    {toggleNames
                        ? value === 'true'
                            ? toggleNames.true
                            : toggleNames.false
                        : value === 'true'
                            ? 'Yes'
                            : 'No'}
                </CustomText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: PADDING,
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        marginLeft: PADDING,
        flexShrink: 1,
    },
    disabled: {
        opacity: DISABLED_OPACITY,
    },
});
