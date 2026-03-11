import { useState } from "react";
import { AccountDashboard } from "@/components/account-manager/AccountDashboard";
import { AccountProfiles } from "@/components/account-manager/AccountProfiles";
import { AccountsList } from "@/components/account-manager/AccountsList";
import { AccountSecurity } from "@/components/account-manager/AccountSecurity";
import { SubscriptionsCalendar } from "@/components/account-manager/SubscriptionsCalendar";

const tabs = [
  { key: "dashboard", label: "Обзор" },
  { key: "profiles", label: "Профили" },
  { key: "accounts", label: "Аккаунты" },
  { key: "subscriptions", label: "Подписки" },
  { key: "security", label: "Безопасность" },
];

export default function AccountManager() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAccountsForm, setShowAccountsForm] = useState(false);

  const handleDashboardAdd = () => {
    setActiveTab("accounts");
    setShowAccountsForm(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Менеджер аккаунтов</h1>
      <p className="text-sm text-muted-foreground mb-6">Цифровой сейф для всех ваших логинов и подписок</p>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "gradient-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && <AccountDashboard onAdd={handleDashboardAdd} />}
      {activeTab === "profiles" && <AccountProfiles />}
      {activeTab === "accounts" && (
        <AccountsList
          showFormProp={showAccountsForm}
          onFormClose={() => setShowAccountsForm(false)}
        />
      )}
      {activeTab === "subscriptions" && <SubscriptionsCalendar />}
      {activeTab === "security" && <AccountSecurity />}
    </div>
  );
}
