/*
 * Tiny authoring DSL used by the files in content/.
 *
 *   K.course({ id, title, layout: 'sections' | 'chapters', ... })   (content/courses.js)
 *   K.section({ id, title, lessons: [...] })      → adds a section to the coding-patterns kit
 *   K.chapters('course-id', [{ id, title, body }], { after: 'chapter-id' }?) → adds numbered chapters to a kit
 *
 * Lessons are made of "blocks" (plain objects); app.js turns them into HTML.
 * Inline text formatting (inside any text string):
 *   **bold**   *italic*   `code chip`   $O(n^2)$ (math)   [link](#/course/lesson)
 */
window.K = (function () {
  'use strict';

  function dedent(str) {
    if (str == null) return '';
    const lines = String(str).replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
    const indents = lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length);
    const cut = indents.length ? Math.min(...indents) : 0;
    return lines.map(l => l.slice(cut)).join('\n');
  }

  const courses = [];
  const byId = {};

  /** code('py', 'js', 'java') or code({ java: '...', py: '...' }) */
  function codeBlock(a, b, c) {
    const src = (a && typeof a === 'object') ? a : { py: a, js: b, java: c };
    const out = { type: 'code' };
    for (const k of ['py', 'js', 'java', 'kt', 'swift', 'sql', 'text']) if (src[k] != null) out[k] = dedent(src[k]);
    return out;
  }

  return {
    courses,
    byId,
    dedent,
    /** Declare a kit (see content/courses.js). */
    course(meta) {
      const c = Object.assign({ layout: 'chapters', sections: [], chapters: [] }, meta);
      courses.push(c);
      byId[c.id] = c;
    },
    /** Add a section (with lessons) to the coding-patterns kit. */
    section(s) { byId['coding-interview-patterns'].sections.push(s); },
    /** Append lessons to an existing coding-patterns section. */
    lessons(sectionId, list) {
      const sec = byId['coding-interview-patterns'].sections.find(s => s.id === sectionId);
      if (!sec) throw new Error('lessons: no section ' + sectionId);
      sec.lessons.push(...list);
    },
    /** Put the lessons of a coding-patterns section in the given id order. */
    order(sectionId, ids) {
      const sec = byId['coding-interview-patterns'].sections.find(s => s.id === sectionId);
      if (!sec) throw new Error('order: no section ' + sectionId);
      const have = sec.lessons.map(l => l.id);
      const missing = ids.filter(id => !have.includes(id)).concat(have.filter(id => !ids.includes(id)));
      if (missing.length) throw new Error('order: ' + sectionId + ' mismatch: ' + missing.join(', '));
      sec.lessons.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    },
    /** Put the chapters of a chapter-style kit in the given id order. */
    orderChapters(courseId, ids) {
      const arr = byId[courseId].chapters;
      const have = arr.map(c => c.id);
      const missing = ids.filter(id => !have.includes(id)).concat(have.filter(id => !ids.includes(id)));
      if (missing.length) throw new Error('orderChapters: ' + courseId + ' mismatch: ' + missing.join(', '));
      arr.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    },
    /** Add numbered chapters to a chapter-style kit. */
    chapters(courseId, list, opts) {
      const arr = byId[courseId].chapters;
      if (opts && opts.after) {
        const i = arr.findIndex(c => c.id === opts.after);
        if (i < 0) throw new Error('chapters: no chapter ' + opts.after + ' in ' + courseId);
        arr.splice(i + 1, 0, ...list);
      } else arr.push(...list);
    },

    // ---- text ----
    p: text => ({ type: 'p', text }),
    h: text => ({ type: 'h2', text }),
    h3: text => ({ type: 'h3', text }),
    ul: (...items) => ({ type: 'ul', items }),
    ol: (...items) => ({ type: 'ol', items }),
    note: text => ({ type: 'note', text }),
    hr: () => ({ type: 'hr' }),
    table: (head, rows) => ({ type: 'table', head, rows }),
    /** Interview dialogue: talk(['Candidate', '...'], ['Interviewer', '...']) */
    talk: (...lines) => ({ type: 'talk', lines }),
    /** Figure caption, centred under a diagram. */
    fig: text => ({ type: 'fig', text }),

    // ---- problem statement ----
    ex: (input, output, explanation) => ({ type: 'example', input, output, explanation }),

    // ---- diagrams ----
    arr: (values, opts = {}) => Object.assign({ type: 'arr', values }, opts),
    ll: (values, opts = {}) => Object.assign({ type: 'll', values }, opts),
    grid: (rows, opts = {}) => Object.assign({ type: 'grid', rows }, opts),
    tree: (level, opts = {}) => Object.assign({ type: 'tree', level }, opts),
    graph: opts => Object.assign({ type: 'graph' }, opts),
    bars: (intervals, opts = {}) => Object.assign({ type: 'bars', intervals }, opts),
    /**
     * Architecture / flow diagram.
     * nodes: { id: [col, row, 'Label\nsecond line', kind] }  kind: client | service | db | cache | queue | store | ext | note | ml
     * edges: [[from, to, 'label', 'dash' | 'both']]
     */
    flow: opts => Object.assign({ type: 'flow' }, opts),
    pre: text => ({ type: 'pre', text: dedent(text) }),
    state: text => ({ type: 'state', text }),
    row: (...items) => ({ type: 'row', items }),

    // ---- code ----
    code: codeBlock,
    impl: (a, b, c) => [{ type: 'h2', text: 'Implementation' }, codeBlock(a, b, c)],
    cx: (time, space) => [{ type: 'h2', text: 'Complexity Analysis' }, { type: 'cx', time, space }],
    /** Section heading for one of several approaches: ap(1, 'Brute force') → "Approach 1: Brute force". */
    ap: (n, name) => ({ type: 'h2', text: 'Approach ' + n + ': ' + name }),
    /** Time/space summary for an approach that is not the final one. */
    cost: (time, space, extra) => ({ type: 'cx', time, space, extra }),
    /** Side-by-side summary of every approach: vs([['Brute force', '$O(n^3)$', '$O(1)$', 'note'], ...]) */
    vs: rows => [{ type: 'h2', text: 'Comparing the Approaches' },
      { type: 'table', head: ['Approach', 'Time', 'Space', 'When to use it'], rows }],
    /**
     * Test-case table: tests([[input, expected, what it checks], ...], opts).
     * Inputs are Python-style keyword arguments ("nums = [1, 2], target = 3"); the checker
     * (scratchpad check.js) calls the Python and JavaScript solutions with them.
     * opts: fn (name or list of names), conv {arg: 'list'|'tree'}, out ('list'|'tree'|'sort'|'sort2'|'approx'),
     *       inplace (arg name), ops (class name: inputs are call sequences), check / jscheck (custom compare).
     */
    tests: (rows, opts) => [{ type: 'h2', text: 'Test Cases' },
      { type: 'p', text: 'Run these inputs against your code before you call it done. Together they cover the edge cases interviewers like to probe.' },
      { type: 'tests', rows, opts: opts || {} }],
    /** Interview tips / follow-up questions. */
    tips: (...items) => [{ type: 'h2', text: 'Interview Tips' }, { type: 'ul', items }],

    rg: (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i),
  };
})();
