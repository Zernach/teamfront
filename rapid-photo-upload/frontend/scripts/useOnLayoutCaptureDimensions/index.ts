import { useCallback, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';

export const useOnLayoutCaptureDimensions = (defaultDimensions?: {
    height: number;
    width: number;
}) => {
    const [dimensions, setDimensions] = useState(
        defaultDimensions ?? {
            height: 0,
            width: 0,
        },
    );

    const onLayoutCaptureDimensions = useCallback(
        (event: LayoutChangeEvent) => {
            const { height, width } = event.nativeEvent.layout;
            setDimensions({ height, width });
        },
        [],
    );

    return {
        dimensions,
        onLayoutCaptureDimensions,
    };
};
