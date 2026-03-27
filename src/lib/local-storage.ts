// ============================================
// LOCAL STORAGE - ХРАНЕНИЕ ДАННЫХ В БРАУЗЕРЕ
// ============================================

const STORAGE_KEYS = {
  PROMPTS: 'promptcraft_prompts',
  HISTORY: 'promptcraft_history',
  FAVORITES: 'promptcraft_favorites',
  DRAFTS: 'promptcraft_drafts',
  SETTINGS: 'promptcraft_settings',
};

// ─── Types ───
export interface StoredPrompt {
  id: string;
  text: string;
  model: string;
  quality: number;
  rating: number | null;
  createdAt: number;
  category?: string;
}

export interface HistoryItem {
  id: string;
  input: string;
  output: string[];
  timestamp: number;
  model: string;
}

// ─── Prompts ───
export function savePrompt(prompt: StoredPrompt): void {
  try {
    const prompts = getPrompts();
    const existingIndex = prompts.findIndex(p => p.id === prompt.id);
    
    if (existingIndex >= 0) {
      prompts[existingIndex] = { ...prompt, createdAt: prompts[existingIndex].createdAt };
    } else {
      prompts.unshift({ ...prompt, createdAt: Date.now() });
    }
    
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
  } catch (error) {
    console.error('Failed to save prompt:', error);
  }
}

export function getPrompts(): StoredPrompt[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get prompts:', error);
    return [];
  }
}

export function getPromptById(id: string): StoredPrompt | null {
  try {
    const prompts = getPrompts();
    return prompts.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Failed to get prompt by id:', error);
    return null;
  }
}

export function deletePrompt(id: string): void {
  try {
    const prompts = getPrompts();
    const filtered = prompts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete prompt:', error);
  }
}

export function updatePromptRating(id: string, rating: number): void {
  try {
    const prompts = getPrompts();
    const index = prompts.findIndex(p => p.id === id);
    
    if (index >= 0) {
      prompts[index].rating = rating;
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
    }
  } catch (error) {
    console.error('Failed to update prompt rating:', error);
  }
}

// ─── Favorites ──
export function addToFavorites(prompt: StoredPrompt): void {
  try {
    const favorites = getFavorites();
    if (!favorites.find(p => p.id === prompt.id)) {
      favorites.unshift({ ...prompt, createdAt: Date.now() });
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Failed to add to favorites:', error);
  }
}

export function getFavorites(): StoredPrompt[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get favorites:', error);
    return [];
  }
}

export function removeFromFavorites(id: string): void {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from favorites:', error);
  }
}

// ─── Drafts ───
export function saveToDrafts(prompt: StoredPrompt): void {
  try {
    const drafts = getDrafts();
    const existingIndex = drafts.findIndex(p => p.id === prompt.id);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = { ...prompt, createdAt: drafts[existingIndex].createdAt };
    } else {
      drafts.unshift({ ...prompt, createdAt: Date.now() });
    }
    
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
  } catch (error) {
    console.error('Failed to save to drafts:', error);
  }
}

export function getDrafts(): StoredPrompt[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DRAFTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get drafts:', error);
    return [];
  }
}

export function deleteDraft(id: string): void {
  try {
    const drafts = getDrafts();
    const filtered = drafts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete draft:', error);
  }
}

// ─── History ───
export function addToHistory(input: string, output: string[], model: string): void {
  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      input,
      output,
      timestamp: Date.now(),
      model,
    };
    
    history.unshift(newItem);
    
    // Храним только последние 50 записей
    const trimmed = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to add to history:', error);
  }
}

export function getHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

// ─── Settings ───
export function saveSettings(settings: Record<string, unknown>): void {
  try {
    const existing = getSettings();
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...existing, ...settings }));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function getSettings(): Record<string, unknown> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to get settings:', error);
    return {};
  }
}

// ─── Utility ───
export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear all storage:', error);
  }
}

export function getStorageStats(): Record<string, number> {
  try {
    return {
      prompts: getPrompts().length,
      favorites: getFavorites().length,
      drafts: getDrafts().length,
      history: getHistory().length,
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {};
  }
}
