import * as React from 'react';
import { ImageProps, ImageSourcePropType, ImageStyle } from 'react-native';
import { MotiView, useAnimationState } from 'moti';
import { CustomImage } from 'components/custom-image/custom-image';
import {
    CustomImageProps,
} from 'components/custom-image/custom-image';
import { hitSlop } from 'react-native-responsive-sizes';
import { CustomTouchable } from 'components/custom-touchable/custom-touchable';


export const FadeImage = ({
    uri,
    style,
    source,
    placeholder,
    disableFade,
    icon,
    onPress,
    tintColor,
    ...imageProps
}: {
    uri?: string;
    style?: ImageStyle;
    source?: ImageSourcePropType;
    placeholder?: CustomImageProps['placeholder'];
    disableFade?: boolean;
    icon?: React.ReactNode;
    onPress?: () => void;
} & ImageProps) => {
    // Ensure disableFade is always a boolean, not a string
    const isDisabled = Boolean(disableFade);

    const animationState = useAnimationState({
        from: { opacity: isDisabled ? 1 : 0 },
        to: { opacity: 1 },
    });

    // Convert tintColor to string if it's a ColorValue
    const tintColorString = typeof tintColor === 'string' ? tintColor : undefined;

    return (
        <CustomTouchable
            disabled={!onPress}
            hitSlop={hitSlop}
            onPress={onPress}
        >
            <MotiView
                state={animationState}
                // @ts-expect-error - this is fine
                transition={{ type: 'timing', duration: 400 }}
            >
                <CustomImage
                    onLoadEnd={() => animationState.transitionTo('to')}
                    placeholder={placeholder}
                    source={source}
                    style={style}
                    uri={uri}
                    tintColor={tintColorString}
                    {...imageProps}
                />
                {icon}
            </MotiView>
        </CustomTouchable>
    );
};
