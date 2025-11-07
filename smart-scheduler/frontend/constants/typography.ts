import { Platform } from 'react-native';

// fontFamily: 'SF-Pro-Rounded-Bold',
export const FONT_FAMILIES = {
    PRIMARY: Platform.OS === 'android' ? 'Roboto' : 'OpenSansRegular',
    BOLD: Platform.OS === 'android' ? 'Roboto' : 'OpenSansBold',
    ITALIC: Platform.OS === 'android' ? 'Roboto' : 'HelveticaNeue-Italic',
};

export const FONT_SIZES = {
    ['2xs']: 8,
    ['xs']: 10,
    ['sm']: 12,
    ['md']: 14,
    ['lg']: 18,
    ['xl']: 24,
    ['2xl']: 32,
    ['3xl']: 48,
    ['4xl']: 72,
    ['5xl']: 96,
};
