import { BaseAIProvider, AIProviderConfig, AIMessage, AIResponse } from './base-provider.js';

export class GigaChatProvider extends BaseAIProvider {
  id = 'gigachat';
  name = 'GigaChat';
  description = 'Sber AI GigaChat';
  icon = '🇷';
  supportedModels = ['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro'];

  async generate(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
    const { apiKey, model = 'GigaChat', temperature = 0.7, maxTokens = 2000 } = config;
    
    if (!apiKey) throw new Error('GigaChat: API Key не указан');

    const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GigaChat API error: ${error}`);
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