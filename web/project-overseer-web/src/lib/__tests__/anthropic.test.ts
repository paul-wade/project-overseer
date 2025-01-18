import { chatWithAgent, ChatInputSchema, AgentType } from '../anthropic';

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

describe('chatWithAgent', () => {
  const mockInput = ChatInputSchema.parse({
    message: 'Test message',
    agent: 'conceptualizer'
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call chatWithAgent with correct input', async () => {
    const result = await chatWithAgent(mockInput);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Mocked AI response');
    expect(result.agent).toBe('conceptualizer');
  });

  it('should handle different agent types', async () => {
    const agents: AgentType[] = [
      'conceptualizer', 
      'architect', 
      'implementer', 
      'tester', 
      'deployer', 
      'monitor'
    ];

    for (const agent of agents) {
      const result = await chatWithAgent(
        ChatInputSchema.parse({
          message: `Test message for ${agent}`,
          agent
        })
      );

      expect(result.success).toBe(true);
      expect(result.agent).toBe(agent);
    }
  });
});
