import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdmin } from "@/contexts/AdminContext";
import { Search, Download, Shield, AlertTriangle, Server, Activity } from "lucide-react";

// system logs will be provided by backend
const MOCK_SYSTEM_LOGS: { id: string; level: string; source: string; message: string; timestamp: string; }[] = [];

const AdminAudit = () => {
  const { auditLog } = useAdmin();
  const [tab, setTab] = useState("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredAudit = auditLog.filter(entry => {
    if (searchQuery && !entry.actionType.includes(searchQuery) && !entry.entityId.includes(searchQuery) && !entry.adminUser.includes(searchQuery)) return false;
    if (actionFilter !== "all" && entry.actionType !== actionFilter) return false;
    return true;
  });

  const uniqueActions = [...new Set(auditLog.map(e => e.actionType))];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Аудит и логи</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="admin">Действия админов ({auditLog.length})</TabsTrigger>
          <TabsTrigger value="system">Системные логи</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Поиск по действию, сущности, админу..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Тип действия" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все действия</SelectItem>
                {uniqueActions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline"><Download className="h-4 w-4 mr-1" /> Экспорт</Button>
          </div>

          {auditLog.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Нет записей аудита. Действия администраторов будут логироваться автоматически.</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Время</TableHead>
                      <TableHead>Админ</TableHead>
                      <TableHead>Действие</TableHead>
                      <TableHead>Сущность</TableHead>
                      <TableHead>ID сущности</TableHead>
                      <TableHead>Старое значение</TableHead>
                      <TableHead>Новое значение</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAudit.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs">{new Date(entry.timestamp).toLocaleString("ru")}</TableCell>
                        <TableCell>{entry.adminUser}</TableCell>
                        <TableCell><Badge variant="outline">{entry.actionType}</Badge></TableCell>
                        <TableCell>{entry.affectedEntity}</TableCell>
                        <TableCell className="font-mono text-xs">{entry.entityId}</TableCell>
                        <TableCell className="text-xs max-w-[100px] truncate">{entry.oldValue || "—"}</TableCell>
                        <TableCell className="text-xs max-w-[100px] truncate">{entry.newValue || "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{entry.ipAddress}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          <p className="text-xs text-muted-foreground">⚠ Логи аудита не могут быть удалены (compliance). Хранение: минимум 3 года.</p>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Уровень</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead>Сообщение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SYSTEM_LOGS.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{new Date(log.timestamp).toLocaleString("ru")}</TableCell>
                      <TableCell>
                        <Badge variant={log.level === "error" ? "destructive" : log.level === "warning" ? "secondary" : "outline"}>
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.source}</TableCell>
                      <TableCell>{log.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-bold text-xl">0</p>
                <p className="text-sm text-muted-foreground">Несанкционированных попыток доступа</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-bold text-xl">3</p>
                <p className="text-sm text-muted-foreground">Подозрительных активностей</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-bold text-xl">99.8%</p>
                <p className="text-sm text-muted-foreground">Uptime за 30 дней</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Последние события безопасности</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { event: "5 неудачных попыток входа с IP 95.x.x.x", time: "2ч назад", severity: "warning" },
                { event: "Админ support@prompt-studiya.ru сменил пароль", time: "1д назад", severity: "info" },
                { event: "Бэкап базы данных завершён успешно", time: "6ч назад", severity: "info" },
                { event: "Rate limit для API endpoint /auth/login", time: "4ч назад", severity: "warning" },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2 border rounded text-sm">
                  <Badge variant={e.severity === "warning" ? "secondary" : "outline"}>{e.severity}</Badge>
                  <span className="flex-1">{e.event}</span>
                  <span className="text-xs text-muted-foreground">{e.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Рост пользователей</CardTitle></CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center border rounded text-muted-foreground text-sm">[График регистраций]</div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
                  <div><p className="font-bold">12 847</p><p className="text-muted-foreground">Всего</p></div>
                  <div><p className="font-bold">2.3%</p><p className="text-muted-foreground">Churn</p></div>
                  <div><p className="font-bold">4 520 ₽</p><p className="text-muted-foreground">LTV</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Конверсии</CardTitle></CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center border rounded text-muted-foreground text-sm">[Воронка конверсий]</div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
                  <div><p className="font-bold">45%</p><p className="text-muted-foreground">Рег → Покупка</p></div>
                  <div><p className="font-bold">23%</p><p className="text-muted-foreground">Повторная</p></div>
                  <div><p className="font-bold">182 ₽</p><p className="text-muted-foreground">ARPU</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>География (Россия)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center border rounded text-muted-foreground text-sm">[Карта регионов]</div>
              <div className="grid grid-cols-5 gap-2 mt-3 text-center text-xs">
                {["Москва 34%", "СПб 18%", "Новосибирск 6%", "Екатеринбург 5%", "Казань 4%"].map((r, i) => (
                  <div key={i} className="p-1 border rounded">{r}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAudit;
