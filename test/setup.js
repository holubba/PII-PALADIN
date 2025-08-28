import { jest } from '@jest/globals';
import { createMockTransformers } from './__mocks__/transformers.mock.js';

let censorPII;
let NerPipelineSingleton;

export async function setupTestEnvironment() {
    // Mock @xenova/transformers before importing the module under test
    const mockTransformers = await jest.unstable_mockModule('@xenova/transformers', () => createMockTransformers());

    // Import the module under test AFTER its dependencies are mocked
    const module = await import('../index.js');
    censorPII = module.censorPII;
    NerPipelineSingleton = module.NerPipelineSingleton;

    // Initialize the mocked singleton
    await NerPipelineSingleton.getInstance();

    return { censorPII, NerPipelineSingleton };
}
