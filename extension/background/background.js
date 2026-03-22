// extension/background/background.js

const API_BASE_URL = 'https://api.promptcraft.market';

let userSession = null;

// Восстановление сессии
chrome.storage.local.get(['session'], (result) => {
  if (result.session) {
    userSession = result.session;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true;
});

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.action) {
      case 'LOGIN':
        await handleLogin(message.credentials, sendResponse);
        break;
      case 'LOGOUT':
        handleLogout(sendResponse);
        break;
      case 'GET_ACCOUNTS':
        await handleGetAccounts(sendResponse);
        break;
      case 'GET_ACCOUNT_FOR_URL':
        await handleGetAccountForUrl(message.url, sendResponse);
        break;
      case 'GET_SESSION':
        sendResponse({ session: userSession });
        break;
      default:
        sendResponse({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Background error:', error);
    sendResponse({ error: error.message });
  }
}

async function handleLogin(credentials, sendResponse) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (response.ok && data.token) {
      userSession = { token: data.token, userId: data.userId, email: data.email };
      await chrome.storage.local.set({ session: userSession });
      sendResponse({ success: true, user: { email: data.email } });
    } else {
      sendResponse({ success: false, error: data.message || 'Ошибка входа' });
    }
  } catch (error) {
    sendResponse({ success: false, error: 'Ошибка подключения к серверу' });
  }
}

function handleLogout(sendResponse) {
  userSession = null;
  chrome.storage.local.remove(['session']);
  sendResponse({ success: true });
}

async function handleGetAccounts(sendResponse) {
  if (!userSession) {
    sendResponse({ success: false, error: 'Не авторизован', accounts: [] });
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/accounts`, {
      headers: { 'Authorization': `Bearer ${userSession.token}` }
    });

    const data = await response.json();
    sendResponse({ success: response.ok, accounts: data.accounts || [] });
  } catch (error) {
    sendResponse({ success: false, error: error.message, accounts: [] });
  }
}

async function handleGetAccountForUrl(url, sendResponse) {
  if (!userSession) {
    sendResponse({ success: false, accounts: [] });
    return;
  }

  try {
    const domain = new URL(url).hostname;
    const response = await fetch(`${API_BASE_URL}/api/accounts?domain=${domain}`, {
      headers: { 'Authorization': `Bearer ${userSession.token}` }
    });

    const data = await response.json();
    sendResponse({ success: response.ok, accounts: data.accounts || [] });
  } catch (error) {
    sendResponse({ success: false, error: error.message, accounts: [] });
  }
}