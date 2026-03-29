// ===== LANDING PAGE JS =====

emailjs.init('u1PGzoaxrjwOf3HLq');

// ===== FEEDBACK =====
var _fbScores = { utilidad: 0, usabilidad: 0, funcionalidades: 0 };

function fbRate(cat, val) {
  _fbScores[cat] = _fbScores[cat] === val ? 0 : val;
  document.querySelectorAll('#fb-' + cat + ' .fb-star').forEach(function(s, i) {
    s.classList.toggle('active', i < _fbScores[cat]);
  });
}

function submitFeedback() {
  var btn = document.getElementById('fb-send-btn');
  var status = document.getElementById('fb-status');
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  status.textContent = '';
  emailjs.send('service_wr18xhk', 'template_rxr4zig', {
    to_email:        'dev.miguelangel.jaimen@gmail.com',
    utilidad:        _fbScores.utilidad + '/5',
    usabilidad:      _fbScores.usabilidad + '/5',
    funcionalidades: _fbScores.funcionalidades + '/5',
    mensaje:         document.getElementById('fb-mensaje').value.trim(),
    version:         'Landing'
  }).then(function() {
    btn.textContent = '¡Enviado! ✓';
    btn.style.background = 'var(--green)';
    status.style.color = 'var(--green)';
    status.textContent = 'Gracias por tu feedback.';
    setTimeout(function() {
      btn.disabled = false;
      btn.textContent = 'Enviar Feedback →';
      btn.style.background = '';
      status.textContent = '';
      _fbScores = { utilidad: 0, usabilidad: 0, funcionalidades: 0 };
      ['utilidad','usabilidad','funcionalidades'].forEach(function(c) {
        document.querySelectorAll('#fb-' + c + ' .fb-star').forEach(function(s) { s.classList.remove('active'); });
      });
      document.getElementById('fb-mensaje').value = '';
      document.getElementById('fb-char-num').textContent = '0';
    }, 2500);
  }, function() {
    btn.disabled = false;
    btn.textContent = 'Enviar Feedback →';
    status.style.color = 'var(--red)';
    status.textContent = 'Error al enviar. Intenta de nuevo.';
  });
}

// ===== DEMO TRACKING =====
(function () {
  function trackAndNavigate(dest, isPC) {
    var navigated = false;
    function go() { if (!navigated) { navigated = true; window.location.href = dest; } }
    try {
      emailjs.send('service_wr18xhk', 'template_rxr4zig', {
        to_email:        'dev.miguelangel.jaimen@gmail.com',
        utilidad:        '0/5',
        usabilidad:      '0/5',
        funcionalidades: '0/5',
        mensaje:         isPC ? 'Nuevo ingreso demo PC' : 'Nuevo ingreso demo celular',
        version:         isPC ? 'Demo PC' : 'Demo Celular'
      }).then(go, go);
    } catch (e) { go(); }
    // Fallback: navega aunque el envío tarde o falle
    setTimeout(go, 1500);
  }

  document.querySelectorAll('a[href="desktop.html"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      trackAndNavigate(this.href, true);
    });
  });

  document.querySelectorAll('a[href="mobile.html"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      trackAndNavigate(this.href, false);
    });
  });
})();
