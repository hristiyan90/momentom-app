import { validateEmail, validatePassword, validateAge, calculateAge } from '../validation';

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('first+last@company.org')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user @example.com')).toBe(false);
  });

  it('handles null and undefined', () => {
    expect(validateEmail(null as any)).toBe(false);
    expect(validateEmail(undefined as any)).toBe(false);
  });

  it('trims whitespace', () => {
    expect(validateEmail('  test@example.com  ')).toBe(true);
  });
});

describe('validatePassword', () => {
  it('accepts passwords with 8 or more characters', () => {
    expect(validatePassword('12345678')).toBe(true);
    expect(validatePassword('SecurePass123!')).toBe(true);
    expect(validatePassword('a'.repeat(100))).toBe(true);
  });

  it('rejects passwords with less than 8 characters', () => {
    expect(validatePassword('')).toBe(false);
    expect(validatePassword('1234567')).toBe(false);
    expect(validatePassword('short')).toBe(false);
  });

  it('handles null and undefined', () => {
    expect(validatePassword(null as any)).toBe(false);
    expect(validatePassword(undefined as any)).toBe(false);
  });
});

describe('validateAge', () => {
  it('accepts users 13 years or older', () => {
    // Calculate date for someone who is exactly 13 years old today
    const thirteenYearsAgo = new Date();
    thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
    const dateString = thirteenYearsAgo.toISOString().split('T')[0];
    expect(validateAge(dateString)).toBe(true);

    // Someone who is 20 years old
    expect(validateAge('2005-01-01')).toBe(true);
    
    // Someone who is 30 years old
    expect(validateAge('1995-06-15')).toBe(true);
  });

  it('rejects users under 13 years old', () => {
    // Calculate date for someone who is 12 years old
    const twelveYearsAgo = new Date();
    twelveYearsAgo.setFullYear(twelveYearsAgo.getFullYear() - 12);
    const dateString = twelveYearsAgo.toISOString().split('T')[0];
    expect(validateAge(dateString)).toBe(false);

    // Someone who is 5 years old
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const youngDateString = fiveYearsAgo.toISOString().split('T')[0];
    expect(validateAge(youngDateString)).toBe(false);
  });

  it('rejects invalid date formats', () => {
    expect(validateAge('invalid-date')).toBe(false);
    expect(validateAge('2025-13-01')).toBe(false);
    expect(validateAge('')).toBe(false);
  });

  it('handles null and undefined', () => {
    expect(validateAge(null as any)).toBe(false);
    expect(validateAge(undefined as any)).toBe(false);
  });
});

describe('calculateAge', () => {
  it('calculates age correctly', () => {
    // Someone born 25 years ago
    const twentyFiveYearsAgo = new Date();
    twentyFiveYearsAgo.setFullYear(twentyFiveYearsAgo.getFullYear() - 25);
    const dateString = twentyFiveYearsAgo.toISOString().split('T')[0];
    expect(calculateAge(dateString)).toBe(25);
  });

  it('handles birthday not yet occurred this year', () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    nextMonth.setFullYear(today.getFullYear() - 20);
    
    const dateString = nextMonth.toISOString().split('T')[0];
    const age = calculateAge(dateString);
    expect(age).toBe(19); // Birthday hasn't happened yet this year
  });

  it('throws on invalid date format', () => {
    expect(() => calculateAge('invalid-date')).toThrow('Invalid date format');
  });
});

