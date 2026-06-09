window.API = (() => {
  const KEY = 'avistamento.session';
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
  const set = (s) => localStorage.setItem(KEY, JSON.stringify(s));
  const clear = () => localStorage.removeItem(KEY);

  async function req(path, { method = 'GET', body, isForm = false } = {}) {
    const headers = {};
    if (!isForm && body) headers['Content-Type'] = 'application/json';
    const res = await fetch(path, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  }

  function logout() { clear(); location.href = '/index.html'; }
  function requireAuth() { if (!get()) location.href = '/index.html'; }

  function renderWho() {
    const el = document.getElementById('who');
    const s = get();
    if (el && s?.username) el.textContent = '@' + s.username;
  }

  function bindLogout() {
    const btn = document.getElementById('logout');
    if (btn) btn.addEventListener('click', logout);
  }

  return { get, set, clear, req, logout, requireAuth, renderWho, bindLogout };
})();
