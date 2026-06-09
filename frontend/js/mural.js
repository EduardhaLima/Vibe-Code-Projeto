(() => {
  API.requireAuth();
  API.renderWho();
  API.bindLogout();

  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');

  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  function media(m) {
    if (m.mime?.startsWith('video/')) return `<video src="${esc(m.url)}" controls preload="metadata"></video>`;
    return `<img loading="lazy" src="${esc(m.url)}" alt="" />`;
  }

  API.req('/api/records').then(records => {
    if (!records.length) { empty.hidden = false; return; }
    grid.innerHTML = records.map(r => `
      <article class="card">
        ${media(r.media[0])}
        <div class="meta">
          <h3>${esc(r.species)}</h3>
          <small>${esc(r.location)} · ${esc(r.date)}</small>
          ${r.notes ? `<p>${esc(r.notes)}</p>` : ''}
          <small class="muted">por @${esc(r.username)}</small>
        </div>
      </article>
    `).join('');
  }).catch(err => { empty.hidden = false; empty.textContent = err.message; });
})();
