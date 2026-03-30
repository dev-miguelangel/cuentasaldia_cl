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
        <div class="budget-empty-icon">💰</div>
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

  if (activeTab === 'analytics') {
    fab.style.display = 'none';
    const total = expenses.reduce((s, e) => s + e.monto, 0);
    summary.innerHTML = `
      <div class="col-summary-title">Total General</div>
      <div class="col-summary-total">${formatCLP(total)}</div>
    `;
    content.innerHTML = analyticsHTML();
    requestAnimationFrame(() => { drawColumnCharts(); drawChartColumnas(); });
    return;
  }

  fab.style.display = 'flex';
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
    const icons = { por_pagar: '📋', carrito: '🛒', pagado: '✅' };
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
  document.getElementById('boards-user-badge').textContent = currentUser;
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
