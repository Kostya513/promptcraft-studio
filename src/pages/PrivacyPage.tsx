import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/support" className="hover:underline">Поддержка</Link> &gt; <Link to="/support/about" className="hover:underline">О сервисе</Link> &gt; Политика конфиденциальности
      </nav>
      <h1 className="text-2xl font-bold mb-4">Политика конфиденциальности</h1>
      <p>Документ в разработке. Будет опубликован в ближайшее время.</p>
      <Link to="/support/about" className="mt-4 inline-block text-primary hover:underline">← Назад</Link>
    </div>
  );
}