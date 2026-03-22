// src/lib/ai-api.ts
// Российские AI-сервисы для Промт-Студии

// ─── Конфигурация ───
const YANDEXGPT_API_KEY = import.meta.env.VITE_YANDEXGPT_API_KEY;
const YANDEXGPT_FOLDER_ID = import.meta.env.VITE_YANDEXGPT_FOLDER_ID;
const KANDINSKY_API_KEY = import.meta.env.VITE_KANDINSKY_API_KEY;

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

// ─── Заглушки для тестирования (пока нет API ключей) ───
export async function generatePromptWithYandexGPT(
  task: string,
  model: string,
  style: string,
  detail: number
): Promise<string[]> {
  // TODO: Реальная интеграция с YandexGPT API
  console.log('YandexGPT generate:', { task, model, style, detail });
  
  return [
    `${task}, профессиональное качество, высокое разрешение, детализация ${detail}/10, стиль: ${style || 'универсальный'}`,
    `${task}, мастерская работа, кинематографичное освещение, 8K, стиль: ${style || 'универсальный'}`,
    `${task}, премиум качество, студийная съёмка, максимальная детализация, стиль: ${style || 'универсальный'}`,
  ];
}

export async function improvePromptWithYandexGPT(prompt: string): Promise<ImprovementResult> {
  // TODO: Реальная интеграция с YandexGPT API
  console.log('YandexGPT improve:', { prompt });
  
  return {
    improvements: [
      'Добавьте описание освещения для лучшей атмосферы',
      'Укажите разрешение и качество для детализации',
      'Добавьте ссылку на стиль или художника',
      'Оптимизируйте соотношение сторон',
      'Уберите избыточные слова',
    ],
    improved: prompt + ', professional quality, highly detailed, 8k resolution',
  };
}

export async function testPromptWithKandinsky(prompt: string): Promise<TestResult> {
  // TODO: Реальная интеграция с Kandinsky API
  console.log('Kandinsky test:', { prompt });
  
  return {
    status: 'mock',
    message: 'Тестирование будет доступно после подключения API ключа Kandinsky',
  };
}

export async function generateVariationsWithYandexGPT(prompt: string, count: number = 3): Promise<string[]> {
  // TODO: Реальная интеграция с YandexGPT API
  console.log('YandexGPT variations:', { prompt, count });
  
  return [
    `${prompt} -- вариация 1: альтернативная композиция`,
    `${prompt} -- вариация 2: другая цветовая гамма`,
    `${prompt} -- вариация 3: изменённый стиль`,
  ];
}
