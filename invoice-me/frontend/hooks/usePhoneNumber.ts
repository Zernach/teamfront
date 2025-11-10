// hooks/usePhoneNumber.ts
import { useState, useCallback, useEffect } from 'react';
import { formatPhoneToE164, isValidE164, formatPhoneForDisplay } from '../utils/phoneNumber';

interface UsePhoneNumberOptions {
  initialValue?: string;
  onChange?: (e164Value: string) => void;
  onBlur?: (e164Value: string) => void;
}

/**
 * Hook for managing phone number input with E.164 formatting
 * 
 * @param options - Configuration options
 * @returns Phone number state and handlers
 */
export function usePhoneNumber(options: UsePhoneNumberOptions = {}) {
  const { initialValue = '', onChange, onBlur } = options;
  
  // Store the E.164 formatted value internally
  const [e164Value, setE164Value] = useState<string>(() => {
    // If initial value is already in E.164, use it; otherwise format it
    return initialValue ? formatPhoneToE164(initialValue) : '';
  });
  
  // Display value for the input (formatted for readability)
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return initialValue ? formatPhoneToE164(initialValue) : '';
  });
  
  // Update when initialValue changes
  useEffect(() => {
    if (initialValue !== undefined) {
      const formatted = initialValue ? formatPhoneToE164(initialValue) : '';
      setE164Value(formatted);
      setDisplayValue(formatted);
    }
  }, [initialValue]);
  
  const handleChange = useCallback((text: string) => {
    // Format to E.164 as user types
    const formatted = formatPhoneToE164(text);
    setE164Value(formatted);
    setDisplayValue(formatted);
    
    // Notify parent component of the change
    onChange?.(formatted);
  }, [onChange]);
  
  const handleBlur = useCallback(() => {
    // On blur, ensure we have valid E.164 format
    const finalValue = formatPhoneToE164(e164Value);
    setE164Value(finalValue);
    setDisplayValue(finalValue);
    onBlur?.(finalValue);
  }, [e164Value, onBlur]);
  
  const isValid = isValidE164(e164Value);
  
  return {
    value: displayValue,
    e164Value,
    onChangeText: handleChange,
    onBlur: handleBlur,
    isValid,
    setValue: (value: string) => {
      const formatted = formatPhoneToE164(value);
      setE164Value(formatted);
      setDisplayValue(formatted);
      onChange?.(formatted);
    },
  };
}

