import { useState, useEffect } from "react";
import { Plus, Star, Copy, Pencil, Trash2, X, Info } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  city: string;
  tags: string[];
  isActive: boolean;
}

const STORAGE_KEY = "promptcraft_profiles";

const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

export function AccountProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "", firstName: "", lastName: "", patronymic: "", email: "", extraEmails: [""],
    phone: "", country: "", city: "", zip: "", street: "", house: "", apartment: "",
    company: "", inn: "", website: "", socialLinks: "", passwordNote: "", externalPwManager: false,
    tags: [] as string[],
  });

  // Загрузка профилей из localStorage при монтировании
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfiles(parsed);
        console.log('✅ Загружено профилей:', parsed.length);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки профилей:', error);
    }
  }, []);

  // Сохранение профилей в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      console.log('✅ Профили сохранены:', profiles.length);
    } catch (error) {
      console.error('❌ Ошибка сохранения профилей:', error);
    }
  }, [profiles]);

  const activeProfile = profiles.find(p => p.isActive);

  const handleSetActive = (id: string) => {
    setProfiles(prev => prev.map(p => ({ ...p, isActive: p.id === id })));
  };

  const handleDuplicate = (profile: Profile) => {
    const dup: Profile = { ...profile, id: Date.now().toString(), name: `${profile.name} (копия)`, isActive: false };
    setProfiles(prev => [...prev, dup]);
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить этот профиль?")) {
      setProfiles(prev => prev.filter(p => p.id !== id));
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ 
      name: "", firstName: "", lastName: "", patronymic: "", email: "", extraEmails: [""],
      phone: "", country: "Россия", city: "", zip: "", street: "", house: "", apartment: "",
      company: "", inn: "", website: "", socialLinks: "", passwordNote: "", externalPwManager: false, tags: [] 
    });
    setShowForm(true);
  };

  const handleSaveProfile = () => {
    if (!formData.name.trim()) return;
    
    if (editingId) {
      // Редактирование существующего
      setProfiles(prev => prev.map(p => 
        p.id === editingId 
          ? { ...p, name: formData.name, email: formData.email, city: formData.city, tags: formData.tags } 
          : p
      ));
    } else {
      // Создание нового
      const newProfile: Profile = { 
        id: Date.now().toString(), 
        name: formData.name, 
        email: formData.email, 
        city: formData.city, 
        tags: formData.tags.length ? formData.tags : ["Личный"], 
        isActive: profiles.length === 0 // Первый профиль делаем активным
      };
      setProfiles(prev => [...prev, newProfile]);
    }
    setShowForm(false);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] 
    }));
  };

  const addExtraEmail = () => setFormData(prev => ({ ...prev, extraEmails: [...prev.extraEmails, ""] }));
  const updateExtraEmail = (i: number, val: string) => setFormData(prev => ({ 
    ...prev, 
    extraEmails: prev.extraEmails.map((e, idx) => idx === i ? val : e) 
  }));

  if (showForm) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">{editingId ? "Редактирование профиля" : "Новый профиль"}</h2>
          <button onClick={() => setShowForm(false)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Название профиля *</label><input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="Личный, Рабочий…" className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Имя</label><input value={formData.firstName} onChange={e => setFormData(p => ({...p, firstName: e.target.value}))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Фамилия</label><input value={formData.lastName} onChange={e => setFormData(p => ({...p, lastName: e.target.value}))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Отчество</label><input value={formData.patronymic} onChange={e => setFormData(p => ({...p, patronymic: e.target.value}))} className={`${inputCls} mt-1`} /></div>
          </div>

          <div><label className="text-xs text-muted-foreground">Основной email</label><input type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className={`${inputCls} mt-1`} /></div>

          {formData.extraEmails.map((em, i) => (
            <div key={i}><label className="text-xs text-muted-foreground">Доп. email {i + 1}</label><input value={em} onChange={e => updateExtraEmail(i, e.target.value)} className={`${inputCls} mt-1`} /></div>
          ))}
          <button onClick={addExtraEmail} className="text-xs text-primary hover:underline">+ Добавить email</button>

          <div><label className="text-xs text-muted-foreground">Телефон</label><input value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className={`${inputCls} mt-1`} /></div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Страна</label><input value={formData.country} onChange={e => setFormData(p => ({...p, country: e.target.value}))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Город</label><input value={formData.city} onChange={e => setFormData(p => ({...p, city: e.target.value}))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Индекс</label><input value={formData.zip} onChange={e => setFormData(p => ({...p, zip: e.target.value}))} className={`${inputCls} mt-1`} /></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Улица</label><input value={formData.street} onChange={e => setFormData(p => ({...p, street: e.target.value}))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Дом</label><input value={formData.house} onChange={e => setFormData(p => ({...p, house: e.target.value}))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Квартира</label><input value={formData.apartment} onChange={e => setFormData(p => ({...p, apartment: e.target.value}))} className={`${inputCls} mt-1`} /></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Компания/бренд</label><input value={formData.company} onChange={e => setFormData(p => ({...p, company: e.target.value}))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">ИНН</label><input value={formData.inn} onChange={e => setFormData(p => ({...p, inn: e.target.value}))} className={`${inputCls} mt-1`} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Сайт</label><input value={formData.website} onChange={e => setFormData(p => ({...p, website: e.target.value}))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Соцсети</label><input value={formData.socialLinks} onChange={e => setFormData(p => ({...p, socialLinks: e.target.value}))} placeholder="vk.com/..." className={`${inputCls} mt-1`} /></div>
          </div>

          <div><label className="text-xs text-muted-foreground">Комментарий к паролю</label><input value={formData.passwordNote} onChange={e => setFormData(p => ({...p, passwordNote: e.target.value}))} placeholder="Подсказка или описание" className={`${inputCls} mt-1`} /></div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.externalPwManager} onChange={e => setFormData(p => ({...p, externalPwManager: e.target.checked}))} className="rounded border-border" />
            Пароль хранится во внешнем менеджере паролей
          </label>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Теги профиля</label>
            <div className="flex flex-wrap gap-2">
              {["Личный", "Рабочий", "Анонимный", "Тестовый"].map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${formData.tags.includes(tag) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveProfile} className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Сохранить профиль</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Отмена</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {activeProfile && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <Star className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Активный профиль: <span className="text-primary">{activeProfile.name}</span></p>
            <p className="text-xs text-muted-foreground">{activeProfile.email}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">{profiles.length} профилей</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Создать профиль
        </button>
      </div>

      {profiles.length > 0 ? profiles.map(p => (
        <div key={p.id} className={`bg-card rounded-xl border p-4 transition-all ${p.isActive ? "border-primary/30 shadow-card-hover" : "border-border shadow-card"}`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{p.name}</h3>
                {p.isActive && <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Активный</span>}
              </div>
              <p className="text-sm text-muted-foreground">{p.email} • {p.city}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {p.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!p.isActive && <button onClick={() => handleSetActive(p.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors">Сделать активным</button>}
            <button onClick={() => { /* TODO: open detail view */ }} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors">Открыть</button>
            <button onClick={() => { setEditingId(p.id); setFormData(prev => ({ ...prev, name: p.name, email: p.email, city: p.city, tags: p.tags })); setShowForm(true); }} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors"><Pencil className="h-3 w-3 inline mr-1" />Редактировать</button>
            <button onClick={() => handleDuplicate(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors"><Copy className="h-3 w-3 inline mr-1" />Дублировать</button>
            <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"><Trash2 className="h-3 w-3 inline mr-1" />Удалить</button>
          </div>
        </div>
      )) : (
        <p className="text-center text-sm text-muted-foreground py-8">Нет профилей. Добавьте первый!</p>
      )}

      <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Автозаполнение форм</p>
          <p className="text-xs text-muted-foreground">В будущем активный профиль можно будет использовать для автозаполнения форм регистрации с помощью браузерного расширения Промт-Студии.</p>
        </div>
      </div>
    </div>
  );
}