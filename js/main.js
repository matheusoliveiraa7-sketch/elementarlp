/* Elementar — landing page. JavaScript sem dependências. */
(function () {
  'use strict';

  /* ---------- Configuração ---------- */
  var WA_NUMBER = '5591991966282';            // WhatsApp da Elementar (formato internacional)
  var PRIVACY_URL = '';                       // Cole aqui o link da política de privacidade quando existir

  // Análise de visitas e cliques.
  // GA4_ID: preencha depois de criar a conta (gratuita). Vazio = nada é carregado e o aviso de cookies não aparece.
  // VERCEL: o Vercel Web Analytics não usa cookies, então carrega sem aviso. Só funciona no site publicado no Vercel,
  //         depois de ativar em Projeto > Analytics > Enable.
  var ANALYTICS = {
    GA4_ID: '',        // Google Analytics 4: "G-XXXXXXXXXX"
    VERCEL: true
  };

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (RM) document.documentElement.classList.add('rm');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var waUrl = function (msg) { return 'https://wa.me/' + WA_NUMBER + (msg ? '?text=' + encodeURIComponent(msg) : ''); };
  var io = function (cb, opts) { return 'IntersectionObserver' in window ? new IntersectionObserver(cb, opts) : null; };

  /* ---------- Análise (só depois do consentimento) ---------- */
  var track = function () {};   // vira função real quando o visitante aceita
  (function () {
    var KEY = 'elementar-cookies';
    var hasTools = !!ANALYTICS.GA4_ID;   // só o GA4 usa cookies e precisa de consentimento

    // Vercel Web Analytics (sem cookies): só no site publicado, nunca em localhost ou arquivo local
    var local = /^(localhost|127\.|\[::1\])/.test(location.hostname) || location.protocol === 'file:';
    if (ANALYTICS.VERCEL && !local) {
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
      var v = document.createElement('script');
      v.defer = true; v.src = '/_vercel/insights/script.js';
      document.head.appendChild(v);
    }
    var banner = $('#cookie-bar');
    var store = {
      get: function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
      set: function (v) { try { localStorage.setItem(KEY, v); } catch (e) { /* sem armazenamento: pergunta de novo */ } }
    };
    var loaded = false;

    function load() {
      if (loaded) return; loaded = true;
      if (ANALYTICS.GA4_ID) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', ANALYTICS.GA4_ID);
        var g = document.createElement('script');
        g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ANALYTICS.GA4_ID);
        document.head.appendChild(g);
      }
      // Nunca envie nome, telefone ou texto digitado pelo visitante nos parâmetros.
      track = function (name, params) {
        if (window.gtag && ANALYTICS.GA4_ID) window.gtag('event', name, params || {});
      };
    }

    function show(on) {
      if (!banner) return;
      banner.hidden = !on;
      document.body.classList.toggle('cb-on', on);
    }
    function choose(v) { store.set(v); show(false); if (v === 'granted') load(); }

    window.elementarCookies = function () { if (hasTools) show(true); };  // reabre o aviso (rodapé)
    var reopen = $('#cookie-reopen');
    if (reopen) reopen.hidden = !hasTools;
    if (!hasTools) return;

    var gpc = navigator.globalPrivacyControl === true;   // respeita o sinal de privacidade do navegador
    var saved = store.get();
    if (saved === 'granted' && !gpc) load();
    else if (!saved && !gpc) show(true);
    if (banner) {
      $('#cookie-yes').addEventListener('click', function () { choose('granted'); });
      $('#cookie-no').addEventListener('click', function () { choose('denied'); });
    }
    if (reopen) reopen.addEventListener('click', function () { show(true); });
  })();

  // Eventos de clique (delegados): WhatsApp, Instagram e serviços
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a || a.dataset.notrack) return;
    var sec = a.closest('section, footer, header');
    var where = sec ? (sec.id || sec.tagName.toLowerCase()) : 'pagina';
    var href = a.getAttribute('href') || '';
    if (href.indexOf('wa.me/') > -1) track('whatsapp_click', { local: where, texto: (a.textContent || '').trim().slice(0, 40) });
    else if (href.indexOf('instagram.com') > -1) track('instagram_click', { local: where });
    else if (a.closest('.hsv__l, .map__s, .pil__to')) track('servico_clique', { servico: href.replace('#', '') });
  });

  /* ---------- Links de WhatsApp com mensagem ---------- */
  $$('[data-wa]').forEach(function (a) { a.href = waUrl(a.getAttribute('data-wa')); });

  $('#yr').textContent = new Date().getFullYear();

  /* ---------- Header ---------- */
  var hdr = $('#topo'), nav = $('#nav'), burger = $('.burger');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-scrolled', y > 8);
    if (!nav.classList.contains('is-open')) {
      if (y > 480 && y > lastY + 6) hdr.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 480) hdr.classList.remove('is-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    hdr.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  /* Link ativo na navegação */
  var spy = io(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        $$('.nav a[data-spy]').forEach(function (a) { a.classList.toggle('is-active', a.dataset.spy === e.target.id); });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  if (spy) ['servicos', 'metodo', 'contato'].forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });

  /* ---------- Revelação ao rolar ---------- */
  $$('.rv').forEach(function (el) {
    var sibs = $$(':scope > .rv', el.parentElement);
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i * 0.08, 0.4) + 's');
  });
  var rvIO = io(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(function (el) { rvIO ? rvIO.observe(el) : el.classList.add('in'); });

  var stepsEl = $('#steps');
  var stIO = io(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); stIO.unobserve(e.target); } }); }, { threshold: 0.3 });
  if (stepsEl) { stIO ? stIO.observe(stepsEl) : stepsEl.classList.add('in'); }

  /* ---------- Método: pilares conectados aos serviços ---------- */
  (function () {
    var map = $('#map');
    if (!map) return;
    var svg = $('.map__svg', map);
    // [pilar, serviço, tipo]: "main" = serviço central do pilar; "br" = serviço que fortalece o pilar
    var links = [['p1', 's1', 'main'], ['p1', 's2', 'br'], ['p2', 's2', 'br'], ['p2', 's3', 'main'], ['p3', 's4', 'main']];
    var NS = 'http://www.w3.org/2000/svg';

    function draw() {
      svg.innerHTML = '';
      if (getComputedStyle(svg).display === 'none') return;
      var box = map.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
      var out = {}; // contagem de ligações por extremidade, para espaçar os pontos
      links.forEach(function (l) {
        var p = $('.pil__i[data-p="' + l[0] + '"]', map).getBoundingClientRect();
        var s = $('.map__s [data-s="' + l[1] + '"] a', map).getBoundingClientRect();
        var siblings = links.filter(function (k) { return k[0] === l[0]; });
        var idx = siblings.indexOf(l), n = siblings.length;
        var x1 = p.right - box.left, y1 = p.top - box.top + p.height * (idx + 1) / (n + 1);
        var x2 = s.left - box.left, y2 = s.top - box.top + s.height / 2;
        var mx = (x1 + x2) / 2;
        var path = document.createElementNS(NS, 'path');
        path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ',' + mx + ' ' + y2 + ',' + x2 + ' ' + y2);
        if (l[2] === 'br') path.setAttribute('class', 'br');
        path.dataset.lp = l[0]; path.dataset.ls = l[1];
        svg.appendChild(path);
        [[x1, y1], [x2, y2]].forEach(function (pt) {
          var r = document.createElementNS(NS, 'rect');
          r.setAttribute('x', pt[0] - 4); r.setAttribute('y', pt[1] - 4);
          r.setAttribute('width', 8); r.setAttribute('height', 8);
          if (l[2] === 'br') r.setAttribute('class', 'br');
          r.dataset.lp = l[0]; r.dataset.ls = l[1];
          svg.appendChild(r);
        });
      });
    }

    function hl(key, attr) {
      map.classList.toggle('hl', !!key);
      $$('path,rect', svg).forEach(function (el) { el.classList.toggle('dim', !!key && el.dataset[attr] !== key); });
    }
    $$('.pil__i[data-p]', map).forEach(function (el) {
      el.addEventListener('mouseenter', function () { hl(el.dataset.p, 'lp'); });
      el.addEventListener('mouseleave', function () { hl(null); });
    });
    $$('.map__s [data-s]', map).forEach(function (el) {
      el.addEventListener('mouseenter', function () { hl(el.dataset.s, 'ls'); });
      el.addEventListener('mouseleave', function () { hl(null); });
      el.addEventListener('focusin', function () { hl(el.dataset.s, 'ls'); });
      el.addEventListener('focusout', function () { hl(null); });
    });

    var t;
    function redraw() { clearTimeout(t); t = setTimeout(draw, 80); }
    window.addEventListener('resize', redraw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    draw();
    // as caixas entram com atraso (revelação): redesenha depois e libera a animação das linhas
    var mio = io(function (es) {
      if (es[0].isIntersecting) { draw(); setTimeout(draw, 900); map.classList.add('in'); mio.disconnect(); }
    }, { threshold: 0.25 });
    mio ? mio.observe(map) : map.classList.add('in');
  })();

  /* ---------- Números animados (sempre ilustrativos) ---------- */
  function fmt(v, f) {
    var s = Math.round(v).toLocaleString('pt-BR');
    return f === 'brl' ? 'R$ ' + s : s;
  }
  function countUp(el) {
    var to = +el.dataset.count, f = el.dataset.fmt, t0 = null, dur = 1400;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e, f);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cIO = io(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { if (!RM) countUp(e.target); cIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(function (el) { if (cIO && !RM) cIO.observe(el); });

  /* ---------- Problema: pilhas de quadrados ---------- */
  $$('.fun').forEach(function (fun) {
    var counts = fun.dataset.stack.split(',').map(Number);
    var wrap = $('.fun__cols', fun);
    counts.forEach(function (n, c) {
      var col = document.createElement('div');
      col.className = 'fun__col';
      col.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) {
        var sq = document.createElement('i');
        sq.style.setProperty('--d', (c * 0.18 + i * 0.03).toFixed(2) + 's');
        col.appendChild(sq);
      }
      wrap.appendChild(col);
    });
  });

  /* ---------- Demo 3: CRM demonstrativo ---------- */
  (function () {
    var board = $('#d3-board');
    if (!board) return;
    var names = ['Ana', 'Marcos', 'Júlia', 'Rafael', 'Camila', 'Bruno', 'Letícia', 'Diego', 'Paula', 'Tiago', 'Renata', 'Caio', 'Marina', 'Hugo', 'Bianca', 'Davi'];
    var segs = ['Clínica', 'Imobiliária', 'Advocacia', 'Loja', 'Escola', 'Academia', 'Estética', 'Oficina'];
    var stageNames = ['Contato recebido', 'Qualificação', 'Atendimento', 'Acompanhamento', 'Negociação', 'Venda'];
    var prob = [0.9, 0.8, 0.7, 0.2, 0.55];   // chance de avançar a partir de cada etapa (gargalo em Acompanhamento)
    var bodies = $$('.col__b', board);
    var cols = $$('.col', board);
    var alertEl = $('#d3-alert'), soldEl = $('#d3-sold');
    var leads = [], sold = 0, n = 0, ticks = 0, timer = null;

    function mk(stage, isNew) {
      var el = document.createElement('div');
      el.className = 'lead-c' + (isNew ? ' is-new' : '');
      var nm = names[n % names.length], sg = segs[(n * 3 + 1) % segs.length];
      n++;
      el.innerHTML = '<b>' + nm + '</b><span>' + sg + '</span>';
      var l = { el: el, stage: stage, doneAt: 0 };
      leads.push(l);
      bodies[stage].appendChild(el);
      return l;
    }
    [0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 4].forEach(function (s) { mk(s, false); });

    function refresh() {
      var bn = -1;
      cols.forEach(function (c, i) {
        var cnt = bodies[i].children.length;
        var is = i > 0 && i < 5 && cnt >= 4;
        c.classList.toggle('is-bn', is);
        if (is) bn = i;
      });
      if (bn > -1) { alertEl.hidden = false; alertEl.lastChild.textContent = 'Gargalo em ' + stageNames[bn]; }
      else alertEl.hidden = true;
      soldEl.textContent = sold;
    }

    function flip(fn) {
      var items = leads.map(function (l) { return [l.el, l.el.getBoundingClientRect()]; });
      fn();
      items.forEach(function (it) {
        var el = it[0], a = it[1], b = el.getBoundingClientRect();
        var dx = a.left - b.left, dy = a.top - b.top;
        if (!dx && !dy) return;
        el.style.transition = 'none';
        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        el.getBoundingClientRect();
        el.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1)';
        el.style.transform = '';
      });
    }

    function tick() {
      ticks++;
      flip(function () {
        for (var k = 0; k < 2; k++) {
          var pool = leads.filter(function (l) { return l.stage < 5; });
          if (!pool.length) break;
          var l = pool[Math.floor(Math.random() * pool.length)];
          if (Math.random() < prob[l.stage]) {
            l.stage++;
            bodies[l.stage].appendChild(l.el);
            if (l.stage === 5) l.doneAt = ticks;
          }
        }
        if (ticks % 2 === 0 && leads.length < 17 && bodies[0].children.length < 4) mk(0, true);
        leads = leads.filter(function (l) {
          if (l.stage === 5 && ticks - l.doneAt >= 3) {
            l.el.classList.add('is-out');
            sold++;
            setTimeout(function () { flip(function () { l.el.remove(); }); }, 450);
            return false;
          }
          return true;
        });
      });
      refresh();
    }
    refresh();
    if (RM) return;

    function start() { if (!timer) timer = setInterval(tick, 1500); }
    function stop() { clearInterval(timer); timer = null; }
    var vis = false;
    var dio = io(function (es) { vis = es[0].isIntersecting; vis && !document.hidden ? start() : stop(); }, { threshold: 0.25 });
    dio && dio.observe($('.d3'));
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : (vis && start()); });
  })();

  /* ---------- Demo 4: visões de marketing / vendas ---------- */
  (function () {
    var tabs = $$('.d4__tabs button'), svg = $('#d4-svg');
    tabs.forEach(function (b) {
      b.addEventListener('click', function () {
        tabs.forEach(function (t) { t.setAttribute('aria-pressed', t === b); });
        svg.setAttribute('class', 'show-' + b.dataset.view);
      });
    });
  })();

  /* ---------- Combinação de serviços ---------- */
  (function () {
    var mods = $$('#mods input'), out = $('#combo-out'), cta = $('#combo-cta');
    var base = 'Escolha um ou mais. Também é válido dizer “ainda não sei”.';
    function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1]; }
    function update() {
      var sel = mods.filter(function (m) { return m.checked; }).map(function (m) { return m.value; });
      var msg;
      if (!sel.length) {
        out.textContent = base;
        msg = 'Olá! Vim pelo site da Elementar e ainda não sei por onde começar. Podemos conversar?';
      } else if (sel.length === 1) {
        out.textContent = 'Começar só por ' + sel[0] + ' é um caminho válido. Se surgirem outras necessidades, a gente conversa no momento certo.';
        msg = 'Olá! Vim pelo site da Elementar e tenho interesse em ' + sel[0] + '. Podemos conversar?';
      } else {
        out.textContent = list(sel) + ' se complementam. Dá para encaixar uma frente de cada vez, conforme o seu momento.';
        msg = 'Olá! Vim pelo site da Elementar e tenho interesse em: ' + list(sel) + '. Podemos conversar sobre por onde começar?';
      }
      cta.href = waUrl(msg);
    }
    mods.forEach(function (m) { m.addEventListener('change', update); });
    update();
  })();

  /* ---------- Formulário → WhatsApp ---------- */
  (function () {
    var form = $('#form');
    if (!form) return;
    var status = $('#form-status');
    var fields = { nome: $('#f-nome'), tel: $('#f-tel'), srv: $('#f-srv') };
    var errs = { nome: $('#e-nome'), tel: $('#e-tel'), srv: $('#e-srv') };

    var link = $('#privacy-link');
    if (PRIVACY_URL) {
      link.href = PRIVACY_URL; link.target = '_blank'; link.rel = 'noopener';
      link.removeAttribute('aria-disabled'); $('#privacy-soon').remove();
    }

    function fmtPhone(d) {
      d = d.slice(0, 11);
      if (d.length <= 2) return d ? '(' + d : '';
      if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
      return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    }
    fields.tel.addEventListener('input', function () {
      var d = fields.tel.value.replace(/\D/g, '');
      if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
      fields.tel.value = fmtPhone(d);
    });

    function setErr(k, msg) {
      errs[k].textContent = msg || '';
      if (msg) fields[k].setAttribute('aria-invalid', 'true'); else fields[k].removeAttribute('aria-invalid');
    }
    Object.keys(fields).forEach(function (k) {
      var ev = k === 'srv' ? 'change' : 'input';
      fields[k].addEventListener(ev, function () { if (fields[k].getAttribute('aria-invalid')) validate(k); });
    });

    function validate(only) {
      var ok = true, first = null;
      function chk(k, bad, msg) {
        if (only && only !== k) return;
        if (bad) { setErr(k, msg); ok = false; first = first || fields[k]; } else setErr(k);
      }
      chk('nome', fields.nome.value.trim().length < 2, 'Informe o seu nome.');
      var d = fields.tel.value.replace(/\D/g, '');
      chk('tel', d.length < 10 || d.length > 11, 'Informe o WhatsApp com DDD, por exemplo (91) 90000-0000.');
      chk('srv', !fields.srv.value, 'Selecione um serviço ou “Ainda não sei”.');
      return only ? ok : { ok: ok, first: first };
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = validate();
      if (!r.ok) { status.textContent = ''; r.first.focus(); return; }
      var v = function (id) { return form.elements[id].value.trim(); };
      var msg = [
        'Olá, Elementar! Vim pelo site e gostaria de solicitar uma proposta.',
        '',
        '*Nome:* ' + v('nome'),
        '*Empresa ou segmento:* ' + (v('empresa') || 'Não informado'),
        '*WhatsApp:* ' + v('telefone'),
        '*Serviço de interesse:* ' + v('servico'),
        '*Principal desafio comercial:* ' + (v('desafio') || 'Não informado')
      ].join('\n');
      var url = waUrl(msg);
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.dataset.notrack = '1';
      track('generate_lead', { servico: v('servico') });   // só o serviço escolhido, sem dados pessoais
      document.body.appendChild(a); a.click(); a.remove();
      status.innerHTML = 'Abrimos o WhatsApp com a sua mensagem pronta. Falta só confirmar o envio por lá. Se nada abriu, <a href="' + url + '" target="_blank" rel="noopener">toque aqui para abrir a conversa</a>.';
    });
  })();

  /* ---------- Botão flutuante ---------- */
  (function () {
    var fab = $('#fab'), hero = $('#inicio'), cta = $('#contato');
    var state = { hero: true, cta: false };
    function upd() { fab.classList.toggle('is-on', !state.hero && !state.cta); }
    var f = io(function (es) {
      es.forEach(function (e) { state[e.target === hero ? 'hero' : 'cta'] = e.isIntersecting; });
      upd();
    }, { threshold: 0.15 });
    if (f) { f.observe(hero); f.observe(cta); } else fab.classList.add('is-on');
  })();
})();
