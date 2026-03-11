import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

const AdminLogin = () => {
  const { login, loginAttempts, isLocked } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setError("Аккаунт заблокирован на 24 часа после 5 неудачных попыток");
      return;
    }
    const success = login(email, password, twoFactorCode);
    if (success) {
      navigate("/admin/dashboard");
    } else {
      setError(`Неверные учетные данные. Попытка ${loginAttempts + 1}/5`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          <CardTitle>Admin Panel — Промт-Студия</CardTitle>
          <p className="text-sm text-muted-foreground">admin.prompt-studiya.ru • Доступ только для авторизованных сотрудников</p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email (из белого списка)</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@prompt-studiya.ru" required disabled={isLocked} />
            </div>
            <div>
              <Label>Пароль</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLocked} />
            </div>
            <div>
              <Label>Код 2FA (6 цифр)</Label>
              <Input type="text" maxLength={6} value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" required disabled={isLocked} />
            </div>
            <Button type="submit" className="w-full" disabled={isLocked}>
              {isLocked ? "Заблокировано (24ч)" : "Войти"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            IP проверяется • Сессия 30 мин • Все попытки логируются
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
