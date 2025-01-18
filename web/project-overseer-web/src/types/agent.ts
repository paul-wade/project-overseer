import React from 'react';

export type AgentType = 
  | 'conceptualizer' 
  | 'architect' 
  | 'implementer' 
  | 'tester' 
  | 'deployer' 
  | 'monitor';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'warning';
  model: string;
  systemMessage: string;
  color: string;
  rune: React.ReactNode;
  capabilities: string[];
}

export const AGENTS: Record<AgentType, Omit<Agent, 'id'>> = {
  conceptualizer: {
    name: 'Conceptualizer',
    description: 'Generates innovative project concepts and initial strategies',
    status: 'active',
    model: 'gpt-4-turbo',
    systemMessage: 'You are a visionary conceptualizer who transforms abstract ideas into concrete project frameworks.',
    color: '#3B82F6', // Blue
    rune: '🌱', // Seed/Sprout emoji representing conceptualization
    capabilities: ['requirement analysis', 'domain understanding', 'innovation mapping']
  },
  architect: {
    name: 'Architect',
    description: 'Designs robust system architectures and technical blueprints',
    status: 'active',
    model: 'gpt-4-turbo',
    systemMessage: 'You are a strategic architect who designs scalable and efficient system architectures.',
    color: '#10B981', // Green
    rune: '🏗️', // Construction emoji representing architecture
    capabilities: ['system design', 'scalability planning', 'technology selection']
  },
  implementer: {
    name: 'Implementer',
    description: 'Translates designs into high-quality, performant code',
    status: 'active',
    model: 'gpt-4-turbo',
    systemMessage: 'You are a precise implementer who writes clean, efficient, and maintainable code.',
    color: '#8B5CF6', // Purple
    rune: '💻', // Computer emoji representing implementation
    capabilities: ['code generation', 'best practice enforcement', 'performance optimization']
  },
  tester: {
    name: 'Tester',
    description: 'Ensures system reliability through comprehensive testing',
    status: 'active',
    model: 'gpt-4-turbo',
    systemMessage: 'You are a meticulous tester who identifies and prevents potential system failures.',
    color: '#EF4444', // Red
    rune: '🔬', // Microscope emoji representing testing
    capabilities: ['test suite generation', 'security scanning', 'performance benchmarking']
  },
  deployer: {
    name: 'Deployer',
    description: 'Manages infrastructure and deployment strategies',
    status: 'active',
    model: 'gpt-4-turbo',
    systemMessage: 'You are an expert deployer who ensures smooth and secure system deployment.',
    color: '#F59E0B', // Yellow
    rune: '🚀', // Rocket emoji representing deployment
    capabilities: ['infrastructure provisioning', 'multi-cloud strategy', 'automated configuration']
  },
  monitor: {
    name: 'Monitor',
    description: 'Provides continuous system observability and self-healing',
    status: 'active',
    model: 'gpt-4-turbo',
    systemMessage: 'You are a vigilant monitor who ensures system health and proactively addresses issues.',
    color: '#6B7280', // Gray
    rune: '🌐', // Globe emoji representing monitoring
    capabilities: ['continuous observability', 'anomaly detection', 'self-healing mechanisms']
  }
};
