import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Путь к файлу пользователей
const USERS_FILE = path.join(__dirname, '../../users.json');

// Загрузка пользователей из файла
const loadUsers = (): any[] => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users in auth:', error);
  }
  return [];
};

// Сохранение пользователей в файл
const saveUsers = (users: any[]): void => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving users in auth:', error);
  }
};

export function findOrCreateSocialUser(userEmail: string, provider: string) {
  let users = loadUsers();
  let user = users.find((u) => u.email === userEmail);
  
  if (!user) {
    user = {
      id: Date.now(),
      email: userEmail,
      name: (userEmail || provider).split('@')[0],
      avatar_url: null,
      provider,
      role: 'business',
      created_at: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
  }
  
  return user;
}

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email и пароль обязательны" });
      return;
    }
    
    let users = loadUsers();
    const existing = users.find(u => u.email === email);
    
    if (existing) {
      res.status(409).json({ error: "Email уже зарегистрирован" });
      return;
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user: any = { 
      id: Date.now(), 
      email, 
      name: name || email.split("@")[0], 
      password_hash: passwordHash, 
      avatar_url: '',
      created_at: new Date().toISOString() 
    };
    
    users.push(user);
    saveUsers(users);
    
    const token = jwt.sign(
      { userId: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN } as any
    );
    
    console.log("✅ User registered:", email);
    res.status(201).json({ 
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url || "" }, 
      token 
    });
  } catch (error: any) {
    console.error("❌ Register error:", error.message);
    res.status(500).json({ error: "Ошибка регистрации", details: error.message });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email и пароль обязательны" });
      return;
    }
    
    let users = loadUsers();
    let user: any = users.find(u => u.email === email);
    
    if (!user) {
      // Создаём нового пользователя если не найден
      const passwordHash = await bcrypt.hash(password, 10);
      user = { 
        id: Date.now(), 
        email, 
        name: email.split("@")[0], 
        password_hash: passwordHash, 
        avatar_url: '',
        created_at: new Date().toISOString() 
      };
      users.push(user);
      saveUsers(users);
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN } as any
    );
    
    console.log("✅ User logged in:", email);
    res.json({ 
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url || "" }, 
      token 
    });
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ error: "Ошибка входа", details: error.message });
  }
});

// Social login
router.post("/social-login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider, email } = req.body;
    if (!provider) {
      res.status(400).json({ error: "Provider обязателен" });
      return;
    }

    const userEmail = email || `${provider}@example.com`;
    let users = loadUsers();
    let user: any = users.find((u) => u.email === userEmail);
    
    if (!user) {
      user = {
        id: Date.now(),
        email: userEmail,
        name: (userEmail || provider).split("@")[0],
        avatar_url: null,
        provider,
        role: "business",
        created_at: new Date().toISOString(),
      };
      users.push(user);
      saveUsers(users);
    }

    const payload = {
      userId: user.id,
      email: user.email,
      provider,
      role: user.role || "business",
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);

    console.log(`[SOCIAL LOGIN] user=${user.email} provider=${provider}`);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url, role: user.role } });
  } catch (error: any) {
    console.error("❌ Social login error:", error.message);
    res.status(500).json({ error: "Ошибка социальной авторизации", details: error.message });
  }
});

router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Токен не предоставлен" });
      return;
    }
    
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const users = loadUsers();
    const user = users.find((u: any) => u.id === decoded.userId);
    
    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }
    
    // ✅ Возвращаем avatar_url из файла!
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url || "" } });
  } catch (error: any) {
    res.status(401).json({ error: "Неверный токен", details: error.message });
  }
});

export default router;