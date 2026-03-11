import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Copy, QrCode, Share2, Send, MessageCircle, Mail, Download,
  TrendingUp, Users, DollarSign, Gift, Shield, AlertTriangle,
  Trophy, ArrowUpRight, ArrowDownRight, CreditCard, Clock,
  Search, Filter, ChevronRight, Star, ExternalLink, Ban
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───
interface Referee {
  id: string;
  nickname: string;
  registeredAt: string;
  status: "active" | "inactive";
  totalPurchases: number;
  earned: number;
  level: 1 | 2;
}

interface Earning {
  id: string;
  date: string;
  refereeName: string;
  action: "registration" | "first_purchase" | "commission";
  amount: number;
  status: "pending" | "paid" | "failed";
}

interface Payout {
  id: string;
  date: string;
  amount: number;
  method: "card" | "sbp" | "balance";
  status: "processed" | "pending" | "failed";
  txId: string;
}

interface Violation {
  id: string;
  date: string;
  type: string;
  severity: 1 | 2 | 3;
  description: string;
  status: "warning" | "blocked" | "banned";
}

// ─── Mock Data ───
const REFERRAL_LINK = "https://promt-studiya.ru/ref/usr_abc123xyz";
const PROMO_CODE = "FORGE2024";

const mockReferees: Referee[] = [
  { id: "1", nickname: "alex_dev", registeredAt: "2024-12-15", status: "active", totalPurchases: 12, earned: 380, level: 1 },
  { id: "2", nickname: "maria_art", registeredAt: "2024-12-20", status: "active", totalPurchases: 5, earned: 150, level: 1 },
  { id: "3", nickname: "ivan_pro", registeredAt: "2025-01-05", status: "inactive", totalPurchases: 0, earned: 50, level: 1 },
  { id: "4", nickname: "elena_ai", registeredAt: "2025-01-10", status: "active", totalPurchases: 8, earned: 220, level: 1 },
  { id: "5", nickname: "dmitry_ml", registeredAt: "2025-01-18", status: "active", totalPurchases: 3, earned: 95, level: 2 },
  { id: "6", nickname: "kate_write", registeredAt: "2025-02-01", status: "active", totalPurchases: 1, earned: 65, level: 2 },
];

const mockEarnings: Earning[] = [
  { id: "e1", date: "2025-02-28", refereeName: "alex_dev", action: "commission", amount: 45, status: "paid" },
  { id: "e2", date: "2025-02-25", refereeName: "elena_ai", action: "first_purchase", amount: 15, status: "paid" },
  { id: "e3", date: "2025-02-20", refereeName: "kate_write", action: "registration", amount: 50, status: "paid" },
  { id: "e4", date: "2025-02-18", refereeName: "dmitry_ml", action: "registration", amount: 50, status: "pending" },
  { id: "e5", date: "2025-02-15", refereeName: "maria_art", action: "commission", amount: 22, status: "paid" },
  { id: "e6", date: "2025-02-10", refereeName: "alex_dev", action: "commission", amount: 38, status: "failed" },
];

const mockPayouts: Payout[] = [
  { id: "p1", date: "2025-03-01", amount: 1250, method: "card", status: "processed", txId: "TX-2025030101" },
  { id: "p2", date: "2025-02-01", amount: 890, method: "sbp", status: "processed", txId: "TX-2025020101" },
  { id: "p3", date: "2025-01-01", amount: 500, method: "balance", status: "processed", txId: "TX-2025010101" },
];

const topReferrers = [
  { rank: 1, name: "promo_king", referrals: 145, earned: 28500 },
  { rank: 2, name: "ai_blogger", referrals: 98, earned: 19200 },
  { rank: 3, name: "tech_guru", referrals: 76, earned: 15100 },
  { rank: 4, name: "content_master", referrals: 54, earned: 10800 },
  { rank: 5, name: "digital_nomad", referrals: 41, earned: 8200 },
];

// ─── Referral Reward Info Component ───
function RewardStructure() {
  const rewards = [
    { title: "Регистрация", referrer: "50 ₽", referee: "50 ₽ бонус", desc: "При подтверждении email" },
    { title: "Первая покупка", referrer: "10% комиссии", referee: "Скидка 10%", desc: "Автоматически при checkout" },
    { title: "PRO Автор", referrer: "5% комиссий 3 мес.", referee: "Доступ к платформе", desc: "При получении PRO статуса" },
    { title: "Партнёр-блогер", referrer: "20% комиссии", referee: "Скидка 15%", desc: "По промокоду партнёра" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rewards.map((r) => (
        <Card key={r.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{r.title}</CardTitle>
            <CardDescription className="text-xs">{r.desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Вы получаете:</span><Badge variant="secondary">{r.referrer}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Друг получает:</span><Badge variant="outline">{r.referee}</Badge></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Component ───
export default function ReferralPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState("dashboard");
  const [searchReferee, setSearchReferee] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [earningFilter, setEarningFilter] = useState("all");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("card");
  const [promoInput, setPromoInput] = useState(PROMO_CODE);

  // Stats
  const totalEarned = mockEarnings.filter(e => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const pendingEarned = mockEarnings.filter(e => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const activeReferees = mockReferees.filter(r => r.status === "active").length;
  const viralCoefficient = (mockReferees.length / 100).toFixed(2);
  const conversionRate = ((mockReferees.filter(r => r.totalPurchases > 0).length / mockReferees.length) * 100).toFixed(1);

  // Filtered referees
  const filteredReferees = useMemo(() => {
    return mockReferees.filter(r => {
      if (searchReferee && !r.nickname.toLowerCase().includes(searchReferee.toLowerCase())) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [searchReferee, statusFilter]);

  // Filtered earnings
  const filteredEarnings = useMemo(() => {
    return mockEarnings.filter(e => {
      if (earningFilter !== "all" && e.action !== earningFilter) return false;
      return true;
    });
  }, [earningFilter]);

  const copyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    toast({ title: "Ссылка скопирована", description: "Реферальная ссылка скопирована в буфер обмена" });
  };

  const copyPromo = () => {
    navigator.clipboard.writeText(promoInput);
    toast({ title: "Промокод скопирован" });
  };

  const shareVia = (platform: string) => {
    const msg = encodeURIComponent(`Присоединяйся в Промт-Студию для AI промптов! Используй мою ссылку для бонуса: ${REFERRAL_LINK}`);
    const urls: Record<string, string> = {
      telegram: `https://t.me/share/url?url=${encodeURIComponent(REFERRAL_LINK)}&text=${msg}`,
      vk: `https://vk.com/share.php?url=${encodeURIComponent(REFERRAL_LINK)}&title=${msg}`,
      whatsapp: `https://wa.me/?text=${msg}`,
      email: `mailto:?subject=${encodeURIComponent("Присоединяйся в Промт-Студию")}&body=${msg}`,
    };
    window.open(urls[platform], "_blank");
  };

  const requestWithdraw = () => {
    const amt = parseInt(withdrawAmount);
    if (!amt || amt < 500) {
      toast({ title: "Ошибка", description: "Минимальная сумма вывода — 500 ₽", variant: "destructive" });
      return;
    }
    if (amt > totalEarned) {
      toast({ title: "Ошибка", description: "Недостаточно средств", variant: "destructive" });
      return;
    }
    toast({ title: "Заявка отправлена", description: `Вывод ${amt} ₽ через ${withdrawMethod === "card" ? "карту" : withdrawMethod === "sbp" ? "СБП" : "баланс"}. Обработка 1-3 рабочих дня.` });
    setWithdrawAmount("");
  };

  const exportCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(r => Object.values(r).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Экспорт завершён" });
  };

  const actionLabel = (a: string) => {
    const m: Record<string, string> = { registration: "Регистрация", first_purchase: "Первая покупка", commission: "Комиссия" };
    return m[a] || a;
  };

  const statusBadge = (s: string) => {
    const v: Record<string, "default" | "secondary" | "destructive" | "outline"> = { paid: "default", pending: "secondary", failed: "destructive", processed: "default", active: "default", inactive: "outline" };
    const l: Record<string, string> = { paid: "Выплачено", pending: "Ожидание", failed: "Ошибка", processed: "Обработано", active: "Активен", inactive: "Неактивен" };
    return <Badge variant={v[s] || "outline"}>{l[s] || s}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Реферальная программа</h1>
        <p className="text-muted-foreground text-sm">Приглашайте друзей и зарабатывайте вместе</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="dashboard">Обзор</TabsTrigger>
          <TabsTrigger value="referees">Рефералы</TabsTrigger>
          <TabsTrigger value="earnings">Доходы</TabsTrigger>
          <TabsTrigger value="payouts">Выплаты</TabsTrigger>
          <TabsTrigger value="rewards">Награды</TabsTrigger>
          <TabsTrigger value="leaderboard">Рейтинг</TabsTrigger>
          <TabsTrigger value="antifraud">Безопасность</TabsTrigger>
        </TabsList>

        {/* ─── Dashboard ─── */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Всего рефералов", value: mockReferees.length, icon: Users, trend: "+3 за месяц" },
              { label: "Активных", value: activeReferees, icon: TrendingUp, trend: `${((activeReferees / mockReferees.length) * 100).toFixed(0)}%` },
              { label: "Заработано", value: `${totalEarned} ₽`, icon: DollarSign, trend: `+${pendingEarned} ₽ ожидание` },
              { label: "Доступно к выводу", value: `${totalEarned} ₽`, icon: CreditCard, trend: "Мин. 500 ₽" },
            ].map((s, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{s.trend}</span>
                  </div>
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Referral Link + QR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ваша реферальная ссылка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={REFERRAL_LINK} readOnly className="text-xs" />
                  <Button size="sm" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
                </div>
                <div className="flex gap-2">
                  <Input value={promoInput} onChange={e => setPromoInput(e.target.value)} className="text-xs" placeholder="Промокод" />
                  <Button size="sm" variant="outline" onClick={copyPromo}><Copy className="h-4 w-4" /></Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => shareVia("telegram")}><Send className="h-4 w-4 mr-1" />Telegram</Button>
                  <Button size="sm" variant="outline" onClick={() => shareVia("vk")}>VK</Button>
                  <Button size="sm" variant="outline" onClick={() => shareVia("whatsapp")}><MessageCircle className="h-4 w-4 mr-1" />WA</Button>
                  <Button size="sm" variant="outline" onClick={() => shareVia("email")}><Mail className="h-4 w-4 mr-1" />Email</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">QR-код</CardTitle>
                <CardDescription className="text-xs">Сканируйте или скачайте для оффлайн</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                <div className="w-40 h-40 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                </div>
                <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />Скачать PNG</Button>
              </CardContent>
            </Card>
          </div>

          {/* Analytics mini */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground mb-1">Вирусный коэффициент</div>
                <div className="text-2xl font-bold">{viralCoefficient}</div>
                <Progress value={parseFloat(viralCoefficient) * 100} className="mt-2 h-2" />
                <div className="text-xs text-muted-foreground mt-1">Цель: 1.0+</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground mb-1">Конверсия в покупку</div>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <Progress value={parseFloat(conversionRate)} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground mb-1">Уровни рефералов</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>Уровень 1 (прямые)</span><span className="font-medium">{mockReferees.filter(r => r.level === 1).length}</span></div>
                  <div className="flex justify-between"><span>Уровень 2 (непрямые)</span><span className="font-medium">{mockReferees.filter(r => r.level === 2).length}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <RewardStructure />
        </TabsContent>

        {/* ─── Referees ─── */}
        <TabsContent value="referees" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Поиск по нику..." value={searchReferee} onChange={e => setSearchReferee(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ник</TableHead>
                  <TableHead>Уровень</TableHead>
                  <TableHead>Дата рег.</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Покупки</TableHead>
                  <TableHead>Заработок</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferees.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nickname}</TableCell>
                    <TableCell><Badge variant="outline">Ур. {r.level}</Badge></TableCell>
                    <TableCell className="text-sm">{r.registeredAt}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell>{r.totalPurchases}</TableCell>
                    <TableCell className="font-medium">{r.earned} ₽</TableCell>
                  </TableRow>
                ))}
                {filteredReferees.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Рефералы не найдены</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── Earnings ─── */}
        <TabsContent value="earnings" className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-between">
            <Select value={earningFilter} onValueChange={setEarningFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Тип" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="registration">Регистрация</SelectItem>
                <SelectItem value="first_purchase">Первая покупка</SelectItem>
                <SelectItem value="commission">Комиссия</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => exportCSV(mockEarnings, "referral_earnings")}><Download className="h-4 w-4 mr-1" />CSV</Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Реферал</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEarnings.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm">{e.date}</TableCell>
                    <TableCell className="font-medium">{e.refereeName}</TableCell>
                    <TableCell><Badge variant="outline">{actionLabel(e.action)}</Badge></TableCell>
                    <TableCell className="font-medium">{e.amount} ₽</TableCell>
                    <TableCell>{statusBadge(e.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── Payouts ─── */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Вывод средств</CardTitle>
              <CardDescription className="text-xs">Минимум 500 ₽. Обработка 1-3 рабочих дня. PRO — 0% комиссии, Free — 2%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input type="number" placeholder="Сумма (мин. 500 ₽)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Карта</SelectItem>
                    <SelectItem value="sbp">СБП</SelectItem>
                    <SelectItem value="balance">Баланс</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={requestWithdraw}>Вывести</Button>
              </div>
              <div className="text-xs text-muted-foreground">Автовыплата 1-го числа каждого месяца за предыдущий период</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">История выплат</CardTitle></CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Метод</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>ID транзакции</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayouts.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{p.date}</TableCell>
                    <TableCell className="font-medium">{p.amount} ₽</TableCell>
                    <TableCell>{p.method === "card" ? "Карта" : p.method === "sbp" ? "СБП" : "Баланс"}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.txId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── Rewards ─── */}
        <TabsContent value="rewards" className="space-y-4">
          <RewardStructure />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Уровни рефералов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Уровень 1 — Прямые</div>
                    <div className="text-xs text-muted-foreground">100% всех наград</div>
                  </div>
                  <Badge>Безлимит</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Уровень 2 — Непрямые</div>
                    <div className="text-xs text-muted-foreground">5% всех наград. Макс. 1000 рефералов</div>
                  </div>
                  <Badge variant="secondary">Макс. 1000</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Партнёрский промокод</CardTitle>
              <CardDescription className="text-xs">Для блогеров и партнёров. 20% от комиссии по промокоду</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={promoInput} onChange={e => setPromoInput(e.target.value)} />
                <Button size="sm" onClick={copyPromo}><Copy className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Leaderboard ─── */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4" />Топ рефереров (месяц)</CardTitle>
              <CardDescription className="text-xs">Топ-10 получают бонусные награды: PRO-продление или бонусные кредиты</CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Место</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Рефералы</TableHead>
                  <TableHead>Заработок</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topReferrers.map(t => (
                  <TableRow key={t.rank}>
                    <TableCell>
                      {t.rank <= 3 ? (
                        <span className="text-lg">{t.rank === 1 ? "🥇" : t.rank === 2 ? "🥈" : "🥉"}</span>
                      ) : t.rank}
                    </TableCell>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.referrals}</TableCell>
                    <TableCell className="font-medium">{t.earned.toLocaleString()} ₽</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── Anti-Fraud ─── */}
        <TabsContent value="antifraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />Антифрод защита</CardTitle>
              <CardDescription className="text-xs">Система автоматически отслеживает подозрительную активность</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "IP-детекция", desc: "Множественные регистрации с одного IP за 24ч", status: "Активно" },
                { title: "Платёжная детекция", desc: "Одна карта/СБП на нескольких аккаунтах", status: "Активно" },
                { title: "Бот-детекция", desc: "CAPTCHA и поведенческий анализ", status: "Активно" },
                { title: "Самореферал", desc: "Фингерпринт устройства и браузера", status: "Активно" },
              ].map(f => (
                <div key={f.title} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                  <Badge variant="default">{f.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Политика нарушений</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { n: 1, action: "Предупреждение", desc: "Заморозка доходов, возможность обжалования" },
                { n: 2, action: "Блокировка", desc: "Все доходы конфискованы, приостановка на 30 дней" },
                { n: 3, action: "Бан", desc: "Перманентный бан из программы, возможна блокировка аккаунта" },
              ].map(v => (
                <div key={v.n} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${v.n === 1 ? "bg-yellow-100 text-yellow-700" : v.n === 2 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>{v.n}</div>
                  <div>
                    <div className="font-medium text-sm">{v.action}</div>
                    <div className="text-xs text-muted-foreground">{v.desc}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
