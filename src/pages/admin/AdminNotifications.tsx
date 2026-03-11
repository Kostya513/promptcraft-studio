import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/contexts/AdminContext";
import { Bell, Send, Clock, Eye, Users, Filter } from "lucide-react";

// templates fetched from backend
const MOCK_TEMPLATES: { id: string; name: string; type: string; variables: string[]; enabled: boolean }[] = [];

// logs come from backend
const MOCK_LOGS: { id: string; type: string; recipient: string; template: string; status: string; timestamp: string; error: string | null }[] = [];

const AdminNotifications = () => {
  const { logAction } = useAdmin();
  const [tab, setTab] = useState("templates");
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastSegment, setBroadcastSegment] = useState("all");
  const [broadcastChannel, setBroadcastChannel] = useState("push");

  const toggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
    logAction("toggle_template", "notification_template", id);
  };

  const sendBroadcast = () => {
    logAction("send_broadcast", "notification", "broadcast", undefined, `${broadcastSegment}: ${broadcastTitle}`);
    setBroadcastTitle("");
    setBroadcastBody("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Уведомления</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="logs">Логи</TabsTrigger>
          <TabsTrigger value="broadcast">Рассылка</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templates.map(tpl => (
            <Card key={tpl.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{tpl.name}</p>
                    <Badge variant="outline">{tpl.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Переменные: {tpl.variables.join(", ")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={tpl.enabled} onCheckedChange={() => toggleTemplate(tpl.id)} />
                  <Button variant="outline" size="sm">Редактировать</Button>
                  <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline">+ Создать шаблон</Button>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Получатель</TableHead>
                    <TableHead>Шаблон</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_LOGS.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">{log.id}</TableCell>
                      <TableCell><Badge variant="outline">{log.type}</Badge></TableCell>
                      <TableCell>{log.recipient}</TableCell>
                      <TableCell>{log.template}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === "sent" ? "default" : "destructive"}>
                          {log.status === "sent" ? "Отправлено" : "Ошибка"}
                        </Badge>
                        {log.error && <span className="text-xs text-destructive ml-1">({log.error})</span>}
                      </TableCell>
                      <TableCell className="text-xs">{new Date(log.timestamp).toLocaleString("ru")}</TableCell>
                      <TableCell>
                        {log.status === "failed" && <Button size="sm" variant="outline">Повторить</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Массовая рассылка</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Сегмент</Label>
                  <Select value={broadcastSegment} onValueChange={setBroadcastSegment}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все пользователи</SelectItem>
                      <SelectItem value="authors">Авторы</SelectItem>
                      <SelectItem value="buyers">Покупатели</SelectItem>
                      <SelectItem value="pro">PRO пользователи</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Канал</Label>
                  <Select value={broadcastChannel} onValueChange={setBroadcastChannel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Заголовок</Label>
                <Input value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} />
              </div>
              <div>
                <Label>Содержание</Label>
                <Textarea value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)} rows={4} />
              </div>
              <div className="flex gap-2">
                <Button onClick={sendBroadcast} disabled={!broadcastTitle || !broadcastBody}>
                  <Send className="h-4 w-4 mr-1" /> Отправить сейчас
                </Button>
                <Button variant="outline"><Clock className="h-4 w-4 mr-1" /> Запланировать</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNotifications;
