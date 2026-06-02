import { PromptData } from "@/types/prompt";

const STORAGE_KEY = "promptcraft_autosave";
const PROMPTS_KEY = "promptcraft_prompts";
const MAX_AUTOSAVES = 10;

export interface AutoSaveData {
  promptId: string;
  data: PromptData;
  savedAt: number;
}

export function autoSave(prompt: PromptData): void {
  try {
    // 🔹 1. Сохраняем в autoSave (для визарда)
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
    
    // 🔹 2. 🔥 Сохраняем в основной список промтов (напрямую, без импорта)
    try {
      const promptsData = localStorage.getItem(PROMPTS_KEY);
      let prompts = promptsData ? JSON.parse(promptsData) : [];
      
      // Проверяем, есть ли уже такой промт
      const existingPromptIndex = prompts.findIndex((p: any) => p.id === prompt.id);
      
      const promptToSave = {
        id: prompt.id,
        text: prompt.text,
        model: prompt.model,
        quality: prompt.quality,
        rating: null,
        createdAt: prompt.createdAt,
        category: prompt.category,
      };
      
      if (existingPromptIndex >= 0) {
        prompts[existingPromptIndex] = { ...promptToSave, createdAt: prompts[existingPromptIndex].createdAt };
      } else {
        prompts.unshift(promptToSave);
      }
      
      localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
      console.log(`[AutoSave] Saved prompt ${prompt.id?.slice(0, 8) || 'unknown'} to both storages`);
    } catch (err) {
      console.error('[AutoSave] Failed to save to prompts:', err);
    }
    
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
    console.log(`[AutoSave] Cleared save for prompt ${promptId?.slice(0, 8) || 'unknown'}`);
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