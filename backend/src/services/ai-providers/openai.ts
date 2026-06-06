import { BaseAIProvider, AIProviderConfig, AIMessage, AIResponse } from './base-provider.js';

export class OpenAIProvider extends BaseAIProvider {
  id = 'openai';
  name = 'OpenAI';
  description = 'GPT-4, GPT-3.5, DALL-E';
  icon = '🤖';
  supportedModels = ['gpt-4-turbo-preview', 'gpt-4', 'gpt-4-32k', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'];

  async generate(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
    const { apiKey, model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens = 2000 } = config;
    const endpoint = config.endpoint || 'https://api.openai.com/v1';
    
    if (!apiKey) throw new Error('OpenAI: API Key не указан');

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data: any = await response.json();
    
    return {
      text: data.choices?.[0]?.message?.content || '',
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      },
      model,
      provider: this.id,
      raw: data
    };
  }
}