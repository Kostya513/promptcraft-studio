import { useState, useEffect } from "react";
import { Shield, Smartphone, Check, X, RefreshCw, AlertCircle } from "lucide-react";
import { 
  generateTOTPSecret, 
  getTOTPQRUrl, 
  verifyTOTP 
} from "@/utils/totp.utils";

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable: (secret: string) => void;
  userName?: string;
}

export function TwoFactorSetup({ isOpen, onClose, onEnable, userName = "user@promptcraft.ru" }: TwoFactorSetupProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [secret, setSecret] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && step === 1) {
      const newSecret = generateTOTPSecret();
      const url = getTOTPQRUrl(newSecret, userName, "PromptCraft Studio");
      setSecret(newSecret);
      setQrUrl(url);
    }
  }, [isOpen, step, userName]);

  const handleNext = () => {
    setStep(2);
  };

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError("Введите 6-значный код");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isValid = await verifyTOTP(secret, token);
      if (isValid) {
        setStep(3);
      } else {
        setError("Неверный код. Проверьте время на устройстве или попробуйте снова.");
      }
    } catch (err) {
      setError("Ошибка проверки кода");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = () => {
    onEnable(secret);
    onClose();
  };

  const handleRegenerate = () => {
    const newSecret = generateTOTPSecret();
    const url = getTOTPQRUrl(newSecret, userName, "PromptCraft Studio");
    setSecret(newSecret);
    setQrUrl(url);
    setError("");
    setToken("");
  };

  const handleClose = () => {
    setStep(1);
    setSecret("");
    setQrUrl("");
    setToken("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Двухфакторная аутентификация</h2>
              <p className="text-sm text-muted-foreground">
                Шаг {step} из 3
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: QR Code */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Установите приложение аутентификатор</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Скачайте Google Authenticator, Authy или любое другое приложение TOTP
              </p>
              
              <div className="flex justify-center p-6 bg-white rounded-xl mb-4">
                {/* QR Code placeholder - в реальности здесь будет QR код */}
                <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-16 w-16 text-primary" />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mb-4">
                Отсканируйте QR-код в приложении
              </p>

              {/* Manual entry */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Или введите ключ вручную:</p>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                  {secret}
                </code>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Продолжить
            </button>
          </div>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">2. Подтвердите настройку</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Введите 6-значный код из приложения аутентификатора
              </p>

              <div className="flex justify-center mb-4">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-48 px-4 py-3 text-center text-2xl font-mono rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              )}

              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Сгенерировать новый ключ
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Назад
              </button>
              <button
                onClick={handleVerify}
                disabled={isLoading || token.length !== 6}
                className="flex-1 py-3 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Подтвердить
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2FA успешно настроена!</h3>
              <p className="text-sm text-muted-foreground">
                Теперь при входе потребуется код из приложения аутентификатора
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-medium mb-2">Сохраните резервные коды</h4>
              <p className="text-xs text-muted-foreground mb-3">
                На случай потери доступа к приложению:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <code key={i} className="text-xs font-mono bg-background px-2 py-1 rounded text-center">
                    {Math.random().toString(36).slice(2, 8).toUpperCase()}
                  </code>
                ))}
              </div>
            </div>

            <button
              onClick={handleEnable}
              className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Готово
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
