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
    const isLoading = useSelector(isLoadingSelector ?? (() => false));
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
