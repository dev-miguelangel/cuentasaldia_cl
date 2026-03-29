// ===== SHARED STORAGE =====
// These functions reference currentUser and currentBoard as globals.

function loadBoards() {
  const raw = localStorage.getItem('tableros_' + currentUser);
  if (raw) { boards = JSON.parse(raw); return; }
  // Migration from old single-board format
  const oldExp = localStorage.getItem('cuentas_' + currentUser);
  if (oldExp) {
    const bid = 'b' + Date.now();
    boards = [{ id: bid, name: 'Mi Tablero' }];
    localStorage.setItem('cuentas_' + currentUser + '_' + bid, oldExp);
    localStorage.removeItem('cuentas_' + currentUser);
    const oldBudget = localStorage.getItem('presupuesto_' + currentUser);
    if (oldBudget) {
      localStorage.setItem('presupuesto_' + currentUser + '_' + bid, oldBudget);
      localStorage.removeItem('presupuesto_' + currentUser);
    }
  } else {
    boards = [];
  }
  saveBoards();
}

function saveBoards() {
  localStorage.setItem('tableros_' + currentUser, JSON.stringify(boards));
}

function loadExpenses() {
  const raw = localStorage.getItem('cuentas_' + currentUser + '_' + currentBoard.id);
  expenses = raw ? JSON.parse(raw) : [];
}

function saveExpenses() {
  localStorage.setItem('cuentas_' + currentUser + '_' + currentBoard.id, JSON.stringify(expenses));
}

function loadBudget() {
  budget = parseInt(localStorage.getItem('presupuesto_' + currentUser + '_' + currentBoard.id) || '0', 10);
}

function saveBudget() {
  localStorage.setItem('presupuesto_' + currentUser + '_' + currentBoard.id, String(budget));
}
