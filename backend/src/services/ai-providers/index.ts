import { AIProvider, AIProviderConfig, AIMessage, AIResponse } from './base-provider.js';
import { YandexGPTProvider } from './yandex-gpt.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GigaChatProvider } from './gigachat.js';
import { GeminiProvider } from './gemini.js';
import { CustomAPIProvider } from './custom-api.js';

export { AIProvider, AIProviderConfig, AIMessage, AIResponse };

class AIProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.register(new YandexGPTProvider());
    this.register(new GigaChatProvider());
    this.register(new OpenAIProvider());
    this.register(new AnthropicProvider());
    this.register(new GeminiProvider());
    this.register(new CustomAPIProvider());
  }

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
    console.log(`✅ AI провайдер зарегистрирован: ${provider.name} (${provider.id})`);
  }

  get(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getSupportedProviders() {
    return this.getAll().map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      icon: p.icon,
      supportedModels: p.supportedModels
    }));
  }

  async generate(providerId: string, messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse> {
    const provider = this.get(providerId);
    if (!provider) throw new Error(`AI провайдер "${providerId}" не найден`);
    return provider.generate(messages, config);
  }
}

export const aiProviderRegistry = new AIProviderRegistry();