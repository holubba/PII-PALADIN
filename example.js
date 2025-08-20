/*
 * PII-PALADIN
 *
 * example.js: A demonstration of how to use the censorPII function with various test cases.
 */

import { censorPII } from './index.js';

// --- Test Cases ---
// Note: The current Xenova/bert-base-NER model primarily detects PER (Person), ORG (Organization),
// LOC (Location), and MISC (Miscellaneous). Many of the PII types below will NOT be censored
// by this model, as it was not trained to recognize them.

const testCases = [
    // Full Name
    'My name is John Doe, and I work for Acme Corp.',
    'Please contact Jane Smith at her office.',
    'The meeting was attended by Dr. Alice Wonderland and Mr. Bob The Builder.',

    // Social Security Number (SSN)
    'My SSN is 123-45-6789. Please keep it confidential.',
    'The document contains SSN: ***-**-1234 for verification.',

    // Driver's License Number / State ID Number
    "My driver's license number is A12345678. It expires next year.",
    'State ID: 987654321. Date of birth: 01/01/1990.',

    // Passport Number
    'Passport number G123456789 was issued in London.',
    "Traveler's passport: P1234567.",

    // Financial Account Numbers (Credit Card, Bank Account, etc.)
    'My credit card number is 1234-5678-9012-3456, expiration 12/25.',
    'Bank account: 9876543210. Routing: 012345678.',
    'Debit card ending in 7890.',

    // NEW: Credit Card Numbers and Expiration Dates
    'Visa: 4111-2222-3333-4444, Exp: 03/26',
    'MasterCard: 5123 4567 8901 2345, Valid Thru: 10-2028',
    'Amex: 3456-789012-34567, Expires: 01/2025',
    'Discover: 6011-1234-5678-9012, Expiration Date: 07/24',
    'Card number 1234567890123456, expiry 11/23',
    'My card is 4000123456789010, valid until 09/27.',
    'The card expires on 02/2030.',
    'Expiration: 06-29',

    // Biometric Data (represented as descriptions)
    'Fingerprint scan data: F123ABC456.',
    'Retinal scan identified the subject.',
    'Voiceprint analysis confirmed the speaker.',

    // Medical Records Numbers / Health Insurance Information
    'Patient ID: MRN-0012345. Insurance: Blue Cross Blue Shield, Policy 98765.',
    'Medical record number is 54321.',

    // Email Address
    'You can reach me at john.doe@example.com for any questions.',
    'Send feedback to support@company.org.',

    // Phone Number
    'My phone number is (123) 456-7890. Call me anytime.',
    'Contact us at +1-800-555-1234.',

    // Physical Address
    'I live at 1600 Pennsylvania Avenue NW, Washington, D.C. 20500.',
    'The office is located at 123 Main Street, Anytown, CA 90210.',

    // IP Address
    "My IP address is 192.168.1.1. The server's IP is 203.0.113.45.",
    'Accessed from 10.0.0.254.',

    // Vehicle Identification Number (VIN)
    'The VIN of my car is 1G1FN13M031234567.',
    'VIN: ABCDEFG1234567890.',

    // Mixed PII
    'John Doe (SSN: 123-45-6789) lives at 123 Oak Ave, Anytown, NY. Email: john.doe@mail.com. Phone: (555) 123-4567.',
];

async function runTestCases() {
    for (let i = 0; i < testCases.length; i++) {
        const originalText = testCases[i];
        console.log(`\n--- Test Case ${i + 1} ---`);
        console.log('Original:', originalText);

        try {
            const censoredText = await censorPII(originalText);
            console.log('Censored:', censoredText);
        } catch (error) {
            console.error('Error during censoring:', error.message);
        }
    }
}

console.log(
    'Running PII censoring test cases... This may take a moment on the first run as the model loads.',
);
runTestCases();
