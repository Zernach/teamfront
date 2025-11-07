import {
    // eslint-disable-next-line import/named
    Image as ExpoImage,
    // eslint-disable-next-line import/named
    ImageSource,
    // eslint-disable-next-line import/named
    ImageProps as ExpoImageProps,
} from 'expo-image';
import * as React from 'react';
import {
    ImageProps,
    ImageSourcePropType,
    ImageStyle,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { COLORS } from 'constants/colors';
import { useMemo, useState } from 'react';
import { LoadingSpinner } from 'components/loading-spinner/loading-spinner';
import { useOnLayoutCaptureDimensions } from 'scripts/useOnLayoutCaptureDimensions';
import { addImageToCache, isImageCached } from 'scripts/expoImageCache';

export type CustomImageProps = {
    uri?: string;
    style?: ImageStyle;
    blurRadius?: ImageProps['blurRadius'];
    tintColor?: string | null | undefined;
    source?: ImageSourcePropType;
    priority?: ExpoImageProps['priority'];
    containerStyle?: ViewStyle;
    placeholder?:
    | string
    | number
    | string[]
    | ImageSource
    | ImageSource[]
    | null
    | undefined;
    recyclingKey?: string;
    backgroundColor?: string;
    disableBackground?: boolean;
    children?: React.ReactNode;
} & Omit<ImageProps, 'style'>;

export const CustomImage = ({
    uri,
    style,
    source,
    priority,
    tintColor,
    blurRadius,
    children,
    onLoadEnd,
    recyclingKey,
    backgroundColor = COLORS.white,
    disableBackground,
    containerStyle,
}: CustomImageProps) => {
    const isCached = uri ? isImageCached(uri) : false;
    const [hasLoaded, setHasLoaded] = useState(isCached);
    const { onLayoutCaptureDimensions, dimensions } =
        useOnLayoutCaptureDimensions();

    const memoizedStyle = useMemo(
        () =>
            StyleSheet.flatten([
                {
                    opacity: hasLoaded ? 1 : 0.5,
                    backgroundColor: !uri
                        ? 'transparent'
                        : disableBackground
                            ? 'transparent'
                            : backgroundColor,
                },
                style,
            ]),
        [hasLoaded, uri, disableBackground, backgroundColor, style],
    );

    const handleLoad = () => {
        if (uri) {
            addImageToCache(uri);
        }
        setHasLoaded(true);
        if (onLoadEnd) {
            onLoadEnd();
        }
    };

    return (
        <View style={containerStyle}>
            <ExpoImage
                blurRadius={blurRadius}
                contentFit="cover"
                onLayout={onLayoutCaptureDimensions}
                onLoad={handleLoad}
                onLoadEnd={onLoadEnd}
                placeholderContentFit="cover"
                priority={priority}
                recyclingKey={recyclingKey ?? uri}
                source={uri ? { uri } : source}
                style={memoizedStyle}
                tintColor={tintColor}
            />
            {/*
            DO NOT PUT CHILDREN INSIDE OF THE <ExpoImage/> COMPONENT due to ExpoWeb incompatability.
            If you want the children to look like they're "inside" of the image,
            then please pass in children that are wrapped in a <View/> with a position of 'absolute'.
            */}
            <View
                style={[
                    styles.container,
                    { height: dimensions?.height, width: dimensions?.width },
                ]}
            >
                {children}
                <LoadingSpinner
                    animating={(!!uri || !!source) && !hasLoaded}
                    color={COLORS.lightGrey}
                    size={'small'}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        position: 'absolute',
        alignSelf: 'center',
        justifyContent: 'center',
    },
});
