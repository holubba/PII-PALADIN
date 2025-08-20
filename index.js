/*
 * PII-PALADIN
 *
 * index.js: Core logic for PII censoring.
 */

import { pipeline, env } from '@xenova/transformers';
import { fileURLToPath } from 'url';
import path from 'path';

// --- Configuration ---
// Get the directory of the current module.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure transformers.js to use local files ONLY.
// This is critical for ensuring offline operation.

// 1. Set the path to the local model directory.
// Models are expected to be in `/models/`.
env.localModelPath = path.resolve(__dirname, 'models/');

// 2. Disable remote model downloads.
// If the model is not found locally, it will throw an error instead of trying to download it.
env.allowRemoteModels = false;

// 3. Set the path to the local ONNX runtime WASM files.
// WASM files are expected to be in `/wasm/`.
env.backends.onnx.wasm.wasmPaths = path.join(__dirname, 'wasm/');

/**
 * @typedef {object} PIIEntity
 * @property {string} entity_group - The type of PII detected (e.g., 'PER', 'ORG', 'LOC', 'SSN', 'EMAIL').
 * @property {string} word - The actual text of the detected PII.
 * @property {number} start - The starting character index of the PII in the original string.
 * @property {number} end - The ending character index of the PII in the original string.
 * @property {number} score - The confidence score of the detection (for NER, 1.0 for regex).
 */

/**
 * Singleton class to manage the Named Entity Recognition (NER) pipeline from transformers.js.
 * Ensures that the NER model is loaded only once.
 */
export class NerPipelineSingleton {
    static task = 'token-classification';
    static model = 'Xenova/bert-base-NER';
    static instance = null;

    /**
     * Retrieves the singleton instance of the NER pipeline.
     * @param {function} [progress_callback=null] - Optional callback function for progress updates during model loading.
     * @returns {Promise<object>} A promise that resolves to the NER pipeline instance.
     */
    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            try {
                // Create a new pipeline instance
                this.instance = await pipeline(this.task, this.model, { progress_callback });
            } catch (error) {
                console.error('Error loading NER model or pipeline:', error);
                console.error(
                    "Please ensure model files are in 'models/Xenova/bert-base-NER/onnx/' and WASM files are in 'wasm/'.",
                );
                throw new Error(
                    'Failed to initialize NER pipeline. Check model and WASM file paths.',
                );
            }
        }
        return this.instance;
    }
}

// --- Regex Patterns for Structured PII ---
const regexPIIPatterns = [
    { type: 'SSN', pattern: /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g },
    { type: 'CREDIT_CARD', pattern: /\b(?:\d[ -]*?){13,16}\b/g }, // Basic pattern, not validating prefixes or Luhn
    {
        type: 'CREDIT_CARD_EXPIRATION',
        pattern:
            /\b(?:Exp(?:ires|iration Date)?:?|Valid Thru:?)\s*(0[1-9]|1[0-2])[-/]([0-9]{2}|[0-9]{4})\b/g,
    }, // MM/YY or MM/YYYY with mandatory prefixes
    { type: 'EMAIL', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
    { type: 'PHONE', pattern: /\b(?:\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4})\b/g }, // Common US formats
    {
        type: 'IP_ADDRESS',
        pattern:
            /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    },
    { type: 'VIN', pattern: /\b[A-HJ-NPR-Z0-9]{17}\b/g }, // Standard 17-character VIN, excluding I, O, Q
    { type: 'ID_NUMBER', pattern: /\b\d{9}\b/g }, // General 9-digit ID (e.g., some driver's licenses, state IDs)
    { type: 'PASSPORT_NUMBER', pattern: /\b[A-Z0-9]{8,12}\b/g }, // General 8-12 alphanumeric for passports
    { type: 'MEDICAL_RECORD_NUMBER', pattern: /\bMRN-\d{7}\b/g }, // Specific to MRN-XXXXXXX format
    { type: 'POLICY_NUMBER', pattern: /\b\d{5,10}\b/g }, // General 5-10 digit policy numbers
];

/**
 * Censors detected Personally Identifiable Information (PII) in a string using a hybrid approach.
 *
 * This function combines Named Entity Recognition (NER) for contextual PII (names, orgs, locations)
 * with Regular Expressions (Regex) for structured PII (SSN, credit cards, emails, phones, etc.).
 *
 * @param {string} input The string to censor.
 * @returns {Promise<string>} A promise that resolves to the censored string.
 */
export async function censorPII(input) {
    let ner;
    try {
        ner = await NerPipelineSingleton.getInstance();
    } catch (error) {
        console.error(
            'PII censoring failed due to NER pipeline initialization error.',
            error.message,
        );
        return input; // Graceful degradation: return original input on critical error
    }

    // 1. Get entities from NER model
    let rawEntities = [];
    try {
        rawEntities = await ner(input, {
            aggregation_strategy: 'none', // Get individual tokens
        });
    } catch (error) {
        console.warn(
            'Warning: NER model execution failed. Proceeding with regex only.',
            error.message,
        );
        // Continue without NER entities if model execution fails
    }

    let aggregatedEntities = [];
    let currentEntity = null;
    let currentInputIndex = 0; // Track current position in the input string

    for (const entity of rawEntities) {
        const entityType = entity.entity.split('-').pop(); // e.g., PER, ORG, LOC, MISC, DATE
        const entityTag = entity.entity.split('-')[0]; // e.g., B, I, O

        if (entityTag === 'B') {
            // Start of a new entity
            if (currentEntity !== null) {
                aggregatedEntities.push(currentEntity);
            }

            // Find the start index of the new entity's word in the remaining input string
            const wordToFind = entity.word.startsWith('##')
                ? entity.word.substring(2)
                : entity.word;
            const startIndex = input.indexOf(wordToFind, currentInputIndex);

            if (startIndex !== -1) {
                currentEntity = {
                    entity_group: entityType,
                    word: wordToFind,
                    start: startIndex,
                    end: startIndex + wordToFind.length,
                    score: entity.score,
                };
                currentInputIndex = startIndex + wordToFind.length;
            } else {
                // If word not found, treat as non-entity or skip
                currentEntity = null;
            }
        } else if (
            entityTag === 'I' &&
            currentEntity !== null &&
            currentEntity.entity_group === entityType
        ) {
            // Continuation of the current entity
            const wordToAppend = entity.word.startsWith('##')
                ? entity.word.substring(2)
                : ' ' + entity.word;
            const startIndex = input.indexOf(wordToAppend, currentInputIndex);

            if (startIndex !== -1) {
                currentEntity.word += wordToAppend;
                currentEntity.end = startIndex + wordToAppend.length;
                currentEntity.score = Math.min(currentEntity.score, entity.score); // Take min score for aggregated entity
                currentInputIndex = startIndex + wordToAppend.length;
            } else {
                // If continuation word not found, finalize current entity and reset
                aggregatedEntities.push(currentEntity);
                currentEntity = null;
            }
        } else {
            // Not a B- or I- tag, or a new entity type without a B-tag, or 'O' (Outside)
            if (currentEntity !== null) {
                aggregatedEntities.push(currentEntity);
            }
            currentEntity = null; // Reset
            // Advance currentInputIndex past the current word
            const wordToAdvance = entity.word.startsWith('##')
                ? entity.word.substring(2)
                : entity.word;
            const nextIndex = input.indexOf(wordToAdvance, currentInputIndex);
            if (nextIndex !== -1) {
                currentInputIndex = nextIndex + wordToAdvance.length;
            } else {
                currentInputIndex++; // Fallback if word not found
            }
        }
    }

    // Push the last entity if it exists
    if (currentEntity !== null) {
        aggregatedEntities.push(currentEntity);
    }

    // 2. Get entities from Regex patterns
    let regexEntities = [];
    for (const { type, pattern } of regexPIIPatterns) {
        let match;
        while ((match = pattern.exec(input)) !== null) {
            regexEntities.push({
                entity_group: type,
                word: match[0],
                start: match.index,
                end: match.index + match[0].length,
                score: 1.0, // Assign a high score for regex matches
            });
        }
    }

    // 3. Combine and filter all PII entities
    // Filter for NER PII types + all regex types
    const allPiiEntities = aggregatedEntities
        .filter(
            (entity) =>
                entity.entity_group === 'PER' || // Person
                entity.entity_group === 'ORG' || // Organization
                entity.entity_group === 'LOC' || // Location
                entity.entity_group === 'MISC', // Miscellaneous can sometimes catch other PII
            // DATE is excluded as the model doesn't reliably detect it
        )
        .concat(regexEntities);

    // Sort all entities by their starting index in descending order.
    // This is crucial to avoid messing up indices as we replace text.
    allPiiEntities.sort((a, b) => b.start - a.start);

    let censoredText = input;

    // Replace each detected PII entity with [CENSORED]
    for (const entity of allPiiEntities) {
        // Ensure valid start and end indices
        if (
            typeof entity.start === 'number' &&
            typeof entity.end === 'number' &&
            entity.start !== -1 &&
            entity.end !== -1 &&
            entity.start < entity.end
        ) {
            const replacement = '[CENSORED]';
            censoredText =
                censoredText.substring(0, entity.start) +
                replacement +
                censoredText.substring(entity.end);
        } else {
            console.warn(`Invalid entity indices received for entity: ${JSON.stringify(entity)}`);
        }
    }

    return censoredText;
}
