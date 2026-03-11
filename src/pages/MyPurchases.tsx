import { ShoppingBag, ExternalLink, Trash2, Clock } from "lucide-react";

const mockPurchases = [
  { id: "1", title: "Промпт‑пак для Ozon — 15 шаблонов", tags: ["Ozon", "Пак"], date: "15 янв 2025", price: "490 ₽" },
  { id: "2", title: "Агент: полный цикл грантовой заявки", tags: ["Гранты", "Агент"], date: "12 янв 2025", price: "1 290 ₽" },
  { id: "3", title: "Workflow: контент‑план на месяц", tags: ["SMM", "Workflow"], date: "8 янв 2025", price: "790 ₽" },
];

export default function MyPurchases() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Мои покупки</h1>

      <div className="space-y-3">
        {mockPurchases.map((p) => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-4 hover:shadow-card-hover transition-shadow">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">{p.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                {p.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">{t}</span>
                ))}
                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                  <Clock className="h-3 w-3" /> {p.date}
                </span>
                <span className="text-xs font-semibold text-foreground ml-auto">{p.price}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
