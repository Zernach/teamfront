import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Screen } from '../components/screen';
import { AppIcon } from '../components/app-icon';
import { CustomButton } from '../components/custom-button';
import { COLORS } from '../constants/colors';

export default function NotFoundScreen() {
    const router = useRouter();

    return (
        <>
            <Stack.Screen options={{ title: "Page Not Found" }} />
            <Screen style={styles.container}>
                <View style={styles.topBar}>
                    <AppIcon size={36} />
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>404</Text>
                    <Text style={styles.subtitle}>Page Not Found</Text>
                    <Text style={styles.description}>
                        The page you're looking for doesn't exist.
                    </Text>
                    <CustomButton
                        title="Go to Home"
                        onPress={() => router.replace('/')}
                        style={styles.button}
                    />
                </View>
            </Screen>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.tan50,
    },
    content: {
        alignItems: 'center',
        padding: 20,
        maxWidth: 400,
    },
    title: {
        color: COLORS.white,
        fontSize: 72,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 12,
    },
    description: {
        color: COLORS.grey,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    button: {
        minWidth: 200,
    },
});
