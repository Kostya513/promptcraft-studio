import { BaseAIProvider, AIProviderConfig, AIMessage, AIResponse } from './base-provider.js';

export class AnthropicProvider extends BaseAIProvider {
  id = 'anthropic';
  name = 'Anthropic Claude';
  description = 'Claude 3, Claude 2';
  icon = '🧠';
  supportedModels = ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-2.1'];

  async generate(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
    const { apiKey, model = 'claude-3-sonnet-20240229', temperature = 0.7, maxTokens = 2000 } = config;
    
    if (!apiKey) throw new Error('Anthropic: API Key не указан');

    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        system: systemMessage?.content,
        messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data: any = await response.json();
    
    return {
      text: data.content?.[0]?.text || '',
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      },
      model,
      provider: this.id,
      raw: data
    };
  }
}