import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ContactsPage() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/support" className="hover:underline">Поддержка</Link> &gt; <Link to="/support/about" className="hover:underline">О сервисе</Link> &gt; Контакты
      </nav>
      <Link to="/support/about" className="text-primary hover:underline mb-4 inline-block">← Вернуться назад</Link>

      <h1 className="text-4xl font-bold mb-2">КОНТАКТНАЯ ИНФОРМАЦИЯ</h1>
      <p className="text-sm text-muted-foreground mb-6">Дата последнего обновления: 11 марта 2026 года | Версия: 1.0</p>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Как с нами связаться</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Общие вопросы и поддержка</h3>
            <p className="mb-2">
              Email: <a href="mailto:support@prompt-studio.ru" className="text-primary hover:underline">support@prompt-studio.ru</a>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Юридические вопросы</h3>
            <p className="mb-2">
              Email: <a href="mailto:legal@prompt-studio.ru" className="text-primary hover:underline">legal@prompt-studio.ru</a>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Вопросы о защите персональных данных</h3>
            <p className="mb-2">
              Email: <a href="mailto:privacy@prompt-studio.ru" className="text-primary hover:underline">privacy@prompt-studio.ru</a>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Часы работы поддержки</h3>
            <p>Понедельник — Пятница: 9:00–18:00 (Московское время)</p>
            <p className="text-sm text-muted-foreground mt-1">Выходные: суббота, воскресенье</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Форма обратной связи</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ваше имя</label>
            <input type="text" placeholder="Иван Иванов" className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" placeholder="ivan@example.com" className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Сообщение</label>
            <textarea placeholder="Ваше сообщение..." className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={4} />
          </div>
          <button className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Отправить сообщение</button>
        </form>
      </section>
      <div className="bg-card border border-border rounded-lg p-5 text-center text-sm mt-6">
        <p className="font-semibold">© 2026 ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА». Все права защищены.</p>
        <p className="mt-2 text-muted-foreground">Сервис «Промт-Студия» — продукт компании ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА».</p>
      </div>

      <div className="mt-12 pt-6 border-t border-border">
        <Link to="/support/about" className="text-primary hover:underline">← Вернуться назад</Link>
      </div>

      {showTop && (
        <button onClick={scrollToTop} aria-label="Наверх" className="fixed bottom-6 right-6 p-3 bg-primary text-white rounded-full shadow-lg hover:opacity-90 transition-opacity z-40">
          ↑
        </button>
      )}
    </div>
  );
}