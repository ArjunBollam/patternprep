(function () {
  const { p, h, h3, ul, ol, note, ex, tree, state, code, impl, cx, table, pre, ap, cost, vs, tests, tips } = K;

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
          ap(1, 'Build a mirrored copy'),
          p("If the original tree must stay untouched, build a new tree instead: the copy of a node gets the mirrored copy of its **right** subtree as its left child, and vice versa."),
          code(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def invert_binary_tree_copy(root: TreeNode) -> TreeNode:
                if root is None:
                    return None
                return TreeNode(root.val,
                                invert_binary_tree_copy(root.right),
                                invert_binary_tree_copy(root.left))
            `, `
            function invertBinaryTreeCopy(root) {
              if (!root) return null;
              return new TreeNode(root.val, invertBinaryTreeCopy(root.right), invertBinaryTreeCopy(root.left));
            }
            `, `
            public TreeNode invertBinaryTreeCopy(TreeNode root) {
                if (root == null) return null;
                TreeNode copy = new TreeNode(root.val);
                copy.left = invertBinaryTreeCopy(root.right);
                copy.right = invertBinaryTreeCopy(root.left);
                return copy;
            }
            `),
          cost("$O(n)$.", "$O(n)$ for the new nodes, plus $O(h)$ of recursion."),
          ap(2, 'Iterative swap with a queue'),
          p("To invert **in place** without recursion, visit every node with a breadth-first queue and swap its children as it's dequeued. Any traversal order works, because each node's swap is independent of the others."),
          code(`
            from collections import deque

            # TreeNode: val, left, right (see Introduction to Trees)

            def invert_binary_tree_iterative(root: TreeNode) -> TreeNode:
                queue = deque([root] if root else [])
                while queue:
                    node = queue.popleft()
                    node.left, node.right = node.right, node.left
                    if node.left:
                        queue.append(node.left)
                    if node.right:
                        queue.append(node.right)
                return root
            `, `
            function invertBinaryTreeIterative(root) {
              const queue = root ? [root] : [];
              while (queue.length) {
                const node = queue.shift();
                [node.left, node.right] = [node.right, node.left];
                if (node.left) queue.push(node.left);
                if (node.right) queue.push(node.right);
              }
              return root;
            }
            `, `
            public TreeNode invertBinaryTreeIterative(TreeNode root) {
                Deque<TreeNode> queue = new ArrayDeque<>();
                if (root != null) queue.add(root);
                while (!queue.isEmpty()) {
                    TreeNode node = queue.poll();
                    TreeNode tmp = node.left;
                    node.left = node.right;
                    node.right = tmp;
                    if (node.left != null) queue.add(node.left);
                    if (node.right != null) queue.add(node.right);
                }
                return root;
            }
            `),
          cost("$O(n)$.", "$O(w)$ for the queue, where $w$ is the widest level."),
          ap(3, 'Recursive swap in place (optimal, simplest)'),
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
          vs([
            ['1. Mirrored copy', '$O(n)$', '$O(n)$', 'When the input must not change.'],
            ['2. Iterative with a queue', '$O(n)$', '$O(w)$', 'Very deep trees, where recursion could overflow.'],
            ['3. Recursive in place', '$O(n)$', '$O(h)$', 'The usual answer: three lines.'],
          ]),
          tests([
            ['root = []', '[]', 'Empty tree.'],
            ['root = [1]', '[1]', 'A single node.'],
            ['root = [1, 2]', '[1, None, 2]', 'A lone left child becomes a right child.'],
            ['root = [1, 2, 3]', '[1, 3, 2]', 'Two children swap.'],
            ['root = [8, 4, 12, 2, 6, 10, 14]', '[8, 12, 4, 14, 10, 6, 2]', 'A perfect tree: every level reverses.'],
            ['root = [5, 1, 8, None, 6, 2, 9]', '[5, 8, 1, 9, 2, 6]', 'Example 1.'],
          ], { fn: ['invert_binary_tree_copy', 'invert_binary_tree_iterative', 'invert_binary_tree'], conv: { root: 'tree' }, out: 'tree' }),
          note("Trees in the test tables are written in **level order**, left to right, with `None` for a missing child (trailing `None`s are omitted), just like the examples."),
          tips(
            "Clarify whether the tree may be modified. If not, return a mirrored copy.",
            "A natural follow-up: *check whether two trees are mirrors of each other* (see [Binary Tree Symmetry](#/trees/binary-tree-symmetry))."
          ),
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
          ap(1, 'Top-down: compute heights at every node'),
          p("Follow the definition literally: at every node, compute the heights of both subtrees with a separate helper, check the difference, then recurse into both children."),
          code(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def balanced_top_down(root: TreeNode) -> bool:
                if root is None:
                    return True
                if abs(height(root.left) - height(root.right)) > 1:
                    return False
                return balanced_top_down(root.left) and balanced_top_down(root.right)

            def height(node: TreeNode) -> int:
                if node is None:
                    return 0
                return 1 + max(height(node.left), height(node.right))
            `, `
            function balancedTopDown(root) {
              const height = node => (node ? 1 + Math.max(height(node.left), height(node.right)) : 0);
              if (!root) return true;
              if (Math.abs(height(root.left) - height(root.right)) > 1) return false;
              return balancedTopDown(root.left) && balancedTopDown(root.right);
            }
            `, `
            public boolean balancedTopDown(TreeNode root) {
                if (root == null) return true;
                if (Math.abs(height(root.left) - height(root.right)) > 1) return false;
                return balancedTopDown(root.left) && balancedTopDown(root.right);
            }

            private int height(TreeNode node) {
                return node == null ? 0 : 1 + Math.max(height(node.left), height(node.right));
            }
            `),
          cost("$O(n^2)$ for a skewed (chain-like) tree, because each `height` call is $O(n)$; $O(n log n)$ for a balanced tree.", "$O(h)$ for the recursion."),
          p("The heights are recomputed over and over: the height of a deep node is computed once for each of its ancestors."),
          ap(2, 'Bottom-up: return heights, stop at the first imbalance (optimal)'),
          p("Go **bottom-up** with a post-order traversal: each call returns its subtree's **height**, and the parent checks the difference immediately. If any subtree is unbalanced, return a sentinel like `-1` so the imbalance propagates straight up without further checks."),
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
          vs([
            ['1. Top-down heights', '$O(n^2)$ worst case', '$O(h)$', 'Mirrors the definition; recomputes heights.'],
            ['2. Bottom-up with a sentinel', '$O(n)$', '$O(h)$', 'The expected answer: each height is computed once.'],
          ]),
          tests([
            ['root = []', 'True', 'An empty tree is balanced.'],
            ['root = [1]', 'True', 'A single node.'],
            ['root = [1, 2]', 'True', 'Heights differ by exactly one.'],
            ['root = [1, 2, None, 3]', 'False', 'A chain of three nodes.'],
            ['root = [1, 2, 2, 3, None, None, 3, 4, None, None, 4]', 'False', 'The root is fine, but its children are not.'],
            ['root = [1, 2, 3, 4, 5, None, 6, None, None, 7]', 'True', 'Example 1.'],
            ['root = [1, 2, 3, 4, None, None, None, 5]', 'False', 'Example 2.'],
          ], { fn: ['balanced_top_down', 'balanced_binary_tree_validation'], conv: { root: 'tree' } }),
          tips(
            "Point out that *balanced at the root* is not enough. The test with two long single-child chains is balanced at the root but not at its children."
          ),
        ],
      },

      {
        id: 'rightmost-nodes-of-a-binary-tree',
        title: 'Rightmost Nodes of a Binary Tree',
        body: [
          p("Imagine standing to the **right** of a binary tree. Return the values of the nodes you can see, from top to bottom: the **rightmost node of each level**."),
          ex('root = [1, 2, 3, 4, 5, null, 6, null, null, 7]', '[1, 3, 6, 7]', 'node 7 is on the left side of the tree, but it is the only node on its level, so it is visible.'),
          tree([1, 2, 3, 4, 5, null, 6, null, null, 7], { hl: [1, 3, 6, 7] }),
          ap(1, 'Depth-first search, right child first'),
          p("Walk the tree depth-first, but visit the **right** child before the left one, and track the current depth. The first node we reach at each new depth is then the rightmost node of that level, because everything to its right at that depth was visited earlier."),
          code(`
            from typing import List

            # TreeNode: val, left, right (see Introduction to Trees)

            def rightmost_nodes_dfs(root: TreeNode) -> List[int]:
                result = []

                def dfs(node: TreeNode, depth: int) -> None:
                    if node is None:
                        return
                    if depth == len(result):  # first node seen on this level
                        result.append(node.val)
                    dfs(node.right, depth + 1)  # right first
                    dfs(node.left, depth + 1)

                dfs(root, 0)
                return result
            `, `
            function rightmostNodesDfs(root) {
              const result = [];
              const dfs = (node, depth) => {
                if (!node) return;
                if (depth === result.length) result.push(node.val); // first node on this level
                dfs(node.right, depth + 1);                          // right first
                dfs(node.left, depth + 1);
              };
              dfs(root, 0);
              return result;
            }
            `, `
            public List<Integer> rightmostNodesDfs(TreeNode root) {
                List<Integer> result = new ArrayList<>();
                dfs(root, 0, result);
                return result;
            }

            private void dfs(TreeNode node, int depth, List<Integer> result) {
                if (node == null) return;
                if (depth == result.size()) result.add(node.val); // first node on this level
                dfs(node.right, depth + 1, result);                // right first
                dfs(node.left, depth + 1, result);
            }
            `),
          cost("$O(n)$.", "$O(h)$ for the recursion."),
          ap(2, 'Breadth-first search, level by level'),
          p("\"Rightmost **per level**\" is a level-order question, so use **breadth-first search** with a queue. Process the tree one level at a time: record how many nodes are in the queue at the start of a level, pop exactly that many, and the **last** one popped is the rightmost node of that level."),
          state('level 0: [1]        → 1\nlevel 1: [2, 3]     → 3\nlevel 2: [4, 5, 6]  → 6\nlevel 3: [7]        → 7'),
          note("Both approaches are optimal. BFS is the more direct way to say \"per level\"; the DFS version uses less memory on wide, shallow trees."),
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
          vs([
            ['1. DFS, right child first', '$O(n)$', '$O(h)$', 'Deep, narrow trees.'],
            ['2. BFS by level', '$O(n)$', '$O(w)$', 'The most natural answer; easy to adapt to left view, level averages, etc.'],
          ]),
          tests([
            ['root = []', '[]', 'Empty tree.'],
            ['root = [1]', '[1]', 'A single node.'],
            ['root = [1, 2]', '[1, 2]', 'A left child is visible when it is alone on its level.'],
            ['root = [1, None, 2, None, 3]', '[1, 2, 3]', 'A right-leaning chain.'],
            ['root = [1, 2, 3, 4]', '[1, 3, 4]', 'The deepest level only has a left-side node.'],
            ['root = [1, 2, 3, 4, 5, None, 6, None, None, 7]', '[1, 3, 6, 7]', 'Example 1.'],
          ], { fn: ['rightmost_nodes_dfs', 'rightmost_nodes'], conv: { root: 'tree' } }),
          tips(
            "Watch out for the trap answer *keep following the right child*: it misses left-side nodes that stick out below the right side."
          ),
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
          ap(1, 'Brute force: compare each node with its whole subtrees'),
          p("Apply the definition directly: for every node, collect all values in its left subtree and check they're smaller, collect all values in its right subtree and check they're larger, then do the same for both children."),
          code(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def bst_validation_brute_force(root: TreeNode) -> bool:
                if root is None:
                    return True
                if any(v >= root.val for v in values(root.left)):
                    return False
                if any(v <= root.val for v in values(root.right)):
                    return False
                return bst_validation_brute_force(root.left) and bst_validation_brute_force(root.right)

            def values(node: TreeNode) -> list:
                if node is None:
                    return []
                return values(node.left) + [node.val] + values(node.right)
            `, `
            function bstValidationBruteForce(root) {
              const values = node => (node ? [...values(node.left), node.val, ...values(node.right)] : []);
              if (!root) return true;
              if (values(root.left).some(v => v >= root.val)) return false;
              if (values(root.right).some(v => v <= root.val)) return false;
              return bstValidationBruteForce(root.left) && bstValidationBruteForce(root.right);
            }
            `, `
            public boolean bstValidationBruteForce(TreeNode root) {
                if (root == null) return true;
                for (int v : values(root.left, new ArrayList<>())) if (v >= root.val) return false;
                for (int v : values(root.right, new ArrayList<>())) if (v <= root.val) return false;
                return bstValidationBruteForce(root.left) && bstValidationBruteForce(root.right);
            }

            private List<Integer> values(TreeNode node, List<Integer> out) {
                if (node == null) return out;
                values(node.left, out);
                out.add(node.val);
                values(node.right, out);
                return out;
            }
            `),
          cost("$O(n^2)$ for a chain-like tree: every node re-collects its whole subtree.", "$O(n)$ for the collected values."),
          ap(2, 'In-order traversal must be strictly increasing'),
          p("An in-order traversal (left, node, right) of a BST visits the values in **sorted** order. So the tree is a BST exactly when every visited value is larger than the one visited just before it. An iterative traversal with a stack can stop at the first violation."),
          code(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def bst_validation_inorder(root: TreeNode) -> bool:
                prev = float('-inf')
                stack, node = [], root
                while stack or node:
                    while node:  # go as far left as possible
                        stack.append(node)
                        node = node.left
                    node = stack.pop()
                    if node.val <= prev:  # must be strictly increasing
                        return False
                    prev = node.val
                    node = node.right
                return True
            `, `
            function bstValidationInorder(root) {
              let prev = -Infinity;
              const stack = [];
              let node = root;
              while (stack.length || node) {
                while (node) { stack.push(node); node = node.left; } // go far left
                node = stack.pop();
                if (node.val <= prev) return false; // must be strictly increasing
                prev = node.val;
                node = node.right;
              }
              return true;
            }
            `, `
            public boolean bstValidationInorder(TreeNode root) {
                long prev = Long.MIN_VALUE;
                Deque<TreeNode> stack = new ArrayDeque<>();
                TreeNode node = root;
                while (!stack.isEmpty() || node != null) {
                    while (node != null) { stack.push(node); node = node.left; } // go far left
                    node = stack.pop();
                    if (node.val <= prev) return false; // must be strictly increasing
                    prev = node.val;
                    node = node.right;
                }
                return true;
            }
            `),
          cost("$O(n)$.", "$O(h)$ for the stack."),
          ap(3, 'Pass down an allowed range (optimal)'),
          p("Checking only that each node is bigger than its left child and smaller than its right child is **not enough**: in the second tree, 6 is a fine right child of 2, but it's on the wrong side of the root."),
          p("Each node must instead lie within an **allowed range** `(low, high)` inherited from all its ancestors. The root may be anything: $(-∞, +∞)$. Going **left** tightens the upper bound to the parent's value; going **right** tightens the lower bound."),
          state('5  in (-∞, +∞)  ✓\n2  in (-∞, 5)    ✓\n1  in (-∞, 2)    ✓\n6  in (2, 5)     ✗  → not a BST'),
          note("Approaches 2 and 3 are both optimal. The range version stops as soon as it sees a bad node, and it explains **why** the tree is invalid, which interviewers like."),
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
          vs([
            ['1. Compare with whole subtrees', '$O(n^2)$', '$O(n)$', 'Only to restate the definition.'],
            ['2. In-order must increase', '$O(n)$', '$O(h)$', 'Elegant; reuses a standard traversal.'],
            ['3. Allowed range per node', '$O(n)$', '$O(h)$', 'The expected answer.'],
          ]),
          tests([
            ['root = []', 'True', 'An empty tree is a valid BST.'],
            ['root = [1]', 'True', 'A single node.'],
            ['root = [2, 2]', 'False', 'Equal values are not allowed (strictly smaller on the left).'],
            ['root = [2, 1, 3]', 'True', 'The smallest valid BST with two children.'],
            ['root = [5, 1, 8, None, None, 4, 9]', 'False', '4 sits in the right subtree of 5.'],
            ['root = [5, 2, 7, 1, 4, 6, 9]', 'True', 'Example 1.'],
            ['root = [5, 2, 7, 1, 6]', 'False', 'Example 2: the violation is two levels down.'],
          ], { fn: ['bst_validation_brute_force', 'bst_validation_inorder', 'binary_search_tree_validation'], conv: { root: 'tree' } }),
          tips(
            "Ask whether duplicates are allowed and on which side. That decides between `<` and `<=` in the checks.",
            "In Java, use `long` bounds (or nullable `Integer`s): with `int` bounds, a node holding `Integer.MAX_VALUE` would be rejected."
          ),
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
          ap(1, 'Compare the root-to-node paths'),
          p("Record the path from the root down to `p` and the path down to `q`. Both paths start at the root and agree for a while; the **last node they share** is the lowest common ancestor."),
          code(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def lowest_common_ancestor_paths(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
                def path_to(node: TreeNode, target: TreeNode, path: list) -> bool:
                    if node is None:
                        return False
                    path.append(node)
                    if node is target or path_to(node.left, target, path) or path_to(node.right, target, path):
                        return True
                    path.pop()  # target is not below this node
                    return False

                path_p, path_q = [], []
                path_to(root, p, path_p)
                path_to(root, q, path_q)
                lca = None
                for a, b in zip(path_p, path_q):  # equal until the paths split
                    if a is not b:
                        break
                    lca = a
                return lca
            `, `
            function lowestCommonAncestorPaths(root, p, q) {
              const pathTo = (node, target, path) => {
                if (!node) return false;
                path.push(node);
                if (node === target || pathTo(node.left, target, path) || pathTo(node.right, target, path)) return true;
                path.pop(); // target is not below this node
                return false;
              };
              const pathP = [], pathQ = [];
              pathTo(root, p, pathP);
              pathTo(root, q, pathQ);
              let lca = null;
              for (let i = 0; i < Math.min(pathP.length, pathQ.length) && pathP[i] === pathQ[i]; i++) lca = pathP[i];
              return lca;
            }
            `, `
            public TreeNode lowestCommonAncestorPaths(TreeNode root, TreeNode p, TreeNode q) {
                List<TreeNode> pathP = new ArrayList<>(), pathQ = new ArrayList<>();
                pathTo(root, p, pathP);
                pathTo(root, q, pathQ);
                TreeNode lca = null;
                for (int i = 0; i < Math.min(pathP.size(), pathQ.size()) && pathP.get(i) == pathQ.get(i); i++) {
                    lca = pathP.get(i);
                }
                return lca;
            }

            private boolean pathTo(TreeNode node, TreeNode target, List<TreeNode> path) {
                if (node == null) return false;
                path.add(node);
                if (node == target || pathTo(node.left, target, path) || pathTo(node.right, target, path)) return true;
                path.remove(path.size() - 1); // target is not below this node
                return false;
            }
            `),
          cost("$O(n)$: two traversals plus a walk along the paths.", "$O(h)$ for the paths and the recursion."),
          ap(2, 'Parent pointers and an ancestor set'),
          p("If every node knew its parent, we could walk upward from `p`, put all of its ancestors (including `p` itself) in a set, then walk upward from `q` until we hit a node in that set. A traversal fills in a parent map; it can stop as soon as both `p` and `q` have been reached."),
          code(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def lowest_common_ancestor_parents(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
                parent = {root: None}
                stack = [root]
                while p not in parent or q not in parent:  # map parents until both are found
                    node = stack.pop()
                    for child in (node.left, node.right):
                        if child:
                            parent[child] = node
                            stack.append(child)
                ancestors = set()
                while p:  # every ancestor of p, including p itself
                    ancestors.add(p)
                    p = parent[p]
                while q not in ancestors:  # climb from q until we meet one
                    q = parent[q]
                return q
            `, `
            function lowestCommonAncestorParents(root, p, q) {
              const parent = new Map([[root, null]]);
              const stack = [root];
              while (!parent.has(p) || !parent.has(q)) { // map parents until both are found
                const node = stack.pop();
                for (const child of [node.left, node.right]) {
                  if (child) { parent.set(child, node); stack.push(child); }
                }
              }
              const ancestors = new Set();
              for (let a = p; a; a = parent.get(a)) ancestors.add(a); // p and its ancestors
              let b = q;
              while (!ancestors.has(b)) b = parent.get(b);           // climb from q
              return b;
            }
            `, `
            public TreeNode lowestCommonAncestorParents(TreeNode root, TreeNode p, TreeNode q) {
                Map<TreeNode, TreeNode> parent = new HashMap<>();
                parent.put(root, null);
                Deque<TreeNode> stack = new ArrayDeque<>();
                stack.push(root);
                while (!parent.containsKey(p) || !parent.containsKey(q)) { // until both are found
                    TreeNode node = stack.pop();
                    for (TreeNode child : new TreeNode[]{node.left, node.right}) {
                        if (child != null) { parent.put(child, node); stack.push(child); }
                    }
                }
                Set<TreeNode> ancestors = new HashSet<>();
                for (TreeNode a = p; a != null; a = parent.get(a)) ancestors.add(a); // p and its ancestors
                TreeNode b = q;
                while (!ancestors.contains(b)) b = parent.get(b);                  // climb from q
                return b;
            }
            `),
          cost("$O(n)$.", "$O(n)$ for the parent map."),
          ap(3, 'One post-order pass (optimal)'),
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
          vs([
            ['1. Compare root-to-node paths', '$O(n)$', '$O(h)$', 'Easy to explain; two traversals.'],
            ['2. Parent pointers + ancestor set', '$O(n)$', '$O(n)$', 'When nodes already store parent pointers (then it is $O(h)$ time).'],
            ['3. One post-order pass', '$O(n)$', '$O(h)$', 'The expected answer; one traversal, no extra structures.'],
          ]),
          tests([
            ['root = [7], p = 7, q = 7', '7', '`p` and `q` are the same node.'],
            ['root = [1, 2], p = 1, q = 2', '1', 'One node is the parent of the other.'],
            ['root = [1, 2, 3], p = 2, q = 3', '1', 'The two children of the root.'],
            ['root = [1, 2, 3, 4, 5, 6, 7, None, None, 8, 9], p = 6, q = 7', '3', 'Siblings deep in the right subtree.'],
            ['root = [1, 2, 3, 4, 5, 6, 7, None, None, 8, 9], p = 8, q = 4', '2', 'Example 1.'],
            ['root = [1, 2, 3, 4, 5, 6, 7, None, None, 8, 9], p = 8, q = 7', '1', 'Example 2.'],
            ['root = [1, 2, 3, 4, 5, 6, 7, None, None, 8, 9], p = 5, q = 9', '5', 'Example 3: a node is its own ancestor.'],
          ], {
            fn: ['lowest_common_ancestor_paths', 'lowest_common_ancestor_parents', 'lowest_common_ancestor'],
            call: "lambda fn, kw: (lambda root: fn(root, _find(root, kw['p']), _find(root, kw['q'])).val)(_tree(kw['root']))",
            jscall: "(fn, kw) => { const root = tree(kw.root); return fn(root, find(root, kw.p), find(root, kw.q)).val; }",
          }),
          note("In the table, `p` and `q` are given by value (all values in these trees are distinct), and the expected output is the value of the ancestor node."),
          tips(
            "For a **binary search tree**, the LCA is simpler: walk down from the root; while both values are smaller go left, while both are larger go right, otherwise you're at the LCA.",
            "Ask whether `p` and `q` are guaranteed to be in the tree. If not, the post-order version must also confirm that both were actually found."
          ),
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
          p("Every path has a single **highest node**, its \"peak\". The best path peaking at `node` is:"),
          state('node.val + best downward gain from left + best downward gain from right'),
          p("where a **gain** is the best sum of a path that starts at a child and goes straight down. If a gain is negative we simply don't extend into that side, so we clamp gains at 0."),
          ap(1, 'Brute force: try every node as the peak'),
          p("For every node, compute the best downward gains of its two children from scratch, and keep the best `node + left gain + right gain`."),
          code(`
            # TreeNode: val, left, right (see Introduction to Trees)

            def max_path_sum_brute_force(root: TreeNode) -> int:
                def down(node: TreeNode) -> int:  # best path starting at node, going down
                    if node is None:
                        return 0
                    return node.val + max(0, down(node.left), down(node.right))

                best = float('-inf')
                stack = [root] if root else []
                while stack:  # try every node as the peak
                    node = stack.pop()
                    best = max(best, node.val + max(0, down(node.left)) + max(0, down(node.right)))
                    stack.extend(c for c in (node.left, node.right) if c)
                return best
            `, `
            function maxPathSumBruteForce(root) {
              const down = node => (node ? node.val + Math.max(0, down(node.left), down(node.right)) : 0);
              let best = -Infinity;
              const stack = root ? [root] : [];
              while (stack.length) { // try every node as the peak
                const node = stack.pop();
                best = Math.max(best, node.val + Math.max(0, down(node.left)) + Math.max(0, down(node.right)));
                for (const c of [node.left, node.right]) if (c) stack.push(c);
              }
              return best;
            }
            `, `
            public int maxPathSumBruteForce(TreeNode root) {
                int best = Integer.MIN_VALUE;
                Deque<TreeNode> stack = new ArrayDeque<>();
                if (root != null) stack.push(root);
                while (!stack.isEmpty()) { // try every node as the peak
                    TreeNode node = stack.pop();
                    best = Math.max(best, node.val + Math.max(0, down(node.left)) + Math.max(0, down(node.right)));
                    if (node.left != null) stack.push(node.left);
                    if (node.right != null) stack.push(node.right);
                }
                return best;
            }

            private int down(TreeNode node) { // best path starting at node, going down
                if (node == null) return 0;
                return node.val + Math.max(0, Math.max(down(node.left), down(node.right)));
            }
            `),
          cost("$O(n^2)$ for a chain-like tree: each node recomputes gains for its whole subtree.", "$O(h)$ for the recursion."),
          p("The gains of a subtree are recomputed for every ancestor. Computing each gain **once**, bottom-up, fixes that."),
          ap(2, 'One post-order pass with a global best (optimal)'),
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
          vs([
            ['1. Every node as the peak', '$O(n^2)$', '$O(h)$', 'Baseline.'],
            ['2. Post-order, return gains', '$O(n)$', '$O(h)$', 'The expected answer.'],
          ]),
          tests([
            ['root = [-3]', '-3', 'Example 2: a single negative node.'],
            ['root = [-5, -2, -7]', '-2', 'All values negative: the best path is one node.'],
            ['root = [2, -1, -1]', '2', 'Negative branches are skipped.'],
            ['root = [1, 2, 3]', '6', 'The path bends through the root.'],
            ['root = [10, 2, 10, 20, 1, None, -25, None, None, None, None, 3, 4]', '42', 'The best path avoids a negative subtree.'],
            ['root = [3, 4, -2, 6, -1, None, 5]', '16', 'Example 1.'],
          ], { fn: ['max_path_sum_brute_force', 'max_path_sum'], conv: { root: 'tree' } }),
          tips(
            "Keep the two quantities apart: the value **returned** to the parent may use only one child, while the value used to update the **global best** may use both.",
            "Initialise the best with $-∞$ (not 0), or all-negative trees will return 0."
          ),
        ],
      },
    ],
  });
})();
