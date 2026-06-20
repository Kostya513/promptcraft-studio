import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Zap, Bot, FileText, ShoppingCart } from "lucide-react";
import { MarketCard } from "@/components/prompt-market/MarketCard";

export default function AuthorProfilePage() {
  const { userId } = useParams();
  const [author, setAuthor] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!userId) return;

    // Загружаем данные автора
    const users = JSON.parse(localStorage.getItem("promptcraft_users") || "[]");
    const foundUser = users.find((u: any) => u.email === userId || u.id === userId);
    
    if (foundUser) {
      setAuthor(foundUser);
    } else {
      setAuthor({
        email: userId,
        name: userId.split("@")[0],
        avatar: null
      });
    }

    // Загружаем все работы автора
    const prompts = JSON.parse(localStorage.getItem("promptcraft_prompts") || "[]");
    const skills = JSON.parse(localStorage.getItem("promptcraft_skills") || "[]");
    const agents = JSON.parse(localStorage.getItem("promptcraft_agents") || "[]");

    const authorWorks: any[] = [];

    // Промпты автора
    prompts
      .filter((p: any) => p.authorId === userId || p.author === userId)
      .filter((p: any) => p.status === "published" || p.status === "moderation")
      .forEach((p: any) => {
        authorWorks.push({
          id: `prompt_${p.id}`,
          type: "prompt",
          title: p.title || "Без названия",
          author: p.author || "Автор",
          authorId: p.authorId || p.author,
          description: p.description || p.text?.slice(0, 100) || "",
          price: p.price || 0,
          rating: p.quality || 5,
          reviewCount: p.reviewCount || 0,
          views: p.views || 0,
          sales: p.sales || 0,
          likes: p.likes || 0,
          tags: p.tags || [p.model || "AI"],
          image: p.media?.[0]?.url || p.images?.[0] || p.image,
          images: p.media || p.images || [],
          createdAt: new Date(p.createdAt).toISOString(),
          status: p.status,
        });
      });

    // Скилы автора
    skills
      .filter((s: any) => s.authorId === userId || s.author === userId)
      .filter((s: any) => s.status === "active" || s.status === "published")
      .forEach((s: any) => {
        authorWorks.push({
          id: `skill_${s.id}`,
          type: "skill",
          title: s.name || "Без названия",
          author: s.author || "Автор",
          authorId: s.authorId || s.author,
          description: s.description || "",
          price: s.price || 0,
          rating: s.rating || 5,
          reviewCount: s.reviewCount || 0,
          views: s.views || s.runCount || 0,
          sales: s.sales || 0,
          likes: s.likes || 0,
          tags: s.tags || ["skill"],
          image: s.media?.[0]?.url || s.images?.[0] || s.image,
          images: s.media || s.images || [],
          createdAt: new Date(s.createdAt).toISOString(),
          status: s.status,
        });
      });

    // Агенты автора
    agents
      .filter((a: any) => a.authorId === userId || a.author === userId)
      .filter((a: any) => a.status === "active" || a.status === "published")
      .forEach((a: any) => {
        authorWorks.push({
          id: `agent_${a.id}`,
          type: "agent",
          title: a.name || "Без названия",
          author: a.author || "Автор",
          authorId: a.authorId || a.author,
          description: a.description || "",
          price: a.price || 0,
          rating: a.rating || 5,
          reviewCount: a.reviewCount || 0,
          views: a.views || a.runCount || 0,
          sales: a.sales || 0,
          likes: a.likes || 0,
          tags: a.tags || ["agent"],
          image: a.media?.[0]?.url || a.images?.[0] || a.image,
          images: a.media || a.images || [],
          createdAt: new Date(a.createdAt).toISOString(),
          status: a.status,
        });
      });

    // Сортируем
    authorWorks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setWorks(authorWorks);
    setLoading(false);
  }, [userId]);

  const handleLike = (id: string) => {
    const saved = JSON.parse(localStorage.getItem("saved_items") || "[]");
    if (saved.includes(id)) {
      localStorage.setItem("saved_items", JSON.stringify(saved.filter((i: string) => i !== id)));
    } else {
      saved.push(id);
      localStorage.setItem("saved_items", JSON.stringify(saved));
    }
  };

  const handleAddToCart = (id: string) => {
    const card = works.find((c) => c.id === id);
    if (!card || card.price === null) return;
    
    const cart = JSON.parse(localStorage.getItem("promptcraft_cart") || "[]");
    if (cart.find((i: any) => i.id === id)) return;
    
    cart.push({
      id: card.id,
      title: card.title,
      author: card.author,
      price: card.price,
      image: card.image,
      type: card.type,
    });
    
    localStorage.setItem("promptcraft_cart", JSON.stringify(cart));
  };

  const filteredWorks = works.filter((work) => {
    if (activeTab === "all") return true;
    return work.type === activeTab;
  });

  const stats = {
    prompts: works.filter(w => w.type === "prompt").length,
    skills: works.filter(w => w.type === "skill").length,
    agents: works.filter(w => w.type === "agent").length,
    total: works.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link to="/market" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Назад в маркет
          </Link>
          
          <div className="flex items-start gap-6">
            {author?.avatar ? (
              <img src={author.avatar} alt={author.name} className="h-24 w-24 rounded-full object-cover shadow-lg" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {author?.name?.[0]?.toUpperCase() || "A"}
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{author?.name || "Автор"}</h1>
              <p className="text-muted-foreground mb-3">{author?.email}</p>
              
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stats.prompts}</span>
                  <span className="text-muted-foreground">промта</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stats.skills}</span>
                  <span className="text-muted-foreground">скила</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stats.agents}</span>
                  <span className="text-muted-foreground">агента</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Все работы", count: stats.total },
            { key: "prompts", label: "Промты", count: stats.prompts },
            { key: "skills", label: "Скилы", count: stats.skills },
            { key: "agents", label: "Агенты", count: stats.agents },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "gradient-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filteredWorks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWorks.map((work) => (
              <MarketCard
                key={work.id}
                data={work}
                onLike={handleLike}
                onAddToCart={handleAddToCart}
                onQuickView={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">У автора пока нет работ</p>
          </div>
        )}
      </div>
    </div>
  );
}