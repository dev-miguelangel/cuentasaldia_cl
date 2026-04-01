// ===== CATEGORIES PANEL =====

var CAT_COLORS = [
  '#de350b', '#ff8b00', '#36b37e', '#0079bf',
  '#6554c0', '#00b8d9', '#ff5630', '#172b4d',
  '#00875a', '#9e1c1c'
];
var catSelectedColor = CAT_COLORS[0];

// ── Panel open/close ──────────────────────────────────────
function openCatPanel() {
  renderCatPanel();
  document.getElementById('cat-panel-overlay').classList.add('active');
  document.getElementById('cat-panel').classList.add('open');
  document.getElementById('cat-name-input').focus();
}

function closeCatPanel() {
  document.getElementById('cat-panel-overlay').classList.remove('active');
  document.getElementById('cat-panel').classList.remove('open');
}

// ── Panel render ──────────────────────────────────────────
function renderCatPanel() {
  const sub = document.getElementById('cat-panel-sub');
  sub.textContent = (currentBoard ? currentBoard.name : '') +
    ' · ' + categorias.length + '/10 categoría' + (categorias.length !== 1 ? 's' : '');

  const list = document.getElementById('cat-list');
  if (categorias.length === 0) {
    list.innerHTML = '<div class="cat-empty">Sin categorías aún. Agrega la primera abajo.</div>';
  } else {
    list.innerHTML = categorias.map(cat => {
      const count = expenses.filter(e => e.categoriaId === cat.id).length;
      const canDelete = count === 0;
      return `<div class="cat-item" data-catid="${cat.id}">
        <div class="cat-dot" style="background:${cat.color}"></div>
        <div class="cat-item-name">${escapeHTML(cat.name)}</div>
        <div class="cat-item-count">${count} gasto${count !== 1 ? 's' : ''}</div>
        <button class="btn-cat-edit" data-id="${cat.id}" title="Editar">✎</button>
        <button class="btn-cat-delete${canDelete ? '' : ' cat-del-disabled'}" data-id="${cat.id}"
          title="${canDelete ? 'Eliminar' : 'Tiene gastos — no se puede eliminar'}"
          ${canDelete ? '' : 'disabled'}>✕</button>
      </div>`;
    }).join('');

    list.querySelectorAll('.btn-cat-delete:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => deleteCat(btn.dataset.id));
    });
    list.querySelectorAll('.btn-cat-edit').forEach(btn => {
      btn.addEventListener('click', () => editCat(btn.dataset.id));
    });
  }

  _renderColorSwatches(document.getElementById('cat-color-swatches'), catSelectedColor, color => {
    catSelectedColor = color;
  });

  const atLimit = categorias.length >= 10;
  const addBtn = document.getElementById('cat-add-btn');
  const limitMsg = document.getElementById('cat-limit-msg');
  const catForm = document.getElementById('cat-form');
  addBtn.disabled = atLimit;
  limitMsg.style.display = atLimit ? '' : 'none';
  catForm.style.opacity = atLimit ? '0.55' : '';
  catForm.style.pointerEvents = atLimit ? 'none' : '';
}

function _renderColorSwatches(container, selected, onChange) {
  if (!container) return;
  container.innerHTML = CAT_COLORS.map(color =>
    `<div class="cat-swatch${color === selected ? ' selected' : ''}" data-color="${color}" style="background:${color}"></div>`
  ).join('');
  container.querySelectorAll('.cat-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      onChange(sw.dataset.color);
      _renderColorSwatches(container, sw.dataset.color, onChange);
    });
  });
}

// ── Add category ──────────────────────────────────────────
function addCat() {
  if (categorias.length >= 10) return;
  const input = document.getElementById('cat-name-input');
  const name = input.value.trim();
  if (!name) { input.classList.add('error'); input.focus(); return; }
  input.classList.remove('error');
  categorias.push({ id: 'cat' + Date.now(), name, color: catSelectedColor });
  saveCategories();
  input.value = '';
  catSelectedColor = CAT_COLORS[0];
  renderCatPanel();
  populateCategorySelect();
}

// ── Inline edit with name + color ─────────────────────────
function editCat(id) {
  const cat = categorias.find(c => c.id === id);
  if (!cat) return;
  const item = document.querySelector(`.cat-item[data-catid="${id}"]`);
  if (!item) return;

  let editColor = cat.color;

  item.innerHTML = `
    <div class="cat-edit-form">
      <input type="text" class="cat-edit-input" value="${escapeHTML(cat.name)}" maxlength="30" />
      <div class="cat-edit-swatches" id="cat-edit-swatches-${id}"></div>
      <div class="cat-edit-actions">
        <button class="btn-add cat-edit-save" data-id="${id}">Guardar</button>
        <button class="btn-cancel cat-edit-cancel">Cancelar</button>
      </div>
    </div>`;

  const swatchContainer = item.querySelector(`#cat-edit-swatches-${id}`);
  _renderColorSwatches(swatchContainer, editColor, color => { editColor = color; });

  const nameInput = item.querySelector('.cat-edit-input');
  nameInput.focus();
  nameInput.select();

  item.querySelector('.cat-edit-save').addEventListener('click', () => {
    const newName = nameInput.value.trim();
    if (!newName) { nameInput.focus(); return; }
    cat.name = newName;
    cat.color = editColor;
    saveCategories();
    renderCatPanel();
    populateCategorySelect();
    renderBoard();
  });

  item.querySelector('.cat-edit-cancel').addEventListener('click', () => renderCatPanel());

  nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') item.querySelector('.cat-edit-save').click();
    if (e.key === 'Escape') renderCatPanel();
  });
}

// ── Delete category ───────────────────────────────────────
function deleteCat(id) {
  if (expenses.some(e => e.categoriaId === id)) return;
  categorias = categorias.filter(c => c.id !== id);
  saveCategories();
  renderCatPanel();
  populateCategorySelect();
}

// ── Custom dropdown ───────────────────────────────────────
function selectCatOption(value, color, name) {
  document.getElementById('modal-categoria').value = value;
  document.getElementById('modal-cat-label').textContent = name;
  const dot = document.getElementById('modal-cat-dot');
  if (color) {
    dot.style.background = color;
    dot.style.opacity = '1';
  } else {
    dot.style.background = '';
    dot.style.opacity = '0';
  }
}

function populateCategorySelect() {
  const dropdown = document.getElementById('modal-cat-dropdown');
  if (!dropdown) return;

  const options = [{ id: '', name: '— Sin categoría —', color: null }].concat(categorias);
  dropdown.innerHTML = options.map(c => `
    <div class="cat-select-option" data-value="${c.id}" data-color="${c.color || ''}" data-name="${escapeHTML(c.name)}">
      <span class="cat-select-opt-dot" style="${c.color ? 'background:' + c.color + ';opacity:1' : 'opacity:0'}"></span>
      <span>${escapeHTML(c.name)}</span>
    </div>`).join('');

  dropdown.querySelectorAll('.cat-select-option').forEach(opt => {
    opt.addEventListener('click', () => {
      selectCatOption(opt.dataset.value, opt.dataset.color || null, opt.dataset.name);
      dropdown.classList.remove('open');
      document.getElementById('modal-cat-select').classList.remove('open');
    });
  });
}

// Toggle dropdown
document.getElementById('modal-cat-trigger').addEventListener('click', e => {
  e.stopPropagation();
  const sel = document.getElementById('modal-cat-select');
  sel.classList.toggle('open');
});

// Close on outside click
document.addEventListener('click', e => {
  const sel = document.getElementById('modal-cat-select');
  if (sel && !sel.contains(e.target)) {
    sel.classList.remove('open');
  }
});

// ── Summary category rows ─────────────────────────────────
function renderCatSummaryRows(colId) {
  const rows = document.getElementById('sum-cat-rows');
  if (!rows) return;
  const colExpenses = expenses.filter(e => e.estado === colId);
  if (colExpenses.length === 0) {
    rows.innerHTML = '<div class="sum-cat-empty">Sin gastos en esta columna.</div>';
    return;
  }
  const colTotal = colExpenses.reduce((s, e) => s + e.monto, 0);
  const totals = {};
  colExpenses.forEach(e => {
    const key = e.categoriaId || '__none__';
    totals[key] = (totals[key] || 0) + e.monto;
  });
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  rows.innerHTML = entries.map(([catId, total]) => {
    const cat = catId !== '__none__' ? categorias.find(c => c.id === catId) : null;
    const pct = colTotal > 0 ? Math.round(total / colTotal * 100) : 0;
    const color = cat ? cat.color : '#adb5bd';
    const name = cat ? escapeHTML(cat.name) : 'Sin categoría';
    const nameStyle = cat ? '' : 'color:#5e6c84;font-style:italic;';
    return `<div class="sum-cat-row">
      <div class="sum-cat-dot" style="background:${color}"></div>
      <div class="sum-cat-name" style="${nameStyle}">${name}</div>
      <div class="sum-cat-track">
        <div class="sum-cat-fill" style="width:0%;background:${color}" data-pct="${pct}"></div>
      </div>
      <div class="sum-cat-right">
        <div class="sum-cat-pct">${pct}%</div>
        <div class="sum-cat-amount">${formatCLP(total)}</div>
      </div>
    </div>`;
  }).join('');
  requestAnimationFrame(() => {
    rows.querySelectorAll('.sum-cat-fill').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  });
}

// ── Event wiring ──────────────────────────────────────────
document.getElementById('cat-panel-btn').addEventListener('click', openCatPanel);
document.getElementById('cat-panel-close').addEventListener('click', closeCatPanel);
document.getElementById('cat-panel-overlay').addEventListener('click', closeCatPanel);
document.getElementById('cat-add-btn').addEventListener('click', addCat);
document.getElementById('cat-name-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addCat();
});
