import { useState } from "react";
import { Plus, Pencil, Trash2, CreditCard, TrendingUp } from "lucide-react";

const mockSubs = [
  { id: "1", name: "ChatGPT Plus", category: "SaaS", status: "Активна", plan: "Plus", priceMonth: "$20", nextPayment: "15 фев 2025" },
  { id: "2", name: "Midjourney", category: "SaaS", status: "Активна", plan: "Standard", priceMonth: "$30", nextPayment: "20 фев 2025" },
  { id: "3", name: "Wildberries Seller", category: "Маркетплейс", status: "Активна", plan: "Базовый", priceMonth: "0 ₽", nextPayment: "—" },
  { id: "4", name: "Canva Pro", category: "Контент", status: "Неактивна", plan: "Pro", priceMonth: "$13", nextPayment: "—" },
  { id: "5", name: "VK Реклама", category: "Соцсеть", status: "Активна", plan: "—", priceMonth: "~5 000 ₽", nextPayment: "1 фев 2025" },
];

export default function SubscriptionManager() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Менеджер подписок</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CreditCard className="h-4 w-4" /> Итого в месяц
          </div>
          <p className="text-2xl font-bold">~$63 + 5 000 ₽</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingUp className="h-4 w-4" /> Итого в год
          </div>
          <p className="text-2xl font-bold">~$756 + 60 000 ₽</p>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6 animate-slide-up">
          <h3 className="font-semibold text-sm mb-3">Новая подписка</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Название сервиса" className="px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input placeholder="Категория" className="px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input placeholder="Цена в месяц" className="px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="date" className="px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <textarea placeholder="Комментарий" rows={2} className="w-full mt-3 px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          <button className="mt-3 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">
            Сохранить
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Сервис</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Категория</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Тариф</th>
                <th className="px-4 py-3 font-medium">Цена/мес</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Списание</th>
                <th className="px-4 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {mockSubs.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{s.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === "Активна" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{s.plan}</td>
                  <td className="px-4 py-3 font-medium">{s.priceMonth}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{s.nextPayment}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button className="h-7 w-7 rounded-md hover:bg-destructive/10 flex items-center justify-center">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
