// ===== DESKTOP DRAG & DROP =====

var draggedId = null;
var _touchDragId = null;
var _touchClone = null;
var _touchOffsetX = 0, _touchOffsetY = 0;
var _touchStartX = 0, _touchStartY = 0;
var _touchIsDragging = false;
var _touchTargetColId = null;

function onDragStart(e) {
  draggedId = this.dataset.id;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function onDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
  draggedId = null;
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.closest('.column').classList.add('drag-over');
}

function onDragLeave(e) {
  if (!this.contains(e.relatedTarget)) {
    this.closest('.column').classList.remove('drag-over');
  }
}

function onDrop(e) {
  e.preventDefault();
  const colId = this.dataset.colId;
  this.closest('.column').classList.remove('drag-over');

  if (draggedId) {
    const exp = expenses.find(ex => ex.id === draggedId);
    if (exp && exp.estado !== colId) {
      exp.estado = colId;
      saveExpenses();
      renderBoard();
    }
  }
}

function onTouchStart(e) {
  if (e.touches.length !== 1) return;
  if (e.target.closest('button')) return;
  const touch = e.touches[0];
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  _touchDragId = card.dataset.id;
  _touchStartX = touch.clientX;
  _touchStartY = touch.clientY;
  _touchOffsetX = touch.clientX - rect.left;
  _touchOffsetY = touch.clientY - rect.top;
  _touchIsDragging = false;
  _touchTargetColId = null;
}

function onTouchMove(e) {
  if (!_touchDragId) return;
  const touch = e.touches[0];
  const dx = touch.clientX - _touchStartX;
  const dy = touch.clientY - _touchStartY;

  if (!_touchIsDragging) {
    if (Math.hypot(dx, dy) < 8) return;
    _touchIsDragging = true;
    const card = document.querySelector(`.card[data-id="${_touchDragId}"]`);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    _touchClone = card.cloneNode(true);
    Object.assign(_touchClone.style, {
      position: 'fixed', width: rect.width + 'px',
      opacity: '0.85', pointerEvents: 'none', zIndex: '9999',
      left: (touch.clientX - _touchOffsetX) + 'px',
      top: (touch.clientY - _touchOffsetY) + 'px',
      transform: 'rotate(2deg) scale(1.03)',
      boxShadow: '0 8px 24px rgba(9,30,66,0.25)',
      transition: 'none', margin: '0',
    });
    document.body.appendChild(_touchClone);
    card.classList.add('dragging');
  }

  e.preventDefault();
  _touchClone.style.left = (touch.clientX - _touchOffsetX) + 'px';
  _touchClone.style.top = (touch.clientY - _touchOffsetY) + 'px';

  _touchClone.style.visibility = 'hidden';
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  _touchClone.style.visibility = '';

  document.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
  _touchTargetColId = null;
  if (el) {
    const col = el.closest('.column');
    if (col) { col.classList.add('drag-over'); _touchTargetColId = col.dataset.colId; }
  }
}

function onTouchEnd() {
  if (!_touchDragId) return;
  if (_touchClone) { _touchClone.remove(); _touchClone = null; }

  if (_touchIsDragging) {
    const card = document.querySelector(`.card[data-id="${_touchDragId}"]`);
    if (card) card.classList.remove('dragging');
    document.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
    if (_touchTargetColId) {
      const exp = expenses.find(ex => ex.id === _touchDragId);
      if (exp && exp.estado !== _touchTargetColId) {
        exp.estado = _touchTargetColId;
        saveExpenses();
        renderBoard();
      }
    }
  }

  _touchDragId = null; _touchIsDragging = false; _touchTargetColId = null;
}

function attachEvents() {
  document.querySelectorAll('.add-card-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.colId));
  });

  const budgetBtn = document.getElementById('budget-edit-btn');
  if (budgetBtn) budgetBtn.addEventListener('click', openBudgetModal);

  document.querySelectorAll('.card-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditModal(btn.dataset.id);
    });
  });

  document.querySelectorAll('.card-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteExpense(btn.dataset.id);
    });
  });

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('dragstart', onDragStart);
    card.addEventListener('dragend', onDragEnd);
    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchmove', onTouchMove, { passive: false });
    card.addEventListener('touchend', onTouchEnd);
    card.addEventListener('touchcancel', onTouchEnd);
  });

  document.querySelectorAll('.cards-list').forEach(list => {
    list.addEventListener('dragover', onDragOver);
    list.addEventListener('dragleave', onDragLeave);
    list.addEventListener('drop', onDrop);
  });
}
