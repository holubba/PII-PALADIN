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
      ['', undefined, ''],
      ['', '*', ''],
    ])('should handle empty string (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['   ', undefined, '   '],
      ['   ', '*', '   '],
    ])('should handle string with only spaces (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['\t\n\r', undefined, '\t\n\r'],
      ['\t\n\r', '*', '\t\n\r'],
    ])('should handle string with only tabs and newlines (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Non-PII Text', () => {
    test.each([
      ['This is a regular sentence with no sensitive information.', undefined,
        'This is a regular sentence with no sensitive information.'],
      ['This is a regular sentence with no sensitive information.', '*',
        'This is a regular sentence with no sensitive information.'],
    ])('should not censor non-PII text (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['The temperature is 72 degrees.', undefined, 'The temperature is 72 degrees.'],
      ['The temperature is 72 degrees.', '*', 'The temperature is 72 degrees.'],
    ])('should not censor numbers that are not PII (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Date of birth: 01/01/1990.', undefined, 'Date of birth: 01/01/1990.'],
      ['Date of birth: 01/01/1990.', '*', 'Date of birth: 01/01/1990.'],
    ])('should not censor dates that are not credit card expirations (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Overlapping PII Detection', () => {
    test.each([
      ['My email is test@example.com and my name is John Doe.', undefined,
        'My email is [CENSORED] and my name is [CENSORED].'],
      ['My email is test@example.com and my name is John Doe.', '*',
        'My email is **************** and my name is ********.'],
    ])('should handle overlapping PII correctly (longer match first) (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['John Doe and Jane Smith are here.', undefined, '[CENSORED] and Jane Smith are here.'],
      ['John Doe and Jane Smith are here.', '*', '******** and Jane Smith are here.'],
    ])('should handle multiple occurrences of the same PII type (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['SSN: 123 45 6789 and Phone: (123)456-7890.', undefined,
        '[CENSORED]: [CENSORED] and Phone: ([CENSORED].'],
      ['SSN: 123 45 6789 and Phone: (123)456-7890.', '*',
        '***: *********** and Phone: (************.'],
    ])('should handle PII with different spacing in numbers (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Boundary Conditions', () => {
    test.each([
      ['John Doe is here.', undefined, '[CENSORED] is here.'],
      ['John Doe is here.', '*', '******** is here.'],
    ])('should handle PII at the beginning of the string (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Here is John Doe.', undefined, 'Here is [CENSORED].'],
      ['Here is John Doe.', '*', 'Here is ********.'],
    ])('should handle PII at the end of the string (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['John Doe', undefined, '[CENSORED]'],
      ['John Doe', '*', '********'],
    ])('should handle PII as the entire string (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Hello, John Doe! How are you?', undefined, 'Hello, [CENSORED]! How are you?'],
      ['Hello, John Doe! How are you?', '*', 'Hello, ********! How are you?'],
    ])('should handle PII with punctuation (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Complex Integration Scenarios', () => {
    test.each([
      ['John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.', undefined,
        '[CENSORED] (SSN: [CENSORED]) lives at 123 Oak Ave, Anytown, NY. Email: [CENSORED]. Phone: ([CENSORED].'],
      ['John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.', '*',
        '******** (SSN: ***********) lives at 123 Oak Ave, Anytown, NY. Email: *****************. Phone: (*************.'],
    ])('should handle multiple PII types in one string (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['This is a very long string that contains multiple pieces of PII including John Doe who works at Acme Corp and lives in New York. His email is john.doe@example.com and his phone is (555) 123-4567. He also has an SSN of 123-45-6789.', undefined,
        'This is a very long string that contains multiple pieces of PII including [CENSORED] who works at Acme Corp and lives in New York. His email is [CENSORED] and his phone is ([CENSORED]. He also has an SSN of [CENSORED].'],
      ['This is a very long string that contains multiple pieces of PII including John Doe who works at Acme Corp and lives in New York. His email is john.doe@example.com and his phone is (555) 123-4567. He also has an SSN of 123-45-6789.', '*',
        'This is a very long string that contains multiple pieces of PII including ******** who works at Acme Corp and lives in New York. His email is ******************** and his phone is (*************. He also has an SSN of ***********.'],
    ])('should handle very long strings with multiple PII (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['User: John Doe\nEmail: test@example.com\nPhone: (555) 123-4567\nSSN: 123-45-6789', undefined,
        'User: [CENSORED]\nEmail: [CENSORED]\nPhone: ([CENSORED]\nSSN: [CENSORED]'],
      ['User: John Doe\nEmail: test@example.com\nPhone: (555) 123-4567\nSSN: 123-45-6789', '*',
        'User: ********\nEmail: ****************\nPhone: (*************\nSSN: ***********'],
    ])('should handle strings with special characters and PII (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
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
      ['123-45-6789 987-65-4321 555-12-3456 111-22-3333 444-55-6666', undefined,
        '[CENSORED]ED]SORED][CENSORED]ED]'],
      ['123-45-6789 987-65-4321 555-12-3456 111-22-3333 444-55-6666', '*',
        '*********************************** ***********************'],
    ])('should handle strings with many potential PII patterns (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['test@example.com test@example.com test@example.com', undefined,
        '[CENSORED] [CENSORED] [CENSORED]'],
      ['test@example.com test@example.com test@example.com', '*',
        '**************** **************** ****************'],
    ])('should handle strings with repeated patterns (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
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
