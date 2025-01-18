import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPage from '@/app/chat/page';
import { chatWithAgent } from '@/lib/anthropic';

// Mock complex AI interactions
jest.mock('@/lib/anthropic', () => ({
  chatWithAgent: jest.fn()
}));

describe('Comprehensive Chat Workflow Integration', () => {
  // Simulated multi-stage project development scenario
  const projectDevelopmentScenario = [
    {
      agent: 'conceptualizer',
      message: 'Create an autonomous AI development system',
      expectedResponse: 'A comprehensive system for AI-driven software development'
    },
    {
      agent: 'architect',
      message: 'Design a scalable microservices architecture',
      expectedResponse: 'Microservices architecture with modular components'
    },
    {
      agent: 'implementer',
      message: 'Generate initial code structure for the proposed architecture',
      expectedResponse: 'Initial code structure with best practices'
    }
  ];

  beforeEach(() => {
    // Reset mock implementation before each test
    (chatWithAgent as jest.Mock).mockClear();
  });

  it('should simulate a complete project development workflow', async () => {
    // Setup mock responses for each stage
    (chatWithAgent as jest.Mock)
      .mockImplementationOnce(() => ({
        success: true,
        message: projectDevelopmentScenario[0].expectedResponse,
        agent: 'conceptualizer'
      }))
      .mockImplementationOnce(() => ({
        success: true,
        message: projectDevelopmentScenario[1].expectedResponse,
        agent: 'architect'
      }))
      .mockImplementationOnce(() => ({
        success: true,
        message: projectDevelopmentScenario[2].expectedResponse,
        agent: 'implementer'
      }));

    // Render chat page
    render(<ChatPage />);

    // Perform workflow simulation
    for (const scenario of projectDevelopmentScenario) {
      // Switch to specific agent
      const agentButton = screen.getByText(
        new RegExp(scenario.agent, 'i')
      );
      fireEvent.click(agentButton);

      // Find input and send button
      const input = screen.getByPlaceholderText(
        new RegExp(`Message ${scenario.agent} agent`, 'i')
      );
      const sendButton = screen.getByText('Send');

      // Type message and send
      await userEvent.type(input, scenario.message);
      await userEvent.click(sendButton);

      // Wait for and verify AI response
      await waitFor(() => {
        expect(chatWithAgent).toHaveBeenCalledWith({
          message: scenario.message,
          agent: scenario.agent
        });

        // Check if response is displayed
        expect(
          screen.getByText(scenario.expectedResponse)
        ).toBeInTheDocument();
      });
    }

    // Verify total number of interactions
    expect(chatWithAgent).toHaveBeenCalledTimes(
      projectDevelopmentScenario.length
    );
  }, 30000);  // Increased timeout for multiple interactions

  it('should handle error scenarios gracefully', async () => {
    // Simulate an error scenario
    (chatWithAgent as jest.Mock).mockRejectedValueOnce(
      new Error('API communication error')
    );

    render(<ChatPage />);

    // Attempt to send a message
    const input = screen.getByPlaceholderText(/Message conceptualizer agent/i);
    const sendButton = screen.getByText('Send');

    await userEvent.type(input, 'Test error handling');
    await userEvent.click(sendButton);

    // Check for error handling
    await waitFor(() => {
      expect(
        screen.getByText(/error occurred/i)
      ).toBeInTheDocument();
    });
  });

  it('should maintain UI state during multiple interactions', async () => {
    // Mock consistent responses
    (chatWithAgent as jest.Mock).mockImplementation(() => ({
      success: true,
      message: 'Simulated response',
      agent: 'conceptualizer'
    }));

    render(<ChatPage />);

    // Perform multiple interactions
    for (let i = 0; i < 3; i++) {
      const input = screen.getByPlaceholderText(/Message conceptualizer agent/i);
      const sendButton = screen.getByText('Send');

      await userEvent.type(input, `Test message ${i}`);
      await userEvent.click(sendButton);

      // Wait for response
      await waitFor(() => {
        expect(screen.getByText(`Test message ${i}`)).toBeInTheDocument();
      });
    }

    // Verify message history and interaction count
    expect(screen.getAllByText('Simulated response')).toHaveLength(3);
    expect(chatWithAgent).toHaveBeenCalledTimes(3);
  });
});
