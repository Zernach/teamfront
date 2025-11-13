import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { StyleSheet, ViewStyle } from 'react-native';
import { CustomImage } from '../custom-image/custom-image';

export const HomeButton = ({
    style,
    onPressHome,
    size = 36,
}: {
    style?: ViewStyle;
    onPressHome?: () => void;
    size?: number;
}) => {
    return (
        <TouchableOpacity
            onPress={onPressHome || (() => router.replace('/'))}
            style={[styles.homeButton, style, { width: size, height: size }]}
        >
            <CustomImage
                source={require('../../assets/icon.png')}
                style={{
                    width: size,
                    height: size,
                }}
                disableBackground
                width={size}
                height={size}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    homeButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
});

