import { useState } from "react";
import { Plus, Calendar, Globe, Send as SendIcon, FileText, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

// posts will be fetched from backend; start empty
const mockPosts: { id: string; title: string; status: string; date: string; platforms: string[] }[] = [];

const statusColors: Record<string, string> = {
  "Опубликован": "bg-success/10 text-success",
  "Запланирован": "bg-primary/10 text-primary",
  "Черновик": "bg-muted text-muted-foreground",
};

export default function Blog() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Блог и публикации</h1>
        <Link
          to="/blog/create"
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Создать пост
        </Link>
      </div>

      <div className="space-y-3">
        {mockPosts.length > 0 ? mockPosts.map((post) => (
          <div key={post.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{post.title}</h3>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                    {post.status}
                  </span>
                  {post.date !== "—" && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {post.date}
                    </span>
                  )}
                  {post.platforms.length > 0 && (
                    <div className="flex gap-1">
                      {post.platforms.map((p) => (
                        <span key={p} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <p className="text-center text-muted-foreground py-8">Пока нет публикаций. Создайте первый пост!</p>
        )}
      </div>
    </div>
  );
}
