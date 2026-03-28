// ============================================
// YANDEXGPT API CLIENT
// ============================================

const YANDEX_GPT_API_URL = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';
const YANDEX_IAM_URL = 'https://iam.api.cloud.yandex.net/iam/v1/tokens';

export interface YandexGPTConfig {
  iamToken: string;
  folderId: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface YandexGPTResponse {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

// ─── Получить IAM токен (через backend для безопасности) ───
export async function getIamToken(apiKey: string): Promise<string> {
  const response = await fetch(YANDEX_IAM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Api-Key ${apiKey}`,
    },
    body: JSON.stringify({
      yandexPassportOauthToken: apiKey,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get IAM token');
  }
  
  const data = await response.json();
  return data.iamToken;
}

// ─── Генерация текста через YandexGPT ───
export async function generateText(
  prompt: string,
  config: YandexGPTConfig
): Promise<YandexGPTResponse> {
  const { iamToken, folderId, model = 'yandexgpt-lite', temperature = 0.7, maxTokens = 2000 } = config;
  
  const response = await fetch(YANDEX_GPT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${iamToken}`,
      'x-folder-id': folderId,
    },
    body: JSON.stringify({
      modelUri: `gpt://${folderId}/${model}`,
      completionOptions: {
        stream: false,
        temperature,
        maxTokens,
      },
      messages: [
        {
          role: 'system',
          text: 'Ты профессиональный помощник для создания промтов. Отвечай кратко и по делу.',
        },
        {
          role: 'user',
          text: prompt,
        },
      ],
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`YandexGPT API error: ${error}`);
  }
  
  const data = await response.json();
  
  return {
    text: data.result?.alternatives?.[0]?.message?.text || '',
    usage: {
      inputTokens: data.usage?.inputTokens || 0,
      outputTokens: data.usage?.outputTokens || 0,
    },
  };
}

// ─── Генерация промта для маркетплейсов ───
export async function generateMarketplacePrompt(
  product: string,
  marketplace: string,
  config: YandexGPTConfig
): Promise<YandexGPTResponse> {
  const systemPrompt = `Ты эксперт по созданию продающих описаний для ${marketplace}. 
Создай SEO-оптимизированный промт для товара "${product}".
Включи: ключевые слова, преимущества, характеристики, призыв к действию.
Формат: структурированный текст с эмодзи.`;

  return generateText(systemPrompt, config);
}

// ─── Генерация промта для соцсетей ───
export async function generateSocialMediaPrompt(
  topic: string,
  platform: string,
  config: YandexGPTConfig
): Promise<YandexGPTResponse> {
  const systemPrompt = `Ты SMM-специалист для ${platform}.
Создай вовлекающий пост на тему "${topic}".
Включи: цепляющий заголовок, основной текст, хештеги, призыв к действию.
Стиль: дружеский, профессиональный.`;

  return generateText(systemPrompt, config);
}

// ─── Улучшение существующего промта ───
export async function improvePrompt(
  originalPrompt: string,
  config: YandexGPTConfig
): Promise<YandexGPTResponse> {
  const systemPrompt = `Улучши этот промт, сделай его более детальным и эффективным.
Добавь: стиль, качество, детали, композицию, освещение.
Оригинальный промт: "${originalPrompt}"`;

  return generateText(systemPrompt, config);
}

// ─── Тестовый запрос ───
export async function testConnection(config: YandexGPTConfig): Promise<boolean> {
  try {
    await generateText('Привет, ответь ОК', config);
    return true;
  } catch {
    return false;
  }
}
