// DompetKeluarga — perute hash dan pengikat antarmuka.
import { loadState, saveState, resetState, CATEGORIES, CURRENT_MONTH } from './store.js';
import { renderDashboard, renderTransactions, renderBudgets, renderReport, renderSettings } from './views.js';

let state = loadState();
const view = document.getElementById('view');

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  return { path: path || '', query: Object.fromEntries(new URLSearchParams(qs || '')) };
}

function render() {
  const { path, query } = parseHash();
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const key = a.dataset.nav;
    const active = (path === '' && key === 'dashboard') || path === key;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (path === 'transaksi') view.innerHTML = renderTransactions(state, query);
  else if (path === 'anggaran') view.innerHTML = renderBudgets(state);
  else if (path === 'laporan') view.innerHTML = renderReport(state, query);
  else if (path === 'pengaturan') view.innerHTML = renderSettings(state);
  else view.innerHTML = renderDashboard(state);
  window.scrollTo(0, 0);
}

function go(hash) {
  location.hash = hash;
}

function refresh() {
  saveState(state);
  render();
}

// Kategori pada form mengikuti jenis yang dipilih.
function syncCategoryOptions(form) {
  const type = form.querySelector('[name="type"]').value;
  const sel = form.querySelector('[name="category"]');
  const keep = sel.value;
  const cats = CATEGORIES.filter((c) => c.kind === type);
  sel.innerHTML = cats.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
  if (cats.some((c) => c.id === keep)) sel.value = keep;
}

view.addEventListener('submit', (ev) => {
  const form = ev.target;
  ev.preventDefault();
  if (form.id === 'tx-form') {
    const data = new FormData(form);
    const amount = Math.round(Number(data.get('amount')));
    if (!amount || amount <= 0) { alert('Jumlah harus lebih dari 0.'); return; }
    const rec = {
      id: form.dataset.editing || 't' + Date.now(),
      date: String(data.get('date')),
      type: String(data.get('type')),
      category: String(data.get('category')),
      note: String(data.get('note')).trim(),
      amount,
    };
    if (form.dataset.editing) {
      const i = state.transactions.findIndex((tx) => tx.id === rec.id);
      if (i >= 0) state.transactions[i] = rec;
    } else {
      state.transactions.push(rec);
    }
    refresh();
    go('#/transaksi?month=' + rec.date.slice(0, 7));
  } else if (form.classList.contains('budget-form')) {
    const limit = Math.round(Number(new FormData(form).get('limit')));
    if (Number.isNaN(limit) || limit < 0) { alert('Batas harus angka 0 atau lebih.'); return; }
    state.budgets[form.dataset.cat] = limit;
    refresh();
  } else if (form.id === 'household-form') {
    const name = String(new FormData(form).get('name')).trim();
    if (name) { state.household.name = name; refresh(); }
  }
});

view.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.id === 'f-type') syncCategoryOptions(el.closest('form'));
  if (el.id === 'flt-month' || el.id === 'flt-cat') {
    const q = new URLSearchParams();
    q.set('month', document.getElementById('flt-month').value);
    const cat = document.getElementById('flt-cat').value;
    if (cat) q.set('cat', cat);
    const term = document.getElementById('flt-q').value.trim();
    if (term) q.set('q', term);
    go('#/transaksi?' + q.toString());
  }
  if (el.id === 'rep-month') go('#/laporan?month=' + el.value);
});

view.addEventListener('input', (ev) => {
  if (ev.target.id === 'flt-q') {
    clearTimeout(view._qTimer);
    view._qTimer = setTimeout(() => {
      const q = new URLSearchParams();
      q.set('month', document.getElementById('flt-month').value);
      const cat = document.getElementById('flt-cat').value;
      if (cat) q.set('cat', cat);
      const term = ev.target.value.trim();
      if (term) q.set('q', term);
      history.replaceState(null, '', '#/transaksi?' + q.toString());
      render();
      const input = document.getElementById('flt-q');
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    }, 350);
  }
});

view.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  if (btn.dataset.edit) { go('#/transaksi?edit=' + btn.dataset.edit); return; }
  if (btn.dataset.delete) {
    if (confirm('Hapus transaksi ini?')) {
      state.transactions = state.transactions.filter((tx) => tx.id !== btn.dataset.delete);
      refresh();
    }
    return;
  }
  if (btn.hasAttribute('data-new-tx')) { go('#/transaksi?baru=1'); return; }
  if (btn.hasAttribute('data-cancel-edit')) { go('#/transaksi'); return; }
  if (btn.hasAttribute('data-export')) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dompetkeluarga-cadangan.json';
    a.click();
    URL.revokeObjectURL(a.href);
    return;
  }
  if (btn.hasAttribute('data-reset')) {
    if (confirm('Kembalikan semua data ke contoh awal? Transaksi yang Anda tambah akan hilang.')) {
      state = resetState();
      refresh();
      go('#/');
    }
  }
});

window.addEventListener('hashchange', render);
render();
