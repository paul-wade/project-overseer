'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { chatWithAgent, ChatInputSchema, AgentType } from '@/lib/anthropic';

// Define agent types more strictly
const AGENTS: Record<AgentType, string> = {
  conceptualizer: 'Conceptualizer',
  architect: 'Architect',
  implementer: 'Implementer',
  tester: 'Tester',
  deployer: 'Deployer',
  monitor: 'Monitor'
};

type Message = {
  text: string;
  sender: 'user' | 'agent';
  agent?: AgentType;
};

const AGENT_COLORS: Record<AgentType, string> = {
  conceptualizer: 'bg-blue-100',
  architect: 'bg-green-100',
  implementer: 'bg-purple-100',
  tester: 'bg-red-100',
  deployer: 'bg-yellow-100',
  monitor: 'bg-gray-100'
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('conceptualizer');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: {
      message: '',
      agent: selectedAgent
    }
  });

  const onSubmit = async (data: { message: string; agent: AgentType }) => {
    setIsLoading(true);
    const userMessage: Message = { 
      text: data.message, 
      sender: 'user' 
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatWithAgent(data);
      const agentMessage: Message = { 
        text: response.message, 
        sender: 'agent', 
        agent: response.agent 
      };
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-xl rounded-lg">
        {/* Agent Selector */}
        <div className="p-4 bg-gray-50 flex space-x-2 overflow-x-auto">
          {(Object.keys(AGENTS) as AgentType[]).map((agent) => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                selectedAgent === agent 
                  ? `${AGENT_COLORS[agent]} text-gray-900` 
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              )}
            >
              {AGENTS[agent]}
            </button>
          ))}
        </div>

        {/* Messages Area */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="p-4 bg-gray-50 flex items-center"
        >
          <input
            {...register('message')}
            placeholder={`Message ${AGENTS[selectedAgent]} agent...`}
            className="flex-grow p-2 border rounded-l-lg"
            disabled={isLoading}
          />
          <input 
            type="hidden" 
            {...register('agent')} 
            value={selectedAgent} 
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
