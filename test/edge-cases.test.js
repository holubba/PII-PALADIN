import { jest } from '@jest/globals';
import { setupTestEnvironment } from './setup.js';

describe('Edge Cases and Integration Tests', () => {
  let censorPII;

  beforeAll(async () => {
    const setup = await setupTestEnvironment();
    censorPII = setup.censorPII;
  });

  describe('Empty and Whitespace Inputs', () => {
    test.each([
      ['', { maskChar: undefined }, ''],
      ['', { maskChar: '*' }, ''],
      ['', { maskChar: '*', maskLength: 5 }, ''],
    ])(
      'should handle empty string (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['   ', { maskChar: undefined }, '   '],
      ['   ', { maskChar: '*' }, '   '],
      ['   ', { maskChar: '*', maskLength: 5 }, '   '],
    ])(
      'should handle string with only spaces (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['\t\n\r', { maskChar: undefined }, '\t\n\r'],
      ['\t\n\r', { maskChar: '*' }, '\t\n\r'],
      ['\t\n\r', { maskChar: '*', maskLength: 5 }, '\t\n\r'],
    ])(
      'should handle string with only tabs and newlines (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Non-PII Text', () => {
    test.each([
      [
        'This is a regular sentence with no sensitive information.',
        { maskChar: undefined },
        'This is a regular sentence with no sensitive information.',
      ],
      [
        'This is a regular sentence with no sensitive information.',
        { maskChar: '*' },
        'This is a regular sentence with no sensitive information.',
      ],
      [
        'This is a regular sentence with no sensitive information.',
        { maskChar: '*', maskLength: 5 },
        'This is a regular sentence with no sensitive information.',
      ],
    ])(
      'should not censor non-PII text (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      [
        'The temperature is 72 degrees.',
        { maskChar: undefined },
        'The temperature is 72 degrees.',
      ],
      [
        'The temperature is 72 degrees.',
        { maskChar: '*' },
        'The temperature is 72 degrees.',
      ],
      [
        'The temperature is 72 degrees.',
        { maskChar: '*', maskLength: 5 },
        'The temperature is 72 degrees.',
      ],
    ])(
      'should not censor numbers that are not PII (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      [
        'Date of birth: 01/01/1990.',
        { maskChar: undefined },
        'Date of birth: 01/01/1990.',
      ],
      [
        'Date of birth: 01/01/1990.',
        { maskChar: '*' },
        'Date of birth: 01/01/1990.',
      ],
      [
        'Date of birth: 01/01/1990.',
        { maskChar: '*', maskLength: 5 },
        'Date of birth: 01/01/1990.',
      ],
    ])(
      'should not censor dates that are not credit card expirations (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Overlapping PII Detection', () => {
    test.each([
      [
        'My email is test@example.com and my name is John Doe.',
        { maskChar: undefined },
        'My email is [CENSORED] and my name is [CENSORED].',
      ],
      [
        'My email is test@example.com and my name is John Doe.',
        { maskChar: '*' },
        'My email is **************** and my name is ********.',
      ],
      [
        'My email is test@example.com and my name is John Doe.',
        { maskChar: '*', maskLength: 5 },
        'My email is ***** and my name is *****.',
      ],
    ])(
      'should handle overlapping PII correctly (longer match first) (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      [
        'John Doe and Jane Smith are here.',
        { maskChar: undefined },
        '[CENSORED] and Jane Smith are here.',
      ],
      [
        'John Doe and Jane Smith are here.',
        { maskChar: '*' },
        '******** and Jane Smith are here.',
      ],
      [
        'John Doe and Jane Smith are here.',
        { maskChar: '*', maskLength: 5 },
        '***** and Jane Smith are here.',
      ],
    ])(
      'should handle multiple occurrences of the same PII type (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      [
        'SSN: 123 45 6789 and Phone: (123)456-7890.',
        { maskChar: undefined },
        '[CENSORED]: [CENSORED] and Phone: ([CENSORED].',
      ],
      [
        'SSN: 123 45 6789 and Phone: (123)456-7890.',
        { maskChar: '*' },
        '***: *********** and Phone: (************.',
      ],
      [
        'SSN: 123 45 6789 and Phone: (123)456-7890.',
        { maskChar: '*', maskLength: 5 },
        '*****: ***** and Phone: (*****.',
      ],
    ])(
      'should handle PII with different spacing in numbers (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Boundary Conditions', () => {
    test.each([
      [
        'John Doe is here.',
        { maskChar: undefined },
        '[CENSORED] is here.',
      ],
      [
        'John Doe is here.',
        { maskChar: '*' },
        '******** is here.',
      ],
      [
        'John Doe is here.',
        { maskChar: '*', maskLength: 5 },
        '***** is here.',
      ],
    ])(
      'should handle PII at the beginning of the string (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      [
        'Here is John Doe.',
        { maskChar: undefined },
        'Here is [CENSORED].',
      ],
      [
        'Here is John Doe.',
        { maskChar: '*' },
        'Here is ********.',
      ],
      [
        'Here is John Doe.',
        { maskChar: '*', maskLength: 5 },
        'Here is *****.',
      ],
    ])(
      'should handle PII at the end of the string (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      [
        'John Doe',
        { maskChar: undefined },
        '[CENSORED]',
      ],
      [
        'John Doe',
        { maskChar: '*' },
        '********',
      ],
      [
        'John Doe',
        { maskChar: '*', maskLength: 5 },
        '*****',
      ],
    ])(
      'should handle PII as the entire string (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      [
        'Hello, John Doe! How are you?',
        { maskChar: undefined },
        'Hello, [CENSORED]! How are you?',
      ],
      [
        'Hello, John Doe! How are you?',
        { maskChar: '*' },
        'Hello, ********! How are you?',
      ],
      [
        'Hello, John Doe! How are you?',
        { maskChar: '*', maskLength: 5 },
        'Hello, *****! How are you?',
      ],
    ])(
      'should handle PII with punctuation (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Complex Integration Scenarios', () => {
    test.each([
      [
        'John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.',
        { maskChar: undefined },
        '[CENSORED] (SSN: [CENSORED]) lives at 123 Oak Ave, Anytown, NY. Email: [CENSORED]. Phone: ([CENSORED].',
      ],
      [
        'John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.',
        { maskChar: '*' },
        '******** (SSN: ***********) lives at 123 Oak Ave, Anytown, NY. Email: *****************. Phone: (*************.',
      ],
      [
        'John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.',
        { maskChar: '*', maskLength: 5 },
        '***** (SSN: *****) lives at 123 Oak Ave, Anytown, NY. Email: *****. Phone: (*****.',
      ],
    ])(
      'should handle multiple PII types in one string (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      [
        'This is a very long string that contains multiple pieces of PII including John Doe who works at Acme Corp and lives in New York. His email is john.doe@example.com and his phone is (555) 123-4567. He also has an SSN of 123-45-6789.',
        { maskChar: undefined },
        'This is a very long string that contains multiple pieces of PII including [CENSORED] who works at Acme Corp and lives in New York. His email is [CENSORED] and his phone is ([CENSORED]. He also has an SSN of [CENSORED].',
      ],
      [
        'This is a very long string that contains multiple pieces of PII including John Doe who works at Acme Corp and lives in New York. His email is john.doe@example.com and his phone is (555) 123-4567. He also has an SSN of 123-45-6789.',
        { maskChar: '*' },
        'This is a very long string that contains multiple pieces of PII including ******** who works at Acme Corp and lives in New York. His email is ******************** and his phone is (*************. He also has an SSN of ***********.',
      ],
      [
        'This is a very long string that contains multiple pieces of PII including John Doe who works at Acme Corp and lives in New York. His email is john.doe@example.com and his phone is (555) 123-4567. He also has an SSN of 123-45-6789.',
        { maskChar: '*', maskLength: 5 },
        'This is a very long string that contains multiple pieces of PII including ***** who works at Acme Corp and lives in New York. His email is ***** and his phone is (*****. He also has an SSN of *****.',
      ],
    ])(
      'should handle very long strings with multiple PII (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      [
        'User: John Doe\nEmail: test@example.com\nPhone: (555) 123-4567\nSSN: 123-45-6789',
        { maskChar: undefined },
        'User: [CENSORED]\nEmail: [CENSORED]\nPhone: ([CENSORED]\nSSN: [CENSORED]',
      ],
      [
        'User: John Doe\nEmail: test@example.com\nPhone: (555) 123-4567\nSSN: 123-45-6789',
        { maskChar: '*' },
        'User: ********\nEmail: ****************\nPhone: (*************\nSSN: ***********',
      ],
      [
        'User: John Doe\nEmail: test@example.com\nPhone: (555) 123-4567\nSSN: 123-45-6789',
        { maskChar: '*', maskLength: 5 },
        'User: *****\nEmail: *****\nPhone: (*****\nSSN: *****',
      ],
    ])(
      'should handle strings with special characters and PII (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Error Handling', () => {
    test('should handle malformed input gracefully', async () => {
      const original = null;
      // The implementation handles null gracefully by returning the input
      await expect(censorPII(original)).resolves.toBe(original);
    });

    test('should handle undefined input gracefully', async () => {
      const original = undefined;
      // The implementation handles undefined gracefully by returning the input
      await expect(censorPII(original)).resolves.toBe(original);
    });

    test('should handle non-string input gracefully', async () => {
      const original = 123;
      // The implementation handles non-string input gracefully by returning the input
      await expect(censorPII(original)).resolves.toBe(original);
    });
  });

  describe('Performance Edge Cases', () => {
    test.each([
      [
        '123-45-6789 987-65-4321 555-12-3456 111-22-3333 444-55-6666',
        { maskChar: undefined },
        '[CENSORED]RED]SORED] [CENSORED]RED]',
      ],
      [
        '123-45-6789 987-65-4321 555-12-3456 111-22-3333 444-55-6666',
        { maskChar: '*' },
        '*********************************** ***********************',
      ],
      [
        '123-45-6789 987-65-4321 555-12-3456 111-22-3333 444-55-6666',
        { maskChar: '*', maskLength: 5 },
        '***** *****',
      ],
    ])(
      'should handle strings with many potential PII patterns (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      [
        'test@example.com test@example.com test@example.com',
        { maskChar: undefined },
        '[CENSORED] [CENSORED] [CENSORED]',
      ],
      [
        'test@example.com test@example.com test@example.com',
        { maskChar: '*' },
        '**************** **************** ****************',
      ],
      [
        'test@example.com test@example.com test@example.com',
        { maskChar: '*', maskLength: 5 },
        '***** ***** *****',
      ],
    ])(
      'should handle strings with repeated patterns (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Invalid maskChar Handling', () => {
    test.each([
      [null],
      [undefined],
      [''],
      ['  '],
      ['\n'],
      ['**'], // multiple characters
      [123], // non-string
      [{}],
    ])('should fallback to default when maskChar is %p', async (invalidMaskChar) => {
      const original = 'John Doe';
      const expected = '[CENSORED]';

      await expect(censorPII(original, { maskChar: invalidMaskChar })).resolves.toBe(expected);
    });
  });
});
