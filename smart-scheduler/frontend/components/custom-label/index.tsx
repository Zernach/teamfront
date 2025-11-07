import React, { useMemo } from 'react';
import { CustomText } from 'components/custom-text/CustomText';
import { COLORS } from 'constants/colors';
import { size } from 'react-native-responsive-sizes';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { DISABLED_OPACITY } from 'constants/constants';
import { PADDING } from 'constants/styles/commonStyles';

export const CustomLabel = ({
    title,
    color = COLORS.white,
    disabled,
    style,
    containerStyle,
}: {
    title?: string;
    color?: string;
    informationIconText?: string;
    disabled?: boolean;
    style?: TextStyle;
    containerStyle?: ViewStyle;
}) => {
    const memoizedStyles = useMemo(() => {
        const margin = size(6);
        return StyleSheet.create({
            title: {
                color,
                ...style,
            },
            diabledOpacity: {
                opacity: disabled ? DISABLED_OPACITY : undefined,
                flex: undefined,
                marginRight: PADDING,
                marginBottom: margin,
                ...containerStyle,
            },
        });
    }, [color, style, disabled, containerStyle]);


    if (!title) return null;

    return <CustomText style={memoizedStyles.title}>{title}</CustomText>
};
