// ===== DESKTOP MAIN =====

// ===== STATE =====
var currentUser = null;
var currentBoard = null;
var boards = [];
var expenses = [];
var budget = 0;
var addingToColumn = null;
var editingId = null;
var importableBoardExpenses = [];

// ===== CRUD =====
function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveExpenses();
  renderBoard();
}

function addExpense(titulo, monto, estado, prioridad) {
  expenses.push({ id: Date.now().toString(), titulo, monto, estado, prioridad });
  saveExpenses();
  renderBoard();
}

// ===== BOARDS NAVIGATION =====
function enterBoard(board) {
  currentBoard = board;
  document.getElementById('boards-view').style.display = 'none';
  document.getElementById('board-view').style.display = 'flex';
  document.getElementById('header-board-name').textContent = board.name;
  loadExpenses();
  loadBudget();
  renderBoard();
}

function backToBoards() {
  currentBoard = null;
  expenses = [];
  budget = 0;
  document.getElementById('board-view').style.display = 'none';
  document.getElementById('boards-view').style.display = 'flex';
  renderBoards();
}

function deleteBoardById(boardId) {
  const board = boards.find(b => b.id === boardId);
  if (!board) return;
  if (!confirm(`¿Eliminar El Tablero "${board.name}" Y Todos Sus Gastos?`)) return;
  boards = boards.filter(b => b.id !== boardId);
  localStorage.removeItem('cuentas_' + currentUser + '_' + boardId);
  localStorage.removeItem('presupuesto_' + currentUser + '_' + boardId);
  saveBoards();
  renderBoards();
}

function deleteUser(username) {
  if (!confirm(`¿Eliminar El Usuario "${username}" Y Todos Sus Datos?`)) return;
  const keysToDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key === 'tableros_' + username ||
      key.startsWith('cuentas_' + username + '_') ||
      key.startsWith('presupuesto_' + username + '_')
    )) keysToDelete.push(key);
  }
  keysToDelete.forEach(k => localStorage.removeItem(k));
  renderUserList();
}

// ===== LOGIN =====
function login(username) {
  currentUser = username.trim();
  sessionStorage.setItem('currentUser', currentUser);
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('boards-user-badge').textContent = currentUser;
  document.getElementById('user-badge').textContent = currentUser;
  loadBoards();
  // Import pending shared board (arrived via URL hash before login)
  const pending = sessionStorage.getItem('pendingShare');
  if (pending) {
    sessionStorage.removeItem('pendingShare');
    const data = decodeBoard(pending);
    if (data && data.v && data.name) {
      const importedName = importBoardFromData(data);
      if (importedName) {
        loadBoards();
        document.getElementById('boards-view').style.display = 'flex';
        renderBoards();
        alert('Tablero "' + importedName + '" importado correctamente.');
        return;
      }
    }
  }
  document.getElementById('boards-view').style.display = 'flex';
  renderBoards();
  showFeedbackNudgePC();
}

function showFeedbackNudgePC() {
  if (sessionStorage.getItem('nudgeSeen')) return;
  sessionStorage.setItem('nudgeSeen', '1');
  var el = document.getElementById('feedback-nudge-pc');
  if (!el) return;
  setTimeout(function () { el.style.display = 'flex'; }, 100);
}

function logout() {
  sessionStorage.removeItem('currentUser');
  currentUser = null;
  currentBoard = null;
  boards = [];
  expenses = [];
  budget = 0;
  document.getElementById('login-view').style.display = '';
  document.getElementById('boards-view').style.display = 'none';
  document.getElementById('board-view').style.display = 'none';
  document.getElementById('username-input').value = '';
  renderUserList();
}

function checkShareHashPC() {
  const hash = window.location.hash;
  if (!hash.startsWith('#share=')) return;
  const code = hash.slice('#share='.length);
  history.replaceState(null, '', window.location.pathname + window.location.search);
  const data = decodeBoard(code);
  if (!data || !data.v || !data.name) return;
  if (currentUser) {
    const importedName = importBoardFromData(data);
    if (importedName) { loadBoards(); renderBoards(); alert('Tablero "' + importedName + '" importado correctamente.'); }
  } else {
    sessionStorage.setItem('pendingShare', code);
  }
}

// ===== EVENT LISTENERS =====
document.getElementById('login-btn').addEventListener('click', () => {
  const username = document.getElementById('username-input').value.trim();
  if (username) login(username);
  else document.getElementById('username-input').focus();
});

document.getElementById('username-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('login-btn').click();
});

document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('back-btn').addEventListener('click', backToBoards);
document.getElementById('boards-logout-btn').addEventListener('click', logout);

// ===== PWA INSTALL =====
var _deferredPrompt = null;
var _installKey = 'cuentas_install_dismissed';

function _isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

function _showInstallToast() {
  if (_isStandalone() || localStorage.getItem(_installKey)) return;
  const toast = document.getElementById('install-toast');
  if (toast) toast.style.display = 'flex';
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _deferredPrompt = e;
  setTimeout(_showInstallToast, 4000);
});

document.getElementById('install-desktop-btn').addEventListener('click', async () => {
  if (!_deferredPrompt) return;
  _deferredPrompt.prompt();
  const { outcome } = await _deferredPrompt.userChoice;
  _deferredPrompt = null;
  document.getElementById('install-toast').style.display = 'none';
  localStorage.setItem(_installKey, '1');
});

document.getElementById('install-desktop-close').addEventListener('click', () => {
  document.getElementById('install-toast').style.display = 'none';
  localStorage.setItem(_installKey, '1');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

// ===== INIT =====
checkShareHashPC();
renderUserList();
var savedUser = sessionStorage.getItem('currentUser');
if (savedUser) login(savedUser);
