import { jest } from '@jest/globals';
import { setupTestEnvironment } from './setup.js';

describe('NER (Named Entity Recognition) Tests', () => {
    let censorPII;

    beforeAll(async () => {
        const setup = await setupTestEnvironment();
        censorPII = setup.censorPII;
    });

    describe('Person (PER) Detection', () => {
        test('should censor a full name', async () => {
            const original = 'My name is John Doe.';
            const expected = 'My name is [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor multiple person names', async () => {
            const original = 'John Doe and Jane Smith are here.';
            const expected = '[CENSORED] and Jane Smith are here.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor complex person names', async () => {
            const original = 'Alice Wonderland is a character.';
            const expected = '[CENSORED] is a character.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor names with titles', async () => {
            const original = 'Bob The Builder is here.';
            const expected = '[CENSORED] is here.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('Organization (ORG) Detection', () => {
        test('should censor an organization name', async () => {
            const original = 'I work for Acme Corp.';
            const expected = 'I work for [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor organization names with abbreviations', async () => {
            const original = 'John Doe, CEO of Acme Inc., lives in New York.';
            const expected = '[CENSORED], CEO of Acme Inc., lives in New York.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor complex organization names', async () => {
            const original = 'Blue Cross Blue Shield is an insurance company.';
            const expected = '[CENSORED] is an insurance company.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('Location (LOC) Detection', () => {
        test('should censor a location', async () => {
            const original = 'He lives in New York.';
            const expected = 'He lives in [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor street addresses', async () => {
            const original = 'The address is 123 Oak Ave.';
            const expected = 'The address is 123 [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor city names', async () => {
            const original = 'Anytown is a small city.';
            const expected = '[CENSORED] is a small city.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor state abbreviations', async () => {
            const original = 'He is from NY.';
            const expected = 'He is from [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('Mixed NER Entities', () => {
        test('should censor mixed NER entities', async () => {
            const original = 'John Doe, CEO of Acme Inc., lives in New York.';
            const expected = '[CENSORED], CEO of Acme Inc., lives in New York.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle PII at the beginning of the string', async () => {
            const original = 'John Doe is here.';
            const expected = '[CENSORED] is here.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle PII at the end of the string', async () => {
            const original = 'Here is John Doe.';
            const expected = 'Here is [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });
});
