import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    (req as any).userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

// GET /api/users/profile
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, email, name, avatar_url, role, created_at FROM users WHERE id = $1', [(req as any).userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ user: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Ошибка получения профиля' });
  }
});

// PUT /api/users/profile
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, avatar_url } = req.body;
    const result = await query(
      'UPDATE users SET name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, email, name, avatar_url, role',
      [name, avatar_url, (req as any).userId]
    );
    res.json({ user: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
});

export default router;
