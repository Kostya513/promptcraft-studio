import { PromptData } from "@/types/prompt";

const STORAGE_KEY = "promptcraft_autosave";
const MAX_AUTOSAVES = 10;

export interface AutoSaveData {
  promptId: string;
  data: PromptData;
  savedAt: number;
}

export function autoSave(prompt: PromptData): void {
  try {
    const saves = getAutoSaves();
    const existingIndex = saves.findIndex(s => s.promptId === prompt.id);
    
    const saveData: AutoSaveData = {
      promptId: prompt.id,
      data: prompt,
      savedAt: Date.now(),
    };
    
    if (existingIndex >= 0) {
      saves[existingIndex] = saveData;
    } else {
      saves.unshift(saveData);
      if (saves.length > MAX_AUTOSAVES) {
        saves.pop();
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
    console.log(`[AutoSave] Saved prompt ${prompt.id.slice(0, 8)}`);
  } catch (error) {
    console.error("[AutoSave] Failed to save:", error);
  }
}

export function getAutoSaves(): AutoSaveData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("[AutoSave] Failed to load saves:", error);
    return [];
  }
}

export function getAutoSave(promptId: string): PromptData | null {
  try {
    const saves = getAutoSaves();
    const save = saves.find(s => s.promptId === promptId);
    return save ? save.data : null;
  } catch (error) {
    console.error("[AutoSave] Failed to get save:", error);
    return null;
  }
}

export function clearAutoSave(promptId: string): void {
  try {
    const saves = getAutoSaves();
    const filtered = saves.filter(s => s.promptId !== promptId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log(`[AutoSave] Cleared save for prompt ${promptId.slice(0, 8)}`);
  } catch (error) {
    console.error("[AutoSave] Failed to clear save:", error);
  }
}

export function clearAllAutoSaves(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("[AutoSave] Cleared all saves");
  } catch (error) {
    console.error("[AutoSave] Failed to clear all saves:", error);
  }
}

export function getAutoSaveCount(): number {
  return getAutoSaves().length;
}

export function cleanupOldAutoSaves(maxAgeHours: number = 24): void {
  try {
    const saves = getAutoSaves();
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    
    const filtered = saves.filter(s => now - s.savedAt < maxAge);
    
    if (filtered.length !== saves.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log(`[AutoSave] Cleaned up ${saves.length - filtered.length} old saves`);
    }
  } catch (error) {
    console.error("[AutoSave] Failed to cleanup:", error);
  }
}