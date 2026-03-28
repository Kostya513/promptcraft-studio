// src/lib/ai-api.ts
// Российские AI-сервисы для Промт-Студии

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

// ─── Конфигурация ───
const YANDEXGPT_API_KEY = (import.meta as any).env?.VITE_YANDEXGPT_API_KEY;
const YANDEXGPT_FOLDER_ID = (import.meta as any).env?.VITE_YANDEXGPT_FOLDER_ID;
const KANDINSKY_API_KEY = (import.meta as any).env?.VITE_KANDINSKY_API_KEY;

// ─── Российские AI модели ───
export interface AIModel {
  value: string;
  label: string;
  type: 'text' | 'image';
  provider: 'Yandex' | 'Sber' | 'Other';
}

export const RUSSIAN_AI_MODELS: AIModel[] = [
  { value: 'yandexgpt', label: 'YandexGPT', type: 'text', provider: 'Yandex' },
  { value: 'kandinsky', label: 'Kandinsky 3.0', type: 'image', provider: 'Sber' },
  { value: 'gigachat', label: 'GigaChat', type: 'text', provider: 'Sber' },
  { value: 'shedevrum', label: 'Шедеврум', type: 'image', provider: 'Yandex' },
];

// ─── Типы ───
export interface GeneratedPrompt {
  id: string;
  text: string;
  model: string;
  quality: number;
  rating: number | null;
}

export interface ImprovementResult {
  improvements: string[];
  improved: string;
}

export interface TestResult {
  imageUrl?: string;
  status: string;
  message?: string;
}

// ─── YandexGPT: Генерация промтов ───
export async function generatePromptWithYandexGPT(
  task: string,
  model: string,
  style: string,
  detail: number
): Promise<string[]> {
  const iamToken = localStorage.getItem('yandex_iam_token');
  const folderId = YANDEXGPT_FOLDER_ID || 'b1gxxxxxxxxxxxxxx';

  if (!iamToken) {
    console.log('YandexGPT: нет токена, используем mock');
    return [
      `${task}, профессиональное качество, высокое разрешение, детализация ${detail}/10, стиль: ${style || 'универсальный'}`,
      `${task}, мастерская работа, кинематографичное освещение, 8K, стиль: ${style || 'универсальный'}`,
      `${task}, премиум качество, студийная съёмка, максимальная детализация, стиль: ${style || 'универсальный'}`,
    ];
  }

  try {
    const prompt = `Создай промпт для: ${task}. Стиль: ${style}. Детализация: ${detail}/10.`;
    
    const response = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        iamToken,
        folderId,
        model: 'yandexgpt-lite',
        temperature: 0.7,
        maxTokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('YandexGPT API error');
    }

    const data = await response.json();
    const basePrompt = data.text || task;

    return [
      `${basePrompt}, профессиональное качество, 8K`,
      `${basePrompt}, кинематографичное освещение, детализация`,
      `${basePrompt}, премиум качество, студийная работа`,
    ];
  } catch (error) {
    console.error('YandexGPT generate error:', error);
    return [task, task, task];
  }
}

// ─── YandexGPT: Улучшение промта ───
export async function improvePromptWithYandexGPT(prompt: string): Promise<ImprovementResult> {
  const iamToken = localStorage.getItem('yandex_iam_token');
  const folderId = YANDEXGPT_FOLDER_ID || 'b1gxxxxxxxxxxxxxx';

  if (!iamToken) {
    return {
      improvements: [
        'Добавьте описание освещения для лучшей атмосферы',
        'Укажите разрешение и качество для детализации',
        'Добавьте ссылку на стиль или художника',
      ],
      improved: prompt + ', professional quality, highly detailed, 8k resolution',
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/improve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalPrompt: prompt,
        iamToken,
        folderId,
      }),
    });

    if (!response.ok) {
      throw new Error('YandexGPT API error');
    }

    const data = await response.json();
    const improvedText = data.text || prompt;

    return {
      improvements: ['Улучшена структура промта', 'Добавлены параметры качества'],
      improved: improvedText,
    };
  } catch (error) {
    console.error('YandexGPT improve error:', error);
    return {
      improvements: ['Ошибка API, использован mock'],
      improved: prompt,
    };
  }
}

// ─── Kandinsky: Тестирование промта ───
export async function testPromptWithKandinsky(prompt: string): Promise<TestResult> {
  return {
    status: 'mock',
    message: 'Тестирование будет доступно после подключения API ключа Kandinsky',
  };
}

// ─── YandexGPT: Генерация вариаций ───
export async function generateVariationsWithYandexGPT(prompt: string, count: number = 3): Promise<string[]> {
  const iamToken = localStorage.getItem('yandex_iam_token');
  const folderId = YANDEXGPT_FOLDER_ID || 'b1gxxxxxxxxxxxxxx';

  if (!iamToken) {
    return [
      `${prompt} -- вариация 1: альтернативная композиция`,
      `${prompt} -- вариация 2: другая цветовая гамма`,
      `${prompt} -- вариация 3: изменённый стиль`,
    ];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Создай ${count} вариации этого промта: ${prompt}`,
        iamToken,
        folderId,
        model: 'yandexgpt-lite',
        temperature: 0.8,
        maxTokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('YandexGPT API error');
    }

    const data = await response.json();
    const baseText = data.text || prompt;

    return [
      `${baseText} (вариация 1)`,
      `${baseText} (вариация 2)`,
      `${baseText} (вариация 3)`,
    ];
  } catch (error) {
    console.error('YandexGPT variations error:', error);
    return [prompt, prompt, prompt];
  }
}

// ─── Проверка доступности API ───
export async function checkYandexGPTAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/test`);
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}