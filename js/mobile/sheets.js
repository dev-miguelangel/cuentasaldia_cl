// ===== MOBILE SHEETS =====

function openSheet(id) { document.getElementById(id).classList.add('active'); }
function closeSheet(id) { document.getElementById(id).classList.remove('active'); }

document.querySelectorAll('.sheet-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); });
});

// ===== ADD / EDIT SHEET =====
function openAddSheet(colId) {
  editingId = null;
  addingToColumn = colId;
  document.querySelector('#add-sheet-overlay .sheet-title').textContent = 'Agregar Gasto';
  document.getElementById('add-btn').textContent = 'Agregar';
  document.getElementById('add-titulo').value = '';
  document.getElementById('add-monto').value = '';
  document.getElementById('add-titulo').classList.remove('error');
  document.getElementById('add-monto').classList.remove('error');
  document.querySelectorAll('.priority-opt').forEach(b => b.classList.remove('active'));
  document.querySelector('.priority-opt[data-priority="gusto"]').classList.add('active');
  openSheet('add-sheet-overlay');
  setTimeout(() => document.getElementById('add-titulo').focus(), 350);
}

function openEditSheet(id) {
  const exp = expenses.find(e => e.id === id);
  if (!exp) return;
  editingId = id;
  addingToColumn = null;
  document.querySelector('#add-sheet-overlay .sheet-title').textContent = 'Editar Gasto';
  document.getElementById('add-btn').textContent = 'Guardar';
  document.getElementById('add-titulo').value = exp.titulo;
  document.getElementById('add-monto').value = exp.monto;
  document.getElementById('add-titulo').classList.remove('error');
  document.getElementById('add-monto').classList.remove('error');
  document.querySelectorAll('.priority-opt').forEach(b => b.classList.remove('active'));
  document.querySelector(`.priority-opt[data-priority="${exp.prioridad || 'gusto'}"]`).classList.add('active');
  openSheet('add-sheet-overlay');
  setTimeout(() => document.getElementById('add-titulo').focus(), 350);
}

function closeAddSheet() { closeSheet('add-sheet-overlay'); editingId = null; }

document.getElementById('add-sheet-close').addEventListener('click', closeAddSheet);
document.getElementById('add-close-btn').addEventListener('click', closeAddSheet);

document.getElementById('add-btn').addEventListener('click', () => {
  const tit = document.getElementById('add-titulo');
  const mon = document.getElementById('add-monto');
  const titulo = tit.value.trim();
  const monto = parseInt(mon.value, 10);
  let valid = true;
  if (!titulo) { tit.classList.add('error'); tit.focus(); valid = false; }
  else tit.classList.remove('error');
  if (isNaN(monto) || monto < 0 || mon.value === '') {
    mon.classList.add('error'); if (valid) mon.focus(); valid = false;
  } else mon.classList.remove('error');
  if (!valid) return;
  if (editingId) {
    const exp = expenses.find(e => e.id === editingId);
    if (exp) {
      exp.titulo = titulo;
      exp.monto = monto;
      exp.prioridad = selectedPriority();
    }
    saveExpenses();
    renderActiveTab();
    closeAddSheet();
  } else {
    addExpense(titulo, monto, addingToColumn, selectedPriority());
    tit.value = ''; mon.value = '';
    document.querySelectorAll('.priority-opt').forEach(b => b.classList.remove('active'));
    document.querySelector('.priority-opt[data-priority="gusto"]').classList.add('active');
    tit.focus();
  }
});

document.getElementById('priority-selector').addEventListener('click', e => {
  const btn = e.target.closest('.priority-opt');
  if (!btn) return;
  document.querySelectorAll('.priority-opt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
});

function selectedPriority() {
  const a = document.querySelector('.priority-opt.active');
  return a ? a.dataset.priority : 'gusto';
}

// ===== BUDGET SHEET =====
function openBudgetSheet() {
  const spent = expenses
    .filter(e => e.estado === 'carrito' || e.estado === 'pagado')
    .reduce((s, e) => s + e.monto, 0);
  const ctx2 = document.getElementById('budget-sheet-context');
  const removeBtn = document.getElementById('budget-remove-btn');
  if (budget > 0) {
    ctx2.textContent = `Gastado ${formatCLP(spent)} de ${formatCLP(budget)} (carrito + pagado).`;
    removeBtn.style.display = '';
  } else {
    ctx2.textContent = '¿Cuánto dinero tienes disponible para gastar en este tablero?';
    removeBtn.style.display = 'none';
  }
  document.getElementById('budget-input').value = budget > 0 ? budget : '';
  document.getElementById('budget-input').classList.remove('error');
  openSheet('budget-sheet-overlay');
  setTimeout(() => document.getElementById('budget-input').focus(), 350);
}

function closeBudgetSheet() { closeSheet('budget-sheet-overlay'); }

document.getElementById('budget-sheet-close').addEventListener('click', closeBudgetSheet);
document.getElementById('budget-cancel-btn').addEventListener('click', closeBudgetSheet);
document.getElementById('budget-save-btn').addEventListener('click', () => {
  const val = parseInt(document.getElementById('budget-input').value, 10);
  if (isNaN(val) || val < 1) {
    document.getElementById('budget-input').classList.add('error');
    document.getElementById('budget-input').focus(); return;
  }
  budget = val; saveBudget(); closeBudgetSheet(); renderActiveTab();
});
document.getElementById('budget-remove-btn').addEventListener('click', () => {
  budget = 0; saveBudget(); closeBudgetSheet(); renderActiveTab();
});
document.getElementById('budget-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('budget-save-btn').click();
});

// ===== MOVE SHEET =====
function openMoveSheet(expenseId) {
  movingExpenseId = expenseId;
  const exp = expenses.find(e => e.id === expenseId);
  if (!exp) return;
  const body = document.getElementById('move-sheet-body');
  body.innerHTML = `
    <div class="move-info">
      <strong style="color:#172b4d">${escapeHTML(exp.titulo)}</strong><br>${formatCLP(exp.monto)}
    </div>
    ${COLUMNS.map(col => `
      <button class="move-col-btn ${col.id === exp.estado ? 'current' : ''}" data-target="${col.id}">
        <div class="move-col-dot" style="background:${COL_COLORS[col.id]}"></div>
        ${col.title}
        ${col.id === exp.estado ? '<span class="move-col-current-tag">Actual</span>' : ''}
      </button>
    `).join('')}
    <button class="sbtn sbtn-secondary" id="move-cancel-btn">Cancelar</button>
  `;
  body.querySelectorAll('.move-col-btn:not(.current)').forEach(btn => {
    btn.addEventListener('click', () => {
      moveExpense(movingExpenseId, btn.dataset.target);
      closeMoveSheet();
    });
  });
  body.querySelector('#move-cancel-btn').addEventListener('click', closeMoveSheet);
  openSheet('move-sheet-overlay');
}

function closeMoveSheet() { closeSheet('move-sheet-overlay'); movingExpenseId = null; }

document.getElementById('move-sheet-close').addEventListener('click', closeMoveSheet);

// ===== BOARD SHEET =====
function openBoardSheet() {
  document.getElementById('board-name-input').value = '';
  document.getElementById('board-name-input').classList.remove('error');
  importableBoardExpenses = [];
  boards.forEach(b => {
    const stored = localStorage.getItem('cuentas_' + currentUser + '_' + b.id);
    const exps = stored ? JSON.parse(stored) : [];
    if (exps.length) importableBoardExpenses.push({ board: b, expenses: exps });
  });
  const sec = document.getElementById('import-section');
  if (importableBoardExpenses.length) {
    sec.innerHTML = `
      <div class="import-divider"></div>
      <span class="import-section-label">Importar Gastos (Opcional)</span>
      ${importableBoardExpenses.map(({ board, expenses: exps }, bi) => `
        <div class="import-board-group">
          <div class="import-board-name">${escapeHTML(board.name)}</div>
          <div class="import-expense-list">
            ${exps.map((e, ei) => `
              <label class="import-expense-item">
                <input type="checkbox" class="import-expense-check" data-bi="${bi}" data-ei="${ei}" />
                <span class="import-expense-name">${escapeHTML(e.titulo)}</span>
                <span class="priority-badge ${e.prioridad || 'gusto'}">${PRIORITY_LABELS[e.prioridad || 'gusto']}</span>
                <span class="import-expense-amount">${formatCLP(e.monto)}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('')}
      <div style="height:8px"></div>
    `;
    sec.querySelectorAll('.import-expense-item').forEach(item => {
      item.addEventListener('change', () => {
        item.classList.toggle('selected', item.querySelector('input').checked);
      });
    });
  } else {
    sec.innerHTML = '';
  }
  openSheet('board-sheet-overlay');
  setTimeout(() => document.getElementById('board-name-input').focus(), 350);
}

function closeBoardSheet() { closeSheet('board-sheet-overlay'); }

document.getElementById('board-sheet-close').addEventListener('click', closeBoardSheet);
document.getElementById('board-cancel-btn').addEventListener('click', closeBoardSheet);
document.getElementById('board-save-btn').addEventListener('click', () => {
  const input = document.getElementById('board-name-input');
  const name = input.value.trim();
  if (!name) { input.classList.add('error'); input.focus(); return; }
  const board = { id: 'b' + Date.now(), name };
  boards.push(board); saveBoards();
  const checked = document.querySelectorAll('.import-expense-check:checked');
  if (checked.length) {
    const cloned = Array.from(checked).map((cb, i) => {
      const src = importableBoardExpenses[+cb.dataset.bi].expenses[+cb.dataset.ei];
      return {
        id: 'c' + Date.now() + i, titulo: src.titulo, monto: src.monto,
        prioridad: src.prioridad || 'gusto', estado: 'por_pagar'
      };
    });
    localStorage.setItem('cuentas_' + currentUser + '_' + board.id, JSON.stringify(cloned));
  }
  closeBoardSheet(); renderBoards();
});
document.getElementById('board-name-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('board-save-btn').click();
});

// ===== SHARE SHEET =====
var _shareURL = '';

function openShareSheet() {
  if (!currentBoard) return;
  const data = exportBoardData();
  const code = encodeBoard(data);
  if (!code) return;

  document.getElementById('share-code-text').value = code;
  _shareURL = window.location.origin + window.location.pathname + '#share=' + code;
  document.getElementById('share-url-display').textContent = _shareURL;

  const qrContainer = document.getElementById('share-qr-box');
  qrContainer.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    try {
      new QRCode(qrContainer, {
        text: _shareURL,
        width: 180, height: 180,
        colorDark: '#172b4d', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
      });
    } catch (e) {
      qrContainer.innerHTML = '<p style="color:#5e6c84;font-size:13px;text-align:center;padding:20px">URL demasiado larga para QR.<br>Usa la pestaña Código.</p>';
    }
  } else {
    qrContainer.innerHTML = '<p style="color:#5e6c84;font-size:13px;text-align:center;padding:20px">QR no disponible sin conexión.<br>Usa la pestaña Código.</p>';
  }

  showShareTab('qr');
  openSheet('share-sheet-overlay');
}

function showShareTab(tab) {
  document.querySelectorAll('.share-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('share-tab-qr').style.display = tab === 'qr' ? '' : 'none';
  document.getElementById('share-tab-code').style.display = tab === 'code' ? '' : 'none';
}

// ===== IMPORT SHEET =====
function openImportSheet() {
  document.getElementById('import-code-text').value = '';
  document.getElementById('import-status').textContent = '';
  openSheet('import-sheet-overlay');
  setTimeout(() => document.getElementById('import-code-text').focus(), 350);
}

function doImport() {
  const code = document.getElementById('import-code-text').value.trim();
  const status = document.getElementById('import-status');
  if (!code) {
    status.style.color = '#de350b'; status.textContent = 'Pega un código válido.'; return;
  }
  const data = decodeBoard(code);
  if (!data || !data.v || !data.name) {
    status.style.color = '#de350b'; status.textContent = 'Código inválido o corrupto.'; return;
  }
  const importedName = importBoardFromData(data);
  if (!importedName) {
    status.style.color = '#de350b'; status.textContent = 'Error al importar.'; return;
  }
  closeSheet('import-sheet-overlay');
  loadBoards();
  renderBoards();
  alert('Tablero "' + importedName + '" importado correctamente.');
}

function copyToClipboard(text, btn, successLabel) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = successLabel || '✓ Copiado';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  }).catch(() => {
    // Fallback: select text in share-code-text
    const ta = document.getElementById('share-code-text') || document.getElementById('import-code-text');
    if (ta) { ta.select(); document.execCommand('copy'); }
  });
}

// ===== FEEDBACK SHEET =====
var _fbScores = { utilidad: 0, usabilidad: 0, funcionalidades: 0 };

function fbRate(cat, val) {
  _fbScores[cat] = _fbScores[cat] === val ? 0 : val;
  document.querySelectorAll('#fb-' + cat + ' .fb-star').forEach(function (s, i) {
    s.classList.toggle('active', i < _fbScores[cat]);
  });
}

function openFeedbackSheet() { openSheet('feedback-sheet-overlay'); }
function closeFeedbackSheet() { closeSheet('feedback-sheet-overlay'); }

function submitFeedback() {
  var btn = document.getElementById('fb-send-btn');
  var status = document.getElementById('fb-status');
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  status.textContent = '';
  emailjs.send('service_wr18xhk', 'template_rxr4zig', {
    to_email: 'dev.miguelangel.jaimen@gmail.com',
    utilidad: _fbScores.utilidad + '/5',
    usabilidad: _fbScores.usabilidad + '/5',
    funcionalidades: _fbScores.funcionalidades + '/5',
    mensaje: document.getElementById('fb-mensaje').value.trim(),
    version: 'Celular'
  }).then(function () {
    btn.textContent = '¡Enviado! ✓';
    status.style.color = '#36b37e';
    status.textContent = 'Gracias por tu feedback.';
    setTimeout(function () {
      closeFeedbackSheet();
      btn.disabled = false;
      btn.textContent = 'Enviar';
      status.textContent = '';
      _fbScores = { utilidad: 0, usabilidad: 0, funcionalidades: 0 };
      ['utilidad', 'usabilidad', 'funcionalidades'].forEach(function (c) {
        document.querySelectorAll('#fb-' + c + ' .fb-star').forEach(function (s) { s.classList.remove('active'); });
      });
      document.getElementById('fb-mensaje').value = '';
      document.getElementById('fb-char-num').textContent = '0';
    }, 1800);
  }, function () {
    btn.disabled = false;
    btn.textContent = 'Enviar';
    status.style.color = '#de350b';
    status.textContent = 'Error al enviar. Intenta de nuevo.';
  });
}
