// ============================================
// API CLIENT - СВЯЗЬ ФРОНТЕНДА С BACKEND
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Types ───
export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Prompt {
  id: number;
  user_id: number;
  text: string;
  model: string;
  quality: number;
  rating?: number;
  status: string;
  created_at: string;
}

// ─── Helper ───
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
}

// ─── Auth API ───
export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (result.token) {
    localStorage.setItem('auth_token', result.token);
  }
  
  return result;
}

export async function socialLogin(provider: string, email?: string): Promise<AuthResponse> {
  const result = await request('/auth/social-login', {
    method: 'POST',
    body: JSON.stringify({ provider, email }),
  });

  if (result.token) {
    localStorage.setItem('auth_token', result.token);
  }

  return result;
}

export async function logout(): Promise<void> {
  localStorage.removeItem('auth_token');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const result = await request('/auth/me');
    return result.user;
  } catch {
    return null;
  }
}

// ─── Prompts API ───
export async function getPrompts(): Promise<Prompt[]> {
  const result = await request('/prompts');
  return result.prompts || [];
}

export async function createPrompt(text: string, model: string, quality?: number): Promise<Prompt> {
  const result = await request('/prompts', {
    method: 'POST',
    body: JSON.stringify({ text, model, quality }),
  });
  return result.prompt;
}

export async function deletePrompt(id: number): Promise<void> {
  await request(`/prompts/${id}`, { method: 'DELETE' });
}

// ─── Users API ───
export async function getProfile(): Promise<User> {
  const result = await request('/users/profile');
  return result.user;
}

export async function updateProfile(data: { name?: string; avatar_url?: string }): Promise<User> {
  const result = await request('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return result.user;
}

// ─── Utility ───
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token');
}

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}
