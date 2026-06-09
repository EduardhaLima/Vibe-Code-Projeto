window.API = (() => {
  const KEY = 'avistamento.session';
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
  const set = (s) => localStorage.setItem(KEY, JSON.stringify(s));
  const clear = () => localStorage.removeItem(KEY);

  const staticRecordUrl = '/backend/data/records.json';

  function normalizeStaticRecords(records) {
    if (!Array.isArray(records)) return [];
    return records
      .map((record) => ({
        ...record,
        media: Array.isArray(record.media)
          ? record.media.map((item) => ({
              ...item,
              url: item?.url?.startsWith('/uploads/') ? `/backend${item.url}` : item?.url,
            }))
          : [],
      }))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }

  async function readStaticRecords() {
    const res = await fetch(staticRecordUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return normalizeStaticRecords(await res.json());
  }

  async function req(path, { method = 'GET', body, isForm = false } = {}) {
    const headers = {};
    if (!isForm && body) headers['Content-Type'] = 'application/json';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(path, {
        method,
        headers,
        body: isForm ? body : body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok && method === 'GET' && path === '/api/records' && [404, 405].includes(res.status)) {
        return await readStaticRecords();
      }

      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);

      if (method === 'GET' && path === '/api/records' && !Array.isArray(data)) {
        return await readStaticRecords();
      }

      return data;
    } catch (err) {
      if (method === 'GET' && path === '/api/records') {
        return await readStaticRecords();
      }
      if (err.name === 'AbortError') {
        throw new Error('Servidor demorou para responder');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
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