import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { COLORS } from 'constants/colors';
import { DEFAULT_BORDER_RADIUS } from 'constants/Styles';

// Sizes
export const PADDING = 8;
export const IMAGE_SIZE = 150;
export const MAX_BUTTON_HEIGHT = 32;
export const DOT_SIZE = PADDING;

// Padding object for convenience
export const PADDING_SIZES = {
  xs: PADDING / 2,
  sm: PADDING,
  md: PADDING * 2,
  lg: PADDING * 3,
  xl: PADDING * 4,
};

// Styles
export const FLEX_STYLE = { flex: 1 };
export const GAP_STYLE = { gap: PADDING };
export const MARGIN_STYLE = { margin: PADDING };
export const PADDING_STYLE = { padding: PADDING };
export const CENTER_TEXT: TextStyle = { textAlign: 'center' };
export const UNDERLINED_TEXT: TextStyle = { textDecorationLine: 'underline' };
export const SPACE_BETWEEN: ViewStyle = { justifyContent: 'space-between' };
export const STRIKETHROUGH_RED_TEXT: TextStyle = {
    textDecorationLine: 'line-through',
    color: COLORS.red,
};

export const FLATLIST_STYLE = {
    gap: StyleSheet.hairlineWidth * 2,
    borderRadius: DEFAULT_BORDER_RADIUS,
    backgroundColor: COLORS.lightBrown,
};

