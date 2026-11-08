# PatternPrep: interview prep kits

**Live site: https://arjunbollam.github.io/patternprep/**

A static study site with a home page and 8 kits (246 lessons):

| Kit | Lessons |
| --- | --- |
| How to Write a Good Resume | 17 |
| Coding Interview Patterns | 120 (19 patterns, 101 problems; every problem shows each approach from brute force to optimal, with Python / JavaScript / Java code and a test-case table) |
| System Design Interview | 30 |
| Behavioral Interview | 23 |
| Object-Oriented Design Interview | 16 (Java + Python) |
| Machine Learning System Design Interview | 11 |
| Mobile System Design Interview | 15 (Kotlin / Swift snippets) |
| Generative AI System Design Interview | 14 |

All content is original study material.

## Open it

Use the live site above, or double-click `index.html`. To run it on a local web server instead:

```bash
cd pattern-study-site
python3 -m http.server 8080
```

Then open http://localhost:8080.

You don't need a build step or a server. Links look like `index.html#/system-design-interview/design-a-rate-limiter`,
so the back and forward buttons, refresh and bookmarks work. "Mark as complete" progress is saved in your browser
(localStorage).

## Layout

| Path | What it holds |
| --- | --- |
| `index.html` | page shell; loads the scripts in order |
| `css/style.css` | styling (home page, kit cards, sidebar, diagrams, code tabs, mobile drawer) |
| `js/dsl.js` | helpers for writing lessons (`p`, `h`, `table`, `talk`, `flow`, `arr`, `tree`, `code`, …) |
| `content/courses.js` | the 8 kits shown on the home page (title, blurb, card illustration) |
| `content/coding-patterns/*.js` | coding patterns, one file per section (`K.section`) |
| `content/*.js` | the other kits (`K.chapters('kit-id', [...])`) |
| `js/app.js` | home page, renderer, syntax highlighter, router, sidebar, progress |

## Adding a chapter to a kit

```js
K.chapters('system-design-interview', [{
  id: 'design-a-pastebin',
  title: 'Design A Pastebin',
  body: [
    p("Intro with **bold** and `code`."),
    h('Step 1 - Understand the problem and establish design scope'),
    talk(['Candidate', 'How big can a paste be?'], ['Interviewer', 'Up to 10 MB.']),
    flow({ nodes: { c: [0, 0, 'Client', 'client'], api: [1, 0, 'API'], db: [2, 0, 'Store', 'db'] },
           edges: [['c', 'api', 'POST /paste'], ['api', 'db']] }),
    code({ py: `...`, java: `...` }),
  ],
}]);
```

The `flow` node kinds are `client`, `service`, `db`, `cache`, `queue`, `store`, `ext`, `ml` and `note`.
