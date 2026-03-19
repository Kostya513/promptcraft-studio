import { useState, useEffect } from "react";
import { Lock, Unlock, Shield, AlertCircle, Smartphone } from "lucide-react";
import { 
  deriveKey, 
  generateSalt, 
  hashPassword, 
  packEncrypted,
  encryptData,
  decryptData,
  unpackEncrypted
} from "@/utils/crypto.utils";
import { verifyTOTP } from "@/utils/totp.utils";
import { TwoFactorSetup } from "./TwoFactorSetup";

interface MasterPasswordModalProps {
  isOpen: boolean;
  onUnlock: (key: CryptoKey) => void;
  onSetup: (password: string) => void;
}

export function MasterPasswordModal({ isOpen, onUnlock, onSetup }: MasterPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"setup" | "unlock">("unlock");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [has2FA, setHas2FA] = useState(false);
  const [totpToken, setTotpToken] = useState("");
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [pendingKey, setPendingKey] = useState<CryptoKey | null>(null);
  const [pendingPassword, setPendingPassword] = useState("");

  useEffect(() => {
    const checkSetup = async () => {
      const stored = localStorage.getItem("master_password_hash");
      const totpSecret = localStorage.getItem("totp_secret");
      setIsSetup(!!stored);
      setHas2FA(!!totpSecret);
      setMode(stored ? "unlock" : "setup");
    };
    checkSetup();
  }, [isOpen]);

  const handleSetup = async () => {
    if (password.length < 8) {
      setError("Пароль должен быть не менее 8 символов");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);
      const packed = packEncrypted(salt, new Uint8Array(Buffer.from(hash, "base64")));
      
      localStorage.setItem("master_password_hash", packed);
      localStorage.setItem("master_password_salt", btoa(String.fromCharCode(...salt)));
      
      const key = await deriveKey(password, salt);
      setPendingKey(key);
      setPendingPassword(password);
      setShow2FASetup(true);
    } catch (err) {
      setError("Ошибка при установке пароля");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async () => {
    setIsLoading(true);
    setError("");

    try {
      const storedHash = localStorage.getItem("master_password_hash");
      const storedSalt = localStorage.getItem("master_password_salt");
      const totpSecret = localStorage.getItem("totp_secret");
      
      if (!storedHash || !storedSalt) {
        setError("Мастер-пароль не установлен");
        setMode("setup");
        return;
      }

      const salt = new Uint8Array(Buffer.from(storedSalt, "base64"));
      const inputHash = await hashPassword(password, salt);
      const inputPacked = packEncrypted(salt, new Uint8Array(Buffer.from(inputHash, "base64")));

      if (inputPacked !== storedHash) {
        setError("Неверный пароль");
        setIsLoading(false);
        return;
      }

      // Если включена 2FA - проверяем TOTP
      if (totpSecret) {
        if (!totpToken || totpToken.length !== 6) {
          setError("Введите код из аутентификатора");
          setIsLoading(false);
          return;
        }
        const isValid = await verifyTOTP(totpSecret, totpToken);
        if (!isValid) {
          setError("Неверный код 2FA");
          setIsLoading(false);
          return;
        }
      }

      const key = await deriveKey(password, salt);
      onUnlock(key);
    } catch (err) {
      setError("Ошибка при проверке пароля");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAEnabled = (secret: string) => {
    localStorage.setItem("totp_secret", secret);
    setHas2FA(true);
    // Завершаем установку мастер-пароля
    if (pendingKey && pendingPassword) {
      onSetup(pendingPassword);
      onUnlock(pendingKey);
      setPendingKey(null);
      setPendingPassword("");
    }
  };

  const handleDisable2FA = () => {
    localStorage.removeItem("totp_secret");
    setHas2FA(false);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              {mode === "setup" ? (
                <Shield className="h-6 w-6 text-primary" />
              ) : (
                <Lock className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {mode === "setup" ? "Установка мастер-пароля" : "Разблокировка"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "setup" 
                  ? "Защитите свои данные шифрованием" 
                  : "Введите пароль для доступа к данным"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Мастер-пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && (mode === "setup" ? handleSetup() : handleUnlock())}
              />
            </div>

            {mode === "setup" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && handleSetup()}
                />
              </div>
            )}

            {mode === "unlock" && has2FA && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Код из аутентификатора
                </label>
                <input
                  type="text"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono text-center tracking-widest"
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                />
              </div>
            )}

            <button
              onClick={mode === "setup" ? handleSetup : handleUnlock}
              disabled={isLoading || !password}
              className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Обработка...
                </>
              ) : mode === "setup" ? (
                <>
                  <Shield className="h-5 w-5" />
                  Установить пароль
                </>
              ) : (
                <>
                  <Unlock className="h-5 w-5" />
                  Разблокировать
                </>
              )}
            </button>

            {isSetup && mode === "unlock" && (
              <button
                onClick={() => setMode(mode === "setup" ? "unlock" : "setup")}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === "setup" ? "У меня уже есть пароль" : "Сбросить и установить новый"}
              </button>
            )}

            {isSetup && mode === "unlock" && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Двухфакторная аутентификация
                  </span>
                  {has2FA ? (
                    <button
                      onClick={handleDisable2FA}
                      className="text-xs text-destructive hover:underline"
                    >
                      Отключить
                    </button>
                  ) : (
                    <button
                      onClick={() => setShow2FASetup(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Включить
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {mode === "setup" && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <h3 className="text-sm font-semibold mb-2">Требования к паролю:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Минимум 8 символов</li>
                <li>• Используйте буквы, цифры, специальные символы</li>
                <li>• Не используйте простые пароли</li>
                <li>• Запомните пароль — его невозможно восстановить!</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      <TwoFactorSetup
        isOpen={show2FASetup}
        onClose={() => {
          setShow2FASetup(false);
          if (pendingKey && pendingPassword) {
            onSetup(pendingPassword);
            onUnlock(pendingKey);
            setPendingKey(null);
            setPendingPassword("");
          }
        }}
        onEnable={handle2FAEnabled}
      />
    </>
  );
}
