// ===== DESKTOP DRAG & DROP =====

var draggedId = null;
var dragOverCardId = null;
var dragOverPosition = null; // 'before' | 'after'

var _touchDragId = null;
var _touchClone = null;
var _touchOffsetX = 0, _touchOffsetY = 0;
var _touchStartX = 0, _touchStartY = 0;
var _touchIsDragging = false;
var _touchTargetColId = null;
var _touchOverCardId = null;
var _touchOverPosition = null;

function clearDropIndicators() {
  const ph = document.querySelector('.card-drop-placeholder');
  if (ph) ph.remove();
}

function insertDropPlaceholder(targetCard, position) {
  clearDropIndicators();
  const ph = document.createElement('div');
  ph.className = 'card-drop-placeholder';
  ph.textContent = '↓';
  if (position === 'before') {
    targetCard.parentNode.insertBefore(ph, targetCard);
  } else {
    targetCard.parentNode.insertBefore(ph, targetCard.nextSibling);
  }
}

function onDragStart(e) {
  draggedId = this.dataset.id;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function onDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
  clearDropIndicators();
  draggedId = null;
  dragOverCardId = null;
  dragOverPosition = null;
}

function onCardDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'move';

  if (!draggedId || this.dataset.id === draggedId) return;

  const rect = this.getBoundingClientRect();
  const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';

  if (dragOverCardId === this.dataset.id && dragOverPosition === position) return;

  dragOverCardId = this.dataset.id;
  dragOverPosition = position;
  insertDropPlaceholder(this, position);
  this.closest('.column').classList.add('drag-over');
}

function onCardDragLeave(e) {
  // placeholder stays until a new position is detected or drop ends
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.closest('.column').classList.add('drag-over');
}

function onDragLeave(e) {
  if (!this.contains(e.relatedTarget)) {
    this.closest('.column').classList.remove('drag-over');
    clearDropIndicators();
    dragOverCardId = null;
    dragOverPosition = null;
  }
}

function reorderExpense(expId, targetCardId, position, newColId) {
  const exp = expenses.find(ex => ex.id === expId);
  if (!exp) return;

  if (targetCardId && targetCardId !== expId) {
    const draggedIndex = expenses.findIndex(ex => ex.id === expId);
    expenses.splice(draggedIndex, 1);
    const newTargetIndex = expenses.findIndex(ex => ex.id === targetCardId);
    const insertAt = position === 'before' ? newTargetIndex : newTargetIndex + 1;
    exp.estado = newColId;
    expenses.splice(insertAt, 0, exp);
  } else if (exp.estado !== newColId) {
    exp.estado = newColId;
  } else {
    return; // no change
  }

  saveExpenses();
  renderBoard();
}

function onDrop(e) {
  e.preventDefault();
  const colId = this.dataset.colId;
  this.closest('.column').classList.remove('drag-over');
  clearDropIndicators();

  if (draggedId) {
    reorderExpense(draggedId, dragOverCardId, dragOverPosition, colId);
  }

  dragOverCardId = null;
  dragOverPosition = null;
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
  _touchOverCardId = null;
  _touchOverPosition = null;
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

  let newOverCardId = null;
  let newOverPos = null;

  if (el) {
    const col = el.closest('.column');
    if (col) {
      col.classList.add('drag-over');
      _touchTargetColId = col.dataset.colId;
    }
    const card = el.closest('.card');
    if (card && card.dataset.id !== _touchDragId) {
      const rect = card.getBoundingClientRect();
      newOverCardId = card.dataset.id;
      newOverPos = touch.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    }
  }

  if (newOverCardId !== _touchOverCardId || newOverPos !== _touchOverPosition) {
    _touchOverCardId = newOverCardId;
    _touchOverPosition = newOverPos;
    if (newOverCardId) {
      const targetCard = document.querySelector(`.card[data-id="${newOverCardId}"]`);
      if (targetCard) insertDropPlaceholder(targetCard, newOverPos);
    } else {
      clearDropIndicators();
    }
  }
}

function onTouchEnd() {
  if (!_touchDragId) return;
  if (_touchClone) { _touchClone.remove(); _touchClone = null; }

  if (_touchIsDragging) {
    const card = document.querySelector(`.card[data-id="${_touchDragId}"]`);
    if (card) card.classList.remove('dragging');
    document.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
    clearDropIndicators();
    if (_touchTargetColId) {
      reorderExpense(_touchDragId, _touchOverCardId, _touchOverPosition, _touchTargetColId);
    }
  }

  _touchDragId = null; _touchIsDragging = false; _touchTargetColId = null;
  _touchOverCardId = null; _touchOverPosition = null;
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
    card.addEventListener('dragover', onCardDragOver);
    card.addEventListener('dragleave', onCardDragLeave);
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
