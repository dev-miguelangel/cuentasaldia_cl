// ===== SHARED SHARE / IMPORT =====
// These functions reference currentUser, currentBoard, budget, expenses as globals.

function encodeBoard(obj) {
  try {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    const binary = Array.from(bytes, b => String.fromCharCode(b)).join('');
    return btoa(binary);
  } catch (e) { return null; }
}

function decodeBoard(b64) {
  try {
    const binary = atob(b64.trim());
    const bytes = new Uint8Array(binary.length).map((_, i) => binary.charCodeAt(i));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (e) { return null; }
}

function exportBoardData() {
  return {
    v: 1,
    name: currentBoard.name,
    budget: budget,
    expenses: expenses.map(e => ({
      id: e.id, titulo: e.titulo, monto: e.monto,
      estado: e.estado, prioridad: e.prioridad || 'gusto'
    }))
  };
}

function importBoardFromData(data, targetUser) {
  const user = targetUser || currentUser;
  if (!user || !data || !data.v || !data.name) return false;
  try {
    let name = data.name;
    const storedBoards = JSON.parse(localStorage.getItem('tableros_' + user) || '[]');
    const names = storedBoards.map(b => b.name);
    if (names.includes(name)) {
      let i = 2;
      while (names.includes(name + ' (' + i + ')')) i++;
      name = name + ' (' + i + ')';
    }
    const bid = 'b' + Date.now();
    storedBoards.push({ id: bid, name });
    localStorage.setItem('tableros_' + user, JSON.stringify(storedBoards));
    if (data.expenses && data.expenses.length) {
      const exps = data.expenses.map((e, i) => ({
        id: 'imp' + Date.now() + i,
        titulo: e.titulo, monto: e.monto,
        estado: e.estado || 'por_pagar',
        prioridad: e.prioridad || 'gusto'
      }));
      localStorage.setItem('cuentas_' + user + '_' + bid, JSON.stringify(exps));
    }
    if (data.budget && data.budget > 0) {
      localStorage.setItem('presupuesto_' + user + '_' + bid, String(data.budget));
    }
    return name;
  } catch (e) { return false; }
}
