import { Router, Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// Временное хранилище (заменится на PostgreSQL после установки БД)
const tempPrompts: any[] = [];
const tempPublications: any[] = [];

// Middleware для проверки авторизации
const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => { 
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Требуется авторизация" });     
    return;
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    (req as any).userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Неверный токен" });
  }
};

// ─── Получение всех промтов пользователя ───
router.get("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const userPrompts = tempPrompts.filter((p: any) => p.user_id === userId);
  res.json({ prompts: userPrompts });
});

// ─── Создание нового промта ───
router.post("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { text, model, quality, category } = req.body;
  if (!text) {
    res.status(400).json({ error: "Текст промта обязателен" });   
    return;
  }
  const prompt: any = {
    id: Date.now(),  
    user_id: (req as any).userId,
    text,
    model: model || "unknown",   
    quality: quality || 85,
    category: category || null,
    status: "draft",
    created_at: new Date().toISOString()
  };
  tempPrompts.push(prompt);      
  res.status(201).json({ prompt });
});

// ─── Удаление промта ───
router.delete("/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {      
  const idx = tempPrompts.findIndex((p: any) =>
    p.id === parseInt(req.params.id) && p.user_id === (req as any).userId
  );
  if (idx === -1) {
    res.status(404).json({ error: "Промт не найден" });
    return;
  }
  tempPrompts.splice(idx, 1);    
  res.json({ message: "Промт удалён" });
});

// ─── ПУБЛИКАЦИЯ: Отправка контента на площадки ───
router.post("/publish", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const {
    title,
    description,
    price,
    prompt,
    uploadedFiles,
    selectedMarketplaces,
    selectedSocials,
    schedule,
  } = req.body;

  // Валидация обязательных полей
  if (!title || !description || !prompt) {
    res.status(400).json({ error: "Обязательные поля: title, description, prompt" });
    return;
  }

  if (selectedMarketplaces.length === 0 && selectedSocials.length === 0) {
    res.status(400).json({ error: "Выберите хотя бы одну площадку для публикации" });
    return;
  }

  const userId = (req as any).userId;
  const publicationId = `pub_${Date.now()}`;

  // Формируем запись публикации
  const publication: any = {
    id: publicationId,
    user_id: userId,
    title,
    description,
    price: price || 0,
    prompt,
    uploadedFiles: uploadedFiles || [],
    selectedMarketplaces,
    selectedSocials,
    schedule: schedule || null,
    status: "pending",
    created_at: new Date().toISOString(),
    published_at: null,
    results: [],
  };

  // Имитация асинхронной публикации на площадки
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const results = [
      ...selectedMarketplaces.map((mp: string) => ({ platform: mp, status: "queued", platform_type: "marketplace" })),
      ...selectedSocials.map((s: string) => ({ platform: s, status: "queued", platform_type: "social" })),
    ];

    publication.results = results;
    publication.status = "processing";
    tempPublications.push(publication);

    res.status(202).json({
      message: "Публикация запущена",
      publicationId,
      status: "processing",
      platforms: results,
    });

  } catch (error: any) {
    publication.status = "failed";
    publication.error = error.message;
    tempPublications.push(publication);

    res.status(500).json({
      error: "Ошибка при запуске публикации",
      message: error.message,
    });
  }
});

// ─── Статус публикации ───
router.get("/publish/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const publication = tempPublications.find(
    (p: any) => p.id === req.params.id && p.user_id === userId
  );

  if (!publication) {
    res.status(404).json({ error: "Публикация не найдена" });
    return;
  }

  if (publication.status === "processing") {
    const now = Date.now();
    const created = new Date(publication.created_at).getTime();
    if (now - created > 5000) {
      publication.status = "published";
      publication.published_at = new Date().toISOString();
      publication.results = publication.results.map((r: any) => ({
        ...r,
        status: "published",
        published_at: new Date().toISOString(),
      }));
    }
  }

  res.json({ publication });
});

// ─── История публикаций пользователя ───
router.get("/publications", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const userPublications = tempPublications
    .filter((p: any) => p.user_id === userId)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({ publications: userPublications });
});

export default router;