/// <reference types="chrome" />

import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';

interface Account {
  id: string;
  service?: string;
  domain?: string;
  login?: string;
  email?: string;
  password?: string;
  url?: string;
}

interface Session {
  token: string;
  userId: string;
  email: string;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    chrome.runtime.sendMessage({ action: 'GET_SESSION' }, (response) => {
      if (response?.session) {
        setSession(response.session);
        loadAccounts();
      }
    });
  }

  async function loadAccounts() {
    chrome.runtime.sendMessage({ action: 'GET_ACCOUNTS' }, (response) => {
      if (response?.success) {
        setAccounts(response.accounts || []);
      }
    });
  }

  async function handleLogin() {
    if (!loginForm.email || !loginForm.password) {
      setError('Введите email и пароль');
      return;
    }

    setIsLoading(true);
    setError('');

    chrome.runtime.sendMessage(
      { action: 'LOGIN', credentials: loginForm },
      (response) => {
        setIsLoading(false);
        if (response?.success) {
          setSession(response.user);
          loadAccounts();
        } else {
          setError(response?.error || 'Ошибка входа');
        }
      }
    );
  }

  async function handleLogout() {
    chrome.runtime.sendMessage({ action: 'LOGOUT' }, () => {
      setSession(null);
      setAccounts([]);
    });
  }

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function openWebsite(url: string | undefined) {
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      chrome.tabs.create({ url: fullUrl });
    }
  }

  function openDashboard() {
    chrome.tabs.create({ url: 'https://promptcraft.market/dashboard/accounts' });
  }

  if (!session) {
    return (
      <div className="popup-container">
        <div className="header">
          <h1>PromptCraft Vault</h1>
          <p className="subtitle">Менеджер Аккаунтов</p>
        </div>

        <div className="login-form">
          <p className="description">Войдите чтобы получить доступ к аккаунтам</p>

          {error && <div className="error-message">{error}</div>}

          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            className="input"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            className="input"
          />

          <button onClick={handleLogin} disabled={isLoading} className="btn btn-primary w-full">
            {isLoading ? 'Вход...' : 'Войти'}
          </button>

          <p className="help-text">
            <a href="https://promptcraft.market/register" target="_blank">Зарегистрироваться</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="header">
        <div>
          <h1>PromptCraft Vault</h1>
          <p className="subtitle">{session.email}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Выйти">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>

      <button onClick={openDashboard} className="btn btn-primary w-full mb-4">
        Открыть Менеджер Аккаунтов
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </button>

      <div className="account-list">
        <h3 className="section-title">Ваши аккаунты</h3>
        
        {accounts.length === 0 ? (
          <div className="empty-state">
            <p>Нет аккаунтов</p>
            <p className="text-sm text-muted">Добавьте аккаунты в Менеджере на сайте</p>
          </div>
        ) : (
          accounts.slice(0, 10).map((account) => (
            <div key={account.id} className="account-item">
              <div className="account-info">
                <p className="account-domain">{account.service || account.domain}</p>
                <p className="account-email">{account.login || account.email}</p>
              </div>
              <div className="account-actions">
                <button
                  onClick={() => copyToClipboard(account.login ?? account.email ?? '', account.id + '-login')}
                  className="btn btn-ghost btn-icon"
                  title="Копировать логин"
                >
                  {copiedId === account.id + '-login' ? '✓' : '📋'}
                </button>
                <button
                  onClick={() => copyToClipboard(account.password ?? '', account.id + '-pass')}
                  className="btn btn-ghost btn-icon"
                  title="Копировать пароль"
                >
                  {copiedId === account.id + '-pass' ? '✓' : '🔑'}
                </button>
                <button
                  onClick={() => openWebsite(account.url)}
                  className="btn btn-ghost btn-icon"
                  title="Открыть сайт"
                >
                  🌐
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}