// ============================================
// ЭКСПОРТ/ИМПОРТ ДАННЫХ (JSON РЕЗЕРВНОЕ КОПИРОВАНИЕ)
// ============================================

import { 
  getPrompts, getDrafts, getFavorites, getHistory,
  StoredPrompt, HistoryItem 
} from "./local-storage";

// ─── Types ───
export interface BackupData {
  version: string;
  exportedAt: number;
  prompts: StoredPrompt[];
  drafts: StoredPrompt[];
  favorites: StoredPrompt[];
  history: HistoryItem[];
  settings: Record<string, unknown>;
}

// ─── ЭКСПОРТ ───
export function exportAllData(): BackupData {
  const data: BackupData = {
    version: "1.0",
    exportedAt: Date.now(),
    prompts: getPrompts(),
    drafts: getDrafts(),
    favorites: getFavorites(),
    history: getHistory(),
    settings: JSON.parse(localStorage.getItem("promptcraft_settings") || "{}"),
  };
  
  return data;
}

export function downloadBackup(filename?: string): void {
  const data = exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = filename || `promptcraft-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToClipboard(): Promise<void> {
  const data = exportAllData();
  return navigator.clipboard.writeText(JSON.stringify(data, null, 2));
}

// ─── ИМПОРТ ───
export async function importBackupData(jsonString: string): Promise<{
  success: boolean;
  error?: string;
  stats?: Record<string, number>;
}> {
  try {
    const data: BackupData = JSON.parse(jsonString);
    
    // Валидация структуры
    if (!data.version || !data.exportedAt) {
      return { success: false, error: "Неверный формат файла резервной копии" };
    }
    
    // Восстановление данных
    if (data.prompts) {
      localStorage.setItem("promptcraft_prompts", JSON.stringify(data.prompts));
    }
    if (data.drafts) {
      localStorage.setItem("promptcraft_drafts", JSON.stringify(data.drafts));
    }
    if (data.favorites) {
      localStorage.setItem("promptcraft_favorites", JSON.stringify(data.favorites));
    }
    if (data.history) {
      localStorage.setItem("promptcraft_history", JSON.stringify(data.history));
    }
    if (data.settings) {
      localStorage.setItem("promptcraft_settings", JSON.stringify(data.settings));
    }
    
    return {
      success: true,
      stats: {
        prompts: data.prompts?.length || 0,
        drafts: data.drafts?.length || 0,
        favorites: data.favorites?.length || 0,
        history: data.history?.length || 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ошибка при импорте данных",
    };
  }
}

export async function importBackupFile(file: File): Promise<{
  success: boolean;
  error?: string;
  stats?: Record<string, number>;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const result = await importBackupData(content);
      resolve(result);
    };
    
    reader.onerror = () => {
      resolve({ success: false, error: "Ошибка чтения файла" });
    };
    
    reader.readAsText(file);
  });
}

// ─── ОЧИСТКА ───
export function clearAllData(): void {
  localStorage.removeItem("promptcraft_prompts");
  localStorage.removeItem("promptcraft_drafts");
  localStorage.removeItem("promptcraft_favorites");
  localStorage.removeItem("promptcraft_history");
  localStorage.removeItem("promptcraft_settings");
}

// ─── СТАТИСТИКА ───
export function getBackupStats(): Record<string, number> {
  return {
    prompts: getPrompts().length,
    drafts: getDrafts().length,
    favorites: getFavorites().length,
    history: getHistory().length,
    totalSize: new Blob([JSON.stringify(exportAllData())]).size,
  };
}
