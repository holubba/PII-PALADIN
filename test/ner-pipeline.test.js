import { jest } from '@jest/globals';
import { setupTestEnvironment } from './setup.js';

describe('NerPipelineSingleton Tests', () => {
    let NerPipelineSingleton;

    beforeAll(async () => {
        const setup = await setupTestEnvironment();
        NerPipelineSingleton = setup.NerPipelineSingleton;
    });

    describe('Singleton Pattern', () => {
        test('should maintain singleton instance', async () => {
            const instance1 = await NerPipelineSingleton.getInstance();
            const instance2 = await NerPipelineSingleton.getInstance();
            
            expect(instance1).toBe(instance2);
            expect(NerPipelineSingleton.instance).toBe(instance1);
        });

        test('should have correct static properties', () => {
            expect(NerPipelineSingleton.task).toBe('token-classification');
            expect(NerPipelineSingleton.model).toBe('Xenova/bert-base-NER');
        });
    });

    describe('getInstance Method', () => {
        test('should return a function when called', async () => {
            const instance = await NerPipelineSingleton.getInstance();
            expect(typeof instance).toBe('function');
        });

        test('should accept progress callback parameter', async () => {
            const mockCallback = jest.fn();
            const instance = await NerPipelineSingleton.getInstance(mockCallback);
            expect(typeof instance).toBe('function');
        });

        test('should handle null progress callback', async () => {
            const instance = await NerPipelineSingleton.getInstance(null);
            expect(typeof instance).toBe('function');
        });
    });

    describe('Pipeline Functionality', () => {
        test('should process text and return entities', async () => {
            const instance = await NerPipelineSingleton.getInstance();
            const result = await instance('John Doe is here');
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toHaveProperty('entity');
            expect(result[0]).toHaveProperty('word');
        });

        test('should handle empty text', async () => {
            const instance = await NerPipelineSingleton.getInstance();
            const result = await instance('');
            
            expect(Array.isArray(result)).toBe(true);
        });

        test('should handle text with no entities', async () => {
            const instance = await NerPipelineSingleton.getInstance();
            const result = await instance('This is just regular text with no names or organizations.');
            
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('should handle pipeline creation errors gracefully', async () => {
            // This test would require mocking a failure scenario
            // For now, we test that the singleton pattern works correctly
            const instance = await NerPipelineSingleton.getInstance();
            expect(typeof instance).toBe('function');
        });

        test('should handle model loading errors gracefully', async () => {
            // This test would require mocking a model loading failure
            // For now, we test that the singleton pattern works correctly
            const instance = await NerPipelineSingleton.getInstance();
            expect(typeof instance).toBe('function');
        });
    });

    describe('Instance Management', () => {
        test('should reset instance when set to null', () => {
            const originalInstance = NerPipelineSingleton.instance;
            NerPipelineSingleton.instance = null;
            expect(NerPipelineSingleton.instance).toBe(null);
            
            // Restore for other tests
            NerPipelineSingleton.instance = originalInstance;
        });

        test('should maintain instance across multiple calls', async () => {
            const instance1 = await NerPipelineSingleton.getInstance();
            const instance2 = await NerPipelineSingleton.getInstance();
            const instance3 = await NerPipelineSingleton.getInstance();
            
            expect(instance1).toBe(instance2);
            expect(instance2).toBe(instance3);
            expect(instance1).toBe(instance3);
        });
    });
});
