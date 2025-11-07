import React, { ReactNode, useMemo } from 'react';
import {
    Text,
    StyleSheet,
    TextStyle,
    NativeSyntheticEvent,
    TextLayoutEventData,
} from 'react-native';
import { COLORS } from 'constants/colors';
import { FONT_FAMILIES, FONT_SIZES } from 'constants/typography';
import { MAX_FONT_SIZE_MULTIPLIER } from 'constants/constants';
import { useResponsive } from 'scripts/useResponsive';

export type CustomTextProps = {
    children?: ReactNode | string | string[];
    style?: TextStyle | TextStyle[];
    color?: string;
    fontFamily?: string;
    allowFontScaling?: boolean;
    onPress?: () => void;
    numberOfLines?: number;
    adjustsFontSizeToFit?: boolean;
    onTextLayout?: (event: NativeSyntheticEvent<TextLayoutEventData>) => void;
};

export const CustomText = ({
    children,
    style,
    fontFamily = FONT_FAMILIES.PRIMARY,
    allowFontScaling = true,
    onPress,
    numberOfLines,
    color,
    adjustsFontSizeToFit,
    onTextLayout,
}: CustomTextProps) => {
    const { fontScale } = useResponsive();

    const memoizedStyles = useMemo(() => {
        const flattenedStyle = StyleSheet.flatten(style) as TextStyle;
        const computedSize = flattenedStyle?.fontSize ?? FONT_SIZES.md;
        return StyleSheet.create({
            text: {
                color: color ?? COLORS.white,
                fontFamily: fontFamily,
                ...flattenedStyle,
                fontSize: computedSize * fontScale,
            },
        });
    }, [fontFamily, style, color, fontScale]);

    if (!children) return null;
    return (
        <Text
            adjustsFontSizeToFit={adjustsFontSizeToFit}
            allowFontScaling={allowFontScaling}
            maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
            numberOfLines={numberOfLines}
            // onLongPress={() => console.log('coming soon... copy text if boolean set to true for this component')}
            onPress={onPress}
            onTextLayout={onTextLayout}
            style={memoizedStyles.text}
        >
            {children}
        </Text>
    );
};
