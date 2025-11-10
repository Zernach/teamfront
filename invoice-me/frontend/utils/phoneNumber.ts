// utils/phoneNumber.ts

/**
 * Formats a phone number string to E.164 format
 * E.164 format: +[country code][number] (e.g., +1234567890)
 * Maximum 15 digits total (including country code)
 * 
 * @param input - The phone number string to format
 * @returns The formatted phone number in E.164 format
 */
export function formatPhoneToE164(input: string): string {
  // Remove all non-digit characters except the leading +
  const cleaned = input.replace(/[^\d+]/g, '');
  
  // If empty, return empty string
  if (!cleaned) {
    return '';
  }
  
  // If it doesn't start with +, add it
  let formatted = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  
  // Remove any extra + signs after the first one
  formatted = formatted.replace(/(?<=\+)\+/g, '');
  
  // Limit to 15 digits after the + (E.164 max length)
  const digitsOnly = formatted.slice(1).replace(/\D/g, '');
  if (digitsOnly.length > 15) {
    formatted = `+${digitsOnly.slice(0, 15)}`;
  } else {
    formatted = `+${digitsOnly}`;
  }
  
  return formatted;
}

/**
 * Validates if a phone number is in valid E.164 format
 * 
 * @param phone - The phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidE164(phone: string): boolean {
  if (!phone) {
    return true; // Empty is valid (optional field)
  }
  
  // E.164 format: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

/**
 * Formats phone number for display while maintaining E.164 internally
 * This provides a more readable format for users
 * 
 * @param e164Phone - Phone number in E.164 format
 * @returns Formatted display string
 */
export function formatPhoneForDisplay(e164Phone: string): string {
  if (!e164Phone) {
    return '';
  }
  
  // Remove the + for display formatting
  const digits = e164Phone.slice(1);
  
  // US/Canada format: +1 (555) 123-4567
  if (digits.length >= 11 && digits.startsWith('1')) {
    const countryCode = digits.slice(0, 1);
    const areaCode = digits.slice(1, 4);
    const firstPart = digits.slice(4, 7);
    const secondPart = digits.slice(7, 11);
    
    if (secondPart.length === 4) {
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    } else if (firstPart.length === 3) {
      return `+${countryCode} (${areaCode}) ${firstPart}`;
    }
  }
  
  // For other countries, just show with spaces every 3-4 digits
  if (digits.length > 4) {
    const countryCode = digits.slice(0, Math.min(3, Math.floor(digits.length / 2)));
    const rest = digits.slice(countryCode.length);
    
    // Format rest with spaces
    const formattedRest = rest.match(/.{1,4}/g)?.join(' ') || rest;
    return `+${countryCode} ${formattedRest}`;
  }
  
  return e164Phone;
}

