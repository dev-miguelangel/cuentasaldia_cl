// ===== MOBILE RENDER =====

function cardHTML(e) {
  const pri = e.prioridad || 'gusto';
  const pct = (budget > 0 && e.monto > 0) ? Math.round(e.monto / budget * 100) : 0;
  return `
    <div class="mob-card">
      <div class="mob-card-stripe" style="background:${PRI_COLORS[pri]}"></div>
      <div class="mob-card-body">
        <div class="mob-card-row-top">
          <div class="mob-card-title">${escapeHTML(e.titulo)}</div>
          <div class="mob-card-icon-actions">
            <button class="mob-card-edit" data-id="${e.id}">✎</button>
            <button class="mob-card-delete" data-id="${e.id}">✕</button>
          </div>
        </div>
        <div class="mob-card-row-bottom">
          <span class="priority-badge ${pri}">${PRIORITY_LABELS[pri]}</span>
          <span class="mob-card-amount">${formatCLP(e.monto)}</span>
          ${pct > 0 ? `<span class="mob-card-pct">${pct}%</span>` : ''}
          <button class="mob-card-move" data-id="${e.id}">Mover →</button>
        </div>
      </div>
    </div>
  `;
}

function boardBudgetHTML(spent) {
  if (!budget) {
    return `
      <div class="budget-empty">
        <div class="budget-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
        <div>
          <div class="budget-empty-title">Definir Presupuesto</div>
          <div class="budget-empty-sub">¿Cuánto tienes disponible para gastar?</div>
        </div>
      </div>
    `;
  }
  const remaining = budget - spent;
  const over = spent > budget;
  const pct = over ? 0 : Math.max((remaining / budget) * 100, 0);
  let barColor, textColor;
  if (over) { barColor = '#de350b'; textColor = '#ffccc2'; }
  else if (pct <= 10) { barColor = '#ff5630'; textColor = '#ffceba'; }
  else if (pct <= 30) { barColor = '#ff991f'; textColor = '#ffe5a0'; }
  else { barColor = '#36b37e'; textColor = '#b3f5d4'; }
  const label = over
    ? `⚠ Excedido Por ${formatCLP(Math.abs(remaining))}`
    : `${formatCLP(remaining)} Disponible`;
  return `
    <div class="budget-bar-wrap">
      <div class="budget-bar-label-row">
        <span class="budget-bar-label-left">Presupuesto</span>
        <span class="budget-bar-label-right">Gastado ${formatCLP(spent)} / ${formatCLP(budget)}</span>
      </div>
      <div class="budget-bar-track">
        <div class="budget-bar-fill" style="width:${pct}%;background:${barColor}"></div>
      </div>
      <div class="budget-meta">
        <span class="budget-remaining" style="color:${textColor}">${label}</span>
        <span class="budget-edit-hint">✎ Editar</span>
      </div>
    </div>
  `;
}

function analyticsHTML() {
  return `
    <div class="analytics-block">
      <div class="analytics-block-title">Distribución Por Tipo</div>
      <div class="charts-row">
        <canvas id="chart-col-por_pagar" class="analytics-canvas" height="170"></canvas>
        <canvas id="chart-col-carrito"   class="analytics-canvas" height="170"></canvas>
        <canvas id="chart-col-pagado"    class="analytics-canvas" height="170"></canvas>
      </div>
      <div class="chart-divider"></div>
      <div class="analytics-block-title">Total Por Columna</div>
      <canvas id="chart-columnas" class="analytics-canvas" height="130"></canvas>
      <div class="chart-divider"></div>
      <div class="analytics-block-title">Guía De Prioridades</div>
      <div class="priority-guide">
        <div class="priority-guide-item">
          <div class="priority-guide-dot" style="background:#de350b"></div>
          <div><div class="priority-guide-name">Vital</div><div class="priority-guide-desc">Sin esto, el mundo se detiene.</div></div>
        </div>
        <div class="priority-guide-item">
          <div class="priority-guide-dot" style="background:#4fc3f7"></div>
          <div><div class="priority-guide-name">Gusto</div><div class="priority-guide-desc">Lo que mantiene tu ritmo de vida.</div></div>
        </div>
        <div class="priority-guide-item">
          <div class="priority-guide-dot" style="background:#6554c0"></div>
          <div><div class="priority-guide-name">Capricho</div><div class="priority-guide-desc">Innecesario, pero te saca una sonrisa.</div></div>
        </div>
      </div>
    </div>
  `;
}

// ===== SUMMARY TAB =====
var COL_SUMMARY_META = {
  por_pagar: { label: 'Por Pagar', bg: '#fff0e6', stroke: '#ff8b00',
    icon: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>' },
  carrito:   { label: 'Carrito',   bg: '#e6f4ff', stroke: '#0079bf',
    icon: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>' },
  pagado:    { label: 'Pagado',    bg: '#e6fff5', stroke: '#36b37e',
    icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
};

var PRI_SUMMARY = [
  { key: 'vital',    label: 'Vital',    color: '#de350b' },
  { key: 'gusto',    label: 'Gusto',    color: '#0079bf' },
  { key: 'capricho', label: 'Capricho', color: '#6554c0' },
];

function renderSummary() {
  const content = document.getElementById('tab-content');
  const summary = document.getElementById('col-summary');
  const fab     = document.getElementById('fab');

  fab.style.display = 'none';

  const totalGeneral = expenses.reduce((s, e) => s + e.monto, 0);
  summary.innerHTML = `
    <div class="col-summary-title">Total General</div>
    <div class="col-summary-total">${formatCLP(totalGeneral)}</div>
  `;

  // Column cards
  const colCards = COLUMNS.map(col => {
    const m = COL_SUMMARY_META[col.id];
    const colExp = expenses.filter(e => e.estado === col.id);
    const total  = colExp.reduce((s, e) => s + e.monto, 0);
    const count  = colExp.length;
    return `
      <div class="summary-col-card" data-tab="${col.id}">
        <div class="summary-col-icon" style="background:${m.bg}">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${m.stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${m.icon}</svg>
        </div>
        <div class="summary-col-body">
          <div class="summary-col-title">${m.label}</div>
          <div class="summary-col-meta">${count} ${count === 1 ? 'gasto' : 'gastos'}</div>
        </div>
        <div class="summary-col-total">${formatCLP(total)}</div>
        <div class="summary-col-chevron"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
    `;
  }).join('');

  // Priority bars
  const pri = { vital: 0, gusto: 0, capricho: 0 };
  expenses.forEach(e => { pri[e.prioridad || 'gusto'] += e.monto; });
  const priGrand = pri.vital + pri.gusto + pri.capricho;

  const priCard = priGrand > 0 ? `
    <div class="summary-pri-card">
      <div class="summary-pri-title">Distribución por prioridad</div>
      ${PRI_SUMMARY.map(p => {
        const pct = Math.round(pri[p.key] / priGrand * 100);
        return `
          <div class="summary-pri-row">
            <div class="summary-pri-label">${p.label}</div>
            <div class="summary-pri-track">
              <div class="summary-pri-fill" style="width:${pct}%;background:${p.color}"></div>
            </div>
            <div class="summary-pri-val">${formatCLP(pri[p.key])}</div>
          </div>
        `;
      }).join('')}
    </div>
  ` : '';

  // Budget
  const boardSpent = expenses
    .filter(e => e.estado === 'carrito' || e.estado === 'pagado')
    .reduce((s, e) => s + e.monto, 0);
  const budgetHtml = `
    <div class="summary-budget-card" id="summary-budget-card">
      ${boardBudgetHTML(boardSpent)}
    </div>
  `;

  content.innerHTML = `<div class="summary-view">${budgetHtml}${colCards}${priCard}</div>`;

  content.querySelectorAll('.summary-col-card').forEach(card => {
    card.addEventListener('click', () => {
      activeTab = card.dataset.tab;
      renderActiveTab();
    });
  });

  const budgetCard = document.getElementById('summary-budget-card');
  if (budgetCard) budgetCard.addEventListener('click', openBudgetSheet);
}

function updateTabBar() {
  document.querySelectorAll('.tab-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === activeTab);
  });
}

function renderActiveTab() {
  const content = document.getElementById('tab-content');
  const summary = document.getElementById('col-summary');
  const fab = document.getElementById('fab');

  updateTabBar();

  if (activeTab === 'resumen') {
    renderSummary();
    return;
  }

  fab.style.display = 'flex';
  onbCheckFAB();
  const col = COLUMNS.find(c => c.id === activeTab);
  const colExpenses = expenses.filter(e => e.estado === activeTab);
  const total = colExpenses.reduce((s, e) => s + e.monto, 0);
  const boardSpent = expenses
    .filter(e => e.estado === 'carrito' || e.estado === 'pagado')
    .reduce((s, e) => s + e.monto, 0);

  let totalStyle = '';
  if (activeTab === 'carrito' && budget > 0) {
    const over = boardSpent > budget;
    const pct = over ? 0 : Math.max(((budget - boardSpent) / budget) * 100, 0);
    let c;
    if (over) c = '#de350b';
    else if (pct <= 10) c = '#ff5630';
    else if (pct <= 30) c = '#ff991f';
    else c = '#36b37e';
    totalStyle = `style="color:${c}"`;
  }

  summary.innerHTML = `
    <div class="col-summary-title">${col.title}</div>
    <div class="col-summary-total" ${totalStyle}>${formatCLP(total)}</div>
    <div class="col-budget" id="col-budget">${boardBudgetHTML(boardSpent)}</div>
  `;

  const budgetEl = document.getElementById('col-budget');
  if (budgetEl) budgetEl.addEventListener('click', openBudgetSheet);

  if (colExpenses.length === 0) {
    const icons = {
      por_pagar: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
      carrito:   '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
      pagado:    '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    };
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${icons[activeTab]}</div>
        <div class="empty-state-text">Sin Gastos Aquí</div>
        <div class="empty-state-sub">Toca + para agregar</div>
      </div>
    `;
  } else {
    content.innerHTML = colExpenses.map(cardHTML).join('');
    content.querySelectorAll('.mob-card-edit').forEach(btn => {
      btn.addEventListener('click', () => openEditSheet(btn.dataset.id));
    });
    content.querySelectorAll('.mob-card-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteExpense(btn.dataset.id));
    });
    content.querySelectorAll('.mob-card-move').forEach(btn => {
      btn.addEventListener('click', () => openMoveSheet(btn.dataset.id));
    });
  }
}

function renderBoards() {
  setAvatars(currentUser);
  const list = document.getElementById('boards-list');
  list.innerHTML = boards.map((b, i) => {
    const color = BOARD_COLORS[i % BOARD_COLORS.length];
    const stored = localStorage.getItem('cuentas_' + currentUser + '_' + b.id);
    const count = stored ? JSON.parse(stored).length : 0;
    return `
      <div class="board-item" data-board-id="${b.id}">
        <div class="board-item-stripe" style="background:${color}"></div>
        <div class="board-item-body">
          <div class="board-item-name">${escapeHTML(b.name)}</div>
          <div class="board-item-meta">${count} ${count === 1 ? 'Gasto' : 'Gastos'}</div>
        </div>
        <button class="board-item-delete" data-board-id="${b.id}">✕</button>
        <span class="board-item-arrow">›</span>
      </div>
    `;
  }).join('') + `
    <div style="height:10px"></div>
    <button class="board-new-btn" id="new-board-btn">
      <span>+</span> Nuevo Tablero
    </button>
  `;
  list.querySelectorAll('.board-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.closest('.board-item-delete')) return;
      const b = boards.find(b => b.id === item.dataset.boardId);
      if (b) enterBoard(b);
    });
  });
  list.querySelectorAll('.board-item-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation(); deleteBoardById(btn.dataset.boardId);
    });
  });
  document.getElementById('new-board-btn').addEventListener('click', openBoardSheet);
  onbCheckNewBoard();
}

function renderUserList() {
  const users = getStoredUsers();
  const sec = document.getElementById('users-section');
  const list = document.getElementById('users-list');
  if (!users.length) { sec.style.display = 'none'; return; }
  sec.style.display = '';
  list.innerHTML = users.map(u => `
    <button class="user-item" data-username="${escapeHTML(u)}">
      <div class="user-avatar" style="background:${avatarColor(u)}">${initials(u)}</div>
      <span class="user-name">${escapeHTML(u)}</span>
      <span class="user-item-arrow">›</span>
      <span class="user-delete-btn" data-username="${escapeHTML(u)}">✕</span>
    </button>
  `).join('');
  list.querySelectorAll('.user-item').forEach(btn => {
    btn.addEventListener('click', () => login(btn.dataset.username));
  });
  list.querySelectorAll('.user-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteUser(btn.dataset.username); });
  });
}
