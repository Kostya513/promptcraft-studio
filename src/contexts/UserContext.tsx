import { createContext, useContext, useState, ReactNode } from "react";

export interface UserProfile {
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
  login: (email: string) => void;
  logout: () => void;
  getInitial: () => string;
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
  promptsCount: 4,
  purchasesCount: 3,
  servicesCount: 5,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (email: string) => {
    setUser((prev) => ({ ...prev, email }));
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(defaultUser);
  };

  const getInitial = () => {
    if (user.name) return user.name[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "?";
  };

  const updateUser = (u: UserProfile) => {
    setUser({ ...u, roleLabel: roleLabels[u.role] || u.role });
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser, isLoggedIn, login, logout, getInitial }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
