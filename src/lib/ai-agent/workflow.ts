// src/lib/ai-agent/workflow.ts
// Workflow Engine — выполняет цепочки задач

import { AIModel } from '../ai-api';
import {
  generatePromptWithYandexGPT,
  improvePromptWithYandexGPT,
  testPromptWithKandinsky,
  generateVariationsWithYandexGPT,
} from '../ai-api';
import { AgentTask, AgentContext } from './index';
import { AgentOrchestrator } from './orchestrator';

export class AgentWorkflow {
  private orchestrator: AgentOrchestrator;

  constructor(orchestrator: AgentOrchestrator) {
    this.orchestrator = orchestrator;
  }

  // ─── Основная функция: Выполнить задачу ───
  async execute(
    task: AgentTask,
    models: AIModel[],
    context: AgentContext
  ): Promise<any> {
    switch (task.type) {
      case 'generate':
        return await this.executeGenerate(task, models, context);
      
      case 'improve':
        return await this.executeImprove(task, models, context);
      
      case 'test':
        return await this.executeTest(task, models, context);
      
      case 'variations':
        return await this.executeVariations(task, models, context);
      
      case 'social':
        return await this.executeSocial(task, models, context);
      
      case 'analyze':
        return await this.executeAnalyze(task, models, context);
      
      default:
        throw new Error(`Неизвестный тип задачи: ${task.type}`);
    }
  }

  // ─── Генерация промта ───
  private async executeGenerate(
    task: AgentTask,
    models: AIModel[],
    context: AgentContext
  ): Promise<any> {
    const textModel = models.find(m => m.type === 'text');
    
    if (!textModel) {
      throw new Error('Требуется текстовая модель для генерации');
    }

    // Генерируем промт через YandexGPT
    const prompts = await generatePromptWithYandexGPT(
      task.input,
      textModel.value,
      task.options?.style || '',
      task.options?.detail || 5
    );

    // Если нужно тестирование изображений
    const testResults = [];
    if (task.options?.forImage) {
      const imageModel = models.find(m => m.type === 'image');
      if (imageModel) {
        for (const prompt of prompts.slice(0, 2)) {
          const test = await testPromptWithKandinsky(prompt);
          testResults.push(test);
        }
      }
    }

    return {
      prompts,
      testResults,
      model: textModel.value,
    };
  }

  // ─── Улучшение промта ───
  private async executeImprove(
    task: AgentTask,
    models: AIModel[],
    context: AgentContext
  ): Promise<any> {
    // Анализируем и улучшаем через YandexGPT
    const result = await improvePromptWithYandexGPT(task.input);

    // Тестируем улучшенную версию если нужно
    let testResult = null;
    if (task.options?.forImage) {
      testResult = await testPromptWithKandinsky(result.improved);
    }

    return {
      improvements: result.improvements,
      improved: result.improved,
      testResult,
    };
  }

  // ─── Тестирование промта ───
  private async executeTest(
    task: AgentTask,
    models: AIModel[],
    context: AgentContext
  ): Promise<any> {
    const imageModel = models.find(m => m.type === 'image');
    
    if (!imageModel) {
      throw new Error('Требуется модель изображений для тестирования');
    }

    const result = await testPromptWithKandinsky(task.input);

    return {
      result,
      model: imageModel.value,
    };
  }

  // ─── Создание вариаций ───
  private async executeVariations(
    task: AgentTask,
    models: AIModel[],
    context: AgentContext
  ): Promise<any> {
    const textModel = models.find(m => m.type === 'text');
    
    if (!textModel) {
      throw new Error('Требуется текстовая модель для вариаций');
    }

    const count = task.options?.count || 3;
    const variations = await generateVariationsWithYandexGPT(
      task.input,
      count
    );

    return {
      variations,
      model: textModel.value,
    };
  }

  // ─── Социальные сети ───
  private async executeSocial(
    task: AgentTask,
    models: AIModel[],
    context: AgentContext
  ): Promise<any> {
    // Генерируем пост для соцсетей
    const textModel = models.find(m => m.type === 'text');
    const imageModel = models.find(m => m.type === 'image');

    const posts: Record<string, string> = {};

    // VK — развёрнутый пост
    posts.vk = await this.generateVKPost(task.input, textModel);

    // Telegram — короткий пост
    posts.telegram = await this.generateTelegramPost(task.input, textModel);

    // TenChat — деловой стиль
    posts.tenchat = await this.generateTenChatPost(task.input, textModel);

    // Генерируем изображение для поста
    let imageResult = null;
    if (imageModel) {
      imageResult = await testPromptWithKandinsky(task.input);
    }

    return {
      posts,
      image: imageResult,
      models: models.map(m => m.value),
    };
  }

  // ─── Анализ ──
  private async executeAnalyze(
    task: AgentTask,
    models: AIModel[],
    context: AgentContext
  ): Promise<any> {
    // Глубокий анализ через GigaChat
    const analysis = await improvePromptWithYandexGPT(task.input);

    return {
      analysis: analysis.improvements,
      recommendations: analysis.improvements,
    };
  }

  // ─── Генераторы постов (заглушки) ───
  private async generateVKPost(input: string, model?: AIModel): Promise<string> {
    return ` Новый промт: ${input}\n\nСоздано с помощью AI в Промт-Студии!\n\n#промт #ai #нейросеть`;
  }

  private async generateTelegramPost(input: string, model?: AIModel): Promise<string> {
    return `��� Промт: ${input}\n\nПодробнее: [ссылка]`;
  }

  private async generateTenChatPost(input: string, model?: AIModel): Promise<string> {
    return `Деловое предложение: ${input}\n\nПрофессиональное решение для бизнеса.`;
  }
}
