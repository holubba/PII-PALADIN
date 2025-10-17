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
- **Censoring and Masking Style**: Detected PII can be replaced with [CENSORED] or masked using a custom maskChar and optional maskLength. When both are provided, the user can control mask length (1–7) or preserve the original string length.
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
### Example Options/Input/Output

**Options:**
```ts
{ maskChar: "*", maskLength: 5 }
```

**Input:**
```
Bob's phone number is 555-123-4567.
```

**Output:**
```
Bob's phone number is *****.
```

---

## 🔧 API Reference

```ts
censorPII(input: string, options?: { maskChar?: string; maskLength?: number }): Promise<string>
```

Censors detected Personally Identifiable Information (PII) in the input string.

- **`input`**: The string to be censored.  
- **`options`** *(optional)*:  
  - `maskChar`: Character used to mask PII. If not provided or invalid, defaults to `[CENSORED]`.  
  - `maskLength`: Number of characters to use for masking (1–7). Only works if `maskChar` is valid. If omitted but `maskChar` is provided, the masked length matches the original PII length.  
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
2. **Use [PII-PALADIN LITE](https://www.npmjs.com/package/pii-paladin-lite) - our companion package for browser environments**
3. **Use [PII-PALADIN INTERNATIONAL](https://www.npmjs.com/package/pii-paladin-international) - our enterprise-grade global compliance package**
4. **Implement a simple regex-based solution for basic PII detection**

**Remember**: This package uses a large language model (~90MB) and requires Node.js APIs that don't exist in browsers.

---

## 🌍 **The PII PALADIN Ecosystem**

We've created a comprehensive suite of PII detection packages to meet different needs:

### 🚀 **PII-PALADIN LITE** - Browser & Fast Development
**[npm package](https://www.npmjs.com/package/pii-paladin-lite)**

**Perfect for:**
- Frontend applications (React, Next.js, Vue, Angular)
- Browser extensions
- Quick development and prototyping
- When you need "good enough" accuracy with maximum speed

**Features:**
- ✅ **Browser Compatible** - Works everywhere
- ✅ **Lightning Fast** - Pure regex-based, no ML models
- ✅ **Tiny Bundle** - Only ~5KB
- ✅ **Zero Configuration** - Just 2 lines of code to get started

### 🌍 **PII-PALADIN INTERNATIONAL** - Global Compliance
**[npm package](https://www.npmjs.com/package/pii-paladin-international)**

**Perfect for:**
- Global PII detection across 60+ countries
- Enterprise compliance (GDPR, CCPA, LGPD, etc.)
- Multi-language support with cultural context awareness
- Professional-grade security and accuracy

**Features:**
- 🌍 **60+ Countries Supported** - Native language recognition
- 🏛️ **Enterprise Compliance** - GDPR, CCPA, LGPD ready
- 🌐 **Multi-language Support** - Cultural context awareness
- ⚡ **Real-time Processing** - Aparavi DTC GPU infrastructure
- 🔒 **Professional Security** - Enterprise-grade accuracy
- 📦 **Tiny Bundle** - Only ~5KB

**⚠️ Requires API Key:** Get your free Aparavi DTC API key at [https://bit.ly/pii-paladin-dtc](https://bit.ly/pii-paladin-dtc)

### 📊 **Complete Package Comparison**

| Feature | **PII-PALADIN** (This Package) | **PII-PALADIN LITE** | **PII-PALADIN INTERNATIONAL** |
|---------|----------------------------------|----------------------|--------------------------------|
| **Environment** | Node.js only | Browser + Node.js | Browser + Node.js |
| **Bundle Size** | ~90MB (ML models) | ~5KB (regex only) | ~5KB (API client) |
| **Speed** | Slower (ML inference) | Lightning fast | Fast (API calls) |
| **Accuracy** | Highest (ML + regex) | Good (regex only) | **Enterprise-grade (Aparavi DTC)** |
| **Setup** | Complex (model files) | Zero configuration | API key required |
| **Use Case** | Production/accuracy | Development/speed | **Global compliance** |
| **Countries** | US-focused | US-focused | **60+ countries** |
| **Languages** | English | English | **15+ languages** |
| **Compliance** | Basic | Basic | **GDPR, CCPA, LGPD** |

**Choose PII-PALADIN when you need:**
- Maximum accuracy for production
- Advanced ML-based detection
- Can handle 90MB bundle size
- Server-side processing

**Choose PII-PALADIN LITE when you need:**
- Browser compatibility
- Lightning-fast performance
- Tiny bundle size
- Quick development setup

**Choose PII-PALADIN INTERNATIONAL when you need:**
- 🌍 Global PII detection across 60+ countries
- 🏛️ Enterprise compliance standards
- 🌐 Multi-language support
- ⚡ Real-time GPU processing
- 🔒 Professional-grade security

---

## 📚 Contributing

This project is open source and contributions are welcome. If you want to contribute, please check out the [GitHub repository](https://github.com/jeeem/PII-PALADIN).

---

## 📄 License

ISC License
