import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPage from '../page';
import { chatWithAgent } from '@/lib/anthropic';

// Mock the chatWithAgent function
jest.mock('@/lib/anthropic', () => ({
  chatWithAgent: jest.fn().mockResolvedValue({
    success: true,
    message: 'Mocked AI response',
    agent: 'conceptualizer'
  })
}));

describe('ChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat interface with all agent buttons', () => {
    render(<ChatPage />);

    const agentButtons = [
      'Conceptualizer', 'Architect', 'Implementer', 
      'Tester', 'Deployer', 'Monitor'
    ];

    agentButtons.forEach(agent => {
      expect(screen.getByText(agent)).toBeInTheDocument();
    });
  });

  it('allows switching between agents', () => {
    render(<ChatPage />);

    const architectButton = screen.getByText('Architect');
    fireEvent.click(architectButton);

    // Verify input placeholder changes
    const input = screen.getByPlaceholderText(/Message architect agent/i);
    expect(input).toBeInTheDocument();
  });

  it('sends a message and displays conversation', async () => {
    render(<ChatPage />);

    // Find input and send button
    const input = screen.getByPlaceholderText(/Message conceptualizer agent/i);
    const sendButton = screen.getByText('Send');

    // Type message and send
    await userEvent.type(input, 'Test project concept');
    await userEvent.click(sendButton);

    // Wait for AI response
    await waitFor(() => {
      expect(chatWithAgent).toHaveBeenCalledWith({
        message: 'Test project concept',
        agent: 'conceptualizer'
      });
    });

    // Check if user and AI messages are displayed
    expect(screen.getByText('Test project concept')).toBeInTheDocument();
    expect(screen.getByText('Mocked AI response')).toBeInTheDocument();
  });

  it('disables send button during loading', async () => {
    // Mock a slow response
    (chatWithAgent as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: 'Delayed response',
        agent: 'conceptualizer'
      }), 1000))
    );

    render(<ChatPage />);

    const input = screen.getByPlaceholderText(/Message conceptualizer agent/i);
    const sendButton = screen.getByText('Send');

    await userEvent.type(input, 'Slow message');
    await userEvent.click(sendButton);

    // Check if send button is disabled
    expect(sendButton).toBeDisabled();

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('Delayed response')).toBeInTheDocument();
    });
  });
});
