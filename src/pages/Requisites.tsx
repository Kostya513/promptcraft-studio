import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Requisites() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
