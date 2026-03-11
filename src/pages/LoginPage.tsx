import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate("/market");
  };

  const handleSocialLogin = (provider: string) => {
    login(`${provider}@example.com`);
    navigate("/market");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-xl gradient-primary items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Восстановление пароля</h1>
            <p className="text-muted-foreground text-sm">Введите email для получения ссылки</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
            {resetSent ? (
              <div className="text-center py-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium mb-1">Ссылка отправлена</p>
                <p className="text-sm text-muted-foreground mb-4">Проверьте почту {resetEmail}</p>
                <button onClick={() => { setShowForgotPassword(false); setResetSent(false); }} className="text-sm text-primary hover:underline">
                  Вернуться ко входу
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="your@email.com" className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                  Отправить ссылку для восстановления
                </button>
                <button type="button" onClick={() => setShowForgotPassword(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Назад ко входу
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl gradient-primary items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Промт-Студия</h1>
          <p className="text-muted-foreground text-sm">Цифровой сейф для ваших аккаунтов и ИИ‑инструментов</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Пароль</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-primary hover:underline">Забыли пароль?</button>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Войти</button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">или войти через</span></div>
          </div>

          <div className="space-y-2">
            <button onClick={() => handleSocialLogin("vk")} className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              <img src="/vk-icon.png" alt="VK" className="social-icon vk-icon" />
              Войти через ВК
            </button>
            <button onClick={() => handleSocialLogin("yandex")} className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              <img src="/yandex-icon.png" alt="Яндекс" className="social-icon" />
              Войти через Яндекс
            </button>
            <button onClick={() => handleSocialLogin("google")} className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              <svg className="social-icon" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Войти через Google
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">Создать аккаунт</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
