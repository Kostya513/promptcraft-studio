import { Link } from "react-router-dom";

export default function ContactsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/support" className="hover:underline">Поддержка</Link> &gt; <Link to="/support/about" className="hover:underline">О сервисе</Link> &gt; Контакты
      </nav>
      <h1 className="text-2xl font-bold mb-4">Контакты</h1>
      <p>Email поддержки: support@example.com</p>
      <p>Телефон: +7 (123) 456-78-90</p>
      <p>Часы работы: Пн–Пт 9:00–18:00 (МСК)</p>
      <div className="mt-4">
        <textarea placeholder="Введите сообщение" className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={4} />
        <button className="mt-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Отправить</button>
      </div>
      <Link to="/support/about" className="mt-4 inline-block text-primary hover:underline">← Назад</Link>
    </div>
  );
}