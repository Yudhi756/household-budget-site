// DompetKeluarga — grafik SVG buatan sendiri (tanpa pustaka).
// Dipakai di Beranda (batang 6 bulan) dan Laporan (donat kategori).
import { rupiah, monthShort } from './store.js';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Grafik batang berkelompok: pemasukan (hijau) vs pengeluaran (merah muda).
export function barChart(trend) {
  const W = 640;
  const H = 260;
  const padL = 52;
  const padB = 30;
  const padT = 14;
  const max = Math.max(1, ...trend.map((d) => Math.max(d.income, d.expense)));
  const plotW = W - padL - 16;
  const plotH = H - padT - padB;
  const slot = plotW / trend.length;
  const barW = Math.min(26, (slot - 14) / 2);
  let bars = '';
  trend.forEach((d, i) => {
    const x0 = padL + i * slot + (slot - barW * 2 - 6) / 2;
    const hIn = (d.income / max) * plotH;
    const hOut = (d.expense / max) * plotH;
    bars += `<rect x="${x0.toFixed(1)}" y="${(padT + plotH - hIn).toFixed(1)}" width="${barW}" height="${hIn.toFixed(1)}" rx="3" fill="#2e7d46"><title>Pemasukan ${monthShort(d.month)}: ${rupiah(d.income)}</title></rect>`;
    bars += `<rect x="${(x0 + barW + 6).toFixed(1)}" y="${(padT + plotH - hOut).toFixed(1)}" width="${barW}" height="${hOut.toFixed(1)}" rx="3" fill="#d98a7e"><title>Pengeluaran ${monthShort(d.month)}: ${rupiah(d.expense)}</title></rect>`;
    bars += `<text x="${(padL + i * slot + slot / 2).toFixed(1)}" y="${H - 10}" text-anchor="middle" font-size="12" fill="#5f6d5a">${esc(monthShort(d.month))}</text>`;
  });
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = padT + plotH * (1 - f);
    return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - 16}" y2="${y.toFixed(1)}" stroke="#e2dccb" stroke-width="1"/><text x="${padL - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#5f6d5a">${(max * f / 1000000).toFixed(1)} jt</text>`;
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik batang pemasukan dan pengeluaran enam bulan terakhir">${grid}${bars}<line x1="${padL}" y1="${padT + plotH}" x2="${W - 16}" y2="${padT + plotH}" stroke="#c9c2ab" stroke-width="1.5"/></svg>
  <ul class="legend"><li><span class="cat-dot" style="background:#2e7d46"></span>Pemasukan</li><li><span class="cat-dot" style="background:#d98a7e"></span>Pengeluaran</li></ul>`;
}

// Donat pembagian pengeluaran per kategori.
export function donutChart(parts) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const cx = 110;
  const cy = 110;
  const r = 84;
  const hole = 52;
  let angle = -Math.PI / 2;
  let slices = '';
  for (const p of parts) {
    const frac = p.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    angle = a1;
    if (frac <= 0) continue;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xi1 = cx + hole * Math.cos(a1);
    const yi1 = cy + hole * Math.sin(a1);
    const xi0 = cx + hole * Math.cos(a0);
    const yi0 = cy + hole * Math.sin(a0);
    slices += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${hole} ${hole} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z" fill="${p.color}"><title>${esc(p.label)}: ${rupiah(p.value)} (${Math.round(frac * 100)}%)</title></path>`;
  }
  const legend = parts.map((p) => `<li><span class="cat-dot" style="background:${p.color}"></span>${esc(p.label)} — <strong>${rupiah(p.value)}</strong> (${Math.round((p.value / total) * 100)}%)</li>`).join('');
  return `<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
    <svg class="chart-svg" style="max-width:220px" viewBox="0 0 220 220" role="img" aria-label="Donat pembagian pengeluaran per kategori">${slices}
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="13" fill="#5f6d5a">Total keluar</text>
      <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="15" font-weight="700" fill="#17351f">${rupiah(total)}</text>
    </svg>
    <ul class="legend" style="flex:1;min-width:220px;flex-direction:column;gap:4px">${legend}</ul>
  </div>`;
}
