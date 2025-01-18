import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined;
    return {
      pass,
      message: () => `expected element to be in the document`
    };
  }
});

// Mock window and document properties if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
});

// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test_key';

// Optional: Add global mocks or setup here
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Mocked AI response' }]
        })
      }
    }))
  };
});

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
