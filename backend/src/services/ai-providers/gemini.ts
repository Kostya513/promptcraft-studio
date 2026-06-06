import { BaseAIProvider, AIProviderConfig, AIMessage, AIResponse } from './base-provider.js';

export class GeminiProvider extends BaseAIProvider {
  id = 'gemini';
  name = 'Google Gemini';
  description = 'Gemini Pro, Gemini Ultra';
  icon = '✨';
  supportedModels = ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'];

  async generate(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
    const { apiKey, model = 'gemini-pro', temperature = 0.7, maxTokens = 2000 } = config;
    
    if (!apiKey) throw new Error('Gemini: API Key не указан');

    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const contents = chatMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
          generationConfig: { temperature, maxOutputTokens: maxTokens }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data: any = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return {
      text,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
      },
      model,
      provider: this.id,
      raw: data
    };
  }
}