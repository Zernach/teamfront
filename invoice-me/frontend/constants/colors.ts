// constants/colors.ts
export const Colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#1c1c1c',
  surface: '#2c2c2c',
  white: '#F0F0F0',
  text: '#F0F0F0',
  textPrimary: '#F0F0F0',
  textSecondary: '#909090',
  border: '#404040',
  divider: '#353535',
};

// Export uppercase version for compatibility with existing components
export const COLORS = Colors;

// Export additional constants for existing components
export const DEFAULT_BORDER_COLOR = Colors.border;
export const TEXT_INPUT_COLORS = {
  border: Colors.border,
  text: Colors.text,
  placeholder: Colors.textSecondary,
};

