import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// Zod schema for input validation
export const AgentSchema = z.enum([
  'conceptualizer', 
  'architect', 
  'implementer', 
  'tester', 
  'deployer', 
  'monitor'
]);

export type AgentType = z.infer<typeof AgentSchema>;

export const ChatInputSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  agent: AgentSchema
});

// Agent-specific system prompts
const AGENT_SYSTEM_PROMPTS = {
  conceptualizer: `You are a conceptualization AI agent for Project Overseer. 
    Your role is to transform high-level requirements into detailed project concepts. 
    Provide innovative, strategic insights that bridge user needs with technological possibilities.`,
  
  architect: `You are a system architecture AI agent for Project Overseer. 
    Your primary function is to design scalable, efficient system architectures. 
    Break down complex requirements into modular, robust architectural solutions.`,
  
  implementer: `You are a code implementation AI agent for Project Overseer. 
    Your goal is to generate precise, efficient code solutions across multiple programming languages. 
    Focus on best practices, performance, and clean, maintainable code.`,
  
  tester: `You are a testing AI agent for Project Overseer. 
    Your mission is to develop comprehensive test strategies, identify potential vulnerabilities, 
    and ensure the highest quality of software implementations.`,
  
  deployer: `You are a deployment AI agent for Project Overseer. 
    Specialize in infrastructure provisioning, multi-cloud strategies, 
    and creating seamless, automated deployment pipelines.`,
  
  monitor: `You are a monitoring AI agent for Project Overseer. 
    Your role is to provide continuous system observability, 
    detect anomalies, and recommend self-healing mechanisms.`
};

export async function chatWithAgent(input: z.infer<typeof ChatInputSchema>) {
  // Validate input
  const validatedInput = ChatInputSchema.parse(input);

  // Initialize Anthropic client
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true
  });

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      system: AGENT_SYSTEM_PROMPTS[validatedInput.agent],
      messages: [
        {
          role: "user",
          content: validatedInput.message
        }
      ]
    });

    let messageText = '';
    let messageType: 'text' | 'tool_use' = 'text';

    const firstContent = response.content[0];
    
    if (firstContent && firstContent.type === 'text') {
      messageText = firstContent.text || '';
    } else if (firstContent && firstContent.type === 'tool_use') {
      messageText = 'Received a tool use response';
      messageType = 'tool_use';
    } else {
      messageText = 'Received an unrecognized response type';
    }

    return {
      success: true,
      message: messageText,
      agent: validatedInput.agent,
      type: messageType
    };
  } catch (error) {
    console.error('Anthropic API Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      agent: validatedInput.agent,
      type: 'text'
    };
  }
}
