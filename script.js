(() => {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const scoreOf = (total, mistakes) => Math.round(100 * total / (total + mistakes));

  let toastTimer;
  function toast(msg, type) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- Progreso general ---------- */
  const scores = { a1: null, a2: null, a3: null };
  const order = ['a1', 'a2', 'a3'];

  function complete(key, score) {
    scores[key] = score;
    const chip = $('#chip-' + key);
    chip.textContent = 'Completada · ' + score + ' pts';
    chip.classList.add('done');
    const next = $('#next-' + key);
    if (next) next.hidden = false;
    updateProgress();
    updateResults();
  }

  function updateProgress() {
    const done = order.filter(k => scores[k] !== null).length;
    $('#progFill').style.width = (done / 3 * 100) + '%';
    $('#progText').textContent = done + '/3';
  }

  function levelFor(avg) {
    if (avg >= 85) return { emoji: '🏆', name: 'Redactor publicitario Estrella', msg: '¡Excelente! Dominas las ideas, las estrategias y las palabras. Escribes con creatividad y cuidas cada detalle.' };
    if (avg >= 60) return { emoji: '🎨', name: 'Redactor publicitario Creativo', msg: '¡Muy bien! Ya conoces lo esencial. Con un poco más de práctica tus mensajes conectarán todavía mejor.' };
    return { emoji: '✏️', name: 'Redactor publicitario Aprendiz', msg: 'Buen comienzo. Repasa las características y las reglas de redacción, y vuelve a intentarlo.' };
  }

  function updateResults() {
    const done = order.filter(k => scores[k] !== null).length;
    const all = done === 3;
    $('#res-lock').hidden = all;
    $('#res-body').hidden = !all;
    if (!all) {
      const left = 3 - done;
      $('#res-left').textContent = 'Te ' + (left === 1 ? 'falta 1.' : 'faltan ' + left + '.');
      return;
    }
    const avg = Math.round((scores.a1 + scores.a2 + scores.a3) / 3);
    const lv = levelFor(avg);
    $('#res-avg').textContent = avg;
    $('#badge-emoji').textContent = lv.emoji;
    $('#badge-name').textContent = lv.name;
    $('#badge-msg').textContent = lv.msg;
    [1, 2, 3].forEach(n => {
      const v = scores['a' + n];
      $('#bar' + n).style.width = v + '%';
      $('#val' + n).textContent = v;
    });
    const ring = $('#ring');
    ring.style.setProperty('--p', 0);
    setTimeout(() => ring.style.setProperty('--p', avg), 80);
  }

  /* ---------- Botones "Siguiente" ---------- */
  $$('[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = document.getElementById(btn.dataset.target);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* =========================================================
     ACTIVIDAD 1 · Une las características
     ========================================================= */
  const FEATURES = [
    { id: 'creativa',  icon: '💡', title: 'Ser creativa',               desc: 'Ideas originales que captan la atención.' },
    { id: 'lenguaje',  icon: '✨', title: 'Usar un lenguaje atractivo', desc: 'Palabras persuasivas que hacen sonar diferente una idea.' },
    { id: 'publico',   icon: '🎯', title: 'Conocer a su público',       desc: 'Saber a quién se le habla para conectar con esa persona.' },
    { id: 'respuesta', icon: '🚀', title: 'Generar una respuesta',      desc: 'Motivar a la persona a actuar.' }
  ];
  let selL = null, selR = null, matched = 0, mistakes1 = 0;

  function build1() {
    const left = $('#a1-left'), right = $('#a1-right');
    FEATURES.forEach(f => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pair-btn'; b.dataset.id = f.id;
      b.innerHTML = '<span class="emoji" aria-hidden="true">' + f.icon + '</span><span>' + f.title + '</span>';
      b.addEventListener('click', () => pick('L', b));
      left.appendChild(b);
    });
    shuffle(FEATURES).forEach(f => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pair-btn'; b.dataset.id = f.id;
      b.innerHTML = '<span>' + f.desc + '</span>';
      b.addEventListener('click', () => pick('R', b));
      right.appendChild(b);
    });
  }

  function pick(side, btn) {
    if (btn.classList.contains('matched')) return;
    if (side === 'L') {
      if (selL) selL.classList.remove('selected');
      selL = (selL === btn) ? null : btn;
      if (selL) selL.classList.add('selected');
    } else {
      if (selR) selR.classList.remove('selected');
      selR = (selR === btn) ? null : btn;
      if (selR) selR.classList.add('selected');
    }
    if (selL && selR) check1();
  }

  function check1() {
    const a = selL, b = selR;
    selL = selR = null;
    a.classList.remove('selected'); b.classList.remove('selected');
    if (a.dataset.id === b.dataset.id) {
      a.classList.add('matched'); b.classList.add('matched');
      matched++;
      toast('¡Correcto!', 'ok');
      if (matched === FEATURES.length) finish1();
    } else {
      mistakes1++;
      a.classList.add('wrong'); b.classList.add('wrong');
      setTimeout(() => { a.classList.remove('wrong'); b.classList.remove('wrong'); }, 500);
      toast('Esa pareja no coincide. Intenta de nuevo.');
    }
  }

  function finish1() {
    const score = scoreOf(FEATURES.length, mistakes1);
    const m = $('#a1-msg');
    m.hidden = false;
    m.textContent = mistakes1 === 0
      ? '¡Perfecto! Relacionaste las 4 características sin ningún error.'
      : '¡Listo! Relacionaste las 4 características con ' + mistakes1 + (mistakes1 === 1 ? ' error.' : ' errores.');
    complete('a1', score);
  }

  /* =========================================================
     ACTIVIDAD 2 · Caza errores
     ========================================================= */
  const E = (w, cat, ok, opts) => ({ w, cat, ok, opts });
  const AD = [
    E('Descubre', 'Puntuación', '¡Descubre', ['¡Descubre', '¿Descubre', '¡¡Descubre']),
    'el', 'sabor', 'que', 'te', 'hace', 'sonreír!',
    'Nuestro', 'jugo', 'natural', 'es',
    E('delisioso,', 'Ortografía', 'delicioso,', ['delicioso,', 'deliciozo,', 'delizioso,']),
    'fresco', 'y', 'sin', 'azúcar', 'añadida.',
    'Los', 'ingredientes',
    E('es', 'Gramática', 'son', ['son', 'somos', 'ser']),
    'cien', 'por', 'ciento', 'naturales.',
    E('Pruebalo', 'Ortografía', 'Pruébalo', ['Pruébalo', 'Pruebálo', 'Prúebalo']),
    'hoy',
    E('mismo', 'Puntuación', 'mismo,', ['mismo,', 'mismo:', 'mismo...']),
    'te', 'esperamos', 'en', 'nuestra', 'sucursal.'
  ];
  const HINT = {
    'Ortografía': 'Evita errores al escribir.',
    'Gramática': 'Ayuda a construir correctamente las frases.',
    'Puntuación': 'Organiza las ideas y facilita la comprensión.'
  };
  const tokens = AD.map(x => typeof x === 'string' ? { w: x } : x);
  const TOTAL = tokens.filter(t => t.cat).length;
  let fixedCount = 0, mistakes2 = 0, current = -1, done2 = false;

  function build2() {
    const box = $('#ad-text');
    tokens.forEach((t, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'word'; b.textContent = t.w;
      b.addEventListener('click', () => onWord(i));
      t.el = b;
      box.appendChild(b);
      box.appendChild(document.createTextNode(' '));
    });
    updateMeter();
  }

  function onWord(i) {
    if (done2) return;
    const t = tokens[i];
    if (t.fixed) return;
    if (!t.cat) {
      mistakes2++;
      t.el.classList.add('wrong');
      setTimeout(() => t.el.classList.remove('wrong'), 500);
      closePanel();
      toast('Esa palabra está bien. ¡Sigue buscando!');
      return;
    }
    openPanel(i);
  }

  function openPanel(i) {
    tokens.forEach(t => t.el.classList.remove('active'));
    current = i;
    const t = tokens[i];
    t.el.classList.add('active');
    $('#fix-title').textContent = 'Corrige «' + t.w + '»';
    $('#fix-cat').textContent = t.cat;
    $('#fix-hint').textContent = 'Recuerda: ' + HINT[t.cat];
    const wrap = $('#fix-opts');
    wrap.innerHTML = '';
    shuffle(t.opts).forEach(o => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.textContent = o;
      b.addEventListener('click', () => choose(o));
      wrap.appendChild(b);
    });
    const p = $('#fixpanel');
    p.hidden = false;
    p.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closePanel() {
    $('#fixpanel').hidden = true;
    tokens.forEach(t => t.el && t.el.classList.remove('active'));
    current = -1;
  }
  $('#fix-cancel').addEventListener('click', closePanel);

  function choose(opt) {
    const t = tokens[current];
    if (!t) return;
    if (opt === t.ok) {
      t.fixed = true;
      t.el.textContent = t.ok;
      t.el.classList.remove('active');
      t.el.classList.add('fixed');
      fixedCount++;
      closePanel();
      updateMeter();
      toast('¡Corregido! La credibilidad sube.', 'ok');
      if (fixedCount === TOTAL) finish2();
    } else {
      mistakes2++;
      const p = $('#fixpanel');
      p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake');
      toast('Ese no es. ' + HINT[t.cat]);
    }
  }

  function updateMeter() {
    const pct = 20 + Math.round(80 * fixedCount / TOTAL);
    const fill = $('#meterFill');
    fill.style.width = pct + '%';
    fill.style.background = 'hsl(' + Math.round(pct * 1.2) + ' 75% 42%)';
    $('#meterNum').textContent = pct + '%';
    $('#fixedCount').textContent = fixedCount;
    $('#meterLabel').textContent = pct < 50 ? 'Baja' : (pct < 100 ? 'Mejorando' : 'Marca confiable');
  }

  function finish2() {
    done2 = true;
    const score = scoreOf(TOTAL, mistakes2);
    const m = $('#a2-msg');
    m.hidden = false;
    m.textContent = '¡Anuncio impecable! Corregiste los 5 errores y la credibilidad de la marca llegó al 100%. Recuerda: un error puede cambiar el significado y afectar la credibilidad de una marca.';
    complete('a2', score);
  }

  /* =========================================================
     ACTIVIDAD 3 · Crea tu eslogan
     ========================================================= */
  const state3 = { product: null, audience: null };
  const CTA_WORDS = ['prueba','pruébalo','descubre','ven','únete','compra','pide','vive','siente','llama','visita','elige','disfruta','regístrate','empieza','comienza','atrévete','haz','mueve','cambia','conoce','inscríbete','ahorra','corre','ordena','sonríe','anímate','sorpréndete','entrena','celebra'];

  function detectCTA(text) {
    const words = (text.toLowerCase().match(/[a-záéíóúñü]+/g)) || [];
    return words.find(w => CTA_WORDS.indexOf(w) !== -1) || null;
  }
  const wordsOf = s => (s.trim().match(/\S+/g) || []);

  function bindChips(selector, key) {
    const chips = $$(selector + ' .chip');
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => x.setAttribute('aria-pressed', 'false'));
      c.setAttribute('aria-pressed', 'true');
      state3[key] = c.textContent.trim();
      update3();
    }));
  }
  bindChips('#prod-chips', 'product');
  bindChips('#aud-chips', 'audience');

  const slogan = $('#slogan');
  slogan.addEventListener('input', update3);

  function update3() {
    const txt = slogan.value.trim();
    const n = wordsOf(txt).length;
    $('#slogan-count').textContent = slogan.value.length + '/80';
    $('#pv-text').textContent = txt || 'Tu eslogan aparecerá aquí';
    $('#pv-meta').textContent = (state3.product || 'Producto') + ' · ' + (state3.audience ? 'Para ' + state3.audience.toLowerCase() : 'Elige un público');
    $('#f-idea').textContent = state3.product || '—';
    $('#f-estr').textContent = state3.audience ? 'Para ' + state3.audience.toLowerCase() : '—';
    $('#f-pal').textContent = n ? n + (n === 1 ? ' palabra' : ' palabras') : '—';
    $('#eval-btn').disabled = !(n >= 3 && state3.product && state3.audience);
    if (!$('#check').hidden) refreshHints();
  }

  function refreshHints() {
    const w = detectCTA(slogan.value);
    $('#hint-resp').textContent = w
      ? 'Detectamos un verbo de acción: «' + w + '».'
      : 'Tip: invita a actuar con verbos como Prueba, Descubre o Únete.';
    $('#hint-pub').textContent = 'Escribiste para: ' + (state3.audience ? state3.audience.toLowerCase() : 'tu público') + '. ¿Les habla directamente?';
  }

  function score3() {
    const n = $$('#check input:checked').length;
    $('#score3').textContent = n * 25;
    return n * 25;
  }

  $('#eval-btn').addEventListener('click', () => {
    const c = $('#check');
    const first = c.hidden;
    c.hidden = false;
    if (first) $('#c-resp').checked = !!detectCTA(slogan.value);
    refreshHints();
    score3();
    c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  $$('#check input').forEach(i => i.addEventListener('change', score3));

  $('#finish3').addEventListener('click', () => {
    const s = score3();
    complete('a3', s);
    toast('¡Eslogan guardado! Puedes ver tus resultados.', 'ok');
  });

  /* ---------- Reiniciar ---------- */
  $('#restart').addEventListener('click', () => {
    window.scrollTo(0, 0);
    location.reload();
  });

  /* ---------- Animación al hacer scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Inicio ---------- */
  build1();
  build2();
  update3();
  updateResults();
})();
