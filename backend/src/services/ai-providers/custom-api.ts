import { BaseAIProvider, AIProviderConfig, AIMessage, AIResponse } from './base-provider.js';

export class CustomAPIProvider extends BaseAIProvider {
  id = 'custom';
  name = 'Custom API';
  description = 'Любой OpenAI-совместимый API';
  icon = '🔧';
  supportedModels = ['custom'];

  async generate(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
    const { apiKey, endpoint, model = 'custom', temperature = 0.7, maxTokens = 2000 } = config;
    
    if (!endpoint) throw new Error('Custom API: Endpoint не указан');
    if (!apiKey) throw new Error('Custom API: API Key не указан');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom API error: ${error}`);
    }

    const data: any = await response.json();
    
    let text = '';
    if (data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    } else if (data.result?.alternatives?.[0]?.message?.text) {
      text = data.result.alternatives[0].message.text;
    } else if (data.content?.[0]?.text) {
      text = data.content[0].text;
    } else if (typeof data.text === 'string') {
      text = data.text;
    }
    
    return {
      text,
      usage: {
        inputTokens: data.usage?.prompt_tokens || data.usage?.inputTokens || 0,
        outputTokens: data.usage?.completion_tokens || data.usage?.outputTokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      },
      model,
      provider: this.id,
      raw: data
    };
  }
}