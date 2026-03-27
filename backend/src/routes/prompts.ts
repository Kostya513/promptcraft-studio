import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const tempPrompts: any[] = [];

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

router.get("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const userPrompts = tempPrompts.filter((p: any) => p.user_id === userId);
  res.json({ prompts: userPrompts });
});

router.post("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { text, model, quality } = req.body;
  if (!text) {
    res.status(400).json({ error: "Текст промта обязателен" });
    return;
  }
  const prompt: any = { 
    id: tempPrompts.length + 1, 
    user_id: (req as any).userId, 
    text, 
    model: model || "unknown", 
    quality: quality || 85, 
    status: "draft", 
    created_at: new Date().toISOString() 
  };
  tempPrompts.push(prompt);
  res.status(201).json({ prompt });
});

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

export default router;