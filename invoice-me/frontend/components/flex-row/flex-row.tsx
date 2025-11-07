import React, { ReactNode } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';

export const FlexRow = ({
    onLayout,
    children,
    style,
}: {
    onLayout?: (event: LayoutChangeEvent) => void;
    children: ReactNode;
    style?: ViewStyle;
}) => {
    return (
        <View onLayout={onLayout} style={[styles.row, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
});
