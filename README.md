# PatternPrep: interview prep kits

A static study site with a home page and 8 kits (176 lessons):

| Kit | Lessons |
| --- | --- |
| How to Write a Good Resume | 7 |
| Coding Interview Patterns | 105 (19 patterns, Python / JavaScript / Java solutions) |
| System Design Interview | 16 |
| Behavioral Interview | 14 |
| Object-Oriented Design Interview | 9 (Java + Python) |
| Machine Learning System Design Interview | 10 |
| Mobile System Design Interview | 7 (Kotlin / Swift snippets) |
| Generative AI System Design Interview | 8 |

All content is original study material.

## Open it

Double-click `index.html`, or run:

```bash
open pattern-study-site/index.html
```

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
