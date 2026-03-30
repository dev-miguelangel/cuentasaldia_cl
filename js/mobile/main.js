// ===== MOBILE MAIN =====

// ===== STATE =====
var currentUser = null;
var currentBoard = null;
var boards = [];
var expenses = [];
var budget = 0;
var activeTab = 'por_pagar';
var addingToColumn = null;
var movingExpenseId = null;
var editingId = null;
var importableBoardExpenses = [];

// ===== VIEW MANAGEMENT =====
function setView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== CRUD =====
function deleteExpense(id) {
  if (!confirm('¿Eliminar Este Gasto?')) return;
  expenses = expenses.filter(e => e.id !== id);
  saveExpenses(); renderActiveTab();
}

function addExpense(titulo, monto, estado, prioridad) {
  expenses.push({ id: Date.now().toString(), titulo, monto, estado, prioridad });
  saveExpenses(); renderActiveTab();
  onbFirstExpenseDone();
}

function moveExpense(id, targetColId) {
  const exp = expenses.find(e => e.id === id);
  if (exp && exp.estado !== targetColId) {
    exp.estado = targetColId; saveExpenses(); renderActiveTab();
  }
}

// ===== FAB =====
document.getElementById('fab').addEventListener('click', () => openAddSheet(activeTab));

// ===== TAB BAR =====
document.getElementById('tab-bar').addEventListener('click', e => {
  const btn = e.target.closest('.tab-item');
  if (!btn) return;
  activeTab = btn.dataset.tab;
  renderActiveTab();
});

// ===== BOARDS NAVIGATION =====
function enterBoard(board) {
  currentBoard = board;
  activeTab = 'por_pagar';
  document.getElementById('board-title-bar').textContent = board.name;
  loadExpenses(); loadBudget();
  setView('board-view');
  renderActiveTab();
  onbCheckFAB();
  onbCheckShare();
}

function backToBoards() {
  currentBoard = null; expenses = []; budget = 0;
  setView('boards-view'); renderBoards();
}

function deleteBoardById(boardId) {
  const board = boards.find(b => b.id === boardId);
  if (!board) return;
  if (!confirm(`¿Eliminar El Tablero "${board.name}" Y Todos Sus Gastos?`)) return;
  boards = boards.filter(b => b.id !== boardId);
  localStorage.removeItem('cuentas_' + currentUser + '_' + boardId);
  localStorage.removeItem('presupuesto_' + currentUser + '_' + boardId);
  saveBoards(); renderBoards();
}

document.getElementById('back-btn').addEventListener('click', backToBoards);
// logout se llama desde el menu sheet (onclick en HTML)

// ===== USERS =====
function deleteUser(username) {
  if (!confirm(`¿Eliminar El Usuario "${username}" Y Todos Sus Datos?`)) return;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k === 'tableros_' + username ||
      k.startsWith('cuentas_' + username + '_') ||
      k.startsWith('presupuesto_' + username + '_'))) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
  renderUserList();
}

// ===== AVATAR =====
var AVATAR_COLORS = ['#0052cc','#00875a','#de350b','#6554c0','#0065ff','#00b8d9','#ff7452','#36b37e'];

function avatarColor(name) {
  var sum = 0;
  for (var i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function setAvatars(name) {
  var initial = name.charAt(0).toUpperCase();
  var color   = avatarColor(name);
  ['boards-avatar', 'board-avatar'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.textContent = initial; el.style.background = color; }
  });
  var large = document.getElementById('menu-avatar-large');
  if (large) { large.textContent = initial; large.style.background = color; }
  var uname = document.getElementById('menu-username');
  if (uname) uname.textContent = name;
}

// ===== MENU SHEET =====
function openMenuSheet()  { openSheet('menu-sheet-overlay'); }
function closeMenuSheet() { closeSheet('menu-sheet-overlay'); }

// ===== LOGIN =====
function login(username) {
  currentUser = username.trim();
  sessionStorage.setItem('currentUser', currentUser);
  setAvatars(currentUser);
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
        setView('boards-view');
        renderBoards();
        alert('Tablero "' + importedName + '" importado correctamente.');
        return;
      }
    }
  }
  setView('boards-view');
  renderBoards();
  showFeedbackNudge();
}

function showFeedbackNudge() {
  if (sessionStorage.getItem('nudgeSeen')) return;
  sessionStorage.setItem('nudgeSeen', '1');
  var el = document.getElementById('feedback-nudge');
  if (!el) return;
  setTimeout(function () { el.style.display = 'flex'; }, 10);
}

function logout() {
  sessionStorage.removeItem('currentUser');
  currentUser = null; currentBoard = null; boards = []; expenses = []; budget = 0;
  document.getElementById('username-input').value = '';
  setView('login-view');
  renderUserList();
}

document.getElementById('login-btn').addEventListener('click', () => {
  const u = document.getElementById('username-input').value.trim();
  if (u) login(u); else document.getElementById('username-input').focus();
});
document.getElementById('username-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('login-btn').click();
});

function checkShareHash() {
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

// ===== PWA INSTALL =====
var _deferredPrompt = null;
var _installKey = 'cuentas_install_dismissed';

function _isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

function _detectOS() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'other';
}

function _tryShowInstall() {
  if (_isStandalone()) return;
  if (localStorage.getItem(_installKey)) return;
  const os = _detectOS();
  if (os === 'ios') {
    document.getElementById('install-ios').style.display = 'block';
    document.getElementById('install-native').style.display = 'none';
    openSheet('install-sheet-overlay');
  }
  // Android/other: handled by beforeinstallprompt event
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _deferredPrompt = e;
  if (!_isStandalone() && !localStorage.getItem(_installKey)) {
    document.getElementById('install-native').style.display = 'block';
    document.getElementById('install-ios').style.display = 'none';
    setTimeout(() => openSheet('install-sheet-overlay'), 3500);
  }
});

document.getElementById('install-btn').addEventListener('click', async () => {
  const prompt = _deferredPrompt;
  _deferredPrompt = null;
  closeSheet('install-sheet-overlay');
  localStorage.setItem(_installKey, '1');
  if (!prompt) return;
  try {
    prompt.prompt();
    await prompt.userChoice;
  } catch (e) { /* ignore */ }
});

document.getElementById('install-sheet-close').addEventListener('click', () => {
  closeSheet('install-sheet-overlay');
  localStorage.setItem(_installKey, '1');
});
['install-later-btn', 'install-later-btn-native'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => {
    closeSheet('install-sheet-overlay');
    localStorage.setItem(_installKey, '1');
  });
});

// Show iOS prompt after delay
setTimeout(_tryShowInstall, 3500);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

// ===== INIT =====
checkShareHash();
renderUserList();
var savedUser = sessionStorage.getItem('currentUser');
if (savedUser) login(savedUser);
