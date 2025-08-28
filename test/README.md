# Test Structure

This directory contains modular test files for the PII-PALADIN library. The tests have been broken down into smaller, more focused files for better maintainability and organization.

## Test Files

### Core Test Files

- **`index.test.js`** - Test runner that imports all modular test files
- **`setup.js`** - Shared test setup and initialization logic
- **`__mocks__/transformers.mock.js`** - Shared mock configuration for the transformers module

### Feature-Specific Test Files

- **`ner.test.js`** - Tests for Named Entity Recognition (NER) functionality
  - Person (PER) detection
  - Organization (ORG) detection  
  - Location (LOC) detection
  - Mixed NER entities

- **`regex-pii.test.js`** - Tests for regex-based PII detection
  - Social Security Numbers (SSN)
  - Email addresses
  - Phone numbers
  - IP addresses
  - Vehicle Identification Numbers (VIN)
  - Credit card numbers and expiration dates
  - ID numbers (passport, medical record, policy)

- **`edge-cases.test.js`** - Tests for edge cases and integration scenarios
  - Empty and whitespace inputs
  - Non-PII text handling
  - Overlapping PII detection
  - Boundary conditions
  - Complex integration scenarios
  - Error handling
  - Performance edge cases

- **`ner-pipeline.test.js`** - Tests for the NerPipelineSingleton class
  - Singleton pattern verification
  - Instance management
  - Pipeline functionality
  - Error handling

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
# Run only NER tests
npm test -- ner.test.js

# Run only regex PII tests
npm test -- regex-pii.test.js

# Run only edge cases
npm test -- edge-cases.test.js

# Run only pipeline tests
npm test -- ner-pipeline.test.js
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Test Organization Benefits

1. **Modularity**: Each test file focuses on a specific aspect of functionality
2. **Maintainability**: Easier to find and update tests for specific features
3. **Readability**: Clear separation of concerns makes tests easier to understand
4. **Parallel Execution**: Tests can potentially run in parallel for better performance
5. **Focused Debugging**: Easier to isolate issues to specific functionality areas

## Adding New Tests

When adding new tests:

1. **Choose the appropriate file** based on the functionality being tested
2. **Follow the existing structure** with describe blocks for logical grouping
3. **Use the shared setup** from `setup.js` for consistent test initialization
4. **Add descriptive test names** that clearly indicate what is being tested
5. **Update this README** if adding new test files or categories

## Mock Configuration

The mock configuration in `__mocks__/transformers.mock.js` provides consistent test data across all test files. When updating mocks:

1. **Update the mock file** with new test scenarios
2. **Ensure all test files** continue to pass
3. **Document any changes** to mock behavior

## Test Data

Test data is designed to be realistic while being clearly identifiable as test data. The mocks include:
- Common names (John Doe, Jane Smith, etc.)
- Organization names (Acme Corp, Blue Cross Blue Shield, etc.)
- Location names (New York, Anytown, etc.)
- Various PII patterns (SSN, email, phone, etc.)
