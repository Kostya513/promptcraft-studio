import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdmin } from "@/contexts/AdminContext";
import {
  DollarSign, Download, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Settings
} from "lucide-react";

// transactions pulled from backend
type Txn = { id: string; type: string; amount: number; user: string; status: string; date: string; paymentMethod: string; };
const MOCK_TRANSACTIONS: Txn[] = [];

// payouts come from backend
const MOCK_PAYOUTS: Array<Record<string, any>> = [];

// disputes are managed by backend
const MOCK_DISPUTES: Array<Record<string, any>> = [];

const AdminFinances = () => {
  const { logAction } = useAdmin();
  const [tab, setTab] = useState("transactions");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payouts, setPayouts] = useState(MOCK_PAYOUTS);
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState<typeof MOCK_DISPUTES[0] | null>(null);
  const [commissionRate, setCommissionRate] = useState("15");
  const [minPayout, setMinPayout] = useState("500");
  const [refundWindow, setRefundWindow] = useState("72");

  const filteredTxns = MOCK_TRANSACTIONS.filter(t => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const handleApprovePayout = (id: string) => {
    setPayouts(prev => prev.filter(p => p.id !== id));
    logAction("approve_payout", "payout", id);
  };

  const handleRejectPayout = (id: string) => {
    setPayouts(prev => prev.filter(p => p.id !== id));
    logAction("reject_payout", "payout", id);
  };

  const handleResolveDispute = (id: string, resolution: string) => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: "resolved" } : d));
    logAction("resolve_dispute", "dispute", id, undefined, resolution);
    setSelectedDispute(null);
  };

  const typeLabel = (t: string) => ({ purchase: "Покупка", payout: "Выплата", refund: "Возврат", commission: "Комиссия" }[t] || t);
  const statusLabel = (s: string) => ({ completed: "Завершена", pending: "Ожидает", failed: "Ошибка", processing: "Обработка", open: "Открыт", in_review: "На рассмотрении", resolved: "Решён", auto_refund: "Авто-возврат" }[s] || s);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Финансы</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Выручка (30д)</p><p className="text-2xl font-bold">2 345 600 ₽</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Комиссия (30д)</p><p className="text-2xl font-bold">351 840 ₽</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Ожидают выплаты</p><p className="text-2xl font-bold">{payouts.reduce((s, p) => s + p.amount, 0).toLocaleString()} ₽</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Активных споров</p><p className="text-2xl font-bold">{disputes.filter(d => d.status === "open" || d.status === "in_review").length}</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          <TabsTrigger value="payouts">Выплаты ({payouts.length})</TabsTrigger>
          <TabsTrigger value="disputes">Споры ({disputes.filter(d => d.status !== "resolved").length})</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="reports">Отчёты</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Тип" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="purchase">Покупки</SelectItem>
                <SelectItem value="payout">Выплаты</SelectItem>
                <SelectItem value="refund">Возвраты</SelectItem>
                <SelectItem value="commission">Комиссии</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="completed">Завершены</SelectItem>
                <SelectItem value="pending">Ожидают</SelectItem>
                <SelectItem value="failed">Ошибки</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> CSV</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Метод</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTxns.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell><Badge variant="outline">{typeLabel(t.type)}</Badge></TableCell>
                      <TableCell className={t.type === "refund" ? "text-destructive" : ""}>{t.type === "refund" ? "-" : ""}{t.amount.toLocaleString()} ₽</TableCell>
                      <TableCell>{t.user}</TableCell>
                      <TableCell><Badge variant={t.status === "completed" ? "default" : t.status === "failed" ? "destructive" : "secondary"}>{statusLabel(t.status)}</Badge></TableCell>
                      <TableCell className="text-xs">{new Date(t.date).toLocaleDateString("ru")}</TableCell>
                      <TableCell className="text-xs">{t.paymentMethod === "card" ? "Карта" : t.paymentMethod === "sbp" ? "СБП" : "Баланс"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { payouts.filter(p => p.verified && !p.hasDisputes).forEach(p => handleApprovePayout(p.id)); }}>
              <CheckCircle className="h-4 w-4 mr-1" /> Одобрить все валидные
            </Button>
          </div>
          {payouts.map(p => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.authorName} ({p.author})</p>
                  <p className="text-sm text-muted-foreground">
                    {p.amount.toLocaleString()} ₽ • {p.method === "card" ? "Карта" : p.method === "sbp" ? "СБП" : "Баланс"} • {new Date(p.requestDate).toLocaleDateString("ru")}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {p.verified ? <Badge>Верифицирован</Badge> : <Badge variant="secondary">Не верифицирован</Badge>}
                    {p.hasDisputes && <Badge variant="destructive">Есть споры</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => handleApprovePayout(p.id)} disabled={!p.verified || p.hasDisputes}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Одобрить
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleRejectPayout(p.id)}>
                    <XCircle className="h-4 w-4 mr-1" /> Отклонить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          {disputes.map(d => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">{d.reason}</span>
                      <Badge variant={d.status === "open" ? "destructive" : d.status === "resolved" ? "default" : "secondary"}>{statusLabel(d.status)}</Badge>
                    </div>
                    <p className="text-sm">Покупатель: {d.buyer} → Продавец: {d.seller}</p>
                    <p className="text-sm text-muted-foreground">Промпт: {d.promptTitle} ({d.promptId}) • {d.amount} ₽</p>
                    <p className="text-sm">Эскроу: <Badge variant="outline">{d.escrowStatus === "frozen" ? "Заморожено" : "Разморожено"}</Badge> • До авто-возврата: {d.hoursRemaining}ч</p>
                  </div>
                  {d.status !== "resolved" && (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => setSelectedDispute(d)}>Рассмотреть</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Комиссии и лимиты</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Комиссия платформы (%)</Label><Input type="number" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} /></div>
                <div><Label>Мин. сумма выплаты (₽)</Label><Input type="number" value={minPayout} onChange={e => setMinPayout(e.target.value)} /></div>
                <div><Label>Окно возврата (часы)</Label><Input type="number" value={refundWindow} onChange={e => setRefundWindow(e.target.value)} /></div>
                <div><Label>График выплат</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                      <SelectItem value="manual">Вручную</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => logAction("update_commission_settings", "settings", "financial")}>Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {["Отчёт по выручке", "Отчёт по комиссиям", "Отчёт по выплатам", "Налоговый отчёт (54-ФЗ)", "Чеки (54-ФЗ)", "Сводный отчёт"].map(r => (
              <Card key={r}>
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">{r}</p>
                  <div className="flex gap-1 mt-2 justify-center">
                    <Button size="sm" variant="outline">PDF</Button>
                    <Button size="sm" variant="outline">CSV</Button>
                    <Button size="sm" variant="outline">Excel</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dispute Resolution Modal */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Решение спора: {selectedDispute?.id}</DialogTitle></DialogHeader>
          {selectedDispute && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p>Покупатель: {selectedDispute.buyer}</p>
                <p>Продавец: {selectedDispute.seller}</p>
                <p>Сумма: {selectedDispute.amount} ₽</p>
                <p>Причина: {selectedDispute.reason}</p>
                <p>До авто-возврата: {selectedDispute.hoursRemaining}ч</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleResolveDispute(selectedDispute.id, "refund_buyer")}>
                  Возврат покупателю ({selectedDispute.amount} ₽)
                </Button>
                <Button variant="outline" onClick={() => handleResolveDispute(selectedDispute.id, "release_seller")}>
                  Перевести продавцу
                </Button>
                <Button variant="secondary" onClick={() => setSelectedDispute(null)}>
                  Запросить доп. информацию
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinances;
