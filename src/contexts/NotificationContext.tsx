import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface Notification {
  id: string;
  type: "financial" | "security" | "content" | "social" | "system" | "marketing";
  title: string;
  text: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

interface NotificationSettings {
  channels: { email: boolean; push: boolean; telegram: boolean; sms: boolean };
  events: Record<string, boolean>;
  dndEnabled: boolean;
  dndFrom: string;
  dndTo: string;
  digestFrequency: "daily" | "weekly" | "never";
  language: "ru" | "en";
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  addNotification: (n: Omit<Notification, "id">) => void;
  settings: NotificationSettings;
  updateSettings: (s: Partial<NotificationSettings>) => void;
  updateChannels: (channels: Partial<NotificationSettings["channels"]>) => void;
  updateEvent: (key: string, enabled: boolean) => void;
}

const defaultNotifications: Notification[] = [];

const defaultSettings: NotificationSettings = {
  channels: { email: true, push: true, telegram: false, sms: false },
  events: { financial: true, security: true, content: true, social: true, system: true, marketing: false },
  dndEnabled: false,
  dndFrom: "22:00",
  dndTo: "08:00",
  digestFrequency: "daily",
  language: "ru",
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const addNotification = useCallback((n: Omit<Notification, "id">) => {
    setNotifications(prev => [{ ...n, id: `n${Date.now()}` }, ...prev]);
  }, []);

  const updateSettings = useCallback((s: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  }, []);

  const updateChannels = useCallback((channels: Partial<NotificationSettings["channels"]>) => {
    setSettings(prev => ({ ...prev, channels: { ...prev.channels, ...channels } }));
  }, []);

  const updateEvent = useCallback((key: string, enabled: boolean) => {
    setSettings(prev => ({ ...prev, events: { ...prev.events, [key]: enabled } }));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, clearAll, addNotification, settings, updateSettings, updateChannels, updateEvent }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
