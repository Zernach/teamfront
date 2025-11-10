import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';
import { COLORS } from 'constants/colors';
import { useSelector } from 'react-redux';
import { XOR } from 'constants/types/app-types';

type CustomLoadingSpinnerProps = Omit<ActivityIndicatorProps, 'animating'> &
    XOR<{ animating: boolean }, { isLoadingSelector: (state: any) => boolean }>;

export const LoadingSpinner = ({
    animating,
    isLoadingSelector,
    ...restOfProps
}: CustomLoadingSpinnerProps) => {
    // Always call useSelector (hooks must be called unconditionally)
    // Use a safe selector that returns false if no selector is provided
    const isLoading = useSelector(isLoadingSelector ?? ((state: any) => false));
    const loading = animating || isLoading;
    if (!loading) {
        return null;
    }
    return (
        <ActivityIndicator
            animating={animating || isLoading}
            color={COLORS.white}
            size={'large'}
            {...restOfProps}
        />
    );
};
