import React, { useMemo, useState } from 'react';
import { CustomText } from 'components/custom-text/CustomText';
import * as Clipboard from 'expo-clipboard';
import { size } from 'react-native-responsive-sizes';
import { COLORS } from 'constants/colors';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { FONT_FAMILIES, FONT_SIZES } from 'constants/typography';
import { onlyText } from 'scripts/getOnlyTextFromChildren';
import { Feather } from '@expo/vector-icons';
import { PADDING } from 'constants/styles/commonStyles';
import { DEFAULT_BORDER_RADIUS } from 'constants/Styles';
import { SmallMediumLarge } from 'constants/types/app-types';
import { CustomTouchable } from 'components/custom-touchable/custom-touchable';

export const CopiableText = ({
    size = 'md',
    textColor,
    children,
    style,
}: {
    textColor?: string;
    size?: SmallMediumLarge;
    children: React.ReactNode;
    style?: ViewStyle;
}) => {
    const [copied, setCopied] = useState(false);

    const onPressCopyMessage = async () => {
        const text = onlyText(children);
        if (text) {
            await Clipboard.setStringAsync(text);
            notifyUser();
        }
    };

    const notifyUser = () => {
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const sizes = useMemo(() => {
        switch (size) {
            case 'sm':
                return {
                    textCopied: FONT_SIZES['sm'],
                    textRest: FONT_SIZES['xs'],
                    iconCopied: FONT_SIZES['xl'],
                    iconRest: FONT_SIZES['lg'],
                    copyText: FONT_SIZES['xs'],
                };
            case 'lg':
                return {
                    textCopied: FONT_SIZES['xl'],
                    textRest: FONT_SIZES['md'],
                    iconCopied: FONT_SIZES['3xl'],
                    iconRest: FONT_SIZES['2xl'],
                    copyText: FONT_SIZES['md'],
                };
            default:
                // default to 'md'
                return {
                    textCopied: FONT_SIZES['xl'],
                    textRest: FONT_SIZES['md'],
                    iconCopied: FONT_SIZES['3xl'],
                    iconRest: FONT_SIZES['2xl'],
                    copyText: FONT_SIZES['md'],
                };
        }
    }, [size]);

    return (
        <CustomTouchable onPress={onPressCopyMessage} style={styles.flex}>
            <View
                style={[
                    styles.container,
                    copied ? { borderColor: COLORS.primary80 } : {},
                    style ?? {},
                ]}
            >
                <CustomText
                    color={copied ? COLORS.primary : textColor}
                    fontFamily={
                        copied ? FONT_FAMILIES.BOLD : FONT_FAMILIES.PRIMARY
                    }
                    style={[
                        styles.flex,
                        {
                            fontSize: copied
                                ? sizes.textCopied
                                : sizes.textRest,
                        },
                    ]}
                >
                    {copied ? 'Copied!' : children}
                </CustomText>
                <View style={{ marginLeft: PADDING }}>
                    <Feather
                        color={copied ? COLORS.primary : COLORS.white}
                        name={copied ? 'check' : 'copy'}
                        size={copied ? sizes.iconCopied : sizes.iconRest}
                        style={styles.iconRight}
                    />
                    <CustomText
                        style={[styles.copyText, { fontSize: sizes.copyText }]}
                    >
                        {copied ? '' : 'Copy'}
                    </CustomText>
                </View>
            </View>
        </CustomTouchable>
    );
};
const styles = StyleSheet.create({
    container: {
        borderRadius: DEFAULT_BORDER_RADIUS,
        padding: size(15),
        paddingVertical: size(5),
        backgroundColor: COLORS.lightBrown50,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconRight: {
        alignSelf: 'center',
    },
    flex: {
        flex: 1,
    },
    copyText: {
        color: COLORS.lightGrey,
        alignSelf: 'center',
    },
});
