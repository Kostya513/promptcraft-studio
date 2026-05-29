// backend/src/controllers/postsController.ts
import { Request, Response } from 'express';
import * as PostModel from '../models/Post.js';
import path from 'path';
import fs from 'fs';

// Middleware для проверки авторизации
export const requireAuth = (req: Request, res: Response, next: () => void): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

// GET /api/posts - получить все посты
export const getPosts = (_req: Request, res: Response): void => {
  try {
    const posts = PostModel.getAllPosts();
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// POST /api/posts - создать пост
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, authorName, authorAvatar, authorVerified, authorId } = req.body;
    
    if (!content && !req.file) {
      res.status(400).json({ error: 'Content or media is required' });
      return;
    }

    // Обработка загруженных файлов
    let image: string | undefined;
    let video: string | undefined;
    
    if (req.file) {
      const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      const fileUrl = `/uploads/posts/${req.file.filename}`;
      if (fileType === 'video') {
        video = fileUrl;
      } else {
        image = fileUrl;
      }
    }

    const newPost = PostModel.createPost({
      authorId: authorId || 'demo_user',
      authorName: authorName || 'Вы',
      authorAvatar,
      authorVerified: authorVerified || false,
      title: title || '',
      content: content || '',
      image,
      video,
      isPinned: false
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// DELETE /api/posts/:id - удалить пост
export const deletePost = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const post = PostModel.getPostById(id);
    
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Удаляем файлы если есть
    if (post.image) {
      const imagePath = path.join(__dirname, '../../uploads/posts', path.basename(post.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    if (post.video) {
      const videoPath = path.join(__dirname, '../../uploads/posts', path.basename(post.video));
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    const deleted = PostModel.deletePost(id);
    if (!deleted) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// PUT /api/posts/:id/like - лайк поста
export const likePost = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const post = PostModel.incrementLike(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

// PUT /api/posts/:id/share - шеринг поста
export const sharePost = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const post = PostModel.incrementShare(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ error: 'Failed to share post' });
  }
};