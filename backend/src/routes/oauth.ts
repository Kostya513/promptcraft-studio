import { Router, Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findOrCreateSocialUser } from './auth.js';

dotenv.config();

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// VK OAuth
router.get('/vk', (req: Request, res: Response) => {
  const vkClientId = process.env.VK_APP_ID || 'demo';
  const redirectUri = encodeURIComponent(`${FRONTEND_URL}/auth/vk/callback`);
  const authUrl = `https://oauth.vk.com/authorize?client_id=${vkClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email`;
  
  // Если демо режим - сразу редирект
  if (vkClientId === 'demo') {
    const userEmail = 'vk@demo.com';
    const user = findOrCreateSocialUser(userEmail, 'vk');
    const token = jwt.sign({ userId: user.id, email: user.email, provider: 'vk', role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.redirect(`${FRONTEND_URL}/login?token=${token}&provider=vk`);
  }

  res.redirect(authUrl);
});

// VK Callback
router.get('/vk/callback', async (req: Request, res: Response) => {
  const { code, token } = req.query;
  
  // Если демо токен
  if (token && typeof token === 'string') {
    return res.redirect(`${FRONTEND_URL}/login?token=${token}&provider=vk`);
  }
  
  try {
    // Обмен кода на токен
    const tokenResponse = await axios.post('https://oauth.vk.com/access_token', null, {
      params: {
        client_id: process.env.VK_APP_ID,
        client_secret: process.env.VK_APP_SECRET,
        redirect_uri: `${FRONTEND_URL}/auth/vk/callback`,
        code: code
      }
    });
    
    const accessToken = tokenResponse.data.access_token;
    const userId = tokenResponse.data.user_id;
    
    // Получить инфо пользователя
    const userResponse = await axios.get('https://api.vk.com/method/users.get', {
      params: {
        user_ids: userId,
        fields: 'photo_100,email',
        access_token: accessToken,
        v: '5.131'
      }
    });
    
    const vkUser = userResponse.data.response[0];
    
    // Создать JWT для нашего приложения
    const userEmail = vkUser.email || `vk_${userId}@vk.com`;
    const user = findOrCreateSocialUser(userEmail, 'vk');
    const appToken = jwt.sign({ userId: user.id, email: user.email, provider: 'vk', role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${FRONTEND_URL}/login?token=${appToken}&provider=vk`);
  } catch (error) {
    console.error('VK OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=vk_auth_failed`);
  }
});

// Yandex OAuth
router.get('/yandex', (req: Request, res: Response) => {
  const yandexClientId = process.env.YANDEX_CLIENT_ID || 'demo';
  const redirectUri = encodeURIComponent(`${FRONTEND_URL}/auth/yandex/callback`);
  const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${yandexClientId}&redirect_uri=${redirectUri}`;
  
  if (yandexClientId === 'demo') {
    const userEmail = 'yandex@demo.com';
    const user = findOrCreateSocialUser(userEmail, 'yandex');
    const token = jwt.sign({ userId: user.id, email: user.email, provider: 'yandex', role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.redirect(`${FRONTEND_URL}/login?token=${token}&provider=yandex`);
  }

  res.redirect(authUrl);
});

// Yandex Callback
router.get('/yandex/callback', async (req: Request, res: Response) => {
  const { code, token } = req.query;
  
  if (token && typeof token === 'string') {
    return res.redirect(`${FRONTEND_URL}/login?token=${token}&provider=yandex`);
  }
  
  try {
    const tokenResponse = await axios.post('https://oauth.yandex.ru/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.YANDEX_CLIENT_ID,
        client_secret: process.env.YANDEX_CLIENT_SECRET
      }
    });
    
    const accessToken = tokenResponse.data.access_token;
    
    const userResponse = await axios.get('https://login.yandex.ru/info', {
      headers: { Authorization: `OAuth ${accessToken}` }
    });
    
    const yandexUser = userResponse.data;
    
    const userEmail = yandexUser.default_email || `yandex_${yandexUser.id}@yandex.ru`;
    const user = findOrCreateSocialUser(userEmail, 'yandex');
    const appToken = jwt.sign({ userId: user.id, email: user.email, provider: 'yandex', role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${FRONTEND_URL}/login?token=${appToken}&provider=yandex`);
  } catch (error) {
    console.error('Yandex OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=yandex_auth_failed`);
  }
});

// Google OAuth
router.get('/google', (req: Request, res: Response) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || 'demo';
  const redirectUri = encodeURIComponent(`${FRONTEND_URL}/auth/google/callback`);
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
  
  if (googleClientId === 'demo') {
    const userEmail = 'google@demo.com';
    const user = findOrCreateSocialUser(userEmail, 'google');
    const token = jwt.sign({ userId: user.id, email: user.email, provider: 'google', role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.redirect(`${FRONTEND_URL}/login?token=${token}&provider=google`);
  }

  res.redirect(authUrl);
});

// Google Callback
router.get('/google/callback', async (req: Request, res: Response) => {
  const { code, token } = req.query;
  
  if (token && typeof token === 'string') {
    return res.redirect(`${FRONTEND_URL}/login?token=${token}&provider=google`);
  }
  
  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${FRONTEND_URL}/auth/google/callback`,
        grant_type: 'authorization_code'
      }
    });
    
    const accessToken = tokenResponse.data.access_token;
    
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const googleUser = userResponse.data;
    
    const userEmail = googleUser.email;
    const user = findOrCreateSocialUser(userEmail, 'google');
    const appToken = jwt.sign({ userId: user.id, email: user.email, provider: 'google', role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${FRONTEND_URL}/login?token=${appToken}&provider=google`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
});

export default router;
