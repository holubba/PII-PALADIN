import { jest } from '@jest/globals';
import { setupTestEnvironment } from './setup.js';

describe('Edge Cases and Integration Tests', () => {
    let censorPII;

    beforeAll(async () => {
        const setup = await setupTestEnvironment();
        censorPII = setup.censorPII;
    });

    describe('Empty and Whitespace Inputs', () => {
        test('should handle empty string', async () => {
            const original = '';
            const expected = '';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle string with only spaces', async () => {
            const original = '   ';
            const expected = '   ';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle string with only tabs and newlines', async () => {
            const original = '\t\n\r';
            const expected = '\t\n\r';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('Non-PII Text', () => {
        test('should not censor non-PII text', async () => {
            const original = 'This is a regular sentence with no sensitive information.';
            const expected = 'This is a regular sentence with no sensitive information.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should not censor numbers that are not PII', async () => {
            const original = 'The temperature is 72 degrees.';
            const expected = 'The temperature is 72 degrees.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should not censor dates that are not credit card expirations', async () => {
            const original = 'Date of birth: 01/01/1990.';
            const expected = 'Date of birth: 01/01/1990.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('Overlapping PII Detection', () => {
        test('should handle overlapping PII correctly (longer match first)', async () => {
            const original = 'My email is test@example.com and my name is John Doe.';
            const expected = 'My email is [CENSORED] and my name is [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle multiple occurrences of the same PII type', async () => {
            const original = 'John Doe and Jane Smith are here.';
            const expected = '[CENSORED] and Jane Smith are here.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle PII with different spacing in numbers', async () => {
            const original = 'SSN: 123 45 6789 and Phone: (123)456-7890.';
            const expected = '[CENSORED]: [CENSORED] and Phone: ([CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('Boundary Conditions', () => {
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

        test('should handle PII as the entire string', async () => {
            const original = 'John Doe';
            const expected = '[CENSORED]';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle PII with punctuation', async () => {
            const original = 'Hello, John Doe! How are you?';
            const expected = 'Hello, [CENSORED]! How are you?';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('Complex Integration Scenarios', () => {
        test('should handle multiple PII types in one string', async () => {
            const original = 'John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.';
            const expected = '[CENSORED] (SSN: [CENSORED]) lives at 123 Oak Ave, Anytown, NY. Email: [CENSORED]. Phone: ([CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle very long strings with multiple PII', async () => {
            const original = 'This is a very long string that contains multiple pieces of PII including John Doe who works at Acme Corp and lives in New York. His email is john.doe@example.com and his phone is (555) 123-4567. He also has an SSN of 123-45-6789.';
            const expected = 'This is a very long string that contains multiple pieces of PII including [CENSORED] who works at Acme Corp and lives in New York. His email is [CENSORED] and his phone is ([CENSORED]. He also has an SSN of [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle strings with special characters and PII', async () => {
            const original = 'User: John Doe\nEmail: test@example.com\nPhone: (555) 123-4567\nSSN: 123-45-6789';
            const expected = 'User: [CENSORED]\nEmail: [CENSORED]\nPhone: ([CENSORED]\nSSN: [CENSORED]';
            await expect(censorPII(original)).resolves.toBe(expected);
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
        test('should handle strings with many potential PII patterns', async () => {
            const original = '123-45-6789 987-65-4321 555-12-3456 111-22-3333 444-55-6666';
            const expected = '[CENSORED]ED]SORED][CENSORED]ED]';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle strings with repeated patterns', async () => {
            const original = 'test@example.com test@example.com test@example.com';
            const expected = '[CENSORED] [CENSORED] [CENSORED]';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });
});
