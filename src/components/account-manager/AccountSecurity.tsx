import { useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldOff, Clock, Filter } from "lucide-react";

interface SecurityItem {
  id: string;
  service: string;
  has2fa: boolean;
  lastPwChange: string;
  status: string;
}

// security data loaded from backend
const mockSecurityData: SecurityItem[] = [];

export function AccountSecurity() {
  const [items, setItems] = useState<SecurityItem[]>(mockSecurityData);
  const [filterInsecure, setFilterInsecure] = useState(false);

  const no2fa = items.filter(i => !i.has2fa).length;
  const oldPw = items.filter(i => {
    if (!i.lastPwChange) return true;
    const diff = Date.now() - new Date(i.lastPwChange).getTime();
    return diff > 180 * 24 * 60 * 60 * 1000; // 6 months
  }).length;
  const unknownStatus = items.filter(i => i.status === "Не помню" || i.status === "Планирую удалить").length;

  const displayed = filterInsecure
    ? items.filter(i => !i.has2fa || !i.lastPwChange || (Date.now() - new Date(i.lastPwChange).getTime() > 180 * 24 * 60 * 60 * 1000) || i.status === "Не помню")
    : items;

  const toggle2fa = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, has2fa: !i.has2fa } : i));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldOff className="h-5 w-5 text-destructive" />
            <span className="text-sm text-muted-foreground">Без 2FA</span>
          </div>
          <p className="text-2xl font-bold">{no2fa}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-sm text-muted-foreground">Старый пароль (6+ мес)</span>
          </div>
          <p className="text-2xl font-bold">{oldPw}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-5 w-5 text-warning" />
            <span className="text-sm text-muted-foreground">Требуют внимания</span>
          </div>
          <p className="text-2xl font-bold">{unknownStatus}</p>
        </div>
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setFilterInsecure(!filterInsecure)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
          filterInsecure ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
        }`}
      >
        <Filter className="h-4 w-4" />
        {filterInsecure ? "Показаны только проблемные" : "Показать только проблемные"}
      </button>

      {/* List */}
      <div className="space-y-3">
        {displayed.map(item => {
          const pwOld = !item.lastPwChange || (Date.now() - new Date(item.lastPwChange).getTime() > 180 * 24 * 60 * 60 * 1000);
          return (
            <div key={item.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{item.service}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "Активен" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {item.status}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  onClick={() => toggle2fa(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    item.has2fa ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"
                  }`}
                >
                  {item.has2fa ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                  2FA: {item.has2fa ? "Включена" : "Выключена"}
                </button>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                  pwOld ? "border-warning/30 bg-warning/5 text-warning" : "border-border"
                }`}>
                  <Clock className="h-4 w-4" />
                  Пароль: {item.lastPwChange ? new Date(item.lastPwChange).toLocaleDateString("ru-RU") : "Не указана"}
                  {pwOld && " ⚠️"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayed.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Все аккаунты в порядке!</p>}
    </div>
  );
}
