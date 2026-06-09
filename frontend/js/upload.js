(() => {
  API.requireAuth();
  API.renderWho();
  API.bindLogout();

  const form = document.getElementById('upload-form');
  const msg = document.getElementById('up-msg');
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
  const MAX_FILE = 25 * 1024 * 1024;
  const MAX_TOTAL = 100 * 1024 * 1024;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = ''; msg.classList.remove('ok');

    const session = API.get();
    if (!session?.username) { msg.textContent = 'Faça login novamente.'; return; }

    const fd = new FormData(form);
    const species = (fd.get('species') || '').toString().trim();
    const date = fd.get('date');
    const location = (fd.get('location') || '').toString().trim();
    const notes = (fd.get('notes') || '').toString();
    const files = fd.getAll('media');

    // Validações no cliente — avisos no front
    if (species.length < 2 || species.length > 80) return msg.textContent = 'Espécie deve ter 2-80 caracteres.';
    if (!date || isNaN(Date.parse(date)) || new Date(date) > new Date()) return msg.textContent = 'Data inválida ou no futuro.';
    if (location.length < 2 || location.length > 120) return msg.textContent = 'Local deve ter 2-120 caracteres.';
    if (notes.length > 1000) return msg.textContent = 'Notas até 1000 caracteres.';
    if (!files.length) return msg.textContent = 'Envie ao menos 1 arquivo.';
    if (files.length > 5) return msg.textContent = 'Máximo 5 arquivos.';
    for (const f of files) {
      if (!ALLOWED.includes(f.type)) return msg.textContent = `Tipo não permitido: ${f.name}`;
      if (f.size > MAX_FILE) return msg.textContent = `Arquivo acima de 25MB: ${f.name}`;
    }
    const total = files.reduce((s, f) => s + (f.size || 0), 0);
    if (total > MAX_TOTAL) return msg.textContent = 'Total acima de 100MB.';

    fd.append('username', session.username);

    try {
      await API.req('/api/records', { method: 'POST', body: fd, isForm: true });
      msg.textContent = 'Enviado com sucesso!'; msg.classList.add('ok');
      form.reset();
      setTimeout(() => location.href = '/mural.html', 700);
    } catch (err) {
      msg.textContent = err.message;
    }
  });
})();
