import { jest } from '@jest/globals';
import { setupTestEnvironment } from './setup.js';

describe('Regex PII Detection Tests', () => {
  let censorPII;

  beforeAll(async () => {
    const setup = await setupTestEnvironment();
    censorPII = setup.censorPII;
  });

  describe('Social Security Number (SSN)', () => {
    test.each([
      ['My SSN is 123-45-6789.', undefined, 'My [CENSORED] is [CENSORED].'],
      ['My SSN is 123-45-6789.', '*', 'My *** is ***********.'],
    ])('censors a Social Security Number (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['SSN: 123 45 6789', undefined, '[CENSORED]: [CENSORED]'],
      ['SSN: 123 45 6789', '*', '***: ***********'],
    ])('censors SSN with different spacing (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['My number is 123-45.', undefined, 'My number is 123-45.'],
      ['My number is 123-45.', '*', 'My number is 123-45.'],
    ])('does not censor partial SSN-like numbers without full pattern (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Email Addresses', () => {
    test('should censor an email address', async () => {
      const original = 'Contact me at test@example.com.';
      const expected = 'Contact me at [CENSORED].';
      await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should censor email with subdomain', async () => {
      const original = 'Email: user@sub.example.com';
      const expected = 'Email: [CENSORED]';
      await expect(censorPII(original)).resolves.toBe(expected);
    });
  });

  describe('Phone Numbers', () => {
    test.each([
      ['Call me at (123) 456-7890.', undefined, 'Call me at ([CENSORED].'],
      ['Call me at (123) 456-7890.', '*', 'Call me at (*************.'],
    ])('censors a phone number (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Phone: (123)456-7890.', undefined, '[CENSORED]: ([CENSORED].'],
      ['Phone: (123)456-7890.', '*', '*****: (************.'],
    ])('censors phone with different formats (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('IP Addresses', () => {
    test.each([
      ['Server IP: 192.168.1.1.', undefined, 'Server IP: [CENSORED].'],
      ['Server IP: 192.168.1.1.', '*', 'Server IP: ***********.'],
    ])('should censor an IP address (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['IP: 10.0.0.1 and 172.16.0.1', undefined, 'IP: [CENSORED] and [CENSORED]'],
      ['IP: 10.0.0.1 and 172.16.0.1', '*', 'IP: ******** and **********'],
    ])('should censor different IP formats (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Vehicle Identification Numbers (VIN)', () => {
    test.each([
      ['Car VIN: 1G1FN13M031234567.', undefined, 'Car VIN: [CENSORED].'],
      ['Car VIN: 1G1FN13M031234567.', '*', 'Car VIN: *****************.'],
    ])('should censor a VIN (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['VIN: ABCDEFGHIJKLMNOPQ', undefined, 'VIN: [CENSORED]FGHIJKLMNOPQ'],
      ['VIN: ABCDEFGHIJKLMNOPQ', '*', 'VIN: *****FGHIJKLMNOPQ'],
    ])('should censor VIN with letters (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Credit Card Numbers', () => {
    test.each([
      ['Card: 1234-5678-9012-3456.', undefined, 'Card: [CENSORED].'],
      ['Card: 1234-5678-9012-3456.', '*', 'Card: *******************.'],
    ])('should censor a credit card number (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Card: 1234 5678 9012 3456', undefined, 'Card: [CENSORED]'],
      ['Card: 1234 5678 9012 3456', '*', 'Card: *******************'],
    ])('should censor credit card with spaces (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Exp: 03/26', undefined, '[CENSORED]'],
      ['Exp: 03/26', '*', '**********'],
    ])('should censor a credit card expiration date with prefix (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Date of birth: 01/01/1990.', undefined, 'Date of birth: 01/01/1990.'],
      ['Date of birth: 01/01/1990.', '*', 'Date of birth: 01/01/1990.'],
    ])('should not censor general dates as credit card expirations without prefix (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('ID Numbers', () => {
    test.each([
      ['My ID is 987654321.', undefined, 'My ID is [CENSORED]]]].'],
      ['My ID is 987654321.', '*', 'My ID is *********.'],
    ])('should censor a general 9-digit ID number (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Passport: G123456789.', undefined, 'Passport: [CENSORED].'],
      ['Passport: G123456789.', '*', 'Passport: **********.'],
    ])('should censor a passport number (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Patient MRN-0012345.', undefined, 'Patient [CENSORED]ED].'],
      ['Patient MRN-0012345.', '*', 'Patient ***********.'],
    ])('should censor a medical record number (MRN) (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Policy: 98765.', undefined, 'Policy: [CENSORED].'],
      ['Policy: 98765.', '*', 'Policy: *****.'],
    ])('should censor a policy number (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Mixed Regex PII', () => {
    test.each([
      ['John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.', undefined,
        '[CENSORED] (SSN: [CENSORED]) lives at 123 Oak Ave, Anytown, NY. Email: [CENSORED]. Phone: ([CENSORED].'],
      ['John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.', '*',
        '******** (SSN: ***********) lives at 123 Oak Ave, Anytown, NY. Email: *****************. Phone: (*************.'],
    ])('should handle multiple PII types in one string (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['SSN: 123 45 6789 and Phone: (123)456-7890.', undefined, '[CENSORED]: [CENSORED] and Phone: ([CENSORED].'],
      ['SSN: 123 45 6789 and Phone: (123)456-7890.', '*', '***: *********** and Phone: (************.'],
    ])('should handle PII with different spacing in numbers (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });
});
