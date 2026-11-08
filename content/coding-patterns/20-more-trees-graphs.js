/* Additional classic problems for the Trees and Graphs sections. */
(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, tree, graph, state, code, impl, cx, pre } = K;

  K.lessons('trees', [
    {
      id: 'widest-binary-tree-level',
      title: 'Widest Binary Tree Level',
      body: [
        p("The **width** of a level is the distance between its leftmost and rightmost non-null nodes, counting the null positions in between as if the tree were complete. Return the **maximum width** over all levels."),
        ex('root = [1, 2, 3, 4, null, null, 5]', '4', 'the last level has 4 at the far left and 5 at the far right, with two empty positions between them: width 4.'),
        tree([1, 2, 3, 4, null, null, 5], { hl: [4, 5] }),
        h('Intuition'),
        p("Number every position as in a heap: the root is 0, and a node at index `i` has children at `2i + 1` and `2i + 2`. Then the width of a level is simply `rightmost index - leftmost index + 1`. A level-order traversal (BFS) visits each level's nodes from left to right, so the first and last indexes of each level are easy to read off."),
        state('level 0: index 0         → width 1\nlevel 1: indexes 1, 2    → width 2\nlevel 2: indexes 3 … 6   → width 6 - 3 + 1 = 4'),
        note("Indexes double at each level and can overflow in deep, skinny trees. Subtract the level's first index from every index on that level (normalise) to keep numbers small."),
        impl(`
          from collections import deque

          # TreeNode: val, left, right (see Introduction to Trees)

          def widest_binary_tree_level(root: TreeNode) -> int:
              if not root:
                  return 0
              best = 0
              queue = deque([(root, 0)])
              while queue:
                  first = queue[0][1]
                  last = queue[-1][1]
                  best = max(best, last - first + 1)
                  for _ in range(len(queue)):
                      node, i = queue.popleft()
                      i -= first                      # normalise to avoid huge numbers
                      if node.left:
                          queue.append((node.left, 2 * i + 1))
                      if node.right:
                          queue.append((node.right, 2 * i + 2))
              return best
          `, `
          function widestBinaryTreeLevel(root) {
            if (!root) return 0;
            let best = 0;
            let level = [[root, 0]];
            while (level.length) {
              const first = level[0][1];
              best = Math.max(best, level[level.length - 1][1] - first + 1);
              const next = [];
              for (const [node, idx] of level) {
                const i = idx - first; // normalise to avoid huge numbers
                if (node.left) next.push([node.left, 2 * i + 1]);
                if (node.right) next.push([node.right, 2 * i + 2]);
              }
              level = next;
            }
            return best;
          }
          `, `
          public int widestBinaryTreeLevel(TreeNode root) {
              if (root == null) return 0;
              int best = 0;
              Deque<Object[]> queue = new ArrayDeque<>();
              queue.offer(new Object[]{root, 0L});
              while (!queue.isEmpty()) {
                  long first = (long) queue.peekFirst()[1], last = (long) queue.peekLast()[1];
                  best = (int) Math.max(best, last - first + 1);
                  for (int size = queue.size(); size > 0; size--) {
                      Object[] e = queue.poll();
                      TreeNode node = (TreeNode) e[0];
                      long i = (long) e[1] - first; // normalise to avoid overflow
                      if (node.left != null) queue.offer(new Object[]{node.left, 2 * i + 1});
                      if (node.right != null) queue.offer(new Object[]{node.right, 2 * i + 2});
                  }
              }
              return best;
          }
          `),
        cx("$O(n)$.", "$O(n)$ for the queue."),
      ],
    },

    {
      id: 'binary-tree-symmetry',
      title: 'Binary Tree Symmetry',
      body: [
        p("Determine whether a binary tree is **symmetric**: a mirror image of itself around its centre."),
        ex('root = [1, 2, 2, 3, 4, 4, 3]', 'True'),
        ex('root = [1, 2, 2, null, 3, null, 3]', 'False'),
        K.row(tree([1, 2, 2, 3, 4, 4, 3], { cap: 'symmetric' }), tree([1, 2, 2, null, 3, null, 3], { hl: [3], cap: 'not symmetric' })),
        h('Intuition'),
        p("Compare the left and right subtrees **as mirror images**. Two subtrees `a` and `b` mirror each other when their roots have equal values, `a.left` mirrors `b.right`, and `a.right` mirrors `b.left`."),
        impl(`
          # TreeNode: val, left, right (see Introduction to Trees)

          def binary_tree_symmetry(root: TreeNode) -> bool:
              def mirror(a: TreeNode, b: TreeNode) -> bool:
                  if not a and not b:
                      return True
                  if not a or not b or a.val != b.val:
                      return False
                  return mirror(a.left, b.right) and mirror(a.right, b.left)

              return mirror(root.left, root.right) if root else True
          `, `
          function binaryTreeSymmetry(root) {
            const mirror = (a, b) => {
              if (!a && !b) return true;
              if (!a || !b || a.val !== b.val) return false;
              return mirror(a.left, b.right) && mirror(a.right, b.left);
            };
            return root ? mirror(root.left, root.right) : true;
          }
          `, `
          public boolean binaryTreeSymmetry(TreeNode root) {
              return root == null || mirror(root.left, root.right);
          }

          private boolean mirror(TreeNode a, TreeNode b) {
              if (a == null && b == null) return true;
              if (a == null || b == null || a.val != b.val) return false;
              return mirror(a.left, b.right) && mirror(a.right, b.left);
          }
          `),
        cx("$O(n)$.", "$O(h)$ recursion depth."),
      ],
    },

    {
      id: 'build-binary-tree-from-preorder-and-inorder',
      title: 'Build Binary Tree From Preorder and Inorder Traversals',
      body: [
        p("Given the **preorder** and **inorder** traversals of a binary tree with **unique** values, reconstruct the tree and return its root."),
        ex('preorder = [5, 9, 2, 3, 4, 7], inorder = [2, 9, 5, 4, 3, 7]', '[5, 9, 3, 2, null, 4, 7]'),
        tree([5, 9, 3, 2, null, 4, 7]),
        h('Intuition'),
        ul(
          "The **first** preorder value is always the root (5).",
          "In the inorder list, everything **left of the root** is the left subtree (`[2, 9]`) and everything right of it is the right subtree (`[4, 3, 7]`).",
          "The sizes of those parts tell us how to split the rest of the preorder list, and we recurse."
        ),
        arr([2, 9, 5, 4, 3, 7], { name: 'inorder', hl2: [0, 1], hl: [2], state: 'root 5 at index 2\nleft subtree: 2 nodes, right subtree: 3 nodes' }),
        p("A hash map from value to inorder index makes each root lookup $O(1)$. Consume preorder values with a moving pointer: build the left subtree first, then the right."),
        impl(`
          from typing import List

          # TreeNode: val, left, right (see Introduction to Trees)

          def build_tree(preorder: List[int], inorder: List[int]) -> TreeNode:
              index = {v: i for i, v in enumerate(inorder)}
              pre_i = 0

              def build(lo: int, hi: int) -> TreeNode:   # inorder range [lo, hi]
                  nonlocal pre_i
                  if lo > hi:
                      return None
                  val = preorder[pre_i]
                  pre_i += 1
                  node = TreeNode(val)
                  mid = index[val]
                  node.left = build(lo, mid - 1)
                  node.right = build(mid + 1, hi)
                  return node

              return build(0, len(inorder) - 1)
          `, `
          function buildTree(preorder, inorder) {
            const index = new Map(inorder.map((v, i) => [v, i]));
            let preI = 0;
            const build = (lo, hi) => { // inorder range [lo, hi]
              if (lo > hi) return null;
              const val = preorder[preI++];
              const node = new TreeNode(val);
              const mid = index.get(val);
              node.left = build(lo, mid - 1);
              node.right = build(mid + 1, hi);
              return node;
            };
            return build(0, inorder.length - 1);
          }
          `, `
          private int preI;
          private Map<Integer, Integer> index;

          public TreeNode buildTree(int[] preorder, int[] inorder) {
              index = new HashMap<>();
              for (int i = 0; i < inorder.length; i++) index.put(inorder[i], i);
              preI = 0;
              return build(preorder, 0, inorder.length - 1);
          }

          private TreeNode build(int[] preorder, int lo, int hi) { // inorder range [lo, hi]
              if (lo > hi) return null;
              int val = preorder[preI++];
              TreeNode node = new TreeNode(val);
              int mid = index.get(val);
              node.left = build(preorder, lo, mid - 1);
              node.right = build(preorder, mid + 1, hi);
              return node;
          }
          `),
        cx("$O(n)$: each node is created once with an $O(1)$ index lookup.", "$O(n)$ for the map, plus $O(h)$ recursion."),
      ],
    },

    {
      id: 'kth-smallest-number-in-bst',
      title: 'Kth Smallest Number in a Binary Search Tree',
      body: [
        p("Given the root of a binary search tree and an integer `k`, return the **k-th smallest** value (1-indexed)."),
        ex('root = [5, 2, 7, 1, 4, 6, 9], k = 3', '4'),
        tree([5, 2, 7, 1, 4, 6, 9], { hl: [4] }),
        h('Intuition'),
        p("An **in-order traversal** of a BST visits values in ascending order: 1, 2, 4, 5, 6, 7, 9. The k-th visited value is the answer. Doing it iteratively with a stack lets us **stop early** after k steps instead of traversing the whole tree."),
        impl(`
          # TreeNode: val, left, right (see Introduction to Trees)

          def kth_smallest(root: TreeNode, k: int) -> int:
              stack, node = [], root
              while stack or node:
                  while node:                 # go as far left as possible
                      stack.append(node)
                      node = node.left
                  node = stack.pop()          # next smallest value
                  k -= 1
                  if k == 0:
                      return node.val
                  node = node.right
              raise ValueError("k is larger than the tree size")
          `, `
          function kthSmallest(root, k) {
            const stack = [];
            let node = root;
            while (stack.length || node) {
              while (node) { stack.push(node); node = node.left; } // go far left
              node = stack.pop();                                   // next smallest
              if (--k === 0) return node.val;
              node = node.right;
            }
            throw new Error('k is larger than the tree size');
          }
          `, `
          public int kthSmallest(TreeNode root, int k) {
              Deque<TreeNode> stack = new ArrayDeque<>();
              TreeNode node = root;
              while (!stack.isEmpty() || node != null) {
                  while (node != null) { stack.push(node); node = node.left; } // go far left
                  node = stack.pop();                                          // next smallest
                  if (--k == 0) return node.val;
                  node = node.right;
              }
              throw new IllegalArgumentException("k is larger than the tree size");
          }
          `),
        cx("$O(h + k)$: descend to the smallest value, then take k steps.", "$O(h)$ for the stack."),
      ],
    },

    {
      id: 'serialize-and-deserialize-a-binary-tree',
      title: 'Serialize and Deserialize a Binary Tree',
      body: [
        p("Write a function that converts a binary tree into a **string**, and another that rebuilds the identical tree from that string."),
        ex('root = [5, 9, 3, 2, null, 4, 7]', 'deserialize(serialize(root)) has the same structure and values'),
        h('Intuition'),
        p("A preorder traversal alone is ambiguous, but a preorder traversal that also records **null children** (with a marker like `#`) uniquely describes the tree. Deserialising reads the values back in the same order: each value starts a node, then recursively its left and right subtrees."),
        pre(`
          tree [5, 9, 3, 2, null, 4, 7]
          preorder with nulls:  5,9,2,#,#,#,3,4,#,#,7,#,#
        `),
        impl(`
          # TreeNode: val, left, right (see Introduction to Trees)

          def serialize(root: TreeNode) -> str:
              out = []

              def walk(node: TreeNode) -> None:
                  if not node:
                      out.append("#")
                      return
                  out.append(str(node.val))
                  walk(node.left)
                  walk(node.right)

              walk(root)
              return ",".join(out)

          def deserialize(data: str) -> TreeNode:
              values = iter(data.split(","))

              def build() -> TreeNode:
                  v = next(values)
                  if v == "#":
                      return None
                  node = TreeNode(int(v))
                  node.left = build()
                  node.right = build()
                  return node

              return build()
          `, `
          function serialize(root) {
            const out = [];
            const walk = node => {
              if (!node) { out.push('#'); return; }
              out.push(String(node.val));
              walk(node.left);
              walk(node.right);
            };
            walk(root);
            return out.join(',');
          }

          function deserialize(data) {
            const values = data.split(',');
            let i = 0;
            const build = () => {
              const v = values[i++];
              if (v === '#') return null;
              const node = new TreeNode(Number(v));
              node.left = build();
              node.right = build();
              return node;
            };
            return build();
          }
          `, `
          public String serialize(TreeNode root) {
              StringBuilder sb = new StringBuilder();
              walk(root, sb);
              return sb.substring(0, sb.length() - 1); // drop trailing comma
          }

          private void walk(TreeNode node, StringBuilder sb) {
              if (node == null) { sb.append("#,"); return; }
              sb.append(node.val).append(',');
              walk(node.left, sb);
              walk(node.right, sb);
          }

          private int pos;

          public TreeNode deserialize(String data) {
              pos = 0;
              return build(data.split(","));
          }

          private TreeNode build(String[] values) {
              String v = values[pos++];
              if (v.equals("#")) return null;
              TreeNode node = new TreeNode(Integer.parseInt(v));
              node.left = build(values);
              node.right = build(values);
              return node;
          }
          `),
        cx("$O(n)$ for both functions.", "$O(n)$ for the string and $O(h)$ recursion."),
      ],
    },
  ]);

  K.lessons('graphs', [
    {
      id: 'longest-increasing-path',
      title: 'Longest Increasing Path',
      body: [
        p("Given a matrix of integers, return the length of the **longest strictly increasing path**. From a cell you may move up, down, left or right (no diagonals, no wrapping)."),
        ex('matrix = [[1, 5, 8], [3, 4, 4], [7, 9, 2]]', '5', 'the path 1 → 3 → 4 → 5 → 8.'),
        grid([[1, 5, 8], [3, 4, 4], [7, 9, 2]], { hl: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2]] }),
        h('Intuition'),
        p("Think of each cell as a node with an edge to every larger neighbour. Because values must strictly increase, the graph has **no cycles** (it's a DAG). The longest path starting at a cell is 1 plus the longest path from its best larger neighbour, which is a perfect fit for **DFS with memoisation**: each cell's answer is computed once and reused."),
        impl(`
          from functools import lru_cache
          from typing import List

          def longest_increasing_path(matrix: List[List[int]]) -> int:
              if not matrix or not matrix[0]:
                  return 0
              rows, cols = len(matrix), len(matrix[0])

              @lru_cache(maxsize=None)
              def dfs(r: int, c: int) -> int:
                  best = 1
                  for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                      if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                          best = max(best, 1 + dfs(nr, nc))
                  return best

              return max(dfs(r, c) for r in range(rows) for c in range(cols))
          `, `
          function longestIncreasingPath(matrix) {
            if (!matrix.length || !matrix[0].length) return 0;
            const rows = matrix.length, cols = matrix[0].length;
            const memo = Array.from({ length: rows }, () => new Array(cols).fill(0));
            const dfs = (r, c) => {
              if (memo[r][c]) return memo[r][c];
              let best = 1;
              for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) {
                  best = Math.max(best, 1 + dfs(nr, nc));
                }
              }
              return (memo[r][c] = best);
            };
            let answer = 0;
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) answer = Math.max(answer, dfs(r, c));
            return answer;
          }
          `, `
          public int longestIncreasingPath(int[][] matrix) {
              if (matrix.length == 0 || matrix[0].length == 0) return 0;
              int[][] memo = new int[matrix.length][matrix[0].length];
              int answer = 0;
              for (int r = 0; r < matrix.length; r++)
                  for (int c = 0; c < matrix[0].length; c++) answer = Math.max(answer, dfs(matrix, r, c, memo));
              return answer;
          }

          private int dfs(int[][] m, int r, int c, int[][] memo) {
              if (memo[r][c] != 0) return memo[r][c];
              int best = 1;
              int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
              for (int[] d : dirs) {
                  int nr = r + d[0], nc = c + d[1];
                  if (nr >= 0 && nr < m.length && nc >= 0 && nc < m[0].length && m[nr][nc] > m[r][c]) {
                      best = Math.max(best, 1 + dfs(m, nr, nc, memo));
                  }
              }
              return memo[r][c] = best;
          }
          `),
        cx("$O(m·n)$: each cell's DFS result is computed once, with constant work per neighbour.", "$O(m·n)$ for the memo and recursion."),
      ],
    },

    {
      id: 'shortest-transformation-sequence',
      title: 'Shortest Transformation Sequence',
      body: [
        p("Given a `start` word, an `end` word and a dictionary, find the length of the **shortest sequence** of words from start to end where each step changes **exactly one letter** and every intermediate word is in the dictionary. Return the number of words in the sequence, or 0 if it's impossible."),
        ex('start = "red", end = "hit", dictionary = ["red", "bed", "hat", "rod", "rad", "rat", "hit", "bad", "bat"]', '5', 'red → rad → rat → hat → hit.'),
        h('Intuition'),
        p("Treat each word as a node, with an edge between words that differ by one letter. The question is now the **shortest path in an unweighted graph**, which BFS solves. Instead of comparing every pair of words, generate neighbours on the fly: for each position, try all 26 letters and keep candidates that are in the dictionary set."),
        graph({ nodes: { red: [0, 1], rad: [1, 0.4], bed: [1, 1.6], rat: [2, 0.4], bad: [2, 1.6], hat: [3, 0.4], bat: [3, 1.6], hit: [4, 1] },
          edges: [['red', 'rad'], ['red', 'bed'], ['rad', 'rat'], ['rad', 'bad'], ['bed', 'bad'], ['rat', 'hat'], ['rat', 'bat'], ['bad', 'bat'], ['bat', 'hat'], ['hat', 'hit']], hlE: ['red-rad', 'rad-rat', 'rat-hat', 'hat-hit'], scale: 80 }),
        impl(`
          from collections import deque
          from typing import List

          def shortest_transformation_sequence(start: str, end: str, dictionary: List[str]) -> int:
              words = set(dictionary)
              if end not in words:
                  return 0
              queue = deque([(start, 1)])
              visited = {start}
              while queue:
                  word, length = queue.popleft()
                  if word == end:
                      return length
                  for i in range(len(word)):
                      for ch in "abcdefghijklmnopqrstuvwxyz":
                          nxt = word[:i] + ch + word[i + 1:]
                          if nxt in words and nxt not in visited:
                              visited.add(nxt)
                              queue.append((nxt, length + 1))
              return 0
          `, `
          function shortestTransformationSequence(start, end, dictionary) {
            const words = new Set(dictionary);
            if (!words.has(end)) return 0;
            const visited = new Set([start]);
            let level = [start], length = 1;
            while (level.length) {
              const next = [];
              for (const word of level) {
                if (word === end) return length;
                for (let i = 0; i < word.length; i++) {
                  for (let code = 97; code <= 122; code++) {
                    const cand = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
                    if (words.has(cand) && !visited.has(cand)) { visited.add(cand); next.push(cand); }
                  }
                }
              }
              level = next;
              length++;
            }
            return 0;
          }
          `, `
          public int shortestTransformationSequence(String start, String end, List<String> dictionary) {
              Set<String> words = new HashSet<>(dictionary);
              if (!words.contains(end)) return 0;
              Set<String> visited = new HashSet<>(List.of(start));
              Queue<String> queue = new ArrayDeque<>(List.of(start));
              for (int length = 1; !queue.isEmpty(); length++) {
                  for (int size = queue.size(); size > 0; size--) {
                      String word = queue.poll();
                      if (word.equals(end)) return length;
                      char[] chars = word.toCharArray();
                      for (int i = 0; i < chars.length; i++) {
                          char original = chars[i];
                          for (char ch = 'a'; ch <= 'z'; ch++) {
                              chars[i] = ch;
                              String cand = new String(chars);
                              if (words.contains(cand) && visited.add(cand)) queue.offer(cand);
                          }
                          chars[i] = original;
                      }
                  }
              }
              return 0;
          }
          `),
        cx("$O(n · L^2 · 26)$ for $n$ words of length $L$: each word generates $26L$ candidates, each built in $O(L)$.", "$O(n · L)$ for the sets and queue."),
      ],
    },

    {
      id: 'connect-the-dots',
      title: 'Connect the Dots',
      body: [
        p("Given points on a 2-D grid, connect all of them with lines so every point is reachable from every other. The cost of connecting two points is their **Manhattan distance** `|x1 - x2| + |y1 - y2|`. Return the **minimum total cost**."),
        ex('points = [[1, 1], [2, 6], [3, 2], [4, 3], [7, 1]]', '15'),
        h('Intuition'),
        p("This is the **minimum spanning tree (MST)** problem on a complete graph: every pair of points is an edge weighted by distance, and we want the cheapest set of edges that connects all points without cycles."),
        p("**Kruskal's algorithm**: sort all edges by cost, then add edges from cheapest to most expensive, skipping any edge that would connect two points already in the same component. A Union-Find structure answers \"same component?\" almost in constant time ([Merging Communities](#/coding-interview-patterns/graphs/merging-communities)). Stop after adding `n - 1` edges."),
        state('cheapest edges: (3,2)-(4,3) = 2, (1,1)-(3,2) = 3, (2,6)-(4,3) = 5, (4,3)-(7,1) = 5\ntotal = 2 + 3 + 5 + 5 = 15'),
        note("For dense graphs like this one (all pairs), **Prim's algorithm** with an array of best distances runs in $O(n^2)$ without sorting all $n^2$ edges."),
        impl(`
          from typing import List

          def connect_the_dots(points: List[List[int]]) -> int:
              n = len(points)
              edges = []
              for i in range(n):
                  for j in range(i + 1, n):
                      cost = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                      edges.append((cost, i, j))
              edges.sort()

              parent = list(range(n))

              def find(x: int) -> int:
                  while parent[x] != x:
                      parent[x] = parent[parent[x]]   # path halving
                      x = parent[x]
                  return x

              total, used = 0, 0
              for cost, i, j in edges:
                  ri, rj = find(i), find(j)
                  if ri != rj:                        # joins two components
                      parent[ri] = rj
                      total += cost
                      used += 1
                      if used == n - 1:
                          break
              return total
          `, `
          function connectTheDots(points) {
            const n = points.length;
            const edges = [];
            for (let i = 0; i < n; i++) {
              for (let j = i + 1; j < n; j++) {
                const cost = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
                edges.push([cost, i, j]);
              }
            }
            edges.sort((a, b) => a[0] - b[0]);
            const parent = Array.from({ length: n }, (_, i) => i);
            const find = x => {
              while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
              return x;
            };
            let total = 0, used = 0;
            for (const [cost, i, j] of edges) {
              const ri = find(i), rj = find(j);
              if (ri !== rj) {
                parent[ri] = rj;
                total += cost;
                if (++used === n - 1) break;
              }
            }
            return total;
          }
          `, `
          public int connectTheDots(int[][] points) {
              int n = points.length;
              List<int[]> edges = new ArrayList<>();
              for (int i = 0; i < n; i++)
                  for (int j = i + 1; j < n; j++)
                      edges.add(new int[]{Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]), i, j});
              edges.sort((a, b) -> Integer.compare(a[0], b[0]));
              int[] parent = new int[n];
              for (int i = 0; i < n; i++) parent[i] = i;
              int total = 0, used = 0;
              for (int[] e : edges) {
                  int ri = find(parent, e[1]), rj = find(parent, e[2]);
                  if (ri != rj) {
                      parent[ri] = rj;
                      total += e[0];
                      if (++used == n - 1) break;
                  }
              }
              return total;
          }

          private int find(int[] parent, int x) {
              while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
              return x;
          }
          `),
        cx("$O(n^2 \\log n)$ to build and sort all $n^2/2$ edges.", "$O(n^2)$ for the edge list."),
      ],
    },
  ]);
})();
