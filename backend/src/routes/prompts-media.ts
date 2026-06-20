import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Настройка multer для загрузки медиа промтов (до 5MB)
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads/prompts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB лимит
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|webp|mp4|webm|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos (max 5MB) are allowed'));
    }
  }
});

// Загрузка одного файла
router.post('/upload', upload.single('media'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Файл не загружен' });
      return;
    }
    
    const fileUrl = `/uploads/prompts/${req.file.filename}`;
    
    console.log('✅ Media uploaded:', fileUrl, 'Size:', (req.file.size / 1024 / 1024).toFixed(2), 'MB');
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      size: req.file.size,
      name: req.file.originalname
    });
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Ошибка загрузки', details: error.message });
  }
});

// Загрузка нескольких файлов
router.post('/upload-multiple', upload.array('media', 10), (req: Request, res: Response): void => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'Файлы не загружены' });
      return;
    }
    
    const uploadedFiles = files.map(file => ({
      url: `/uploads/prompts/${file.filename}`,
      filename: file.filename,
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
      size: file.size,
      name: file.originalname
    }));
    
    console.log('✅ Multiple media uploaded:', uploadedFiles.length, 'files');
    
    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Ошибка загрузки', details: error.message });
  }
});

export default router;