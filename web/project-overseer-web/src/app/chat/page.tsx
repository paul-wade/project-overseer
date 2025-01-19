'use client';

import React, { useState, useEffect, useRef, createContext } from 'react';
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
  id: string;
  text: string;
  sender: 'user' | 'agent';
  agent?: AgentType;
  timestamp: number;
};

const AGENT_COLORS: Record<AgentType, string> = {
  conceptualizer: 'bg-blue-100',
  architect: 'bg-green-100',
  implementer: 'bg-purple-100',
  tester: 'bg-red-100',
  deployer: 'bg-yellow-100',
  monitor: 'bg-gray-100'
};

// Audio context for potential future audio implementation
const AudioContext = createContext<{
  isAudioEnabled: boolean;
  toggleAudio: () => void;
}>({
  isAudioEnabled: false,
  toggleAudio: () => {}
});

export default function ChatPage() {
  const [isClient, setIsClient] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('conceptualizer');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [activeSpeechBubble, setActiveSpeechBubble] = useState<AgentType | null>(null);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // Future: Implement actual audio toggle logic
  };

  const toggleSpeechBubble = (agent: AgentType) => {
    setActiveSpeechBubble(activeSpeechBubble === agent ? null : agent);
  };

  const { register, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: {
      message: '',
      agent: selectedAgent
    }
  });

  // Update hidden agent input when selectedAgent changes
  useEffect(() => {
    setValue('agent', selectedAgent);
  }, [selectedAgent, setValue]);

  const onSubmit = async (data: { message: string; agent: AgentType }) => {
    if (!isClient) return;

    setIsLoading(true);
    const userMessage: Message = { 
      id: `user-${Date.now()}`,
      text: data.message, 
      sender: 'user',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatWithAgent(data);
      const agentMessage: Message = { 
        id: `agent-${Date.now()}`,
        text: response.message, 
        sender: 'agent', 
        agent: response.agent,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  // Prevent hydration mismatch by checking client-side rendering
  if (!isClient) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar with Group Chat */}
      <div className="w-96 bg-white border-r shadow-lg flex flex-col">
        <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">Group Chat</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleAudio}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isAudioEnabled 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-200 text-gray-600"
              )}
            >
              {isAudioEnabled ? '🔊' : '🔇'}
            </button>
            <div className="flex -space-x-2">
              {(Object.keys(AGENTS) as AgentType[]).map((agent, index) => (
                <div 
                  key={agent} 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium border-2 border-white shadow-md"
                  style={{zIndex: 6 - index}}
                >
                  {agent[0].toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {[
            { sender: 'Conceptualizer', message: 'Initial project requirements look promising.' },
            { sender: 'Architect', message: 'I\'ve drafted the system architecture.' },
            { sender: 'Implementer', message: 'Starting code generation based on the design.' }
          ].map((msg, index) => {
            const agent = msg.sender.toLowerCase() as AgentType;
            return (
              <div key={index} className="relative">
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm text-white font-medium shadow-md cursor-pointer"
                    onClick={() => toggleSpeechBubble(agent)}
                  >
                    {msg.sender[0]}
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-gray-800 mb-1">{msg.sender}</p>
                    <p className="text-sm text-gray-600">{msg.message}</p>
                  </div>
                </div>
                {activeSpeechBubble === agent && (
                  <div className="absolute top-0 left-full ml-2 z-10">
                    <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t bg-white">
          <input
            type="text"
            placeholder="Type your group message..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-gray-50">
        {/* Centered Overseer with Circular Agents */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Central Overseer Circle */}
          <div className="relative">
            <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-xl border-4 border-white/20 transform hover:scale-105 transition-transform">
              <span className="text-5xl">OS</span>
            </div>
            
            {/* Surrounding Agent Circles */}
            {(Object.keys(AGENTS) as AgentType[]).map((agent, index) => {
              const angle = (index * (360 / Object.keys(AGENTS).length)) * (Math.PI / 180);
              const radius = 140; // Distance from center
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div
                  key={agent}
                  className="absolute w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/20 transform hover:scale-110 transition-transform cursor-pointer"
                  style={{
                    transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                    left: '50%',
                    top: '50%',
                  }}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <span className="text-xl">{AGENTS[agent][0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Chat Sidebar (Right) */}
      <div className="w-96 bg-white border-l shadow-lg flex flex-col">
        {/* Chat Header with Agent Selection */}
        <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {AGENTS[selectedAgent]} Agent Chat
          </h2>
          <div className="flex space-x-1">
            {(Object.keys(AGENTS) as AgentType[]).map((agent) => (
              <button
                key={agent}
                onClick={() => setSelectedAgent(agent)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs transition-all",
                  selectedAgent === agent 
                    ? `${AGENT_COLORS[agent]} border-2 border-blue-500` 
                    : "bg-gray-200 hover:bg-gray-300"
                )}
                title={AGENTS[agent]}
              >
                {AGENTS[agent][0]}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
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
          className="p-4 bg-gray-100 border-t flex items-center"
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
