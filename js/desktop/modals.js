// ===== DESKTOP MODALS =====

// ===== BUDGET MODAL =====
function openBudgetModal() {
  const spent = expenses
    .filter(e => e.estado === 'carrito' || e.estado === 'pagado')
    .reduce((s, e) => s + e.monto, 0);
  const removeBtn = document.getElementById('budget-remove-btn');
  const ctx = document.getElementById('budget-modal-context');

  if (budget > 0) {
    ctx.textContent = `Gastado ${formatCLP(spent)} de ${formatCLP(budget)} (carrito + pagado).`;
    removeBtn.style.display = '';
  } else {
    ctx.textContent = '¿Cuánto dinero tienes disponible para gastar en este tablero?';
    removeBtn.style.display = 'none';
  }

  document.getElementById('budget-input').value = budget > 0 ? budget : '';
  document.getElementById('budget-input').classList.remove('error');
  document.getElementById('budget-modal-overlay').classList.add('active');
  document.getElementById('budget-input').focus();
}

function closeBudgetModal() {
  document.getElementById('budget-modal-overlay').classList.remove('active');
}

document.getElementById('budget-save-btn').addEventListener('click', () => {
  const val = parseInt(document.getElementById('budget-input').value, 10);
  if (isNaN(val) || val < 1) {
    document.getElementById('budget-input').classList.add('error');
    document.getElementById('budget-input').focus();
    return;
  }
  budget = val;
  saveBudget();
  closeBudgetModal();
  renderBoard();
});

document.getElementById('budget-remove-btn').addEventListener('click', () => {
  budget = 0;
  saveBudget();
  closeBudgetModal();
  renderBoard();
});

document.getElementById('budget-cancel-btn').addEventListener('click', closeBudgetModal);

document.getElementById('budget-modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('budget-modal-overlay')) closeBudgetModal();
});

document.getElementById('budget-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('budget-save-btn').click();
});

// ===== PRIORITY SELECTOR =====
document.getElementById('priority-selector').addEventListener('click', e => {
  const btn = e.target.closest('.priority-opt');
  if (!btn) return;
  document.querySelectorAll('.priority-opt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
});

function selectedPriority() {
  const active = document.querySelector('.priority-opt.active');
  return active ? active.dataset.priority : 'gusto';
}

// ===== ADD/EDIT MODAL =====
function openModal(colId) {
  editingId = null;
  addingToColumn = colId;
  document.getElementById('modal-title').textContent = 'Agregar Gasto';
  document.getElementById('modal-add-btn').textContent = 'Agregar';
  document.getElementById('modal-titulo').value = '';
  document.getElementById('modal-monto').value = '';
  document.getElementById('modal-titulo').classList.remove('error');
  document.getElementById('modal-monto').classList.remove('error');
  document.querySelectorAll('.priority-opt').forEach(b => b.classList.remove('active'));
  document.querySelector('.priority-opt[data-priority="gusto"]').classList.add('active');
  populateCategorySelect();
  document.getElementById('modal-categoria').value = '';
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('modal-titulo').focus();
}

function openEditModal(id) {
  const exp = expenses.find(e => e.id === id);
  if (!exp) return;
  editingId = id;
  addingToColumn = null;
  document.getElementById('modal-title').textContent = 'Editar Gasto';
  document.getElementById('modal-add-btn').textContent = 'Guardar';
  document.getElementById('modal-titulo').value = exp.titulo;
  document.getElementById('modal-monto').value = exp.monto;
  document.getElementById('modal-titulo').classList.remove('error');
  document.getElementById('modal-monto').classList.remove('error');
  document.querySelectorAll('.priority-opt').forEach(b => b.classList.remove('active'));
  document.querySelector(`.priority-opt[data-priority="${exp.prioridad || 'gusto'}"]`).classList.add('active');
  populateCategorySelect();
  document.getElementById('modal-categoria').value = exp.categoriaId || '';
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('modal-titulo').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  addingToColumn = null;
  editingId = null;
}

document.getElementById('modal-add-btn').addEventListener('click', () => {
  const tituloInput = document.getElementById('modal-titulo');
  const montoInput = document.getElementById('modal-monto');
  const titulo = tituloInput.value.trim();
  const monto = parseInt(montoInput.value, 10);

  let valid = true;

  if (!titulo) {
    tituloInput.classList.add('error');
    tituloInput.focus();
    valid = false;
  } else {
    tituloInput.classList.remove('error');
  }

  if (isNaN(monto) || monto < 0 || montoInput.value === '') {
    montoInput.classList.add('error');
    if (valid) montoInput.focus();
    valid = false;
  } else {
    montoInput.classList.remove('error');
  }

  if (!valid) return;

  const categoriaId = document.getElementById('modal-categoria').value || null;

  if (editingId) {
    const exp = expenses.find(e => e.id === editingId);
    if (exp) {
      exp.titulo = titulo;
      exp.monto = monto;
      exp.prioridad = selectedPriority();
      exp.categoriaId = categoriaId;
    }
    saveExpenses();
    renderBoard();
    closeModal();
  } else {
    addExpense(titulo, monto, addingToColumn, selectedPriority(), categoriaId);
    // reset form and stay open for next expense
    tituloInput.value = '';
    montoInput.value = '';
    document.querySelectorAll('.priority-opt').forEach(b => b.classList.remove('active'));
    document.querySelector('.priority-opt[data-priority="gusto"]').classList.add('active');
    document.getElementById('modal-categoria').value = '';
    tituloInput.focus();
  }
});

document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

document.getElementById('modal-titulo').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('modal-monto').focus();
});

document.getElementById('modal-monto').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('modal-add-btn').click();
});

// ===== BOARD NAME MODAL =====
function openBoardNameModal() {
  document.getElementById('board-name-input').value = '';

  // Build importable expenses list from existing boards
  importableBoardExpenses = [];
  boards.forEach(b => {
    const stored = localStorage.getItem('cuentas_' + currentUser + '_' + b.id);
    const exps = stored ? JSON.parse(stored) : [];
    if (exps.length) importableBoardExpenses.push({ board: b, expenses: exps });
  });

  const importSection = document.getElementById('import-section');
  if (importableBoardExpenses.length) {
    importSection.style.display = '';
    importSection.innerHTML = `
      <div class="import-section">
        <span class="import-section-label">Importar Gastos (Opcional)</span>
        ${importableBoardExpenses.map(({ board, expenses }, bi) => `
          <div class="import-board-group">
            <div class="import-board-name">${escapeHTML(board.name)}</div>
            <div class="import-expense-list">
              ${expenses.map((e, ei) => `
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
      </div>
    `;
    importSection.querySelectorAll('.import-expense-item').forEach(item => {
      item.addEventListener('change', () => {
        item.classList.toggle('selected', item.querySelector('input').checked);
      });
    });
  } else {
    importSection.style.display = 'none';
    importSection.innerHTML = '';
  }

  document.getElementById('board-name-modal-overlay').classList.add('active');
  document.getElementById('board-name-input').focus();
}

function closeBoardNameModal() {
  document.getElementById('board-name-modal-overlay').classList.remove('active');
}

document.getElementById('board-name-save-btn').addEventListener('click', () => {
  const name = document.getElementById('board-name-input').value.trim();
  if (!name) { document.getElementById('board-name-input').focus(); return; }

  const board = { id: 'b' + Date.now(), name };
  boards.push(board);
  saveBoards();

  // Clone selected expenses into new board as por_pagar
  const checked = document.querySelectorAll('.import-expense-check:checked');
  if (checked.length) {
    const cloned = Array.from(checked).map((cb, i) => {
      const src = importableBoardExpenses[+cb.dataset.bi].expenses[+cb.dataset.ei];
      return {
        id: 'c' + Date.now() + i,
        titulo: src.titulo,
        monto: src.monto,
        prioridad: src.prioridad || 'gusto',
        estado: 'por_pagar',
      };
    });
    localStorage.setItem('cuentas_' + currentUser + '_' + board.id, JSON.stringify(cloned));
  }

  closeBoardNameModal();
  renderBoards();
});

document.getElementById('board-name-cancel-btn').addEventListener('click', closeBoardNameModal);

document.getElementById('board-name-modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('board-name-modal-overlay')) closeBoardNameModal();
});

document.getElementById('board-name-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('board-name-save-btn').click();
});

// ===== SHARE MODAL =====
var _shareURLPC = '';

function openShareModal() {
  if (!currentBoard) return;
  const data = exportBoardData();
  const code = encodeBoard(data);
  if (!code) return;

  document.getElementById('share-code-text-pc').value = code;
  _shareURLPC = window.location.origin + window.location.pathname + '#share=' + code;
  document.getElementById('share-url-display-pc').textContent = _shareURLPC;

  const qrContainer = document.getElementById('share-qr-box-pc');
  qrContainer.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    try {
      new QRCode(qrContainer, {
        text: _shareURLPC,
        width: 160, height: 160,
        colorDark: '#172b4d', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
      });
    } catch (e) {
      qrContainer.innerHTML = '<p style="color:#5e6c84;font-size:12px;text-align:center;padding:16px">URL demasiado larga.<br>Usa pestaña Código.</p>';
    }
  } else {
    qrContainer.innerHTML = '<p style="color:#5e6c84;font-size:12px;text-align:center;padding:16px">QR no disponible sin conexión.</p>';
  }

  showShareTabPC('qr');
  document.getElementById('share-modal-overlay').classList.add('active');
}

function closeShareModal() {
  document.getElementById('share-modal-overlay').classList.remove('active');
}

function showShareTabPC(tab) {
  document.querySelectorAll('.share-tab-btn-pc').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('share-tab-qr-pc').style.display = tab === 'qr' ? '' : 'none';
  document.getElementById('share-tab-code-pc').style.display = tab === 'code' ? '' : 'none';
}

document.getElementById('share-modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) closeShareModal();
});

// ===== IMPORT MODAL =====
function openImportModal() {
  document.getElementById('import-code-text-pc').value = '';
  document.getElementById('pc-import-status').textContent = '';
  document.getElementById('import-modal-overlay').classList.add('active');
  setTimeout(() => document.getElementById('import-code-text-pc').focus(), 100);
}

function closeImportModal() {
  document.getElementById('import-modal-overlay').classList.remove('active');
}

function doImportPC() {
  const code = document.getElementById('import-code-text-pc').value.trim();
  const status = document.getElementById('pc-import-status');
  if (!code) { status.style.color = '#de350b'; status.textContent = 'Pega un código válido.'; return; }
  const data = decodeBoard(code);
  if (!data || !data.v || !data.name) {
    status.style.color = '#de350b'; status.textContent = 'Código inválido o corrupto.'; return;
  }
  const importedName = importBoardFromData(data);
  if (!importedName) { status.style.color = '#de350b'; status.textContent = 'Error al importar.'; return; }
  closeImportModal();
  loadBoards();
  renderBoards();
  alert('Tablero "' + importedName + '" importado correctamente.');
}

document.getElementById('import-modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) closeImportModal();
});

// ===== FEEDBACK MODAL =====
var _fbScores = { utilidad: 0, usabilidad: 0, funcionalidades: 0 };

function fbRate(cat, val) {
  _fbScores[cat] = _fbScores[cat] === val ? 0 : val;
  document.querySelectorAll('#fb-' + cat + ' .fb-star').forEach(function (s, i) {
    s.classList.toggle('active', i < _fbScores[cat]);
  });
}

function openFeedbackModal() {
  document.getElementById('feedback-modal-overlay').classList.add('active');
}

function closeFeedbackModal() {
  document.getElementById('feedback-modal-overlay').classList.remove('active');
}

document.getElementById('feedback-modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) closeFeedbackModal();
});

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
    version: 'Escritorio'
  }).then(function () {
    btn.textContent = '¡Enviado! ✓';
    status.style.color = '#36b37e';
    status.textContent = 'Gracias por tu feedback.';
    setTimeout(function () {
      closeFeedbackModal();
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

function copyToClipboardPC(text, btn, successLabel) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = successLabel || '✓ Copiado';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  }).catch(() => { });
}
