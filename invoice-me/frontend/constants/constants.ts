import { Platform } from "react-native";

export const DISABLED_OPACITY = 0.5;
export const MAX_FONT_SIZE_MULTIPLIER = 1.2;

export const isAndroid = Platform.OS === 'android';
export const isIos = Platform.OS === 'ios';
export const isWeb = Platform.OS === 'web';