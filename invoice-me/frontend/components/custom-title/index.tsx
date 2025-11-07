import React from 'react';
import { CustomText } from 'components/custom-text/CustomText';
import { COLORS } from 'constants/colors';
import { FONT_FAMILIES, FONT_SIZES } from 'constants/typography';
import { TextStyle, ViewStyle } from 'react-native';
import { CENTER_TEXT } from 'constants/styles/commonStyles';

export type CustomTitleProps = {
    title?: string | React.ReactNode;
    color?: string;
    style?: TextStyle;
    // @ts-expect-error - this is fine
    fontFamily?: FONT_FAMILIES;
    adjustsFontSizeToFit?: boolean;
    numberOfLines?: number;
    containerStyle?: ViewStyle;
};
export const CustomTitle = ({
    title,
    color = COLORS.white,
    style = {},
    fontFamily,
    adjustsFontSizeToFit,
    numberOfLines,
}: CustomTitleProps) => {

    return <CustomText
        adjustsFontSizeToFit={adjustsFontSizeToFit}
        color={color}
        fontFamily={fontFamily || FONT_FAMILIES.BOLD}
        numberOfLines={numberOfLines}
        style={[
            CENTER_TEXT,
            style,
            {
                fontSize: style?.fontSize ?? FONT_SIZES.lg,
            },
        ]}
    >
        {title}
    </CustomText>
};
