(function () {
  const { p, h, h3, ul, ol, note, ex, ll, state, code, impl, cx, table } = K;

  K.section({
    id: 'linked-lists',
    title: 'Linked Lists',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Linked Lists',
        body: [
          p("A **linked list** is a chain of nodes. Each node stores a value and a reference (`next`) to the following node; the last node points to `null`. Unlike an array, the nodes don't sit next to each other in memory, so there's no way to jump straight to the *k*-th element. In exchange, inserting or removing a node is $O(1)$ once you hold a reference to its neighbour, because nothing has to be shifted."),
          ll([4, 7, 1, 9], { p: { head: 0 }, on: ['head'] }),
          h('The node class used in these lessons'),
          code(`
            class ListNode:
                def __init__(self, val=0, next=None):
                    self.val = val
                    self.next = next
            `, `
            class ListNode {
              constructor(val = 0, next = null) {
                this.val = val;
                this.next = next;
              }
            }
            `, `
            class ListNode {
                int val;
                ListNode next;
                ListNode(int val) { this.val = val; }
                ListNode(int val, ListNode next) { this.val = val; this.next = next; }
            }
            `),
          h('Array vs. linked list'),
          table(['Operation', 'Array', 'Singly linked list'], [
            ['Access the *k*-th element', '$O(1)$', '$O(k)$'],
            ['Insert / delete at the front', '$O(n)$', '$O(1)$'],
            ['Insert / delete after a known node', '$O(n)$', '$O(1)$'],
            ['Search for a value', '$O(n)$', '$O(n)$'],
          ]),
          h('Techniques that keep coming up'),
          ul(
            "**Dummy (sentinel) node**: put a fake node before the head so that removing or inserting at the head needs no special case. Return `dummy.next` at the end.",
            "**Multiple pointers**: `prev` / `curr` / `next` for in-place reversal; a *leader* and a *trailer* that are a fixed distance apart; fast and slow pointers (see [Fast and Slow Pointers](#/fast-and-slow-pointers/introduction)).",
            "**Rewire, don't copy**: most problems expect $O(1)$ extra space, achieved by changing `next` references rather than building new lists.",
            "**Draw it**: write out three or four nodes and the pointers before coding. Most linked-list bugs come from losing a reference before you've saved it."
          ),
          h('Real-world uses'),
          ul(
            "**LRU caches** keep entries in a doubly linked list ordered by recent use ([LRU Cache](#/linked-lists/lru-cache)).",
            "**Undo/redo histories**, browser back/forward navigation, and music playlists.",
            "**Memory allocators** keep free blocks in linked *free lists*.",
            "Hash tables that resolve collisions by **chaining** store each bucket as a linked list."
          ),
        ],
      },

      {
        id: 'linked-list-reversal',
        title: 'Linked List Reversal',
        body: [
          p("Given the head of a singly linked list, **reverse** the list in place and return the new head."),
          ex('head = 1 → 2 → 3 → 4', '4 → 3 → 2 → 1'),
          ex('head = null', 'null'),
          h('Intuition'),
          p("Reversing a list just means making every `next` reference point the other way. We walk through the list once, and at each node flip its arrow to point at the node **behind** it. Three pointers are enough:"),
          ul(
            "`prev`: the already-reversed part (starts as `null`).",
            "`curr`: the node we are about to flip.",
            "`nxt`: saved reference to the rest of the list, because flipping `curr.next` would otherwise lose it."
          ),
          ll([1, 2, 3, 4], { head: 'null', p: { prev: -1, curr: 0 }, on: ['curr'], state: 'save nxt = curr.next\ncurr.next = prev' }),
          ll([1, 2, 3, 4], { head: 'null', headArrow: '←', arrows: ['  ', '→', '→'], p: { prev: 0, curr: 1 }, on: ['prev', 'curr'], hl: [0], state: 'node 1 now points back to null\nprev = curr; curr = nxt' }),
          ll([1, 2, 3, 4], { head: 'null', headArrow: '←', arrows: ['←', '  ', '→'], p: { prev: 1, curr: 2 }, on: ['prev', 'curr'], hl: [0, 1], state: '2 → 1 → null is reversed\n3 → 4 still to do' }),
          ll([1, 2, 3, 4], { head: 'null', headArrow: '←', arrows: ['←', '←', '←'], tail: false, p: { prev: 3 }, on: ['prev'], hl: [0, 1, 2, 3], state: 'curr is null  →  return prev (node 4)' }),
          p("When `curr` falls off the end, `prev` is sitting on the old tail, which is the new head."),
          h3('Recursive version'),
          p("Recursion expresses the same idea: reverse everything after `head`, then make `head.next` point back at `head`. It's elegant but uses $O(n)$ call-stack space, so the iterative version is usually preferred."),
          impl(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def linked_list_reversal(head: ListNode) -> ListNode:
                prev, curr = None, head
                while curr:
                    nxt = curr.next   # remember the rest of the list
                    curr.next = prev  # flip the arrow
                    prev = curr       # grow the reversed part
                    curr = nxt
                return prev

            def linked_list_reversal_recursive(head: ListNode) -> ListNode:
                if head is None or head.next is None:
                    return head
                new_head = linked_list_reversal_recursive(head.next)
                head.next.next = head
                head.next = None
                return new_head
            `, `
            function linkedListReversal(head) {
              let prev = null, curr = head;
              while (curr) {
                const nxt = curr.next; // remember the rest of the list
                curr.next = prev;      // flip the arrow
                prev = curr;           // grow the reversed part
                curr = nxt;
              }
              return prev;
            }

            function linkedListReversalRecursive(head) {
              if (!head || !head.next) return head;
              const newHead = linkedListReversalRecursive(head.next);
              head.next.next = head;
              head.next = null;
              return newHead;
            }
            `, `
            public ListNode linkedListReversal(ListNode head) {
                ListNode prev = null, curr = head;
                while (curr != null) {
                    ListNode nxt = curr.next; // remember the rest of the list
                    curr.next = prev;         // flip the arrow
                    prev = curr;              // grow the reversed part
                    curr = nxt;
                }
                return prev;
            }

            public ListNode linkedListReversalRecursive(ListNode head) {
                if (head == null || head.next == null) return head;
                ListNode newHead = linkedListReversalRecursive(head.next);
                head.next.next = head;
                head.next = null;
                return newHead;
            }
            `),
          cx("$O(n)$. Each node is visited once.",
            "$O(1)$ for the iterative version; $O(n)$ call stack for the recursive version."),
        ],
      },

      {
        id: 'remove-the-kth-last-node',
        title: 'Remove the Kth Last Node From a Linked List',
        body: [
          p("Given the head of a linked list and an integer `k`, **remove the k-th node from the end** of the list and return the head. `k = 1` means the last node. You may assume `1 ≤ k ≤ length of the list`."),
          ex('head = 3 → 8 → 5 → 1 → 6, k = 2', '3 → 8 → 5 → 6', "the 2nd node from the end is 1."),
          ex('head = 7, k = 1', 'null'),
          h('Intuition'),
          p("A two-pass solution counts the nodes, then walks to position `length - k - 1` and unlinks the next node. We can do it in **one pass** with two pointers held a fixed distance apart."),
          p("To delete a node we need to stand on the node **before** it. If a `leader` pointer is `k` nodes ahead of a `trailer`, then when the leader reaches the **last** node, the trailer is exactly on the node before the k-th last one. A **dummy** node in front of the head makes this also work when the head itself must be removed."),
          ll(['D', 3, 8, 5, 1, 6], { p: { trailer: 0, leader: 2 }, on: ['leader'], state: 'step 1: move leader k = 2 nodes ahead' }),
          ll(['D', 3, 8, 5, 1, 6], { p: { trailer: 3, leader: 5 }, on: ['trailer', 'leader'], hl: [4], state: 'step 2: move both until leader.next is null\ntrailer.next (node 1) is the k-th last' }),
          ll(['D', 3, 8, 5, 6], { p: { trailer: 3 }, hl: [3, 4], state: 'trailer.next = trailer.next.next\nreturn dummy.next' }),
          impl(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def remove_kth_last_node(head: ListNode, k: int) -> ListNode:
                dummy = ListNode(-1, head)
                trailer = leader = dummy
                # Put the leader k nodes ahead of the trailer.
                for _ in range(k):
                    leader = leader.next
                # Move both until the leader is on the last node.
                while leader.next:
                    leader = leader.next
                    trailer = trailer.next
                # trailer.next is the k-th last node: unlink it.
                trailer.next = trailer.next.next
                return dummy.next
            `, `
            function removeKthLastNode(head, k) {
              const dummy = new ListNode(-1, head);
              let trailer = dummy, leader = dummy;
              for (let i = 0; i < k; i++) leader = leader.next;
              while (leader.next) {
                leader = leader.next;
                trailer = trailer.next;
              }
              trailer.next = trailer.next.next; // unlink the k-th last node
              return dummy.next;
            }
            `, `
            public ListNode removeKthLastNode(ListNode head, int k) {
                ListNode dummy = new ListNode(-1, head);
                ListNode trailer = dummy, leader = dummy;
                for (int i = 0; i < k; i++) leader = leader.next;
                while (leader.next != null) {
                    leader = leader.next;
                    trailer = trailer.next;
                }
                trailer.next = trailer.next.next; // unlink the k-th last node
                return dummy.next;
            }
            `),
          cx("$O(n)$. The leader travels the list once.",
            "$O(1)$."),
        ],
      },

      {
        id: 'linked-list-intersection',
        title: 'Linked List Intersection',
        body: [
          p("Two singly linked lists may **merge** at some node and share all nodes from there on. Given their heads, return the **first shared node**, or `null` if they never meet. Note that we compare **nodes** (identity), not values."),
          ex('A = 2 → 9 → [4 → 6 → 1],  B = 7 → [4 → 6 → 1]', 'the node with value 4', 'the bracketed nodes are the same node objects in both lists.'),
          ex('A = 1 → 2,  B = 3', 'null'),
          h('Intuition'),
          p("A hash set of nodes from list A would work in $O(n + m)$ time and $O(n)$ space. Can we avoid the set?"),
          p("The difficulty is that the lists may have different lengths before they merge, so pointers that walk at the same speed arrive at the merge point at different times. Here is a neat fix: when pointer `a` reaches the end of A, **send it to the head of B**, and vice versa. Now both pointers walk exactly `lenA + lenB` steps in total, so they line up."),
          ll([2, 9, 4, 6, 1], { p: { a: 0 }, on: ['a'], hl2: [2, 3, 4], cap: 'list A (shared part in blue)' }),
          ll([7, 4, 6, 1], { p: { b: 0 }, on: ['b'], hl2: [1, 2, 3], cap: 'list B' }),
          state('a walks: 2, 9, 4, 6, 1, then B: 7, [4]\nb walks: 7, 4, 6, 1, then A: 2, 9, [4]\nboth reach node 4 after 6 steps'),
          p("Let `x` be the unshared length of A, `y` the unshared length of B, and `z` the shared tail. Pointer `a` walks `x + z + y` steps before reaching the merge point the second time around, and pointer `b` walks `y + z + x`. Same number, so they meet there. If the lists don't intersect, both reach `null` at the same time after `lenA + lenB` steps, and the loop ends with `null`."),
          impl(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def linked_list_intersection(head_a: ListNode, head_b: ListNode) -> ListNode:
                a, b = head_a, head_b
                while a is not b:
                    # At the end of one list, continue from the head of the other.
                    a = a.next if a else head_b
                    b = b.next if b else head_a
                return a  # the shared node, or None
            `, `
            function linkedListIntersection(headA, headB) {
              let a = headA, b = headB;
              while (a !== b) {
                a = a ? a.next : headB;
                b = b ? b.next : headA;
              }
              return a; // the shared node, or null
            }
            `, `
            public ListNode linkedListIntersection(ListNode headA, ListNode headB) {
                ListNode a = headA, b = headB;
                while (a != b) {
                    a = (a != null) ? a.next : headB;
                    b = (b != null) ? b.next : headA;
                }
                return a; // the shared node, or null
            }
            `),
          cx("$O(n + m)$. Each pointer traverses both lists at most once.",
            "$O(1)$."),
        ],
      },

      {
        id: 'lru-cache',
        title: 'LRU Cache',
        body: [
          p("Design a **Least Recently Used (LRU) cache** with a fixed `capacity`, supporting:"),
          ul(
            "`get(key)`: return the value for `key`, or `-1` if absent. Reading a key counts as using it.",
            "`put(key, value)`: insert or update the key. If this pushes the cache over capacity, **evict the least recently used** key."
          ),
          p("Both operations must run in **$O(1)$** time."),
          ex('LRUCache(2); put(1, 100); put(2, 250); get(1); put(3, 400); get(2)', '100, -1', "after `get(1)`, key 2 is the least recently used, so `put(3, 400)` evicts it."),
          h('Intuition'),
          p("We need two abilities at once:"),
          ul(
            "**Find** a key's entry in $O(1)$ → a **hash map** from key to entry.",
            "**Keep entries ordered by recency** and move any entry to the front, or remove the oldest, in $O(1)$ → a **doubly linked list**. With `prev` and `next` pointers, a node can unlink itself without searching."
          ),
          p("So the map stores `key → node`, and the list holds nodes from most recent (just after `head`) to least recent (just before `tail`). Two **dummy nodes** `head` and `tail` mean we never have to special-case an empty list."),
          ll(['head', '3:400', '1:100', 'tail'], { arrows: ['⇄', '⇄', '⇄'], tail: false, hl2: [1], hl: [2], cap: 'most recent on the left, least recent on the right' }),
          h3('Operations'),
          ul(
            "**get**: look the node up in the map; if found, move it to the front and return its value.",
            "**put** (existing key): update the value and move the node to the front.",
            "**put** (new key): create a node, add it to the front and to the map. If the size now exceeds capacity, remove `tail.prev` from both the list and the map."
          ),
          state('put(1,100)  list: 1\nput(2,250)  list: 2, 1\nget(1)      list: 1, 2       → 100\nput(3,400)  list: 3, 1, 2    → over capacity, evict 2\nget(2)                       → -1'),
          impl(`
            class DLLNode:
                def __init__(self, key: int = 0, val: int = 0):
                    self.key, self.val = key, val
                    self.prev = self.next = None

            class LRUCache:
                def __init__(self, capacity: int):
                    self.capacity = capacity
                    self.nodes = {}  # key -> DLLNode
                    self.head, self.tail = DLLNode(), DLLNode()  # dummies
                    self.head.next, self.tail.prev = self.tail, self.head

                def get(self, key: int) -> int:
                    if key not in self.nodes:
                        return -1
                    node = self.nodes[key]
                    self._remove(node)
                    self._add_to_front(node)
                    return node.val

                def put(self, key: int, value: int) -> None:
                    if key in self.nodes:
                        self._remove(self.nodes[key])
                    node = DLLNode(key, value)
                    self.nodes[key] = node
                    self._add_to_front(node)
                    if len(self.nodes) > self.capacity:
                        lru = self.tail.prev
                        self._remove(lru)
                        del self.nodes[lru.key]

                def _remove(self, node: DLLNode) -> None:
                    node.prev.next = node.next
                    node.next.prev = node.prev

                def _add_to_front(self, node: DLLNode) -> None:
                    node.prev, node.next = self.head, self.head.next
                    self.head.next.prev = node
                    self.head.next = node
            `, `
            class DLLNode {
              constructor(key = 0, val = 0) {
                this.key = key;
                this.val = val;
                this.prev = null;
                this.next = null;
              }
            }

            class LRUCache {
              constructor(capacity) {
                this.capacity = capacity;
                this.nodes = new Map(); // key -> DLLNode
                this.head = new DLLNode();
                this.tail = new DLLNode();
                this.head.next = this.tail;
                this.tail.prev = this.head;
              }

              get(key) {
                if (!this.nodes.has(key)) return -1;
                const node = this.nodes.get(key);
                this.remove(node);
                this.addToFront(node);
                return node.val;
              }

              put(key, value) {
                if (this.nodes.has(key)) this.remove(this.nodes.get(key));
                const node = new DLLNode(key, value);
                this.nodes.set(key, node);
                this.addToFront(node);
                if (this.nodes.size > this.capacity) {
                  const lru = this.tail.prev;
                  this.remove(lru);
                  this.nodes.delete(lru.key);
                }
              }

              remove(node) {
                node.prev.next = node.next;
                node.next.prev = node.prev;
              }

              addToFront(node) {
                node.prev = this.head;
                node.next = this.head.next;
                this.head.next.prev = node;
                this.head.next = node;
              }
            }
            `, `
            class LRUCache {
                private static class Node {
                    int key, val;
                    Node prev, next;
                    Node(int key, int val) { this.key = key; this.val = val; }
                }

                private final int capacity;
                private final Map<Integer, Node> nodes = new HashMap<>();
                private final Node head = new Node(0, 0), tail = new Node(0, 0); // dummies

                public LRUCache(int capacity) {
                    this.capacity = capacity;
                    head.next = tail;
                    tail.prev = head;
                }

                public int get(int key) {
                    Node node = nodes.get(key);
                    if (node == null) return -1;
                    remove(node);
                    addToFront(node);
                    return node.val;
                }

                public void put(int key, int value) {
                    if (nodes.containsKey(key)) remove(nodes.get(key));
                    Node node = new Node(key, value);
                    nodes.put(key, node);
                    addToFront(node);
                    if (nodes.size() > capacity) {
                        Node lru = tail.prev;
                        remove(lru);
                        nodes.remove(lru.key);
                    }
                }

                private void remove(Node node) {
                    node.prev.next = node.next;
                    node.next.prev = node.prev;
                }

                private void addToFront(Node node) {
                    node.prev = head;
                    node.next = head.next;
                    head.next.prev = node;
                    head.next = node;
                }
            }
            `),
          cx("$O(1)$ for both `get` and `put`: one map operation plus a constant number of pointer updates.",
            "$O(capacity)$ for the map and the list."),
        ],
      },

      {
        id: 'palindromic-linked-list',
        title: 'Palindromic Linked List',
        body: [
          p("Given the head of a singly linked list, return whether its values read the **same forwards and backwards**."),
          ex('head = 2 → 5 → 8 → 5 → 2', 'True'),
          ex('head = 1 → 2 → 2 → 3', 'False'),
          h('Intuition'),
          p("Copying the values into an array and using two pointers works, but costs $O(n)$ space. With a linked list we can't walk backwards… unless we **reverse the second half**. Then we can walk forward from both the head and the middle and compare as we go."),
          ol(
            "**Find the middle** with fast and slow pointers ([Linked List Midpoint](#/fast-and-slow-pointers/linked-list-midpoint)). For odd lengths the middle node belongs to both halves and is simply compared with itself.",
            "**Reverse** the list starting at the middle ([Linked List Reversal](#/linked-lists/linked-list-reversal)).",
            "**Compare** the first half with the reversed second half node by node."
          ),
          ll([2, 5, 8, 5, 2], { p: { slow: 2 }, on: ['slow'], hl2: [2], state: 'step 1: middle = node 8' }),
          ll([2, 5, 8], { p: { left: 0 }, on: ['left'], cap: 'first half (node 5 still points to 8)', tail: '8' }),
          ll([2, 5, 8], { p: { right: 0 }, on: ['right'], cap: 'second half after reversal' }),
          state("compare 2 = 2, 5 = 5, 8 = 8  →  palindrome"),
          note("Reversing modifies the input. If the caller still needs the list, reverse the second half back after comparing."),
          impl(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def palindromic_linked_list(head: ListNode) -> bool:
                # 1. Find the middle (second middle for even lengths).
                slow = fast = head
                while fast and fast.next:
                    slow, fast = slow.next, fast.next.next
                # 2. Reverse the second half.
                right = reverse(slow)
                # 3. Compare the halves.
                left = head
                while right:
                    if left.val != right.val:
                        return False
                    left, right = left.next, right.next
                return True

            def reverse(head: ListNode) -> ListNode:
                prev, curr = None, head
                while curr:
                    curr.next, prev, curr = prev, curr, curr.next
                return prev
            `, `
            function palindromicLinkedList(head) {
              // 1. Find the middle.
              let slow = head, fast = head;
              while (fast && fast.next) {
                slow = slow.next;
                fast = fast.next.next;
              }
              // 2. Reverse the second half.
              let prev = null, curr = slow;
              while (curr) {
                const nxt = curr.next;
                curr.next = prev;
                prev = curr;
                curr = nxt;
              }
              // 3. Compare the halves.
              let left = head, right = prev;
              while (right) {
                if (left.val !== right.val) return false;
                left = left.next;
                right = right.next;
              }
              return true;
            }
            `, `
            public boolean palindromicLinkedList(ListNode head) {
                // 1. Find the middle.
                ListNode slow = head, fast = head;
                while (fast != null && fast.next != null) {
                    slow = slow.next;
                    fast = fast.next.next;
                }
                // 2. Reverse the second half.
                ListNode prev = null, curr = slow;
                while (curr != null) {
                    ListNode nxt = curr.next;
                    curr.next = prev;
                    prev = curr;
                    curr = nxt;
                }
                // 3. Compare the halves.
                ListNode left = head, right = prev;
                while (right != null) {
                    if (left.val != right.val) return false;
                    left = left.next;
                    right = right.next;
                }
                return true;
            }
            `),
          cx("$O(n)$. Finding the middle, reversing and comparing are each linear.",
            "$O(1)$."),
        ],
      },

      {
        id: 'flatten-a-multi-level-linked-list',
        title: 'Flatten a Multi-Level Linked List',
        body: [
          p("In a **multi-level linked list**, each node has a `next` pointer and may also have a `child` pointer to the head of another list, whose nodes may have children of their own. **Flatten** it into a single-level list in **level order**: all nodes of level 1, followed by all nodes of level 2 (in the order their parents appear), and so on. Set every `child` pointer to `null`."),
          ex('level 1: 1 → 2 → 3\n2.child = 4 → 5,  3.child = 7,  5.child = 6', '1 → 2 → 3 → 4 → 5 → 7 → 6'),
          K.pre(`
            1 → 2 → 3              level 1
                ↓   ↓
                4 → 5   7          level 2  (children of 2 and 3)
                    ↓
                    6              level 3  (child of 5)
          `),
          h('Intuition'),
          p("Level order means each child list should be **appended to the end** of the flattened list, in the order we meet their parents. Keep a `tail` pointer on the last node of the list built so far. Walk through the list with `curr`; whenever `curr` has a child, attach that child list after `tail`, move `tail` to the new end, and clear the child pointer."),
          p("Because `curr` keeps walking into the appended nodes, children of level-2 nodes get appended after all of level 2, which is exactly level order."),
          ll([1, 2, 3], { p: { curr: 1, tail: 2 }, on: ['curr'], state: '2 has child 4 → 5\ntail.next = 4; move tail to 5' }),
          ll([1, 2, 3, 4, 5], { p: { curr: 2, tail: 4 }, on: ['curr'], hl2: [3, 4], state: '3 has child 7\ntail.next = 7; tail = 7' }),
          ll([1, 2, 3, 4, 5, 7], { p: { curr: 4, tail: 5 }, on: ['curr'], hl2: [5], state: '5 has child 6\ntail.next = 6; tail = 6' }),
          ll([1, 2, 3, 4, 5, 7, 6], { hl2: [6], state: 'curr reaches the end: done' }),
          impl(`
            class MultiLevelListNode:
                def __init__(self, val, next=None, child=None):
                    self.val, self.next, self.child = val, next, child

            def flatten_multi_level_list(head: MultiLevelListNode) -> MultiLevelListNode:
                if not head:
                    return None
                tail = head
                while tail.next:
                    tail = tail.next
                curr = head
                while curr:
                    if curr.child:
                        tail.next = curr.child   # append the child list
                        curr.child = None
                        while tail.next:         # move tail to the new end
                            tail = tail.next
                    curr = curr.next
                return head
            `, `
            function flattenMultiLevelList(head) {
              if (!head) return null;
              let tail = head;
              while (tail.next) tail = tail.next;
              let curr = head;
              while (curr) {
                if (curr.child) {
                  tail.next = curr.child; // append the child list
                  curr.child = null;
                  while (tail.next) tail = tail.next;
                }
                curr = curr.next;
              }
              return head;
            }
            `, `
            // class MultiLevelListNode { int val; MultiLevelListNode next, child; }
            public MultiLevelListNode flattenMultiLevelList(MultiLevelListNode head) {
                if (head == null) return null;
                MultiLevelListNode tail = head;
                while (tail.next != null) tail = tail.next;
                MultiLevelListNode curr = head;
                while (curr != null) {
                    if (curr.child != null) {
                        tail.next = curr.child; // append the child list
                        curr.child = null;
                        while (tail.next != null) tail = tail.next;
                    }
                    curr = curr.next;
                }
                return head;
            }
            `),
          cx("$O(n)$. `curr` visits every node once, and `tail` also moves over every node at most once in total.",
            "$O(1)$."),
        ],
      },
    ],
  });
})();
