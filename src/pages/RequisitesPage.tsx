import { Link } from "react-router-dom";

export default function RequisitesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/support" className="hover:underline">Поддержка</Link> &gt; <Link to="/support/about" className="hover:underline">О сервисе</Link> &gt; Реквизиты
      </nav>
      <h1 className="text-2xl font-bold mb-4">Реквизиты</h1>
      <p>ООО «СтартТехПро»</p>
      <p>ИНН: [указать]</p>
      <p>КПП: [указать]</p>
      <p>ОГРН: [указать]</p>
      <p>Юридический адрес: [указать]</p>
      <p>Email: [указать]</p>
      <Link to="/support/about" className="mt-4 inline-block text-primary hover:underline">← Назад</Link>
    </div>
  );
}