import { Feather } from '@expo/vector-icons';
import React from 'react';
import { COLORS } from 'constants/colors';
import { StyleProp, TextStyle } from 'react-native';
import { FONT_SIZES } from 'constants/typography';

export const XButton = ({
    onPress,
    style,
    color,
}: {
    color?: string;
    onPress?: () => void;
    style?: StyleProp<TextStyle>;
}) => {
    return (
        <Feather
            color={color ?? COLORS.lightGrey}
            name={'x'}
            onPress={onPress}
            size={FONT_SIZES.xl}
            style={style}
        />
    );
};
