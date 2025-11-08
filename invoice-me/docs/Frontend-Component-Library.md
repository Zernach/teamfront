# InvoiceMe Frontend Component Library
## Complete Reusable Component Specifications

**Document Version:** 1.0
**Last Updated:** 2025-11-08
**Target Framework:** React Native with TypeScript

---

## Table of Contents

1. [Design System Foundation](#design-system-foundation)
2. [Atomic Components](#atomic-components)
3. [Molecule Components](#molecule-components)
4. [Organism Components](#organism-components)
5. [Template Components](#template-components)
6. [Form Components](#form-components)
7. [Navigation Components](#navigation-components)
8. [Feedback Components](#feedback-components)
9. [Data Display Components](#data-display-components)
10. [Usage Guidelines](#usage-guidelines)

---

## 1. Design System Foundation

### 1.1 Theme Configuration

```typescript
// theme/tokens.ts

export const colors = {
  // Primary palette
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#007AFF', // Primary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Semantic colors
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    500: '#34C759', // Main success
    700: '#2E7D32',
    900: '#1B5E20',
  },

  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    500: '#FF9500', // Main warning
    700: '#F57C00',
    900: '#E65100',
  },

  danger: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    500: '#FF3B30', // Main danger
    700: '#D32F2F',
    900: '#B71C1C',
  },

  info: {
    50: '#E8EAF6',
    100: '#C5CAE9',
    500: '#5856D6', // Main info
    700: '#512DA8',
    900: '#311B92',
  },

  // Neutral palette
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Status colors (for invoices)
  status: {
    draft: '#8E8E93',
    sent: '#007AFF',
    paid: '#34C759',
    overdue: '#FF3B30',
    cancelled: '#8E8E93',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#E5E5EA',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: '#000000',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
    disabled: '#D1D1D6',
    inverse: '#FFFFFF',
  },

  // Border colors
  border: {
    light: '#E5E5EA',
    medium: '#C6C6C8',
    dark: '#8E8E93',
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
};

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },

  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 34,
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const transitions = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export const breakpoints = {
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
};
```

### 1.2 Theme Provider Setup

```typescript
// theme/ThemeProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { colors, spacing, typography, shadows, borderRadius } from './tokens';

export interface Theme {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
}

const ThemeContext = createContext<Theme | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme: Theme = {
    colors,
    spacing,
    typography,
    shadows,
    borderRadius,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

---

## 2. Atomic Components

### 2.1 Button Component

```typescript
// components/atoms/Button/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /**
   * Button text content
   */
  children: string;

  /**
   * Button click handler
   */
  onPress: () => void;

  /**
   * Visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Whether button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether button is in loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Whether button should take full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Optional icon component to display before text
   */
  leftIcon?: React.ReactNode;

  /**
   * Optional icon component to display after text
   */
  rightIcon?: React.ReactNode;

  /**
   * Custom style overrides
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  testID,
}) => {
  const theme = useTheme();

  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    getVariantStyles(variant, theme, isDisabled),
    getSizeStyles(size, theme),
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    getTextVariantStyles(variant, theme, isDisabled),
    getTextSizeStyles(size, theme),
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary[500] : theme.colors.text.inverse}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={textStyles}>{children}</Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

function getVariantStyles(variant: ButtonVariant, theme: Theme, disabled: boolean): ViewStyle {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.colors.primary[500],
        borderWidth: 0,
      };
    case 'secondary':
      return {
        backgroundColor: theme.colors.gray[200],
        borderWidth: 0,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border.medium,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
    case 'danger':
      return {
        backgroundColor: theme.colors.danger[500],
        borderWidth: 0,
      };
  }
}

function getSizeStyles(size: ButtonSize, theme: Theme): ViewStyle {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        minHeight: 32,
      };
    case 'md':
      return {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.base,
        minHeight: 44,
      };
    case 'lg':
      return {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        minHeight: 52,
      };
  }
}

function getTextVariantStyles(variant: ButtonVariant, theme: Theme, disabled: boolean): TextStyle {
  switch (variant) {
    case 'primary':
    case 'danger':
      return {
        color: theme.colors.text.inverse,
      };
    case 'secondary':
      return {
        color: theme.colors.text.primary,
      };
    case 'outline':
    case 'ghost':
      return {
        color: theme.colors.primary[500],
      };
  }
}

function getTextSizeStyles(size: ButtonSize, theme: Theme): TextStyle {
  switch (size) {
    case 'sm':
      return {
        fontSize: theme.typography.fontSize.sm,
      };
    case 'md':
      return {
        fontSize: theme.typography.fontSize.base,
      };
    case 'lg':
      return {
        fontSize: theme.typography.fontSize.md,
      };
  }
}
```

**Usage Examples:**

```typescript
// Basic usage
<Button onPress={() => console.log('Clicked')}>
  Save Changes
</Button>

// With variant and size
<Button
  variant="outline"
  size="lg"
  onPress={handleSubmit}
>
  Submit
</Button>

// Loading state
<Button loading={isLoading} onPress={handleSave}>
  Save
</Button>

// With icons
<Button
  leftIcon={<Icon name="plus" size={16} />}
  onPress={handleCreate}
>
  Create Invoice
</Button>

// Full width
<Button fullWidth variant="danger" onPress={handleDelete}>
  Delete Customer
</Button>
```

---

### 2.2 Input Component

```typescript
// components/atoms/Input/Input.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Whether label should show required asterisk
   * @default false
   */
  required?: boolean;

  /**
   * Helper text displayed below input
   */
  helperText?: string;

  /**
   * Error message (overrides helperText when present)
   */
  error?: string;

  /**
   * Whether input has an error state
   * @default false
   */
  hasError?: boolean;

  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;

  /**
   * Whether input is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Container style overrides
   */
  containerStyle?: ViewStyle;

  /**
   * Input style overrides
   */
  inputStyle?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  required = false,
  helperText,
  error,
  hasError = false,
  leftIcon,
  rightIcon,
  disabled = false,
  size = 'md',
  containerStyle,
  inputStyle,
  testID,
  ...textInputProps
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const showError = hasError || !!error;

  const containerStyles = [
    styles.container,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    getSizeStyles(size, theme),
    isFocused && styles.focused,
    showError && styles.error,
    disabled && styles.disabled,
  ];

  const textInputStyles = [
    styles.input,
    getInputSizeStyles(size, theme),
    leftIcon && { paddingLeft: 0 },
    rightIcon && { paddingRight: 0 },
    inputStyle,
  ];

  return (
    <View style={containerStyles} testID={testID}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={inputContainerStyles}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          {...textInputProps}
          style={textInputStyles}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          editable={!disabled}
          placeholderTextColor={theme.colors.text.tertiary}
        />

        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>

      {(error || helperText) && (
        <Text style={[styles.helperText, showError && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  required: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C6C6C8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  focused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  error: {
    borderColor: '#FF3B30',
  },
  disabled: {
    backgroundColor: '#F2F2F7',
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  leftIconContainer: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  rightIconContainer: {
    paddingRight: 12,
    paddingLeft: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  errorText: {
    color: '#FF3B30',
  },
});

function getSizeStyles(size: 'sm' | 'md' | 'lg', theme: Theme): ViewStyle {
  switch (size) {
    case 'sm':
      return { paddingVertical: 6, paddingHorizontal: 12 };
    case 'md':
      return { paddingVertical: 10, paddingHorizontal: 16 };
    case 'lg':
      return { paddingVertical: 14, paddingHorizontal: 16 };
  }
}

function getInputSizeStyles(size: 'sm' | 'md' | 'lg', theme: Theme): ViewStyle {
  switch (size) {
    case 'sm':
      return { fontSize: theme.typography.fontSize.sm, minHeight: 32 };
    case 'md':
      return { fontSize: theme.typography.fontSize.base, minHeight: 44 };
    case 'lg':
      return { fontSize: theme.typography.fontSize.md, minHeight: 52 };
  }
}
```

**Usage Examples:**

```typescript
// Basic input
<Input
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>

// Required field with error
<Input
  label="First Name"
  required
  value={firstName}
  onChangeText={setFirstName}
  error={errors.firstName}
  hasError={!!errors.firstName}
/>

// With icons
<Input
  label="Search"
  placeholder="Search customers..."
  leftIcon={<Icon name="search" size={20} color="#8E8E93" />}
  value={searchTerm}
  onChangeText={setSearchTerm}
/>

// Password input with show/hide
<Input
  label="Password"
  secureTextEntry={!showPassword}
  rightIcon={
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <Icon name={showPassword ? "eye-off" : "eye"} size={20} />
    </TouchableOpacity>
  }
/>

// Disabled input
<Input
  label="Invoice Number"
  value="INV-2025-001"
  disabled
  helperText="Auto-generated when sent"
/>
```

---

### 2.3 Badge Component

```typescript
// components/atoms/Badge/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /**
   * Badge content (text or number)
   */
  children: string | number;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Size of the badge
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Whether badge should be rounded (pill shape)
   * @default true
   */
  rounded?: boolean;

  /**
   * Custom style overrides
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  style,
  testID,
}) => {
  const theme = useTheme();

  const badgeStyles = [
    styles.base,
    getVariantStyles(variant, theme),
    getSizeStyles(size, theme),
    rounded && styles.rounded,
    style,
  ];

  const textStyles = [
    styles.text,
    getTextVariantStyles(variant, theme),
    getTextSizeStyles(size, theme),
  ];

  return (
    <View style={badgeStyles} testID={testID}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: 4,
  },
  rounded: {
    borderRadius: 999,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

function getVariantStyles(variant: BadgeVariant, theme: Theme): ViewStyle {
  switch (variant) {
    case 'default':
      return { backgroundColor: theme.colors.gray[200] };
    case 'primary':
      return { backgroundColor: theme.colors.primary[500] };
    case 'success':
      return { backgroundColor: theme.colors.success[500] };
    case 'warning':
      return { backgroundColor: theme.colors.warning[500] };
    case 'danger':
      return { backgroundColor: theme.colors.danger[500] };
    case 'info':
      return { backgroundColor: theme.colors.info[500] };
  }
}

function getSizeStyles(size: BadgeSize, theme: Theme): ViewStyle {
  switch (size) {
    case 'sm':
      return { paddingVertical: 2, paddingHorizontal: 8, minHeight: 20 };
    case 'md':
      return { paddingVertical: 4, paddingHorizontal: 12, minHeight: 24 };
    case 'lg':
      return { paddingVertical: 6, paddingHorizontal: 16, minHeight: 28 };
  }
}

function getTextVariantStyles(variant: BadgeVariant, theme: Theme): TextStyle {
  if (variant === 'default') {
    return { color: theme.colors.text.primary };
  }
  return { color: theme.colors.text.inverse };
}

function getTextSizeStyles(size: BadgeSize, theme: Theme): TextStyle {
  switch (size) {
    case 'sm':
      return { fontSize: theme.typography.fontSize.xs };
    case 'md':
      return { fontSize: theme.typography.fontSize.sm };
    case 'lg':
      return { fontSize: theme.typography.fontSize.base };
  }
}
```

**Status Badge Helper Component:**

```typescript
// components/atoms/Badge/StatusBadge.tsx
import React from 'react';
import { Badge, BadgeProps } from './Badge';

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
type PaymentStatus = 'APPLIED' | 'VOIDED';

interface StatusBadgeProps extends Omit<BadgeProps, 'children' | 'variant'> {
  status: InvoiceStatus | CustomerStatus | PaymentStatus;
  type: 'invoice' | 'customer' | 'payment';
}

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  // Invoice statuses
  DRAFT: { label: 'Draft', variant: 'default' },
  SENT: { label: 'Sent', variant: 'info' },
  PAID: { label: 'Paid', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'default' },
  OVERDUE: { label: 'Overdue', variant: 'danger' },

  // Customer statuses
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'default' },
  SUSPENDED: { label: 'Suspended', variant: 'warning' },

  // Payment statuses
  APPLIED: { label: 'Applied', variant: 'success' },
  VOIDED: { label: 'Voided', variant: 'danger' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, ...props }) => {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} size="sm" {...props}>
      {config.label}
    </Badge>
  );
};
```

**Usage Examples:**

```typescript
// Basic badge
<Badge>New</Badge>

// Status badges
<StatusBadge status="SENT" type="invoice" />
<StatusBadge status="PAID" type="invoice" />
<StatusBadge status="ACTIVE" type="customer" />

// Custom badges
<Badge variant="warning" size="lg">
  3 Overdue
</Badge>

<Badge variant="danger" rounded={false}>
  Critical
</Badge>
```

---

### 2.4 Icon Component

```typescript
// components/atoms/Icon/Icon.tsx
import React from 'react';
import { ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface IconProps {
  /**
   * Icon name from Ionicons
   */
  name: IconName;

  /**
   * Icon size in pixels
   * @default 24
   */
  size?: number;

  /**
   * Icon color
   * @default '#000000'
   */
  color?: string;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000000',
  style,
  testID,
}) => {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={style}
      testID={testID}
    />
  );
};
```

**Icon Registry (Semantic Icons):**

```typescript
// components/atoms/Icon/IconRegistry.tsx
import React from 'react';
import { Icon, IconProps } from './Icon';

type SemanticIconProps = Omit<IconProps, 'name'>;

export const ChevronRightIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="chevron-forward" {...props} />
);

export const ChevronLeftIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="chevron-back" {...props} />
);

export const SearchIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="search" {...props} />
);

export const AddIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="add" {...props} />
);

export const CloseIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="close" {...props} />
);

export const CheckIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="checkmark" {...props} />
);

export const EditIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="pencil" {...props} />
);

export const DeleteIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="trash" {...props} />
);

export const MenuIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="menu" {...props} />
);

export const FilterIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="funnel" {...props} />
);

export const CalendarIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="calendar" {...props} />
);

export const PersonIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="person" {...props} />
);

export const DocumentIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="document-text" {...props} />
);

export const CashIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="cash" {...props} />
);

export const MailIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="mail" {...props} />
);

export const PhoneIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="call" {...props} />
);

export const EyeIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="eye" {...props} />
);

export const EyeOffIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="eye-off" {...props} />
);

export const WarningIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="warning" {...props} />
);

export const InfoIcon: React.FC<SemanticIconProps> = (props) => (
  <Icon name="information-circle" {...props} />
);
```

---

### 2.5 Avatar Component

```typescript
// components/atoms/Avatar/Avatar.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /**
   * User's name (used for initials if no image)
   */
  name: string;

  /**
   * Image source
   */
  source?: ImageSourcePropType;

  /**
   * Size variant
   * @default 'md'
   */
  size?: AvatarSize;

  /**
   * Background color for initials avatar
   */
  backgroundColor?: string;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  source,
  size = 'md',
  backgroundColor,
  style,
  testID,
}) => {
  const theme = useTheme();

  const sizeValue = getSizeValue(size);
  const initials = getInitials(name);

  const containerStyles = [
    styles.container,
    {
      width: sizeValue,
      height: sizeValue,
      borderRadius: sizeValue / 2,
      backgroundColor: backgroundColor || generateColorFromName(name),
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      fontSize: sizeValue * 0.4,
    },
  ];

  if (source) {
    return (
      <Image
        source={source}
        style={[containerStyles, { backgroundColor: theme.colors.gray[200] }]}
        testID={testID}
      />
    );
  }

  return (
    <View style={containerStyles} testID={testID}>
      <Text style={textStyles}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

function getSizeValue(size: AvatarSize): number {
  switch (size) {
    case 'xs': return 24;
    case 'sm': return 32;
    case 'md': return 40;
    case 'lg': return 56;
    case 'xl': return 80;
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function generateColorFromName(name: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
```

---

### 2.6 Divider Component

```typescript
// components/atoms/Divider/Divider.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface DividerProps {
  /**
   * Orientation of divider
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Spacing above and below (horizontal) or left/right (vertical)
   * @default 16
   */
  spacing?: number;

  /**
   * Color of the divider
   */
  color?: string;

  /**
   * Thickness of the divider
   * @default 1
   */
  thickness?: number;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  spacing = 16,
  color,
  thickness = 1,
  style,
}) => {
  const theme = useTheme();

  const dividerColor = color || theme.colors.border.light;

  const dividerStyle = [
    orientation === 'horizontal' ? {
      height: thickness,
      width: '100%',
      marginVertical: spacing,
    } : {
      width: thickness,
      height: '100%',
      marginHorizontal: spacing,
    },
    { backgroundColor: dividerColor },
    style,
  ];

  return <View style={dividerStyle} />;
};
```

---

## 3. Molecule Components

### 3.1 Card Component

```typescript
// components/molecules/Card/Card.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Press handler (makes card touchable)
   */
  onPress?: (event: GestureResponderEvent) => void;

  /**
   * Whether card is pressable (shows feedback)
   * @default false
   */
  pressable?: boolean;

  /**
   * Elevation level (shadow depth)
   * @default 'md'
   */
  elevation?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Padding inside card
   * @default 16
   */
  padding?: number;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  pressable = false,
  elevation = 'md',
  padding = 16,
  style,
  testID,
}) => {
  const theme = useTheme();

  const cardStyles = [
    styles.base,
    theme.shadows[elevation],
    { padding },
    style,
  ];

  if (onPress || pressable) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.8}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
});
```

**Card Variants:**

```typescript
// components/molecules/Card/CardHeader.tsx
export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ marginBottom: 12 }}>
    {children}
  </View>
);

// components/molecules/Card/CardTitle.tsx
export const CardTitle: React.FC<{ children: string }> = ({ children }) => (
  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
    {children}
  </Text>
);

// components/molecules/Card/CardContent.tsx
export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View>
    {children}
  </View>
);

// components/molecules/Card/CardFooter.tsx
export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' }}>
    {children}
  </View>
);
```

---

### 3.2 List Item Component

```typescript
// components/molecules/ListItem/ListItem.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ChevronRightIcon } from '@/components/atoms/Icon/IconRegistry';

export interface ListItemProps {
  /**
   * Primary text
   */
  title: string;

  /**
   * Secondary text
   */
  subtitle?: string;

  /**
   * Tertiary text
   */
  description?: string;

  /**
   * Left content (icon, avatar, etc.)
   */
  leftContent?: React.ReactNode;

  /**
   * Right content (badge, button, etc.)
   */
  rightContent?: React.ReactNode;

  /**
   * Press handler
   */
  onPress?: () => void;

  /**
   * Whether to show chevron on right
   * @default false
   */
  showChevron?: boolean;

  /**
   * Whether item is selected/active
   * @default false
   */
  selected?: boolean;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftContent,
  rightContent,
  onPress,
  showChevron = false,
  selected = false,
  style,
  testID,
}) => {
  const theme = useTheme();

  const containerStyles = [
    styles.container,
    selected && { backgroundColor: theme.colors.primary[50] },
    style,
  ];

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={containerStyles}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      {leftContent && (
        <View style={styles.leftContent}>
          {leftContent}
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}

        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {rightContent && (
        <View style={styles.rightContent}>
          {rightContent}
        </View>
      )}

      {showChevron && (
        <View style={styles.chevron}>
          <ChevronRightIcon size={20} color={theme.colors.text.tertiary} />
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  leftContent: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  rightContent: {
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 8,
  },
});
```

**Usage Examples:**

```typescript
// Customer list item
<ListItem
  title="John Doe"
  subtitle="john.doe@example.com"
  description="Outstanding: $1,250.00 • 3 active invoices"
  leftContent={<Avatar name="John Doe" size="md" />}
  rightContent={<StatusBadge status="ACTIVE" type="customer" />}
  onPress={() => navigation.navigate('CustomerDetail', { id: customer.id })}
  showChevron
/>

// Invoice list item
<ListItem
  title="INV-2025-001"
  subtitle="John Doe • Due: Nov 15, 2025"
  leftContent={<DocumentIcon size={24} color="#007AFF" />}
  rightContent={
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ fontSize: 17, fontWeight: '600' }}>$8,300.00</Text>
      <StatusBadge status="SENT" type="invoice" />
    </View>
  }
  onPress={() => navigation.navigate('InvoiceDetail', { id: invoice.id })}
/>

// Settings menu item
<ListItem
  title="Account Settings"
  subtitle="Manage your profile and preferences"
  leftContent={<PersonIcon size={24} color="#8E8E93" />}
  showChevron
  onPress={() => navigation.navigate('AccountSettings')}
/>
```

---

### 3.3 Search Bar Component

```typescript
// components/molecules/SearchBar/SearchBar.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { SearchIcon, CloseIcon } from '@/components/atoms/Icon/IconRegistry';

export interface SearchBarProps {
  /**
   * Search value
   */
  value: string;

  /**
   * Change handler
   */
  onChangeText: (text: string) => void;

  /**
   * Placeholder text
   * @default 'Search...'
   */
  placeholder?: string;

  /**
   * Whether search bar is focused
   */
  autoFocus?: boolean;

  /**
   * Debounce delay in ms
   * @default 300
   */
  debounceDelay?: number;

  /**
   * Submit handler (when user presses enter)
   */
  onSubmit?: (text: string) => void;

  /**
   * Clear handler
   */
  onClear?: () => void;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  autoFocus = false,
  debounceDelay = 300,
  onSubmit,
  onClear,
  style,
  testID,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const handleChangeText = (text: string) => {
    onChangeText(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      // Debounced search logic can go here
    }, debounceDelay);
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  };

  const containerStyles = [
    styles.container,
    isFocused && { borderColor: theme.colors.primary[500] },
    style,
  ];

  return (
    <View style={containerStyles} testID={testID}>
      <SearchIcon size={20} color={theme.colors.text.tertiary} />

      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={() => onSubmit?.(value)}
        autoFocus={autoFocus}
        returnKeyType="search"
        clearButtonMode="never"
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <CloseIcon size={18} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    marginLeft: 8,
    color: '#000',
  },
  clearButton: {
    padding: 4,
  },
});
```

---

### 3.4 Empty State Component

```typescript
// components/molecules/EmptyState/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/components/atoms/Button/Button';

export interface EmptyStateProps {
  /**
   * Icon to display
   */
  icon?: React.ReactNode;

  /**
   * Title text
   */
  title: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Action button label
   */
  actionLabel?: string;

  /**
   * Action button handler
   */
  onAction?: () => void;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
  testID,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]} testID={testID}>
      {icon && <View style={styles.icon}>{icon}</View>}

      <Text style={styles.title}>{title}</Text>

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {actionLabel && onAction && (
        <Button
          onPress={onAction}
          variant="primary"
          size="md"
          style={styles.button}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  icon: {
    marginBottom: 24,
    opacity: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
});
```

**Usage Examples:**

```typescript
// No customers
<EmptyState
  icon={<PersonIcon size={64} color="#8E8E93" />}
  title="No customers yet"
  description="Get started by adding your first customer"
  actionLabel="Add Customer"
  onAction={() => navigation.navigate('CreateCustomer')}
/>

// No search results
<EmptyState
  icon={<SearchIcon size={64} color="#8E8E93" />}
  title="No results found"
  description={`No customers match "${searchTerm}"`}
/>

// No invoices
<EmptyState
  icon={<DocumentIcon size={64} color="#8E8E93" />}
  title="No invoices"
  description="Create your first invoice to get started"
  actionLabel="Create Invoice"
  onAction={() => navigation.navigate('CreateInvoice')}
/>
```

---

### 3.5 Modal Component

```typescript
// components/molecules/Modal/Modal.tsx
import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { CloseIcon } from '@/components/atoms/Icon/IconRegistry';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps {
  /**
   * Whether modal is visible
   */
  visible: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal content
   */
  children: React.ReactNode;

  /**
   * Footer content (action buttons)
   */
  footer?: React.ReactNode;

  /**
   * Size variant
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Whether modal can be dismissed by tapping overlay
   * @default true
   */
  dismissable?: boolean;

  /**
   * Whether to show close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Custom style for content
   */
  contentStyle?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  dismissable = true,
  showCloseButton = true,
  contentStyle,
  testID,
}) => {
  const theme = useTheme();

  const contentContainerStyles = [
    styles.content,
    getSizeStyles(size),
    contentStyle,
  ];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissable ? onClose : undefined}
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={dismissable ? onClose : undefined}
        />

        <View style={contentContainerStyles}>
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <CloseIcon size={24} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer && (
            <View style={styles.footer}>
              {footer}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  body: {
    maxHeight: '100%',
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
});

function getSizeStyles(size: ModalSize): ViewStyle {
  switch (size) {
    case 'sm':
      return { width: '80%', maxWidth: 400 };
    case 'md':
      return { width: '90%', maxWidth: 600 };
    case 'lg':
      return { width: '95%', maxWidth: 800 };
    case 'full':
      return { width: '100%', height: '100%', borderRadius: 0 };
  }
}
```

**Confirmation Modal Variant:**

```typescript
// components/molecules/Modal/ConfirmationModal.tsx
import React from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/atoms/Button/Button';
import { View, Text, StyleSheet } from 'react-native';
import { WarningIcon } from '@/components/atoms/Icon/IconRegistry';

export interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  loading = false,
}) => {
  const footer = (
    <View style={styles.footer}>
      <Button
        variant="outline"
        onPress={onClose}
        disabled={loading}
        style={styles.cancelButton}
      >
        {cancelLabel}
      </Button>
      <Button
        variant={variant === 'danger' ? 'danger' : 'primary'}
        onPress={onConfirm}
        loading={loading}
        style={styles.confirmButton}
      >
        {confirmLabel}
      </Button>
    </View>
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
      dismissable={!loading}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <WarningIcon size={48} color="#FF9500" />
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    color: '#000',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});
```

---

## 4. Organism Components

### 4.1 Customer Card Component

```typescript
// components/organisms/CustomerCard/CustomerCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/molecules/Card/Card';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { StatusBadge } from '@/components/atoms/Badge/StatusBadge';
import { ChevronRightIcon, MailIcon, PhoneIcon } from '@/components/atoms/Icon/IconRegistry';
import { formatCurrency } from '@/utils/formatters';

export interface CustomerCardData {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  outstandingBalance: number;
  activeInvoicesCount: number;
}

export interface CustomerCardProps {
  customer: CustomerCardData;
  onPress?: (customer: CustomerCardData) => void;
  testID?: string;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onPress,
  testID,
}) => {
  return (
    <Card
      onPress={() => onPress?.(customer)}
      pressable={!!onPress}
      elevation="sm"
      padding={16}
      testID={testID}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Avatar name={customer.fullName} size="md" />

          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>
                {customer.fullName}
              </Text>
              <StatusBadge status={customer.status} type="customer" />
            </View>

            <View style={styles.contactRow}>
              <MailIcon size={14} color="#8E8E93" />
              <Text style={styles.email} numberOfLines={1}>
                {customer.email}
              </Text>
            </View>

            {customer.phone && (
              <View style={styles.contactRow}>
                <PhoneIcon size={14} color="#8E8E93" />
                <Text style={styles.phone}>{customer.phone}</Text>
              </View>
            )}
          </View>

          {onPress && (
            <ChevronRightIcon size={20} color="#C7C7CC" />
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Outstanding</Text>
            <Text style={[
              styles.statValue,
              customer.outstandingBalance > 0 && styles.statValueWarning
            ]}>
              {formatCurrency(customer.outstandingBalance)}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>Active Invoices</Text>
            <Text style={styles.statValue}>{customer.activeInvoicesCount}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  email: {
    fontSize: 15,
    color: '#8E8E93',
    flex: 1,
  },
  phone: {
    fontSize: 15,
    color: '#8E8E93',
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 24,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  statValueWarning: {
    color: '#FF3B30',
  },
});
```

---

### 4.2 Invoice Card Component

```typescript
// components/organisms/InvoiceCard/InvoiceCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/molecules/Card/Card';
import { StatusBadge } from '@/components/atoms/Badge/StatusBadge';
import { DocumentIcon } from '@/components/atoms/Icon/IconRegistry';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { differenceInDays, parseISO } from 'date-fns';

export interface InvoiceCardData {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  totalAmount: number;
  balance: number;
}

export interface InvoiceCardProps {
  invoice: InvoiceCardData;
  onPress?: (invoice: InvoiceCardData) => void;
  testID?: string;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onPress,
  testID,
}) => {
  const daysUntilDue = differenceInDays(parseISO(invoice.dueDate), new Date());
  const isOverdue = daysUntilDue < 0 && invoice.status === 'SENT';

  return (
    <Card
      onPress={() => onPress?.(invoice)}
      pressable={!!onPress}
      elevation="sm"
      padding={16}
      testID={testID}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <DocumentIcon
              size={24}
              color={isOverdue ? '#FF3B30' : '#007AFF'}
            />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber || 'Draft'}</Text>
            <Text style={styles.customerName} numberOfLines={1}>
              {invoice.customerName}
            </Text>
          </View>

          <View style={styles.badgeContainer}>
            {isOverdue ? (
              <StatusBadge status="OVERDUE" type="invoice" />
            ) : (
              <StatusBadge status={invoice.status} type="invoice" />
            )}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Issued:</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.invoiceDate)}</Text>
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due:</Text>
            <Text style={[
              styles.dateValue,
              isOverdue && styles.overdueText
            ]}>
              {formatDate(invoice.dueDate)}
              {isOverdue && ` (${Math.abs(daysUntilDue)} days overdue)`}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(invoice.totalAmount)}
            </Text>
          </View>

          {invoice.balance > 0 && invoice.status !== 'DRAFT' && (
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Balance</Text>
              <Text style={[styles.amountValue, styles.balanceValue]}>
                {formatCurrency(invoice.balance)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    gap: 2,
  },
  invoiceNumber: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  customerName: {
    fontSize: 15,
    color: '#8E8E93',
  },
  badgeContainer: {
    marginLeft: 8,
  },
  body: {
    gap: 6,
    paddingVertical: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 15,
    color: '#8E8E93',
    width: 50,
  },
  dateValue: {
    fontSize: 15,
    color: '#000',
    flex: 1,
  },
  overdueText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 24,
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  balanceValue: {
    color: '#FF3B30',
  },
});
```

---

### 4.3 Form Section Component

```typescript
// components/organisms/FormSection/FormSection.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export interface FormSectionProps {
  /**
   * Section title
   */
  title: string;

  /**
   * Section description
   */
  description?: string;

  /**
   * Form fields
   */
  children: React.ReactNode;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
  },
  content: {
    gap: 16,
  },
});
```

**Usage Example:**

```typescript
<ScrollView>
  <FormSection
    title="Personal Information"
    description="Basic details about the customer"
  >
    <Input
      label="First Name"
      required
      value={firstName}
      onChangeText={setFirstName}
      error={errors.firstName}
    />
    <Input
      label="Last Name"
      required
      value={lastName}
      onChangeText={setLastName}
      error={errors.lastName}
    />
    <Input
      label="Email Address"
      required
      value={email}
      onChangeText={setEmail}
      error={errors.email}
      keyboardType="email-address"
    />
  </FormSection>

  <FormSection
    title="Billing Address"
    description="Where invoices will be sent"
  >
    <Input
      label="Street Address"
      required
      value={street}
      onChangeText={setStreet}
    />
    {/* More address fields */}
  </FormSection>
</ScrollView>
```

---

### 4.4 DataTable Component

```typescript
// components/organisms/DataTable/DataTable.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface ColumnDefinition<T> {
  /**
   * Column key (matches data property)
   */
  key: string;

  /**
   * Column header label
   */
  label: string;

  /**
   * Column width (flex or fixed)
   */
  width?: number | 'flex';

  /**
   * Text alignment
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Custom render function
   */
  render?: (value: any, item: T) => React.ReactNode;

  /**
   * Whether column is sortable
   * @default false
   */
  sortable?: boolean;
}

export interface DataTableProps<T> {
  /**
   * Column definitions
   */
  columns: ColumnDefinition<T>[];

  /**
   * Data rows
   */
  data: T[];

  /**
   * Key extractor
   */
  keyExtractor: (item: T) => string;

  /**
   * Row press handler
   */
  onRowPress?: (item: T) => void;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Empty state component
   */
  emptyState?: React.ReactNode;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
  loading = false,
  emptyState,
  style,
  testID,
}: DataTableProps<T>) {
  const theme = useTheme();

  const renderHeader = () => (
    <View style={styles.headerRow}>
      {columns.map((column) => (
        <View
          key={column.key}
          style={[
            styles.headerCell,
            getColumnWidth(column.width),
          ]}
        >
          <Text style={[
            styles.headerText,
            getTextAlign(column.align),
          ]}>
            {column.label}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderRow = ({ item }: { item: T }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onRowPress?.(item)}
      disabled={!onRowPress}
      activeOpacity={0.7}
    >
      {columns.map((column) => {
        const value = (item as any)[column.key];
        const content = column.render ? column.render(value, item) : value;

        return (
          <View
            key={column.key}
            style={[
              styles.cell,
              getColumnWidth(column.width),
            ]}
          >
            <Text style={[
              styles.cellText,
              getTextAlign(column.align),
            ]} numberOfLines={1}>
              {content}
            </Text>
          </View>
        );
      })}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]} testID={testID}>
      {renderHeader()}
      <FlatList
        data={data}
        renderItem={renderRow}
        keyExtractor={keyExtractor}
        ListEmptyComponent={emptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerCell: {
    paddingHorizontal: 8,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 15,
    color: '#000',
  },
});

function getColumnWidth(width?: number | 'flex'): ViewStyle {
  if (width === 'flex') {
    return { flex: 1 };
  }
  if (typeof width === 'number') {
    return { width };
  }
  return { flex: 1 };
}

function getTextAlign(align?: 'left' | 'center' | 'right'): { textAlign: 'left' | 'center' | 'right' } {
  return { textAlign: align || 'left' };
}
```

---

## 5. Form Components

### 5.1 Dropdown/Select Component

```typescript
// components/form/Dropdown/Dropdown.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ChevronDownIcon, CheckIcon } from '@/components/atoms/Icon/IconRegistry';

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface DropdownProps {
  /**
   * Label
   */
  label?: string;

  /**
   * Whether field is required
   */
  required?: boolean;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Options array
   */
  options: DropdownOption[];

  /**
   * Selected value
   */
  value: string | null;

  /**
   * Change handler
   */
  onChange: (value: string) => void;

  /**
   * Error message
   */
  error?: string;

  /**
   * Whether dropdown is disabled
   */
  disabled?: boolean;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  required = false,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  error,
  disabled = false,
  style,
  testID,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.trigger,
          error && styles.triggerError,
          disabled && styles.triggerDisabled,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <Text style={[
          styles.triggerText,
          !selectedOption && styles.placeholderText,
        ]}>
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDownIcon size={20} color={theme.colors.text.tertiary} />
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                  disabled={item.disabled}
                >
                  <Text style={[
                    styles.optionText,
                    item.disabled && styles.optionDisabled,
                  ]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <CheckIcon size={20} color={theme.colors.primary[500]} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  required: {
    color: '#FF3B30',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#C6C6C8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  triggerError: {
    borderColor: '#FF3B30',
  },
  triggerDisabled: {
    backgroundColor: '#F2F2F7',
    opacity: 0.6,
  },
  triggerText: {
    fontSize: 15,
    color: '#000',
    flex: 1,
  },
  placeholderText: {
    color: '#C7C7CC',
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  optionSelected: {
    backgroundColor: '#F2F2F7',
  },
  optionText: {
    fontSize: 17,
    color: '#000',
  },
  optionDisabled: {
    color: '#C7C7CC',
  },
});
```

---

### 5.2 Date Picker Component

```typescript
// components/form/DatePicker/DatePicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { CalendarIcon } from '@/components/atoms/Icon/IconRegistry';
import { Modal } from '@/components/molecules/Modal/Modal';
import { Button } from '@/components/atoms/Button/Button';

export interface DatePickerProps {
  /**
   * Label
   */
  label?: string;

  /**
   * Whether field is required
   */
  required?: boolean;

  /**
   * Selected date
   */
  value: Date | null;

  /**
   * Change handler
   */
  onChange: (date: Date) => void;

  /**
   * Minimum selectable date
   */
  minimumDate?: Date;

  /**
   * Maximum selectable date
   */
  maximumDate?: Date;

  /**
   * Error message
   */
  error?: string;

  /**
   * Whether field is disabled
   */
  disabled?: boolean;

  /**
   * Date format string
   * @default 'MMM d, yyyy'
   */
  dateFormat?: string;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  required = false,
  value,
  onChange,
  minimumDate,
  maximumDate,
  error,
  disabled = false,
  dateFormat = 'MMM d, yyyy',
  style,
  testID,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShowPicker(false);
  };

  const displayValue = value ? format(value, dateFormat) : 'Select date';

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.trigger,
          error && styles.triggerError,
          disabled && styles.triggerDisabled,
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <Text style={[
          styles.triggerText,
          !value && styles.placeholderText,
        ]}>
          {displayValue}
        </Text>
        <CalendarIcon size={20} color="#8E8E93" />
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          onClose={handleCancel}
          title="Select Date"
          size="sm"
          footer={
            <View style={styles.modalFooter}>
              <Button variant="outline" onPress={handleCancel}>
                Cancel
              </Button>
              <Button onPress={handleConfirm}>
                Confirm
              </Button>
            </View>
          }
        >
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setTempDate(selectedDate);
              }
            }}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                onChange(selectedDate);
              }
            }}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  required: {
    color: '#FF3B30',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#C6C6C8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  triggerError: {
    borderColor: '#FF3B30',
  },
  triggerDisabled: {
    backgroundColor: '#F2F2F7',
    opacity: 0.6,
  },
  triggerText: {
    fontSize: 15,
    color: '#000',
  },
  placeholderText: {
    color: '#C7C7CC',
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
});
```

---

### 5.3 Currency Input Component

```typescript
// components/form/CurrencyInput/CurrencyInput.tsx
import React, { useState, useEffect } from 'react';
import { Input, InputProps } from '@/components/atoms/Input/Input';

export interface CurrencyInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  /**
   * Numeric value
   */
  value: number;

  /**
   * Change handler
   */
  onChangeValue: (value: number) => void;

  /**
   * Currency symbol
   * @default '$'
   */
  currencySymbol?: string;

  /**
   * Maximum value
   */
  max?: number;

  /**
   * Minimum value
   * @default 0
   */
  min?: number;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChangeValue,
  currencySymbol = '$',
  max,
  min = 0,
  ...inputProps
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  const handleChangeText = (text: string) => {
    // Remove currency symbol and commas
    const numericText = text.replace(/[^0-9.]/g, '');

    // Parse to number
    const numericValue = parseFloat(numericText) || 0;

    // Apply min/max constraints
    let constrainedValue = numericValue;
    if (max !== undefined && constrainedValue > max) {
      constrainedValue = max;
    }
    if (constrainedValue < min) {
      constrainedValue = min;
    }

    onChangeValue(constrainedValue);
  };

  const formatCurrency = (num: number): string => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Input
      {...inputProps}
      value={displayValue}
      onChangeText={handleChangeText}
      keyboardType="decimal-pad"
      leftIcon={
        <Text style={{ fontSize: 17, color: '#8E8E93', fontWeight: '600' }}>
          {currencySymbol}
        </Text>
      }
    />
  );
};
```

---

This completes the first major section of the component library. Would you like me to continue with:

1. More specialized components (LineItemList, PaymentMethodSelector, etc.)
2. Layout components and templates
3. Utility hooks and helpers
4. Animation components
5. Complete usage examples for complex forms

Let me know and I'll continue with the remaining sections!