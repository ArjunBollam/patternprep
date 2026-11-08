(function () {
  const { p, h, h3, ul, ol, note, ex, grid, state, code, impl, cx, table, pre } = K;

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
          h('Intuition'),
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
        ],
      },

      {
        id: 'insert-and-search-words-with-wildcards',
        title: 'Insert and Search Words with Wildcards',
        body: [
          p("Design a word dictionary supporting `insert(word)` and `search(pattern)`. In a pattern, the character `.` is a **wildcard** that matches **any single letter**. `search` returns whether any inserted word matches the whole pattern."),
          ex('insert("bat"); insert("ban"); insert("cab"); search(".a."); search("b.."); search("ca"); search("..t")', 'True, True, False, True'),
          h('Intuition'),
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
        ],
      },

      {
        id: 'find-all-words-on-a-board',
        title: 'Find All Words on a Board',
        body: [
          p("Given a grid of letters and a list of words, return every word that can be **spelled by a path of adjacent cells** (up, down, left, right). A cell may be used **at most once** within the same word."),
          ex('board = [["b","y","s"],["r","t","e"],["a","i","n"]], words = ["byte", "bytes", "rat", "tin", "nest"]', '["byte", "bytes", "tin"]', '"rat" and "nest" can\'t be traced through adjacent cells.'),
          grid([['b', 'y', 's'], ['r', 't', 'e'], ['a', 'i', 'n']], { hl: [[0, 0], [0, 1], [1, 1], [1, 2], [0, 2]], cap: '"bytes": b → y → t → e → s' }),
          h('Intuition'),
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
        ],
      },
    ],
  });
})();
