import { useState } from "react";
import { Download, Upload, Trash2, Database, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { downloadBackup, exportToClipboard, importBackupFile, getBackupStats, clearAllData } from "@/lib/export-import";
import { useToast } from "@/hooks/use-toast";

export function DataSettings() {
  const { toast } = useToast();
  const [stats, setStats] = useState(getBackupStats());
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    downloadBackup();
    toast({
      title: "Экспорт выполнен",
      description: "Резервная копия сохранена",
    });
  };

  const handleExportClipboard = async () => {
    try {
      await exportToClipboard();
      toast({ title: "Скопировано в буфер обмена" });
    } catch {
      toast({ title: "Ошибка экспорта", variant: "destructive" });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importBackupFile(file);
      if (result.success) {
        setStats(getBackupStats());
        toast({
          title: "Импорт выполнен",
          description: "Данные восстановлены",
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({ title: "Ошибка импорта", description: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка импорта", variant: "destructive" });
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const handleClear = () => {
    if (confirm("Вы уверены? Все данные будут удалены безвозвратно!")) {
      clearAllData();
      setStats(getBackupStats());
      toast({ title: "Данные очищены" });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Хранилище данных
          </CardTitle>
          <CardDescription>Локальное хранилище браузера</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{stats.prompts}</div>
              <div className="text-xs text-muted-foreground">Промтов</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{stats.drafts}</div>
              <div className="text-xs text-muted-foreground">Черновиков</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{stats.favorites}</div>
              <div className="text-xs text-muted-foreground">Избранного</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{(stats.totalSize / 1024).toFixed(1)} KB</div>
              <div className="text-xs text-muted-foreground">Размер</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Экспорт данных
          </CardTitle>
          <CardDescription>Создайте резервную копию</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={handleExport} className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            Скачать JSON
          </Button>
          <Button variant="outline" onClick={handleExportClipboard} className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Копировать в буфер
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Импорт данных
          </CardTitle>
          <CardDescription>Восстановите из копии</CardDescription>
        </CardHeader>
        <CardContent>
          <label>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={isImporting}
            />
            <Button variant="outline" asChild className="flex items-center gap-2 cursor-pointer">
              <span>
                <Upload className="h-4 w-4" />
                {isImporting ? "Импорт..." : "Выбрать файл"}
              </span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-2">
            Внимание: импорт заменит текущие данные
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Опасная зона
          </CardTitle>
          <CardDescription>Полная очистка всех данных</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleClear} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Удалить все данные
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
