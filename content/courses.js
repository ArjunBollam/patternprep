/* The kits shown on the home page, in display order. Lessons are added by the other content files. */
(function () {
  const G = '#22b07d', L = '#d9f7ea', D = '#1d3b2f';
  const box = (x, y, w, h, t, fill = '#fff', fs = 10) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${D}" stroke-width="1.2"/>` +
    (t ? `<text x="${x + w / 2}" y="${y + h / 2 + 3.5}" font-size="${fs}" text-anchor="middle" fill="${D}">${t}</text>` : '');
  const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${D}" stroke-width="1.2" marker-end="url(#a)"/>`;
  const svg = inner => `<svg viewBox="0 0 280 190" xmlns="http://www.w3.org/2000/svg" font-family="Inter, Helvetica, Arial, sans-serif">` +
    `<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="${D}"/></marker></defs>${inner}</svg>`;

  const art = {
    resume: svg(
      box(30, 14, 150, 166, '', '#fff') +
      `<circle cx="150" cy="40" r="14" fill="${L}" stroke="${D}"/>` +
      `<text x="42" y="38" font-size="12" font-weight="700" fill="${D}">Jordan Lee</text>` +
      [52, 60].map(y => `<rect x="42" y="${y}" width="80" height="4" rx="2" fill="#cfd8d3"/>`).join('') +
      `<text x="42" y="84" font-size="8" font-weight="700" fill="${D}">EXPERIENCE</text>` +
      [92, 100, 108, 122, 130].map((y, i) => `<rect x="${i % 3 ? 48 : 42}" y="${y}" width="${i % 2 ? 100 : 120}" height="4" rx="2" fill="#cfd8d3"/>`).join('') +
      `<text x="42" y="150" font-size="8" font-weight="700" fill="${D}">SKILLS</text>` +
      `<rect x="42" y="157" width="110" height="4" rx="2" fill="#cfd8d3"/>` +
      box(170, 70, 96, 40, '', L) + `<text x="178" y="86" font-size="9" fill="${D}">Start with impact:</text><text x="178" y="99" font-size="9" fill="${D}">"Cut latency 40%"</text>` +
      `<line x1="170" y1="90" x2="150" y2="100" stroke="${G}" stroke-width="1.5"/>`),
    coding: svg(
      `<text x="20" y="22" font-size="11" font-weight="700" fill="${D}">Two pointers</text>` +
      ['-5', '-2', '3', '4', '6'].map((v, i) => `<text x="${30 + i * 26}" y="62" font-size="14" font-family="monospace" fill="${D}">${v}</text><text x="${34 + i * 26}" y="76" font-size="8" fill="#999">${i}</text>`).join('') +
      box(24, 30, 30, 13, 'left', '#fff4f1', 8) + box(124, 30, 30, 13, 'right', '#fff', 8) +
      `<text x="160" y="22" font-size="11" font-weight="700" fill="${D}">Binary tree</text>` +
      [[215, 40], [185, 80], [245, 80], [170, 120], [200, 120]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="11" fill="${i === 1 ? L : '#fff'}" stroke="${D}"/><text x="${x}" y="${y + 4}" font-size="10" text-anchor="middle">${[8, 3, 10, 1, 6][i]}</text>`).join('') +
      `<path d="M209 49L191 71M221 49L239 71M180 90L174 110M190 90L196 110" stroke="${D}"/>` +
      `<text x="20" y="112" font-size="11" font-weight="700" fill="${D}">Sliding window</text>` +
      'abcba'.split('').map((c, i) => `<rect x="${22 + i * 22}" y="122" width="20" height="22" fill="${i > 0 && i < 4 ? L : '#fff'}" stroke="${D}"/><text x="${32 + i * 22}" y="137" font-size="11" text-anchor="middle">${c}</text>`).join('') +
      `<rect x="20" y="152" width="250" height="26" rx="5" fill="#f1f1f1" stroke="#aaa" stroke-dasharray="4 3"/><text x="30" y="169" font-size="10" font-family="monospace">sum = 9 &gt; 7  →  right -= 1</text>`),
    systemDesign: svg(
      box(10, 75, 52, 30, 'Client', L) + arrow(62, 90, 86, 90) + box(88, 75, 54, 30, 'LB') +
      arrow(142, 84, 170, 52) + arrow(142, 96, 170, 128) +
      box(172, 36, 60, 28, 'API 1') + box(172, 114, 60, 28, 'API 2') +
      `<path d="M240 70 a20 6 0 0 1 40 0 v34 a20 6 0 0 1 -40 0 z" fill="${L}" stroke="${D}"/><ellipse cx="260" cy="70" rx="20" ry="6" fill="#fff" stroke="${D}"/><text x="260" y="94" font-size="10" text-anchor="middle">DB</text>` +
      arrow(232, 54, 244, 70) + arrow(232, 126, 244, 106) +
      box(172, 158, 60, 24, 'Cache', '#fff4e5') + `<line x1="202" y1="142" x2="202" y2="158" stroke="${D}" stroke-dasharray="3 2"/>` +
      `<text x="12" y="24" font-size="11" font-weight="700" fill="${D}">Scale from 1 to 1M users</text>`),
    behavioral: svg(
      box(95, 70, 90, 40, 'BEHAVIORAL', G, 11).replace(`fill="${D}">BEHAVIORAL`, 'fill="#fff" font-weight="700">BEHAVIORAL') +
      [['Situation', 12, 18], ['Task', 190, 18], ['Action', 12, 150], ['Result', 190, 150], ['Conflict', 12, 84], ['Leadership', 196, 84]]
        .map(([t, x, y]) => box(x, y, t.length > 8 ? 78 : 72, 24, t, L)).join('') +
      `<path d="M84 30 L120 70 M190 30 L160 70 M84 162 L120 110 M190 162 L160 110 M84 96 L95 90 M196 96 L185 90" stroke="${D}" fill="none"/>`),
    ood: svg(
      box(20, 20, 110, 70, '') + `<text x="75" y="34" font-size="9" text-anchor="middle" fill="${D}">«interface»</text><text x="75" y="47" font-size="11" font-weight="700" text-anchor="middle">Vehicle</text><line x1="20" y1="54" x2="130" y2="54" stroke="${D}"/><text x="28" y="70" font-size="9">+ getSize(): Size</text>` +
      box(150, 20, 110, 70, '') + `<text x="205" y="40" font-size="11" font-weight="700" text-anchor="middle">ParkingLot</text><line x1="150" y1="50" x2="260" y2="50" stroke="${D}"/><text x="158" y="66" font-size="9">- spots: List</text><text x="158" y="80" font-size="9">+ park(v): Ticket</text>` +
      box(20, 125, 50, 30, 'Car', L) + box(80, 125, 50, 30, 'Truck', L) +
      `<path d="M45 125 L70 98 M105 125 L80 98" stroke="${D}" stroke-dasharray="4 2" fill="none"/><path d="M68 92 L75 90 L76 97" fill="none" stroke="${D}"/>` +
      box(170, 125, 80, 30, 'ParkingSpot', L) + `<line x1="210" y1="90" x2="210" y2="125" stroke="${D}"/><path d="M204 96 L210 90 L216 96 L210 102 Z" fill="${D}"/>`),
    ml: svg(
      ['Data', 'Features', 'Model', 'Eval', 'Serve'].map((t, i) => box(8 + i * 54, 70, 46, 30, t, i === 2 ? G : L, 9).replace(i === 2 ? `fill="${D}">Model` : 'x', i === 2 ? 'fill="#fff">Model' : 'x')).join('') +
      [0, 1, 2, 3].map(i => arrow(54 + i * 54, 85, 62 + i * 54, 85)).join('') +
      [0, 1, 2, 3, 4, 5].map(i => `<rect x="${110 + (i % 3) * 22}" y="${118 + Math.floor(i / 3) * 22}" width="18" height="18" fill="${['#cde', '#ecd', '#dec', '#edc', '#cee', '#eec'][i]}" stroke="${D}" stroke-width=".8"/>`).join('') +
      `<text x="140" y="178" font-size="9" text-anchor="middle">embeddings → nearest neighbours</text>` +
      `<text x="12" y="30" font-size="11" font-weight="700" fill="${D}">Frame it as an ML task</text><text x="12" y="48" font-size="9" fill="#555">input → model → ranked output</text>`),
    mobile: svg(
      `<rect x="100" y="10" width="80" height="170" rx="14" fill="#fff" stroke="${D}" stroke-width="1.5"/><rect x="128" y="18" width="24" height="4" rx="2" fill="${D}"/>` +
      box(110, 30, 60, 14, 'Navigator', G, 8).replace(`fill="${D}">Navigator`, 'fill="#fff">Navigator') +
      [52, 82, 112].map(y => `<rect x="110" y="${y}" width="60" height="24" rx="4" fill="${L}" stroke="${D}" stroke-width=".8"/><rect x="114" y="${y + 4}" width="16" height="16" rx="3" fill="#fff" stroke="${D}" stroke-width=".6"/><rect x="134" y="${y + 7}" width="30" height="3" fill="#9bb"/><rect x="134" y="${y + 14}" width="22" height="3" fill="#bcc"/>`).join('') +
      box(10, 60, 72, 26, 'Local cache', '#fff4e5', 9) + box(198, 60, 72, 26, 'REST / WS', L, 9) + box(198, 120, 72, 26, 'Push (APNs)', L, 9) +
      arrow(100, 73, 84, 73) + arrow(180, 73, 196, 73) + arrow(196, 133, 182, 133)),
    genai: svg(
      `<circle cx="28" cy="40" r="14" fill="${L}" stroke="${D}"/><text x="28" y="44" font-size="10" text-anchor="middle">🙂</text>` +
      box(52, 22, 100, 22, 'User prompt', '#fff', 9) + arrow(152, 33, 184, 33) +
      box(186, 14, 84, 40, 'LLM', G, 12).replace(`fill="${D}">LLM`, 'fill="#fff" font-weight="700">LLM') +
      box(186, 80, 84, 26, 'Retrieve docs', L, 9) + arrow(228, 80, 228, 56) +
      box(186, 140, 84, 26, 'Safety filter', '#fff4e5', 9) + `<path d="M270 34 Q290 90 270 150" fill="none" stroke="${D}" marker-end="url(#a)"/>` +
      box(52, 140, 100, 26, 'Final answer', '#fff', 9) + arrow(186, 153, 154, 153) + arrow(100, 140, 100, 46).replace('marker-end', 'stroke-dasharray="4 3" marker-end') +
      `<text x="20" y="104" font-size="9" fill="#555">iterate,</text><text x="20" y="116" font-size="9" fill="#555">evaluate,</text><text x="20" y="128" font-size="9" fill="#555">refine</text>`),
  };

  const kits = [
    { id: 'resume', title: 'How to Write a Good Resume', short: 'Resume', art: art.resume,
      blurb: 'From the hiring pipeline to ready-made templates: impact-first bullets, tailoring, before-and-after rewrites and common mistakes.' },
    { id: 'coding-interview-patterns', title: 'Coding Interview Patterns', short: 'Coding Patterns', art: art.coding, layout: 'sections',
      blurb: '19 patterns and 101 classic problems, each solved from brute force to optimal, with diagrams, test cases and Python, JavaScript and Java code.' },
    { id: 'system-design-interview', title: 'System Design Interview', short: 'System Design', art: art.systemDesign,
      blurb: 'A repeatable framework plus end-to-end designs: rate limiters, key-value stores, feeds, chat, video and more.' },
    { id: 'behavioral-interview', title: 'Behavioral Interview', short: 'Behavioral', art: art.behavioral, badge: 'New',
      blurb: 'What companies look for at each level, the STAR method, a story bank, every core competency and how to nail the interview day.' },
    { id: 'object-oriented-design-interview', title: 'Object-Oriented Design Interview', short: 'OOD', art: art.ood,
      blurb: 'A step-by-step framework, SOLID and design patterns, plus complete Java and Python designs for 12 classic systems.' },
    { id: 'machine-learning-system-design-interview', title: 'Machine Learning System Design Interview', short: 'ML System Design', art: art.ml,
      blurb: 'A 7-step framework and full designs for search, recommendation, ranking and content-moderation systems.' },
    { id: 'mobile-system-design-interview', title: 'Mobile System Design Interview', short: 'Mobile System Design', art: art.mobile,
      blurb: 'A framework, building blocks and full client designs: feeds, chat, trading, pagination, hotel booking, file sync, video and more.' },
    { id: 'generative-ai-system-design-interview', title: 'Generative AI System Design Interview', short: 'GenAI System Design', art: art.genai,
      blurb: 'LLM fundamentals, RAG, agents and safety, with designs for chatbots, translation, captioning, faces, high-resolution images and video.' },
  ];
  kits.forEach(k => K.course(k));
})();
