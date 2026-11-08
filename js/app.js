/*
 * PatternPrep: home page, kit pages, renderer, router and sidebar.
 * Works straight from file:// (no fetch, no modules).
 */
(function () {
  'use strict';
  const K = window.K;
  const COURSES = K.courses;

  // ------------------------------------------------------------------ helpers
  const esc = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const pad = n => String(n).padStart(2, '0');

  function math(src) {
    const sups = [];
    src = src.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\([a-zA-Z]+)/g, '$1'); // allow TeX-style \text{...} and \log
    let s = src.replace(/\^\{([^}]*)\}|\^([\w.]+)/g, (m, a, b) => { sups.push(a || b); return '\u0001' + (sups.length - 1) + '\u0002'; });
    s = esc(s).replace(/(^|[^\w&;])([a-zA-Z])(?![\w])/g, '$1<i>$2</i>');
    return s.replace(/\u0001(\d+)\u0002/g, (m, i) => '<sup>' + esc(sups[i]).replace(/\b([a-zA-Z])\b/g, '<i>$1</i>') + '</sup>');
  }

  /** Inline formatting: **bold**, *italic*, `code`, $math$, [text](#/route) */
  function fmt(text) {
    if (text == null) return '';
    const keep = [];
    const stash = html => { keep.push(html); return '\u0000' + (keep.length - 1) + '\u0000'; };
    let s = String(text)
      .replace(/`([^`]+)`/g, (m, c) => stash('<code class="chip">' + esc(c) + '</code>'))
      .replace(/\$([^$\n]+)\$/g, (m, c) => stash('<span class="math">' + math(c) + '</span>'));
    s = esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((#[^)\s]+)\)/g, '<a href="$2">$1</a>');
    return s.replace(/\u0000(\d+)\u0000/g, (m, i) => keep[i]);
  }

  // ----------------------------------------------------------- syntax colour
  const words = s => new Set(s.split(/\s+/));
  const KW = {
    py: words('and as assert break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield async await'),
    js: words('break case catch class const continue default delete do else export extends false finally for function if in instanceof let new null of return static super switch this throw true try typeof undefined var void while yield async await'),
    java: words('abstract boolean break byte case catch char class continue default do double else enum extends false final finally float for if implements import instanceof int interface long new null private protected public record return short static super switch synchronized this throw throws true try void while var'),
    kt: words('as break class companion continue data do else false for fun if in interface is null object override private protected return sealed super suspend this throw true try val var when while'),
    swift: words('actor as async await break case class continue default do else enum extension false for func guard if import in init let nil private protocol public return self static struct switch throw throws true try var where while'),
    sql: words('SELECT FROM WHERE JOIN LEFT RIGHT INNER ON GROUP BY ORDER LIMIT INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE INDEX PRIMARY KEY NOT NULL AND OR AS DESC ASC UNIQUE REFERENCES BIGINT INT VARCHAR TEXT TIMESTAMP DECIMAL BOOLEAN DEFAULT'),
    text: new Set(),
  };
  const BUILTIN = {
    py: words('len range print int str float list dict set tuple min max abs sum sorted enumerate zip map filter reversed any all ord chr List Dict Set Tuple Optional deque heapq defaultdict Counter isinstance divmod iter next object self bool random bisect math time threading Enum dataclass'),
    js: words('Math Array Map Set Object Number String Infinity console JSON parseInt BigInt Promise Date'),
    java: words('String Integer Math List ArrayList Map HashMap Set HashSet Deque ArrayDeque Queue LinkedList PriorityQueue Arrays Collections StringBuilder Character Long Double Boolean Object Random TreeMap Iterator Comparator Objects Optional UUID Instant Duration LocalDateTime ConcurrentHashMap'),
    kt: words('String Int Long List MutableList Map Flow StateFlow println'),
    swift: words('String Int Double Bool Array Dictionary URL Data Task'),
    sql: new Set(), text: new Set(),
  };
  const TOKEN = {
    py: /(#.*)|("""[\s\S]*?"""|'''[\s\S]*?'''|[rfb]?"(?:\\.|[^"\\\n])*"|[rfb]?'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?\b)|(@\w+)|([A-Za-z_]\w*)/g,
    js: /(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?[nLl]?\b)|(@\w+)|([A-Za-z_$][\w$]*)/g,
    sql: /(--.*)|('(?:''|[^'])*')|(\b\d+(?:\.\d+)?\b)|(@\w+)|([A-Za-z_]\w*)/g,
  };
  TOKEN.java = TOKEN.kt = TOKEN.swift = TOKEN.js;

  function highlight(code, lang) {
    if (lang === 'text') return esc(code);
    const re = new RegExp(TOKEN[lang].source, 'g');
    let out = '', last = 0, m, prevWord = '';
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      last = re.lastIndex;
      const [tok, com, str, num, deco, id] = m;
      let cls = '';
      if (com) cls = 'c';
      else if (str) cls = 's';
      else if (num) cls = 'n';
      else if (deco) cls = 'd';
      else if (id) {
        const after = code.slice(last).match(/^\s*(\(|<[\w<>, ]*>\s*\()/);
        if (KW[lang].has(lang === 'sql' ? id.toUpperCase() : id)) cls = 'k';
        else if (['def', 'function', 'class', 'fun', 'func', 'interface', 'enum', 'struct'].includes(prevWord)) cls = 'f';
        else if (BUILTIN[lang].has(id)) cls = 'b';
        else if (after) cls = 'f';
        else if (/^[A-Z]/.test(id) && lang !== 'py') cls = 'b';
        else cls = 'v';
        prevWord = id;
      }
      if (!id) prevWord = '';
      out += '<span class="t' + cls + '">' + esc(tok) + '</span>';
    }
    return out + esc(code.slice(last));
  }

  // --------------------------------------------------------------- diagrams
  function frame(inner, b) {
    return '<figure class="dg' + (b.center ? ' center' : '') + '">' +
      (b.cap ? '<figcaption>' + fmt(b.cap) + '</figcaption>' : '') +
      '<div class="dgrow">' + inner + (b.state ? '<div class="state">' + fmt(b.state) + '</div>' : '') + '</div></figure>';
  }

  function pointerMap(b) {
    const at = {};
    for (const [label, i] of Object.entries(b.p || {})) (at[i] = at[i] || []).push(label);
    const max = Math.max(0, ...Object.values(at).map(a => a.length));
    return { at, height: max ? max * 24 + 18 : 0, on: new Set([].concat(b.on || [])) };
  }

  function tags(labels, on) {
    if (!labels || !labels.length) return '';
    const hot = labels.some(l => on.has(l));
    return labels.map(l => '<span class="tag' + (on.has(l) ? ' on' : '') + '">' + esc(l) + '</span>').join('') +
      '<span class="down' + (hot ? ' on' : '') + '"></span>';
  }

  const col = (ptrs, h, v, ix, cls) =>
    '<div class="col ' + (cls || '') + '"><div class="ptrs" style="height:' + h + 'px">' + ptrs +
    '</div><div class="v">' + v + '</div><div class="ix">' + (ix == null ? '' : ix) + '</div></div>';

  function renderArr(b) {
    const isStr = typeof b.values === 'string';
    const vals = isStr ? b.values.split('') : b.values;
    const pm = pointerMap(b);
    const hl = new Set(b.hl || []), hl2 = new Set(b.hl2 || []), dim = new Set(b.dim || []);
    const brackets = b.br !== undefined ? b.br : !isStr;
    let html = '';
    if (b.name) html += col('', pm.height, esc(b.name) + '&nbsp;=&nbsp;', '', 'name');
    if (brackets) html += col('', pm.height, '[', '', 'br');
    vals.forEach((v, i) => {
      const cls = (hl.has(i) ? 'hl ' : '') + (hl2.has(i) ? 'hl2 ' : '') + (dim.has(i) ? 'dim ' : '') + (isStr ? 'ch' : '');
      const shown = v === null ? 'null' : (isStr && v === ' ' ? '&nbsp;' : esc(v));
      html += col(tags(pm.at[i], pm.on), pm.height, shown, b.noIdx ? '' : i, cls);
    });
    if (pm.at[vals.length]) html += col(tags(pm.at[vals.length], pm.on), pm.height, '&nbsp;', b.noIdx ? '' : vals.length, 'ghost');
    if (brackets) html += col('', pm.height, ']', '', 'br');
    return frame('<div class="arr">' + html + '</div>', b);
  }

  function renderLL(b) {
    const pm = pointerMap(b);
    const hl = new Set(b.hl || []), hl2 = new Set(b.hl2 || []), dim = new Set(b.dim || []);
    const arrows = b.arrows || [];
    let html = '';
    b.values.forEach((v, i) => {
      const cls = 'node ' + (hl.has(i) ? 'hl ' : '') + (hl2.has(i) ? 'hl2 ' : '') + (dim.has(i) ? 'dim' : '');
      html += col(tags(pm.at[i], pm.on), pm.height, '<span class="box">' + esc(v) + '</span>', '', cls);
      if (i < b.values.length - 1) html += col('', pm.height, arrows[i] === undefined ? '→' : esc(arrows[i]), '', 'link');
    });
    if (b.cycleTo !== undefined) html += col('', pm.height, '↩', '', 'link') + col('', pm.height, '<span class="tail">(back to ' + esc(b.values[b.cycleTo]) + ')</span>', '', 'link');
    else if (b.tail !== false) {
      html += col('', pm.height, '→', '', 'link') +
        col(tags(pm.at[b.values.length], pm.on), pm.height, '<span class="tail">' + esc(b.tail || 'null') + '</span>', '', 'link');
    }
    if (b.head) html = col(tags(pm.at[-1], pm.on), pm.height, '<span class="tail">' + esc(b.head) + '</span>', '', 'link') + col('', pm.height, esc(b.headArrow || '→'), '', 'link') + html;
    return frame('<div class="arr ll">' + html + '</div>', b);
  }

  function renderGrid(b) {
    const key = rc => rc[0] + ',' + rc[1];
    const hl = new Set((b.hl || []).map(key)), hl2 = new Set((b.hl2 || []).map(key)), dim = new Set((b.dim || []).map(key));
    let html = '<table class="grid">';
    if (b.cols) html += '<tr>' + (b.rowsLabels ? '<th></th>' : '') + b.cols.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr>';
    b.rows.forEach((row, r) => {
      html += '<tr>' + (b.rowsLabels ? '<th>' + esc(b.rowsLabels[r]) + '</th>' : '');
      row.forEach((v, c) => {
        const k = r + ',' + c;
        const cls = (hl.has(k) ? 'hl ' : '') + (hl2.has(k) ? 'hl2 ' : '') + (dim.has(k) ? 'dim' : '');
        html += '<td class="' + cls + '">' + esc(v === null ? '' : v) + '</td>';
      });
      html += '</tr>';
    });
    return frame(html + '</table>', b);
  }

  function renderTree(b) {
    const lv = b.level;
    if (!lv.length || lv[0] == null) return frame('<div class="tail">(empty tree)</div>', b);
    const root = { v: lv[0] };
    const queue = [root];
    let i = 1;
    while (queue.length && i < lv.length) {
      const n = queue.shift();
      if (i < lv.length) { if (lv[i] != null) { n.l = { v: lv[i] }; queue.push(n.l); } i++; }
      if (i < lv.length) { if (lv[i] != null) { n.r = { v: lv[i] }; queue.push(n.r); } i++; }
    }
    const list = [];
    let rank = 0, maxD = 0;
    (function walk(n, d) {
      if (!n) return;
      walk(n.l, d + 1); n.x = rank++; n.d = d; maxD = Math.max(maxD, d); list.push(n); walk(n.r, d + 1);
    })(root, 0);
    const W = 46, H = 62, R = 18, P = 6;
    const X = n => P + R + n.x * W, Y = n => P + R + n.d * H;
    const hl = new Set((b.hl || []).map(String)), hl2 = new Set((b.hl2 || []).map(String));
    let edges = '', nodes = '';
    list.forEach(n => {
      [n.l, n.r].forEach(c => { if (c) edges += '<line x1="' + X(n) + '" y1="' + Y(n) + '" x2="' + X(c) + '" y2="' + Y(c) + '"/>'; });
      const cls = hl.has(String(n.v)) ? 'hl' : hl2.has(String(n.v)) ? 'hl2' : '';
      nodes += '<g class="' + cls + '"><circle cx="' + X(n) + '" cy="' + Y(n) + '" r="' + R + '"/><text x="' + X(n) + '" y="' + (Y(n) + 5) + '">' + esc(n.v) + '</text></g>';
    });
    const w = 2 * (P + R) + (rank - 1) * W, h = 2 * (P + R) + maxD * H;
    return frame('<svg class="tree" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + edges + nodes + '</svg>', b);
  }

  const MARKERS = '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker>' +
    '<marker id="ahh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#e8553e"/></marker></defs>';

  function renderGraph(b) {
    const pts = Object.values(b.nodes);
    const S = b.scale || 70, R = 18, P = 8;
    const minX = Math.min(...pts.map(p => p[0])), minY = Math.min(...pts.map(p => p[1]));
    const pos = {};
    for (const [id, [x, y]] of Object.entries(b.nodes)) pos[id] = [P + R + (x - minX) * S, P + R + (y - minY) * S];
    const w = Math.max(...Object.values(pos).map(p => p[0])) + R + P, h = Math.max(...Object.values(pos).map(p => p[1])) + R + P;
    const hl = new Set((b.hl || []).map(String)), hl2 = new Set((b.hl2 || []).map(String)), hlE = new Set(b.hlE || []);
    let edges = '', nodes = '';
    (b.edges || []).forEach(([a, c, wt]) => {
      const [x1, y1] = pos[a], [x2, y2] = pos[c];
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const hot = hlE.has(a + '-' + c) || (!b.directed && hlE.has(c + '-' + a));
      edges += '<line class="' + (hot ? 'hot' : '') + '" x1="' + (x1 + ux * R) + '" y1="' + (y1 + uy * R) + '" x2="' + (x2 - ux * (R + (b.directed ? 4 : 0))) + '" y2="' + (y2 - uy * (R + (b.directed ? 4 : 0))) + '"' + (b.directed ? ' marker-end="url(#ah' + (hot ? 'h' : '') + ')"' : '') + '/>';
      if (wt !== undefined) edges += '<text class="wt" x="' + ((x1 + x2) / 2 - uy * 11) + '" y="' + ((y1 + y2) / 2 + ux * 11 + 4) + '">' + esc(wt) + '</text>';
    });
    for (const [id, [x, y]] of Object.entries(pos)) {
      const cls = hl.has(id) ? 'hl' : hl2.has(id) ? 'hl2' : '';
      nodes += '<g class="' + cls + '"><circle cx="' + x + '" cy="' + y + '" r="' + R + '"/><text x="' + x + '" y="' + (y + 5) + '">' + esc(id) + '</text></g>';
    }
    return frame('<svg class="graph" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + MARKERS + edges + nodes + '</svg>', b);
  }

  function renderBars(b) {
    const iv = b.intervals;
    const lo = Math.min(...iv.map(x => x[0])), hi = Math.max(...iv.map(x => x[1]));
    const U = Math.max(22, Math.min(46, 520 / Math.max(1, hi - lo))), P = 70, RH = 30;
    const hl = new Set(b.hl || []), hl2 = new Set(b.hl2 || []), dim = new Set(b.dim || []);
    const w = P + (hi - lo) * U + 30, h = iv.length * RH + 34;
    let s = '';
    for (let t = lo; t <= hi; t++) {
      const x = P + (t - lo) * U;
      s += '<line class="gridline" x1="' + x + '" y1="4" x2="' + x + '" y2="' + (h - 24) + '"/><text class="tick" x="' + x + '" y="' + (h - 8) + '">' + t + '</text>';
    }
    iv.forEach(([a, c], i) => {
      const y = 6 + i * RH;
      const cls = hl.has(i) ? 'hl' : hl2.has(i) ? 'hl2' : dim.has(i) ? 'dim' : '';
      s += '<text class="lab" x="' + (P - 10) + '" y="' + (y + 15) + '">[' + a + ', ' + c + ']</text>' +
        '<rect class="' + cls + '" x="' + (P + (a - lo) * U) + '" y="' + y + '" width="' + Math.max(4, (c - a) * U) + '" height="20" rx="5"/>';
    });
    return frame('<svg class="bars" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + s + '</svg>', b);
  }

  /** Architecture diagram: boxes on a grid, arrows between them. */
  function renderFlow(b) {
    const UX = b.ux || 170, UY = b.uy || 92, BW = b.bw || 132, BH = b.bh || 50, P = 14;
    const pos = {};
    let maxX = 0, maxY = 0;
    for (const [id, n] of Object.entries(b.nodes)) {
      const w = n[4] || BW;
      const cx = P + n[0] * UX + BW / 2, cy = P + n[1] * UY + BH / 2;
      pos[id] = { cx, cy, w, h: BH, label: n[2] == null ? id : n[2], kind: n[3] || 'service' };
      maxX = Math.max(maxX, cx + w / 2); maxY = Math.max(maxY, cy + BH / 2);
    }
    const W = maxX + P, H = maxY + P;
    const clip = (n, dx, dy) => {
      const tx = dx ? (n.w / 2) / Math.abs(dx) : Infinity, ty = dy ? (n.h / 2 + (n.kind === 'db' ? 4 : 0)) / Math.abs(dy) : Infinity;
      const t = Math.min(tx, ty);
      return [n.cx + dx * t, n.cy + dy * t];
    };
    let edges = '';
    (b.edges || []).forEach(([a, c, label, opt]) => {
      const A = pos[a], C = pos[c];
      if (!A || !C) throw new Error('flow: unknown node ' + (A ? c : a));
      const dx = C.cx - A.cx, dy = C.cy - A.cy;
      const [x1, y1] = clip(A, dx, dy), [x2, y2] = clip(C, -dx, -dy);
      const dash = opt === 'dash' || opt === 'dashboth' ? ' stroke-dasharray="5 4"' : '';
      const both = opt === 'both' || opt === 'dashboth' ? ' marker-start="url(#ah)"' : '';
      edges += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + dash + both + ' marker-end="url(#ah)"/>';
      if (label) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const lines = String(label).split('\n');
        edges += '<text class="el" x="' + mx + '" y="' + (my - (lines.length - 1) * 6 + 4) + '">' +
          lines.map((t, i) => '<tspan x="' + mx + '" dy="' + (i ? 13 : 0) + '">' + esc(t) + '</tspan>').join('') + '</text>';
      }
    });
    let nodes = '';
    for (const n of Object.values(pos)) {
      const x = n.cx - n.w / 2, y = n.cy - n.h / 2;
      let shape;
      if (n.kind === 'db') {
        const ry = 7;
        shape = '<path class="db" d="M' + x + ',' + (y + ry) + ' a' + n.w / 2 + ',' + ry + ' 0 0 1 ' + n.w + ',0 v' + (n.h - ry) + ' a' + n.w / 2 + ',' + ry + ' 0 0 1 ' + (-n.w) + ',0 z"/>' +
          '<ellipse class="db" cx="' + n.cx + '" cy="' + (y + ry) + '" rx="' + n.w / 2 + '" ry="' + ry + '"/>';
      } else if (n.kind === 'queue') {
        shape = '<rect class="queue" x="' + x + '" y="' + y + '" width="' + n.w + '" height="' + n.h + '" rx="4"/>' +
          [1, 2, 3].map(i => '<line class="qline" x1="' + (x + n.w - i * 6) + '" y1="' + (y + 4) + '" x2="' + (x + n.w - i * 6) + '" y2="' + (y + n.h - 4) + '"/>').join('');
      } else {
        shape = '<rect class="' + n.kind + '" x="' + x + '" y="' + y + '" width="' + n.w + '" height="' + n.h + '" rx="' + (n.kind === 'client' ? 22 : 7) + '"/>';
      }
      const lines = String(n.label).split('\n');
      const ty = n.cy + (n.kind === 'db' ? 6 : 4) - (lines.length - 1) * 7;
      nodes += '<g>' + shape + '<text class="nl" x="' + n.cx + '" y="' + ty + '">' +
        lines.map((t, i) => '<tspan x="' + n.cx + '" dy="' + (i ? 14 : 0) + '"' + (i ? ' class="sub"' : '') + '>' + esc(t) + '</tspan>').join('') + '</text></g>';
    }
    return frame('<svg class="flow" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + MARKERS + edges + nodes + '</svg>', Object.assign({ center: true }, b));
  }

  // ------------------------------------------------------------------ blocks
  const LANG_NAMES = { py: 'Python', js: 'JavaScript', java: 'Java', kt: 'Kotlin', swift: 'Swift', sql: 'SQL', text: 'Text' };
  let exampleNo = 0;

  function preferredLang() {
    try { return localStorage.getItem('pp-lang') || 'py'; } catch (e) { return 'py'; }
  }

  function renderCode(b) {
    const langs = Object.keys(LANG_NAMES).filter(k => b[k] != null);
    const pref = preferredLang();
    const cur = langs.includes(pref) ? pref : langs[0];
    const tabs = langs.map(k => '<button class="tab' + (k === cur ? ' active' : '') + '" data-lang="' + k + '" role="tab">' + LANG_NAMES[k] + '</button>').join('');
    const panes = langs.map(k => '<pre class="pane' + (k === cur ? ' active' : '') + '" data-lang="' + k + '"><code>' + highlight(b[k], k) + '</code></pre>').join('');
    return '<div class="codebox"><div class="tabs" role="tablist">' + tabs +
      '<button class="copy" title="Copy code" aria-label="Copy code"><svg viewBox="0 0 24 24" width="17" height="17"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg><span class="copied">Copied!</span></button></div>' +
      panes + '</div>';
  }

  function renderBlock(b) {
    switch (b.type) {
      case 'p': return '<p>' + fmt(b.text) + '</p>';
      case 'h2': return '<h2>' + fmt(b.text) + '</h2>';
      case 'h3': return '<h3>' + fmt(b.text) + '</h3>';
      case 'ul': return '<ul>' + b.items.map(i => '<li>' + fmt(i) + '</li>').join('') + '</ul>';
      case 'ol': return '<ol>' + b.items.map(i => '<li>' + fmt(i) + '</li>').join('') + '</ol>';
      case 'note': return '<div class="note">' + fmt(b.text) + '</div>';
      case 'hr': return '<hr>';
      case 'fig': return '<p class="figcap">' + fmt(b.text) + '</p>';
      case 'talk': return '<div class="talk">' + b.lines.map(([who, text]) => '<p><strong>' + esc(who) + '</strong>: ' + fmt(text) + '</p>').join('') + '</div>';
      case 'table': return '<div class="tblwrap"><table class="tbl"><thead><tr>' + b.head.map(x => '<th>' + fmt(x) + '</th>').join('') + '</tr></thead><tbody>' +
        b.rows.map(r => '<tr>' + r.map(x => '<td>' + fmt(x) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
      case 'example':
        exampleNo++;
        return '<h3>Example ' + exampleNo + ':</h3><div class="example"><div><span>Input:</span> ' + esc(b.input) + '</div><div><span>Output:</span> ' + esc(b.output) + '</div></div>' +
          (b.explanation ? '<p class="expl">Explanation: ' + fmt(b.explanation) + '</p>' : '');
      case 'arr': return renderArr(b);
      case 'll': return renderLL(b);
      case 'grid': return renderGrid(b);
      case 'tree': return renderTree(b);
      case 'graph': return renderGraph(b);
      case 'bars': return renderBars(b);
      case 'flow': return renderFlow(b);
      case 'pre': return '<pre class="ascii">' + esc(b.text) + '</pre>';
      case 'state': return '<div class="dg"><div class="state">' + fmt(b.state || b.text) + '</div></div>';
      case 'row': return '<div class="dgline">' + b.items.map(renderBlock).join('') + '</div>';
      case 'code': return renderCode(b);
      case 'cx': return '<ul class="cx"><li><strong>Time complexity:</strong> ' + fmt(b.time) + '</li><li><strong>Space complexity:</strong> ' + fmt(b.space) + '</li>' +
        (b.extra ? '<li>' + fmt(b.extra) + '</li>' : '') + '</ul>';
      case 'tests': return '<div class="tblwrap"><table class="tbl tests"><thead><tr><th>Input</th><th>Expected output</th><th>What it checks</th></tr></thead><tbody>' +
        b.rows.map(r => '<tr><td><code class="chip">' + esc(r[0]) + '</code></td><td><code class="chip">' + esc(r[1]) + '</code></td><td>' + fmt(r[2]) + '</td></tr>').join('') +
        '</tbody></table></div>';
      default: throw new Error('Unknown block type: ' + b.type);
    }
  }

  // ------------------------------------------------------------------ course
  const ALL = [];
  const SECTION_TO_COURSE = {};
  COURSES.forEach(c => {
    c.lessons = [];
    if (c.layout === 'sections') {
      c.sections.forEach((s, si) => {
        s.num = pad(si + 1);
        SECTION_TO_COURSE[s.id] = c.id;
        s.lessons.forEach(l => { l.section = s; l.course = c; l.route = '#/' + c.id + '/' + s.id + '/' + l.id; c.lessons.push(l); });
      });
    } else {
      c.chapters.forEach((l, i) => { l.num = pad(i + 1); l.course = c; l.route = '#/' + c.id + '/' + l.id; c.lessons.push(l); });
    }
    ALL.push(...c.lessons);
  });

  // completion tracking
  let done = new Set();
  try { done = new Set(JSON.parse(localStorage.getItem('pp-done') || '[]')); } catch (e) { /* ignore */ }
  const saveDone = () => { try { localStorage.setItem('pp-done', JSON.stringify([...done])); } catch (e) { /* ignore */ } };
  const doneCount = c => c.lessons.filter(l => done.has(l.route)).length;

  function renderLesson(lesson) {
    exampleNo = 0;
    const list = lesson.course.lessons;
    const idx = list.indexOf(lesson);
    const prev = list[idx - 1], next = list[idx + 1];
    const body = [lesson.body].flat(Infinity).map(renderBlock).join('\n');
    const head = lesson.section
      ? '<div class="crumb">' + lesson.section.num + ' · ' + esc(lesson.section.title) + '</div><h1>' + esc(lesson.title) + '</h1>'
      : '<div class="bignum">' + lesson.num + '</div><h1 class="chap">' + esc(lesson.title) + '</h1>';
    const isDone = done.has(lesson.route);
    const complete = '<div class="complete"><button class="mark' + (isDone ? ' is-done' : '') + '" data-route="' + lesson.route + '">' +
      (isDone ? '✓ Completed' : 'Mark as complete') + '</button></div>';
    const nav = '<nav class="pager">' +
      (prev ? '<a class="prev" href="' + prev.route + '"><small>Previous</small>' + esc(prev.title) + '</a>' : '<span></span>') +
      (next ? '<a class="next" href="' + next.route + '"><small>Next</small>' + esc(next.title) + '</a>' : '<a class="next" href="#/"><small>Finished this kit</small>Back to all kits</a>') + '</nav>';
    return head + body + complete + nav;
  }

  const CHEV = '<svg class="go" viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l6 6-6 6"/></svg>';

  function renderSidebar(course) {
    const n = course.lessons.length, d = doneCount(course);
    let html = '<div class="side-head"><a class="back" href="#/">← All kits</a><div class="side-title">' + esc(course.title) + '</div>' +
      '<div class="side-progress">' + d + '/' + n + ' completed</div><div class="bar"><span style="width:' + (n ? (100 * d / n) : 0) + '%"></span></div></div>';
    if (course.layout === 'sections') {
      html += course.sections.map(s =>
        '<div class="sec" data-sec="' + s.id + '"><button class="sec-head" aria-expanded="true"><span><b>' + s.num + '</b> ' + esc(s.title) + '</span>' +
        '<svg class="chev" viewBox="0 0 24 24" width="16" height="16"><path d="M6 15l6-6 6 6"/></svg></button><ul class="items">' +
        s.lessons.map(l => '<li><a href="' + l.route + '" data-route="' + l.route + '"' + (done.has(l.route) ? ' class="done"' : '') + '>' + esc(l.title) + '</a></li>').join('') +
        '</ul></div>').join('');
    } else {
      html += '<ul class="chapters">' + course.lessons.map(l =>
        '<li><a href="' + l.route + '" data-route="' + l.route + '"' + (done.has(l.route) ? ' class="done"' : '') + '><span class="cn">' + l.num + '</span><span class="ct">' + esc(l.title) + '</span>' +
        (done.has(l.route) ? '<span class="ok">✓</span>' : CHEV) + '</a></li>').join('') + '</ul>';
    }
    return html;
  }

  function renderHome() {
    const total = ALL.length;
    const cards = COURSES.filter(c => c.lessons.length).map(c =>
      '<a class="kit" href="' + c.lessons[0].route + '">' + (c.badge ? '<span class="badge">' + esc(c.badge) + '</span>' : '') +
      '<div class="kit-title">' + esc(c.title) + '</div><div class="kit-art">' + c.art + '</div>' +
      '<div class="kit-foot"><p>' + esc(c.blurb) + '</p><div class="kit-meta"><span>' + c.lessons.length + ' lessons</span>' +
      (doneCount(c) ? '<span class="kit-done">' + doneCount(c) + ' done</span>' : '') + '<span class="kit-go">Start →</span></div></div></a>').join('');
    return '<section class="hero"><div class="hero-in">' +
      '<div class="eyebrow">Free, offline study notes</div>' +
      '<h1>Prepare for every round of the <span class="hl-word">tech interview</span></h1>' +
      '<p class="lead">Coding patterns, system design, machine learning, mobile, generative AI, object-oriented design, behavioral rounds and your resume: ' +
      total + ' lessons with diagrams, worked examples and code, all in one place.</p>' +
      '<div class="cta"><button class="btn primary" data-scroll="kits">Browse the kits</button><a class="btn ghost" href="' + COURSES[1].lessons[1].route + '">Try a sample lesson</a></div>' +
      '<div class="stats"><div><b>' + COURSES.length + '</b><span>prep kits</span></div><div><b>' + total + '</b><span>lessons</span></div>' +
      '<div><b>3</b><span>coding languages</span></div><div><b>0</b><span>paywalls</span></div></div></div></section>' +
      '<section class="kits" id="kits"><h2 class="section-title"><span>All-in-one kit for end-to-end interview prep</span></h2>' +
      '<div class="kit-grid">' + cards + '</div></section>' +
      '<section class="how"><h2 class="section-title"><span>How to use these notes</span></h2><div class="steps">' +
      '<div class="step"><b>1</b><h3>Pick the round</h3><p>Start with the kit that matches your next interview. Each one opens with a framework you can reuse on any question.</p></div>' +
      '<div class="step"><b>2</b><h3>Work through examples</h3><p>Every lesson walks through a full example with diagrams. Try to sketch the answer yourself before reading the solution.</p></div>' +
      '<div class="step"><b>3</b><h3>Track your progress</h3><p>Mark lessons complete as you go. Progress is saved in this browser, so you can pick up where you left off.</p></div>' +
      '</div></section><footer class="foot">PatternPrep · personal study notes · progress is stored locally in your browser</footer>';
  }

  // expose for tests / tooling
  window.PP = { ALL, COURSES, renderLesson, renderSidebar, renderHome, highlight, fmt };

  if (typeof document === 'undefined' || !document.getElementById) return;

  // -------------------------------------------------------------------- DOM
  const $ = s => document.querySelector(s);
  const sidebar = $('#sidebar'), lessonEl = $('#lesson'), homeEl = $('#home');

  const COLLAPSE_KEY = 'pp-collapsed';
  let collapsed = {};
  try { collapsed = JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '{}'); } catch (e) { /* ignore */ }
  function applyCollapsed() {
    sidebar.querySelectorAll('.sec').forEach(el => {
      const c = !!collapsed[el.dataset.sec];
      el.classList.toggle('collapsed', c);
      el.querySelector('.sec-head').setAttribute('aria-expanded', String(!c));
    });
  }

  sidebar.addEventListener('click', e => {
    const head = e.target.closest('.sec-head');
    if (head) {
      const id = head.parentElement.dataset.sec;
      collapsed[id] = !collapsed[id];
      try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed)); } catch (err) { /* ignore */ }
      applyCollapsed();
    }
    if (e.target.closest('a')) document.body.classList.remove('nav-open');
  });

  $('.menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $('.scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));

  let currentCourse = null;
  function showSidebar(course, lesson) {
    if (currentCourse !== course) {
      sidebar.innerHTML = renderSidebar(course);
      sidebar.scrollTop = 0;
      currentCourse = course;
      applyCollapsed();
    }
    sidebar.querySelectorAll('a.active').forEach(a => a.classList.remove('active'));
    const link = sidebar.querySelector('a[data-route="' + lesson.route + '"]');
    if (link) {
      link.classList.add('active');
      if (lesson.section && collapsed[lesson.section.id]) { collapsed[lesson.section.id] = false; applyCollapsed(); }
      const r = link.getBoundingClientRect(), sr = sidebar.getBoundingClientRect();
      if (r.top < sr.top || r.bottom > sr.bottom) link.scrollIntoView({ block: 'center' });
    }
  }

  function route() {
    const hash = location.hash || '#/';
    const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!parts.length) {
      document.body.classList.add('home');
      document.body.classList.remove('nav-open');
      homeEl.innerHTML = renderHome();
      lessonEl.innerHTML = '';
      currentCourse = null;
      document.title = 'PatternPrep · Interview prep kits';
      window.scrollTo(0, 0);
      return;
    }
    // old links like #/two-pointers/pair-sum-sorted
    if (SECTION_TO_COURSE[parts[0]]) { location.replace('#/' + SECTION_TO_COURSE[parts[0]] + '/' + parts.join('/')); return; }
    const course = K.byId[parts[0]];
    if (!course || !course.lessons.length) { location.replace('#/'); return; }
    let lesson = ALL.find(l => l.route === hash);
    if (!lesson) {
      lesson = (parts[1] && course.lessons.find(l => l.section && l.section.id === parts[1])) || course.lessons[0];
      history.replaceState(null, '', lesson.route);
    }
    document.body.classList.remove('home');
    homeEl.innerHTML = '';
    lessonEl.innerHTML = renderLesson(lesson);
    document.title = lesson.title + ' · ' + course.short + ' · PatternPrep';
    showSidebar(course, lesson);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();

  homeEl.addEventListener('click', e => {
    const s = e.target.closest('[data-scroll]');
    if (s) document.getElementById(s.dataset.scroll).scrollIntoView({ behavior: 'smooth' });
  });

  // code tabs, copy, mark complete (event delegation)
  lessonEl.addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) {
      const lang = tab.dataset.lang;
      try { localStorage.setItem('pp-lang', lang); } catch (err) { /* ignore */ }
      lessonEl.querySelectorAll('.codebox').forEach(box => {
        if (!box.querySelector('.pane[data-lang="' + lang + '"]')) return;
        box.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.lang === lang));
        box.querySelectorAll('.pane').forEach(p => p.classList.toggle('active', p.dataset.lang === lang));
      });
      return;
    }
    const copy = e.target.closest('.copy');
    if (copy) {
      const text = copy.closest('.codebox').querySelector('.pane.active').textContent;
      const ok = () => { copy.classList.add('done'); setTimeout(() => copy.classList.remove('done'), 1400); };
      const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (err) { /* ignore */ }
        ta.remove(); ok();
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback);
      else fallback();
      return;
    }
    const mark = e.target.closest('.mark');
    if (mark) {
      const r = mark.dataset.route;
      if (done.has(r)) done.delete(r); else done.add(r);
      saveDone();
      mark.classList.toggle('is-done', done.has(r));
      mark.textContent = done.has(r) ? '✓ Completed' : 'Mark as complete';
      const lesson = ALL.find(l => l.route === r);
      currentCourse = null; // re-render the sidebar with the new progress
      showSidebar(lesson.course, lesson);
    }
  });
})();
