import React from 'react';
import { height } from 'react-native-responsive-sizes';
import { COLORS } from 'constants/colors';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { PADDING } from 'constants/styles/commonStyles';
import { AnimateHeight } from 'components/animate-height';
import { DEFAULT_BORDER_RADIUS, DEFAULT_BORDER_WIDTH } from 'constants/Styles';

export const CustomCard = ({
    renderHeader,
    renderMiddle,
    renderFooter,
    headerStyle,
    bodyStyle,
    footerStyle,
    shouldAnimate,
    style,
}: {
    renderHeader: React.ReactNode;
    renderMiddle: React.ReactNode;
    renderFooter: React.ReactNode;
    headerStyle?: ViewStyle;
    bodyStyle?: ViewStyle;
    footerStyle?: ViewStyle;
    shouldAnimate?: boolean;
    style?: ViewStyle;
}) => {
    const Content = (
        <View style={[styles.container, style]}>
            <View style={[styles.header, headerStyle]}>{renderHeader}</View>
            <View style={[styles.body, bodyStyle]}>{renderMiddle}</View>
            <View style={[styles.footer, footerStyle]}>{renderFooter}</View>
        </View>
    );
    if (shouldAnimate) {
        return <AnimateHeight>{Content}</AnimateHeight>;
    }
    return Content;
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: PADDING,
        paddingBottom: height(2),
        flex: 1,
    },
    header: {
        width: '100%',
        backgroundColor: COLORS.darkBrown,
        borderTopRightRadius: DEFAULT_BORDER_RADIUS,
        borderTopLeftRadius: DEFAULT_BORDER_RADIUS,
        padding: PADDING,
        flexDirection: 'row',
    },
    body: {
        borderRightWidth: DEFAULT_BORDER_WIDTH,
        borderLeftWidth: DEFAULT_BORDER_WIDTH,
        borderColor: COLORS.darkBrown,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: PADDING,
        borderBottomRightRadius: DEFAULT_BORDER_RADIUS,
        borderBottomLeftRadius: DEFAULT_BORDER_RADIUS,
        backgroundColor: COLORS.darkBrown,
    },
});
