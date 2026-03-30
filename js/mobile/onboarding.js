// ===== ONBOARDING =====
var ONB_BOARD   = 'onb_v1_board';
var ONB_EXPENSE = 'onb_v1_expense';
var ONB_TABS    = 'onb_v1_tabs';
var ONB_SHARE   = 'onb_v1_share';

// ── Nuevo Tablero pulse: se llama desde renderBoards()
function onbCheckNewBoard() {
  if (localStorage.getItem(ONB_BOARD)) return;
  var btn = document.getElementById('new-board-btn');
  if (!btn) return;
  if (boards.length > 0) {
    btn.classList.remove('onb-pulse');
    localStorage.setItem(ONB_BOARD, '1');
  } else {
    btn.classList.add('onb-pulse');
  }
}

// ── FAB pulse: llama la atención sobre el botón + cuando el tablero está vacío
function onbCheckFAB() {
  var fab = document.getElementById('fab');
  if (!fab) return;
  if (localStorage.getItem(ONB_EXPENSE)) {
    fab.classList.remove('onb-pulse');
  } else {
    fab.classList.add('onb-pulse');
  }
}

// ── Se llama al agregar el primer gasto de la sesión
function onbFirstExpenseDone() {
  if (localStorage.getItem(ONB_EXPENSE)) return;
  localStorage.setItem(ONB_EXPENSE, '1');
  var fab = document.getElementById('fab');
  if (fab) fab.classList.remove('onb-pulse');
  if (!localStorage.getItem(ONB_TABS)) onbShowTabHint();
}

// ── Tooltip breve sobre la barra de tabs
function onbShowTabHint() {
  var tabBar = document.getElementById('tab-bar');
  if (!tabBar || document.getElementById('onb-tab-hint')) return;

  var hint = document.createElement('div');
  hint.id = 'onb-tab-hint';
  hint.className = 'onb-tab-hint';
  hint.textContent = '← Navega entre columnas →';
  tabBar.parentNode.insertBefore(hint, tabBar);

  function dismiss() {
    localStorage.setItem(ONB_TABS, '1');
    hint.classList.add('onb-fade-out');
    setTimeout(function() { if (hint.parentNode) hint.remove(); }, 300);
    tabBar.removeEventListener('click', dismiss);
  }
  tabBar.addEventListener('click', dismiss, { once: true });
  setTimeout(dismiss, 5000);
}

// ── Badge pulsante en botón compartir (solo tras el primer gasto)
function onbCheckShare() {
  if (localStorage.getItem(ONB_SHARE)) return;
  if (!localStorage.getItem(ONB_EXPENSE)) return;
  var btn = document.getElementById('share-board-btn');
  if (!btn || btn.classList.contains('onb-pulse-green')) return;
  btn.classList.add('onb-pulse-green');
  btn.addEventListener('click', function() {
    btn.classList.remove('onb-pulse-green');
    localStorage.setItem(ONB_SHARE, '1');
  }, { once: true });
}
