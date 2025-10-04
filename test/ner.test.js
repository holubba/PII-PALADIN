import { jest } from '@jest/globals';
import { setupTestEnvironment } from './setup.js';

describe('NER (Named Entity Recognition) Tests', () => {
  let censorPII;

  beforeAll(async () => {
    const setup = await setupTestEnvironment();
    censorPII = setup.censorPII;
  });

  describe('Person (PER) Detection', () => {
    test.each([
      ['My name is John Doe.', undefined, 'My name is [CENSORED].'],
      ['My name is John Doe.', '*', 'My name is ********.'],
    ])('should censor a full name (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test('should censor multiple person names', async () => {
      const original = 'John Doe and Jane Smith are here.';
      const expected = '[CENSORED] and Jane Smith are here.';
      await expect(censorPII(original)).resolves.toBe(expected);
    });

    test.each([
      ['Alice Wonderland is a character.', undefined, '[CENSORED] is a character.'],
      ['Alice Wonderland is a character.', '*', '**************** is a character.'],
    ])('should censor complex person names (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Bob The Builder is here.', undefined, '[CENSORED] is here.'],
      ['Bob The Builder is here.', '*', '*************** is here.'],
    ])('should censor names with titles (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Organization (ORG) Detection', () => {
    test.each([
      ['I work for Acme Corp.', undefined, 'I work for [CENSORED].'],
      ['I work for Acme Corp.', '*', 'I work for *********.'],
    ])('censors a simple organization name (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['John Doe, CEO of Acme Inc., lives in New York.', undefined, '[CENSORED], CEO of Acme Inc., lives in New York.'],
      ['John Doe, CEO of Acme Inc., lives in New York.', '*', '********, CEO of Acme Inc., lives in New York.'],
    ])('censors organization names with abbreviations (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Blue Cross Blue Shield is an insurance company.', undefined, '[CENSORED] is an insurance company.'],
      ['Blue Cross Blue Shield is an insurance company.', '*', '********************** is an insurance company.'],
    ])('censors complex organization names (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Location (LOC) Detection', () => {
    test.each([
      ['He lives in New York.', undefined, 'He lives in [CENSORED].'],
      ['He lives in New York.', '*', 'He lives in ********.'],
    ])('censors a location (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['The address is 123 Oak Ave.', undefined, 'The address is 123 [CENSORED].'],
      ['The address is 123 Oak Ave.', '*', 'The address is 123 *******.'],
    ])('censors street addresses (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['Anytown is a small city.', undefined, '[CENSORED] is a small city.'],
      ['Anytown is a small city.', '*', '******* is a small city.'],
    ])('censors city names (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

    test.each([
      ['He is from NY.', undefined, 'He is from [CENSORED].'],
      ['He is from NY.', '*', 'He is from **.'],
    ])('censors state abbreviations (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });
  });

  describe('Mixed NER Entities', () => {
    test.each([
      ['John Doe, CEO of Acme Inc., lives in New York.', undefined, '[CENSORED], CEO of Acme Inc., lives in New York.'],
      ['John Doe, CEO of Acme Inc., lives in New York.', '*', '********, CEO of Acme Inc., lives in New York.'],
    ])('should censor mixed NER entities (maskChar=%s)', async (input, maskChar, expected) => {
      await expect(censorPII(input, { maskChar })).resolves.toBe(expected);
    });

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
  });
});
