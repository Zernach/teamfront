import React, { useMemo } from 'react';
import {
    Pressable,
    ViewStyle,
    StyleSheet,
    PressableProps,
    StyleProp,
} from 'react-native';
import { CustomText } from 'components/custom-text/CustomText';
import { COLORS } from 'constants/colors';
import { PADDING } from 'constants/styles/commonStyles';
import { DEFAULT_BORDER_RADIUS } from 'constants/Styles';
import { DISABLED_OPACITY } from 'constants/constants';

export type CustomButtonProps = {
    title?: string;
    onPress?: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<ViewStyle>;
    backgroundColor?: string;
    textColor?: string;
    hitSlop?: PressableProps['hitSlop'];
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
};

export const CustomButton = ({
    title,
    onPress,
    disabled = false,
    style,
    textStyle,
    backgroundColor,
    textColor,
    hitSlop,
    children,
    variant = 'primary',
}: CustomButtonProps) => {

    const memoizedStyles = useMemo(() => {
        const getBackgroundColor = () => {
            if (backgroundColor) return backgroundColor;
            if (variant === 'primary') return COLORS.primary;
            if (variant === 'secondary') return COLORS.lightBrown;
            if (variant === 'outline') return COLORS.transparent;
            return COLORS.primary;
        };

        const getTextColor = () => {
            if (textColor) return textColor;
            if (variant === 'outline') return COLORS.primary;
            // Use black text for primary buttons (green background #72fa41)
            if (variant === 'primary') return COLORS.black;
            return COLORS.white;
        };

        return StyleSheet.create({
            button: {
                backgroundColor: getBackgroundColor(),
                paddingHorizontal: PADDING * 2,
                paddingVertical: PADDING,
                borderRadius: DEFAULT_BORDER_RADIUS,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: disabled ? DISABLED_OPACITY : 1,
                borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth * 2 : 0,
                borderColor: variant === 'outline' ? COLORS.primary : COLORS.transparent,
            },
            text: {
                color: getTextColor(),
            },
        });
    }, [backgroundColor, textColor, variant, disabled]);

    const flattenedButtonStyle = useMemo(() => {
        return StyleSheet.flatten([memoizedStyles.button, style]);
    }, [memoizedStyles.button, style]);

    const flattenedTextStyle = useMemo(() => {
        return StyleSheet.flatten([memoizedStyles.text, textStyle]);
    }, [memoizedStyles.text, textStyle]);

    return (
        <Pressable
            disabled={disabled}
            hitSlop={hitSlop}
            onPress={onPress}
            style={({ pressed }) => [
                flattenedButtonStyle,
                pressed && !disabled && { opacity: 0.7 },
            ]}
        >
            {title ? (
                <CustomText style={flattenedTextStyle}>{title}</CustomText>
            ) : (
                children
            )}
        </Pressable>
    );
};

