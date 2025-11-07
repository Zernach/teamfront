import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export const FlexView = ({
    children,
    style,
}: {
    children?: ReactNode;
    style?: ViewStyle;
}) => {
    return <View style={[styles.flex, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
});
