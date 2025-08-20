# PII-PALADIN

PII-PALADIN is a Node.js package designed to detect and censor Personally Identifiable Information (PII) from a string. It uses a hybrid approach combining Named Entity Recognition (NER) with Regular Expressions (Regex) for comprehensive and accurate PII detection.

## Features

-   **Hybrid PII Detection**: Combines the contextual understanding of an NER model for names, organizations, and locations with the precision of regex for structured PII like SSN, credit cards, emails, and phone numbers.
-   **Offline Inference**: All model and regex processing is performed locally, ensuring no internet access is required at runtime.
-   **Comprehensive Coverage**: Aims for high accuracy across a wide range of PII types.
-   **Censoring Style**: Replaces detected PII with `[CENSORED]`.

---

## Setup and Installation

This package requires a one-time setup to download the offline NER model and WASM files. Please follow these steps in order.

### Step 1: Install Dependencies

First, install the necessary npm packages. This command reads your `package.json` and downloads the required libraries, including `@xenova/transformers` and its dependency `onnxruntime-web`.

```bash
npm install
```

### Step 2: Create Asset Directories

Create the necessary directories for your offline assets. The model files need to be placed in a specific nested structure.

```bash
mkdir -p models/Xenova/bert-base-NER wasm
```

### Step 3: Download the NER Model

We will use the `Xenova/bert-base-NER` model. Download its configuration files and the quantized ONNX model file.

**Instructions:**

1.  Go to the main model repository page: [https://huggingface.co/Xenova/bert-base-NER/tree/main](https://huggingface.co/Xenova/bert-base-NER/tree/main)
2.  Download the following configuration and tokenizer files from the root directory and place them in the `models/Xenova/bert-base-NER/` folder:
    -   `config.json`
    -   `tokenizer.json`
    -   `tokenizer_config.json`
    -   `special_tokens_map.json`
3.  Next, click on the `onnx` directory.
4.  From inside the `onnx` directory, download the quantized model file and place it in the `models/Xenova/bert-base-NER/onnx/` folder:
    -   `model_quantized.onnx`

Your `models/` directory structure should now look like this:

```
models/
└── Xenova/
    └── bert-base-NER/
        ├── config.json
        ├── special_tokens_map.json
        ├── tokenizer.json
        ├── tokenizer_config.json
        └── onnx/
            └── model_quantized.onnx
```

### Step 4: Copy the WASM Binaries

Now that you have run `npm install`, the `onnxruntime-web` package is in your `node_modules` directory. Run the following command to copy the necessary WASM binaries into your local `wasm/` directory.

```bash
cp node_modules/onnxruntime-web/dist/*.wasm wasm/
```

After running the command, verify that your `wasm/` directory contains files like `ort-wasm.wasm`, `ort-wasm-threaded.wasm`, and `ort-wasm-simd.wasm`.

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