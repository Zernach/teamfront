import React from 'react';
import { ViewStyle } from 'react-native';
import { MotiView } from 'moti';

type AnimationType =
    | 'flyFadeInFromBottom'
    | 'fadeIn'
    | 'scaleIn'
    | 'flyFadeInFromTop'
    | 'flyFadeInFromLeft'
    | 'flyFadeInFromRight';

interface AnimateEntranceProps {
    animationType: AnimationType;
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    style?: ViewStyle;
    disabled?: boolean;
}

export const AnimateEntrance = ({
    animationType,
    children,
    delay = 0,
    duration = 500,
    style,
    disabled,
}: AnimateEntranceProps) => {
    // Ensure disabled is always a boolean, not a string
    const isDisabled = Boolean(disabled);
    
    const getAnimationProps = () => {
        switch (animationType) {
            case 'flyFadeInFromBottom':
                return {
                    from: { opacity: 0, translateY: 50 },
                    animate: { opacity: 1, translateY: 0 },
                    exit: { opacity: 0, translateY: 50 },
                };
            case 'fadeIn':
                return {
                    from: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 },
                };
            case 'scaleIn':
                return {
                    from: { opacity: 0, scale: 0.8 },
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 0.8 },
                };
            case 'flyFadeInFromTop':
                return {
                    from: { opacity: 0, translateY: -50 },
                    animate: { opacity: 1, translateY: 0 },
                    exit: { opacity: 0, translateY: -50 },
                };
            case 'flyFadeInFromLeft':
                return {
                    from: { opacity: 0, translateX: -50 },
                    animate: { opacity: 1, translateX: 0 },
                    exit: { opacity: 0, translateX: -50 },
                };
            case 'flyFadeInFromRight':
                return {
                    from: { opacity: 0, translateX: 50 },
                    animate: { opacity: 1, translateX: 0 },
                    exit: { opacity: 0, translateX: 50 },
                };
            default:
                return {
                    from: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 },
                };
        }
    };

    if (isDisabled) {
        return children;
    }

    return (
        <MotiView
            {...getAnimationProps()}
            style={style}
            // @ts-expect-error -  type of 'timing' transition is needed to make it animate/fly into view
            transition={{
                type: 'timing',
                duration,
                delay,
            }}
        >
            {children}
        </MotiView>
    );
};
