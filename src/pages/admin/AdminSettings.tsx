import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/contexts/AdminContext";

const AdminSettings = () => {
  const { logAction } = useAdmin();
  const [tab, setTab] = useState("general");

  const handleSave = (section: string) => {
    logAction("update_settings", "platform_settings", section);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Настройки платформы</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="financial">Финансы</TabsTrigger>
          <TabsTrigger value="content">Контент</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="legal">Юридические</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Основные</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Название платформы</Label><Input defaultValue="Промт-Студия" /></div>
                <div><Label>Язык по умолчанию</Label>
                  <Select defaultValue="ru"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="ru">Русский</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Валюта</Label><Input defaultValue="RUB" disabled /></div>
                <div><Label>Часовой пояс</Label><Input defaultValue="Europe/Moscow" disabled /></div>
              </div>
              <div className="flex items-center gap-3">
                <Switch /><Label>Режим обслуживания</Label>
              </div>
              <Textarea placeholder="Сообщение для режима обслуживания..." />
              <Button onClick={() => handleSave("general")}>Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Финансовые настройки</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Комиссия по умолчанию (%)</Label><Input type="number" defaultValue="15" /></div>
                <div><Label>Мин. сумма выплаты (₽)</Label><Input type="number" defaultValue="500" /></div>
                <div><Label>Окно возврата (часы)</Label><Input type="number" defaultValue="72" /></div>
                <div><Label>График выплат</Label>
                  <Select defaultValue="weekly"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="daily">Ежедневно</SelectItem><SelectItem value="weekly">Еженедельно</SelectItem><SelectItem value="manual">Вручную</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Платёжные методы</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span className="text-sm">Карта</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span className="text-sm">СБП</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span className="text-sm">Баланс</span></div>
                </div>
              </div>
              <Button onClick={() => handleSave("financial")}>Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Настройки контента</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Порог авто-одобрения AI (%)</Label><Input type="number" defaultValue="90" /></div>
                <div><Label>Макс. размер файла (МБ)</Label><Input type="number" defaultValue="50" /></div>
                <div><Label>Мин. цена промпта (₽)</Label><Input type="number" defaultValue="99" /></div>
                <div><Label>Макс. цена промпта (₽)</Label><Input type="number" defaultValue="99999" /></div>
                <div><Label>Чувствительность NSFW фильтра</Label>
                  <Select defaultValue="medium"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="low">Низкая</SelectItem><SelectItem value="medium">Средняя</SelectItem><SelectItem value="high">Высокая</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Порог плагиата (%)</Label><Input type="number" defaultValue="30" /></div>
              </div>
              <Button onClick={() => handleSave("content")}>Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Настройки пользователей</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Регистрация открыта</Label></div>
                <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Подтверждение email обязательно</Label></div>
                <div className="flex items-center gap-3"><Switch /><Label>Подтверждение телефона (для авторов)</Label></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Мин. возраст</Label><Input type="number" defaultValue="18" /></div>
                <div><Label>Тайм-аут сессии (мин)</Label><Input type="number" defaultValue="60" /></div>
              </div>
              <Button onClick={() => handleSave("users")}>Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Безопасность</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3"><Switch defaultChecked /><Label>2FA обязателен для админов</Label></div>
                <div className="flex items-center gap-3"><Switch /><Label>2FA обязателен для всех</Label></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Ротация паролей (дни)</Label><Input type="number" defaultValue="90" /></div>
                <div><Label>Макс. неудачных попыток входа</Label><Input type="number" defaultValue="5" /></div>
                <div><Label>Тайм-аут сессии админа (мин)</Label><Input type="number" defaultValue="30" /></div>
                <div><Label>API rate limit (req/min)</Label><Input type="number" defaultValue="60" /></div>
              </div>
              <div>
                <Label>IP белый список (админ)</Label>
                <Textarea defaultValue="127.0.0.1&#10;192.168.1.0/24" rows={3} />
              </div>
              <Button onClick={() => handleSave("security")}>Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Юридические документы</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Публичная оферта", version: "v2.3", updated: "15.01.2026" },
                { name: "Политика конфиденциальности (152-ФЗ)", version: "v1.8", updated: "01.02.2026" },
                { name: "Пользовательское соглашение", version: "v3.1", updated: "20.01.2026" },
                { name: "Политика возвратов", version: "v1.2", updated: "10.12.2025" },
                { name: "Процедура DMCA", version: "v1.0", updated: "01.01.2026" },
                { name: "Политика cookies", version: "v1.1", updated: "15.11.2025" },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.version} • Обновлено: {doc.updated}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">Редактировать</Button>
                    <Button variant="ghost" size="sm">История</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
