// 🔹 Утилита автоматической классификации промптов и скилов

export type LibraryClassId = 
  | "marketing" 
  | "development" 
  | "creative" 
  | "business" 
  | "education" 
  | "automation" 
  | "data";

export type LibraryGroupId = 
  | "smm" | "seo" | "email" | "ads"
  | "frontend" | "backend" | "devops" | "mobile"
  | "copywriting" | "design" | "video"
  | "hr" | "sales" | "analytics"
  | "courses" | "training"
  | "skills" | "agents" | "workflows"
  | "analysis" | "visualization";

interface ClassificationResult {
  classId: LibraryClassId;
  groupId: LibraryGroupId;
  confidence: number; // 0-1, насколько уверены в классификации
}

// 🔹 Словарь тегов для классификации
const TAG_MAPPING: Record<string, { classId: LibraryClassId; groupId: LibraryGroupId; weight: number }> = {
  // Маркетинг
  "marketing": { classId: "marketing", groupId: "smm", weight: 1 },
  "smm": { classId: "marketing", groupId: "smm", weight: 1 },
  "instagram": { classId: "marketing", groupId: "smm", weight: 0.9 },
  "telegram": { classId: "marketing", groupId: "smm", weight: 0.9 },
  "vk": { classId: "marketing", groupId: "smm", weight: 0.9 },
  "seo": { classId: "marketing", groupId: "seo", weight: 1 },
  "meta-tags": { classId: "marketing", groupId: "seo", weight: 0.9 },
  "keywords": { classId: "marketing", groupId: "seo", weight: 0.8 },
  "email": { classId: "marketing", groupId: "email", weight: 1 },
  "newsletter": { classId: "marketing", groupId: "email", weight: 0.9 },
  "ads": { classId: "marketing", groupId: "ads", weight: 1 },
  "target": { classId: "marketing", groupId: "ads", weight: 0.9 },
  "реклама": { classId: "marketing", groupId: "ads", weight: 1 },
  
  // Разработка
  "react": { classId: "development", groupId: "frontend", weight: 1 },
  "vue": { classId: "development", groupId: "frontend", weight: 1 },
  "javascript": { classId: "development", groupId: "frontend", weight: 0.8 },
  "typescript": { classId: "development", groupId: "frontend", weight: 0.8 },
  "frontend": { classId: "development", groupId: "frontend", weight: 1 },
  "backend": { classId: "development", groupId: "backend", weight: 1 },
  "api": { classId: "development", groupId: "backend", weight: 0.9 },
  "rest": { classId: "development", groupId: "backend", weight: 0.9 },
  "database": { classId: "development", groupId: "backend", weight: 0.8 },
  "sql": { classId: "development", groupId: "backend", weight: 0.9 },
  "devops": { classId: "development", groupId: "devops", weight: 1 },
  "ci/cd": { classId: "development", groupId: "devops", weight: 1 },
  "docker": { classId: "development", groupId: "devops", weight: 0.9 },
  "mobile": { classId: "development", groupId: "mobile", weight: 1 },
  "react-native": { classId: "development", groupId: "mobile", weight: 1 },
  "код": { classId: "development", groupId: "frontend", weight: 0.8 },
  
  // Креатив
  "copywriting": { classId: "creative", groupId: "copywriting", weight: 1 },
  "headlines": { classId: "creative", groupId: "copywriting", weight: 0.9 },
  "заголовки": { classId: "creative", groupId: "copywriting", weight: 0.9 },
  "text": { classId: "creative", groupId: "copywriting", weight: 0.7 },
  "текст": { classId: "creative", groupId: "copywriting", weight: 0.7 },
  "design": { classId: "creative", groupId: "design", weight: 1 },
  "midjourney": { classId: "creative", groupId: "design", weight: 1 },
  "dall-e": { classId: "creative", groupId: "design", weight: 1 },
  "stable-diffusion": { classId: "creative", groupId: "design", weight: 1 },
  "ai-art": { classId: "creative", groupId: "design", weight: 0.9 },
  "дизайн": { classId: "creative", groupId: "design", weight: 1 },
  "video": { classId: "creative", groupId: "video", weight: 1 },
  "сценарий": { classId: "creative", groupId: "video", weight: 0.9 },
  
  // Бизнес
  "hr": { classId: "business", groupId: "hr", weight: 1 },
  "recruitment": { classId: "business", groupId: "hr", weight: 0.9 },
  "interview": { classId: "business", groupId: "hr", weight: 0.9 },
  "sales": { classId: "business", groupId: "sales", weight: 1 },
  "b2b": { classId: "business", groupId: "sales", weight: 0.9 },
  "b2c": { classId: "business", groupId: "sales", weight: 0.9 },
  "воронка": { classId: "business", groupId: "sales", weight: 1 },
  "analytics": { classId: "business", groupId: "analytics", weight: 1 },
  "отчёт": { classId: "business", groupId: "analytics", weight: 0.9 },
  "бизнес": { classId: "business", groupId: "sales", weight: 0.7 },
  
  // Обучение
  "courses": { classId: "education", groupId: "courses", weight: 1 },
  "training": { classId: "education", groupId: "training", weight: 1 },
  "обучение": { classId: "education", groupId: "courses", weight: 1 },
  "курс": { classId: "education", groupId: "courses", weight: 0.9 },
  
  // Автоматизация и AI
  "automation": { classId: "automation", groupId: "workflows", weight: 1 },
  "автоматизация": { classId: "automation", groupId: "workflows", weight: 1 },
  "skill": { classId: "automation", groupId: "skills", weight: 1 },
  "скил": { classId: "automation", groupId: "skills", weight: 1 },
  "agent": { classId: "automation", groupId: "agents", weight: 1 },
  "бот": { classId: "automation", groupId: "agents", weight: 0.9 },
  "chatbot": { classId: "automation", groupId: "agents", weight: 1 },
  "workflow": { classId: "automation", groupId: "workflows", weight: 1 },
  "интеграция": { classId: "automation", groupId: "workflows", weight: 0.9 },
  
  // Данные
  "data": { classId: "data", groupId: "analysis", weight: 1 },
  "excel": { classId: "data", groupId: "analysis", weight: 1 },
  "csv": { classId: "data", groupId: "analysis", weight: 1 },
  "анализ": { classId: "data", groupId: "analysis", weight: 1 },
  "visualization": { classId: "data", groupId: "visualization", weight: 1 },
  "дашборд": { classId: "data", groupId: "visualization", weight: 0.9 },
  "данные": { classId: "data", groupId: "analysis", weight: 1 },
};

// 🔹 Основная функция классификации
export function classifyContent(
  tags: string[],
  description: string = "",
  contentType: "prompt" | "skill" = "prompt"
): ClassificationResult {
  const scores: Record<string, { classId: string; groupId: string; score: number }> = {};
  
  // Анализируем теги
  const allTags = [...tags, ...description.toLowerCase().split(/\s+/)];
  
  for (const tag of allTags) {
    const normalizedTag = tag.toLowerCase().replace(/[#\s]/g, "");
    const mapping = TAG_MAPPING[normalizedTag];
    
    if (mapping) {
      const key = `${mapping.classId}-${mapping.groupId}`;
      if (!scores[key]) {
        scores[key] = { classId: mapping.classId, groupId: mapping.groupId, score: 0 };
      }
      scores[key].score += mapping.weight;
    }
  }
  
  // Находим лучшую категорию
  let bestMatch: ClassificationResult = {
    classId: "creative", // Дефолтная категория
    groupId: "copywriting",
    confidence: 0.5,
  };
  
  let maxScore = 0;
  for (const key in scores) {
    if (scores[key].score > maxScore) {
      maxScore = scores[key].score;
      bestMatch = {
        classId: scores[key].classId as LibraryClassId,
        groupId: scores[key].groupId as LibraryGroupId,
        confidence: Math.min(maxScore / 3, 1), // Нормализуем confidence
      };
    }
  }
  
  // Особая логика для скилов
  if (contentType === "skill" && bestMatch.classId !== "automation") {
    // Если это скил, но не попал в автоматизацию — повышаем приоритет automation
    if (maxScore < 2) {
      bestMatch = {
        classId: "automation",
        groupId: "skills",
        confidence: 0.7,
      };
    }
  }
  
  return bestMatch;
}

// 🔹 Получить название класса по ID
export function getClassName(classId: LibraryClassId): string {
  const names: Record<LibraryClassId, string> = {
    marketing: "Маркетинг и Продажи",
    development: "Разработка и IT",
    creative: "Креатив и Контент",
    business: "Бизнес и Управление",
    education: "Обучение и Развитие",
    automation: "Автоматизация и AI-агенты",
    data: "Данные и Аналитика",
  };
  return names[classId];
}

// 🔹 Получить название группы по ID
export function getGroupName(groupId: LibraryGroupId): string {
  const names: Record<LibraryGroupId, string> = {
    smm: "SMM и соцсети",
    seo: "SEO и контент",
    email: "Email-маркетинг",
    ads: "Реклама",
    frontend: "Frontend",
    backend: "Backend",
    devops: "DevOps",
    mobile: "Мобильная разработка",
    copywriting: "Копирайтинг",
    design: "Дизайн",
    video: "Видео",
    hr: "HR и рекрутинг",
    sales: "Продажи",
    analytics: "Аналитика",
    courses: "Курсы",
    training: "Тренинги",
    skills: "Скилы",
    agents: "AI-агенты",
    workflows: "Рабочие процессы",
    analysis: "Анализ данных",
    visualization: "Визуализация",
  };
  return names[groupId];
}