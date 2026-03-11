import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { FolderHeart, ShoppingBag, Link2, Pencil, Eye, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, getInitial } = useUser();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const stats = [
    { label: "Промптов", value: user.promptsCount, icon: FolderHeart },
    { label: "Покупок", value: user.purchasesCount, icon: ShoppingBag },
    { label: "Сервисов", value: user.servicesCount, icon: Link2 },
  ];

  const handleShowOnboarding = () => {
    navigate("/onboarding");
    toast({ title: "Онбординг запущен", description: "Вы можете пройти настройку заново" });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Мой профиль</h1>
        <div className="flex gap-2">
          <button
            onClick={handleShowOnboarding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Gift className="h-4 w-4" /> Подсказки
          </button>
          <Link
            to="/settings"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Pencil className="h-4 w-4" /> Редактировать
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-5 mb-4">
          <div className="h-20 w-20 rounded-full overflow-hidden gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-bold flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              getInitial()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name || "Пользователь"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {user.roleLabel || "Бизнес"}
            </span>
          </div>
        </div>

        {user.bio && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">О себе</h3>
            <p className="text-sm">{user.bio}</p>
          </div>
        )}

        {!user.bio && (
          <p className="text-sm text-muted-foreground mb-4">
            Добавьте описание в{" "}
            <Link to="/settings" className="text-primary hover:underline">настройках</Link>, чтобы другие пользователи маркетплейса могли узнать о вас больше.
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
