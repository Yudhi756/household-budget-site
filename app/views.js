// DompetKeluarga — tampilan tiap halaman (dirender dari state).
import {
  CATEGORIES, catById, rupiah, monthName, monthShort, txInMonth, sumsFor,
  spentByCategory, sixMonthTrend, budgetStatus, sortedMonths, CURRENT_MONTH,
} from './store.js';
import { barChart, donutChart } from './charts.js';

export function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(d) {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statCard(label, value, cls, delta) {
  return `<section class="card stat"><div class="label">${label}</div><div class="value ${cls || ''}">${value}</div><div class="delta">${delta || ''}</div></section>`;
}

function txRow(tx) {
  const cat = catById(tx.category);
  const sign = tx.type === 'in' ? '+' : '−';
  const cls = tx.type === 'in' ? 'pos' : 'neg';
  return `<tr>
    <td>${fmtDate(tx.date)}</td>
    <td><span class="cat-dot" style="background:${cat.color}"></span><span class="cat-name">${esc(cat.label)}</span><br><span style="color:var(--muted)">${esc(tx.note)}</span></td>
    <td class="num ${cls}">${sign} ${rupiah(tx.amount)}</td>
    <td class="row-actions">
      <button type="button" class="btn btn-ghost btn-small" data-edit="${tx.id}">Ubah</button>
      <button type="button" class="btn btn-danger btn-small" data-delete="${tx.id}">Hapus</button>
    </td>
  </tr>`;
}

export function txForm(state, editing) {
  const cats = CATEGORIES.filter((c) => c.kind === (editing?.type || 'out'));
  const options = cats.map((c) => `<option value="${c.id}" ${editing && editing.category === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
  return `<form id="tx-form" class="card" data-editing="${editing ? editing.id : ''}">
    <h2>${editing ? 'Ubah transaksi' : 'Tambah transaksi'}</h2>
    <p class="sub">${editing ? 'Perbaiki data lalu simpan. Perubahan langsung tersimpan di perangkat ini.' : 'Catat pemasukan atau pengeluaran baru. Semua angka dalam Rupiah.'}</p>
    <div class="form-grid">
      <div class="field"><label for="f-type">Jenis</label>
        <select id="f-type" name="type">
          <option value="out" ${(!editing || editing.type === 'out') ? 'selected' : ''}>Pengeluaran</option>
          <option value="in" ${editing && editing.type === 'in' ? 'selected' : ''}>Pemasukan</option>
        </select></div>
      <div class="field"><label for="f-amount">Jumlah (Rp)</label>
        <input id="f-amount" name="amount" type="number" min="1000" step="500" inputmode="numeric" required value="${editing ? editing.amount : ''}" placeholder="mis. 150000"></div>
      <div class="field"><label for="f-category">Kategori</label>
        <select id="f-category" name="category">${options}</select></div>
      <div class="field"><label for="f-date">Tanggal</label>
        <input id="f-date" name="date" type="date" required value="${editing ? editing.date : CURRENT_MONTH + '-26'}"></div>
      <div class="field span-2"><label for="f-note">Keterangan</label>
        <input id="f-note" name="note" type="text" maxlength="80" required value="${editing ? esc(editing.note) : ''}" placeholder="mis. Belanja mingguan Pasar Minggu"></div>
    </div>
    <button class="btn btn-primary" type="submit">${editing ? 'Simpan perubahan' : 'Simpan transaksi'}</button>
    ${editing ? '<button class="btn btn-ghost" type="button" data-cancel-edit>Batal</button>' : ''}
  </form>`;
}

// ---- Beranda ----
export function renderDashboard(state) {
  const month = CURRENT_MONTH;
  const s = sumsFor(state, month);
  const prev = sumsFor(state, '2026-10');
  const trend = sixMonthTrend(state, month);
  const spent = spentByCategory(state, month);
  const recent = [...txInMonth(state, month)].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const over = Object.entries(state.budgets)
    .map(([cat, limit]) => ({ cat, limit, spent: spent[cat] || 0 }))
    .filter((b) => b.spent / b.limit >= 0.8)
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit);
  const savings = (spent.tabungan || 0);
  const overCallout = over.some((b) => b.spent > b.limit)
    ? `<div class="callout danger"><strong>Perhatian:</strong> ${over.filter((b) => b.spent > b.limit).map((b) => `${esc(catById(b.cat).label)} sudah lewat batas ${rupiah(b.limit)}`).join('; ')} — kurangi dulu pengeluaran kategori ini sampai akhir bulan.</div>`
    : over.length
      ? `<div class="callout"><strong>Hampir habis:</strong> ${over.map((b) => esc(catById(b.cat).label)).join(', ')} sudah memakai 80% anggaran atau lebih.</div>`
      : `<div class="callout good"><strong>Semua anggaran aman.</strong> Tidak ada kategori yang melewati 80% batas bulan ini.</div>`;

  return `<div class="page-head"><h1>Beranda — ${monthName(month)}</h1>
    <p>Halo, ${esc(state.household.name)}. Ini ringkasan uang keluarga bulan ini: pemasukan, pengeluaran, sisa, dan tabungan yang sudah terkumpul.</p></div>
  ${overCallout}
  <div class="grid-4">
    ${statCard('Pemasukan bulan ini', rupiah(s.income), 'in', `Bulan lalu ${rupiah(prev.income)}`)}
    ${statCard('Pengeluaran bulan ini', rupiah(s.expense), 'out', `Bulan lalu ${rupiah(prev.expense)}`)}
    ${statCard('Sisa uang', rupiah(s.balance), s.balance >= 0 ? 'pos' : 'neg', 'Pemasukan dikurangi pengeluaran')}
    ${statCard('Tabungan bulan ini', rupiah(savings), '', `Target ${rupiah(state.budgets.tabungan || 0)}`)}
  </div>
  <div class="grid-2">
    <section class="card"><h2>Pemasukan vs pengeluaran — 6 bulan terakhir</h2>
      <p class="sub">Juni–November 2026. Pengeluaran November masih di bawah pemasukan, jadi sisa bulan ini positif.</p>
      ${barChart(trend)}</section>
    <section class="card"><h2>Pengeluaran per kategori</h2>
      <p class="sub">Bulan ${monthName(month)} — kategori terbesar adalah Belanja Dapur dan Tabungan.</p>
      ${donutChart(Object.entries(spent).filter(([c]) => c !== 'tabungan').map(([c, v]) => ({ label: catById(c).label, value: v, color: catById(c).color })).sort((a, b) => b.value - a.value))}</section>
  </div>
  <div class="grid-2">
    <section class="card"><h2>Anggaran yang perlu diperhatikan</h2>
      <p class="sub">Kategori yang sudah memakai 80% anggaran atau lebih.</p>
      ${over.length ? over.map((b) => {
        const st = budgetStatus(b.spent, b.limit);
        return `<div class="budget-row"><div class="budget-top"><span><span class="cat-dot" style="background:${catById(b.cat).color}"></span><span class="cat-name">${esc(catById(b.cat).label)}</span></span><span class="amounts">${rupiah(b.spent)} / ${rupiah(b.limit)}</span></div>
        <div class="bar ${st.tag === 'over' ? 'over' : 'warn'}" role="img" aria-label="${esc(catById(b.cat).label)} terpakai ${st.pct} persen"><span style="width:${Math.min(100, st.pct)}%"></span></div>
        <span class="tag ${st.tag}">${st.label} · ${st.pct}%</span></div>`;
      }).join('') : '<p class="empty">Belum ada kategori yang mendekati batas.</p>'}
      <p style="margin:14px 0 0"><a href="#/anggaran">Lihat semua anggaran →</a></p></section>
    <section class="card"><h2>Transaksi terbaru</h2>
      <p class="sub">Lima transaksi terakhir bulan ini.</p>
      <ul class="list-plain">${recent.map((tx) => `<li><span><span class="cat-dot" style="background:${catById(tx.category).color}"></span>${esc(tx.note)} <span style="color:var(--muted)">· ${fmtDate(tx.date)}</span></span><span class="num ${tx.type === 'in' ? 'pos' : 'neg'}">${tx.type === 'in' ? '+' : '−'} ${rupiah(tx.amount)}</span></li>`).join('')}</ul>
      <p style="margin:14px 0 0"><a href="#/transaksi">Lihat semua transaksi →</a></p></section>
  </div>
  <section class="card"><h2>Tiga kebiasaan yang menghemat paling banyak</h2>
    <div class="tips">
      <div class="tip"><strong>Belanja mingguan sekali jalan</strong><p>Belanja dapur seminggu sekali di pasar menghemat Rp 180.000–250.000 sebulan dibanding belanja harian di minimarket.</p></div>
      <div class="tip"><strong>Tabungan dipotong di awal</strong><p>Rp 1.500.000 langsung dipindah ke tabungan pendidikan tiap tanggal 15, sebelum uangnya sempat terpakai.</p></div>
      <div class="tip"><strong>Batas makan di luar</strong><p>Anggaran Rp 500.000 sebulan untuk makan di luar — bulan ini sudah lewat, jadi masak di rumah sampai akhir bulan.</p></div>
    </div></section>`;
}

// ---- Transaksi ----
export function renderTransactions(state, query) {
  const month = query.month || CURRENT_MONTH;
  const cat = query.cat || '';
  const q = (query.q || '').toLowerCase();
  let list = txInMonth(state, month);
  if (cat) list = list.filter((tx) => tx.category === cat);
  if (q) list = list.filter((tx) => tx.note.toLowerCase().includes(q) || catById(tx.category).label.toLowerCase().includes(q));
  list = [...list].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const editing = query.edit ? state.transactions.find((tx) => tx.id === query.edit) : null;
  const months = sortedMonths(state);
  const s = sumsFor(state, month);

  return `<div class="page-head"><h1>Transaksi — ${monthName(month)}</h1>
    <p>Semua pemasukan dan pengeluaran bulan ini. Masuk ${rupiah(s.income)}, keluar ${rupiah(s.expense)}, sisa ${rupiah(s.balance)}.</p></div>
  ${query.baru || editing ? txForm(state, editing) : ''}
  <div class="card"><div class="toolbar" role="search">
      <div class="field"><label for="flt-month">Bulan</label>
        <select id="flt-month">${months.map((m) => `<option value="${m}" ${m === month ? 'selected' : ''}>${monthName(m)}</option>`).join('')}</select></div>
      <div class="field"><label for="flt-cat">Kategori</label>
        <select id="flt-cat"><option value="">Semua kategori</option>${CATEGORIES.map((c) => `<option value="${c.id}" ${c.id === cat ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></div>
      <div class="field grow"><label for="flt-q">Cari keterangan</label>
        <input id="flt-q" type="search" placeholder="mis. pasar, SPP, bensin" value="${esc(query.q || '')}"></div>
      <button class="btn btn-primary" type="button" data-new-tx>+ Tambah</button>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Tanggal</th><th>Keterangan</th><th class="num">Jumlah</th><th><span style="position:absolute;left:-9999px">Aksi</span></th></tr></thead>
      <tbody>${list.length ? list.map(txRow).join('') : `<tr><td colspan="4" class="empty">Tidak ada transaksi yang cocok. Ubah filter atau tambah transaksi baru.</td></tr>`}</tbody>
    </table></div>
    <p class="hint">${list.length} transaksi ditampilkan dari ${txInMonth(state, month).length} transaksi bulan ini.</p>
  </div>`;
}

// ---- Anggaran ----
export function renderBudgets(state) {
  const month = CURRENT_MONTH;
  const spent = spentByCategory(state, month);
  const rows = Object.entries(state.budgets).map(([cat, limit]) => {
    const s = spent[cat] || 0;
    const st = budgetStatus(s, limit);
    return { cat, limit, spent: s, st };
  });
  const totalLimit = rows.reduce((a, r) => a + r.limit, 0);
  const totalSpent = rows.reduce((a, r) => a + r.spent, 0);
  const totalSt = budgetStatus(totalSpent, totalLimit);
  return `<div class="page-head"><h1>Anggaran — ${monthName(month)}</h1>
    <p>Atur batas belanja tiap kategori. Batas total bulan ini ${rupiah(totalLimit)}, sudah terpakai ${rupiah(totalSpent)} (${totalSt.pct}%). Ubah batas dengan mengetik angka baru lalu tekan Simpan.</p></div>
  <div class="callout ${totalSt.tag === 'over' ? 'danger' : ''}"><strong>Total anggaran: ${totalSt.pct}% terpakai.</strong> ${totalSt.tag === 'over' ? 'Total pengeluaran sudah melewati total batas — tahan belanja yang tidak mendesak.' : 'Masih dalam batas total. Perhatikan kategori yang sudah lewat batas di bawah.'}</div>
  <section class="card"><h2>Batas tiap kategori</h2><p class="sub">Klik “Simpan” di baris yang diubah. Perubahan langsung tersimpan.</p>
  ${rows.map((r) => `<div class="budget-row">
      <div class="budget-top"><span><span class="cat-dot" style="background:${catById(r.cat).color}"></span><span class="cat-name">${esc(catById(r.cat).label)}</span> <span class="tag ${r.st.tag}">${r.st.label} · ${r.st.pct}%</span></span>
      <span class="amounts">${rupiah(r.spent)} dari ${rupiah(r.limit)} · sisa ${rupiah(Math.max(0, r.limit - r.spent))}</span></div>
      <div class="bar ${r.st.tag === 'over' ? 'over' : r.st.tag === 'warn' ? 'warn' : ''}" role="img" aria-label="${esc(catById(r.cat).label)} terpakai ${r.st.pct} persen"><span style="width:${Math.min(100, r.st.pct)}%"></span></div>
      <form class="budget-form" data-cat="${r.cat}" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <label for="budget-${r.cat}" style="margin:0">Batas baru (Rp)</label>
        <input id="budget-${r.cat}" name="limit" type="number" min="0" step="10000" value="${r.limit}" style="max-width:180px">
        <button class="btn btn-ghost btn-small" type="submit">Simpan batas</button>
        ${r.spent > r.limit ? `<span class="neg" style="font-size:13.5px">Lewat ${rupiah(r.spent - r.limit)} — kurangi ${rupiah(r.spent - r.limit)} dari belanja kategori ini.</span>` : ''}
      </form>
    </div>`).join('')}
  </section>
  <section class="card"><h2>Cara memakai anggaran</h2>
    <p class="sub">Tiga aturan sederhana yang dipakai keluarga ini:</p>
    <ol style="margin:0;padding-left:20px;font-size:15px">
      <li><strong>50-30-20:</strong> sekitar 50% pemasukan untuk kebutuhan, 30% untuk keinginan, 20% untuk tabungan.</li>
      <li><strong>Tabungan di awal bulan:</strong> Rp 1.500.000 dipindah tanggal 15, sebelum sisa uang terpakai.</li>
      <li><strong>Amplop mingguan:</strong> uang belanja dapur dibagi 4 amplop mingguan supaya tidak habis di minggu pertama.</li>
    </ol></section>`;
}

// ---- Laporan ----
export function renderReport(state, query) {
  const month = query.month || CURRENT_MONTH;
  const s = sumsFor(state, month);
  const prevKey = (() => { const [y, m] = month.split('-').map(Number); const d = new Date(y, m - 2, 1); return String(d.getFullYear()).padStart(4, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const prev = sumsFor(state, prevKey);
  const spent = spentByCategory(state, month);
  const parts = Object.entries(spent).filter(([c]) => c !== 'tabungan').map(([c, v]) => ({ label: catById(c).label, value: v, color: catById(c).color })).sort((a, b) => b.value - a.value);
  const top = parts.slice(0, 5);
  const months = sortedMonths(state);
  const pctChange = (a, b) => b ? Math.round(((a - b) / b) * 100) : 0;
  const incCh = pctChange(s.income, prev.income);
  const expCh = pctChange(s.expense, prev.expense);
  return `<div class="page-head"><h1>Laporan — ${monthName(month)}</h1>
    <p>Ringkasan bulanan keluarga: dari mana uang datang, ke mana uang pergi, dan bagaimana dibanding ${monthName(prevKey)}.</p></div>
  <div class="card"><div class="toolbar"><div class="field"><label for="rep-month">Pilih bulan</label>
    <select id="rep-month">${months.map((m) => `<option value="${m}" ${m === month ? 'selected' : ''}>${monthName(m)}</option>`).join('')}</select></div></div></div>
  <div class="grid-4">
    ${statCard('Pemasukan', rupiah(s.income), 'in', `${incCh >= 0 ? '+' : ''}${incCh}% dari bulan lalu`)}
    ${statCard('Pengeluaran', rupiah(s.expense), 'out', `${expCh >= 0 ? '+' : ''}${expCh}% dari bulan lalu`)}
    ${statCard('Sisa', rupiah(s.balance), s.balance >= 0 ? 'pos' : 'neg', `${Math.round((s.balance / Math.max(1, s.income)) * 100)}% dari pemasukan`)}
    ${statCard('Tabungan', rupiah(spent.tabungan || 0), '', `Target ${rupiah(state.budgets.tabungan || 0)}`)}
  </div>
  <div class="grid-2">
    <section class="card"><h2>Ke mana uang pergi</h2><p class="sub">Pengeluaran ${monthName(month)} di luar tabungan.</p>${donutChart(parts)}</section>
    <section class="card"><h2>Lima pengeluaran terbesar</h2><p class="sub">Kategori yang paling banyak menyedot uang bulan ini.</p>
      <table><thead><tr><th>Kategori</th><th class="num">Jumlah</th><th class="num">Bagian</th></tr></thead><tbody>
      ${top.map((p) => `<tr><td><span class="cat-dot" style="background:${p.color}"></span>${esc(p.label)}</td><td class="num">${rupiah(p.value)}</td><td class="num">${Math.round((p.value / Math.max(1, s.expense)) * 100)}%</td></tr>`).join('')}
      </tbody></table>
      <p class="hint" style="margin-top:12px">Belanja dapur dan sekolah anak selalu jadi dua pos terbesar keluarga ini — keduanya kebutuhan pokok, jadi penghematan dicari dari makan di luar dan hiburan.</p></section>
  </div>
  <section class="card"><h2>Perbandingan dengan ${monthName(prevKey)}</h2>
    <dl class="kv">
      <dt>Pemasukan bulan lalu</dt><dd>${rupiah(prev.income)} → ${rupiah(s.income)} (${incCh >= 0 ? 'naik' : 'turun'} ${Math.abs(incCh)}%)</dd>
      <dt>Pengeluaran bulan lalu</dt><dd>${rupiah(prev.expense)} → ${rupiah(s.expense)} (${expCh >= 0 ? 'naik' : 'turun'} ${Math.abs(expCh)}%)</dd>
      <dt>Sisa bulan lalu</dt><dd>${rupiah(prev.balance)} → ${rupiah(s.balance)}</dd>
      <dt>Kesimpulan</dt><dd>${s.balance > prev.balance ? 'Bulan ini lebih hemat: sisa uang naik ' + rupiah(s.balance - prev.balance) + ' dibanding bulan lalu.' : 'Sisa bulan ini lebih kecil ' + rupiah(prev.balance - s.balance) + ' dari bulan lalu — periksa kategori makan di luar dan hiburan.'}</dd>
    </dl></section>`;
}

// ---- Pengaturan ----
export function renderSettings(state) {
  return `<div class="page-head"><h1>Pengaturan</h1><p>Data keluarga, cara data disimpan, dan salinan cadangan.</p></div>
  <section class="card"><h2>Keluarga</h2>
    <dl class="kv">
      <dt>Nama keluarga</dt><dd>${esc(state.household.name)}</dd>
      <dt>Anggota</dt><dd>${state.household.members} orang — ${esc(state.household.note)}</dd>
      <dt>Gajian tiap tanggal</dt><dd>${state.household.payday} setiap bulan</dd>
      <dt>Mata uang</dt><dd>Rupiah (Rp), format Indonesia</dd>
    </dl>
    <p class="hint">Ubah nama keluarga di bawah — tersimpan di perangkat ini saja.</p>
    <form id="household-form" style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">
      <div class="field" style="flex:1;min-width:200px;margin:0"><label for="hh-name">Nama keluarga</label>
      <input id="hh-name" name="name" type="text" maxlength="60" value="${esc(state.household.name)}"></div>
      <button class="btn btn-primary" type="submit">Simpan nama</button>
    </form></section>
  <section class="card"><h2>Data &amp; cadangan</h2>
    <p class="sub">Semua transaksi dan anggaran tersimpan di localStorage peramban ini. Situs ini tidak mengirim data ke mana pun — buka tanpa internet pun tetap jalan.</p>
    <p><button class="btn btn-ghost" type="button" data-export>Unduh cadangan (JSON)</button>
    <span style="margin:0 6px"></span>
    <button class="btn btn-ghost" type="button" data-reset>Kembalikan data contoh</button></p>
    <p class="hint">${state.transactions.length} transaksi tersimpan · ${Object.keys(state.budgets).length} batas anggaran aktif.</p></section>
  <details><summary>Pertanyaan yang sering ditanyakan</summary>
    <p><strong>Apakah data saya aman?</strong> Data hanya ada di peramban Anda. Hapus data peramban berarti menghapus catatan ini — unduh cadangan JSON secara berkala.</p>
    <p><strong>Bisakah dipakai di HP?</strong> Ya. Buka halaman ini di peramban HP; tampilannya menyesuaikan layar kecil.</p>
    <p><strong>Bagaimana kalau gajian berubah tanggal?</strong> Ubah tanggal gajian di atas; ringkasan bulanan tetap mengikuti kalender (tanggal 1–akhir bulan).</p></details>`;
}
