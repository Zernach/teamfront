import { isWeb } from 'constants/constants';
import { PADDING } from 'constants/styles/commonStyles';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeepMemo } from 'scripts/useDeepMemo';

export const useResponsive = (props?: { disableWebPadding?: boolean }) => {
    const insets = useSafeAreaInsets();
    const { height, width } = useWindowDimensions();
    const values = useDeepMemo(() => {
        const isWide = width > 600;
        const maxWidth = 800;
        const webHPadding =
            isWeb && isWide ? (width - maxWidth) / 2 : PADDING / 2;
        const webHorizontalPadding = Math.max(
            props?.disableWebPadding ? 0 : webHPadding,
            PADDING / 2,
        );
        return {
            insets,
            height,
            width,
            isWide,
            isUltraWide: width > maxWidth + 200,
            webWidth: width - webHorizontalPadding * 2,
            webHorizontalPadding,
            webPadding: { paddingHorizontal: webHorizontalPadding },
            fontScale: isWide ? 0.8 : 1,
        };
    }, [height, width, insets]);
    return values;
};
