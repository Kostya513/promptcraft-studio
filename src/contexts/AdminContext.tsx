import React, { createContext, useContext, useState, useCallback } from "react";

export type AdminRole = "super_admin" | "moderator" | "finance_manager" | "support_operator" | "content_manager";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  adminUser: string;
  actionType: string;
  affectedEntity: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  loginAttempts: number;
  isLocked: boolean;
  auditLog: AuditEntry[];
  login: (email: string, password: string, twoFactorCode: string) => boolean;
  logout: () => void;
  hasPermission: (section: string) => boolean;
  logAction: (actionType: string, affectedEntity: string, entityId: string, oldValue?: string, newValue?: string) => void;
}

const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ["dashboard", "users", "moderation", "finances", "tickets", "notifications", "settings", "audit", "analytics"],
  moderator: ["dashboard", "moderation", "users", "tickets"],
  finance_manager: ["dashboard", "finances"],
  support_operator: ["dashboard", "tickets", "users", "notifications"],
  content_manager: ["dashboard", "moderation", "notifications", "settings"],
};

const ADMIN_WHITELIST = [
  { email: "admin@prompt-studiya.ru", password: "admin123", role: "super_admin" as AdminRole, name: "Super Admin" },
  { email: "mod@prompt-studiya.ru", password: "mod123", role: "moderator" as AdminRole, name: "Moderator" },
  { email: "finance@prompt-studiya.ru", password: "fin123", role: "finance_manager" as AdminRole, name: "Finance Manager" },
  { email: "support@prompt-studiya.ru", password: "sup123", role: "support_operator" as AdminRole, name: "Support Operator" },
  { email: "content@prompt-studiya.ru", password: "cnt123", role: "content_manager" as AdminRole, name: "Content Manager" },
];

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  const logAction = useCallback((actionType: string, affectedEntity: string, entityId: string, oldValue?: string, newValue?: string) => {
    setAuditLog(prev => [{
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      adminUser: adminUser?.email || "system",
      actionType,
      affectedEntity,
      entityId,
      oldValue,
      newValue,
      ipAddress: "127.0.0.1",
    }, ...prev]);
  }, [adminUser]);

  const login = useCallback((email: string, password: string, twoFactorCode: string) => {
    if (isLocked) return false;
    
    const found = ADMIN_WHITELIST.find(a => a.email === email && a.password === password);
    if (found && twoFactorCode.length === 6) {
      setAdminUser({
        id: crypto.randomUUID(),
        email: found.email,
        name: found.name,
        role: found.role,
        lastLogin: new Date().toISOString(),
        twoFactorEnabled: true,
      });
      setLoginAttempts(0);
      logAction("login", "admin_user", found.email);
      return true;
    }
    
    const attempts = loginAttempts + 1;
    setLoginAttempts(attempts);
    if (attempts >= 5) setIsLocked(true);
    return false;
  }, [isLocked, loginAttempts, logAction]);

  const logout = useCallback(() => {
    logAction("logout", "admin_user", adminUser?.email || "");
    setAdminUser(null);
  }, [adminUser, logAction]);

  const hasPermission = useCallback((section: string) => {
    if (!adminUser) return false;
    return ROLE_PERMISSIONS[adminUser.role]?.includes(section) || false;
  }, [adminUser]);

  return (
    <AdminContext.Provider value={{
      adminUser,
      isAuthenticated: !!adminUser,
      loginAttempts,
      isLocked,
      auditLog,
      login,
      logout,
      hasPermission,
      logAction,
    }}>
      {children}
    </AdminContext.Provider>
  );
};
