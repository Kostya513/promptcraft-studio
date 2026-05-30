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
// ─── Team API Types ───
export interface Team {
  id: string;
  name: string;
  slug: string;
  tier: 'startup' | 'business' | 'enterprise';
  createdAt: string;
  updatedAt: string;
  limits: {
    members: { used: number; max: number };
    assets: { used: number; max: number };
    tokens: { used: number; max: number };
    storage: { used: number; max: number };
  };
  subscription: { status: 'active' | 'past_due' | 'canceled'; nextBillingDate: string };
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'pending';
  joinedAt: string;
  spending: number;
}

export interface TeamFolder {
  id: string;
  name: string;
  parentId: string | null;
  itemCount: number;
  createdAt: string;
}

export interface TeamAsset {
  id: string;
  folderId: string;
  type: 'prompt' | 'skill' | 'file';
  title: string;
  description: string;
  tags: string[];
  status: 'draft' | 'review' | 'active';
  updatedAt: string;
  version: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  items: number;
  receiptUrl?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

// ─── Team API ───
export async function getTeam(): Promise<Team | null> {
  try {
    const result = await request('/team');
    return result.team;
  } catch {
    return null;
  }
}

export async function updateTeam(data: Partial<Team>): Promise<Team> {
  const result = await request('/team', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return result.team;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const result = await request('/team/members');
  return result.members || [];
}

export async function inviteMember(email: string, role: TeamMember['role']): Promise<TeamMember> {
  const result = await request('/team/members/invite', {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
  return result.member;
}

export async function updateMemberRole(memberId: string, role: TeamMember['role']): Promise<TeamMember> {
  const result = await request(`/team/members/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  return result.member;
}

export async function removeMember(memberId: string): Promise<void> {
  await request(`/team/members/${memberId}`, { method: 'DELETE' });
}

export async function getTeamFolders(): Promise<TeamFolder[]> {
  const result = await request('/team/library/folders');
  return result.folders || [];
}

export async function createFolder(name: string, parentId?: string): Promise<TeamFolder> {
  const result = await request('/team/library/folders', {
    method: 'POST',
    body: JSON.stringify({ name, parentId }),
  });
  return result.folder;
}

export async function renameFolder(folderId: string, name: string): Promise<TeamFolder> {
  const result = await request(`/team/library/folders/${folderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
  return result.folder;
}

export async function deleteFolder(folderId: string): Promise<void> {
  await request(`/team/library/folders/${folderId}`, { method: 'DELETE' });
}

export async function getTeamAssets(folderId?: string, type?: string, search?: string): Promise<TeamAsset[]> {
  const params = new URLSearchParams();
  if (folderId) params.append('folderId', folderId);
  if (type && type !== 'all') params.append('type', type);
  if (search) params.append('search', search);
  const result = await request(`/team/library/assets?${params}`);
  return result.assets || [];
}

export async function createAsset(data: Omit<TeamAsset, 'id' | 'updatedAt' | 'version'>): Promise<TeamAsset> {
  const result = await request('/team/library/assets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.asset;
}

export async function updateAsset(assetId: string, data: Partial<TeamAsset>): Promise<TeamAsset> {
  const result = await request(`/team/library/assets/${assetId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return result.asset;
}

export async function deleteAsset(assetId: string): Promise<void> {
  await request(`/team/library/assets/${assetId}`, { method: 'DELETE' });
}

export async function exportLibrary(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/team/library/export`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
  });
  return response.blob();
}

export async function getInvoices(): Promise<Invoice[]> {
  const result = await request('/team/billing/invoices');
  return result.invoices || [];
}

export async function getApiKeys(): Promise<ApiKey[]> {
  const result = await request('/team/settings/api-keys');
  return result.keys || [];
}

export async function createApiKey(name: string): Promise<{ key: string; apiKey: ApiKey }> {
  const result = await request('/team/settings/api-keys', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return result;
}

export async function revokeApiKey(keyId: string): Promise<void> {
  await request(`/team/settings/api-keys/${keyId}`, { method: 'DELETE' });
}

export async function updateWebhook(url: string): Promise<{ webhookUrl: string }> {
  const result = await request('/team/settings/webhook', {
    method: 'PUT',
    body: JSON.stringify({ url }),
  });
  return result;
}
