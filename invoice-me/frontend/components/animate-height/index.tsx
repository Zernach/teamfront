import { useDynamicAnimation, View as MotiView } from 'moti';
import React, { ReactNode, memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type AnimateHeightProps = {
    //https://gist.github.com/nandorojo/8fd2b0f5bd5e75073dcce5a17a6346e4
    hideHeight?: number;
    children?: ReactNode;
    initialHeight?: number;
    onHeightDidAnimate?: (height: number) => void;
    hide?: boolean;
    enterFrom?: 'bottom' | 'top';
    style?: ViewStyle;
    disabled?: boolean;
};

export const AnimateHeight = memo(
    ({
        children,
        hide = false,
        style,
        enterFrom = 'top',
        onHeightDidAnimate,
        initialHeight = 0,
        hideHeight = 0,
        disabled,
    }: AnimateHeightProps) => {
        // Ensure boolean props are always booleans, not strings
        const isHidden = Boolean(hide);
        const isDisabled = Boolean(disabled);
        
        const animation = useDynamicAnimation(() => ({
            height: isHidden ? hideHeight : initialHeight,
        }));
        const [measuredHeight, setHeight] = useState(initialHeight);
        const currentAnimatingHeightRef = useRef<number | null>(null);
        const mounted = useRef(false);

        let height = measuredHeight;

        if (isHidden) {
            height = hideHeight;
        }

        useEffect(() => {
            mounted.current = true;
            return () => {
                mounted.current = false;
            };
        }, []);

        useEffect(() => {
            if (isHidden) {
                if (currentAnimatingHeightRef.current !== hideHeight) {
                    currentAnimatingHeightRef.current = hideHeight;
                    animation.animateTo({
                        height: hideHeight,
                    });
                }
            } else if (animation.current?.height !== height) {
                if (currentAnimatingHeightRef.current !== height) {
                    currentAnimatingHeightRef.current = height;
                    animation.animateTo({
                        height,
                    });
                }
            }
        }, [animation, height, isHidden, hideHeight]);

        if (isDisabled) {
            return <View style={style}>{children}</View>;
        }

        return (
            <MotiView
                animate={{ opacity: 1, scale: 1 }}
                from={{ opacity: 0, scale: 0.1 }}
                onDidAnimate={
                    onHeightDidAnimate &&
                    (key => key === 'height' && onHeightDidAnimate?.(height))
                }
                state={animation}
                style={StyleSheet.flatten([
                    height || isHidden ? styles.hidden : styles.visible,
                    style,
                ])}
                // @ts-expect-error - this type works fine
                transition={{
                    type: 'timing',
                    scale: { type: 'no-animation' },
                    duration: 600,
                }}
            >
                <View
                    onLayout={next => {
                        if (mounted.current) {
                            setHeight(next.nativeEvent.layout.height);
                        }
                    }}
                    style={StyleSheet.flatten([
                        StyleSheet.absoluteFillObject,
                        enterFrom === 'top'
                            ? styles.autoBottom
                            : styles.autoTop,
                    ])}
                >
                    {children}
                </View>
            </MotiView>
        );
    },
);

AnimateHeight.displayName = 'AnimateHeight';

const styles = StyleSheet.create({
    autoBottom: {
        bottom: 'auto',
    },
    autoTop: {
        top: 'auto',
    },
    hidden: {
        overflow: 'hidden',
    },
    visible: {
        overflow: 'visible',
    },
});
