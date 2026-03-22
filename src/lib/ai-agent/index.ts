// src/lib/ai-agent/index.ts
// Главный класс AI Агента — дирижёр нейросетей

import { AIModel, RUSSIAN_AI_MODELS } from '../ai-api';
import { AgentOrchestrator } from './orchestrator';
import { AgentWorkflow } from './workflow';
import { AgentContext } from './context';

// ─── Типы ───
export interface AgentConfig {
  userId: string;
  tariff: 'free' | 'pro' | 'business';
  preferences: AgentPreferences;
}

export interface AgentPreferences {
  preferredTextModel?: string;
  preferredImageModel?: string;
  autoSocialPost?: boolean;
  connectedSocials?: string[];
}

export interface AgentTask {
  id: string;
  type: 'generate' | 'improve' | 'test' | 'variations' | 'social' | 'analyze';
  input: string;
  options?: Record<string, any>;
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  modelsUsed?: string[];
  duration?: number;
}

// ─── Главный класс AI Агента ───
export class AIAgent {
  private config: AgentConfig;
  private orchestrator: AgentOrchestrator;
  private workflow: AgentWorkflow;
  private context: AgentContext;

  constructor(config: AgentConfig) {
    this.config = config;
    this.orchestrator = new AgentOrchestrator();
    this.workflow = new AgentWorkflow(this.orchestrator);
    this.context = new AgentContext(config.userId);
  }

  // ─── Основная задача: Выполнить задачу ───
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // 1. Загружаем контекст пользователя
      await this.context.load();
      
      // 2. Выбираем оптимальные нейросети для задачи
      const models = await this.orchestrator.selectModels(task, this.config.preferences);
      
      // 3. Выполняем задачу через Workflow
      const result = await this.workflow.execute(task, models, this.context);
      
      // 4. Сохраняем результат в контекст
      await this.context.saveTaskResult(task, result);
      
      return {
        success: true,
        data: result,
        modelsUsed: models.map(m => m.value),
        duration: Date.now() - startTime,
      };
    } catch (error) {
      console.error('AI Agent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        duration: Date.now() - startTime,
      };
    }
  }

  // ─── Получить рекомендации ───
  async getRecommendations(): Promise<string[]> {
    return await this.context.getRecommendations();
  }

  // ─── Обновить предпочтения ───
  updatePreferences(preferences: Partial<AgentPreferences>): void {
    this.config.preferences = { ...this.config.preferences, ...preferences };
  }

  // ─── Получить статистику использования ───
  async getUsageStats(): Promise<{
    totalTasks: number;
    modelsUsed: Record<string, number>;
    successRate: number;
  }> {
    return await this.context.getUsageStats();
  }
}

// ─── Экспорт для удобства ───
export { AgentOrchestrator } from './orchestrator';
export { AgentWorkflow } from './workflow';
export { AgentContext } from './context';
