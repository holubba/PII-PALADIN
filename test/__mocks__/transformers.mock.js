import { jest } from '@jest/globals';

export const createMockTransformers = () => ({
    env: {
        localModelPath: '',
        allowRemoteModels: false,
        backends: {
            onnx: {
                wasm: {
                    wasmPaths: '',
                },
            },
        },
    },
    pipeline: jest.fn((_task, _model, _options) => {
        const mockPipelineFunction = jest.fn(async (text, _callOptions) => {
            if (text.includes('John Doe')) {
                return [
                    { entity: 'B-PER', word: 'John', start: null, end: null },
                    { entity: 'I-PER', word: '##Doe', start: null, end: null },
                ];
            } else if (text.includes('Jane Smith')) {
                return [
                    { entity: 'B-PER', word: 'Jane', start: null, end: null },
                    { entity: 'I-PER', word: 'Smith', start: null, end: null },
                ];
            } else if (text.includes('Acme Corp')) {
                return [
                    { entity: 'B-ORG', word: 'Acme', start: null, end: null },
                    { entity: 'I-ORG', word: 'Corp', start: null, end: null },
                ];
            } else if (text.includes('Acme Inc.')) {
                return [
                    { entity: 'B-ORG', word: 'Acme', start: null, end: null },
                    { entity: 'I-ORG', word: 'Inc', start: null, end: null },
                    { entity: 'I-ORG', word: '.', start: null, end: null },
                ];
            } else if (text.includes('New York')) {
                return [
                    { entity: 'B-LOC', word: 'New', start: null, end: null },
                    { entity: 'I-LOC', word: 'York', start: null, end: null },
                ];
            } else if (text.includes('Alice Wonderland')) {
                return [
                    { entity: 'B-PER', word: 'Alice', start: null, end: null },
                    { entity: 'I-PER', word: 'Wonderland', start: null, end: null },
                ];
            } else if (text.includes('Bob The Builder')) {
                return [
                    { entity: 'B-PER', word: 'Bob', start: null, end: null },
                    { entity: 'I-PER', word: 'The', start: null, end: null },
                    { entity: 'I-PER', word: 'Builder', start: null, end: null },
                ];
            } else if (text.includes('Blue Cross Blue Shield')) {
                return [
                    { entity: 'B-ORG', word: 'Blue', start: null, end: null },
                    { entity: 'I-ORG', word: 'Cross', start: null, end: null },
                    { entity: 'I-ORG', word: 'Blue', start: null, end: null },
                    { entity: 'I-ORG', word: 'Shield', start: null, end: null },
                ];
            } else if (text.includes('Oak Ave')) {
                return [
                    { entity: 'B-LOC', word: 'Oak', start: null, end: null },
                    { entity: 'I-LOC', word: 'Ave', start: null, end: null },
                ];
            } else if (text.includes('Anytown')) {
                return [
                    { entity: 'B-LOC', word: 'Any', start: null, end: null },
                    { entity: 'I-LOC', word: '##town', start: null, end: null },
                ];
            } else if (text.includes('NY')) {
                return [
                    { entity: 'B-LOC', word: 'NY', start: null, end: null },
                ];
            } else if (text.includes('SSN')) {
                return [
                    { entity: 'B-ORG', word: 'SS', start: null, end: null },
                    { entity: 'I-ORG', word: '##N', start: null, end: null },
                ];
            } else if (text.includes('Phone')) {
                return [
                    { entity: 'B-MISC', word: 'Phone', start: null, end: null },
                ];
            } else if (text.includes('VIN') && text.includes('ABCDEFG')) {
                return [
                    { entity: 'B-ORG', word: 'ABC', start: null, end: null },
                    { entity: 'I-ORG', word: '##DE', start: null, end: null },
                ];
            }
            return [];
        });
        return mockPipelineFunction;
    }),
    NerPipelineSingleton: {
        task: 'token-classification',
        model: 'Xenova/bert-base-NER',
        instance: null,
        getInstance: jest.fn(async (_progress_callback = null) => {
            if (this.instance === null) {
                this.instance = createMockTransformers().pipeline(this.task, this.model, { _progress_callback });
            }
            return this.instance;
        }),
    },
});
