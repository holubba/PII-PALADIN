# PII-PALADIN

PII-PALADIN is a Node.js package designed to detect and censor Personally Identifiable Information (PII) from a string. It uses a hybrid approach combining Named Entity Recognition (NER) with Regular Expressions (Regex) for comprehensive and accurate PII detection.

## Features

-   **Hybrid PII Detection**: Combines the contextual understanding of an NER model for names, organizations, and locations with the precision of regex for structured PII like SSN, credit cards, emails, and phone numbers.
-   **Offline Inference**: All model and regex processing is performed locally, ensuring no internet access is required at runtime.
-   **Comprehensive Coverage**: Aims for high accuracy across a wide range of PII types.
-   **Censoring Style**: Replaces detected PII with `[CENSORED]`.

---

## Setup and Installation

This package includes the necessary model and WASM files directly within the repository, tracked by Git Large File Storage (LFS). Ensure you have Git LFS installed on your system before cloning.

### Step 1: Clone the Repository

First, clone the repository to your local machine. Git LFS will automatically download the large model files during cloning.

```bash
git clone git@github.com:jeeem/PII-PALADIN.git
cd PII-PALADIN
```

### Step 2: Install Node.js Dependencies

Once the repository is cloned and Git LFS has downloaded the large files, install the Node.js package dependencies:

```bash
npm install
```

---

## Usage

The package exports a single async function: `censorPII(input)`.

```javascript
import { censorPII } from './index.js';

const text = "John Doe, CEO of Acme Inc., lives in New York and can be reached at 123-456-7890. His SSN is 123-45-6789. His email is john.doe@example.com.";

censorPII(text).then(censoredText => {
  console.log("Original:", text);
  console.log("Censored:", censoredText);
});
```

## Demonstration

To run the included example with various test cases, execute the following command:

```bash
npm start
```

**Expected Output (illustrative, actual output may vary slightly based on NER model's specific detections):**

```
Original: John Doe, CEO of Acme Inc., lives in New York and can be reached at 123-456-7890. His SSN is 123-45-6789. His email is john.doe@example.com.
Censored: [CENSORED], CEO of [CENSORED], lives in [CENSORED] and can be reached at [CENSORED]. His SSN is [CENSORED]. His email is [CENSORED].
```

---

## API Reference

### `censorPII(input: string): Promise<string>`

Censors detected Personally Identifiable Information (PII) in the input string.

*   `input`: The string to be censored.
*   **Returns**: A Promise that resolves to the censored string.

---

## Limitations

While this package aims for high accuracy, it's important to understand its current limitations:

*   **Model-Specific PII Types**: The underlying `Xenova/bert-base-NER` model is primarily trained to detect Person (PER), Organization (ORG), Location (LOC), and Miscellaneous (MISC) entities. It does **not** reliably detect general dates, or other descriptive PII that doesn't fit a specific regex pattern.
*   **Regex Specificity**: Regex patterns are precise but can be brittle. Variations in formatting (e.g., unusual phone number formats, driver's license numbers from different states/countries) might not be detected.
*   **Biometric and Medical Data**: Detection of biometric data (e.g., fingerprints, retinal scans) and highly unstructured medical record information is beyond the scope of this package's current implementation.
*   **Contextual Ambiguity**: While the NER model provides some context, it might not always correctly identify PII if the context is highly ambiguous or requires deep semantic understanding.

For PII types not covered by this package, or for higher accuracy in specific domains, a more specialized NER model or a dedicated PII detection library might be necessary.
