export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  endpoint?: string;
  folderId?: string;
  [key: string]: any;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
  raw?: any;
}

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  supportedModels: string[];
  generate(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse>;
  testConnection(config: AIProviderConfig): Promise<boolean>;
  getModels(config: AIProviderConfig): Promise<string[]>;
}

export abstract class BaseAIProvider implements AIProvider {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract icon: string;
  abstract supportedModels: string[];
  
  abstract generate(messages: AIMessage[], config: AIProviderConfig): Promise<AIResponse>;
  
  async testConnection(config: AIProviderConfig): Promise<boolean> {
    try {
      await this.generate(
        [{ role: 'user', content: 'test' }],
        { ...config, maxTokens: 10 }
      );
      return true;
    } catch {
      return false;
    }
  }
  
  async getModels(_config: AIProviderConfig): Promise<string[]> {
    return this.supportedModels;
  }
}