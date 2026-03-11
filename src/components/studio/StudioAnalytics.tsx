import { useState } from "react";
import {
  TrendingUp, Eye, ShoppingCart, MapPin, Lightbulb, Plus,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

interface SalesDay {
  date: string;
  sales: number;
  views: number;
}

const mockSalesData: SalesDay[] = [];

interface TopPrompt {
  id: string;
  title: string;
  sales: number;
  views: number;
  conversion: number;
}

const topPrompts: TopPrompt[] = [];

const geoData: { country: string; percent: number }[] = [];

const recommendations: { text: string; tags: string[] }[] = [];

export function StudioAnalytics() {
  const [period, setPeriod] = useState<"days" | "weeks">("days");

  const maxSales = Math.max(...mockSalesData.map((d) => d.sales));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sales chart */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Продажи
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setPeriod("days")}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${period === "days" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              По дням
            </button>
            <button
              onClick={() => setPeriod("weeks")}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${period === "weeks" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              По неделям
            </button>
          </div>
        </div>
        {/* Simple bar chart */}
        {mockSalesData.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Нет данных по продажам</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {mockSalesData.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium">{d.sales}</span>
                <div
                  className="w-full rounded-t-md gradient-primary min-h-[4px] transition-all"
                  style={{ height: `${maxSales > 0 ? (d.sales / maxSales) * 100 : 0}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{d.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conversion */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-primary" /> Конверсия (просмотры → покупки)
        </h3>
        {mockSalesData.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Нет данных для расчёта</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{mockSalesData.reduce((s, d) => s + d.views, 0).toLocaleString("ru-RU")}</p>
              <p className="text-xs text-muted-foreground">Просмотры (7д)</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{mockSalesData.reduce((s, d) => s + d.sales, 0)}</p>
              <p className="text-xs text-muted-foreground">Покупки (7д)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {((mockSalesData.reduce((s, d) => s + d.sales, 0) / mockSalesData.reduce((s, d) => s + d.views, 0)) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Конверсия</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">+12%</p>
              <p className="text-xs text-muted-foreground">vs прошлая нед.</p>
            </div>
          </div>
        )}
      </div>

      {/* Top prompts */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" /> Топ промптов
        </h3>
        {topPrompts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Нет промптов для отображения</p>
        ) : (
          <div className="space-y-2">
            {topPrompts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-lg font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" />{p.sales}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views}</span>
                    <span className="text-primary font-medium">{p.conversion}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Geography */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary" /> География покупателей
        </h3>
        {geoData.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Нет геоданных</p>
        ) : (
          <div className="space-y-2">
            {geoData.map((g) => (
              <div key={g.country} className="flex items-center gap-3">
                <span className="text-sm w-24">{g.country}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full" style={{ width: `${g.percent}%` }} />
                </div>
                <span className="text-xs font-medium w-10 text-right">{g.percent}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-warning" /> Рекомендации ИИ
        </h3>
        {recommendations.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Нет рекомендаций</p>
        ) : (
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <div className="flex-1">
                  <p className="text-sm mb-1">{r.text}</p>
                  <div className="flex gap-1">
                    {r.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px]">{t}</span>
                    ))}
                  </div>
                </div>
                <Link
                  to="/publish"
                  className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  title="Создать"
                >
                  <Plus className="h-4 w-4 text-primary" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
