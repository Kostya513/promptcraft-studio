import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🔴 ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Вызываем кастомный обработчик если есть
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Логируем в сервис мониторинга (в будущем)
    // await fetch('/api/log-error', { method: 'POST', body: JSON.stringify({ error, errorInfo }) });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Используем кастомный fallback если предоставлен
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Дефолтный UI ошибки
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card rounded-2xl border border-border p-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Что-то пошло не так
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться позже.
              </p>
              
              {this.state.error && (
                <details className="text-left mb-4">
                  <summary className="text-xs text-muted-foreground cursor-pointer mb-2">
                    Технические детали
                  </summary>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Попробовать снова
              </Button>
              <Button
                onClick={this.handleReload}
                className="flex-1 gradient-primary"
              >
                Перезагрузить
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}