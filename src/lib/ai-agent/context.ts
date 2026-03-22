// src/lib/ai-agent/context.ts
// Контекст пользователя — хранит предпочтения и историю

import { AgentTask } from './index';

interface UserContext {
  userId: string;
  preferences: {
    preferredTextModel?: string;
    preferredImageModel?: string;
    autoSocialPost?: boolean;
    connectedSocials?: string[];
  };
  history: TaskHistory[];
  stats: {
    totalTasks: number;
    modelsUsed: Record<string, number>;
    successCount: number;
  };
}

interface TaskHistory {
  taskId: string;
  type: string;
  timestamp: number;
  modelsUsed: string[];
  success: boolean;
  result?: any;
}

export class AgentContext {
  private userId: string;
  private context: UserContext;

  constructor(userId: string) {
    this.userId = userId;
    this.context = {
      userId,
      preferences: {},
      history: [],
      stats: {
        totalTasks: 0,
        modelsUsed: {},
        successCount: 0,
      },
    };
  }

  // ─── Загрузить контекст ───
  async load(): Promise<void> {
    // TODO: Загрузка из localStorage или API
    const stored = localStorage.getItem(`agent_context_${this.userId}`);
    if (stored) {
      try {
        this.context = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load context:', e);
      }
    }
  }

  // ─── Сохранить контекст ───
  async save(): Promise<void> {
    // TODO: Сохранение в localStorage или API
    localStorage.setItem(`agent_context_${this.userId}`, JSON.stringify(this.context));
  }

  // ─── Сохранить результат задачи ───
  async saveTaskResult(task: AgentTask, result: any): Promise<void> {
    const historyEntry: TaskHistory = {
      taskId: task.id,
      type: task.type,
      timestamp: Date.now(),
      modelsUsed: result.modelsUsed || [],
      success: true,
      result,
    };

    this.context.history.push(historyEntry);
    this.context.stats.totalTasks++;
    this.context.stats.successCount++;

    // Обновляем статистику моделей
    for (const model of historyEntry.modelsUsed) {
      this.context.stats.modelsUsed[model] = 
        (this.context.stats.modelsUsed[model] || 0) + 1;
    }

    // Сохраняем если больше 100 записей в истории
    if (this.context.history.length > 100) {
      this.context.history = this.context.history.slice(-100);
    }

    await this.save();
  }

  // ─── Получить рекомендации ───
  async getRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    // Анализируем историю
    const recentTasks = this.context.history.slice(-10);
    
    // Если много генераций — предложить оптимизацию
    const generateCount = recentTasks.filter(t => t.type === 'generate').length;
    if (generateCount > 5) {
      recommendations.push(
        'Вы создали много промтов. Рассмотрите возможность публикации лучших на маркетплейсе.'
      );
    }

    // Если нет тестирований — предложить протестировать
    const testCount = recentTasks.filter(t => t.type === 'test').length;
    if (testCount === 0 && generateCount > 3) {
      recommendations.push(
        'Протестируйте ваши промты через Kandinsky для проверки качества.'
      );
    }

    // Если нет социальных постов — предложить продвижение
    const socialCount = recentTasks.filter(t => t.type === 'social').length;
    if (socialCount === 0 && generateCount > 2) {
      recommendations.push(
        'Автоматически опубликуйте ваши промты в социальных сетях для продвижения.'
      );
    }

    return recommendations;
  }

  // ─── Получить статистику ───
  async getUsageStats(): Promise<{
    totalTasks: number;
    modelsUsed: Record<string, number>;
    successRate: number;
  }> {
    const successRate = this.context.stats.totalTasks > 0
      ? Math.round((this.context.stats.successCount / this.context.stats.totalTasks) * 100)
      : 0;

    return {
      totalTasks: this.context.stats.totalTasks,
      modelsUsed: this.context.stats.modelsUsed,
      successRate,
    };
  }

  // ─── Обновить предпочтения ───
  updatePreferences(preferences: Partial<UserContext['preferences']>): void {
    this.context.preferences = { ...this.context.preferences, ...preferences };
  }

  // ─── Получить предпочтения ───
  getPreferences(): UserContext['preferences'] {
    return this.context.preferences;
  }

  // ─── Получить историю ───
  getHistory(limit: number = 20): TaskHistory[] {
    return this.context.history.slice(-limit);
  }
}
