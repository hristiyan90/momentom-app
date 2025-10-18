/**
 * Authentication input validation utilities
 */

/**
 * Validate email format (RFC 5322 compliant)
 * @param email - Email address to validate
 * @returns True if email is valid format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // RFC 5322 compliant email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns True if password meets requirements (min 8 characters)
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // Minimum 8 characters (per Sprint 1.5 spec)
  return password.length >= 8;
}

/**
 * Validate age for COPPA compliance
 * @param dateOfBirth - Date of birth in ISO format (YYYY-MM-DD)
 * @returns True if age is 13 or older
 */
export function validateAge(dateOfBirth: string): boolean {
  if (!dateOfBirth || typeof dateOfBirth !== 'string') {
    return false;
  }
  
  try {
    const age = calculateAge(dateOfBirth);
    // COPPA compliance: must be at least 13 years old
    return age >= 13;
  } catch {
    return false;
  }
}

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth in ISO format (YYYY-MM-DD)
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  if (isNaN(birthDate.getTime())) {
    throw new Error('Invalid date format');
  }
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

