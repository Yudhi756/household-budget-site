// DompetKeluarga — data dan penyimpanan.
// Semua data tinggal di localStorage peramban ini; tidak ada jaringan.
// Angka contoh adalah data keluarga fiktif "Keluarga Hartono" untuk
// November 2026, supaya halaman langsung menunjukkan angka nyata.

export const LS_KEY = 'dompetkeluarga.v1';

export const CATEGORIES = [
  { id: 'gaji', label: 'Gaji & Penghasilan', color: '#2e7d46', kind: 'in' },
  { id: 'usaha', label: 'Usaha Sampingan', color: '#5b8c5a', kind: 'in' },
  { id: 'dapur', label: 'Belanja Dapur', color: '#c98a12', kind: 'out' },
  { id: 'listrik', label: 'Listrik & Air', color: '#1d4e89', kind: 'out' },
  { id: 'internet', label: 'Internet & HP', color: '#6a4fa3', kind: 'out' },
  { id: 'transport', label: 'Transport', color: '#0e7c7b', kind: 'out' },
  { id: 'sekolah', label: 'Sekolah Anak', color: '#b3541e', kind: 'out' },
  { id: 'kesehatan', label: 'Kesehatan', color: '#b3261e', kind: 'out' },
  { id: 'hiburan', label: 'Hiburan', color: '#8a6d1d', kind: 'out' },
  { id: 'makan-luar', label: 'Makan di Luar', color: '#c25e7a', kind: 'out' },
  { id: 'tabungan', label: 'Tabungan', color: '#225c33', kind: 'out' },
  { id: 'lainnya', label: 'Lainnya', color: '#7a7a72', kind: 'out' },
];

export const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

// Anggaran bulanan keluarga (rupiah). "Makan di Luar" sengaja dibuat
// melewati batas supaya halaman Anggaran menunjukkan peringatan nyata.
export const DEFAULT_BUDGETS = {
  dapur: 2500000,
  listrik: 600000,
  internet: 350000,
  transport: 800000,
  sekolah: 1500000,
  kesehatan: 400000,
  hiburan: 300000,
  'makan-luar': 500000,
  tabungan: 1500000,
};

// Rekap bulan-bulan sebelumnya (Juni–September 2026) untuk grafik tren.
export const HISTORY = [
  { month: '2026-06', income: 9200000, expense: 6100000 },
  { month: '2026-07', income: 9500000, expense: 6800000 },
  { month: '2026-08', income: 9700000, expense: 6300000 },
  { month: '2026-09', income: 9400000, expense: 7100000 },
];

let uid = 1000;
const t = (date, type, category, note, amount) => ({ id: 't' + (uid += 1), date, type, category, note, amount });

function seedTransactions() {
  uid = 1000;
  return [
    // Pemasukan November 2026
    t('2026-11-01', 'in', 'gaji', 'Gaji bulanan — Ayah', 8500000),
    t('2026-11-15', 'in', 'usaha', 'Jualan kue — Ibu (2 minggu)', 1200000),
    // Pengeluaran November 2026
    t('2026-11-02', 'out', 'dapur', 'Belanja mingguan Pasar Minggu', 486000),
    t('2026-11-02', 'out', 'listrik', 'Token listrik 200 kWh', 312000),
    t('2026-11-03', 'out', 'transport', 'Bensin motor (2x isi)', 84000),
    t('2026-11-04', 'out', 'sekolah', 'SPP November — Raka', 750000),
    t('2026-11-05', 'out', 'internet', 'Paket internet rumah', 275000),
    t('2026-11-06', 'out', 'dapur', 'Belanja sayur & lauk', 212500),
    t('2026-11-07', 'out', 'makan-luar', 'Makan malam keluarga — warung soto', 148000),
    t('2026-11-08', 'out', 'hiburan', 'Tiket bioskop (4 orang)', 180000),
    t('2026-11-09', 'out', 'dapur', 'Belanja mingguan Pasar Minggu', 521000),
    t('2026-11-10', 'out', 'kesehatan', 'Obat flu & vitamin — apotek', 96500),
    t('2026-11-11', 'out', 'transport', 'Ojek online — antar jemput sekolah', 126000),
    t('2026-11-12', 'out', 'makan-luar', 'Ayam geprek & es teh (kantor)', 67000),
    t('2026-11-13', 'out', 'dapur', 'Beras 10 kg & minyak goreng', 198000),
    t('2026-11-14', 'out', 'sekolah', 'Buku latihan & alat tulis — Dina', 142000),
    t('2026-11-15', 'out', 'tabungan', 'Setor tabungan pendidikan', 1500000),
    t('2026-11-16', 'out', 'dapur', 'Belanja mingguan Pasar Minggu', 468000),
    t('2026-11-17', 'out', 'listrik', 'Tagihan air PDAM', 186000),
    t('2026-11-18', 'out', 'transport', 'Bensin motor + parkir', 92000),
    t('2026-11-19', 'out', 'makan-luar', 'Nasi padang — makan siang keluarga', 132000),
    t('2026-11-20', 'out', 'hiburan', 'Langganan streaming sebulan', 59000),
    t('2026-11-21', 'out', 'dapur', 'Belanja sayur & buah', 243000),
    t('2026-11-22', 'out', 'makan-luar', 'Bakso & jus — jalan sore', 96000),
    t('2026-11-23', 'out', 'kesehatan', 'Periksa gigi — Dina', 175000),
    t('2026-11-24', 'out', 'transport', 'Servis ringan motor', 210000),
    t('2026-11-25', 'out', 'makan-luar', 'Pesan antar — makan malam', 89000),
    // Oktober 2026 (untuk perbandingan laporan)
    t('2026-10-01', 'in', 'gaji', 'Gaji bulanan — Ayah', 8500000),
    t('2026-10-14', 'in', 'usaha', 'Jualan kue — Ibu (2 minggu)', 950000),
    t('2026-10-02', 'out', 'dapur', 'Belanja mingguan Pasar Minggu', 502000),
    t('2026-10-03', 'out', 'listrik', 'Token listrik + air PDAM', 486000),
    t('2026-10-05', 'out', 'sekolah', 'SPP Oktober — Raka', 750000),
    t('2026-10-06', 'out', 'internet', 'Paket internet rumah', 275000),
    t('2026-10-09', 'out', 'dapur', 'Belanja mingguan Pasar Minggu', 488000),
    t('2026-10-11', 'out', 'transport', 'Bensin & ojek online', 246000),
    t('2026-10-13', 'out', 'makan-luar', 'Makan di luar (2x)', 214000),
    t('2026-10-15', 'out', 'tabungan', 'Setor tabungan pendidikan', 1500000),
    t('2026-10-16', 'out', 'dapur', 'Beras & kebutuhan pokok', 301000),
    t('2026-10-18', 'out', 'hiburan', 'Bioskop & camilan', 152000),
    t('2026-10-20', 'out', 'kesehatan', 'Vitamin & obat', 88000),
    t('2026-10-23', 'out', 'dapur', 'Belanja mingguan Pasar Minggu', 466000),
    t('2026-10-25', 'out', 'sekolah', 'Les tambahan — Raka', 300000),
    t('2026-10-27', 'out', 'transport', 'Bensin motor', 98000),
    t('2026-10-29', 'out', 'lainnya', 'Perbaiki kipas angin', 145000),
  ];
}

export function seedState() {
  return {
    household: { name: 'Keluarga Hartono', members: 4, payday: 1, note: 'Ayah, Ibu, Raka (12 th), Dina (8 th)' },
    budgets: { ...DEFAULT_BUDGETS },
    transactions: seedTransactions(),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions) || !parsed.budgets) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

export function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export function resetState() {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

// ---- Hitungan ----

export const rupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export const monthOf = (dateStr) => dateStr.slice(0, 7);

export function monthName(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export function monthShort(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
}

export function txInMonth(state, monthKey) {
  return state.transactions.filter((tx) => monthOf(tx.date) === monthKey);
}

export function sumsFor(state, monthKey) {
  let income = 0;
  let expense = 0;
  for (const tx of txInMonth(state, monthKey)) {
    if (tx.type === 'in') income += tx.amount;
    else expense += tx.amount;
  }
  return { income, expense, balance: income - expense };
}

export function spentByCategory(state, monthKey) {
  const spent = {};
  for (const tx of txInMonth(state, monthKey)) {
    if (tx.type !== 'out') continue;
    spent[tx.category] = (spent[tx.category] || 0) + tx.amount;
  }
  return spent;
}

// Tren 6 bulan: rekap lama + bulan berjalan dari transaksi.
export function sixMonthTrend(state, currentMonth) {
  const keys = [];
  const [cy, cm] = currentMonth.split('-').map(Number);
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(cy, cm - 1 - i, 1);
    keys.push(String(d.getFullYear()).padStart(4, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }
  return keys.map((key) => {
    const old = HISTORY.find((h) => h.month === key);
    if (old) return { month: key, ...old };
    const s = sumsFor(state, key);
    return { month: key, income: s.income, expense: s.expense };
  });
}

export function budgetStatus(spent, limit) {
  if (!limit) return { pct: 0, tag: 'ok', label: 'Tanpa batas' };
  const pct = Math.round((spent / limit) * 100);
  if (pct > 100) return { pct, tag: 'over', label: 'Lewat batas' };
  if (pct >= 80) return { pct, tag: 'warn', label: 'Hampir habis' };
  return { pct, tag: 'ok', label: 'Aman' };
}

export function sortedMonths(state) {
  const set = new Set(state.transactions.map((tx) => monthOf(tx.date)));
  return [...set].sort().reverse();
}

export const CURRENT_MONTH = '2026-11';
