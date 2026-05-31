import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AccountDashboard } from "../components/account-manager/AccountDashboard";
import { AccountProfiles } from "../components/account-manager/AccountProfiles";
import { AccountsList } from "../components/account-manager/AccountsList";
import { AccountSecurity } from "../components/account-manager/AccountSecurity";
import { SubscriptionsCalendar } from "../components/account-manager/SubscriptionsCalendar";
import { MasterPasswordModal } from "../components/account-manager/MasterPasswordModal";
import { ProfileGenerator } from "../components/account-manager/ProfileGenerator";
import { Lock } from "lucide-react";

const tabs = [
  { key: "dashboard", label: "Обзор" },
  { key: "profiles", label: "Профили" },
  { key: "accounts", label: "Аккаунты" },
  { key: "subscriptions", label: "Подписки" },
  { key: "security", label: "Безопасность" },
];

export default function AccountManager() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAccountsForm, setShowAccountsForm] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [showProfileGenerator, setShowProfileGenerator] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("master_password_hash");
    setShowPasswordModal(!stored ? true : !isUnlocked);
  }, [isUnlocked]);

  const handleDashboardAdd = () => {
    setActiveTab("accounts");
    setShowAccountsForm(true);
  };

  const handleGenerateProfile = () => {
    setShowProfileGenerator(true);
  };

  const handleSaveGeneratedProfile = (profile: { name: string; email: string; password: string }) => {
    console.log("📝 Сохранение сгенерированного профиля:", profile);
    setShowProfileGenerator(false);
  };

  const handleUnlock = (key: CryptoKey) => {
    setCryptoKey(key);
    setIsUnlocked(true);
    setShowPasswordModal(false);
  };

  const handleSetup = (password: string) => {
    console.log("Мастер-пароль установлен");
  };

  if (!isUnlocked) {
    return (
      <>
        <MasterPasswordModal isOpen={showPasswordModal} onUnlock={handleUnlock} onSetup={handleSetup} />
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-1">Менеджер аккаунтов</h1>
          <p className="text-sm text-muted-foreground mb-6">Ваш личный цифровой сейф</p>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 rounded-2xl bg-muted/50 border border-border mb-6"><Lock className="h-16 w-16 text-muted-foreground" /></div>
            <h2 className="text-xl font-semibold mb-2">Требуется разблокировка</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">Введите мастер-пароль для доступа к зашифрованным данным</p>
            <button onClick={() => setShowPasswordModal(true)} className="px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
              Ввести пароль
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MasterPasswordModal isOpen={showPasswordModal} onUnlock={handleUnlock} onSetup={handleSetup} />
      <ProfileGenerator open={showProfileGenerator} onClose={() => setShowProfileGenerator(false)} onSave={handleSaveGeneratedProfile} />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Менеджер аккаунтов</h1>
            <p className="text-sm text-muted-foreground mt-1">Ваш личный цифровой сейф</p>
          </div>
          <button onClick={() => setIsUnlocked(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
            <Lock className="h-4 w-4" /> Заблокировать
          </button>
        </div>

        <div className="flex gap-1 mb-8 overflow-x-auto pb-1 border-b border-border">
          {tabs.map((tab) => (
            <button 
              key={tab.key} 
              onClick={() => setActiveTab(tab.key)} 
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 🔹 Все компоненты с правильными пропами */}
        {activeTab === "dashboard" && <AccountDashboard onAdd={handleDashboardAdd} onGenerateProfile={handleGenerateProfile} cryptoKey={cryptoKey} onNavigate={setActiveTab} />}
        {activeTab === "profiles" && <AccountProfiles />}
        {activeTab === "accounts" && (
          <AccountsList 
            showFormProp={showAccountsForm} 
            onFormClose={() => setShowAccountsForm(false)} 
            cryptoKey={cryptoKey} 
          />
        )}
        {activeTab === "subscriptions" && <SubscriptionsCalendar cryptoKey={cryptoKey} onNavigate={setActiveTab} />}
        {activeTab === "security" && <AccountSecurity />}
      </div>
    </>
  );
}