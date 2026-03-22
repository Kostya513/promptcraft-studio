// src/lib/ai-agent/orchestrator.ts
// Оркестратор — выбирает оптимальные нейросети для задачи

import { AIModel, RUSSIAN_AI_MODELS } from '../ai-api';
import { AgentTask, AgentPreferences } from './index';

export class AgentOrchestrator {
  
  // ─── Основная функция: Выбрать модели для задачи ───
  async selectModels(
    task: AgentTask,
    preferences: AgentPreferences
  ): Promise<AIModel[]> {
    const selectedModels: AIModel[] = [];

    switch (task.type) {
      case 'generate':
        // Генерация промта — нужен текстовый AI
        selectedModels.push(
          this.getTextModel(preferences.preferredTextModel)
        );
        // Если промт для изображения — добавляем тестирование
        if (task.options?.forImage) {
          selectedModels.push(
            this.getImageModel(preferences.preferredImageModel)
          );
        }
        break;

      case 'improve':
        // Улучшение промта — анализ + генерация
        selectedModels.push(
          this.getTextModel(preferences.preferredTextModel, 'gigachat')
        );
        selectedModels.push(
          this.getTextModel(preferences.preferredTextModel, 'yandexgpt')
        );
        // Тестирование улучшенной версии
        if (task.options?.forImage) {
          selectedModels.push(
            this.getImageModel(preferences.preferredImageModel)
          );
        }
        break;

      case 'test':
        // Тестирование промта — только визуализация
        selectedModels.push(
          this.getImageModel(preferences.preferredImageModel)
        );
        break;

      case 'variations':
        // Вариации — генерация + визуализация
        selectedModels.push(
          this.getTextModel(preferences.preferredTextModel)
        );
        selectedModels.push(
          this.getImageModel(preferences.preferredImageModel, 'shedevrum')
        );
        break;

      case 'social':
        // Социальные сети — текст + изображение
        selectedModels.push(
          this.getTextModel(preferences.preferredTextModel)
        );
        selectedModels.push(
          this.getImageModel(preferences.preferredImageModel)
        );
        break;

      case 'analyze':
        // Анализ — глубокий анализ через GigaChat
        selectedModels.push(
          this.getTextModel(preferences.preferredTextModel, 'gigachat')
        );
        break;

      default:
        // По умолчанию — YandexGPT
        selectedModels.push(
          this.getTextModel(preferences.preferredTextModel, 'yandexgpt')
        );
    }

    return selectedModels;
  }

  // ─── Получить текстовую модель ───
  private getTextModel(
    preferred?: string,
    fallback?: string
  ): AIModel {
    // Если есть предпочтения пользователя
    if (preferred) {
      const model = RUSSIAN_AI_MODELS.find(
        m => m.value === preferred && m.type === 'text'
      );
      if (model) return model;
    }

    // Если указан fallback
    if (fallback) {
      const model = RUSSIAN_AI_MODELS.find(
        m => m.value === fallback && m.type === 'text'
      );
      if (model) return model;
    }

    // По умолчанию YandexGPT
    return RUSSIAN_AI_MODELS.find(
      m => m.value === 'yandexgpt'
    ) || RUSSIAN_AI_MODELS[0];
  }

  // ─── Получить модель изображений ───
  private getImageModel(
    preferred?: string,
    fallback?: string
  ): AIModel {
    // Если есть предпочтения пользователя
    if (preferred) {
      const model = RUSSIAN_AI_MODELS.find(
        m => m.value === preferred && m.type === 'image'
      );
      if (model) return model;
    }

    // Если указан fallback
    if (fallback) {
      const model = RUSSIAN_AI_MODELS.find(
        m => m.value === fallback && m.type === 'image'
      );
      if (model) return model;
    }

    // По умолчанию Kandinsky
    return RUSSIAN_AI_MODELS.find(
      m => m.value === 'kandinsky'
    ) || RUSSIAN_AI_MODELS.find(
      m => m.type === 'image'
    ) || RUSSIAN_AI_MODELS[0];
  }

  // ─── Оценить качество результата ───
  async evaluateResult(
    task: AgentTask,
    result: any,
    models: AIModel[]
  ): Promise<number> {
    // Базовая оценка (заглушка — будет заменена на AI анализ)
    let score = 7;

    // Учитываем тип задачи
    if (task.type === 'generate' && result?.length > 0) {
      score = 8;
    }

    if (task.type === 'improve' && result?.improved) {
      score = 9;
    }

    if (task.type === 'test' && result?.imageUrl) {
      score = 8;
    }

    return score;
  }
}
