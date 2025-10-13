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
      ['My SSN is 123-45-6789.', { maskChar: undefined }, 'My [CENSORED] is [CENSORED].'],
      ['My SSN is 123-45-6789.', { maskChar: '*' }, 'My *** is ***********.'],
      ['My SSN is 123-45-6789.', { maskChar: '*', maskLength: 5 }, 'My ***** is *****.'],
    ])(
      'censors a Social Security Number (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['SSN: 123 45 6789', { maskChar: undefined }, '[CENSORED]: [CENSORED]'],
      ['SSN: 123 45 6789', { maskChar: '*' }, '***: ***********'],
      ['SSN: 123 45 6789', { maskChar: '*', maskLength: 5 }, '*****: *****'],
    ])(
      'censors SSN with different spacing (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['My number is 123-45.', { maskChar: undefined }, 'My number is 123-45.'],
      ['My number is 123-45.', { maskChar: '*' }, 'My number is 123-45.'],
      ['My number is 123-45.', { maskChar: '*', maskLength: 5 }, 'My number is 123-45.'],
    ])(
      'does not censor partial SSN-like numbers without full pattern (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Email Addresses', () => {
    test.each([
      ['Contact me at test@example.com.', { maskChar: undefined }, 'Contact me at [CENSORED].'],
      ['Contact me at test@example.com.', { maskChar: '*' }, 'Contact me at ****************.'],
      ['Contact me at test@example.com.', { maskChar: '*', maskLength: 5 }, 'Contact me at *****.'],
    ])(
      'should censor an email address (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Email: user@sub.example.com', { maskChar: undefined }, 'Email: [CENSORED]'],
      ['Email: user@sub.example.com', { maskChar: '*' }, 'Email: ********************'],
      ['Email: user@sub.example.com', { maskChar: '*', maskLength: 5 }, 'Email: *****'],
    ])(
      'should censor email with subdomain (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Phone Numbers', () => {
    test.each([
      ['Call me at (123) 456-7890.', { maskChar: undefined }, 'Call me at ([CENSORED].'],
      ['Call me at (123) 456-7890.', { maskChar: '*' }, 'Call me at (*************.'],
      ['Call me at (123) 456-7890.', { maskChar: '*', maskLength: 5 }, 'Call me at (*****.'],
    ])(
      'censors a phone number (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Phone: (123)456-7890.', { maskChar: undefined }, '[CENSORED]: ([CENSORED].'],
      ['Phone: (123)456-7890.', { maskChar: '*' }, '*****: (************.'],
      ['Phone: (123)456-7890.', { maskChar: '*', maskLength: 5 }, '*****: (*****.'],
    ])(
      'censors phone with different formats (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('IP Addresses', () => {
    test.each([
      ['Server IP: 192.168.1.1.', { maskChar: undefined }, 'Server IP: [CENSORED].'],
      ['Server IP: 192.168.1.1.', { maskChar: '*' }, 'Server IP: ***********.'],
      ['Server IP: 192.168.1.1.', { maskChar: '*', maskLength: 5 }, 'Server IP: *****.'],
    ])(
      'should censor an IP address (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['IP: 10.0.0.1 and 172.16.0.1', { maskChar: undefined }, 'IP: [CENSORED] and [CENSORED]'],
      ['IP: 10.0.0.1 and 172.16.0.1', { maskChar: '*' }, 'IP: ******** and **********'],
      ['IP: 10.0.0.1 and 172.16.0.1', { maskChar: '*', maskLength: 5 }, 'IP: ***** and *****'],
    ])(
      'should censor different IP formats (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Vehicle Identification Numbers (VIN)', () => {
    test.each([
      ['Car VIN: 1G1FN13M031234567.', { maskChar: undefined }, 'Car VIN: [CENSORED].'],
      ['Car VIN: 1G1FN13M031234567.', { maskChar: '*' }, 'Car VIN: *****************.'],
      ['Car VIN: 1G1FN13M031234567.', { maskChar: '*', maskLength: 5 }, 'Car VIN: *****.'],
    ])(
      'should censor a VIN (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['VIN: ABCDEFGHIJKLMNOPQ', { maskChar: undefined }, 'VIN: [CENSORED]FGHIJKLMNOPQ'],
      ['VIN: ABCDEFGHIJKLMNOPQ', { maskChar: '*' }, 'VIN: *****FGHIJKLMNOPQ'],
      ['VIN: ABCDEFGHIJKLMNOPQ', { maskChar: '*', maskLength: 5 }, 'VIN: *****FGHIJKLMNOPQ'],
    ])(
      'should censor VIN with letters (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Credit Card Numbers', () => {
    test.each([
      ['Card: 1234-5678-9012-3456.', { maskChar: undefined }, 'Card: [CENSORED].'],
      ['Card: 1234-5678-9012-3456.', { maskChar: '*' }, 'Card: *******************.'],
      ['Card: 1234-5678-9012-3456.', { maskChar: '*', maskLength: 5 }, 'Card: *****.'],
    ])(
      'should censor a credit card number (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Card: 1234 5678 9012 3456', { maskChar: undefined }, 'Card: [CENSORED]'],
      ['Card: 1234 5678 9012 3456', { maskChar: '*' }, 'Card: *******************'],
      ['Card: 1234 5678 9012 3456', { maskChar: '*', maskLength: 5 }, 'Card: *****'],
    ])(
      'should censor credit card with spaces (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Exp: 03/26', { maskChar: undefined }, '[CENSORED]'],
      ['Exp: 03/26', { maskChar: '*' }, '**********'],
      ['Exp: 03/26', { maskChar: '*', maskLength: 5 }, '*****'],
    ])(
      'should censor a credit card expiration date with prefix (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    describe('General Dates', () => {
      test.each([
        ['Date of birth: 01/01/1990.', { maskChar: undefined }, 'Date of birth: 01/01/1990.'],
        ['Date of birth: 01/01/1990.', { maskChar: '*' }, 'Date of birth: 01/01/1990.'],
        ['Date of birth: 01/01/1990.', { maskChar: '*', maskLength: 5 }, 'Date of birth: 01/01/1990.'],
      ])(
        'should not censor general dates as credit card expirations without prefix (options=%o)',
        async (input, options, expected) => {
          await expect(censorPII(input, options)).resolves.toBe(expected);
        }
      );
    });
  });

  describe('ID Numbers', () => {
    test.each([
      ['My ID is 987654321.', { maskChar: undefined }, 'My ID is [CENSORED].'],
      ['My ID is 987654321.', { maskChar: '*' }, 'My ID is *********.'],
      ['My ID is 987654321.', { maskChar: '*', maskLength: 5 }, 'My ID is *****.'],
    ])(
      'should censor a general 9-digit ID number (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Passport: G123456789.', { maskChar: undefined }, 'Passport: [CENSORED].'],
      ['Passport: G123456789.', { maskChar: '*' }, 'Passport: **********.'],
      ['Passport: G123456789.', { maskChar: '*', maskLength: 5 }, 'Passport: *****.'],
    ])(
      'should censor a passport number (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Patient MRN-0012345.', { maskChar: undefined }, 'Patient [CENSORED].'],
      ['Patient MRN-0012345.', { maskChar: '*' }, 'Patient ***********.'],
      ['Patient MRN-0012345.', { maskChar: '*', maskLength: 5 }, 'Patient *****.'],
    ])(
      'should censor a medical record number (MRN) (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Policy: 98765.', { maskChar: undefined }, 'Policy: [CENSORED].'],
      ['Policy: 98765.', { maskChar: '*' }, 'Policy: *****.'],
      ['Policy: 98765.', { maskChar: '*', maskLength: 4 }, 'Policy: ****.'],
    ])(
      'should censor a policy number (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Mixed Regex PII', () => {
    test.each([
      [
        'John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.',
        { maskChar: undefined },
        '[CENSORED] (SSN: [CENSORED]) lives at 123 Oak Ave, Anytown, NY. Email: [CENSORED]. Phone: ([CENSORED].'
      ],
      [
        'John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.',
        { maskChar: '*' },
        '******** (SSN: ***********) lives at 123 Oak Ave, Anytown, NY. Email: *****************. Phone: (*************.'
      ],
      [
        'John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.',
        { maskChar: '*', maskLength: 5 },
        '***** (SSN: *****) lives at 123 Oak Ave, Anytown, NY. Email: *****. Phone: (*****.'
      ],
    ])('should handle multiple PII types in one string (options=%o)', async (input, options, expected) => {
      await expect(censorPII(input, options)).resolves.toBe(expected);
    });

    test.each([
      ['SSN: 123 45 6789 and Phone: (123)456-7890.', { maskChar: undefined }, '[CENSORED]: [CENSORED] and Phone: ([CENSORED].'],
      ['SSN: 123 45 6789 and Phone: (123)456-7890.', { maskChar: '*' }, '***: *********** and Phone: (************.'],
      ['SSN: 123 45 6789 and Phone: (123)456-7890.', { maskChar: '*', maskLength: 5 }, '*****: ***** and Phone: (*****.'],
    ])('should handle PII with different spacing in numbers (options=%o)', async (input, options, expected) => {
      await expect(censorPII(input, options)).resolves.toBe(expected);
    });
  });
});
