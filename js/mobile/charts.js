// ===== MOBILE CHARTS =====

function initCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 100;
  const H = parseInt(canvas.getAttribute('height')) || 100;
  canvas.style.height = H + 'px';
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  return { ctx, W, H };
}

function drawColumnCharts() {
  COLUMNS.forEach(col => drawMiniDonut('chart-col-' + col.id, col.title, col.id));
}

function drawMiniDonut(canvasId, colTitle, colId) {
  const c = initCanvas(canvasId);
  if (!c) return;
  const { ctx, W, H } = c;
  const COLORS = { vital: '#de350b', gusto: '#4fc3f7', capricho: '#6554c0' };
  const LBLS = { vital: 'Vital', gusto: 'Gusto', capricho: 'Capricho' };
  const items = expenses.filter(e => e.estado === colId);
  const totals = { vital: 0, gusto: 0, capricho: 0 };
  items.forEach(e => { totals[e.prioridad || 'gusto'] += e.monto; });
  const grand = totals.vital + totals.gusto + totals.capricho;

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '600 11px -apple-system,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(colTitle, W / 2, 13);

  const cx = W / 2, cy = 58;
  const outerR = Math.min(W / 2 - 4, 32);
  const innerR = Math.round(outerR * 0.56);

  if (grand === 0) {
    ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Sin Gastos', cx, cy + outerR + 14);
    return;
  }

  const entries = Object.entries(totals).filter(([, v]) => v > 0);
  let angle = -Math.PI / 2;
  entries.forEach(([key, val]) => {
    const sweep = (val / grand) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, angle, angle + sweep);
    ctx.closePath(); ctx.fillStyle = COLORS[key]; ctx.fill();
    angle += sweep;
  });

  angle = -Math.PI / 2;
  entries.forEach(([, val]) => {
    const sweep = (val / grand) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    angle += sweep;
  });

  ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();

  const legendY = cy + outerR + 14;
  const rowH = 17;
  entries.forEach(([key, val], i) => {
    const y = legendY + i * rowH;
    const pct = Math.round((val / grand) * 100);
    ctx.beginPath(); ctx.arc(6, y - 3, 4, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[key]; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '600 10px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`${LBLS[key]}  ${pct}%`, 14, y);
  });
}

function drawChartColumnas() {
  const c = initCanvas('chart-columnas');
  if (!c) return;
  const { ctx, W, H } = c;
  const data = COLUMNS.map(col => ({
    id: col.id, label: col.id === 'por_pagar' ? 'Por Pagar' : col.id === 'carrito' ? 'Carrito' : 'Pagado',
    color: COL_COLORS[col.id],
    total: expenses.filter(e => e.estado === col.id).reduce((s, e) => s + e.monto, 0),
  }));
  const grand = data.reduce((s, d) => s + d.total, 0);
  const barH = 9, rowH = 38;
  const startY = (H - data.length * rowH) / 2 + 2;
  data.forEach((d, i) => {
    const y = startY + i * rowH;
    const fill = Math.round((grand > 0 ? d.total / grand : 0) * W);
    ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(d.label, 0, y + 12);
    ctx.font = '600 11px sans-serif'; ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillText(formatCLP(d.total), W, y + 12);
    ctx.beginPath(); ctx.roundRect(0, y + 18, W, barH, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    if (fill > 0) {
      ctx.beginPath(); ctx.roundRect(0, y + 18, fill, barH, 3);
      ctx.fillStyle = d.color; ctx.fill();
    }
  });
}
