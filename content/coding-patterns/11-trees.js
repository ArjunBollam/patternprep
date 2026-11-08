(function () {
  const { p, h, h3, ul, ol, note, ex, tree, state, code, impl, cx, table, pre } = K;

  K.section({
    id: 'trees',
    title: 'Trees',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Trees',
        body: [
          p("A **tree** is a hierarchy of nodes connected by edges, with one **root** and no cycles. Every node except the root has exactly one parent. In a **binary tree** each node has at most two children, `left` and `right`. Nodes with no children are **leaves**, and the **height** of a tree is the number of nodes on its longest root-to-leaf path."),
          tree([8, 3, 10, 1, 6, null, 14, null, null, 4, 7], { hl: [8], hl2: [1, 4, 7, 14], cap: 'root in orange, leaves in blue' }),
          h('The node class used in these lessons'),
          code(`
            class TreeNode:
                def __init__(self, val=0, left=None, right=None):
                    self.val = val
                    self.left = left
                    self.right = right
            `, `
            class TreeNode {
              constructor(val = 0, left = null, right = null) {
                this.val = val;
                this.left = left;
                this.right = right;
              }
            }
            `, `
            class TreeNode {
                int val;
                TreeNode left, right;
                TreeNode(int val) { this.val = val; }
            }
            `),
          h('Traversals'),
          table(['Traversal', 'Order', 'Typical use'], [
            ['Pre-order (DFS)', 'node, left, right', 'copying / serialising a tree, top-down information'],
            ['In-order (DFS)', 'left, node, right', 'visits a **BST** in sorted order'],
            ['Post-order (DFS)', 'left, right, node', 'bottom-up answers: heights, sums, deleting a tree'],
            ['Level-order (BFS)', 'level by level with a queue', 'anything about levels: widths, rightmost nodes, shortest depth'],
          ]),
          p("For the tree above: pre-order is 8 3 1 6 4 7 10 14, in-order is 1 3 4 6 7 8 10 14 (sorted, because it's a binary search tree), and level-order is 8 3 10 1 6 14 4 7."),
          h('Thinking recursively'),
          p("Most tree problems are solved by asking: **if I already had the answer for the left and right subtrees, how would I combine them for this node?** Write that combination, add a base case for `null`, and the recursion handles the rest. Recursion depth equals the tree height, so space is $O(h)$: $O(\\log n)$ for a balanced tree, $O(n)$ for a degenerate (linked-list-shaped) one."),
          h('Binary search trees'),
          p("A **binary search tree (BST)** adds an ordering rule: every value in a node's left subtree is smaller than the node, and every value in its right subtree is larger. Searching, inserting and deleting then take $O(h)$ time, like a binary search that follows pointers."),
          h('Real-world uses'),
          ul(
            "**File systems** and **the DOM** of every web page are trees.",
            "**Database indexes** (B-trees, B+ trees) and **ordered maps** like Java's `TreeMap` (a red-black tree).",
            "**Compilers** build abstract syntax trees from source code.",
            "**Decision trees** in machine learning and **organisation charts**."
          ),
        ],
      },

      {
        id: 'invert-binary-tree',
        title: 'Invert Binary Tree',
        body: [
          p("**Invert** a binary tree: produce its **mirror image** by swapping the left and right children of **every** node. Return the root."),
          ex('root = [5, 1, 8, null, 6, 2, 9]  (level order)', '[5, 8, 1, 9, 2, 6]'),
          K.row(
            tree([5, 1, 8, null, 6, 2, 9], { cap: 'before' }),
            tree([5, 8, 1, 9, 2, 6], { cap: 'after', hl2: [8, 1] })
          ),
          h('Intuition'),
          p("Mirroring the whole tree means: swap the root's two subtrees, and mirror each of those subtrees too. That's a direct recursive definition:"),
          ol(
            "If the node is `null`, there's nothing to do.",
            "Swap `node.left` and `node.right`.",
            "Recursively invert both children."
          ),
          p("The order of swapping vs. recursing doesn't matter, as long as every node gets its children swapped exactly once. An iterative BFS or DFS that swaps each node it visits works equally well and avoids deep recursion on very tall trees."),
          impl(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def invert_binary_tree(root: TreeNode) -> TreeNode:
                if root is None:
                    return None
                root.left, root.right = root.right, root.left
                invert_binary_tree(root.left)
                invert_binary_tree(root.right)
                return root
            `, `
            function invertBinaryTree(root) {
              if (!root) return null;
              [root.left, root.right] = [root.right, root.left];
              invertBinaryTree(root.left);
              invertBinaryTree(root.right);
              return root;
            }
            `, `
            public TreeNode invertBinaryTree(TreeNode root) {
                if (root == null) return null;
                TreeNode tmp = root.left;
                root.left = root.right;
                root.right = tmp;
                invertBinaryTree(root.left);
                invertBinaryTree(root.right);
                return root;
            }
            `),
          cx("$O(n)$. Every node is visited once.", "$O(h)$ for the recursion stack, where $h$ is the tree's height."),
        ],
      },

      {
        id: 'balanced-binary-tree-validation',
        title: 'Balanced Binary Tree Validation',
        body: [
          p("A binary tree is **height-balanced** if, for **every** node, the heights of its left and right subtrees differ by **at most 1**. Determine whether a tree is height-balanced."),
          ex('root = [1, 2, 3, 4, 5, null, 6, null, null, 7]', 'True'),
          ex('root = [1, 2, 3, 4, null, null, null, 5]', 'False', 'node 2 has a left subtree of height 2 and an empty right subtree (height 0).'),
          K.row(
            tree([1, 2, 3, 4, 5, null, 6, null, null, 7], { cap: 'balanced' }),
            tree([1, 2, 3, 4, null, null, null, 5], { hl: [2], cap: 'unbalanced at node 2' })
          ),
          h('Intuition'),
          p("A top-down approach computes the height of both subtrees at every node, but each height computation is itself $O(n)$, giving $O(n^2)$ for skewed trees."),
          p("Instead, go **bottom-up** with a post-order traversal: each call returns its subtree's **height**, and the parent checks the difference immediately. If any subtree is unbalanced, return a sentinel like `-1` so the imbalance propagates straight up without further checks."),
          state('height(null) = 0\nheight(node) = -1 if a child returned -1 or |hL - hR| > 1\n             = 1 + max(hL, hR) otherwise'),
          impl(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def balanced_binary_tree_validation(root: TreeNode) -> bool:
                return height_if_balanced(root) != -1

            def height_if_balanced(node: TreeNode) -> int:
                if node is None:
                    return 0
                left = height_if_balanced(node.left)
                if left == -1:
                    return -1
                right = height_if_balanced(node.right)
                if right == -1:
                    return -1
                if abs(left - right) > 1:
                    return -1
                return 1 + max(left, right)
            `, `
            function balancedBinaryTreeValidation(root) {
              // Returns the height, or -1 if the subtree is unbalanced.
              const heightIfBalanced = node => {
                if (!node) return 0;
                const left = heightIfBalanced(node.left);
                if (left === -1) return -1;
                const right = heightIfBalanced(node.right);
                if (right === -1) return -1;
                if (Math.abs(left - right) > 1) return -1;
                return 1 + Math.max(left, right);
              };
              return heightIfBalanced(root) !== -1;
            }
            `, `
            public boolean balancedBinaryTreeValidation(TreeNode root) {
                return heightIfBalanced(root) != -1;
            }

            // Returns the height, or -1 if the subtree is unbalanced.
            private int heightIfBalanced(TreeNode node) {
                if (node == null) return 0;
                int left = heightIfBalanced(node.left);
                if (left == -1) return -1;
                int right = heightIfBalanced(node.right);
                if (right == -1) return -1;
                if (Math.abs(left - right) > 1) return -1;
                return 1 + Math.max(left, right);
            }
            `),
          cx("$O(n)$. Each node is visited once.", "$O(h)$ for the recursion stack."),
        ],
      },

      {
        id: 'rightmost-nodes-of-a-binary-tree',
        title: 'Rightmost Nodes of a Binary Tree',
        body: [
          p("Imagine standing to the **right** of a binary tree. Return the values of the nodes you can see, from top to bottom: the **rightmost node of each level**."),
          ex('root = [1, 2, 3, 4, 5, null, 6, null, null, 7]', '[1, 3, 6, 7]', 'node 7 is on the left side of the tree, but it is the only node on its level, so it is visible.'),
          tree([1, 2, 3, 4, 5, null, 6, null, null, 7], { hl: [1, 3, 6, 7] }),
          h('Intuition'),
          p("\"Rightmost **per level**\" is a level-order question, so use **breadth-first search** with a queue. Process the tree one level at a time: record how many nodes are in the queue at the start of a level, pop exactly that many, and the **last** one popped is the rightmost node of that level."),
          state('level 0: [1]        → 1\nlevel 1: [2, 3]     → 3\nlevel 2: [4, 5, 6]  → 6\nlevel 3: [7]        → 7'),
          note("A DFS alternative visits right children before left ones and records the first node it meets at each new depth."),
          impl(`
            from collections import deque
            from typing import List

            # TreeNode: val, left, right (see Introduction to Trees)

            def rightmost_nodes(root: TreeNode) -> List[int]:
                if root is None:
                    return []
                result = []
                queue = deque([root])
                while queue:
                    level_size = len(queue)
                    for i in range(level_size):
                        node = queue.popleft()
                        if node.left:
                            queue.append(node.left)
                        if node.right:
                            queue.append(node.right)
                        if i == level_size - 1:   # last node of this level
                            result.append(node.val)
                return result
            `, `
            function rightmostNodes(root) {
              if (!root) return [];
              const result = [];
              let level = [root];
              while (level.length) {
                result.push(level[level.length - 1].val); // last node of this level
                const next = [];
                for (const node of level) {
                  if (node.left) next.push(node.left);
                  if (node.right) next.push(node.right);
                }
                level = next;
              }
              return result;
            }
            `, `
            public List<Integer> rightmostNodes(TreeNode root) {
                List<Integer> result = new ArrayList<>();
                if (root == null) return result;
                Queue<TreeNode> queue = new ArrayDeque<>();
                queue.offer(root);
                while (!queue.isEmpty()) {
                    int levelSize = queue.size();
                    for (int i = 0; i < levelSize; i++) {
                        TreeNode node = queue.poll();
                        if (node.left != null) queue.offer(node.left);
                        if (node.right != null) queue.offer(node.right);
                        if (i == levelSize - 1) result.add(node.val); // last of level
                    }
                }
                return result;
            }
            `),
          cx("$O(n)$. Each node is enqueued and dequeued once.", "$O(w)$, where $w$ is the maximum number of nodes on one level (up to about $n/2$)."),
        ],
      },

      {
        id: 'binary-search-tree-validation',
        title: 'Binary Search Tree Validation',
        body: [
          p("Determine whether a binary tree is a valid **binary search tree**: for every node, **all** values in its left subtree are strictly smaller, and **all** values in its right subtree are strictly larger."),
          ex('root = [5, 2, 7, 1, 4, 6, 9]', 'True'),
          ex('root = [5, 2, 7, 1, 6]', 'False', '6 is in the left subtree of 5 but is larger than 5.'),
          K.row(
            tree([5, 2, 7, 1, 4, 6, 9], { cap: 'valid' }),
            tree([5, 2, 7, 1, 6], { hl: [6], cap: 'invalid: 6 > 5' })
          ),
          h('Intuition'),
          p("Checking only that each node is bigger than its left child and smaller than its right child is **not enough**: in the second tree, 6 is a fine right child of 2, but it's on the wrong side of the root."),
          p("Each node must instead lie within an **allowed range** `(low, high)` inherited from all its ancestors. The root may be anything: $(-∞, +∞)$. Going **left** tightens the upper bound to the parent's value; going **right** tightens the lower bound."),
          state('5  in (-∞, +∞)  ✓\n2  in (-∞, 5)    ✓\n1  in (-∞, 2)    ✓\n6  in (2, 5)     ✗  → not a BST'),
          note("An equivalent check: an in-order traversal of a BST yields strictly increasing values. Comparing each visited value with the previous one validates the tree."),
          impl(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def binary_search_tree_validation(root: TreeNode) -> bool:
                return is_within(root, float('-inf'), float('inf'))

            def is_within(node: TreeNode, low: float, high: float) -> bool:
                if node is None:
                    return True
                if not (low < node.val < high):
                    return False
                return (is_within(node.left, low, node.val) and
                        is_within(node.right, node.val, high))
            `, `
            function binarySearchTreeValidation(root) {
              const isWithin = (node, low, high) => {
                if (!node) return true;
                if (node.val <= low || node.val >= high) return false;
                return isWithin(node.left, low, node.val) && isWithin(node.right, node.val, high);
              };
              return isWithin(root, -Infinity, Infinity);
            }
            `, `
            public boolean binarySearchTreeValidation(TreeNode root) {
                return isWithin(root, Long.MIN_VALUE, Long.MAX_VALUE);
            }

            private boolean isWithin(TreeNode node, long low, long high) {
                if (node == null) return true;
                if (node.val <= low || node.val >= high) return false;
                return isWithin(node.left, low, node.val) && isWithin(node.right, node.val, high);
            }
            `),
          cx("$O(n)$. Each node is checked once.", "$O(h)$ for the recursion stack."),
        ],
      },

      {
        id: 'lowest-common-ancestor',
        title: 'Lowest Common Ancestor',
        body: [
          p("Given a binary tree and two of its nodes `p` and `q`, return their **lowest common ancestor (LCA)**: the deepest node that has both `p` and `q` as descendants. A node counts as a descendant of itself."),
          ex('root = [1, 2, 3, 4, 5, 6, 7, null, null, 8, 9], p = 8, q = 4', 'node 2'),
          ex('same tree, p = 8, q = 7', 'node 1'),
          ex('same tree, p = 5, q = 9', 'node 5', 'a node can be its own ancestor.'),
          tree([1, 2, 3, 4, 5, 6, 7, null, null, 8, 9], { hl: [2], hl2: [8, 4] }),
          h('Intuition'),
          p("Ask each subtree a single question: **\"which of `p` and `q` did you find?\"** A post-order DFS answers it bottom-up. Each call returns:"),
          ul(
            "the node itself, if it **is** `p` or `q`;",
            "otherwise, whatever its children reported: if **both** children found something, this node is where the two paths meet, so it's the LCA and we return it; if only one child found something, pass that result up; if neither did, return `null`."
          ),
          state('find LCA(8, 4):\nnode 8 → returns 8;    node 9 → null\nnode 5 → only left found → returns 8\nnode 4 → returns 4\nnode 2 → left found 4, right found 8 → returns 2 (the LCA)\nnode 1 → only left found → returns 2'),
          p("If `p` is an ancestor of `q`, the search stops at `p` and returns it without looking below, which is correct because `p` is then the LCA."),
          impl(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def lowest_common_ancestor(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
                if root is None or root is p or root is q:
                    return root
                left = lowest_common_ancestor(root.left, p, q)
                right = lowest_common_ancestor(root.right, p, q)
                if left and right:
                    return root          # p and q are on different sides
                return left or right     # pass up whichever was found
            `, `
            function lowestCommonAncestor(root, p, q) {
              if (!root || root === p || root === q) return root;
              const left = lowestCommonAncestor(root.left, p, q);
              const right = lowestCommonAncestor(root.right, p, q);
              if (left && right) return root; // p and q are on different sides
              return left || right;           // pass up whichever was found
            }
            `, `
            public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
                if (root == null || root == p || root == q) return root;
                TreeNode left = lowestCommonAncestor(root.left, p, q);
                TreeNode right = lowestCommonAncestor(root.right, p, q);
                if (left != null && right != null) return root; // different sides
                return left != null ? left : right;             // pass up what was found
            }
            `),
          cx("$O(n)$. Each node is visited at most once.", "$O(h)$ for the recursion stack."),
        ],
      },

      {
        id: 'maximum-sum-of-a-continuous-path',
        title: 'Maximum Sum of a Continuous Path in a Binary Tree',
        body: [
          p("A **path** in a binary tree is a sequence of nodes where each consecutive pair is connected by an edge, and no node appears twice. The path doesn't need to pass through the root, and it can go up and then down (but never down, up, and down again). Return the **largest sum of node values** over all non-empty paths. Values may be negative."),
          ex('root = [3, 4, -2, 6, -1, null, 5]', '16', 'the path 6 → 4 → 3 → -2 → 5.'),
          ex('root = [-3]', '-3'),
          tree([3, 4, -2, 6, -1, null, 5], { hl: [6, 4, 3, -2, 5] }),
          h('Intuition'),
          p("Every path has a single **highest node**, its \"peak\". The best path peaking at `node` is:"),
          state('node.val + best downward gain from left + best downward gain from right'),
          p("where a **gain** is the best sum of a path that starts at a child and goes straight down. If a gain is negative we simply don't extend into that side, so we clamp gains at 0."),
          p("So a post-order DFS does two things at each node:"),
          ol(
            "**Update the global answer** with the path that peaks here (it may use both sides).",
            "**Return the gain** to the parent. A parent can only continue the path through **one** side, so the gain is `node.val + max(left_gain, right_gain)`."
          ),
          state('gain(6) = 6, gain(-1) = 0 (clamped)\nnode 4: path 4 + 6 + 0 = 10, return gain 10\ngain(5) = 5; node -2: path -2 + 0 + 5 = 3, return gain 3\nnode 3: path 3 + 10 + 3 = 16 ← best'),
          impl(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def max_path_sum(root: TreeNode) -> int:
                best = float('-inf')

                def gain(node: TreeNode) -> int:
                    nonlocal best
                    if node is None:
                        return 0
                    left = max(gain(node.left), 0)    # ignore negative branches
                    right = max(gain(node.right), 0)
                    best = max(best, node.val + left + right)  # path peaking here
                    return node.val + max(left, right)         # extend one side upward

                gain(root)
                return best
            `, `
            function maxPathSum(root) {
              let best = -Infinity;
              const gain = node => {
                if (!node) return 0;
                const left = Math.max(gain(node.left), 0);   // ignore negative branches
                const right = Math.max(gain(node.right), 0);
                best = Math.max(best, node.val + left + right); // path peaking here
                return node.val + Math.max(left, right);       // extend one side upward
              };
              gain(root);
              return best;
            }
            `, `
            private int best;

            public int maxPathSum(TreeNode root) {
                best = Integer.MIN_VALUE;
                gain(root);
                return best;
            }

            private int gain(TreeNode node) {
                if (node == null) return 0;
                int left = Math.max(gain(node.left), 0);   // ignore negative branches
                int right = Math.max(gain(node.right), 0);
                best = Math.max(best, node.val + left + right); // path peaking here
                return node.val + Math.max(left, right);       // extend one side upward
            }
            `),
          cx("$O(n)$. One post-order traversal.", "$O(h)$ for the recursion stack."),
        ],
      },
    ],
  });
})();
