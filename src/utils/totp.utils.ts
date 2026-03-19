// src/utils/totp.utils.ts

const TOTP_INTERVAL = 30; // секунд
const TOTP_DIGITS = 6;

/**
 * Генерация секретного ключа для TOTP (Base32)
 */
export function generateTOTPSecret(length = 20): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < length; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

/**
 * Генерация QR-кода URL для добавления в аутентификатор
 */
export function getTOTPQRUrl(secret: string, accountName: string, issuer: string): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_INTERVAL}`;
}

/**
 * Проверка TOTP-кода
 * @param secret - секретный ключ (Base32)
 * @param token - код от пользователя (6 цифр)
 * @param window - допустимое отклонение по времени (в шагах)
 */
export async function verifyTOTP(secret: string, token: string, window = 1): Promise<boolean> {
  try {
    // Декодируем Base32 секрет
    const key = base32ToBytes(secret.toUpperCase());
    
    // Текущий временной шаг
    const now = Math.floor(Date.now() / 1000);
    const counter = Math.floor(now / TOTP_INTERVAL);
    
    // Проверяем текущий и соседние шаги (для компенсации рассинхрона)
    for (let i = -window; i <= window; i++) {
      const expected = await generateTOTP(key, counter + i);
      if (expected === token) return true;
    }
    return false;
  } catch (e) {
    console.error("TOTP verification error:", e);
    return false;
  }
}

/**
 * Генерация TOTP-кода (для тестирования)
 */
export async function generateTOTP(key: Uint8Array, counter: number): Promise<string> {
  const encoder = new TextEncoder();
  
  // Создаём 8-байтовый счётчик (big-endian)
  const counterBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }
  
  // HMAC-SHA1
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, counterBytes);
  const hmac = new Uint8Array(signature);
  
  // Dynamic truncation (RFC 4226)
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = 
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  
  const otp = code % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, "0");
}

/**
 * Декодирование Base32 в байты
 */
function base32ToBytes(base32: string): Uint8Array {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  
  for (const char of base32.replace(/=+$/, "")) {
    const index = chars.indexOf(char);
    if (index === -1) continue;
    bits += index.toString(2).padStart(5, "0");
  }
  
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }
  
  return bytes;
}

/**
 * Проверка поддержки Web Crypto API для TOTP
 */
export function isTOTPSupported(): boolean {
  return !!(crypto?.subtle?.importKey && crypto?.subtle?.sign);
}
