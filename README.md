# PII-PALADIN

PII-PALADIN is a Node.js package designed to detect and censor Personally Identifiable Information (PII) from a string. It uses a hybrid approach combining a pre-trained Named Entity Recognition (NER) model with regular expressions for comprehensive and accurate PII detection.

## Features

-	**Hybrid PII Detection**: Combines the contextual understanding of an NER model for names, organizations, and locations with the precision of regex for structured PII like SSN, credit cards, emails, and phone numbers.
-	**Offline Inference**: All model and regex processing is performed locally, ensuring no internet access is required at runtime.
-	**Comprehensive Coverage**: Aims for high accuracy across a wide range of PII types.
-	**Censoring Style**: Replaces detected PII with `[CENSORED]`.

---

## Getting Started

### Installation

Install the package using npm:

```bash
npm install pii-paladin
```

### Usage

This package is an ES module, so you should use `import` syntax in your project. Make sure your project's `package.json` has `"type": "module"`.

Here's a simple example:

```javascript
import { censorPII } from 'pii-paladin';

async function main() {
  const text = "Contact John Doe at john.doe@example.com or (123) 456-7890. He lives at 123 Main St, Anytown, and his SSN is 987-65-4321.";

  console.log("Original Text:");
  console.log(text);

  try {
    const censoredText = await censorPII(text);
    console.log("\nCensored Text:");
    console.log(censoredText);
  } catch (error) {
    console.error("\nAn error occurred during censoring:", error);
  }
}

main();
```

---

## API Reference

### `censorPII(input: string): Promise<string>`

Censors detected Personally Identifiable Information (PII) in the input string.

*	`input`: The string to be censored.
*	**Returns**: A `Promise` that resolves to the censored string.

---

## Limitations

While this package aims for high accuracy, it's important to understand its current limitations:

*	**Model-Specific PII Types**: The underlying `Xenova/bert-base-NER` model is primarily trained to detect Person (PER), Organization (ORG), Location (LOC), and Miscellaneous (MISC) entities. It does **not** reliably detect general dates, or other descriptive PII that doesn't fit a specific regex pattern.
*	**Regex Specificity**: Regex patterns are precise but can be brittle. Variations in formatting (e.g., unusual phone number formats, driver's license numbers from different states/countries) might not be detected.
*	**Biometric and Medical Data**: Detection of biometric data (e.g., fingerprints, retinal scans) and highly unstructured medical record information is beyond the scope of this package's current implementation.
*	**Contextual Ambiguity**: While the NER model provides some context, it might not always correctly identify PII if the context is highly ambiguous or requires deep semantic understanding.

For PII types not covered by this package, or for higher accuracy in specific domains, a more specialized NER model or a dedicated PII detection library might be necessary.

---

## Contributing

This project is open source and contributions are welcome. If you want to contribute, please check out the [GitHub repository](https://github.com/jeeem/PII-PALADIN).