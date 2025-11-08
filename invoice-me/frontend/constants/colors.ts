// constants/colors.ts
export const Colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  divider: '#E5E5EA',
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

