import axios from 'axios';
import type { Agent, WorkflowNode } from '../models/Agent.js';
import { aiProviderRegistry } from './ai-providers/index.js';
import * as UserAIKeys from '../models/UserAIKeys.js';

export interface ExecutionResult {
  logs: string[];
  output: any;
  success: boolean;
}

async function getAIProviderForUser(userId: number, preferredProvider?: string) {
  if (preferredProvider) {
    const key = await UserAIKeys.getUserAIKey(userId, preferredProvider);
    if (key) {
      const provider = aiProviderRegistry.get(preferredProvider);
      if (provider) {
        return { provider, config: { apiKey: key.api_key, ...key.config } };
      }
    }
  }
  
  const keys = await UserAIKeys.getUserAIKeys(userId);
  const defaultKey = keys.find(k => k.is_default) || keys[0];
  
  if (defaultKey) {
    const provider = aiProviderRegistry.get(defaultKey.provider_id);
    if (provider) {
      return { provider, config: { apiKey: defaultKey.api_key, ...defaultKey.config } };
    }
  }
  
  if (process.env.YANDEX_IAM_TOKEN && process.env.YANDEX_FOLDER_ID) {
    const provider = aiProviderRegistry.get('yandexgpt');
    if (provider) {
      return { 
        provider, 
        config: { apiKey: process.env.YANDEX_IAM_TOKEN, folderId: process.env.YANDEX_FOLDER_ID } 
      };
    }
  }
  
  throw new Error('AI провайдер не настроен. Добавьте API ключ в настройках.');
}

async function executeNode(node: WorkflowNode, context: any, logs: string[], userId: number): Promise<any> {
  logs.push(`⚡ Выполнение: ${node.label} (${node.type})`);
  
  switch (node.type) {
    case 'llm': {
      const { provider, config } = await getAIProviderForUser(userId, node.config.provider);
      logs.push(`🤖 Используем: ${provider.name}`);
      
      const prompt = node.config.prompt || context.query || context.input;
      const systemPrompt = node.config.systemPrompt || context.agentPersonality || 'Ты профессиональный помощник.';
      
      const aiResponse = await provider.generate(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        {
          ...config,
          model: (node.config.model as string) || (config as any).model,
          temperature: (node.config.temperature as number) || (config as any).temperature || 0.7,
          maxTokens: (node.config.maxTokens as number) || (config as any).maxTokens || 2000
        }
      );
      
      context.aiResponse = aiResponse.text;
      context.output = aiResponse.text;
      context.aiUsage = aiResponse.usage;
      logs.push(`🤖 AI: ${aiResponse.text.substring(0, 200)}${aiResponse.text.length > 200 ? '...' : ''}`);
      logs.push(`📊 Токены: ${aiResponse.usage.totalTokens}`);
      return aiResponse.text;
    }
    
    case 'action': {
      if (node.config.actionType === 'log') {
        logs.push(`📝 ${node.config.message || 'Action executed'}`);
        return { logged: true };
      }
      if (node.config.actionType === 'http') {
        try {
          const response = await axios({
            method: node.config.method || 'GET',
            url: node.config.url,
            headers: node.config.headers || {},
            data: node.config.body || context
          });
          logs.push(`🌐 HTTP ${node.config.method} ${node.config.url} → ${response.status}`);
          context.httpResponse = response.data;
          return response.data;
        } catch (error: any) {
          logs.push(`❌ HTTP error: ${error.message}`);
          throw error;
        }
      }
      return null;
    }
    
    case 'condition': {
      let result = false;
      if (node.config.condition === 'equals') result = context[node.config.field] === node.config.value;
      else if (node.config.condition === 'contains') result = String(context[node.config.field] || '').includes(node.config.value);
      else if (node.config.condition === 'exists') result = context[node.config.field] !== undefined;
      
      logs.push(`🔀 Условие: ${result ? '✅' : '❌'}`);
      if (!result && node.config.skipOnFalse) throw new Error('CONDITION_FAILED');
      return result;
    }
    
    case 'memory': {
      context.memory = context.memory || {};
      context.memory[node.config.key] = context[node.config.fromField] || node.config.value;
      logs.push(`💾 Сохранено: ${node.config.key}`);
      return context.memory[node.config.key];
    }
    
    default:
      logs.push(`⚠️ Неизвестный тип: ${node.type}`);
      return null;
  }
}

export async function executeAgent(agent: Agent, params: any): Promise<ExecutionResult> {
  const logs: string[] = ['🚀 Запуск агента...', '📥 Загрузка конфигурации...'];
  const context = { ...params, agentName: agent.name, agentPersonality: agent.config.personality };
  
  try {
    logs.push(`🤖 Агент: ${agent.name}`);
    logs.push(`🔌 Интеграции: ${agent.integrations.join(', ') || 'нет'}`);
    
    const workflow = agent.config.workflow || [];
    
    if (workflow.length === 0) {
      if (context.query) {
        const { provider, config } = await getAIProviderForUser(agent.user_id);
        logs.push(`🤖 Используем: ${provider.name}`);
        const aiResponse = await provider.generate(
          [
            { role: 'system', content: agent.config.personality || 'Ты профессиональный помощник.' },
            { role: 'user', content: context.query }
          ],
          config
        );
        context.output = aiResponse.text;
        logs.push(`🤖 AI: ${aiResponse.text.substring(0, 200)}...`);
      }
    } else {
      for (const node of workflow) {
        try {
          await executeNode(node, context, logs, agent.user_id);
        } catch (error: any) {
          if (error.message === 'CONDITION_FAILED') break;
          throw error;
        }
      }
    }
    
    logs.push('✅ Выполнение завершено!');
    return { logs, output: context.output || context, success: true };
  } catch (error: any) {
    logs.push(`❌ Ошибка: ${error.message}`);
    return { logs, output: null, success: false };
  }
}