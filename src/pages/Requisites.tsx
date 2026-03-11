import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const requisitesData = `ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА»

Сокращённое наименование:
ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА»

Юридический адрес организации:
307041, РОССИЯ, КУРСКАЯ ОБЛАСТЬ, М.Р-Н МЕДВЕНСКИЙ, С.П. ГОСТОМЛЯНСКИЙ СЕЛЬСОВЕТ, С 1-Я ГОСТОМЛЯ, Д. 156

ИНН:
4600004389

КПП:
460001001

ОГРН/ОГРНИП:
1254600001028

Расчётный счёт:
40702810210001873721

Банк:
АО «ТБанк»

ИНН банка:
7710140679

БИК банка:
044525974

Корреспондентский счёт банка:
30101810145250000974

Юридический адрес банка:
127287, г. Москва, ул. Хуторская 2-я, д. 38А, стр. 26
`;

export default function Requisites() {
  const [showTop, setShowTop] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(requisitesData);
      toast({ title: "Реквизиты скопированы" });
    } catch (e) {
      console.error(e);
    }
  };
  const printPage = () => window.print();
  const downloadPdf = () => window.print();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 scroll-smooth">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/support" className="hover:underline">
          Поддержка
        </Link>{" "}&gt;{" "}
        <Link to="/support/about" className="hover:underline">
          О сервисе
        </Link>{" "}&gt; Реквизиты
      </nav>
      <Link
        to="/support/about"
        className="text-primary hover:underline mb-2 inline-block"
      >
        ← Вернуться назад
      </Link>
      <h1 className="text-2xl font-bold mb-4">Реквизиты</h1>

      <div className="p-4 border border-border bg-muted mb-6">
        <pre className="whitespace-pre-wrap text-sm">{requisitesData}</pre>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={copyAll}
          className="px-3 py-2 bg-accent text-white rounded-md text-sm"
        >
          Копировать все реквизиты
        </button>
        <button
          onClick={downloadPdf}
          className="px-3 py-2 bg-primary text-white rounded-md text-sm"
        >
          Скачать PDF
        </button>
        <button
          onClick={printPage}
          className="px-3 py-2 bg-secondary text-white rounded-md text-sm"
        >
          Распечатать
        </button>
      </div>

      {showTop && (
        <button
          onClick={scrollToTop}
          aria-label="Наверх"
          className="fixed bottom-4 right-4 p-3 bg-primary text-white rounded-full shadow-lg"
        >
          ↑
        </button>
      )}
    </div>
  );
}
