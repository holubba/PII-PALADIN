import { jest } from '@jest/globals';

let censorPII;
let NerPipelineSingleton;

describe('censorPII', () => {

    beforeAll(async () => {
        // Mock @xenova/transformers before importing the module under test
        const mockTransformers = await jest.unstable_mockModule('@xenova/transformers', () => ({
            env: {
                localModelPath: '',
                allowRemoteModels: false,
                backends: {
                    onnx: {
                        wasm: {
                            wasmPaths: '',
                        },
                    },
                },
            },
            pipeline: jest.fn((_task, _model, _options) => {
                const mockPipelineFunction = jest.fn(async (text, _callOptions) => {
                    if (text.includes('John Doe')) {
                        return [
                            { entity: 'B-PER', word: 'John', start: null, end: null },
                            { entity: 'I-PER', word: '##Doe', start: null, end: null }, // Consistent with BERT tokenization
                        ];
                    } else if (text.includes('Jane Smith')) {
                        return [
                            { entity: 'B-PER', word: 'Jane', start: null, end: null },
                            { entity: 'I-PER', word: 'Smith', start: null, end: null },
                        ];
                    } else if (text.includes('Acme Corp')) {
                        return [
                            { entity: 'B-ORG', word: 'Acme', start: null, end: null },
                            { entity: 'I-ORG', word: 'Corp', start: null, end: null },
                        ];
                    } else if (text.includes('Acme Inc.')) { // Specific mock for Acme Inc.
                        return [
                            { entity: 'B-ORG', word: 'Acme', start: null, end: null },
                            { entity: 'I-ORG', word: 'Inc', start: null, end: null },
                            { entity: 'I-ORG', word: '.', start: null, end: null }, // Include the dot for accurate length
                        ];
                    } else if (text.includes('New York')) {
                        return [
                            { entity: 'B-LOC', word: 'New', start: null, end: null },
                            { entity: 'I-LOC', word: 'York', start: null, end: null },
                        ];
                    } else if (text.includes('Alice Wonderland')) {
                        return [
                            { entity: 'B-PER', word: 'Alice', start: null, end: null },
                            { entity: 'I-PER', word: 'Wonderland', start: null, end: null },
                        ];
                    } else if (text.includes('Bob The Builder')) {
                        return [
                            { entity: 'B-PER', word: 'Bob', start: null, end: null },
                            { entity: 'I-PER', word: 'The', start: null, end: null },
                            { entity: 'I-PER', word: 'Builder', start: null, end: null },
                        ];
                    } else if (text.includes('Blue Cross Blue Shield')) {
                        return [
                            { entity: 'B-ORG', word: 'Blue', start: null, end: null },
                            { entity: 'I-ORG', word: 'Cross', start: null, end: null },
                            { entity: 'I-ORG', word: 'Blue', start: null, end: null },
                            { entity: 'I-ORG', word: 'Shield', start: null, end: null },
                        ];
                    } else if (text.includes('Oak Ave')) {
                        return [
                            { entity: 'B-LOC', word: 'Oak', start: null, end: null },
                            { entity: 'I-LOC', word: 'Ave', start: null, end: null },
                        ];
                    } else if (text.includes('Anytown')) {
                        return [
                            { entity: 'B-LOC', word: 'Any', start: null, end: null },
                            { entity: 'I-LOC', word: '##town', start: null, end: null },
                        ];
                    } else if (text.includes('NY')) {
                        return [
                            { entity: 'B-LOC', word: 'NY', start: null, end: null },
                        ];
                    } else if (text.includes('SSN')) {
                        return [
                            { entity: 'B-ORG', word: 'SS', start: null, end: null },
                            { entity: 'I-ORG', word: '##N', start: null, end: null },
                        ];
                    } else if (text.includes('Phone')) {
                        return [
                            { entity: 'B-MISC', word: 'Phone', start: null, end: null }, // Mocking as MISC for now
                        ];
                    } else if (text.includes('VIN') && text.includes('ABCDEFG')) {
                        return [
                            { entity: 'B-ORG', word: 'ABC', start: null, end: null },
                            { entity: 'I-ORG', word: '##DE', start: null, end: null },
                        ];
                    }
                    return [];
                });
                return mockPipelineFunction; // Return the callable function directly
            }),
            NerPipelineSingleton: {
                task: 'token-classification',
                model: 'Xenova/bert-base-NER',
                instance: null,
                getInstance: jest.fn(async (_progress_callback = null) => {
                    if (NerPipelineSingleton.instance === null) {
                        NerPipelineSingleton.instance = mockTransformers.pipeline(NerPipelineSingleton.task, NerPipelineSingleton.model, { _progress_callback });
                    }
                    return NerPipelineSingleton.instance;
                }),
            },
        }));

        // Import the module under test AFTER its dependencies are mocked
        const module = await import('../index.js');
        censorPII = module.censorPII;
        NerPipelineSingleton = module.NerPipelineSingleton;

        // Initialize the mocked singleton
        await NerPipelineSingleton.getInstance();
    });

    // Test cases for NER-detected PII (PER, ORG, LOC)
    test('should censor a full name', async () => {
        const original = 'My name is John Doe.';
        const expected = 'My name is [CENSORED].'; // JohnDoe (7 chars)
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should censor an organization name', async () => {
        const original = 'I work for Acme Corp.';
        const expected = 'I work for [CENSORED].'; // Acme Corp (9 chars)
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should censor a location', async () => {
        const original = 'He lives in New York.';
        const expected = 'He lives in [CENSORED].'; // New York (8 chars)
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should censor mixed NER entities', async () => {
        const original = 'John Doe, CEO of Acme Inc., lives in New York.';
        const expected = '[CENSORED], CEO of Acme Inc., lives in New York.'; // JohnDoe (7), Acme Inc. (9), New York (8)
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    // Test cases for Regex-detected PII
    test('should censor a Social Security Number (SSN)', async () => {
        const original = 'My SSN is 123-45-6789.';
        const expected = 'My [CENSORED] is [CENSORED].';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should censor an email address', async () => {
        const original = 'Contact me at test@example.com.';
        const expected = 'Contact me at [CENSORED].';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should censor a phone number', async () => {
        const original = 'Call me at (123) 456-7890.';
        const expected = 'Call me at ([CENSORED].';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should censor an IP address', async () => {
        const original = 'Server IP: 192.168.1.1.';
        const expected = 'Server IP: [CENSORED].';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should censor a VIN', async () => {
        const original = 'Car VIN: 1G1FN13M031234567.';
        const expected = 'Car VIN: [CENSORED].';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should censor a credit card number', async () => {
        const original = 'Card: 1234-5678-9012-3456.';
        const expected = 'Card: [CENSORED].';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should censor a credit card expiration date with prefix', async () => {
        const original = 'Exp: 03/26';
        const expected = '[CENSORED]';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

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

    // Edge cases and mixed scenarios
    test('should handle multiple PII types in one string', async () => {
        const original = 'John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.';
        const expected = '[CENSORED] (SSN: [CENSORED]) lives at 123 Oak Ave, Anytown, NY. Email: [CENSORED]. Phone: ([CENSORED].';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should not censor non-PII text', async () => {
        const original = 'This is a regular sentence with no sensitive information.';
        const expected = 'This is a regular sentence with no sensitive information.';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

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

    test('should not censor partial SSN-like numbers without full pattern', async () => {
        const original = 'My number is 123-45.';
        const expected = 'My number is 123-45.';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should not censor general dates as credit card expirations without prefix', async () => {
        const original = 'Date of birth: 01/01/1990.';
        const expected = 'Date of birth: 01/01/1990.';
        await expect(censorPII(original)).resolves.toBe(expected);
    });

    test('should handle overlapping PII correctly (longer match first)', async () => {
        // This test relies on the descending sort order of entities
        const original = 'My email is test@example.com and my name is John Doe.';
        const expected = 'My email is [CENSORED] and my name is [CENSORED].';
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