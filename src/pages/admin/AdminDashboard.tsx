import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Users, FileText, DollarSign, AlertTriangle, TicketCheck, TrendingUp,
  CheckCircle, XCircle, Clock, AlertCircle
} from "lucide-react";

const MOCK_METRICS = {
  totalUsers: 12847, userGrowth24h: 128, userGrowth7d: 892, userGrowth30d: 3241,
  activeUsers24h: 3456,
  totalPrompts: 8923, pendingModeration: 47, rejected: 12,
  totalSales: 4567, revenue: 2345600, salesGrowth24h: 89, salesGrowth7d: 623,
  activeDisputes: 8, requireAttention: 3,
  pendingPayouts: 23, payoutAmount: 456700,
  openTickets: 34, pendingTickets: 12, overdueTickets: 3,
};

const MOCK_ALERTS = [
  { id: "1", type: "red", message: "3 спора требуют немедленного внимания", icon: AlertTriangle },
  { id: "2", type: "yellow", message: "47 промптов ожидают модерации >24ч", icon: Clock },
  { id: "3", type: "green", message: "23 выплаты готовы к обработке (456 700 ₽)", icon: CheckCircle },
  { id: "4", type: "red", message: "API YooKassa: повышенная задержка ответа", icon: AlertCircle },
];

const MOCK_ACTIVITY = [
  { id: "1", time: "2 мин назад", event: "Покупка промпта #4521 — 1 200 ₽", type: "purchase" },
  { id: "2", time: "5 мин назад", event: "Новый отзыв на промпт #3892 (★4.5)", type: "review" },
  { id: "3", time: "12 мин назад", event: "Запрос на вывод 15 000 ₽ от @designer_pro", type: "payout" },
  { id: "4", time: "18 мин назад", event: "Спор открыт: покупатель #7821 vs автор #1234", type: "dispute" },
  { id: "5", time: "25 мин назад", event: "Промпт #4530 прошёл авто-модерацию (AI 96%)", type: "moderation" },
  { id: "6", time: "30 мин назад", event: "Бан пользователя #9012 (спам)", type: "ban" },
];

const AdminDashboard = () => {
  const { adminUser, logAction } = useAdmin();
  const [metrics] = useState(MOCK_METRICS);

  const handleQuickAction = (action: string) => {
    logAction(action, "batch", "multiple");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="text-sm text-muted-foreground">Добро пожаловать, {adminUser?.name} • Роль: {adminUser?.role?.replace("_", " ")}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4" /><span className="text-sm text-muted-foreground">Пользователи</span></div>
            <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">+{metrics.userGrowth24h} за 24ч / +{metrics.userGrowth7d} за 7д</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4" /><span className="text-sm text-muted-foreground">Промпты</span></div>
            <p className="text-2xl font-bold">{metrics.totalPrompts.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">На модерации: {metrics.pendingModeration} • Отклонено: {metrics.rejected}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4" /><span className="text-sm text-muted-foreground">Продажи</span></div>
            <p className="text-2xl font-bold">{(metrics.revenue / 100).toLocaleString()} ₽</p>
            <p className="text-xs text-muted-foreground">{metrics.totalSales} продаж • +{metrics.salesGrowth24h} за 24ч</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><TicketCheck className="h-4 w-4" /><span className="text-sm text-muted-foreground">Тикеты</span></div>
            <p className="text-2xl font-bold">{metrics.openTickets}</p>
            <p className="text-xs text-muted-foreground">Ожидают: {metrics.pendingTickets} • Просрочено SLA: {metrics.overdueTickets}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Оповещения</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {MOCK_ALERTS.map(alert => (
            <div key={alert.id} className="flex items-center gap-3 p-2 rounded border">
              <Badge variant={alert.type === "red" ? "destructive" : alert.type === "yellow" ? "secondary" : "default"}>
                {alert.type === "red" ? "Критично" : alert.type === "yellow" ? "Внимание" : "Готово"}
              </Badge>
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Быстрые действия</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction("batch_approve")}>
              <CheckCircle className="h-4 w-4 mr-2" /> Одобрить промпты (пакетно)
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction("batch_payout")}>
              <DollarSign className="h-4 w-4 mr-2" /> Обработать выплаты (пакетно)
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction("assign_tickets")}>
              <TicketCheck className="h-4 w-4 mr-2" /> Распределить тикеты
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction("send_notification")}>
              <TrendingUp className="h-4 w-4 mr-2" /> Отправить уведомление платформы
            </Button>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Лента событий</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {MOCK_ACTIVITY.map(item => (
              <div key={item.id} className="flex items-start gap-2 text-sm">
                <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">{item.time}</span>
                <span>{item.event}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart placeholder */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Выручка (30 дней)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center border rounded text-muted-foreground text-sm">
            [График выручки — данные из бэкенда]
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4 text-center text-sm">
            <div><p className="font-bold">2 345 600 ₽</p><p className="text-muted-foreground">Общая выручка</p></div>
            <div><p className="font-bold">351 840 ₽</p><p className="text-muted-foreground">Комиссия (15%)</p></div>
            <div><p className="font-bold">1 993 760 ₽</p><p className="text-muted-foreground">Выплачено авторам</p></div>
            <div><p className="font-bold">456 700 ₽</p><p className="text-muted-foreground">Ожидает выплаты</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
