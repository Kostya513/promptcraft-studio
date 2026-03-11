import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Search, Ban, Shield, Eye, Edit, Trash2, Key, UserCheck, MoreHorizontal, FileText
} from "lucide-react";

// user list is fetched from backend
const MOCK_USERS: Array<Record<string, any>> = [];

const AdminUsers = () => {
  const { logAction, hasPermission } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [banDialogUser, setBanDialogUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("permanent");
  const [users, setUsers] = useState(MOCK_USERS);

  const filtered = users.filter(u => {
    if (search && !u.email.includes(search) && !u.name.includes(search) && !u.id.includes(search)) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  const handleBan = () => {
    if (!banDialogUser) return;
    setUsers(prev => prev.map(u => u.id === banDialogUser.id ? { ...u, status: u.status === "banned" ? "active" : "banned" } : u));
    logAction(banDialogUser.status === "banned" ? "unban_user" : "ban_user", "user", banDialogUser.id, undefined, banReason);
    setBanDialogUser(null);
    setBanReason("");
  };

  const handleDeleteUser = (user: typeof MOCK_USERS[0]) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    logAction("delete_user", "user", user.id);
  };

  const handleResetPassword = (user: typeof MOCK_USERS[0]) => {
    logAction("reset_password", "user", user.id);
  };

  const handleChangeRole = (user: typeof MOCK_USERS[0], newRole: string) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    logAction("change_role", "user", user.id, user.role, newRole);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Управление пользователями</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Поиск по email, имени, ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="banned">Забаненные</SelectItem>
            <SelectItem value="unverified">Неподтверждённые</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Роль" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все роли</SelectItem>
            <SelectItem value="user">Пользователь</SelectItem>
            <SelectItem value="author">Автор</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">Найдено: {filtered.length}</p>

      {/* User Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Регистрация</TableHead>
                <TableHead>Последний вход</TableHead>
                <TableHead>Покупки</TableHead>
                <TableHead>Продажи</TableHead>
                <TableHead>Баланс</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 20).map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : user.status === "banned" ? "destructive" : "secondary"}>
                      {user.status === "active" ? "Активен" : user.status === "banned" ? "Забанен" : "Не подтверждён"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{user.registrationDate}</TableCell>
                  <TableCell className="text-xs">{user.lastLogin}</TableCell>
                  <TableCell>{user.totalPurchases}</TableCell>
                  <TableCell>{user.totalSales}</TableCell>
                  <TableCell>{user.balance.toLocaleString()} ₽</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)} title="Подробнее"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setBanDialogUser(user)} title={user.status === "banned" ? "Разбанить" : "Забанить"}>
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleResetPassword(user)} title="Сбросить пароль"><Key className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)} title="Удалить"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Пользователь: {selectedUser?.name}</DialogTitle></DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Профиль</TabsTrigger>
                <TabsTrigger value="finance">Финансы</TabsTrigger>
                <TabsTrigger value="activity">Активность</TabsTrigger>
                <TabsTrigger value="notes">Заметки</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><Label>ID:</Label> <span className="font-mono">{selectedUser.id}</span></div>
                  <div><Label>Email:</Label> {selectedUser.email}</div>
                  <div><Label>Статус:</Label> <Badge variant={selectedUser.status === "active" ? "default" : "destructive"}>{selectedUser.status}</Badge></div>
                  <div><Label>Верификация:</Label> {selectedUser.verificationLevel}</div>
                  <div><Label>2FA:</Label> {selectedUser.twoFactorEnabled ? "Включена" : "Выключена"}</div>
                  <div><Label>Роль:</Label>
                    <Select value={selectedUser.role} onValueChange={v => handleChangeRole(selectedUser, v)}>
                      <SelectTrigger className="w-32 h-8 inline-flex ml-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Пользователь</SelectItem>
                        <SelectItem value="author">Автор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Bio:</Label><p className="text-sm text-muted-foreground">{selectedUser.bio}</p></div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Имперсонация</Button>
                  <Button variant="outline" size="sm"><UserCheck className="h-4 w-4 mr-1" /> Верифицировать</Button>
                </div>
              </TabsContent>
              <TabsContent value="finance" className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><Label>Баланс:</Label> {selectedUser.balance.toLocaleString()} ₽</div>
                  <div><Label>Всего заработано:</Label> {(selectedUser.totalSales * 450).toLocaleString()} ₽</div>
                  <div><Label>Всего потрачено:</Label> {(selectedUser.totalPurchases * 350).toLocaleString()} ₽</div>
                  <div><Label>Ожидает выплаты:</Label> 0 ₽</div>
                </div>
              </TabsContent>
              <TabsContent value="activity" className="space-y-2">
                {["Вход в систему", "Покупка промпта #4521", "Изменение пароля", "Публикация промпта", "Отзыв на промпт"].map((e, i) => (
                  <div key={i} className="flex justify-between text-sm border-b pb-1">
                    <span>{e}</span>
                    <span className="text-muted-foreground">{i + 1} дн. назад</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="notes" className="space-y-3">
                <Textarea placeholder="Внутренняя заметка (видна только админам)..." />
                <Button size="sm">Сохранить заметку</Button>
                <div className="text-sm text-muted-foreground">Нет заметок</div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={!!banDialogUser} onOpenChange={() => setBanDialogUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{banDialogUser?.status === "banned" ? "Разбанить" : "Забанить"} {banDialogUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {banDialogUser?.status !== "banned" && (
              <>
                <div>
                  <Label>Причина</Label>
                  <Textarea value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Укажите причину бана..." />
                </div>
                <div>
                  <Label>Длительность</Label>
                  <Select value={banDuration} onValueChange={setBanDuration}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 часа</SelectItem>
                      <SelectItem value="7d">7 дней</SelectItem>
                      <SelectItem value="30d">30 дней</SelectItem>
                      <SelectItem value="permanent">Навсегда</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBanDialogUser(null)}>Отмена</Button>
              <Button variant={banDialogUser?.status === "banned" ? "default" : "destructive"} onClick={handleBan}>
                {banDialogUser?.status === "banned" ? "Разбанить" : "Забанить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
