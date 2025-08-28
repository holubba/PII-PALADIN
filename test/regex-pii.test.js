import { jest } from '@jest/globals';
import { setupTestEnvironment } from './setup.js';

describe('Regex PII Detection Tests', () => {
    let censorPII;

    beforeAll(async () => {
        const setup = await setupTestEnvironment();
        censorPII = setup.censorPII;
    });

    describe('Social Security Number (SSN)', () => {
        test('should censor a Social Security Number (SSN)', async () => {
            const original = 'My SSN is 123-45-6789.';
            const expected = 'My [CENSORED] is [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor SSN with different spacing', async () => {
            const original = 'SSN: 123 45 6789';
            const expected = '[CENSORED]: [CENSORED]';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should not censor partial SSN-like numbers without full pattern', async () => {
            const original = 'My number is 123-45.';
            const expected = 'My number is 123-45.';
            await expect(censorPII(original)).resolves.toBe(expected);
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
        test('should censor a phone number', async () => {
            const original = 'Call me at (123) 456-7890.';
            const expected = 'Call me at ([CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor phone with different formats', async () => {
            const original = 'Phone: (123)456-7890.';
            const expected = '[CENSORED]: ([CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('IP Addresses', () => {
        test('should censor an IP address', async () => {
            const original = 'Server IP: 192.168.1.1.';
            const expected = 'Server IP: [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor different IP formats', async () => {
            const original = 'IP: 10.0.0.1 and 172.16.0.1';
            const expected = 'IP: [CENSORED] and [CENSORED]';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('Vehicle Identification Numbers (VIN)', () => {
        test('should censor a VIN', async () => {
            const original = 'Car VIN: 1G1FN13M031234567.';
            const expected = 'Car VIN: [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor VIN with letters', async () => {
            const original = 'VIN: ABCDEFGHIJKLMNOPQ';
            const expected = 'VIN: [CENSORED]FGHIJKLMNOPQ';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('Credit Card Numbers', () => {
        test('should censor a credit card number', async () => {
            const original = 'Card: 1234-5678-9012-3456.';
            const expected = 'Card: [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor credit card with spaces', async () => {
            const original = 'Card: 1234 5678 9012 3456';
            const expected = 'Card: [CENSORED]';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor a credit card expiration date with prefix', async () => {
            const original = 'Exp: 03/26';
            const expected = '[CENSORED]';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should not censor general dates as credit card expirations without prefix', async () => {
            const original = 'Date of birth: 01/01/1990.';
            const expected = 'Date of birth: 01/01/1990.';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('ID Numbers', () => {
        test('should censor a general 9-digit ID number', async () => {
            const original = 'My ID is 987654321.';
            const expected = 'My ID is [CENSORED]]]].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor a passport number', async () => {
            const original = 'Passport: G123456789.';
            const expected = 'Passport: [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor a medical record number (MRN)', async () => {
            const original = 'Patient MRN-0012345.';
            const expected = 'Patient [CENSORED]ED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should censor a policy number', async () => {
            const original = 'Policy: 98765.';
            const expected = 'Policy: [CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });

    describe('Mixed Regex PII', () => {
        test('should handle multiple PII types in one string', async () => {
            const original = 'John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.';
            const expected = '[CENSORED] (SSN: [CENSORED]) lives at 123 Oak Ave, Anytown, NY. Email: [CENSORED]. Phone: ([CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });

        test('should handle PII with different spacing in numbers', async () => {
            const original = 'SSN: 123 45 6789 and Phone: (123)456-7890.';
            const expected = '[CENSORED]: [CENSORED] and Phone: ([CENSORED].';
            await expect(censorPII(original)).resolves.toBe(expected);
        });
    });
});
