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
  } catch (error: any) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

// GET /api/prompts
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM prompts WHERE user_id = $1 ORDER BY created_at DESC', [(req as any).userId]);
    res.json({ prompts: result.rows });
  } catch (error: any) {
    console.error('Get prompts error:', error.message);
    res.status(500).json({ error: 'Ошибка получения промтов' });
  }
});

// POST /api/prompts
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { text, model, quality } = req.body;
    if (!text) return res.status(400).json({ error: 'Текст промта обязателен' });
    
    const result = await query(
      'INSERT INTO prompts (user_id, text, model, quality) VALUES ($1, $2, $3, $4) RETURNING *',
      [(req as any).userId, text, model || 'unknown', quality || 85]
    );
    res.status(201).json({ prompt: result.rows[0] });
  } catch (error: any) {
    console.error('Create prompt error:', error.message);
    res.status(500).json({ error: 'Ошибка создания промта' });
  }
});

// DELETE /api/prompts/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM prompts WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, (req as any).userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Промт не найден' });
    res.json({ message: 'Промт удалён' });
  } catch (error: any) {
    res.status(500).json({ error: 'Ошибка удаления промта' });
  }
});

export default router;
