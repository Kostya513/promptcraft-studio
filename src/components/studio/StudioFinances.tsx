import { useState } from "react";
import {
  Wallet, Clock, ArrowDownToLine, Download, Filter,
  CreditCard, Smartphone, Landmark
} from "lucide-react";

type TaxStatus = "individual" | "self-employed" | "ie";
type TxType = "sale" | "withdrawal" | "refund";
type TxStatus = "completed" | "pending" | "failed";

interface Transaction {
  id: string;
  date: string;
  type: TxType;
  description: string;
  amount: number;
  status: TxStatus;
}

const txTypeLabels: Record<TxType, string> = { sale: "Продажа", withdrawal: "Вывод", refund: "Возврат" };
const txStatusLabels: Record<TxStatus, string> = { completed: "Завершено", pending: "В обработке", failed: "Ошибка" };
const txStatusColors: Record<TxStatus, string> = { completed: "text-success", pending: "text-warning", failed: "text-destructive" };
const taxLabels: Record<TaxStatus, string> = { individual: "Физ. лицо", "self-employed": "Самозанятый", ie: "ИП" };

const mockTransactions: Transaction[] = [];

export function StudioFinances() {
  const [taxStatus, setTaxStatus] = useState<TaxStatus>("individual");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [showWithdraw, setShowWithdraw] = useState(false);

  const available = 4230;
  const pending = 440;
  const withdrawn = 12500;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Wallet */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Wallet className="h-4 w-4" /> Доступно
          </div>
          <p className="text-2xl font-bold text-success">{available.toLocaleString("ru-RU")} ₽</p>
          <button onClick={() => setShowWithdraw(true)} className="mt-2 text-xs text-primary hover:underline flex items-center gap-1">
            <ArrowDownToLine className="h-3 w-3" /> Вывести
          </button>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Clock className="h-4 w-4" /> В ожидании
          </div>
          <p className="text-2xl font-bold text-warning">{pending.toLocaleString("ru-RU")} ₽</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <ArrowDownToLine className="h-4 w-4" /> Выведено
          </div>
          <p className="text-2xl font-bold">{withdrawn.toLocaleString("ru-RU")} ₽</p>
        </div>
      </div>

      {/* Tax status */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold text-sm mb-3">Налоговый статус</h3>
        <div className="flex gap-2">
          {(Object.entries(taxLabels) as [TaxStatus, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTaxStatus(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                taxStatus === key ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Транзакции</h3>
          <div className="flex gap-2">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs focus:outline-none"
            >
              <option value="all">Все время</option>
              <option value="week">7 дней</option>
              <option value="month">30 дней</option>
              <option value="quarter">90 дней</option>
            </select>
          </div>
        </div>

        {/* Desktop table */}
        {mockTransactions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Нет транзакций</p>
        ) : (
          <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Тип</th>
                  <th className="px-4 py-3 font-medium">Описание</th>
                  <th className="px-4 py-3 font-medium">Сумма</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{new Date(tx.date).toLocaleDateString("ru-RU")}</td>
                    <td className="px-4 py-3">{txTypeLabels[tx.type]}</td>
                    <td className="px-4 py-3">{tx.description}</td>
                    <td className={`px-4 py-3 font-medium ${tx.amount > 0 ? "text-success" : "text-destructive"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString("ru-RU")} ₽
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${txStatusColors[tx.status]}`}>{txStatusLabels[tx.status]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center" title="Скачать чек">
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {mockTransactions.length === 0 ? null : (
          <div className="md:hidden space-y-2">
            {mockTransactions.map((tx) => (
              <div key={tx.id} className="bg-card rounded-xl border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString("ru-RU")}</span>
                  <span className={`text-xs font-medium ${txStatusColors[tx.status]}`}>{txStatusLabels[tx.status]}</span>
                </div>
                <p className="text-sm mb-1">{tx.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{txTypeLabels[tx.type]}</span>
                  <span className={`text-sm font-bold ${tx.amount > 0 ? "text-success" : "text-destructive"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowWithdraw(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Вывод средств</h3>
            <p className="text-sm text-muted-foreground mb-4">Доступно: <span className="font-bold text-foreground">{available.toLocaleString("ru-RU")} ₽</span></p>
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted transition-colors">
                <input type="radio" name="wmethod" defaultChecked className="accent-primary" />
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Карта РФ (по номеру)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted transition-colors">
                <input type="radio" name="wmethod" className="accent-primary" />
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">СБП (по телефону)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted transition-colors">
                <input type="radio" name="wmethod" className="accent-primary" />
                <Landmark className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Внутренний баланс</span>
              </label>
            </div>
            <div className="mb-3">
              <label className="text-xs text-muted-foreground">Сумма</label>
              <input type="number" placeholder="1000" className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">Комиссия: 0%. Мин: 500 ₽. Лимит: 100 000 ₽/мес</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Вывести</button>
              <button onClick={() => setShowWithdraw(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
