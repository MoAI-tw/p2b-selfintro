// Mock for ApiKeyContext
import React from 'react';

// Mock the useApiKey hook
const mockUseApiKey = {
  apiKey: 'test-api-key',
  geminiApiKey: 'test-gemini-api-key',
  isLoading: false,
  error: '',
  modelName: 'Test Model',
  modelId: 'test-model-id',
  maxTokens: 1500,
  modelProvider: 'openai' as const,
  setModelProvider: jest.fn(),
  availableModels: [
    {
      id: 'test-model-id',
      name: 'Test Model',
      description: 'Test model for testing',
      defaultTokens: 1500,
      costPer1kTokens: 0.002,
      currency: 'USD'
    }
  ],
  selectedModel: {
    id: 'test-model-id',
    name: 'Test Model',
    description: 'Test model for testing',
    defaultTokens: 1500,
    costPer1kTokens: 0.002,
    currency: 'USD'
  },
  setSelectedModel: jest.fn()
};

// Add a simple test to prevent file from failing as a test suite
// This is needed because Jest treats all files in __tests__ directory as test files
describe('ApiKeyContextMock', () => {
  it('should export the mock object correctly', () => {
    expect(mockUseApiKey).toBeDefined();
    expect(mockUseApiKey.apiKey).toBe('test-api-key');
    expect(mockUseApiKey.modelProvider).toBe('openai');
    expect(mockUseApiKey.setModelProvider).toBeDefined();
  });
});

// Export the mock
export default mockUseApiKey; 