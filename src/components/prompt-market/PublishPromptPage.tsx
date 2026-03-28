import { useState, useCallback } from "react";
import { ArrowLeft, Sparkles, Upload, X, Check, Loader2, Save, Send, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface AgentStage {
  label: string;
  status: "pending" | "running" | "done" | "error";
  result?: string;
}

export default function PublishPromptPage() {
  const [promptText, setPromptText] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Agent state
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentCategory, setAgentCategory] = useState("");
  const [agentTags, setAgentTags] = useState<string[]>([]);
  const [agentModel, setAgentModel] = useState("");
  const [agentValidated, setAgentValidated] = useState(false);
  const [stages, setStages] = useState<AgentStage[]>([
    { label: "Анализ текста промпта", status: "pending" },
    { label: "Определение категории", status: "pending" },
    { label: "Генерация тегов", status: "pending" },
    { label: "Определение модели", status: "pending" },
    { label: "Валидация результатов", status: "pending" },
  ]);

  const handleImprovePrompt = async () => {
    if (!promptText.trim()) return;
    // Simulate AI improvement
    setPromptText((prev) => prev + "\n\n[Улучшенная версия промпта будет сгенерирована через API]");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const newFiles = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const runAgent = async () => {
    if (!promptText.trim()) return;
    setAgentRunning(true);

    // Simulate sequential agent stages
    const results = [
      { category: "Текст и копирайтинг", delay: 800 },
      { tags: ["SEO", "Статьи", "Блог"], delay: 1000 },
      { model: "GPT-4 / YandexGPT", delay: 600 },
    ];

    for (let i = 0; i < stages.length; i++) {
      setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)));
      await new Promise((r) => setTimeout(r, results[Math.min(i, results.length - 1)]?.delay || 500));

      if (i === 1) setAgentCategory("Текст и копирайтинг");
      if (i === 2) setAgentTags(["SEO", "Статьи", "Блог", "Контент"]);
      if (i === 3) setAgentModel("GPT-4 / YandexGPT");

      const hasResults = uploadedFiles.length > 0;
      if (i === 4 && !hasResults) {
        setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "error", result: "Добавьте результаты генерации" } : s)));
        setAgentRunning(false);
        return;
      }

      setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s)));
    }

    setAgentValidated(true);
    setAgentRunning(false);
  };

  const handlePublish = () => {
    if (!agentValidated) return;
    setShowNotification(true);
    // Reset or navigate
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", { promptText, description, uploadedFiles, agentCategory, agentTags, agentModel });
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link to="/market" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Назад в маркет
      </Link>

      <h1 className="text-2xl font-bold mb-6">Публикация промпта</h1>

      {/* Notification */}
      {showNotification && (
        <div className="mb-6 p-4 rounded-xl border border-success/30 bg-success/5 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-medium">Промпт успешно опубликован!</p>
              <p className="text-xs text-muted-foreground">Управляйте промптами в разделе Studio</p>
            </div>
          </div>
          <Link to="/my-prompts" className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
            Перейти в Studio
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left column — 3/5 */}
        <div className="lg:col-span-3 space-y-5">
          {/* Prompt text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">Текст промпта *</label>
              <button
                onClick={handleImprovePrompt}
                disabled={!promptText.trim()}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" /> Улучшить
              </button>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Введите текст промпта..."
              rows={8}
              className={`${inputCls} resize-none font-mono text-xs`}
            />
          </div>

          {/* Results drag-drop area */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Результаты генерации *</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                dragging ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Перетащите файлы или</p>
              <label className="inline-block px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
                Выберите файлы
                <input type="file" multiple onChange={handleFileInput} className="hidden" accept="image/*,video/*" />
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-lg border border-border overflow-hidden group">
                    <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите назначение промпта, кейсы использования, примеры..."
              rows={5}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* Right column — Agent widget 2/5 */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Агент анализа</h3>
              <button
                onClick={runAgent}
                disabled={agentRunning || !promptText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {agentRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {agentRunning ? "Анализ..." : "Запустить"}
              </button>
            </div>

            {/* Stages */}
            <div className="space-y-2">
              {stages.map((stage, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    stage.status === "done" ? "bg-success/10 text-success" :
                    stage.status === "running" ? "bg-primary/10 text-primary" :
                    stage.status === "error" ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {stage.status === "done" && <Check className="h-3 w-3" />}
                    {stage.status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
                    {stage.status === "error" && <AlertCircle className="h-3 w-3" />}
                    {stage.status === "pending" && <span className="text-[10px]">{i + 1}</span>}
                  </div>
                  <span className={stage.status === "done" ? "text-foreground" : "text-muted-foreground"}>
                    {stage.label}
                  </span>
                  {stage.result && <span className="text-destructive ml-auto">{stage.result}</span>}
                </div>
              ))}
            </div>

            {/* Auto-filled fields */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Категория</label>
                <input value={agentCategory} onChange={(e) => setAgentCategory(e.target.value)} placeholder="Определяется агентом..." className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Теги</label>
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {agentTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                      {tag}
                      <button onClick={() => setAgentTags((prev) => prev.filter((t) => t !== tag))}>
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                  {agentTags.length === 0 && <span className="text-xs text-muted-foreground">Определяются агентом...</span>}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">ИИ-модель</label>
                <input value={agentModel} onChange={(e) => setAgentModel(e.target.value)} placeholder="Определяется агентом..." className={inputCls} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
        <button
          onClick={handlePublish}
          disabled={!agentValidated}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> Опубликовать
        </button>
        <button
          onClick={handleSaveDraft}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <Save className="h-4 w-4" /> Сохранить в черновики
        </button>
      </div>
    </div>
  );
}
