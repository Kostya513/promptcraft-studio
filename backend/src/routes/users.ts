import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

declare global {
  var tempUsers: any[];
}
if (!global.tempUsers) global.tempUsers = [];

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

router.get("/profile", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const user = global.tempUsers.find((u: any) => u.id === (req as any).userId);
  if (!user) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }
  res.json({ user: { id: user.id, email: user.email, name: user.name, avatar_url: "" } });
});

router.put("/profile", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { name, avatar_url } = req.body;
  const user = global.tempUsers.find((u: any) => u.id === (req as any).userId);
  if (!user) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }
  if (name) user.name = name;
  if (avatar_url) user.avatar_url = avatar_url;
  res.json({ user: { id: user.id, email: user.email, name: user.name, avatar_url: "" } });
});

export default router;