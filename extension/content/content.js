// extension/content/content.js

(function() {
  'use strict';

  console.log('PromptCraft Vault Content Script loaded');

  document.addEventListener('focusin', async function(e) {
    const target = e.target;
    
    if (target.tagName !== 'INPUT') return;
    if (target.type !== 'text' && target.type !== 'email' && target.type !== 'password') return;

    const form = target.closest('form');
    if (!form) return;

    const domain = window.location.hostname;
    
    chrome.runtime.sendMessage({
      action: 'GET_ACCOUNT_FOR_URL',
      url: window.location.href
    }, (response) => {
      if (response?.success && response.accounts?.length > 0) {
        showAutofillPopup(response.accounts, target, form);
      }
    });
  });

  function showAutofillPopup(accounts, inputField, form) {
    if (document.getElementById('promptcraft-autofill-popup')) {
      return;
    }

    const popup = document.createElement('div');
    popup.id = 'promptcraft-autofill-popup';
    popup.style.cssText = `
      position: absolute;
      z-index: 999999;
      background: white;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 8px;
      min-width: 200px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      padding: 8px;
      font-weight: 600;
      color: #4f46e5;
      border-bottom: 1px solid #e4e4e7;
      margin-bottom: 8px;
    `;
    header.textContent = 'PromptCraft Vault';
    popup.appendChild(header);

    accounts.forEach(account => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 8px;
        cursor: pointer;
        border-radius: 4px;
        margin-bottom: 4px;
      `;
      item.onmouseover = () => item.style.background = '#f4f4f5';
      item.onmouseout = () => item.style.background = 'white';
      
      item.innerHTML = `
        <div style="font-weight: 500; color: #1a1a1a;">${account.service || account.domain}</div>
        <div style="font-size: 12px; color: #666;">${account.login || account.email}</div>
      `;
      
      item.onclick = () => {
        autofillForm(account, form);
        popup.remove();
      };
      
      popup.appendChild(item);
    });

    const rect = inputField.getBoundingClientRect();
    popup.style.top = (rect.bottom + window.scrollY + 4) + 'px';
    popup.style.left = rect.left + 'px';

    document.body.appendChild(popup);

    document.addEventListener('click', function closePopup(e) {
      if (!popup.contains(e.target) && !inputField.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    });
  }

  function autofillForm(account, form) {
    const loginField = form.querySelector('input[type="text"], input[type="email"]');
    const passwordField = form.querySelector('input[type="password"]');

    if (loginField && (account.login || account.email)) {
      loginField.value = account.login || account.email;
      loginField.dispatchEvent(new Event('input', { bubbles: true }));
      loginField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (passwordField && account.password) {
      passwordField.value = account.password;
      passwordField.dispatchEvent(new Event('input', { bubbles: true }));
      passwordField.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
})();