import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

declare global {
  var tempUsers: any[];
}
if (!global.tempUsers) global.tempUsers = [];

// ============================================
// MULTER CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Только изображения разрешены'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// ============================================
// AUTH MIDDLEWARE
// ============================================
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
    (req as any).userEmail = decoded.email;
    next();
  } catch {
    res.status(401).json({ error: "Неверный токен" });
  }
};

// ============================================
// ROUTES
// ============================================

router.get("/profile", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  let user = global.tempUsers.find((u: any) => u.id === (req as any).userId);
  
  if (!user) {
    user = {
      id: (req as any).userId,
      email: (req as any).userEmail || 'user@example.com',
      name: ((req as any).userEmail || 'user@example.com').split('@')[0],
      avatar_url: ''
    };
    global.tempUsers.push(user);
  }
  
  res.json({ user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url || "" } });
});

router.put("/profile", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { name, avatar_url } = req.body;
  
  let user = global.tempUsers.find((u: any) => u.id === (req as any).userId);
  
  if (!user) {
    user = {
      id: (req as any).userId,
      email: (req as any).userEmail || 'user@example.com',
      name: name || ((req as any).userEmail || 'user@example.com').split('@')[0],
      avatar_url: avatar_url || ''
    };
    global.tempUsers.push(user);
  }
  
  if (name) user.name = name;
  if (avatar_url !== undefined) user.avatar_url = avatar_url;
  res.json({ user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url || "" } });
});

router.post("/avatar", authMiddleware, upload.single('avatar'), async (req: Request & { file?: Express.Multer.File }, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Файл не загружен" });
      return;
    }
    
    console.log('📥 Avatar upload - userId:', (req as any).userId);
    console.log('📥 Avatar upload - file:', req.file.filename);
    
    let user = global.tempUsers.find((u: any) => u.id === (req as any).userId);
    
    if (!user) {
      console.log('⚠️ Пользователь не найден, создаём нового');
      user = {
        id: (req as any).userId,
        email: (req as any).userEmail || 'user@example.com',
        name: ((req as any).userEmail || 'user@example.com').split('@')[0],
        avatar_url: ''
      };
      global.tempUsers.push(user);
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar_url = avatarUrl;
    
    console.log('✅ Avatar saved:', avatarUrl);
    console.log('✅ tempUsers now has', global.tempUsers.length, 'users');
    
    res.json({
      message: "Аватар загружен",
      avatar_url: avatarUrl,
      filename: req.file.filename
    });
    
  } catch (error: any) {
    console.error("❌ Avatar upload error:", error);
    res.status(500).json({ error: "Ошибка загрузки аватара", details: error.message });
  }
});

export default router;