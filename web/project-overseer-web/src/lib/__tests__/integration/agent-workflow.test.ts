import { chatWithAgent, ChatInputSchema, AgentType } from '../../anthropic';

// Workflow simulation for agent collaboration
describe('Agent Collaboration Workflow', () => {
  // Simulated project development scenario
  const projectScenarioWorkflow = [
    {
      agent: 'conceptualizer',
      prompt: 'Design an autonomous development system for managing software projects',
      expectedKeywords: ['autonomous', 'development', 'system', 'management']
    },
    {
      agent: 'architect',
      prompt: 'Create a scalable microservices architecture for the system',
      expectedKeywords: ['microservices', 'scalable', 'architecture', 'design']
    },
    {
      agent: 'implementer',
      prompt: 'Generate initial code structure for the proposed architecture',
      expectedKeywords: ['code', 'structure', 'implementation', 'framework']
    },
    {
      agent: 'tester',
      prompt: 'Develop a comprehensive test strategy for the proposed system',
      expectedKeywords: ['test', 'strategy', 'coverage', 'validation']
    },
    {
      agent: 'deployer',
      prompt: 'Create a deployment pipeline for multi-cloud environments',
      expectedKeywords: ['deployment', 'pipeline', 'multi-cloud', 'infrastructure']
    },
    {
      agent: 'monitor',
      prompt: 'Design observability and self-healing mechanisms',
      expectedKeywords: ['observability', 'self-healing', 'monitoring', 'anomaly']
    }
  ];

  // Test agent workflow progression
  it('should maintain coherent context across agent interactions', async () => {
    let previousResponse = '';

    for (const scenario of projectScenarioWorkflow) {
      // Include previous response to simulate context preservation
      const fullPrompt = previousResponse 
        ? `Based on the previous context: ${previousResponse}. ${scenario.prompt}`
        : scenario.prompt;

      const response = await chatWithAgent({
        message: fullPrompt,
        agent: scenario.agent
      });

      // Validate response
      expect(response.success).toBe(true);
      expect(response.message).toBeTruthy();

      // Check for expected keywords
      scenario.expectedKeywords.forEach(keyword => {
        expect(response.message.toLowerCase()).toContain(keyword.toLowerCase());
      });

      // Store response for next iteration's context
      previousResponse = response.message;
    }
  }, 30000);  // Increased timeout for multiple API calls

  // Test error handling in complex scenarios
  it('should handle complex multi-agent interaction errors', async () => {
    const errorScenarios = [
      { 
        agent: 'conceptualizer', 
        prompt: 'Generate an extremely complex and ambiguous project requirement'
      },
      { 
        agent: 'architect', 
        prompt: 'Design a system with intentionally conflicting constraints'
      }
    ];

    for (const scenario of errorScenarios) {
      const response = await chatWithAgent({
        message: scenario.prompt,
        agent: scenario.agent
      });

      // Validate error handling
      expect(response.success).toBe(true);
      expect(response.message).toBeTruthy();
      
      // Check for adaptive response
      expect(response.message.length).toBeGreaterThan(0);
    }
  });

  // Ethical reasoning integration test
  it('should demonstrate ethical reasoning across agent interactions', async () => {
    const ethicalScenario = {
      agent: 'conceptualizer',
      prompt: 'Design a system that balances technological innovation with human ethical considerations'
    };

    const response = await chatWithAgent({
      message: ethicalScenario.prompt,
      agent: ethicalScenario.agent
    });

    // Validate ethical reasoning elements
    const ethicalKeywords = [
      'ethical', 'human', 'dignity', 'impact', 
      'responsible', 'consideration', 'fairness'
    ];

    expect(response.success).toBe(true);
    ethicalKeywords.forEach(keyword => {
      expect(response.message.toLowerCase()).toContain(keyword);
    });
  });

  // Test agent workflow with correct agent type
  it('should process chat input for different agents', async () => {
    const agents: AgentType[] = [
      'conceptualizer', 
      'architect', 
      'implementer', 
      'tester', 
      'deployer', 
      'monitor'
    ];

    for (const agent of agents) {
      const result: ChatInputSchema = await chatWithAgent({
        message: `Test message for ${agent}`,
        agent
      });

      expect(result.success).toBe(true);
      expect(result.agent).toBe(agent);
      expect(result.message).toBeTruthy();
    }
  });
});
