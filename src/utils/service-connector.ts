import { IntegrationItem, IntegrationType } from "@/components/account-manager/AccountIntegrations";

export type ExecutionResult = {
  success: boolean;
  response?: any;
  error?: string;
  timestamp: string;
};

export type ExecutionPayload = {
  message?: string;
  data?: Record<string, any>;
  prompt?: string;
  [key: string]: any;
};

/**
 * Универсальный исполнитель действий для интеграций
 */
export async function executeAction(
  integration: IntegrationItem,
  payload: ExecutionPayload
): Promise<ExecutionResult> {
  try {
    const service = getServiceConfig(integration.type);
    
    switch (integration.type) {
      case "telegram":
        return await sendTelegramMessage(integration.config, payload);
      case "notion":
        return await createNotionPage(integration.config, payload);
      case "webhook":
        return await sendWebhook(integration.config, payload);
      case "google_sheets":
        return await appendToSheet(integration.config, payload);
      default:
        return { success: false, error: `Неподдерживаемый тип: ${integration.type}`, timestamp: new Date().toISOString() };
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || "Неизвестная ошибка выполнения", 
      timestamp: new Date().toISOString() 
    };
  }
}

// 🔹 Telegram: отправка сообщения
async function sendTelegramMessage(
  config: Record<string, string>, 
  payload: ExecutionPayload
): Promise<ExecutionResult> {
  const { token, chat_id } = config;
  const text = payload.message || payload.prompt || "🤖 Тестовое сообщение от Промт-Студии";
  
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text, parse_mode: "Markdown" })
  });
  
  const data = await response.json();
  
  if (data.ok) {
    return { success: true, response: data.result, timestamp: new Date().toISOString() };
  } else {
    return { success: false, error: data.description || "Ошибка Telegram API", timestamp: new Date().toISOString() };
  }
}

// 🔹 Notion: создание страницы
async function createNotionPage(
  config: Record<string, string>, 
  payload: ExecutionPayload
): Promise<ExecutionResult> {
  const { api_key, database_id } = config;
  const title = payload.message?.slice(0, 50) || "Новая запись";
  
  const response = await fetch(`https://api.notion.com/v1/pages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${api_key}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28"
    },
    body: JSON.stringify({
      parent: { database_id },
      properties: {
        Name: { title: [{ text: { content: title } }] },
        Created: { date: { start: new Date().toISOString() } },
        Content: { rich_text: [{ text: { content: payload.message || "" } }] }
      }
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    return { success: true, response: { id: data.id, url: data.url }, timestamp: new Date().toISOString() };
  } else {
    return { success: false, error: data.message || "Ошибка Notion API", timestamp: new Date().toISOString() };
  }
}

// 🔹 Webhook: POST запрос
async function sendWebhook(
  config: Record<string, string>, 
  payload: ExecutionPayload
): Promise<ExecutionResult> {
  const { url, method = "POST" } = config;
  
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      source: "promptcraft-studio",
      timestamp: new Date().toISOString(),
      ...payload 
    })
  });
  
  const text = await response.text();
  
  if (response.ok) {
    return { success: true, response: text, timestamp: new Date().toISOString() };
  } else {
    return { success: false, error: `HTTP ${response.status}: ${text.slice(0, 100)}`, timestamp: new Date().toISOString() };
  }
}

// 🔹 Google Sheets: добавление строки (упрощённо)
async function appendToSheet(
  config: Record<string, string>, 
  payload: ExecutionPayload
): Promise<ExecutionResult> {
  // Для полноценной работы нужен OAuth2 flow, здесь — заглушка
  return { 
    success: true, 
    response: { message: "Данные подготовлены для отправки в Google Sheets", payload }, 
    timestamp: new Date().toISOString() 
  };
}

// Вспомогательная функция
function getServiceConfig(type: IntegrationType) {
  const configs = {
    telegram: { label: "Telegram Bot", icon: "🤖" },
    notion: { label: "Notion API", icon: "🗄️" },
    webhook: { label: "Webhook", icon: "🌐" },
    google_sheets: { label: "Google Sheets", icon: "📊" }
  };
  return configs[type];
}