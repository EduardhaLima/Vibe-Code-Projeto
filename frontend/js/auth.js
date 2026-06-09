// Auth simples no cliente (localStorage). Sem servidor, sem JWT.
(() => {
  if (API.get()) { location.href = '/mural.html'; return; }

  const USERS_KEY = 'avistamento.users';
  const getUsers = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; } };
  const setUsers = (u) => localStorage.setItem(USERS_KEY, JSON.stringify(u));

  const validUser = (u) => /^[a-zA-Z0-9_.\-]{3,32}$/.test(u || '');
  const validPass = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 128;

  let mode = 'login';
  const tabs = document.querySelectorAll('.tab');
  const form = document.getElementById('auth-form');
  const msg = document.getElementById('auth-msg');
  const submit = form.querySelector('button[type=submit]');

  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    mode = t.dataset.tab;
    submit.textContent = mode === 'login' ? 'Entrar' : 'Criar conta';
    msg.textContent = '';
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = '';
    const fd = Object.fromEntries(new FormData(form));
    const username = (fd.username || '').trim();
    const password = fd.password || '';

    if (!validUser(username)) return msg.textContent = 'Usuário inválido (3-32, letras/números/._-)';
    if (!validPass(password)) return msg.textContent = 'Senha precisa ter 8+ caracteres';

    const users = getUsers();
    const key = username.toLowerCase();

    if (mode === 'register') {
      if (users[key]) return msg.textContent = 'Usuário já existe';
      users[key] = { username, password, createdAt: new Date().toISOString() };
      setUsers(users);
    } else {
      if (!users[key] || users[key].password !== password) return msg.textContent = 'Credenciais inválidas';
    }

    API.set({ username });
    location.href = '/mural.html';
  });
})();
