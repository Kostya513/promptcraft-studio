import { useState, useEffect } from "react";
import { FolderHeart, Clock, Pencil, Trash2, ExternalLink, Plus, Star, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { getPrompts, getDrafts, getFavorites, getHistory, StoredPrompt, HistoryItem } from "@/lib/local-storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const tabs = ["Черновики", "Избранное", "Все промты", "История"];

export default function MyPrompts() {
  const [activeTab, setActiveTab] = useState("Черновики");
  const [drafts, setDrafts] = useState<StoredPrompt[]>([]);
  const [favorites, setFavorites] = useState<StoredPrompt[]>([]);
  const [allPrompts, setAllPrompts] = useState<StoredPrompt[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Загрузка данных из localStorage
  useEffect(() => {
    setDrafts(getDrafts());
    setFavorites(getFavorites());
    setAllPrompts(getPrompts());
    setHistory(getHistory());
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const renderPromptsList = (prompts: StoredPrompt[]) => {
    if (prompts.length === 0) {
      return (
        <div className="text-center py-12">
          <FolderHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">У вас ещё нет промптов</p>
          <Link to="/studio?tab=generator">
            <Button className="mt-4">Создать первый промт</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {prompts.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{p.model}</Badge>
                    {p.rating && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs">{p.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {truncateText(p.text, 150)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Качество: {p.quality}%</span>
                    <span>{formatDate(p.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(p.text)}>
                    Копировать
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderHistoryList = (historyItems: HistoryItem[]) => {
    if (historyItems.length === 0) {
      return (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">История пуста</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {historyItems.map((h) => (
          <Card key={h.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{h.model}</Badge>
                    <span className="text-xs text-muted-foreground">{h.input}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Сгенерировано вариантов: {h.output?.length || 0}
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {formatDate(h.timestamp)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Мои промты</h1>
        <Link to="/studio?tab=generator">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Создать
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <Button
            key={t}
            variant={activeTab === t ? "default" : "outline"}
            onClick={() => setActiveTab(t)}
            className="whitespace-nowrap"
          >
            {t}
            {t === "Черновики" && drafts.length > 0 && (
              <span className="ml-2 text-xs">({drafts.length})</span>
            )}
            {t === "Избранное" && favorites.length > 0 && (
              <span className="ml-2 text-xs">({favorites.length})</span>
            )}
            {t === "Все промты" && allPrompts.length > 0 && (
              <span className="ml-2 text-xs">({allPrompts.length})</span>
            )}
            {t === "История" && history.length > 0 && (
              <span className="ml-2 text-xs">({history.length})</span>
            )}
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "Черновики" && renderPromptsList(drafts)}
      {activeTab === "Избранное" && renderPromptsList(favorites)}
      {activeTab === "Все промты" && renderPromptsList(allPrompts)}
      {activeTab === "История" && renderHistoryList(history)}
    </div>
  );
}
