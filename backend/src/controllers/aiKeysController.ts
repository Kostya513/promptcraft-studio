import { Request, Response } from 'express';
import * as UserAIKeys from '../models/UserAIKeys.js';
import { aiProviderRegistry } from '../services/ai-providers/index.js';

const getUserIdFromToken = (req: Request): number => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return 1;
  const token = authHeader.split(' ')[1];
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || payload.id || 1;
  } catch {
    return 1;
  }
};

export const getProviders = (_req: Request, res: Response): void => {
  try {
    const providers = aiProviderRegistry.getSupportedProviders();
    res.json({ success: true, data: providers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserKeys = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    const keys = await UserAIKeys.getUserAIKeys(userId);
    const maskedKeys = keys.map(k => ({
      ...k,
      api_key: '••••' + k.api_key.slice(-4),
      config: k.config
    }));
    res.json({ success: true, data: maskedKeys });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const saveKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    const { providerId, apiKey, config, isDefault } = req.body;
    
    if (!providerId || !apiKey) {
      res.status(400).json({ error: 'providerId и apiKey обязательны' });
      return;
    }
    
    const provider = aiProviderRegistry.get(providerId);
    if (!provider) {
      res.status(400).json({ error: `Провайдер "${providerId}" не поддерживается` });
      return;
    }
    
    const saved = await UserAIKeys.saveUserAIKey({
      user_id: userId,
      provider_id: providerId,
      api_key: apiKey,
      config: config || {},
      is_default: isDefault || false
    });
    
    if (isDefault) {
      await UserAIKeys.setDefaultAIKey(userId, providerId);
    }
    
    res.json({ success: true, data: { ...saved, api_key: '••••' + apiKey.slice(-4) } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    const { providerId } = req.params;
    const deleted = await UserAIKeys.deleteUserAIKey(userId, providerId);
    if (!deleted) {
      res.status(404).json({ error: 'Ключ не найден' });
      return;
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const testKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    const { providerId } = req.params;
    const key = await UserAIKeys.getUserAIKey(userId, providerId);
    if (!key) {
      res.status(404).json({ error: 'Ключ не найден' });
      return;
    }
    const provider = aiProviderRegistry.get(providerId);
    if (!provider) {
      res.status(400).json({ error: 'Провайдер не поддерживается' });
      return;
    }
    const isConnected = await provider.testConnection({ apiKey: key.api_key, ...key.config });
    res.json({ success: isConnected });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const setDefault = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    const { providerId } = req.params;
    await UserAIKeys.setDefaultAIKey(userId, providerId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};