/* Additional classic problems for the Trees and Graphs sections. */
(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, tree, graph, state, code, impl, cx, pre, ap, cost, vs, tests, tips } = K;

  K.lessons('trees', [
    {
      id: 'widest-binary-tree-level',
      title: 'Widest Binary Tree Level',
      body: [
        p("The **width** of a level is the distance between its leftmost and rightmost non-null nodes, counting the null positions in between as if the tree were complete. Return the **maximum width** over all levels."),
        ex('root = [1, 2, 3, 4, null, null, 5]', '4', 'the last level has 4 at the far left and 5 at the far right, with two empty positions between them: width 4.'),
        tree([1, 2, 3, 4, null, null, 5], { hl: [4, 5] }),
        ap(1, 'Level order with null placeholders'),
        p("The most literal approach builds every level **as if the tree were complete**: missing children are kept as `null` placeholders, so the position of every node is preserved. The width of a level is then the distance between its first and last real node."),
        code(`
          # TreeNode: val, left, right (see Introduction to Trees)

          def widest_level_placeholders(root: TreeNode) -> int:
              best = 0
              level = [root] if root else []
              while any(level):  # stop when a level has no real nodes
                  real = [i for i, node in enumerate(level) if node]
                  best = max(best, real[-1] - real[0] + 1)
                  nxt = []
                  for node in level:  # a placeholder has two placeholder children
                      nxt += [node.left, node.right] if node else [None, None]
                  level = nxt
              return best
          `, `
          function widestLevelPlaceholders(root) {
            let best = 0;
            let level = root ? [root] : [];
            while (level.some(Boolean)) { // stop when a level has no real nodes
              const real = level.map((node, i) => (node ? i : -1)).filter(i => i >= 0);
              best = Math.max(best, real[real.length - 1] - real[0] + 1);
              level = level.flatMap(node => (node ? [node.left, node.right] : [null, null]));
            }
            return best;
          }
          `, `
          public int widestLevelPlaceholders(TreeNode root) {
              int best = 0;
              List<TreeNode> level = new ArrayList<>();
              if (root != null) level.add(root);
              while (level.stream().anyMatch(Objects::nonNull)) { // a level with real nodes
                  int first = -1, last = -1;
                  for (int i = 0; i < level.size(); i++) {
                      if (level.get(i) != null) { if (first < 0) first = i; last = i; }
                  }
                  best = Math.max(best, last - first + 1);
                  List<TreeNode> next = new ArrayList<>();
                  for (TreeNode node : level) { // a placeholder has two placeholder children
                      next.add(node == null ? null : node.left);
                      next.add(node == null ? null : node.right);
                  }
                  level = next;
              }
              return best;
          }
          `),
        cost("$O(2^h)$, where $h$ is the height: each level doubles in size, even when it holds a single real node. A chain of 40 nodes would need about a trillion placeholders.", "$O(2^h)$."),
        p("We don't need the placeholders themselves, only the **positions** they would occupy. Those can be computed directly."),
        ap(2, 'Depth-first search with position numbers'),
        p("Number every position as in a heap: the root is 0, and a node at index `i` has children at `2i + 1` and `2i + 2`. A left-first DFS reaches the leftmost node of each depth before any other node of that depth, so we record that first index per depth and measure every later node against it."),
        code(`
          # TreeNode: val, left, right (see Introduction to Trees)

          def widest_level_dfs(root: TreeNode) -> int:
              first = {}  # depth -> index of the leftmost node at that depth
              best = 0

              def dfs(node: TreeNode, depth: int, i: int) -> None:
                  nonlocal best
                  if node is None:
                      return
                  first.setdefault(depth, i)  # left-first: the leftmost node arrives first
                  best = max(best, i - first[depth] + 1)
                  dfs(node.left, depth + 1, 2 * i + 1)
                  dfs(node.right, depth + 1, 2 * i + 2)

              dfs(root, 0, 0)
              return best
          `, `
          function widestLevelDfs(root) {
            const first = new Map(); // depth -> index of the leftmost node at that depth
            let best = 0;
            const dfs = (node, depth, i) => {
              if (!node) return;
              if (!first.has(depth)) first.set(depth, i); // left-first: leftmost arrives first
              best = Math.max(best, i - first.get(depth) + 1);
              dfs(node.left, depth + 1, 2 * i + 1);
              dfs(node.right, depth + 1, 2 * i + 2);
            };
            dfs(root, 0, 0);
            return best;
          }
          `, `
          private final Map<Integer, Long> first = new HashMap<>();
          private long widest;

          public int widestLevelDfs(TreeNode root) {
              first.clear();
              widest = 0;
              dfs(root, 0, 0L);
              return (int) widest;
          }

          private void dfs(TreeNode node, int depth, long i) {
              if (node == null) return;
              first.putIfAbsent(depth, i); // left-first: the leftmost node arrives first
              widest = Math.max(widest, i - first.get(depth) + 1);
              dfs(node.left, depth + 1, 2 * i + 1);
              dfs(node.right, depth + 1, 2 * i + 2);
          }
          `),
        cost("$O(n)$.", "$O(h)$ for the recursion and the per-depth map."),
        p("Very deep trees make the recursion (and the doubling indexes) a problem. Breadth-first search processes one level at a time, which lets us **normalise** the indexes level by level."),
        ap(3, 'Breadth-first search with position numbers (optimal)'),
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
        vs([
          ['1. Placeholders for missing nodes', '$O(2^h)$', '$O(2^h)$', 'Only for tiny, nearly complete trees.'],
          ['2. DFS with position numbers', '$O(n)$', '$O(h)$', 'Short and clear; indexes grow with depth.'],
          ['3. BFS with normalised positions', '$O(n)$', '$O(w)$', 'The expected answer; safe for deep trees.'],
        ]),
        tests([
          ['root = []', '0', 'Empty tree.'],
          ['root = [1]', '1', 'A single node.'],
          ['root = [1, 2]', '1', 'One node per level.'],
          ['root = [1, 2, None, 3, None, 4]', '1', 'A skinny chain: widths stay 1 however deep it goes.'],
          ['root = [1, 2, 3, 4, 5, 6, 7]', '4', 'A full last level.'],
          ['root = [1, 2, 3, 4, None, None, 5, 6, None, None, 7]', '8', 'The gap between the outer nodes doubles at each level.'],
          ['root = [1, 2, 3, 4, None, None, 5]', '4', 'Example 1.'],
        ], { fn: ['widest_level_placeholders', 'widest_level_dfs', 'widest_binary_tree_level'], conv: { root: 'tree' } }),
        tips(
          "Explain the overflow risk and the fix (subtract the first index of each level). Interviewers often ask about it for this problem."
        ),
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
        ap(1, 'Every level must read the same in both directions'),
        p("A symmetric tree looks the same in a mirror, so each level, read left to right with `null` for every missing child, must be a **palindrome**. Expanding only the children of real nodes keeps the work linear."),
        code(`
          # TreeNode: val, left, right (see Introduction to Trees)

          def binary_tree_symmetry_levels(root: TreeNode) -> bool:
              level = [root]
              while any(level):
                  values = [node.val if node else None for node in level]
                  if values != values[::-1]:  # this level isn't a palindrome
                      return False
                  level = [child for node in level if node for child in (node.left, node.right)]
              return True
          `, `
          function binaryTreeSymmetryLevels(root) {
            let level = [root];
            while (level.some(Boolean)) {
              const values = level.map(node => (node ? node.val : null));
              for (let i = 0, j = values.length - 1; i < j; i++, j--) {
                if (values[i] !== values[j]) return false; // this level isn't a palindrome
              }
              level = level.filter(Boolean).flatMap(node => [node.left, node.right]);
            }
            return true;
          }
          `, `
          public boolean binaryTreeSymmetryLevels(TreeNode root) {
              List<TreeNode> level = new ArrayList<>();
              level.add(root);
              while (level.stream().anyMatch(Objects::nonNull)) {
                  for (int i = 0, j = level.size() - 1; i < j; i++, j--) {
                      TreeNode a = level.get(i), b = level.get(j);
                      if ((a == null) != (b == null) || (a != null && a.val != b.val)) return false;
                  }
                  List<TreeNode> next = new ArrayList<>();
                  for (TreeNode node : level) {
                      if (node != null) { next.add(node.left); next.add(node.right); }
                  }
                  level = next;
              }
              return true;
          }
          `),
        cost("$O(n)$: each level holds the real nodes of the previous level's children plus at most one `null` per child slot.", "$O(w)$ for one level."),
        ap(2, 'Iterative: a queue of mirrored pairs'),
        p("Instead of whole levels, compare **pairs** of nodes that should mirror each other. Start with `(root.left, root.right)`. For each pair, the values must match, and two new pairs must be checked: the **outer** pair `(a.left, b.right)` and the **inner** pair `(a.right, b.left)`."),
        code(`
          from collections import deque

          # TreeNode: val, left, right (see Introduction to Trees)

          def binary_tree_symmetry_iterative(root: TreeNode) -> bool:
              if root is None:
                  return True
              queue = deque([(root.left, root.right)])
              while queue:
                  a, b = queue.popleft()
                  if not a and not b:
                      continue
                  if not a or not b or a.val != b.val:
                      return False
                  queue.append((a.left, b.right))  # outer pair
                  queue.append((a.right, b.left))  # inner pair
              return True
          `, `
          function binaryTreeSymmetryIterative(root) {
            if (!root) return true;
            const queue = [[root.left, root.right]];
            while (queue.length) {
              const [a, b] = queue.shift();
              if (!a && !b) continue;
              if (!a || !b || a.val !== b.val) return false;
              queue.push([a.left, b.right]); // outer pair
              queue.push([a.right, b.left]); // inner pair
            }
            return true;
          }
          `, `
          public boolean binaryTreeSymmetryIterative(TreeNode root) {
              if (root == null) return true;
              Deque<TreeNode[]> queue = new ArrayDeque<>();
              queue.add(new TreeNode[]{root.left, root.right});
              while (!queue.isEmpty()) {
                  TreeNode[] pair = queue.poll();
                  TreeNode a = pair[0], b = pair[1];
                  if (a == null && b == null) continue;
                  if (a == null || b == null || a.val != b.val) return false;
                  queue.add(new TreeNode[]{a.left, b.right}); // outer pair
                  queue.add(new TreeNode[]{a.right, b.left}); // inner pair
              }
              return true;
          }
          `),
        cost("$O(n)$.", "$O(w)$ for the queue."),
        ap(3, 'Recursive mirror check (optimal, simplest)'),
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
        vs([
          ['1. Palindromic levels', '$O(n)$', '$O(w)$', 'Intuitive; builds whole levels.'],
          ['2. Queue of mirrored pairs', '$O(n)$', '$O(w)$', 'Iterative; no recursion limits.'],
          ['3. Recursive mirror', '$O(n)$', '$O(h)$', 'The usual answer: five lines.'],
        ]),
        tests([
          ['root = []', 'True', 'Empty tree.'],
          ['root = [1]', 'True', 'A single node.'],
          ['root = [1, 2]', 'False', 'A child on one side only.'],
          ['root = [1, 2, 2]', 'True', 'Two equal children.'],
          ['root = [1, 2, 3]', 'False', 'Children with different values.'],
          ['root = [1, 2, 2, 3, 4, 4, 3]', 'True', 'Example 1.'],
          ['root = [1, 2, 2, None, 3, None, 3]', 'False', 'Example 2: same values, mirrored wrongly.'],
        ], { fn: ['binary_tree_symmetry_levels', 'binary_tree_symmetry_iterative', 'binary_tree_symmetry'], conv: { root: 'tree' } }),
        tips(
          "The pairing is the whole problem: outer with outer (`a.left` with `b.right`) and inner with inner (`a.right` with `b.left`)."
        ),
      ],
    },

    {
      id: 'build-binary-tree-from-preorder-and-inorder',
      title: 'Build Binary Tree From Preorder and Inorder Traversals',
      body: [
        p("Given the **preorder** and **inorder** traversals of a binary tree with **unique** values, reconstruct the tree and return its root."),
        ex('preorder = [5, 9, 2, 3, 4, 7], inorder = [2, 9, 5, 4, 3, 7]', '[5, 9, 3, 2, null, 4, 7]'),
        tree([5, 9, 3, 2, null, 4, 7]),
        p("Two facts make this possible:"),
        ul(
          "The **first** preorder value is always the root (5).",
          "In the inorder list, everything **left of the root** is the left subtree (`[2, 9]`) and everything right of it is the right subtree (`[4, 3, 7]`).",
          "The sizes of those parts tell us how to split the rest of the preorder list, and we recurse."
        ),
        arr([2, 9, 5, 4, 3, 7], { name: 'inorder', hl2: [0, 1], hl: [2], state: 'root 5 at index 2\nleft subtree: 2 nodes, right subtree: 3 nodes' }),
        ap(1, 'Recursion with slicing and linear search'),
        p("Translate the facts directly: take the root from the front of `preorder`, find it in `inorder` by scanning, and recurse on the slices to its left and right."),
        code(`
          from typing import List

          # TreeNode: val, left, right (see Introduction to Trees)

          def build_tree_slicing(preorder: List[int], inorder: List[int]) -> TreeNode:
              if not preorder:
                  return None
              root = TreeNode(preorder[0])
              mid = inorder.index(preorder[0])  # linear search
              root.left = build_tree_slicing(preorder[1:mid + 1], inorder[:mid])
              root.right = build_tree_slicing(preorder[mid + 1:], inorder[mid + 1:])
              return root
          `, `
          function buildTreeSlicing(preorder, inorder) {
            if (!preorder.length) return null;
            const root = new TreeNode(preorder[0]);
            const mid = inorder.indexOf(preorder[0]); // linear search
            root.left = buildTreeSlicing(preorder.slice(1, mid + 1), inorder.slice(0, mid));
            root.right = buildTreeSlicing(preorder.slice(mid + 1), inorder.slice(mid + 1));
            return root;
          }
          `, `
          public TreeNode buildTreeSlicing(int[] preorder, int[] inorder) {
              if (preorder.length == 0) return null;
              TreeNode root = new TreeNode(preorder[0]);
              int mid = 0;
              while (inorder[mid] != preorder[0]) mid++; // linear search
              root.left = buildTreeSlicing(Arrays.copyOfRange(preorder, 1, mid + 1), Arrays.copyOfRange(inorder, 0, mid));
              root.right = buildTreeSlicing(Arrays.copyOfRange(preorder, mid + 1, preorder.length),
                                            Arrays.copyOfRange(inorder, mid + 1, inorder.length));
              return root;
          }
          `),
        cost("$O(n^2)$ for a skewed tree: every level searches and copies $O(n)$ elements.", "$O(n^2)$ for the copies in the worst case."),
        ap(2, 'Index map + moving preorder pointer (optimal)'),
        p("A hash map from value to inorder index makes each root lookup $O(1)$. Instead of slicing, pass index ranges, and consume preorder values with a moving pointer: build the left subtree first, then the right."),
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
        vs([
          ['1. Slicing + linear search', '$O(n^2)$', '$O(n^2)$', 'Clear first draft.'],
          ['2. Index map + pointer', '$O(n)$', '$O(n)$', 'The expected answer.'],
        ]),
        tests([
          ['preorder = [], inorder = []', '[]', 'Empty tree.'],
          ['preorder = [1], inorder = [1]', '[1]', 'A single node.'],
          ['preorder = [1, 2], inorder = [2, 1]', '[1, 2]', 'Only a left child.'],
          ['preorder = [1, 2], inorder = [1, 2]', '[1, None, 2]', 'Only a right child.'],
          ['preorder = [3, 2, 1], inorder = [1, 2, 3]', '[3, 2, None, 1]', 'A left-leaning chain.'],
          ['preorder = [4, 2, 1, 3, 6, 5, 7], inorder = [1, 2, 3, 4, 5, 6, 7]', '[4, 2, 6, 1, 3, 5, 7]', 'A perfect tree.'],
          ['preorder = [5, 9, 2, 3, 4, 7], inorder = [2, 9, 5, 4, 3, 7]', '[5, 9, 3, 2, None, 4, 7]', 'Example 1.'],
        ], { fn: ['build_tree_slicing', 'build_tree'], out: 'tree' }),
        tips(
          "Build the **left** subtree before the right one: the preorder pointer only works in that order.",
          "Unique values are essential. With duplicates, the root's position in `inorder` is ambiguous and the tree may not be unique."
        ),
      ],
    },

    {
      id: 'kth-smallest-number-in-bst',
      title: 'Kth Smallest Number in a Binary Search Tree',
      body: [
        p("Given the root of a binary search tree and an integer `k`, return the **k-th smallest** value (1-indexed)."),
        ex('root = [5, 2, 7, 1, 4, 6, 9], k = 3', '4'),
        tree([5, 2, 7, 1, 4, 6, 9], { hl: [4] }),
        p("An **in-order traversal** of a BST visits values in ascending order: 1, 2, 4, 5, 6, 7, 9. The k-th visited value is the answer."),
        ap(1, 'Full in-order traversal into a list'),
        p("Collect every value in order and index the list."),
        code(`
          # TreeNode: val, left, right (see Introduction to Trees)

          def kth_smallest_full_inorder(root: TreeNode, k: int) -> int:
              values = []

              def inorder(node: TreeNode) -> None:
                  if node:
                      inorder(node.left)
                      values.append(node.val)
                      inorder(node.right)

              inorder(root)
              return values[k - 1]
          `, `
          function kthSmallestFullInorder(root, k) {
            const values = [];
            const inorder = node => {
              if (!node) return;
              inorder(node.left);
              values.push(node.val);
              inorder(node.right);
            };
            inorder(root);
            return values[k - 1];
          }
          `, `
          public int kthSmallestFullInorder(TreeNode root, int k) {
              List<Integer> values = new ArrayList<>();
              inorder(root, values);
              return values.get(k - 1);
          }

          private void inorder(TreeNode node, List<Integer> values) {
              if (node == null) return;
              inorder(node.left, values);
              values.add(node.val);
              inorder(node.right, values);
          }
          `),
        cost("$O(n)$: the whole tree is visited even when `k = 1`.", "$O(n)$ for the list."),
        ap(2, 'Iterative in-order, stop after k steps (optimal)'),
        p("Doing the traversal iteratively with a stack lets us **stop early** after k steps instead of traversing the whole tree."),
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
        vs([
          ['1. Full in-order list', '$O(n)$', '$O(n)$', 'Simplest; fine for small trees.'],
          ['2. Iterative in-order, early stop', '$O(h + k)$', '$O(h)$', 'The expected answer.'],
        ]),
        tests([
          ['root = [1], k = 1', '1', 'A single node.'],
          ['root = [2, 1, 3], k = 1', '1', 'The minimum.'],
          ['root = [2, 1, 3], k = 3', '3', 'The maximum (k = n).'],
          ['root = [6, 3, 8, 1, None, None, 9, None, 2], k = 2', '2', 'The answer is a right child deep in the left subtree.'],
          ['root = [5, 2, 7, 1, 4, 6, 9], k = 7', '9', 'The last node in order.'],
          ['root = [5, 2, 7, 1, 4, 6, 9], k = 3', '4', 'Example 1.'],
        ], { fn: ['kth_smallest_full_inorder', 'kth_smallest'], conv: { root: 'tree' } }),
        tips(
          "Follow-up: if the tree changes often and k-th queries are frequent, store each node's **subtree size**. Then each query walks one root-to-leaf path in $O(h)$, choosing a side by comparing `k` with the left subtree's size."
        ),
      ],
    },

    {
      id: 'serialize-and-deserialize-a-binary-tree',
      title: 'Serialize and Deserialize a Binary Tree',
      body: [
        p("Write a function that converts a binary tree into a **string**, and another that rebuilds the identical tree from that string."),
        ex('root = [5, 9, 3, 2, null, 4, 7]', 'deserialize(serialize(root)) has the same structure and values'),
        ap(1, 'Level order (breadth-first) with null markers'),
        p("Write the nodes level by level, left to right, with a marker such as `#` for every missing child of a real node. To rebuild, read the first value as the root and keep a queue of nodes waiting for children: each node takes the next two entries as its left and right child."),
        code(`
          from collections import deque

          # TreeNode: val, left, right (see Introduction to Trees)

          def serialize_bfs(root: TreeNode) -> str:
              out, queue = [], deque([root])
              while queue:
                  node = queue.popleft()
                  if node is None:
                      out.append('#')
                      continue
                  out.append(str(node.val))
                  queue.append(node.left)
                  queue.append(node.right)
              return ','.join(out)

          def deserialize_bfs(data: str) -> TreeNode:
              values = data.split(',')
              if values[0] == '#':
                  return None
              root = TreeNode(int(values[0]))
              queue, i = deque([root]), 1
              while queue:
                  node = queue.popleft()
                  for side in ('left', 'right'):  # the next two entries are its children
                      if values[i] != '#':
                          child = TreeNode(int(values[i]))
                          setattr(node, side, child)
                          queue.append(child)
                      i += 1
              return root
          `, `
          function serializeBfs(root) {
            const out = [], queue = [root];
            while (queue.length) {
              const node = queue.shift();
              if (!node) { out.push('#'); continue; }
              out.push(String(node.val));
              queue.push(node.left, node.right);
            }
            return out.join(',');
          }

          function deserializeBfs(data) {
            const values = data.split(',');
            if (values[0] === '#') return null;
            const root = new TreeNode(Number(values[0]));
            const queue = [root];
            let i = 1;
            while (queue.length) {
              const node = queue.shift();
              for (const side of ['left', 'right']) { // the next two entries are its children
                if (values[i] !== '#') { node[side] = new TreeNode(Number(values[i])); queue.push(node[side]); }
                i++;
              }
            }
            return root;
          }
          `, `
          public String serializeBfs(TreeNode root) {
              StringBuilder sb = new StringBuilder();
              Queue<TreeNode> queue = new LinkedList<>(); // LinkedList allows null entries
              queue.add(root);
              while (!queue.isEmpty()) {
                  TreeNode node = queue.poll();
                  if (sb.length() > 0) sb.append(',');
                  if (node == null) { sb.append('#'); continue; }
                  sb.append(node.val);
                  queue.add(node.left);
                  queue.add(node.right);
              }
              return sb.toString();
          }

          public TreeNode deserializeBfs(String data) {
              String[] values = data.split(",");
              if (values[0].equals("#")) return null;
              TreeNode root = new TreeNode(Integer.parseInt(values[0]));
              Queue<TreeNode> queue = new ArrayDeque<>(List.of(root));
              int i = 1;
              while (!queue.isEmpty()) {
                  TreeNode node = queue.poll();
                  if (!values[i].equals("#")) { node.left = new TreeNode(Integer.parseInt(values[i])); queue.add(node.left); }
                  i++;
                  if (!values[i].equals("#")) { node.right = new TreeNode(Integer.parseInt(values[i])); queue.add(node.right); }
                  i++;
              }
              return root;
          }
          `),
        cost("$O(n)$ for both functions.", "$O(n)$ for the string and the queue."),
        p("This is the format the examples on this site use. A recursive preorder version is shorter and needs no queue."),
        ap(2, 'Preorder with null markers (optimal, simplest)'),
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
        vs([
          ['1. Level order + markers', '$O(n)$', '$O(n)$', 'Human-readable; matches the usual tree notation.'],
          ['2. Preorder + markers', '$O(n)$', '$O(n)$', 'The shortest code; recursion mirrors the tree.'],
        ]),
        tests([
          ['root = []', '[]', 'Empty tree.'],
          ['root = [1]', '[1]', 'A single node.'],
          ['root = [1, None, 2, None, 3]', '[1, None, 2, None, 3]', 'A right-leaning chain.'],
          ['root = [-7, 100, 0]', '[-7, 100, 0]', 'Negative and multi-digit values.'],
          ['root = [1, 1, 1, None, 1]', '[1, 1, 1, None, 1]', 'Repeated values: the structure must still come back exactly.'],
          ['root = [5, 9, 3, 2, None, 4, 7]', '[5, 9, 3, 2, None, 4, 7]', 'Example 1.'],
        ], {
          fn: ['serialize_bfs', 'serialize'],
          call: "lambda fn, kw: _lvl(globals()['de' + fn.__name__](fn(_tree(kw['root']))))",
          jscall: "(fn, kw, all) => lvl(all['de' + fn.name](fn(tree(kw.root))))",
        }),
        note("Each test serialises the tree, deserialises the string, and checks that the rebuilt tree (written in level order) matches the original."),
        tips(
          "Use a separator such as `,`. Without one, values like `1` and `12` become ambiguous.",
          "Mention that the null markers are what make a single traversal enough. Without them you need two traversals (as in *Build Binary Tree From Preorder and Inorder*) and unique values."
        ),
      ],
    },

    {
      id: 'binary-tree-columns',
      title: 'Binary Tree Columns',
      body: [
        p("Picture a binary tree drawn on paper with vertical lines through it. The root sits in **column 0**; a left child is one column to the left of its parent (`column - 1`), and a right child one column to the right (`column + 1`). Return the values **column by column, from the leftmost column to the rightmost**. Within a column, list nodes from **top to bottom**, and nodes that share both a row and a column from **left to right**."),
        ex('root = [5, 9, 3, 2, null, 4, 7]', '[[2], [9], [5, 4], [3], [7]]', 'node 4 is the left child of 3, so it lands back in column 0, below the root.'),
        ex('root = [1, 2, 3, 4, 5, 6, 7]', '[[4], [2], [1, 5, 6], [3], [7]]', 'nodes 5 and 6 share row 2 and column 0; 5 is further left in that row, so it comes first.'),
        tree([5, 9, 3, 2, null, 4, 7], { hl: [5, 4] }),
        pre(`
          column:   -2    -1     0     1     2
                                 5
                           9           3
                     2           4           7
        `),
        p("Two things are needed: the **column** of every node, and an order inside each column that is top-to-bottom and then left-to-right."),

        ap(1, 'Depth-first search, then sort'),
        p("Walk the tree depth-first, recording `(column, depth, visit order, value)` for every node. A left-first preorder visits nodes of the same depth from left to right, so the visit order breaks ties correctly. Sorting the records groups them by column and puts each column in the required order."),
        code(`
          from typing import List

          # TreeNode: val, left, right (see Introduction to Trees)

          def binary_tree_columns_sort(root: TreeNode) -> List[List[int]]:
              entries = []  # (column, depth, visit order, value)

              def dfs(node: TreeNode, col: int, depth: int) -> None:
                  if node is None:
                      return
                  entries.append((col, depth, len(entries), node.val))
                  dfs(node.left, col - 1, depth + 1)
                  dfs(node.right, col + 1, depth + 1)

              dfs(root, 0, 0)
              entries.sort()
              columns = []
              prev_col = None
              for col, _, _, val in entries:
                  if col != prev_col:  # a new column starts
                      columns.append([])
                      prev_col = col
                  columns[-1].append(val)
              return columns
          `, `
          function binaryTreeColumnsSort(root) {
            const entries = []; // [column, depth, visit order, value]
            const dfs = (node, col, depth) => {
              if (!node) return;
              entries.push([col, depth, entries.length, node.val]);
              dfs(node.left, col - 1, depth + 1);
              dfs(node.right, col + 1, depth + 1);
            };
            dfs(root, 0, 0);
            entries.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
            const columns = [];
            let prevCol = null;
            for (const [col, , , val] of entries) {
              if (col !== prevCol) { columns.push([]); prevCol = col; } // a new column starts
              columns[columns.length - 1].push(val);
            }
            return columns;
          }
          `, `
          public List<List<Integer>> binaryTreeColumnsSort(TreeNode root) {
              List<int[]> entries = new ArrayList<>(); // {column, depth, visit order, value}
              dfs(root, 0, 0, entries);
              entries.sort((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0])
                                   : a[1] != b[1] ? Integer.compare(a[1], b[1]) : Integer.compare(a[2], b[2]));
              List<List<Integer>> columns = new ArrayList<>();
              Integer prevCol = null;
              for (int[] e : entries) {
                  if (prevCol == null || e[0] != prevCol) { columns.add(new ArrayList<>()); prevCol = e[0]; }
                  columns.get(columns.size() - 1).add(e[3]);
              }
              return columns;
          }

          private void dfs(TreeNode node, int col, int depth, List<int[]> entries) {
              if (node == null) return;
              entries.add(new int[]{col, depth, entries.size(), node.val});
              dfs(node.left, col - 1, depth + 1, entries);
              dfs(node.right, col + 1, depth + 1, entries);
          }
          `),
        cost("$O(n log n)$ for the sort.", "$O(n)$ for the records."),
        p("Sorting does two jobs at once: it orders the columns and it orders the nodes inside each column. A breadth-first traversal gets the second job for free, because it already visits nodes top to bottom and, within a row, left to right."),

        ap(2, 'Breadth-first search with column numbers (optimal)'),
        p("Run a BFS that carries each node's column. Append each dequeued value to a hash map entry for its column; since BFS goes row by row from left to right, every column list is automatically in the required order."),
        p("For the column order, note that column numbers change by exactly 1 along each edge, so the columns that occur form a **contiguous range**. Tracking the smallest and largest column seen is enough to read the map from left to right, with no sorting at all."),
        state('queue: (5, 0)\n(9, -1), (3, 1)\n(2, -2), (4, 0), (7, 2)\ncolumns: -2: [2]  -1: [9]  0: [5, 4]  1: [3]  2: [7]\nrange -2 … 2  →  [[2], [9], [5, 4], [3], [7]]'),
        impl(`
          from collections import defaultdict, deque
          from typing import List

          # TreeNode: val, left, right (see Introduction to Trees)

          def binary_tree_columns(root: TreeNode) -> List[List[int]]:
              if root is None:
                  return []
              columns = defaultdict(list)
              lo = hi = 0
              queue = deque([(root, 0)])
              while queue:
                  node, col = queue.popleft()
                  columns[col].append(node.val)  # BFS: top to bottom, left to right
                  lo, hi = min(lo, col), max(hi, col)
                  if node.left:
                      queue.append((node.left, col - 1))
                  if node.right:
                      queue.append((node.right, col + 1))
              return [columns[c] for c in range(lo, hi + 1)]
          `, `
          function binaryTreeColumns(root) {
            if (!root) return [];
            const columns = new Map();
            let lo = 0, hi = 0;
            const queue = [[root, 0]];
            for (let head = 0; head < queue.length; head++) {
              const [node, col] = queue[head];
              if (!columns.has(col)) columns.set(col, []);
              columns.get(col).push(node.val); // BFS: top to bottom, left to right
              lo = Math.min(lo, col);
              hi = Math.max(hi, col);
              if (node.left) queue.push([node.left, col - 1]);
              if (node.right) queue.push([node.right, col + 1]);
            }
            const result = [];
            for (let c = lo; c <= hi; c++) result.push(columns.get(c));
            return result;
          }
          `, `
          public List<List<Integer>> binaryTreeColumns(TreeNode root) {
              List<List<Integer>> result = new ArrayList<>();
              if (root == null) return result;
              Map<Integer, List<Integer>> columns = new HashMap<>();
              int lo = 0, hi = 0;
              Deque<TreeNode> nodes = new ArrayDeque<>();
              Deque<Integer> cols = new ArrayDeque<>();
              nodes.add(root);
              cols.add(0);
              while (!nodes.isEmpty()) {
                  TreeNode node = nodes.poll();
                  int col = cols.poll();
                  columns.computeIfAbsent(col, k -> new ArrayList<>()).add(node.val); // top to bottom, left to right
                  lo = Math.min(lo, col);
                  hi = Math.max(hi, col);
                  if (node.left != null) { nodes.add(node.left); cols.add(col - 1); }
                  if (node.right != null) { nodes.add(node.right); cols.add(col + 1); }
              }
              for (int c = lo; c <= hi; c++) result.add(columns.get(c));
              return result;
          }
          `),
        cx("$O(n)$. Every node is enqueued once, and the final loop visits at most $n$ columns.",
          "$O(n)$ for the queue and the column lists."),
        vs([
          ['1. DFS + sort', '$O(n log n)$', '$O(n)$', 'When ties need a custom order (for example by value).'],
          ['2. BFS + column range', '$O(n)$', '$O(n)$', 'The expected answer.'],
        ]),
        tests([
          ['root = []', '[]', 'Empty tree.'],
          ['root = [1]', '[[1]]', 'A single node.'],
          ['root = [1, 2]', '[[2], [1]]', 'A left child opens a new column on the left.'],
          ['root = [1, None, 2, None, 3]', '[[1], [2], [3]]', 'A right-leaning chain: one node per column.'],
          ['root = [1, 2, 3, None, 4, 5]', '[[2], [1, 4, 5], [3]]', 'Nodes from both subtrees return to column 0.'],
          ['root = [1, 2, 3, 4, 5, 6, 7]', '[[4], [2], [1, 5, 6], [3], [7]]', 'Example 2: same row and column, ordered left to right.'],
          ['root = [5, 9, 3, 2, None, 4, 7]', '[[2], [9], [5, 4], [3], [7]]', 'Example 1.'],
        ], { fn: ['binary_tree_columns_sort', 'binary_tree_columns'], conv: { root: 'tree' } }),
        tips(
          "Explain why DFS needs a depth (or a sort) and BFS does not: DFS can reach a deep node in a column before a shallower one in the same column.",
          "Variants change the tie rule, for example *sort nodes in the same row and column by value*. Then sort each `(row, value)` group, so the sort-based approach is the natural fit."
        ),
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
        p("Think of each cell as a node with an edge to every larger neighbour. Because values must strictly increase, the graph has **no cycles** (it's a DAG), and a path can never revisit a cell."),
        ap(1, 'Plain depth-first search from every cell'),
        p("The longest path starting at a cell is 1 plus the longest path from its best larger neighbour. Computing that recursively from every cell is correct, but the same sub-paths are recomputed again and again."),
        code(`
          from typing import List

          def longest_increasing_path_plain(matrix: List[List[int]]) -> int:
              if not matrix or not matrix[0]:
                  return 0
              rows, cols = len(matrix), len(matrix[0])

              def dfs(r: int, c: int) -> int:  # no memo: recomputed every time
                  best = 1
                  for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                      if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                          best = max(best, 1 + dfs(nr, nc))
                  return best

              return max(dfs(r, c) for r in range(rows) for c in range(cols))
          `, `
          function longestIncreasingPathPlain(matrix) {
            if (!matrix.length || !matrix[0].length) return 0;
            const rows = matrix.length, cols = matrix[0].length;
            const dfs = (r, c) => { // no memo: recomputed every time
              let best = 1;
              for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) best = Math.max(best, 1 + dfs(nr, nc));
              }
              return best;
            };
            let answer = 0;
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) answer = Math.max(answer, dfs(r, c));
            return answer;
          }
          `, `
          public int longestIncreasingPathPlain(int[][] matrix) {
              if (matrix.length == 0 || matrix[0].length == 0) return 0;
              int answer = 0;
              for (int r = 0; r < matrix.length; r++)
                  for (int c = 0; c < matrix[0].length; c++) answer = Math.max(answer, dfs(matrix, r, c));
              return answer;
          }

          private int dfs(int[][] m, int r, int c) { // no memo: recomputed every time
              int best = 1;
              int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
              for (int[] d : dirs) {
                  int nr = r + d[0], nc = c + d[1];
                  if (nr >= 0 && nr < m.length && nc >= 0 && nc < m[0].length && m[nr][nc] > m[r][c]) {
                      best = Math.max(best, 1 + dfs(m, nr, nc));
                  }
              }
              return best;
          }
          `),
        cost("Exponential in the worst case: a cell reachable along many increasing routes is explored once per route.", "$O(m·n)$ recursion depth."),
        ap(2, 'Depth-first search with memoisation (optimal)'),
        p("The answer for a cell never changes, so we can **remember** it. With memoisation each cell's longest path is computed once and reused by every neighbour that asks."),
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
        h('Approach 3: Topological order, peeling layers (also optimal)'),
        p("The same DAG can be processed without recursion. A cell with **no larger neighbour** is a peak: every increasing path ends at one. Remove all peaks (layer 1), then every cell whose larger neighbours are all removed (layer 2), and so on, like Kahn's algorithm in [Prerequisites](#/graphs/prerequisites). The number of layers is the length of the longest path."),
        code(`
          from typing import List

          def longest_increasing_path_topological(matrix: List[List[int]]) -> int:
              if not matrix or not matrix[0]:
                  return 0
              rows, cols = len(matrix), len(matrix[0])
              dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))
              # out-degree = number of strictly larger neighbours
              out = [[sum(1 for dr, dc in dirs
                          if 0 <= r + dr < rows and 0 <= c + dc < cols and matrix[r + dr][c + dc] > matrix[r][c])
                      for c in range(cols)] for r in range(rows)]
              layer = [(r, c) for r in range(rows) for c in range(cols) if out[r][c] == 0]  # peaks
              length = 0
              while layer:  # peel the DAG one layer at a time
                  length += 1
                  nxt = []
                  for r, c in layer:
                      for dr, dc in dirs:
                          nr, nc = r + dr, c + dc
                          if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] < matrix[r][c]:
                              out[nr][nc] -= 1
                              if out[nr][nc] == 0:
                                  nxt.append((nr, nc))
                  layer = nxt
              return length
          `, `
          function longestIncreasingPathTopological(matrix) {
            if (!matrix.length || !matrix[0].length) return 0;
            const rows = matrix.length, cols = matrix[0].length;
            const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            const inside = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;
            const out = matrix.map((row, r) => row.map((v, c) =>
              dirs.filter(([dr, dc]) => inside(r + dr, c + dc) && matrix[r + dr][c + dc] > v).length)); // larger neighbours
            let layer = [];
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (out[r][c] === 0) layer.push([r, c]); // peaks
            let length = 0;
            while (layer.length) { // peel the DAG one layer at a time
              length++;
              const next = [];
              for (const [r, c] of layer) {
                for (const [dr, dc] of dirs) {
                  const nr = r + dr, nc = c + dc;
                  if (inside(nr, nc) && matrix[nr][nc] < matrix[r][c] && --out[nr][nc] === 0) next.push([nr, nc]);
                }
              }
              layer = next;
            }
            return length;
          }
          `, `
          public int longestIncreasingPathTopological(int[][] matrix) {
              if (matrix.length == 0 || matrix[0].length == 0) return 0;
              int rows = matrix.length, cols = matrix[0].length;
              int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
              int[][] out = new int[rows][cols]; // number of larger neighbours
              List<int[]> layer = new ArrayList<>();
              for (int r = 0; r < rows; r++) {
                  for (int c = 0; c < cols; c++) {
                      for (int[] d : dirs) {
                          int nr = r + d[0], nc = c + d[1];
                          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) out[r][c]++;
                      }
                      if (out[r][c] == 0) layer.add(new int[]{r, c}); // peaks
                  }
              }
              int length = 0;
              while (!layer.isEmpty()) { // peel the DAG one layer at a time
                  length++;
                  List<int[]> next = new ArrayList<>();
                  for (int[] cell : layer) {
                      for (int[] d : dirs) {
                          int nr = cell[0] + d[0], nc = cell[1] + d[1];
                          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] < matrix[cell[0]][cell[1]]
                                  && --out[nr][nc] == 0) next.add(new int[]{nr, nc});
                      }
                  }
                  layer = next;
              }
              return length;
          }
          `),
        cost("$O(m·n)$.", "$O(m·n)$ for the out-degrees and layers, with no recursion."),
        vs([
          ['1. Plain DFS from every cell', 'exponential', '$O(m·n)$', 'Never; it shows why memoisation is needed.'],
          ['2. DFS + memo', '$O(m·n)$', '$O(m·n)$', 'The usual answer; recursion depth up to $m·n$.'],
          ['3. Topological layers', '$O(m·n)$', '$O(m·n)$', 'Iterative; no stack-overflow risk on huge grids.'],
        ]),
        tests([
          ['matrix = []', '0', 'Empty matrix.'],
          ['matrix = [[7]]', '1', 'A single cell.'],
          ['matrix = [[1, 1], [1, 1]]', '1', 'Equal values: no step is strictly increasing.'],
          ['matrix = [[1, 2, 3]]', '3', 'A single row.'],
          ['matrix = [[3, 4, 5], [2, 7, 6], [1, 8, 9]]', '9', 'A spiral path through every cell.'],
          ['matrix = [[1, 5, 8], [3, 4, 4], [7, 9, 2]]', '5', 'Example 1.'],
        ], { fn: ['longest_increasing_path_plain', 'longest_increasing_path', 'longest_increasing_path_topological'] }),
        tips(
          "Point out why no visited set is needed: strictly increasing paths can't loop back to a cell.",
          "This is DP on a DAG. The memo version computes it top-down; the layer version computes it bottom-up in topological order."
        ),
      ],
    },

    {
      id: 'shortest-transformation-sequence',
      title: 'Shortest Transformation Sequence',
      body: [
        p("Given a `start` word, an `end` word and a dictionary, find the length of the **shortest sequence** of words from start to end where each step changes **exactly one letter** and every intermediate word is in the dictionary. Return the number of words in the sequence, or 0 if it's impossible."),
        ex('start = "red", end = "hit", dictionary = ["red", "bed", "hat", "rod", "rad", "rat", "hit", "bad", "bat"]', '5', 'red → rad → rat → hat → hit.'),
        p("Treat each word as a node, with an edge between words that differ by one letter. The question is now the **shortest path in an unweighted graph**, which **breadth-first search** solves: BFS reaches nodes in order of distance from the start."),
        ap(1, 'Build the whole graph, then BFS'),
        p("Compare every pair of dictionary words (plus the start word), connect the pairs that differ in exactly one position, and run BFS on the resulting graph."),
        code(`
          from collections import deque
          from typing import List

          def shortest_transformation_pairwise(start: str, end: str, dictionary: List[str]) -> int:
              words = list(dict.fromkeys([start] + dictionary))  # unique, start first
              if end not in words:
                  return 0
              def one_apart(a: str, b: str) -> bool:
                  return len(a) == len(b) and sum(x != y for x, y in zip(a, b)) == 1
              graph = {w: [v for v in words if one_apart(w, v)] for w in words}  # every pair
              queue, seen = deque([(start, 1)]), {start}
              while queue:
                  word, length = queue.popleft()
                  if word == end:
                      return length
                  for nxt in graph[word]:
                      if nxt not in seen:
                          seen.add(nxt)
                          queue.append((nxt, length + 1))
              return 0
          `, `
          function shortestTransformationPairwise(start, end, dictionary) {
            const words = [...new Set([start, ...dictionary])];
            if (!words.includes(end)) return 0;
            const oneApart = (a, b) => a.length === b.length && [...a].filter((ch, i) => ch !== b[i]).length === 1;
            const graph = new Map(words.map(w => [w, words.filter(v => oneApart(w, v))])); // every pair
            const queue = [[start, 1]], seen = new Set([start]);
            while (queue.length) {
              const [word, length] = queue.shift();
              if (word === end) return length;
              for (const next of graph.get(word)) if (!seen.has(next)) { seen.add(next); queue.push([next, length + 1]); }
            }
            return 0;
          }
          `, `
          public int shortestTransformationPairwise(String start, String end, List<String> dictionary) {
              List<String> words = new ArrayList<>(new LinkedHashSet<>(List.of(start)));
              for (String w : dictionary) if (!words.contains(w)) words.add(w);
              if (!words.contains(end)) return 0;
              Map<String, List<String>> graph = new HashMap<>();
              for (String a : words) { // every pair
                  graph.put(a, new ArrayList<>());
                  for (String b : words) {
                      if (a.length() != b.length()) continue;
                      int diff = 0;
                      for (int i = 0; i < a.length(); i++) if (a.charAt(i) != b.charAt(i)) diff++;
                      if (diff == 1) graph.get(a).add(b);
                  }
              }
              Deque<String> queue = new ArrayDeque<>(List.of(start));
              Set<String> seen = new HashSet<>(List.of(start));
              for (int length = 1; !queue.isEmpty(); length++) {
                  for (int size = queue.size(); size > 0; size--) {
                      String word = queue.poll();
                      if (word.equals(end)) return length;
                      for (String next : graph.get(word)) if (seen.add(next)) queue.add(next);
                  }
              }
              return 0;
          }
          `),
        cost("$O(n^2 · L)$ to compare every pair of the $n$ words of length $L$, plus the BFS.", "$O(n^2)$ for the edges in the worst case."),
        p("With tens of thousands of words, comparing every pair dominates. Generating neighbours **on demand** avoids it: a word of length $L$ has at most $25L$ one-letter variants, and a hash set tells us instantly which are real words."),
        ap(2, 'BFS that generates neighbours letter by letter (optimal)'),
        p("For each position, try all 26 letters and keep the candidates that are in the dictionary set."),
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
        h('Approach 3: Bidirectional BFS (faster in practice)'),
        p("BFS from the start explores a frontier that grows very quickly. Searching from **both ends at once** and stopping when the two frontiers touch explores far fewer words: two searches of depth $d/2$ instead of one of depth $d$. Always expand the **smaller** frontier."),
        code(`
          from typing import List

          def shortest_transformation_bidirectional(start: str, end: str, dictionary: List[str]) -> int:
              words = set(dictionary)
              if end not in words:
                  return 0
              if start == end:
                  return 1
              front, back = {start}, {end}
              visited = {start, end}
              length = 1
              while front and back:
                  if len(front) > len(back):
                      front, back = back, front  # expand the smaller side
                  nxt = set()
                  for word in front:
                      for i in range(len(word)):
                          for ch in 'abcdefghijklmnopqrstuvwxyz':
                              cand = word[:i] + ch + word[i + 1:]
                              if cand in back:
                                  return length + 1  # the two searches meet
                              if cand in words and cand not in visited:
                                  visited.add(cand)
                                  nxt.add(cand)
                  front = nxt
                  length += 1
              return 0
          `, `
          function shortestTransformationBidirectional(start, end, dictionary) {
            const words = new Set(dictionary);
            if (!words.has(end)) return 0;
            if (start === end) return 1;
            let front = new Set([start]), back = new Set([end]);
            const visited = new Set([start, end]);
            let length = 1;
            while (front.size && back.size) {
              if (front.size > back.size) [front, back] = [back, front]; // expand the smaller side
              const next = new Set();
              for (const word of front) {
                for (let i = 0; i < word.length; i++) {
                  for (let code = 97; code <= 122; code++) {
                    const cand = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
                    if (back.has(cand)) return length + 1; // the two searches meet
                    if (words.has(cand) && !visited.has(cand)) { visited.add(cand); next.add(cand); }
                  }
                }
              }
              front = next;
              length++;
            }
            return 0;
          }
          `, `
          public int shortestTransformationBidirectional(String start, String end, List<String> dictionary) {
              Set<String> words = new HashSet<>(dictionary);
              if (!words.contains(end)) return 0;
              if (start.equals(end)) return 1;
              Set<String> front = new HashSet<>(List.of(start)), back = new HashSet<>(List.of(end));
              Set<String> visited = new HashSet<>(List.of(start, end));
              for (int length = 1; !front.isEmpty() && !back.isEmpty(); length++) {
                  if (front.size() > back.size()) { Set<String> t = front; front = back; back = t; } // smaller side
                  Set<String> next = new HashSet<>();
                  for (String word : front) {
                      char[] chars = word.toCharArray();
                      for (int i = 0; i < chars.length; i++) {
                          char original = chars[i];
                          for (char ch = 'a'; ch <= 'z'; ch++) {
                              chars[i] = ch;
                              String cand = new String(chars);
                              if (back.contains(cand)) return length + 1; // the two searches meet
                              if (words.contains(cand) && visited.add(cand)) next.add(cand);
                          }
                          chars[i] = original;
                      }
                  }
                  front = next;
              }
              return 0;
          }
          `),
        cost("Same worst case as one-sided BFS, but typically far fewer words are explored.", "$O(n · L)$."),
        vs([
          ['1. Pairwise graph + BFS', '$O(n^2 · L)$', '$O(n^2)$', 'Small dictionaries.'],
          ['2. BFS with generated neighbours', '$O(n · L^2 · 26)$', '$O(n · L)$', 'The expected answer.'],
          ['3. Bidirectional BFS', 'same worst case, much faster in practice', '$O(n · L)$', 'A strong follow-up answer.'],
        ]),
        tests([
          ['start = "cat", end = "cat", dictionary = ["cat"]', '1', 'Start equals end: a sequence of one word.'],
          ['start = "cat", end = "dog", dictionary = ["cot", "cog"]', '0', 'The end word is not in the dictionary.'],
          ['start = "abc", end = "xyz", dictionary = ["xyz", "abd"]', '0', 'No chain reaches the end word.'],
          ['start = "a", end = "c", dictionary = ["a", "b", "c"]', '2', 'One-letter words.'],
          ['start = "cold", end = "warm", dictionary = ["cord", "card", "ward", "warm", "word", "worm"]', '5', 'Two different shortest chains exist.'],
          ['start = "red", end = "hit", dictionary = ["red", "bed", "hat", "rod", "rad", "rat", "hit", "bad", "bat"]', '5', 'Example 1.'],
        ], { fn: ['shortest_transformation_pairwise', 'shortest_transformation_sequence', 'shortest_transformation_bidirectional'] }),
        tips(
          "Mark words visited **when they are enqueued**, not when they are dequeued. Otherwise the same word can be enqueued many times.",
          "Follow-up: return **all** shortest sequences. Record, for each word, which words led to it at the previous level, then rebuild the paths backwards from the end word."
        ),
      ],
    },

    {
      id: 'connect-the-dots',
      title: 'Connect the Dots',
      body: [
        p("Given points on a 2-D grid, connect all of them with lines so every point is reachable from every other. The cost of connecting two points is their **Manhattan distance** `|x1 - x2| + |y1 - y2|`. Return the **minimum total cost**."),
        ex('points = [[1, 1], [2, 6], [3, 2], [4, 3], [7, 1]]', '15'),
        p("This is the **minimum spanning tree (MST)** problem on a complete graph: every pair of points is an edge weighted by its distance, and we want the cheapest set of edges that connects all points. The cheapest such set never contains a cycle (dropping any edge of a cycle keeps everything connected and saves money), so it's a tree with exactly `n - 1` edges."),
        state('cheapest edges: (3,2)-(4,3) = 2, (1,1)-(3,2) = 3, (2,6)-(4,3) = 5, (4,3)-(7,1) = 5\ntotal = 2 + 3 + 5 + 5 = 15'),

        ap(1, "Kruskal's algorithm: cheapest edges first, with Union-Find"),
        p("Sort all edges by cost, then add them from cheapest to most expensive, **skipping** any edge whose two points are already connected (it would only close a cycle). A Union-Find structure answers \"already connected?\" in near-constant time ([Merging Communities](#/graphs/merging-communities)). Stop after adding `n - 1` edges."),
        code(`
          from typing import List

          def connect_the_dots_kruskal(points: List[List[int]]) -> int:
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
                  if used == n - 1:
                      break
                  ri, rj = find(i), find(j)
                  if ri != rj:                        # joins two components
                      parent[ri] = rj
                      total += cost
                      used += 1
              return total
          `, `
          function connectTheDotsKruskal(points) {
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
              if (used === n - 1) break;
              const ri = find(i), rj = find(j);
              if (ri !== rj) { parent[ri] = rj; total += cost; used++; } // joins two components
            }
            return total;
          }
          `, `
          public int connectTheDotsKruskal(int[][] points) {
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
                  if (used == n - 1) break;
                  int ri = find(parent, e[1]), rj = find(parent, e[2]);
                  if (ri != rj) { parent[ri] = rj; total += e[0]; used++; } // joins two components
              }
              return total;
          }

          private int find(int[] parent, int x) {
              while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
              return x;
          }
          `),
        cost("$O(n^2 log n)$ to build and sort all $n(n-1)/2$ edges.", "$O(n^2)$ for the edge list."),
        p("Kruskal looks at the graph edge by edge. Prim's algorithm grows **one tree** instead, adding the cheapest edge that leaves it."),

        ap(2, "Prim's algorithm with a min-heap"),
        p("Start the tree at point 0. Keep a min-heap of `(cost, point)` candidates for reaching points outside the tree. Repeatedly pop the cheapest candidate; if its point is already in the tree, skip it, otherwise add it and push edges from it to every point still outside."),
        code(`
          import heapq
          from typing import List

          def connect_the_dots_prim_heap(points: List[List[int]]) -> int:
              n = len(points)
              in_tree = [False] * n
              heap = [(0, 0)]  # (cost to attach, point)
              total = 0
              while heap:
                  cost, i = heapq.heappop(heap)
                  if in_tree[i]:
                      continue  # already attached more cheaply
                  in_tree[i] = True
                  total += cost
                  for j in range(n):
                      if not in_tree[j]:
                          d = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                          heapq.heappush(heap, (d, j))
              return total
          `, `
          // Uses the Heap class from "Introduction to Heaps".
          function connectTheDotsPrimHeap(points) {
            const n = points.length;
            const inTree = new Array(n).fill(false);
            const heap = new Heap((a, b) => a[0] - b[0]); // [cost to attach, point]
            if (n) heap.push([0, 0]);
            let total = 0;
            while (heap.size()) {
              const [cost, i] = heap.pop();
              if (inTree[i]) continue; // already attached more cheaply
              inTree[i] = true;
              total += cost;
              for (let j = 0; j < n; j++) {
                if (!inTree[j]) heap.push([Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]), j]);
              }
            }
            return total;
          }
          `, `
          public int connectTheDotsPrimHeap(int[][] points) {
              int n = points.length, total = 0;
              boolean[] inTree = new boolean[n];
              PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0])); // {cost, point}
              if (n > 0) heap.offer(new int[]{0, 0});
              while (!heap.isEmpty()) {
                  int[] top = heap.poll();
                  int i = top[1];
                  if (inTree[i]) continue; // already attached more cheaply
                  inTree[i] = true;
                  total += top[0];
                  for (int j = 0; j < n; j++) {
                      if (!inTree[j]) heap.offer(new int[]{Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]), j});
                  }
              }
              return total;
          }
          `),
        cost("$O(n^2 log n)$: up to $n^2$ heap entries.", "$O(n^2)$ for the heap."),
        p("On a **complete** graph every point is a candidate at every step, so the heap only adds overhead. A plain array of best distances is simpler and faster."),

        ap(3, "Prim's algorithm with an array of best distances (optimal for dense graphs)"),
        p("Keep `best[j]`: the cheapest known cost to attach point `j` to the tree. Each step, scan the array for the cheapest point outside the tree, add it, and use it to lower `best` for every other outside point. That's $n$ steps of $O(n)$ work, with no sorting and no heap."),
        state('start at (1,1): best = [·, 6, 3, 5, 6]\nadd (3,2) +3: best → (2,6) 5, (4,3) 2, (7,1) 5\nadd (4,3) +2: best → (2,6) 5, (7,1) 5\nadd (2,6) +5, then (7,1) +5\ntotal = 3 + 2 + 5 + 5 = 15'),
        impl(`
          from typing import List

          def connect_the_dots(points: List[List[int]]) -> int:
              n = len(points)
              if n == 0:
                  return 0
              INF = float('inf')
              best = [INF] * n  # cheapest cost to attach each point to the tree
              in_tree = [False] * n
              best[0] = 0
              total = 0
              for _ in range(n):
                  # The cheapest point that isn't in the tree yet.
                  i = min((j for j in range(n) if not in_tree[j]), key=lambda j: best[j])
                  in_tree[i] = True
                  total += best[i]
                  for j in range(n):  # the new point may offer cheaper connections
                      if not in_tree[j]:
                          d = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                          best[j] = min(best[j], d)
              return total
          `, `
          function connectTheDots(points) {
            const n = points.length;
            if (!n) return 0;
            const best = new Array(n).fill(Infinity); // cheapest cost to attach each point
            const inTree = new Array(n).fill(false);
            best[0] = 0;
            let total = 0;
            for (let step = 0; step < n; step++) {
              let i = -1; // the cheapest point not yet in the tree
              for (let j = 0; j < n; j++) if (!inTree[j] && (i === -1 || best[j] < best[i])) i = j;
              inTree[i] = true;
              total += best[i];
              for (let j = 0; j < n; j++) { // the new point may offer cheaper connections
                if (!inTree[j]) best[j] = Math.min(best[j], Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]));
              }
            }
            return total;
          }
          `, `
          public int connectTheDots(int[][] points) {
              int n = points.length, total = 0;
              if (n == 0) return 0;
              int[] best = new int[n]; // cheapest cost to attach each point
              Arrays.fill(best, Integer.MAX_VALUE);
              boolean[] inTree = new boolean[n];
              best[0] = 0;
              for (int step = 0; step < n; step++) {
                  int i = -1; // the cheapest point not yet in the tree
                  for (int j = 0; j < n; j++) if (!inTree[j] && (i == -1 || best[j] < best[i])) i = j;
                  inTree[i] = true;
                  total += best[i];
                  for (int j = 0; j < n; j++) { // the new point may offer cheaper connections
                      if (!inTree[j]) best[j] = Math.min(best[j], Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]));
                  }
              }
              return total;
          }
          `),
        cx("$O(n^2)$: $n$ rounds, each scanning and updating $n$ points. Since the graph has about $n^2/2$ edges, that's linear in the size of the graph.",
          "$O(n)$ for the two arrays: edges are computed on the fly, never stored."),
        vs([
          ['1. Kruskal + Union-Find', '$O(n^2 log n)$', '$O(n^2)$', 'Sparse graphs given as an edge list.'],
          ['2. Prim with a heap', '$O(n^2 log n)$', '$O(n^2)$', 'Sparse graphs given as adjacency lists.'],
          ['3. Prim with an array', '$O(n^2)$', '$O(n)$', 'Dense or complete graphs, like this one.'],
        ]),
        tests([
          ['points = [[0, 0]]', '0', 'One point needs no lines.'],
          ['points = [[0, 0], [3, 4]]', '7', 'Two points: a single line.'],
          ['points = [[1, 1], [1, 1], [5, 5]]', '8', 'Duplicate points connect for free.'],
          ['points = [[0, 0], [0, 2], [2, 0], [2, 2]]', '6', 'A square: three sides, not the diagonals.'],
          ['points = [[-2, -3], [4, 1], [0, 0]]', '10', 'Negative coordinates.'],
          ['points = [[1, 1], [2, 6], [3, 2], [4, 3], [7, 1]]', '15', 'Example 1.'],
        ], { fn: ['connect_the_dots_kruskal', 'connect_the_dots_prim_heap', 'connect_the_dots'] }),
        tips(
          "Recognise the MST shape from the wording: *connect everything at minimum total cost*. If the question asks for the cheapest path between **two** points instead, that's shortest path (Dijkstra), not MST.",
          "Pick the algorithm by graph density and say why: Kruskal for edge lists, Prim with an array for complete graphs."
        ),
      ],
    },
  ]);
})();
