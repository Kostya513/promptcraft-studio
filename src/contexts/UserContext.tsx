import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, logout as apiLogout, getToken } from "@/lib/api-client";

export interface UserProfile {
  id?: number;
  email: string;
  name: string;
  role: "business" | "creative" | "dev";
  roleLabel: string;
  bio: string;
  avatar: string;
  language: string;
  timezone: string;
  promptsCount: number;
  purchasesCount: number;
  servicesCount: number;
}

interface UserContextType {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, token: string) => void;
  logout: () => Promise<void>;
  getInitial: () => string;
  refreshUser: () => Promise<void>;
}

const roleLabels: Record<string, string> = {
  business: "Бизнес",
  creative: "Создатель контента",
  dev: "Разработчик",
};

const defaultUser: UserProfile = {
  email: "user@example.com",
  name: "",
  role: "business",
  roleLabel: "Бизнес",
  bio: "",
  avatar: "",
  language: "Русский",
  timezone: "Europe/Moscow",
  promptsCount: 0,
  purchasesCount: 0,
  servicesCount: 0,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// 🔹 СИНХРОНИЗАЦИЯ АВТАРКИ В LOCALSTORAGE
const syncUserToStorage = (userData: UserProfile) => {
  try {
    const users = JSON.parse(localStorage.getItem("promptcraft_users") || "[]");
    const existingIndex = users.findIndex((u: any) => u.email === userData.email);
    
    const userDataToSave = {
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      avatar_url: userData.avatar,
    };
    
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userDataToSave };
    } else {
      users.push(userDataToSave);
    }
    
    localStorage.setItem("promptcraft_users", JSON.stringify(users));
    console.log("✅ User synced to storage:", userData.email, "Avatar:", userData.avatar);
  } catch (e) {
    console.error("Error saving user to storage:", e);
  }
};

// 🔹 ЗАГРУЗКА АВТАРКИ ИЗ LOCALSTORAGE
const loadAvatarFromStorage = (email: string): string => {
  try {
    const users = JSON.parse(localStorage.getItem("promptcraft_users") || "[]");
    const user = users.find((u: any) => u.email === email);
    const avatar = user?.avatar || user?.avatar_url || "";
    console.log("📥 Loaded avatar from storage for", email, ":", avatar);
    return avatar;
  } catch (e) {
    console.error("Error loading avatar from storage:", e);
    return "";
  }
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка сессии при загрузке
  useEffect(() => {
    const token = getToken();
    if (token) {
      getCurrentUser()
        .then((apiUser) => {
          if (apiUser) {
            // 🔹 Сначала загружаем аватарку из localStorage
            const savedAvatar = loadAvatarFromStorage(apiUser.email);
            
            const userData = {
              ...defaultUser,
              id: apiUser.id,
              email: apiUser.email,
              name: apiUser.name || apiUser.email.split('@')[0],
              avatar: savedAvatar || apiUser.avatar_url || "",
            };
            setUser(userData);
            setIsLoggedIn(true);
            
            // Если аватарки не было в storage - сохраняем
            if (!savedAvatar && apiUser.avatar_url) {
              syncUserToStorage(userData);
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          setIsLoggedIn(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, token: string) => {
    localStorage.setItem('auth_token', token);
    
    // 🔹 Проверяем есть ли аватарка в storage
    const savedAvatar = loadAvatarFromStorage(email);
    
    const userData = {
      ...defaultUser,
      email,
      name: email.split('@')[0],
      avatar: savedAvatar,
    };
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await apiLogout();
    setIsLoggedIn(false);
    setUser(defaultUser);
  };

  const refreshUser = async () => {
    try {
      const apiUser = await getCurrentUser();
      if (apiUser) {
        const savedAvatar = loadAvatarFromStorage(apiUser.email);
        const userData = {
          ...user,
          id: apiUser.id,
          name: apiUser.name || user.name,
          avatar: savedAvatar || apiUser.avatar_url || user.avatar,
        };
        setUser(userData);
        if (!savedAvatar && apiUser.avatar_url) {
          syncUserToStorage(userData);
        }
      }
    } catch {
      // Игнорируем ошибки
    }
  };

  const getInitial = () => {
    if (user.name) return user.name[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "?";
  };

  const updateUser = (u: UserProfile) => {
    const updatedUser = { ...u, roleLabel: roleLabels[u.role] || u.role };
    setUser(updatedUser);
    syncUserToStorage(updatedUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser, isLoggedIn, isLoading, login, logout, getInitial, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}