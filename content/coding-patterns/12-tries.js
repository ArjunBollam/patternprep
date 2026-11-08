(function () {
  const { p, h, h3, ul, ol, note, ex, grid, state, code, impl, cx, table, pre, ap, cost, vs, tests, tips } = K;

  K.section({
    id: 'tries',
    title: 'Tries',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Tries',
        body: [
          p("A **trie** (pronounced \"try\", from re*trie*val), also called a **prefix tree**, stores a set of strings by sharing their common prefixes. Each node represents one character position; a path from the root spells a prefix, and nodes are flagged when a **complete word** ends there."),
          pre(`
            words: car, cart, care, cat, dog

                      (root)
                     /      \\
                    c        d
                    |        |
                    a        o
                   / \\       |
                  r*  t*     g*
                 / \\
                t*  e*            * = end of a word
          `),
          p("Looking up a word of length `m` follows at most `m` edges, so search, insert and prefix checks are all **$O(m)$**, independent of how many words are stored. A hash set can also check whole words in $O(m)$, but it can't answer \"which words start with `ca`?\" efficiently. That prefix question is what tries are built for."),
          h('Node representation'),
          table(['Option', 'Pros', 'Cons'], [
            ['Hash map of children', 'works for any alphabet, memory proportional to actual children', 'slightly slower per step'],
            ['Array of 26 children', 'fastest lookups for lowercase letters', 'wastes memory on sparse nodes'],
          ]),
          h('When should I think of a trie?'),
          ul(
            "**Prefix queries**: autocomplete, \"does any word start with…\", counting words with a prefix.",
            "Searching for **many words at once** inside a grid or text (build one trie for all of them and walk it).",
            "**Wildcard / pattern matching** over a dictionary.",
            "Problems on bits: a **binary trie** over the bits of numbers finds maximum XOR pairs."
          ),
          h('Real-world uses'),
          ul(
            "**Autocomplete** in search boxes, IDEs and phone keyboards.",
            "**Spell checkers** and word games.",
            "**IP routing**: longest-prefix matching of network addresses uses trie-like structures.",
            "**T9 / predictive text** and dictionary compression."
          ),
        ],
      },

      {
        id: 'design-a-trie',
        title: 'Design a Trie',
        body: [
          p("Implement a trie with three operations on lowercase words:"),
          ul(
            "`insert(word)`: add a word.",
            "`search(word)`: return whether the **exact** word was inserted.",
            "`has_prefix(prefix)`: return whether **any** inserted word starts with `prefix`."
          ),
          ex('insert("top"); insert("toy"); search("to"); has_prefix("to"); insert("to"); search("to")', 'False, True, True'),
          ap(1, 'A hash set of words'),
          p("A set answers `search` directly. `has_prefix` is the problem: a hash set can't look up \"any word starting with...\", so it has to scan every stored word."),
          code(`
            class TrieWordSet:
                def __init__(self):
                    self.words = set()

                def insert(self, word: str) -> None:
                    self.words.add(word)

                def search(self, word: str) -> bool:
                    return word in self.words

                def has_prefix(self, prefix: str) -> bool:
                    return any(w.startswith(prefix) for w in self.words)  # scans every word
            `, `
            class TrieWordSet {
              constructor() {
                this.words = new Set();
              }

              insert(word) {
                this.words.add(word);
              }

              search(word) {
                return this.words.has(word);
              }

              hasPrefix(prefix) {
                for (const w of this.words) if (w.startsWith(prefix)) return true; // scans every word
                return false;
              }
            }
            `, `
            class TrieWordSet {
                private final Set<String> words = new HashSet<>();

                public void insert(String word) { words.add(word); }

                public boolean search(String word) { return words.contains(word); }

                public boolean hasPrefix(String prefix) {
                    for (String w : words) if (w.startsWith(prefix)) return true; // scans every word
                    return false;
                }
            }
            `),
          cost("`insert` and `search` $O(m)$ (hashing a word of length $m$); `has_prefix` $O(N)$, where $N$ is the total length of all stored words.", "$O(N)$."),
          ap(2, 'Store every prefix in a second set'),
          p("To make `has_prefix` fast, also store **every prefix** of every inserted word. Now all three operations are single lookups, but each insert adds $m + 1$ strings whose total length is about $m^2 / 2$."),
          code(`
            class TriePrefixSet:
                def __init__(self):
                    self.words = set()
                    self.prefixes = set()

                def insert(self, word: str) -> None:
                    self.words.add(word)
                    for i in range(len(word) + 1):  # "", "t", "to", "top"
                        self.prefixes.add(word[:i])

                def search(self, word: str) -> bool:
                    return word in self.words

                def has_prefix(self, prefix: str) -> bool:
                    return prefix in self.prefixes
            `, `
            class TriePrefixSet {
              constructor() {
                this.words = new Set();
                this.prefixes = new Set();
              }

              insert(word) {
                this.words.add(word);
                for (let i = 0; i <= word.length; i++) this.prefixes.add(word.slice(0, i)); // "", "t", "to", ...
              }

              search(word) {
                return this.words.has(word);
              }

              hasPrefix(prefix) {
                return this.prefixes.has(prefix);
              }
            }
            `, `
            class TriePrefixSet {
                private final Set<String> words = new HashSet<>(), prefixes = new HashSet<>();

                public void insert(String word) {
                    words.add(word);
                    for (int i = 0; i <= word.length(); i++) prefixes.add(word.substring(0, i)); // "", "t", "to", ...
                }

                public boolean search(String word) { return words.contains(word); }

                public boolean hasPrefix(String prefix) { return prefixes.contains(prefix); }
            }
            `),
          cost("`insert` $O(m^2)$ (building $m$ prefix strings); `search` and `has_prefix` $O(m)$.", "$O(\\text{sum of } m^2)$ over all words: the prefixes are stored as separate strings."),
          p("A trie stores exactly the same prefixes, but **shares** them: the prefix \"to\" exists once, no matter how many words start with it."),
          ap(3, 'Trie (optimal)'),
          p("Each node holds a map from character to child node, plus a boolean `is_word`. Both `search` and `has_prefix` walk down the trie one character at a time; they differ only in what they check at the end."),
          pre(`
            after insert("top"), insert("toy"):

            (root) ─t→ ( ) ─o→ ( ) ─p→ (is_word)
                                    └─y→ (is_word)
          `),
          ul(
            "**insert**: walk the characters, creating missing children; mark the last node `is_word = True`.",
            "**search(\"to\")**: the path t → o exists, but that node isn't marked as a word yet → `False`.",
            "**has_prefix(\"to\")**: the path exists → `True`."
          ),
          impl(`
            class TrieNode:
                def __init__(self):
                    self.children = {}   # char -> TrieNode
                    self.is_word = False

            class Trie:
                def __init__(self):
                    self.root = TrieNode()

                def insert(self, word: str) -> None:
                    node = self.root
                    for c in word:
                        if c not in node.children:
                            node.children[c] = TrieNode()
                        node = node.children[c]
                    node.is_word = True

                def search(self, word: str) -> bool:
                    node = self._walk(word)
                    return node is not None and node.is_word

                def has_prefix(self, prefix: str) -> bool:
                    return self._walk(prefix) is not None

                def _walk(self, s: str):
                    node = self.root
                    for c in s:
                        node = node.children.get(c)
                        if node is None:
                            return None
                    return node
            `, `
            class TrieNode {
              constructor() {
                this.children = new Map(); // char -> TrieNode
                this.isWord = false;
              }
            }

            class Trie {
              constructor() {
                this.root = new TrieNode();
              }

              insert(word) {
                let node = this.root;
                for (const c of word) {
                  if (!node.children.has(c)) node.children.set(c, new TrieNode());
                  node = node.children.get(c);
                }
                node.isWord = true;
              }

              search(word) {
                const node = this.walk(word);
                return node !== null && node.isWord;
              }

              hasPrefix(prefix) {
                return this.walk(prefix) !== null;
              }

              walk(s) {
                let node = this.root;
                for (const c of s) {
                  node = node.children.get(c);
                  if (!node) return null;
                }
                return node;
              }
            }
            `, `
            class Trie {
                private static class TrieNode {
                    Map<Character, TrieNode> children = new HashMap<>();
                    boolean isWord;
                }

                private final TrieNode root = new TrieNode();

                public void insert(String word) {
                    TrieNode node = root;
                    for (char c : word.toCharArray()) {
                        node = node.children.computeIfAbsent(c, k -> new TrieNode());
                    }
                    node.isWord = true;
                }

                public boolean search(String word) {
                    TrieNode node = walk(word);
                    return node != null && node.isWord;
                }

                public boolean hasPrefix(String prefix) {
                    return walk(prefix) != null;
                }

                private TrieNode walk(String s) {
                    TrieNode node = root;
                    for (char c : s.toCharArray()) {
                        node = node.children.get(c);
                        if (node == null) return null;
                    }
                    return node;
                }
            }
            `),
          cx("$O(m)$ for each operation, where $m$ is the length of the word or prefix.",
            "Inserting a word adds at most $m$ nodes, so the trie uses $O(\\text{total characters inserted})$ space."),
          vs([
            ['1. Hash set of words', '$O(N)$ per prefix query', '$O(N)$', 'Exact lookups only.'],
            ['2. Hash set of all prefixes', '$O(m^2)$ insert, $O(m)$ queries', '$O(\\text{sum of } m^2)$', 'Few, short words.'],
            ['3. Trie', '$O(m)$ for everything', '$O(N)$ with shared prefixes', 'The expected answer; also powers autocomplete.'],
          ]),
          tests([
            ['Trie(); search("a")', '[False]', 'Searching an empty structure.'],
            ['Trie(); insert("dog"); insert("dog"); search("dog"); has_prefix("do")', '[True, True]', 'Inserting the same word twice.'],
            ['Trie(); insert("a"); has_prefix(""); search("")', '[True, False]', 'Every word starts with the empty prefix; the empty word was never inserted.'],
            ['Trie(); insert("car"); insert("card"); search("car"); search("card"); search("ca")', '[True, True, False]', 'One word is a prefix of another.'],
            ['Trie(); insert("apple"); search("apple"); search("app"); has_prefix("app"); has_prefix("apples")', '[True, False, True, False]', 'A prefix is not a word, and a longer string is not a prefix.'],
            ['Trie(); insert("top"); insert("toy"); search("to"); has_prefix("to"); insert("to"); search("to")', '[False, True, True]', 'Example 1.'],
          ], { ops: ['TrieWordSet', 'TriePrefixSet', 'Trie'] }),
          note("Each test is a sequence of calls on a new trie; the expected output lists the values returned by `search` and `has_prefix`."),
          tips(
            "Mention the children representation: a hash map is flexible, while a fixed array of 26 children is faster for lowercase words but wastes memory when nodes have few children.",
            "Common follow-ups: count words with a given prefix (store a counter on each node), delete a word (unmark it and prune childless nodes), or return autocomplete suggestions (DFS below the prefix node)."
          ),
        ],
      },

      {
        id: 'insert-and-search-words-with-wildcards',
        title: 'Insert and Search Words with Wildcards',
        body: [
          p("Design a word dictionary supporting `insert(word)` and `search(pattern)`. In a pattern, the character `.` is a **wildcard** that matches **any single letter**. `search` returns whether any inserted word matches the whole pattern."),
          ex('insert("bat"); insert("ban"); insert("cab"); search(".a."); search("b.."); search("ca"); search("..t")', 'True, True, False, True'),
          ap(1, 'A list of words, compared one by one'),
          p("Store the words in a list. To search, compare the pattern with every word of the same length, character by character, letting `.` match anything."),
          code(`
            class WordDictionaryList:
                def __init__(self):
                    self.words = []

                def insert(self, word: str) -> None:
                    self.words.append(word)

                def search(self, pattern: str) -> bool:
                    return any(len(w) == len(pattern) and all(p in ('.', c) for p, c in zip(pattern, w))
                               for w in self.words)
            `, `
            class WordDictionaryList {
              constructor() {
                this.words = [];
              }

              insert(word) {
                this.words.push(word);
              }

              search(pattern) {
                return this.words.some(w => w.length === pattern.length && [...pattern].every((p, i) => p === '.' || p === w[i]));
              }
            }
            `, `
            class WordDictionaryList {
                private final List<String> words = new ArrayList<>();

                public void insert(String word) { words.add(word); }

                public boolean search(String pattern) {
                    for (String w : words) {
                        if (w.length() != pattern.length()) continue;
                        boolean ok = true;
                        for (int i = 0; i < w.length() && ok; i++) {
                            char p = pattern.charAt(i);
                            ok = p == '.' || p == w.charAt(i);
                        }
                        if (ok) return true;
                    }
                    return false;
                }
            }
            `),
          cost("`insert` $O(1)$; `search` $O(N)$ over all stored characters, wildcards or not.", "$O(N)$."),
          p("Every search touches every word. A trie lets a search skip all words that don't share the pattern's fixed letters."),
          ap(2, 'Trie + depth-first search on wildcards (optimal)'),
          p("Without wildcards this is a normal trie search. A `.` means \"any child works\", so at that position we have to **try every child** and succeed if any branch matches the rest of the pattern. That's a depth-first search over the trie:"),
          ol(
            "If we've consumed the whole pattern, succeed iff the current node ends a word.",
            "If the next character is a letter, follow that single child (or fail if it's missing).",
            "If it's `.`, recurse into every child with the rest of the pattern."
          ),
          pre(`
            search("..t"):
            (root) ─b→ ( ) ─a→ ( ) ─t→ [word] ✓   ← found via b, a, t
                              └─n→ [word]
                   ─c→ ( ) ─a→ ( ) ─b→ [word]     (c, a, then 't' missing ✗)
          `),
          note("Searches without wildcards still take $O(m)$. With wildcards the worst case grows, e.g. a pattern of all dots explores every node up to that depth."),
          impl(`
            class TrieNode:
                def __init__(self):
                    self.children = {}
                    self.is_word = False

            class WordDictionary:
                def __init__(self):
                    self.root = TrieNode()

                def insert(self, word: str) -> None:
                    node = self.root
                    for c in word:
                        node = node.children.setdefault(c, TrieNode())
                    node.is_word = True

                def search(self, pattern: str) -> bool:
                    return self._dfs(self.root, pattern, 0)

                def _dfs(self, node: TrieNode, pattern: str, i: int) -> bool:
                    if i == len(pattern):
                        return node.is_word
                    c = pattern[i]
                    if c == '.':
                        return any(self._dfs(child, pattern, i + 1)
                                   for child in node.children.values())
                    child = node.children.get(c)
                    return child is not None and self._dfs(child, pattern, i + 1)
            `, `
            class WordDictionary {
              constructor() {
                this.root = { children: new Map(), isWord: false };
              }

              insert(word) {
                let node = this.root;
                for (const c of word) {
                  if (!node.children.has(c)) node.children.set(c, { children: new Map(), isWord: false });
                  node = node.children.get(c);
                }
                node.isWord = true;
              }

              search(pattern) {
                const dfs = (node, i) => {
                  if (i === pattern.length) return node.isWord;
                  const c = pattern[i];
                  if (c === '.') {
                    for (const child of node.children.values()) if (dfs(child, i + 1)) return true;
                    return false;
                  }
                  const child = node.children.get(c);
                  return child !== undefined && dfs(child, i + 1);
                };
                return dfs(this.root, 0);
              }
            }
            `, `
            class WordDictionary {
                private static class TrieNode {
                    Map<Character, TrieNode> children = new HashMap<>();
                    boolean isWord;
                }

                private final TrieNode root = new TrieNode();

                public void insert(String word) {
                    TrieNode node = root;
                    for (char c : word.toCharArray()) {
                        node = node.children.computeIfAbsent(c, k -> new TrieNode());
                    }
                    node.isWord = true;
                }

                public boolean search(String pattern) {
                    return dfs(root, pattern, 0);
                }

                private boolean dfs(TrieNode node, String pattern, int i) {
                    if (i == pattern.length()) return node.isWord;
                    char c = pattern.charAt(i);
                    if (c == '.') {
                        for (TrieNode child : node.children.values()) {
                            if (dfs(child, pattern, i + 1)) return true;
                        }
                        return false;
                    }
                    TrieNode child = node.children.get(c);
                    return child != null && dfs(child, pattern, i + 1);
                }
            }
            `),
          cx("`insert` is $O(m)$. `search` is $O(m)$ without wildcards and up to $O(26^{k} · m)$ with $k$ wildcards in the worst case (bounded by the size of the trie).",
            "$O(\\text{total characters inserted})$ for the trie, plus $O(m)$ recursion depth during search."),
          vs([
            ['1. List of words', '$O(N)$ per search', '$O(N)$', 'Tiny dictionaries.'],
            ['2. Trie + DFS', '$O(m)$ without wildcards; more with them', '$O(N)$', 'The expected answer: fixed letters prune most of the trie.'],
          ]),
          tests([
            ['WordDictionary(); search("a")', '[False]', 'Empty dictionary.'],
            ['WordDictionary(); insert("a"); search("."); search(".."); search("")', '[True, False, False]', 'A single dot matches one letter exactly.'],
            ['WordDictionary(); insert("mad"); insert("pad"); search(".ad"); search("..x")', '[True, False]', 'A wildcard at the start.'],
            ['WordDictionary(); insert("code"); search("c.d."); search("...."); search("....."); search("cod")', '[True, True, False, False]', 'All wildcards, a pattern that is too long, and a prefix that is not a word.'],
            ['WordDictionary(); insert("bat"); insert("ban"); insert("cab"); search(".a."); search("b.."); search("ca"); search("..t")', '[True, True, False, True]', 'Example 1.'],
          ], { ops: ['WordDictionaryList', 'WordDictionary'] }),
          note("Each test is a sequence of calls on a new dictionary; the expected output lists what each `search` returned."),
          tips(
            "Patterns made mostly of dots explore most of the trie. If the interviewer worries about that, mention grouping words by length (a pattern only needs to explore words of its own length)."
          ),
        ],
      },

      {
        id: 'find-all-words-on-a-board',
        title: 'Find All Words on a Board',
        body: [
          p("Given a grid of letters and a list of words, return every word that can be **spelled by a path of adjacent cells** (up, down, left, right). A cell may be used **at most once** within the same word."),
          ex('board = [["b","y","s"],["r","t","e"],["a","i","n"]], words = ["byte", "bytes", "rat", "tin", "nest"]', '["byte", "bytes", "tin"]', '"rat" and "nest" can\'t be traced through adjacent cells.'),
          grid([['b', 'y', 's'], ['r', 't', 'e'], ['a', 'i', 'n']], { hl: [[0, 0], [0, 1], [1, 1], [1, 2], [0, 2]], cap: '"bytes": b → y → t → e → s' }),
          ap(1, 'Backtracking search for each word separately'),
          p("For each word, try every cell as a starting point and trace the word letter by letter with a depth-first search, marking cells as used on the way down and restoring them on the way back."),
          code(`
            from typing import List

            def find_all_words_brute_force(board: List[List[str]], words: List[str]) -> List[str]:
                rows, cols = len(board), len(board[0])

                def trace(r: int, c: int, word: str, i: int) -> bool:  # word[i:] from (r, c)?
                    if board[r][c] != word[i]:
                        return False
                    if i == len(word) - 1:
                        return True
                    letter, board[r][c] = board[r][c], '#'  # mark used
                    ok = any(0 <= nr < rows and 0 <= nc < cols and trace(nr, nc, word, i + 1)
                             for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)))
                    board[r][c] = letter  # backtrack
                    return ok

                return [w for w in dict.fromkeys(words)  # each distinct word once
                        if any(trace(r, c, w, 0) for r in range(rows) for c in range(cols))]
            `, `
            function findAllWordsBruteForce(board, words) {
              const rows = board.length, cols = board[0].length;
              const trace = (r, c, word, i) => { // can word[i..] be traced from (r, c)?
                if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[i]) return false;
                if (i === word.length - 1) return true;
                const letter = board[r][c];
                board[r][c] = '#'; // mark used
                const ok = trace(r + 1, c, word, i + 1) || trace(r - 1, c, word, i + 1) ||
                           trace(r, c + 1, word, i + 1) || trace(r, c - 1, word, i + 1);
                board[r][c] = letter; // backtrack
                return ok;
              };
              return [...new Set(words)].filter(w => {
                for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (trace(r, c, w, 0)) return true;
                return false;
              });
            }
            `, `
            public List<String> findAllWordsBruteForce(char[][] board, String[] words) {
                List<String> found = new ArrayList<>();
                for (String w : new LinkedHashSet<>(Arrays.asList(words))) { // each distinct word once
                    boolean ok = false;
                    for (int r = 0; r < board.length && !ok; r++) {
                        for (int c = 0; c < board[0].length && !ok; c++) ok = trace(board, r, c, w, 0);
                    }
                    if (ok) found.add(w);
                }
                return found;
            }

            private boolean trace(char[][] board, int r, int c, String word, int i) {
                if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(i)) return false;
                if (i == word.length() - 1) return true;
                char letter = board[r][c];
                board[r][c] = '#'; // mark used
                boolean ok = trace(board, r + 1, c, word, i + 1) || trace(board, r - 1, c, word, i + 1)
                          || trace(board, r, c + 1, word, i + 1) || trace(board, r, c - 1, word, i + 1);
                board[r][c] = letter; // backtrack
                return ok;
            }
            `),
          cost("$O(W · R·C · 3^{L})$ for $W$ words: every word repeats the whole grid search.", "$O(L)$ recursion depth."),
          ap(2, 'One trie of all words, one search from every cell (optimal)'),
          p("Searching for each word separately repeats a lot of work: \"byte\" and \"bytes\" share four letters of exploration. Instead, put **all the words into one trie** and run a single DFS from every cell. As the DFS walks the grid, it walks the trie in parallel:"),
          ul(
            "If the next cell's letter isn't a child of the current trie node, **no word continues this way**, so we prune immediately.",
            "Whenever we land on a trie node that ends a word, record that word (and clear its marker so it isn't reported twice).",
            "Mark the current cell as visited during the DFS and restore it when backtracking."
          ),
          state('start at (0,0) "b": trie has b → follow\n(0,1) "y": trie has by → follow\n(1,1) "t": byt → follow\n(1,2) "e": byte ✓ record\n(0,2) "s": bytes ✓ record'),
          note("Storing the full word at the node where it ends (instead of a boolean) means we don't need to rebuild the string from the path."),
          impl(`
            from typing import List

            class TrieNode:
                def __init__(self):
                    self.children = {}
                    self.word = None  # set at the node where a word ends

            def find_all_words_on_a_board(board: List[List[str]], words: List[str]) -> List[str]:
                root = TrieNode()
                for w in words:
                    node = root
                    for c in w:
                        node = node.children.setdefault(c, TrieNode())
                    node.word = w

                found = []
                rows, cols = len(board), len(board[0])

                def dfs(r: int, c: int, node: TrieNode) -> None:
                    letter = board[r][c]
                    child = node.children.get(letter)
                    if child is None:
                        return                          # no word continues this way
                    if child.word:
                        found.append(child.word)
                        child.word = None               # report each word once
                    board[r][c] = '#'                   # mark visited
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '#':
                            dfs(nr, nc, child)
                    board[r][c] = letter                # backtrack

                for r in range(rows):
                    for c in range(cols):
                        dfs(r, c, root)
                return found
            `, `
            function findAllWordsOnABoard(board, words) {
              const root = { children: new Map(), word: null };
              for (const w of words) {
                let node = root;
                for (const c of w) {
                  if (!node.children.has(c)) node.children.set(c, { children: new Map(), word: null });
                  node = node.children.get(c);
                }
                node.word = w;
              }
              const found = [];
              const rows = board.length, cols = board[0].length;
              const dfs = (r, c, node) => {
                const letter = board[r][c];
                const child = node.children.get(letter);
                if (!child) return;                // no word continues this way
                if (child.word) {
                  found.push(child.word);
                  child.word = null;               // report each word once
                }
                board[r][c] = '#';                 // mark visited
                for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                  const nr = r + dr, nc = c + dc;
                  if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] !== '#') {
                    dfs(nr, nc, child);
                  }
                }
                board[r][c] = letter;              // backtrack
              };
              for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) dfs(r, c, root);
              return found;
            }
            `, `
            private static class TrieNode {
                Map<Character, TrieNode> children = new HashMap<>();
                String word; // set at the node where a word ends
            }

            private static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

            public List<String> findAllWordsOnABoard(char[][] board, String[] words) {
                TrieNode root = new TrieNode();
                for (String w : words) {
                    TrieNode node = root;
                    for (char c : w.toCharArray()) node = node.children.computeIfAbsent(c, k -> new TrieNode());
                    node.word = w;
                }
                List<String> found = new ArrayList<>();
                for (int r = 0; r < board.length; r++) {
                    for (int c = 0; c < board[0].length; c++) dfs(board, r, c, root, found);
                }
                return found;
            }

            private void dfs(char[][] board, int r, int c, TrieNode node, List<String> found) {
                char letter = board[r][c];
                TrieNode child = node.children.get(letter);
                if (child == null) return;                 // no word continues this way
                if (child.word != null) {
                    found.add(child.word);
                    child.word = null;                     // report each word once
                }
                board[r][c] = '#';                         // mark visited
                for (int[] d : DIRS) {
                    int nr = r + d[0], nc = c + d[1];
                    if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length && board[nr][nc] != '#') {
                        dfs(board, nr, nc, child, found);
                    }
                }
                board[r][c] = letter;                      // backtrack
            }
            `),
          cx("$O(N + R·C·3^{L})$, where $N$ is the total length of all words, $R·C$ the board size, and $L$ the length of the longest word: after the first step each DFS has at most 3 new directions. Trie pruning makes the typical cost far lower.",
            "$O(N)$ for the trie plus $O(L)$ recursion depth."),
          vs([
            ['1. Backtracking per word', '$O(W · R·C · 3^L)$', '$O(L)$', 'One or two words.'],
            ['2. Trie + one DFS per cell', '$O(N + R·C·3^L)$', '$O(N)$', 'The expected answer: shared prefixes are explored once.'],
          ]),
          tests([
            ['board = [["x"]], words = []', '[]', 'No words to look for.'],
            ['board = [["a"]], words = ["a", "b"]', '["a"]', 'One-cell board.'],
            ['board = [["a", "a"]], words = ["aaa"]', '[]', 'A cell cannot be used twice in one word.'],
            ['board = [["a", "b"]], words = ["ab", "ab"]', '["ab"]', 'Duplicate words are reported once.'],
            ['board = [["a", "b"], ["c", "d"]], words = ["abdc", "acdb", "abcd"]', '["abdc", "acdb"]', 'Diagonal moves are not allowed ("abcd").'],
            ['board = [["o", "a"], ["t", "e"]], words = ["oat", "tea", "eat", "toe"]', '["tea"]', 'Only one word has a path of side-by-side cells.'],
            ['board = [["b", "y", "s"], ["r", "t", "e"], ["a", "i", "n"]], words = ["byte", "bytes", "rat", "tin", "nest"]', '["byte", "bytes", "tin"]', 'Example 1.'],
          ], { fn: ['find_all_words_brute_force', 'find_all_words_on_a_board'], cmp: 'sort' }),
          note("The words may be returned in any order, so the checker compares them as sorted lists."),
          tips(
            "A big practical speed-up: once a trie node has no children left and no word, remove it from its parent. Later searches stop even earlier.",
            "Restore each cell after exploring it. Forgetting to backtrack is the most common bug in grid searches."
          ),
        ],
      },
    ],
  });
})();
