import React from 'react';
import { ViewStyle, PressableProps, TouchableOpacity } from 'react-native';

type CustomTouchableProps = {
    onPress?: () => void;
    children: React.ReactNode;
    hitSlop?: PressableProps['hitSlop'];
    disabled?: boolean;
    style?: ViewStyle;
};

export const CustomTouchable = ({
    onPress,
    children,
    hitSlop,
    disabled,
    style,
}: CustomTouchableProps) => {

    return (
        <TouchableOpacity
            disabled={disabled}
            hitSlop={hitSlop}
            onPress={onPress}
            style={style}
        >
            {children}
        </TouchableOpacity>
    );
};
