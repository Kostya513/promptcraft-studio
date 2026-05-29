import { Zap, Plus, Search, MoreHorizontal, Eye, Edit3, Trash2 } from "lucide-react";

// 🔹 Типы для будущего API
type SkillItem = {
  id: string;
  name: string;
  description: string;
  version: string;
  status: "active" | "draft" | "archived";
  uses: number;
  updatedAt: string;
};

// 🔹 Заглушка данных (заменится на fetch из API)
const MOCK_SKILLS: SkillItem[] = [];

export function StudioMySkills() {
  return (
    <div className="space-y-6">
      {/* Хедер раздела */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Мои скилы
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Создавайте, тестируйте и управляйте своими активными процессами
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
          <Plus className="h-4 w-4" /> Создать скил
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex gap-2 items-center bg-card border border-border p-1.5 rounded-lg w-full sm:w-80">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input 
          type="text" 
          placeholder="Поиск по названию..." 
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Список скилов / Пустое состояние */}
      {MOCK_SKILLS.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl bg-muted/30 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-1">Пока нет скилов</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Скилы — это структурированные процессы с автоматическими триггерами. 
            Создайте первый скил, чтобы автоматизировать рабочие задачи.
          </p>
          <button className="px-5 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors">
            Создать первый скил
          </button>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Название</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Версия</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Запусков</th>
                <th className="text-left px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SKILLS.map((skill) => (
                <tr key={skill.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{skill.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{skill.description}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">v{skill.version}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{skill.uses}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      skill.status === "active" ? "bg-green-100 text-green-700" :
                      skill.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {skill.status === "active" ? "Активен" : 
                       skill.status === "draft" ? "Черновик" : "Архив"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-muted rounded">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}