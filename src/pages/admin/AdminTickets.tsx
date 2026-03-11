import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Search, MessageSquare, Clock, AlertCircle, User, Star, ArrowUp
} from "lucide-react";

// tickets obtained from backend
const MOCK_TICKETS: Array<Record<string, any>> = [];

// support operator metrics pulled from backend
const MOCK_OPERATORS: Array<Record<string, any>> = [];

const CANNED_RESPONSES: string[] = [];

const AdminTickets = () => {
  const { logAction } = useAdmin();
  const [tab, setTab] = useState("queue");
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<typeof MOCK_TICKETS[0] | null>(null);
  const [reply, setReply] = useState("");

  const filtered = tickets.filter(t => {
    if (search && !t.subject.includes(search) && !t.id.includes(search) && !t.user.includes(search)) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const priorityLabel = (p: string) => ({ low: "Низкий", medium: "Средний", high: "Высокий", critical: "Критический" }[p] || p);
  const statusLabel = (s: string) => ({ open: "Открыт", pending_user: "Ожидает пользователя", pending_admin: "Ожидает ответа", resolved: "Решён", closed: "Закрыт" }[s] || s);

  const handleReply = () => {
    if (!selectedTicket || !reply.trim()) return;
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? {
      ...t,
      status: "pending_user",
      messages: [...t.messages, { sender: "admin", text: reply, time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) }]
    } : t));
    logAction("reply_ticket", "ticket", selectedTicket.id);
    setReply("");
    setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, { sender: "admin", text: reply, time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) }] } : null);
  };

  const handleAssign = (ticketId: string, operator: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedTo: operator } : t));
    logAction("assign_ticket", "ticket", ticketId, undefined, operator);
  };

  const handleClose = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: "closed" } : t));
    logAction("close_ticket", "ticket", ticketId);
    setSelectedTicket(null);
  };

  const handleEscalate = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, priority: "critical" } : t));
    logAction("escalate_ticket", "ticket", ticketId);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Тикеты поддержки</h1>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-3 text-center"><p className="text-sm text-muted-foreground">Открыто</p><p className="text-xl font-bold">{tickets.filter(t => t.status === "open").length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-sm text-muted-foreground">Ожидают ответа</p><p className="text-xl font-bold">{tickets.filter(t => t.status === "pending_admin").length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-sm text-muted-foreground">Просрочено SLA</p><p className="text-xl font-bold">{tickets.filter(t => new Date(t.slaDeadline) < new Date() && t.status !== "closed").length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-sm text-muted-foreground">Ср. время ответа</p><p className="text-xl font-bold">14 мин</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="queue">Очередь ({filtered.length})</TabsTrigger>
          <TabsTrigger value="operators">Операторы</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="open">Открыт</SelectItem>
                <SelectItem value="pending_admin">Ожидает ответа</SelectItem>
                <SelectItem value="pending_user">Ожидает пользователя</SelectItem>
                <SelectItem value="resolved">Решён</SelectItem>
                <SelectItem value="closed">Закрыт</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Приоритет" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="critical">Критический</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Тема</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Назначен</TableHead>
                    <TableHead>Создан</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(t => {
                    const slaBreached = new Date(t.slaDeadline) < new Date() && t.status !== "closed" && t.status !== "resolved";
                    return (
                      <TableRow key={t.id} className={slaBreached ? "bg-destructive/5" : ""}>
                        <TableCell className="font-mono text-xs">{t.id}</TableCell>
                        <TableCell>{t.subject}</TableCell>
                        <TableCell>{t.user}</TableCell>
                        <TableCell><Badge variant={t.priority === "critical" ? "destructive" : t.priority === "high" ? "secondary" : "outline"}>{priorityLabel(t.priority)}</Badge></TableCell>
                        <TableCell><Badge variant={t.status === "open" ? "default" : t.status === "closed" ? "secondary" : "outline"}>{statusLabel(t.status)}</Badge></TableCell>
                        <TableCell>{t.assignedTo || "—"}</TableCell>
                        <TableCell className="text-xs">{new Date(t.createdDate).toLocaleDateString("ru")}</TableCell>
                        <TableCell>{slaBreached ? <Badge variant="destructive">Просрочен</Badge> : <Clock className="h-4 w-4 text-muted-foreground" />}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(t)}><MessageSquare className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEscalate(t.id)}><ArrowUp className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operators" className="space-y-4">
          {MOCK_OPERATORS.map(op => (
            <Card key={op.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 p-1 border rounded-full" />
                  <div>
                    <p className="font-medium">{op.name}</p>
                    <p className="text-sm text-muted-foreground">Активных тикетов: {op.activeTickets} • Ср. ответ: {op.avgResponse}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center"><p className="font-bold">{op.resolution}</p><p className="text-muted-foreground">Решение</p></div>
                  <div className="text-center flex items-center gap-1"><Star className="h-3 w-3" /><p className="font-bold">{op.satisfaction}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Ср. время ответа</p><p className="text-2xl font-bold">14 мин</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Ср. время решения</p><p className="text-2xl font-bold">2.3 часа</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">SLA соблюдение</p><p className="text-2xl font-bold">91%</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Частые проблемы</CardTitle></CardHeader>
            <CardContent>
              {["Оплата (32%)", "Технические (24%)", "Аккаунт (18%)", "Контент (15%)", "Подписки (11%)"].map((item, i) => (
                <div key={i} className="flex justify-between py-1 border-b text-sm"><span>{item.split("(")[0]}</span><span className="text-muted-foreground">{item.match(/\(.*\)/)?.[0]}</span></div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Тикет: {selectedTicket?.subject}</DialogTitle></DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex gap-2 text-sm">
                <Badge>{priorityLabel(selectedTicket.priority)}</Badge>
                <Badge variant="outline">{statusLabel(selectedTicket.status)}</Badge>
                <span className="text-muted-foreground">Пользователь: {selectedTicket.user}</span>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Назначить оператору:</p>
                <Select value={selectedTicket.assignedTo || ""} onValueChange={v => handleAssign(selectedTicket.id, v)}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Не назначен" /></SelectTrigger>
                  <SelectContent>
                    {MOCK_OPERATORS.map(op => <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded p-3 space-y-3 max-h-60 overflow-y-auto">
                {selectedTicket.messages.map((m, i) => (
                  <div key={i} className={`text-sm ${m.sender === "admin" ? "text-right" : ""}`}>
                    <Badge variant={m.sender === "admin" ? "default" : "outline"} className="text-xs">{m.sender === "admin" ? "Оператор" : "Пользователь"} {m.time}</Badge>
                    <p className="mt-1">{m.text}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Быстрые ответы:</p>
                <div className="flex flex-wrap gap-1">
                  {CANNED_RESPONSES.map((cr, i) => (
                    <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => setReply(cr)}>{cr.substring(0, 30)}...</Button>
                  ))}
                </div>
                <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Ответ..." />
                <div className="flex gap-2">
                  <Button onClick={handleReply} disabled={!reply.trim()}>Ответить</Button>
                  <Button variant="outline" onClick={() => handleClose(selectedTicket.id)}>Закрыть тикет</Button>
                </div>
              </div>

              <div>
                <Textarea placeholder="Внутренняя заметка (не видна пользователю)..." className="text-xs" />
                <Button size="sm" variant="ghost" className="mt-1">Сохранить заметку</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTickets;
