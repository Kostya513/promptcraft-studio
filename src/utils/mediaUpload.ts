const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BACKEND_BASE_URL = 'http://localhost:3000'; // 🔹 Базовый URL backend

export interface UploadedMedia {
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
}

// Загрузка одного файла на сервер
export const uploadMedia = async (file: File): Promise<UploadedMedia> => {
  const formData = new FormData();
  formData.append('media', file);
  
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}/prompts/media/upload`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка загрузки');
  }
  
  const data = await response.json();
  
  // 🔹 ПРЕОБРАЗУЕМ ОТНОСИТЕЛЬНЫЙ URL В ПОЛНЫЙ
  const fullUrl = data.url.startsWith('http') 
    ? data.url 
    : `${BACKEND_BASE_URL}${data.url}`;
  
  return {
    url: fullUrl, // ✅ Полный URL: http://localhost:3000/uploads/prompts/...
    type: data.type,
    name: data.name || file.name,
    size: data.size
  };
};

// Проверка размера файла (до 5MB)
export const checkFileSize = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert(`❌ Файл ${file.name} слишком большой (макс 5MB). Ваш файл: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    return false;
  }
  return true;
};