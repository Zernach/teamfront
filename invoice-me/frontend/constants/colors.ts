// constants/colors.ts
import { TextInputProps } from 'react-native';

export const Colors = {
  primary: '#72fa41',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  background: '#1c1c1c',
  surface: '#2c2c2c',
  white: '#F0F0F0',
  text: '#F0F0F0',
  textPrimary: '#F0F0F0',
  textSecondary: '#909090',
  border: '#404040',
  divider: '#353535',
  // Additional colors used by components
  primary80: '#72fa41CC',
  primary08: '#72fa4114',
  lightBrown: '#8B7355',
  lightBrown50: '#8B735580',
  darkBrown: '#5C4A37',
  black: '#000000',
  grey: '#808080',
  lightGrey: '#C0C0C0',
  red: '#FF3B30',
  transparent: 'transparent',
};

// Export uppercase version for compatibility with existing components
export const COLORS = Colors;

// Export additional constants for existing components
export const DEFAULT_BORDER_COLOR = Colors.border;
export const TEXT_INPUT_COLORS: TextInputProps = {
  selectionColor: Colors.textSecondary,
  cursorColor: Colors.white,
  selectionHandleColor: Colors.textSecondary,
  placeholderTextColor: Colors.textSecondary,
  keyboardAppearance: 'dark' as const,
};

