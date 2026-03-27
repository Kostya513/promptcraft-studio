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
            setUser({
              ...defaultUser,
              id: apiUser.id,
              email: apiUser.email,
              name: apiUser.name || apiUser.email.split('@')[0],
              avatar: apiUser.avatar_url || "",
            });
            setIsLoggedIn(true);
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
    setUser((prev) => ({ 
      ...prev, 
      email,
      name: email.split('@')[0],
    }));
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
        setUser((prev) => ({
          ...prev,
          id: apiUser.id,
          name: apiUser.name || prev.name,
          avatar: apiUser.avatar_url || prev.avatar,
        }));
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
    setUser({ ...u, roleLabel: roleLabels[u.role] || u.role });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser: updateUser, isLoggedIn, login, logout, getInitial, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
