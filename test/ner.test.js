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
      ['My name is John Doe.', { maskChar: undefined }, 'My name is [CENSORED].'],
      ['My name is John Doe.', { maskChar: '*' }, 'My name is ********.'],
      ['My name is John Doe.', { maskChar: '*', maskLength: 5 }, 'My name is *****.'],
    ])(
      'should censor a full name (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['John Doe and Jane Smith are here.', { maskChar: undefined }, '[CENSORED] and Jane Smith are here.'],
      ['John Doe and Jane Smith are here.', { maskChar: '*' }, '******** and Jane Smith are here.'],
      ['John Doe and Jane Smith are here.', { maskChar: '*', maskLength: 5 }, '***** and Jane Smith are here.'],
    ])(
      'should censor multiple person names (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Alice Wonderland is a character.', { maskChar: undefined }, '[CENSORED] is a character.'],
      ['Alice Wonderland is a character.', { maskChar: '*' }, '**************** is a character.'],
      ['Alice Wonderland is a character.', { maskChar: '*', maskLength: 5 }, '***** is a character.'],
    ])(
      'should censor complex person names (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Bob The Builder is here.', { maskChar: undefined }, '[CENSORED] is here.'],
      ['Bob The Builder is here.', { maskChar: '*' }, '*************** is here.'],
      ['Bob The Builder is here.', { maskChar: '*', maskLength: 5 }, '***** is here.'],
    ])(
      'should censor names with titles (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Organization (ORG) Detection', () => {
    test.each([
      ['I work for Acme Corp.', { maskChar: undefined }, 'I work for [CENSORED].'],
      ['I work for Acme Corp.', { maskChar: '*' }, 'I work for *********.'],
      ['I work for Acme Corp.', { maskChar: '*', maskLength: 5 }, 'I work for *****.'],
    ])(
      'censors a simple organization name (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['John Doe, CEO of Acme Inc., lives in New York.', { maskChar: undefined }, '[CENSORED], CEO of Acme Inc., lives in New York.'],
      ['John Doe, CEO of Acme Inc., lives in New York.', { maskChar: '*' }, '********, CEO of Acme Inc., lives in New York.'],
      ['John Doe, CEO of Acme Inc., lives in New York.', { maskChar: '*', maskLength: 5 }, '*****, CEO of Acme Inc., lives in New York.'],
    ])(
      'censors organization names with abbreviations (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Blue Cross Blue Shield is an insurance company.', { maskChar: undefined }, '[CENSORED] is an insurance company.'],
      ['Blue Cross Blue Shield is an insurance company.', { maskChar: '*' }, '********************** is an insurance company.'],
      ['Blue Cross Blue Shield is an insurance company.', { maskChar: '*', maskLength: 5 }, '***** is an insurance company.'],
    ])(
      'censors complex organization names (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Location (LOC) Detection', () => {
    test.each([
      ['He lives in New York.', { maskChar: undefined }, 'He lives in [CENSORED].'],
      ['He lives in New York.', { maskChar: '*' }, 'He lives in ********.'],
      ['He lives in New York.', { maskChar: '*', maskLength: 5 }, 'He lives in *****.'],
    ])(
      'censors a location (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['The address is 123 Oak Ave.', { maskChar: undefined }, 'The address is 123 [CENSORED].'],
      ['The address is 123 Oak Ave.', { maskChar: '*' }, 'The address is 123 *******.'],
      ['The address is 123 Oak Ave.', { maskChar: '*', maskLength: 5 }, 'The address is 123 *****.'],
    ])(
      'censors street addresses (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Anytown is a small city.', { maskChar: undefined }, '[CENSORED] is a small city.'],
      ['Anytown is a small city.', { maskChar: '*' }, '******* is a small city.'],
      ['Anytown is a small city.', { maskChar: '*', maskLength: 5 }, '***** is a small city.'],
    ])(
      'censors city names (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['He is from NY.', { maskChar: undefined }, 'He is from [CENSORED].'],
      ['He is from NY.', { maskChar: '*' }, 'He is from **.'],
      ['He is from NY.', { maskChar: '*', maskLength: 5 }, 'He is from *****.'],
    ])(
      'censors state abbreviations (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });

  describe('Mixed NER Entities', () => {
    test.each([
      ['John Doe, CEO of Acme Inc., lives in New York.', { maskChar: undefined }, '[CENSORED], CEO of Acme Inc., lives in New York.'],
      ['John Doe, CEO of Acme Inc., lives in New York.', { maskChar: '*' }, '********, CEO of Acme Inc., lives in New York.'],
      ['John Doe, CEO of Acme Inc., lives in New York.', { maskChar: '*', maskLength: 5 }, '*****, CEO of Acme Inc., lives in New York.'],
    ])(
      'should censor mixed NER entities (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['John Doe is here.', { maskChar: undefined }, '[CENSORED] is here.'],
      ['John Doe is here.', { maskChar: '*' }, '******** is here.'],
      ['John Doe is here.', { maskChar: '*', maskLength: 5 }, '***** is here.'],
    ])(
      'should handle PII at the beginning of the string (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );

    test.each([
      ['Here is John Doe.', { maskChar: undefined }, 'Here is [CENSORED].'],
      ['Here is John Doe.', { maskChar: '*' }, 'Here is ********.'],
      ['Here is John Doe.', { maskChar: '*', maskLength: 5 }, 'Here is *****.'],
    ])(
      'should handle PII at the end of the string (options=%o)',
      async (input, options, expected) => {
        await expect(censorPII(input, options)).resolves.toBe(expected);
      }
    );
  });
});
