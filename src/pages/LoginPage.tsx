import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useUser();

  // Обработка OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    
    if (token && provider) {
      // Успешный OAuth вход
      const email = `${provider}@example.com`;
      login(email, token);
      navigate("/market");
    }
  }, [searchParams, login, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        login(email, data.token);
        navigate("/market");
      } else {
        const err = await response.json();
        setError(err.error || "Ошибка входа");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Не удалось подключиться к серверу");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Открываем OAuth URL
    window.location.href = `http://localhost:3000/api/oauth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">  
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative p-[1.5px] rounded-lg bg-gradient-to-br from-yellow-400 via-purple-600 via-blue-500 to-purple-800">
              <img src="/logo.png" alt="Промт-Студия" className="h-20 w-20 object-contain bg-white rounded-[2px]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">Промт-Студия</h1>
          <p className="text-muted-foreground text-sm">Цифровой сейф для ваших аккаунтов и ИИ‑инструментов</p> 
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              {error}
            </div>
          )}
          
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
              <button type="button" className="text-xs text-primary hover:underline">Забыли пароль?</button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">или войти через</span></div>
          </div>

          <div className="space-y-2">
            <button onClick={() => handleSocialLogin("vk")} disabled={loading} className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">
              <img src="/vk-icon.png" alt="VK" className="social-icon vk-icon" />
              Войти через ВК
            </button>
            <button onClick={() => handleSocialLogin("yandex")} disabled={loading} className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">        
              <img src="/yandex-icon.png" alt="Яндекс" className="social-icon" />
              Войти через Яндекс
            </button>
            <button onClick={() => handleSocialLogin("google")} disabled={loading} className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">        
              <svg className="social-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
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
