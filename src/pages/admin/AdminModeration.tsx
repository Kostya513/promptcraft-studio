import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdmin } from "@/contexts/AdminContext";
import {
  CheckCircle, XCircle, Eye, AlertTriangle, Search, Filter, GripVertical, Settings
} from "lucide-react";

const CATEGORIES = [
  { id: "text", name: "Текст и копирайтинг", commission: 15, enabled: true, subs: ["Статьи","Переводы","Письма","Креатив"] },
  { id: "visual", name: "Визуал и дизайн", commission: 15, enabled: true, subs: ["Фотореализм","Логотипы","UI/UX","Текстуры","3D"] },
  { id: "video", name: "Видео и аудио", commission: 15, enabled: true, subs: ["Видео","Монтаж","Музыка","Озвучка"] },
  { id: "code", name: "Код и разработка", commission: 12, enabled: true, subs: ["Сайты","Скрипты","Базы данных","Отладка"] },
  { id: "business", name: "Бизнес и маркетинг", commission: 15, enabled: true, subs: ["SMM","Продажи","HR","Финансы","Юриспруденция"] },
  { id: "education", name: "Образование и наука", commission: 10, enabled: true, subs: ["Уроки","Термины","Конспекты","Статьи"] },
  { id: "lifestyle", name: "Лайфстайл и личное", commission: 15, enabled: true, subs: ["Путешествия","Здоровье","Хобби","Психология"] },
];

// moderation queue items loaded from backend
const MOCK_QUEUE: Array<Record<string, any>> = [];

// reports will come from backend
const MOCK_REPORTS: Array<Record<string, any>> = [];

const AdminModeration = () => {
  const { logAction } = useAdmin();
  const [tab, setTab] = useState("queue");
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedPrompt, setSelectedPrompt] = useState<typeof MOCK_QUEUE[0] | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categories, setCategories] = useState(CATEGORIES);

  const pendingQueue = queue.filter(p => p.status === "pending");
  const filtered = pendingQueue.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.id.includes(search)) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (riskFilter === "low" && p.aiRiskScore > 30) return false;
    if (riskFilter === "medium" && (p.aiRiskScore <= 30 || p.aiRiskScore > 70)) return false;
    if (riskFilter === "high" && p.aiRiskScore <= 70) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    setQueue(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
    logAction("approve_prompt", "prompt", id);
  };

  const handleReject = (id: string, reason: string) => {
    setQueue(prev => prev.map(p => p.id === id ? { ...p, status: "rejected" } : p));
    logAction("reject_prompt", "prompt", id, undefined, reason);
    setSelectedPrompt(null);
    setRejectReason("");
  };

  const handleBatchApprove = () => {
    selectedIds.forEach(id => handleApprove(id));
    setSelectedIds([]);
  };

  const handleBatchReject = (reason: string) => {
    selectedIds.forEach(id => handleReject(id, reason));
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Модерация контента</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="queue">Очередь ({pendingQueue.length})</TabsTrigger>
          <TabsTrigger value="reports">Жалобы ({MOCK_REPORTS.length})</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Поиск по названию, ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Категория" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Риск" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни</SelectItem>
                <SelectItem value="low">Низкий (0-30)</SelectItem>
                <SelectItem value="medium">Средний (31-70)</SelectItem>
                <SelectItem value="high">Высокий (71-100)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex gap-2 items-center p-3 border rounded bg-muted">
              <span className="text-sm">Выбрано: {selectedIds.length}</span>
              <Button size="sm" onClick={handleBatchApprove}><CheckCircle className="h-4 w-4 mr-1" /> Одобрить все</Button>
              <Button size="sm" variant="destructive" onClick={() => handleBatchReject("Не соответствует правилам")}>
                <XCircle className="h-4 w-4 mr-1" /> Отклонить все
              </Button>
            </div>
          )}

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Автор</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>AI Риск</TableHead>
                    <TableHead>Плагиат</TableHead>
                    <TableHead>Качество</TableHead>
                    <TableHead>Подана</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell><Checkbox checked={selectedIds.includes(p.id)} onCheckedChange={() => toggleSelect(p.id)} /></TableCell>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{p.title}</TableCell>
                      <TableCell>
                        <span>{p.author}</span>
                        {p.authorVerified && <Badge variant="outline" className="ml-1 text-xs">✓</Badge>}
                      </TableCell>
                      <TableCell className="text-xs">{p.category}</TableCell>
                      <TableCell>{p.price === 0 ? "Бесплатно" : `${p.price} ₽`}</TableCell>
                      <TableCell>
                        <Badge variant={p.aiRiskScore > 70 ? "destructive" : p.aiRiskScore > 30 ? "secondary" : "default"}>
                          {p.aiRiskScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>{p.plagiarismScore}%</TableCell>
                      <TableCell>{p.qualityScore}%</TableCell>
                      <TableCell className="text-xs">{new Date(p.submissionDate).toLocaleDateString("ru")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedPrompt(p)} title="Просмотр"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(p.id)} title="Одобрить"><CheckCircle className="h-4 w-4 text-primary" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedPrompt(p); setRejectReason(""); }} title="Отклонить"><XCircle className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {MOCK_REPORTS.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="font-medium">{r.reason}</span>
                    <span className="text-xs text-muted-foreground">{r.timestamp}</span>
                  </div>
                  <p className="text-sm">Промпт: <span className="font-mono">{r.promptId}</span> • Жалоба от: {r.reporter}</p>
                  <p className="text-sm text-muted-foreground">{r.evidence}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="destructive">Удалить контент</Button>
                  <Button size="sm" variant="outline">Предупредить</Button>
                  <Button size="sm" variant="ghost">Отклонить</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {categories.map((cat, idx) => (
            <Card key={cat.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">Подкатегории: {cat.subs.join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Комиссия: {cat.commission}%</span>
                    <Badge variant={cat.enabled ? "default" : "secondary"}>{cat.enabled ? "Активна" : "Отключена"}</Badge>
                    <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Prompt Review Modal */}
      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Просмотр: {selectedPrompt?.title}</DialogTitle></DialogHeader>
          {selectedPrompt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>ID: <span className="font-mono">{selectedPrompt.id}</span></div>
                <div>Автор: {selectedPrompt.author} {selectedPrompt.authorVerified && "✓"}</div>
                <div>Категория: {selectedPrompt.category}</div>
                <div>Цена: {selectedPrompt.price === 0 ? "Бесплатно" : `${selectedPrompt.price} ₽`}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Card><CardContent className="p-3 text-center"><p className="text-sm text-muted-foreground">AI Риск</p><p className="text-xl font-bold">{selectedPrompt.aiRiskScore}%</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-sm text-muted-foreground">Плагиат</p><p className="text-xl font-bold">{selectedPrompt.plagiarismScore}%</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-sm text-muted-foreground">Качество</p><p className="text-xl font-bold">{selectedPrompt.qualityScore}%</p></CardContent></Card>
              </div>
              <div className="border rounded p-3 text-sm text-muted-foreground">[Превью медиа промпта]</div>
              <div>
                <Textarea placeholder="Причина отклонения..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={() => { handleApprove(selectedPrompt.id); setSelectedPrompt(null); }}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Одобрить
                </Button>
                <Button variant="secondary" onClick={() => setSelectedPrompt(null)}>Запросить правки</Button>
                <Button variant="destructive" onClick={() => handleReject(selectedPrompt.id, rejectReason)} disabled={!rejectReason}>
                  <XCircle className="h-4 w-4 mr-1" /> Отклонить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModeration;
