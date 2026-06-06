import { BaseAIProvider, AIProviderConfig, AIMessage, AIResponse } from './base-provider.js';

export class YandexGPTProvider extends BaseAIProvider {
  id = 'yandexgpt';
  name = 'YandexGPT';
  description = 'Yandex Foundation Models';
  icon = '🇷🇺';
  supportedModels = ['yandexgpt-lite', 'yandexgpt', 'yandexgpt-32k', 'summarization'];

  async generate(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
    const { apiKey, model = 'yandexgpt-lite', temperature = 0.7, maxTokens = 2000 } = config;
    const folderId = config.folderId || process.env.YANDEX_FOLDER_ID;
    
    if (!apiKey) throw new Error('YandexGPT: IAM Token не указан');
    if (!folderId) throw new Error('YandexGPT: Folder ID не указан');

    const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-folder-id': folderId,
      },
      body: JSON.stringify({
        modelUri: `gpt://${folderId}/${model}`,
        completionOptions: { stream: false, temperature, maxTokens },
        messages: messages.map(m => ({ role: m.role, text: m.content }))
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`YandexGPT API error: ${error}`);
    }

    const data: any = await response.json();
    const text = data.result?.alternatives?.[0]?.message?.text || '';
    
    return {
      text,
      usage: {
        inputTokens: data.result?.usage?.inputTextTokens || 0,
        outputTokens: data.result?.usage?.completionTokens || 0,
        totalTokens: data.result?.usage?.totalTokens || 0
      },
      model,
      provider: this.id,
      raw: data
    };
  }
}