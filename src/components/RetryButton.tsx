import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RetryButtonProps {
  onRetry: () => Promise<void>;
  maxAttempts?: number;
  className?: string;
  children?: React.ReactNode;
}

export function RetryButton({
  onRetry,
  maxAttempts = 3,
  className = "",
  children
}: RetryButtonProps) {
  const [attempt, setAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = async () => {
    if (attempt >= maxAttempts) {
      setError(`Превышено максимальное количество попыток (${maxAttempts})`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAttempt(prev => prev + 1);

    try {
      await onRetry();
      setAttempt(0); // Сбрасываем после успешной попытки
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleRetry}
        disabled={isLoading || attempt >= maxAttempts}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        {children || `Повторить (${attempt}/${maxAttempts})`}
      </Button>
      
      {error && (
        <p className="text-xs text-destructive mt-2">
          {error}
        </p>
      )}
      
      {attempt >= maxAttempts && (
        <p className="text-xs text-muted-foreground mt-2">
          Превышено количество попыток. Обновите страницу.
        </p>
      )}
    </div>
  );
}