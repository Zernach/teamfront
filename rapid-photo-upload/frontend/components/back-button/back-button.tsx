import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { StyleSheet, ViewStyle } from 'react-native';
import { PADDING } from 'constants/styles/commonStyles';
import { FONT_SIZES } from 'constants/typography';

export const BackButton = ({
    style,
    onPressBack,
}: {
    style?: ViewStyle;
    onPressBack?: () => void;
}) => {
    return (
        <TouchableOpacity
            onPress={onPressBack || router.back}
            style={[styles.backButton, style]}
        >
            <Feather color="white" name="arrow-left" size={FONT_SIZES.xl} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    backButton: {
        zIndex: 10,
        marginHorizontal: PADDING,
    },
});
