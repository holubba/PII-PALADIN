# PII-PALADIN

⚠️ **IMPORTANT: This is a NODE.JS ONLY package!** ⚠️

**This package will NOT work in your React, Next.js, Vue, or any other frontend framework!** 

This package uses a **NER (Named Entity Recognition) language model** that requires Node.js server-side execution. It will **NOT** work in browsers, client-side JavaScript, or frontend frameworks.

## 🚫 What This Package WON'T Work In:

- ❌ **React** (client-side)
- ❌ **Next.js** (client-side components)
- ❌ **Vue.js** (client-side)
- ❌ **Angular** (client-side)
- ❌ **Browser JavaScript**
- ❌ **Frontend frameworks**
- ❌ **Client-side applications**

## ✅ What This Package WILL Work In:

- ✅ **Node.js servers**
- ✅ **Express.js applications**
- ✅ **Next.js API routes** (server-side only)
- ✅ **Backend services**
- ✅ **Command-line tools**
- ✅ **Server-side applications**

---

## 📋 What It Does

PII-PALADIN is a **Node.js package** designed to detect and censor Personally Identifiable Information (PII) from a string. It uses a hybrid approach combining a pre-trained Named Entity Recognition (NER) model with regular expressions for comprehensive and accurate PII detection.

## 🎯 Features

- **Hybrid PII Detection**: Combines the contextual understanding of an NER model for names, organizations, and locations with the precision of regex for structured PII like SSN, credit cards, emails, and phone numbers.
- **Offline Inference**: All model and regex processing is performed locally, ensuring no internet access is required at runtime.
- **Comprehensive Coverage**: Aims for high accuracy across a wide range of PII types.
- **Censoring Style**: Replaces detected PII with `[CENSORED]`.
- **Server-Side Only**: Designed specifically for Node.js environments.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 14 or higher)
- **npm** or **yarn**
- **Server environment** (not browser)

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

### Example Input/Output

**Input:**
```
Contact John Doe at john.doe@example.com or (123) 456-7890. He lives at 123 Main St, Anytown, and his SSN is 987-65-4321.
```

**Output:**
```
Contact [CENSORED] at [CENSORED] or [CENSORED]. He lives at [CENSORED], [CENSORED], and his SSN is [CENSORED].
```

---

## 🔧 API Reference

### `censorPII(input: string): Promise<string>`

Censors detected Personally Identifiable Information (PII) in the input string.

- **`input`**: The string to be censored.
- **Returns**: A `Promise` that resolves to the censored string.

---

## ⚠️ Limitations

While this package aims for high accuracy, it's important to understand its current limitations:

- **Server-Side Only**: This package **cannot** run in browsers or frontend frameworks.
- **Model-Specific PII Types**: The underlying `Xenova/bert-base-NER` model is primarily trained to detect Person (PER), Organization (ORG), Location (LOC), and Miscellaneous (MISC) entities. It does **not** reliably detect general dates, or other descriptive PII that doesn't fit a specific regex pattern.
- **Regex Specificity**: Regex patterns are precise but can be brittle. Variations in formatting (e.g., unusual phone number formats, driver's license numbers from different states/countries) might not be detected.
- **Biometric and Medical Data**: Detection of biometric data (e.g., fingerprints, retinal scans) and highly unstructured medical record information is beyond the scope of this package's current implementation.
- **Contextual Ambiguity**: While the NER model provides some context, it might not always correctly identify PII if the context is highly ambiguous or requires deep semantic understanding.

For PII types not covered by this package, or for higher accuracy in specific domains, a more specialized NER model or a dedicated PII detection library might be necessary.

---

## 🤔 "But I want to use this in my React/Next.js app!"

If you need PII censoring in a frontend application, you have a few options:

1. **Use this package in your backend API** and call it from your frontend
2. **Use a different, browser-compatible PII detection library**
3. **Implement a simple regex-based solution for basic PII detection**

**Remember**: This package uses a large language model (~90MB) and requires Node.js APIs that don't exist in browsers.

---

## 📚 Contributing

This project is open source and contributions are welcome. If you want to contribute, please check out the [GitHub repository](https://github.com/jeeem/PII-PALADIN).

---

## 📄 License

ISC License