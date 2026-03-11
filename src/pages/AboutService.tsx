import { Link } from "react-router-dom";
import { Info, FileText, Shield, File, CreditCard, Phone, HelpCircle } from "lucide-react";

export default function AboutService() {
  const cards = [
    { key: "about", title: "О нас", desc: "Философия, миссия, видение сервиса", icon: Info, path: "/about" },
    { key: "offer", title: "Публичная оферта", desc: "Юридический документ", icon: FileText, path: "/support/about/offer" },
    { key: "privacy", title: "Политика конфиденциальности", desc: "Обработка персональных данных пользователей", icon: Shield, path: "/support/about/privacy" },
    { key: "terms", title: "Условия использования", desc: "Правила сервиса", icon: File, path: "/support/about/terms" },
    { key: "requisites", title: "Реквизиты", desc: "Информация о компании ООО «СтартТехПро»", icon: CreditCard, path: "/support/about/requisites" },
    { key: "contacts", title: "Контакты", desc: "Способы связи с поддержкой", icon: Phone, path: "/support/about/contacts" },
    { key: "faq", title: "FAQ", desc: "Часто задаваемые вопросы", icon: HelpCircle, path: "/support/about/faq" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/support" className="hover:underline">Поддержка</Link> &gt; <span className="hover:underline">О сервисе</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6">О сервисе</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        {cards.map(c => (
          <Link key={c.key} to={c.path} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
            <c.icon className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold text-sm">{c.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
