(() => {
  'use strict';

  const config = window.SITE_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { all: [], filtered: [], modalRecord: null };
  const colors = ['gold', 'green', 'olive', 'rose', 'blue'];

  const clean = (value) => String(value ?? '').trim();
  const esc = (value) => clean(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeUrl = (value) => {
    const raw = clean(value);
    if (!raw) return '';
    try {
      const url = new URL(raw, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const setText = (selector, value) => { const el = $(selector); if (el && value != null) el.textContent = value; };
  const normal = (value) => clean(value).toLocaleLowerCase('id-ID');

  function driveId(url) {
    const raw = clean(url);
    if (!raw) return '';
    const match = raw.match(/(?:\/file\/d\/|\/document\/d\/|\/spreadsheets\/d\/|[?&]id=)([a-zA-Z0-9_-]{15,})/);
    return match ? match[1] : '';
  }

  function drivePreview(url) {
    const id = driveId(url);
    return id ? `https://drive.google.com/file/d/${id}/preview` : '';
  }

  function driveThumbnail(url) {
    const id = driveId(url);
    return id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1000` : '';
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i], next = text[i + 1];
      if (char === '"' && quoted && next === '"') { field += '"'; i++; }
      else if (char === '"') quoted = !quoted;
      else if (char === ',' && !quoted) { row.push(field); field = ''; }
      else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && next === '\n') i++;
        row.push(field); field = '';
        if (row.some(cell => clean(cell))) rows.push(row);
        row = [];
      } else field += char;
    }
    if (field.length || row.length) { row.push(field); if (row.some(cell => clean(cell))) rows.push(row); }
    if (!rows.length) return [];
    const headers = rows.shift().map((h, i) => clean(h).replace(/^\uFEFF/, '').toLowerCase() || `col${i}`);
    return rows.map(cells => Object.fromEntries(headers.map((header, i) => [header, clean(cells[i] ?? '')])));
  }

  function normalizeRecord(raw, index = 0) {
    const get = (...keys) => {
      for (const key of keys) {
        const found = raw?.[key] ?? raw?.[key.toLowerCase()];
        if (found !== undefined && clean(found) !== '') return found;
      }
      return '';
    };
    const status = normal(get('status'));
    const demo = raw?.isDemo === true || normal(get('isdemo')) === 'true' || clean(get('id')).startsWith('DEMO-');
    return {
      id: clean(get('id')) || `NKN-${String(index + 1).padStart(4, '0')}`,
      title: clean(get('title', 'judul')) || 'Naskah tanpa judul',
      author: clean(get('author', 'pengarang', 'penulis')),
      year: clean(get('year', 'tahun', 'perkiraan_tahun')),
      origin: clean(get('origin', 'asal', 'daerah_asal')),
      language: clean(get('language', 'bahasa')),
      script: clean(get('script', 'aksara')),
      material: clean(get('material', 'bahan')),
      genre: clean(get('genre', 'tema', 'kategori')),
      description: clean(get('description', 'deskripsi', 'ringkasan')),
      condition: clean(get('condition', 'kondisi')),
      owner: clean(get('owner', 'pemilik', 'penyimpan')),
      region: clean(get('region', 'wilayah')),
      thumbnailUrl: safeUrl(get('thumbnailUrl', 'thumbnailurl', 'cover', 'gambar')),
      driveUrl: safeUrl(get('driveUrl', 'driveurl', 'file', 'fileUrl', 'url_naskah')),
      transcriptionUrl: safeUrl(get('transcriptionUrl', 'transcriptionurl', 'transkripsi', 'alih_aksara')),
      translationUrl: safeUrl(get('translationUrl', 'translationurl', 'terjemahan', 'alih_bahasa')),
      license: clean(get('license', 'izin', 'hak_akses')),
      status,
      keywords: clean(get('keywords', 'kata_kunci')),
      isDemo: demo
    };
  }

  function isVisible(record) {
    if (record.isDemo) return true;
    return !record.status || ['published', 'publish', 'public', 'terbit', 'aktif'].includes(record.status);
  }

  function uniqueValues(records, field) {
    return [...new Set(records.map(record => clean(record[field])).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'id'));
  }

  function fillSelect(selector, values, placeholder) {
    const select = $(selector);
    if (!select) return;
    const chosen = select.value;
    select.innerHTML = `<option value="">${esc(placeholder)}</option>` + values.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('');
    if (values.includes(chosen)) select.value = chosen;
  }

  function updateStats(records) {
    const total = records.length;
    const digitals = records.filter(record => !!record.driveUrl).length;
    const regions = uniqueValues(records, 'region').length;
    setText('#stat-total', total.toLocaleString('id-ID'));
    setText('#stat-digital', digitals.toLocaleString('id-ID'));
    setText('#stat-regions', regions.toLocaleString('id-ID'));
  }

  function createVisual(record, index) {
    const className = colors[index % colors.length];
    const image = record.thumbnailUrl || driveThumbnail(record.driveUrl);
    const fallback = `<div class="fake-book" aria-hidden="true"><span>${esc(record.script ? record.script.slice(0, 1) : '✧')}</span><i></i><i></i><i></i></div>`;
    return `<div class="card-visual ${className}"><span class="card-id">${esc(record.id)}</span><span class="card-badge">${record.isDemo ? 'Data contoh' : (record.driveUrl ? 'Digital tersedia' : 'Katalog')}</span>${image ? `<img src="${esc(image)}" alt="Sampul ${esc(record.title)}" loading="lazy" onerror="this.remove()">${fallback}` : fallback}</div>`;
  }

  function renderCatalog(records) {
    const grid = $('#catalog-grid');
    if (!grid) return;
    state.filtered = records;
    setText('#result-count', `${records.length.toLocaleString('id-ID')} entri ditemukan`);
    if (!records.length) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-symbol">✧</div><h3>Belum ada naskah yang cocok</h3><p>Coba ubah kata kunci atau atur ulang filter pencarian.</p></div>`;
      return;
    }
    grid.innerHTML = records.map((record, index) => {
      const summary = record.description || 'Informasi deskriptif naskah akan ditambahkan setelah proses pendataan dan verifikasi.';
      const tags = [record.language, record.script, record.genre].filter(Boolean).slice(0, 3);
      return `<article class="manuscript-card">
        ${createVisual(record, index)}
        <div class="card-body">
          <div class="card-meta"><span>${esc(record.region || 'Wilayah belum diisi')}</span><i class="bullet"></i><span>${esc(record.year || 'Tahun belum diteliti')}</span></div>
          <h3>${esc(record.title)}</h3>
          <p class="card-desc">${esc(summary)}</p>
          <div class="card-tags">${tags.map(tag => `<span>${esc(tag)}</span>`).join('') || '<span>Metadata belum lengkap</span>'}</div>
          <div class="card-footer"><small>${record.driveUrl ? 'Salinan digital tersedia' : 'Informasi katalog'}</small><button class="card-open" type="button" data-open-record="${esc(record.id)}">Lihat detail <span>↗</span></button></div>
        </div>
      </article>`;
    }).join('');

    grid.querySelectorAll('[data-open-record]').forEach(button => {
      button.addEventListener('click', () => openRecord(button.dataset.openRecord));
    });

    const demoCount = records.filter(record => record.isDemo).length;
    const note = $('#load-message');
    if (note) {
      note.hidden = demoCount === 0;
      note.textContent = demoCount ? 'Catatan pengelola: entri bertanda “Data contoh” hanya untuk demonstrasi tampilan. Ganti dengan metadata koleksi yang sudah diverifikasi sebelum situs dipublikasikan.' : '';
    }
  }

  function applyFilters() {
    const term = normal($('#search-input')?.value);
    const language = $('#language-filter')?.value || '';
    const script = $('#script-filter')?.value || '';
    const region = $('#region-filter')?.value || '';
    const results = state.all.filter(record => {
      const combined = normal([record.id, record.title, record.author, record.description, record.origin, record.language, record.script, record.genre, record.keywords, record.owner].join(' '));
      return (!term || combined.includes(term)) && (!language || record.language === language) && (!script || record.script === script) && (!region || record.region === region);
    });
    renderCatalog(results);
  }

  function openRecord(id) {
    const record = state.all.find(item => item.id === id);
    if (!record) return;
    state.modalRecord = record;
    setText('#modal-title', record.title);
    setText('#modal-subtitle', [record.id, record.author, record.year].filter(Boolean).join('  •  '));
    setText('#modal-description', record.description || 'Belum tersedia deskripsi untuk koleksi ini.');

    const cover = $('#modal-cover');
    cover.innerHTML = `<span>✧</span><small>ARSIP MANUSKRIP</small>`;
    const coverUrl = record.thumbnailUrl || driveThumbnail(record.driveUrl);
    if (coverUrl) {
      const img = document.createElement('img');
      img.src = coverUrl; img.alt = `Sampul ${record.title}`;
      img.onerror = () => img.remove();
      cover.prepend(img);
    }

    const details = [
      ['ID katalog', record.id], ['Pengarang / penyalin', record.author], ['Perkiraan tahun', record.year],
      ['Asal naskah', record.origin], ['Bahasa', record.language], ['Aksara', record.script],
      ['Bahan', record.material], ['Tema / genre', record.genre], ['Kondisi fisik', record.condition],
      ['Pemilik / penyimpan', record.owner], ['Wilayah', record.region], ['Status izin', record.license]
    ].filter(([, value]) => value);
    $('#modal-details').innerHTML = details.map(([label, value]) => `<div class="detail-item"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('');

    const actions = [];
    if (record.driveUrl) {
      const preview = drivePreview(record.driveUrl);
      actions.push(`<a href="${esc(record.driveUrl)}" target="_blank" rel="noopener noreferrer">Buka naskah digital <span>↗</span></a>`);
      if (preview) actions.push(`<a class="secondary" href="${esc(preview)}" target="_blank" rel="noopener noreferrer">Pratinjau di Google Drive <span>↗</span></a>`);
    }
    if (record.transcriptionUrl) actions.push(`<a class="secondary" href="${esc(record.transcriptionUrl)}" target="_blank" rel="noopener noreferrer">Baca alih aksara <span>↗</span></a>`);
    if (record.translationUrl) actions.push(`<a class="secondary" href="${esc(record.translationUrl)}" target="_blank" rel="noopener noreferrer">Baca terjemahan <span>↗</span></a>`);
    $('#modal-actions').innerHTML = actions.length ? actions.join('') : '<span class="rights-note">Tautan salinan digital belum ditambahkan.</span>';

    const modal = $('#detail-modal');
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.modal-close').focus();
  }

  function closeModal() {
    const modal = $('#detail-modal');
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.modalRecord = null;
  }

  async function loadRecords() {
    const source = clean(config.sheetCsvUrl);
    if (source) {
      try {
        const response = await fetch(source, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Sumber katalog merespons ${response.status}`);
        const csv = await response.text();
        const records = parseCSV(csv).map(normalizeRecord).filter(isVisible);
        if (!records.length) throw new Error('CSV terbaca, tetapi belum berisi baris katalog yang dipublikasikan.');
        return records;
      } catch (error) {
        console.warn('Gagal memuat Google Sheets; menggunakan data lokal.', error);
        const msg = $('#load-message');
        if (msg) { msg.hidden = false; msg.textContent = 'Sumber Google Sheets belum dapat dimuat. Menampilkan data lokal sementara. Pastikan sheet dipublikasikan sebagai CSV dan dapat diakses publik.'; }
      }
    }
    const response = await fetch(config.dataUrl || 'data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Berkas data.json tidak dapat dimuat.');
    const json = await response.json();
    return (Array.isArray(json) ? json : []).map(normalizeRecord).filter(isVisible);
  }

  function setupControls() {
    ['#search-input', '#language-filter', '#script-filter', '#region-filter'].forEach(selector => {
      $(selector)?.addEventListener(selector === '#search-input' ? 'input' : 'change', applyFilters);
    });
    $('#reset-filters')?.addEventListener('click', () => {
      $('#search-input').value = '';
      $('#language-filter').value = '';
      $('#script-filter').value = '';
      $('#region-filter').value = '';
      applyFilters();
      $('#search-input').focus();
    });
    $$('#detail-modal [data-close-modal]').forEach(element => element.addEventListener('click', closeModal));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && $('#detail-modal').classList.contains('open')) closeModal();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); $('#search-input')?.focus();
      }
    });
    const toggle = $('#mobile-toggle');
    toggle?.addEventListener('click', () => {
      const nav = $('#main-nav').parentElement;
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    });
    $$('#main-nav a').forEach(link => link.addEventListener('click', () => {
      $('#main-nav').parentElement.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }));
  }

  function applySiteConfig() {
    const siteName = clean(config.siteName) || 'Pustaka Naskah Nusantara';
    document.title = `${siteName} | Merawat Ingatan, Menjaga Warisan`;
    setText('#brand-name', siteName);
    setText('#footer-brand-name', siteName);
    setText('#copyright-name', siteName);
    setText('#about-description', config.about || 'Ruang digital untuk mengenalkan manuskrip Nusantara.');
    setText('#contact-text', config.contactText || 'Silakan hubungi pengelola.');
    const email = clean(config.contactEmail);
    const emailLink = $('#contact-email');
    if (emailLink && email) { emailLink.href = `mailto:${email}`; emailLink.textContent = `${email} ↗`; }
    setText('#current-year', new Date().getFullYear());
  }

  async function init() {
    applySiteConfig(); setupControls();
    try {
      state.all = await loadRecords();
      updateStats(state.all);
      fillSelect('#language-filter', uniqueValues(state.all, 'language'), 'Semua bahasa');
      fillSelect('#script-filter', uniqueValues(state.all, 'script'), 'Semua aksara');
      fillSelect('#region-filter', uniqueValues(state.all, 'region'), 'Semua wilayah');
      renderCatalog(state.all);
    } catch (error) {
      console.error(error);
      $('#catalog-grid').innerHTML = `<div class="empty-state"><div class="empty-symbol">!</div><h3>Katalog belum dapat dimuat</h3><p>Periksa berkas data.json atau pengaturan sumber katalog di site-config.js.</p></div>`;
      setText('#result-count', 'Sumber data belum tersedia');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
