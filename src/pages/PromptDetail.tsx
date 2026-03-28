import { Link, useParams } from "react-router-dom";
import { Star, Heart, Bookmark, CalendarPlus, ArrowLeft, MessageCircle, Share2 } from "lucide-react";

export default function PromptDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back */}
      <Link to="/studio" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Назад
      </Link>

      {/* Two columns on desktop */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Left - Preview */}
        <div className="space-y-3">
          <div className="aspect-video rounded-2xl bg-muted overflow-hidden shadow-card">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop"
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video rounded-lg bg-muted overflow-hidden">
                <img
                  src={`https://images.unsplash.com/photo-155674204${i}-0cfed4f6a45d?w=200&h=120&fit=crop`}
                  alt={`Example ${i}`}
                  className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right - Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Карточка товара для Wildberries — полный комплект</h1>
          <p className="text-muted-foreground">
            Генерирует SEO‑заголовок, описание, характеристики и ключевые слова для карточки товара на WB.
            Подходит для любых категорий товаров.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {["WB", "Карточки товаров", "Новичок", "YandexGPT", "GigaChat"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {t}
              </span>
            ))}
          </div>

          {/* Compatible services */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Совместимые ИИ‑сервисы</h3>
            <div className="flex gap-2">
              {["YandexGPT", "GigaChat", "Другие"].map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm">{s}</span>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning fill-warning" /> 4.8
            </span>
            <span>342 лайка</span>
            <span>2 100 просмотров</span>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              Использовать
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-medium">
                <Bookmark className="h-4 w-4" /> Сохранить
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-medium">
                <CalendarPlus className="h-4 w-4" /> В план
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Extended description */}
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-3">Описание и сценарий использования</h2>
          <div className="bg-card rounded-xl p-5 border border-border text-sm text-muted-foreground space-y-3">
            <p>Этот промпт поможет вам быстро создать полную карточку товара для Wildberries. Он генерирует:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>SEO‑оптимизированный заголовок с ключевыми словами</li>
              <li>Развёрнутое описание товара</li>
              <li>Характеристики в нужном формате</li>
              <li>Список ключевых слов для поиска</li>
            </ul>
            <p>Просто введите название товара и основные характеристики — ИИ сделает остальное.</p>
          </div>
        </section>

        {/* Examples */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Примеры результатов</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className="aspect-video rounded-lg bg-muted mb-3 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop&sat=-50&bri=${i * 10}`}
                    alt={`Пример ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Пример карточки товара #{i}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comments */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Комментарии</h2>
          <div className="space-y-3">
            {[
              { user: "Анна", text: "Отличный промпт! Сэкономила кучу времени на описаниях.", time: "2 дня назад" },
              { user: "Максим", text: "Использую каждый день для своих карточек. Рекомендую!", time: "5 дней назад" },
            ].map((c, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {c.user[0]}
                  </div>
                  <span className="text-sm font-medium">{c.user}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{c.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{c.text}</p>
              </div>
            ))}

            {/* Comment input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Написать комментарий..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button className="px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
                Отправить
              </button>
            </div>
          </div>
        </section>

        {/* Author */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Об авторе</h2>
          <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
            <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              M
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">MarketPro</h3>
              <p className="text-sm text-muted-foreground">Эксперт по маркетплейсам · 24 промпта</p>
            </div>
            <Link to="#" className="text-sm text-primary font-medium hover:underline">
              Все промпты →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
