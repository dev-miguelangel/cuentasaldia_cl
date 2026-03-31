// ===== DESKTOP RENDER =====

function cardHTML(expense) {
  const pri = expense.prioridad || 'gusto';
  return `
    <div class="card" draggable="true" data-id="${expense.id}">
      <div class="card-header">
        <div class="card-title">${escapeHTML(expense.titulo)}</div>
        <div class="card-actions">
          <button class="card-edit" data-id="${expense.id}" title="Editar">✎</button>
          <button class="card-delete" data-id="${expense.id}" title="Eliminar">✕</button>
        </div>
      </div>
      <div class="card-footer">
        <span class="priority-badge ${pri}">${PRIORITY_LABELS[pri]}</span>
        <span class="card-amount">${formatCLP(expense.monto)}</span>
      </div>
    </div>
  `;
}

function boardBudgetHTML(spent) {
  if (!budget) {
    return `
      <div class="budget-empty" id="budget-edit-btn">
        <div class="budget-empty-icon">💰</div>
        <div class="budget-empty-text">
          <div class="budget-empty-title">Definir Presupuesto Del Tablero</div>
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
    <div class="budget-bar-wrap" id="budget-edit-btn">
      <div class="budget-bar-label-row">
        <span class="budget-bar-label-left">Presupuesto Total</span>
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

function renderBoardBudget() {
  const spent = expenses
    .filter(e => e.estado === 'carrito' || e.estado === 'pagado')
    .reduce((s, e) => s + e.monto, 0);
  document.getElementById('board-budget-row').innerHTML = boardBudgetHTML(spent);
}

function renderBoard() {
  const container = document.getElementById('columns-container');
  container.innerHTML = '';

  COLUMNS.forEach(col => {
    const colExpenses = expenses.filter(e => e.estado === col.id);
    const total = colExpenses.reduce((sum, e) => sum + e.monto, 0);

    const colEl = document.createElement('div');
    colEl.className = 'column';
    colEl.dataset.colId = col.id;

    const emptyHint = colExpenses.length === 0
      ? '<div class="empty-hint">Arrastra Gastos Aquí</div>'
      : '';

    let totalStyle = '';
    if (col.id === 'carrito' && budget > 0) {
      const boardSpent = expenses
        .filter(e => e.estado === 'carrito' || e.estado === 'pagado')
        .reduce((s, e) => s + e.monto, 0);
      const over = boardSpent > budget;
      const pct = over ? 0 : Math.max(((budget - boardSpent) / budget) * 100, 0);
      let c;
      if (over) c = '#de350b';
      else if (pct <= 10) c = '#ff5630';
      else if (pct <= 30) c = '#ff991f';
      else c = '#36b37e';
      totalStyle = `style="color:${c}"`;
    }

    colEl.innerHTML = `
      <div class="column-header">
        <div class="column-title-row">
          <div class="column-title">${col.title}</div>
        </div>
        <div class="column-total" ${totalStyle}>${formatCLP(total)}</div>
      </div>
      <div class="cards-list" data-col-id="${col.id}">
        ${colExpenses.map(cardHTML).join('')}
        ${emptyHint}
      </div>
      <button class="add-card-btn" data-col-id="${col.id}">
        <span style="font-size:18px;line-height:1">+</span> Agregar Gasto
      </button>
    `;

    container.appendChild(colEl);
  });

  renderBoardBudget();
  attachEvents();
}

// ===== RESUMEN PC (tablet) =====
var COL_SUMMARY_META_PC = {
  por_pagar: { label: 'Por Pagar', bg: '#fff0e6', stroke: '#ff8b00' },
  carrito:   { label: 'Carrito',   bg: '#e6f4ff', stroke: '#0079bf' },
  pagado:    { label: 'Pagado',    bg: '#e6fff5', stroke: '#36b37e' },
};

function renderSummaryPC() {
  var container = document.getElementById('summary-tab-content');
  if (!container) return;

  var total = expenses.reduce(function(s, e) { return s + e.monto; }, 0);
  var spent = expenses.filter(function(e) { return e.estado === 'carrito' || e.estado === 'pagado'; })
    .reduce(function(s, e) { return s + e.monto; }, 0);

  var colCards = Object.entries(COL_SUMMARY_META_PC).map(function(entry) {
    var id = entry[0], meta = entry[1];
    var colExp = expenses.filter(function(e) { return e.estado === id; });
    var colTotal = colExp.reduce(function(s, e) { return s + e.monto; }, 0);
    var count = colExp.length;
    return '<div class="sum-pc-col-card" style="border-left:4px solid ' + meta.stroke + ';background:' + meta.bg + '">' +
      '<div class="sum-pc-col-name" style="color:' + meta.stroke + '">' + meta.label + '</div>' +
      '<div class="sum-pc-col-total">' + formatCLP(colTotal) + '</div>' +
      '<div class="sum-pc-col-count">' + count + ' gasto' + (count !== 1 ? 's' : '') + '</div>' +
      '</div>';
  }).join('');

  var priRows = [
    { key: 'vital',    label: 'Vital',    color: '#de350b' },
    { key: 'gusto',    label: 'Gusto',    color: '#0079bf' },
    { key: 'capricho', label: 'Capricho', color: '#6554c0' },
  ].map(function(p) {
    var pTotal = expenses.filter(function(e) { return (e.prioridad || 'gusto') === p.key; })
      .reduce(function(s, e) { return s + e.monto; }, 0);
    var pct = total > 0 ? Math.round(pTotal / total * 100) : 0;
    return '<div class="sum-pc-pri-row">' +
      '<div class="sum-pc-pri-dot" style="background:' + p.color + '"></div>' +
      '<div class="sum-pc-pri-label">' + p.label + '</div>' +
      '<div class="sum-pc-pri-track"><div class="sum-pc-pri-fill" style="width:' + pct + '%;background:' + p.color + '"></div></div>' +
      '<div class="sum-pc-pri-val">' + pct + '%</div>' +
      '</div>';
  }).join('');

  container.innerHTML =
    '<div class="sum-pc-wrap">' +
      '<div class="sum-pc-card">' +
        '<div class="sum-pc-card-title">Columnas</div>' +
        '<div class="sum-pc-cols">' + colCards + '</div>' +
      '</div>' +
      '<div class="sum-pc-card">' +
        '<div class="sum-pc-card-title">Distribución Por Prioridad</div>' +
        priRows +
      '</div>' +
      '<div class="sum-pc-card sum-pc-budget-wrap">' + boardBudgetHTML(spent) + '</div>' +
    '</div>';

  var budgetBtn = container.querySelector('#budget-edit-btn');
  if (budgetBtn) budgetBtn.addEventListener('click', openBudgetModal);
}

function renderBoards() {
  const grid = document.getElementById('boards-grid');
  grid.innerHTML = boards.map((b, i) => {
    const color = BOARD_COLORS[i % BOARD_COLORS.length];
    const stored = localStorage.getItem('cuentas_' + currentUser + '_' + b.id);
    const expArr = stored ? JSON.parse(stored) : [];
    const count = expArr.length;
    const budgetVal = parseInt(localStorage.getItem('presupuesto_' + currentUser + '_' + b.id) || '0', 10);
    const spent = expArr
      .filter(e => e.estado === 'carrito' || e.estado === 'pagado')
      .reduce((s, e) => s + e.monto, 0);
    const usedPct = budgetVal > 0 ? Math.min(Math.round(spent / budgetVal * 100), 100) : 0;
    const over = budgetVal > 0 && spent > budgetVal;
    const barColor = over ? '#ff5630' : (usedPct >= 70 ? '#ff991f' : 'rgba(255,255,255,0.85)');
    const coverBudget = budgetVal > 0 ? `
      <div class="board-cover-budget">
        <div class="board-cover-pct">${usedPct}% utilizado</div>
        <div class="board-cover-bar-track">
          <div class="board-cover-bar-fill" style="width:${usedPct}%;background:${barColor}"></div>
        </div>
      </div>` : '';
    return `
      <div class="board-card" data-board-id="${b.id}">
        <div class="board-card-cover" style="background:${color}">${coverBudget}</div>
        <div class="board-card-body">
          <div class="board-card-name">${escapeHTML(b.name)}</div>
          <div class="board-card-meta">${count} ${count === 1 ? 'Gasto' : 'Gastos'}</div>
        </div>
        <button class="board-card-delete" data-board-id="${b.id}" title="Eliminar Tablero">✕</button>
      </div>
    `;
  }).join('') + `
    <div class="board-card board-card-new" id="new-board-card">
      <div class="board-card-new-icon">+</div>
      <div class="board-card-new-label">Nuevo Tablero</div>
    </div>
  `;

  grid.querySelectorAll('.board-card:not(.board-card-new)').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.board-card-delete')) return;
      const b = boards.find(b => b.id === card.dataset.boardId);
      if (b) enterBoard(b);
    });
  });

  grid.querySelectorAll('.board-card-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteBoardById(btn.dataset.boardId);
    });
  });

  document.getElementById('new-board-card').addEventListener('click', openBoardNameModal);
}

function renderUserList() {
  const users = getStoredUsers();
  const section = document.getElementById('users-section');
  const list = document.getElementById('users-list');

  if (users.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  list.innerHTML = users.map(u => `
    <button class="user-item" data-username="${escapeHTML(u)}">
      <div class="user-avatar" style="background:${avatarColor(u)}">${initials(u)}</div>
      <span class="user-name">${escapeHTML(u)}</span>
      <span class="user-item-arrow">›</span>
      <span class="user-delete-btn" data-username="${escapeHTML(u)}" title="Eliminar Usuario">✕</span>
    </button>
  `).join('');

  list.querySelectorAll('.user-item').forEach(btn => {
    btn.addEventListener('click', () => login(btn.dataset.username));
  });

  list.querySelectorAll('.user-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteUser(btn.dataset.username);
    });
  });
}
