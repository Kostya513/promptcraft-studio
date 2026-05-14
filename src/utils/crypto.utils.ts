const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    } as any,
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string, key: CryptoKey, salt: Uint8Array): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const enc = new TextEncoder();
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: 128 },
    key,
    enc.encode(data)
  ) as ArrayBuffer;
  
  // Формат: [iv (12)][encrypted data] — БЕЗ СОЛИ!
  const result = new Uint8Array(IV_LENGTH + encrypted.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encrypted), IV_LENGTH);
  
  return result;
}

export async function decryptData(encryptedDataWithIv: Uint8Array, key: CryptoKey): Promise<string> {
  // Извлекаем IV (первые 12 байт) и данные
  const iv = encryptedDataWithIv.slice(0, IV_LENGTH);
  const data = encryptedDataWithIv.slice(IV_LENGTH);
  
  console.log('🔓 decryptData - iv:', iv, 'data length:', data.length);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv, tagLength: 128 },
    key,
    data
  ) as ArrayBuffer;
  
  const dec = new TextDecoder();
  return dec.decode(decrypted);
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

export async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt, iterations: ITERATIONS, hash: 'SHA-256' } as any,
    keyMaterial,
    256
  ) as ArrayBuffer;
  
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export function packEncrypted(salt: Uint8Array, encrypted: Uint8Array): string {
  // Формат: [salt (16)][iv+encrypted]
  const combined = new Uint8Array(salt.length + encrypted.length);
  combined.set(salt, 0);
  combined.set(encrypted, salt.length);
  return btoa(String.fromCharCode(...combined));
}

export function unpackEncrypted(packed: string): { salt: Uint8Array; data: Uint8Array } {
  const combined = Uint8Array.from(atob(packed), c => c.charCodeAt(0));
  const salt = combined.slice(0, SALT_LENGTH);
  const data = combined.slice(SALT_LENGTH);
  return { salt, data };
}

export function isCryptoSupported(): boolean {
  return !!(crypto?.subtle);
}