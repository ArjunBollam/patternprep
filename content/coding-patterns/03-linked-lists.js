(function () {
  const { p, h, h3, ul, ol, note, ex, ll, state, code, impl, cx, table, ap, cost, vs, tests, tips } = K;

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
          ap(1, 'Stack of nodes'),
          p("A stack reverses order for free: push every node while walking the list, then pop them off and link each popped node to the next one popped. The node popped first (the old tail) becomes the new head, and the old head ends up last, so its `next` must be cleared."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def linked_list_reversal_stack(head: ListNode) -> ListNode:
                stack = []
                while head:
                    stack.append(head)
                    head = head.next
                dummy = ListNode()
                tail = dummy
                while stack:
                    tail.next = stack.pop()
                    tail = tail.next
                tail.next = None  # the old head is now the last node
                return dummy.next
            `, `
            function linkedListReversalStack(head) {
              const stack = [];
              for (let node = head; node; node = node.next) stack.push(node);
              const dummy = new ListNode();
              let tail = dummy;
              while (stack.length) {
                tail.next = stack.pop();
                tail = tail.next;
              }
              tail.next = null; // the old head is now the last node
              return dummy.next;
            }
            `, `
            public ListNode linkedListReversalStack(ListNode head) {
                Deque<ListNode> stack = new ArrayDeque<>();
                for (ListNode node = head; node != null; node = node.next) stack.push(node);
                ListNode dummy = new ListNode(0), tail = dummy;
                while (!stack.isEmpty()) {
                    tail.next = stack.pop();
                    tail = tail.next;
                }
                tail.next = null; // the old head is now the last node
                return dummy.next;
            }
            `),
          cost("$O(n)$.", "$O(n)$ for the stack."),
          p("We don't need to store the nodes at all: each node can be flipped the moment we reach it."),
          ap(2, 'Flip the pointers in place (optimal)'),
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
          vs([
            ['1. Stack of nodes', '$O(n)$', '$O(n)$', 'Easy to reason about; wastes memory.'],
            ['2a. Iterative three pointers', '$O(n)$', '$O(1)$', 'The expected answer.'],
            ['2b. Recursive', '$O(n)$', '$O(n)$ call stack', 'Elegant; can overflow the stack on very long lists.'],
          ]),
          tests([
            ['head = []', '[]', 'Empty list.'],
            ['head = [1]', '[1]', 'A single node is its own reversal.'],
            ['head = [1, 2]', '[2, 1]', 'Two nodes: the head becomes the tail.'],
            ['head = [4, 4, 1]', '[1, 4, 4]', 'Repeated values.'],
            ['head = [1, 2, 3, 4]', '[4, 3, 2, 1]', 'Example 1.'],
          ], { fn: ['linked_list_reversal_stack', 'linked_list_reversal', 'linked_list_reversal_recursive'], conv: { head: 'list' }, out: 'list' }),
          note("Linked lists in the test tables are written as arrays of their values: `[1, 2, 3]` stands for `1 → 2 → 3`, and `[]` for an empty list (`null`)."),
          tips(
            "Draw three boxes labelled `prev`, `curr` and `nxt` and update them in that order. Most bugs come from overwriting `curr.next` before saving it.",
            "Common follow-ups: reverse only the nodes between positions `m` and `n`, or reverse the list in groups of `k`. Both reuse the same three-pointer loop on a sublist."
          ),
        ],
      },

      {
        id: 'remove-the-kth-last-node',
        title: 'Remove the Kth Last Node From a Linked List',
        body: [
          p("Given the head of a linked list and an integer `k`, **remove the k-th node from the end** of the list and return the head. `k = 1` means the last node. You may assume `1 ≤ k ≤ length of the list`."),
          ex('head = 3 → 8 → 5 → 1 → 6, k = 2', '3 → 8 → 5 → 6', "the 2nd node from the end is 1."),
          ex('head = 7, k = 1', 'null'),
          ap(1, 'Two passes: count, then walk'),
          p("If we knew the length `n`, the k-th node from the end would be the `(n - k + 1)`-th node from the front. So the first pass counts the nodes, and the second walks `n - k` steps from a **dummy** node placed before the head, which stops exactly on the node before the one to delete. The dummy also covers the case where the head itself is removed."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def remove_kth_last_node_two_pass(head: ListNode, k: int) -> ListNode:
                length = 0
                node = head
                while node:
                    length += 1
                    node = node.next
                dummy = ListNode(-1, head)
                prev = dummy
                for _ in range(length - k):  # stop on the node before the target
                    prev = prev.next
                prev.next = prev.next.next
                return dummy.next
            `, `
            function removeKthLastNodeTwoPass(head, k) {
              let length = 0;
              for (let node = head; node; node = node.next) length++;
              const dummy = new ListNode(-1, head);
              let prev = dummy;
              for (let i = 0; i < length - k; i++) prev = prev.next; // node before the target
              prev.next = prev.next.next;
              return dummy.next;
            }
            `, `
            public ListNode removeKthLastNodeTwoPass(ListNode head, int k) {
                int length = 0;
                for (ListNode node = head; node != null; node = node.next) length++;
                ListNode dummy = new ListNode(-1, head), prev = dummy;
                for (int i = 0; i < length - k; i++) prev = prev.next; // node before the target
                prev.next = prev.next.next;
                return dummy.next;
            }
            `),
          cost("$O(n)$: two traversals.", "$O(1)$."),
          p("That is already linear. A classic follow-up asks for a **single pass**, for example when the list is a stream you can't rewind."),
          ap(2, 'Leader and trailer pointers (one pass, optimal)'),
          p("We can do it in **one pass** with two pointers held a fixed distance apart."),
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
          vs([
            ['1. Count, then walk', '$O(n)$', '$O(1)$', 'Simple and correct; two traversals.'],
            ['2. Leader and trailer', '$O(n)$', '$O(1)$', 'One traversal; the usual follow-up answer.'],
          ]),
          tests([
            ['head = [7], k = 1', '[]', 'Removing the only node leaves an empty list.'],
            ['head = [1, 2], k = 2', '[2]', 'Removing the head (needs the dummy node).'],
            ['head = [1, 2], k = 1', '[1]', 'Removing the tail.'],
            ['head = [9, 9, 9], k = 2', '[9, 9]', 'Repeated values: position matters, not value.'],
            ['head = [3, 8, 5, 1, 6], k = 5', '[8, 5, 1, 6]', 'k equals the length.'],
            ['head = [3, 8, 5, 1, 6], k = 2', '[3, 8, 5, 6]', 'Example 1.'],
          ], { fn: ['remove_kth_last_node_two_pass', 'remove_kth_last_node'], conv: { head: 'list' }, out: 'list' }),
          tips(
            "Ask what to do when `k` is larger than the list. Here it can't happen; otherwise the leader loop must stop at `null` and return the list unchanged.",
            "The dummy node is the trick worth naming: it removes the special case for deleting the head."
          ),
        ],
      },

      {
        id: 'linked-list-intersection',
        title: 'Linked List Intersection',
        body: [
          p("Two singly linked lists may **merge** at some node and share all nodes from there on. Given their heads, return the **first shared node**, or `null` if they never meet. Note that we compare **nodes** (identity), not values."),
          ex('A = 2 → 9 → [4 → 6 → 1],  B = 7 → [4 → 6 → 1]', 'the node with value 4', 'the bracketed nodes are the same node objects in both lists.'),
          ex('A = 1 → 2,  B = 3', 'null'),
          ap(1, 'Brute force: compare every pair of nodes'),
          p("For each node of A, walk the whole of B and check whether the same **node object** appears there. The first node of A that does is the merge point."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def linked_list_intersection_brute_force(head_a: ListNode, head_b: ListNode) -> ListNode:
                a = head_a
                while a:
                    b = head_b
                    while b:
                        if a is b:  # same node, not just the same value
                            return a
                        b = b.next
                    a = a.next
                return None
            `, `
            function linkedListIntersectionBruteForce(headA, headB) {
              for (let a = headA; a; a = a.next) {
                for (let b = headB; b; b = b.next) {
                  if (a === b) return a; // same node, not just the same value
                }
              }
              return null;
            }
            `, `
            public ListNode linkedListIntersectionBruteForce(ListNode headA, ListNode headB) {
                for (ListNode a = headA; a != null; a = a.next) {
                    for (ListNode b = headB; b != null; b = b.next) {
                        if (a == b) return a; // same node, not just the same value
                    }
                }
                return null;
            }
            `),
          cost("$O(n · m)$ for lists of lengths $n$ and $m$.", "$O(1)$."),
          ap(2, 'Hash set of the nodes of A'),
          p("Store every node of A in a hash set (the set holds node references, so identity is what gets compared). Then walk B: the first node already in the set is the answer."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def linked_list_intersection_hash_set(head_a: ListNode, head_b: ListNode) -> ListNode:
                seen = set()
                while head_a:
                    seen.add(head_a)  # nodes hash by identity
                    head_a = head_a.next
                while head_b:
                    if head_b in seen:
                        return head_b
                    head_b = head_b.next
                return None
            `, `
            function linkedListIntersectionHashSet(headA, headB) {
              const seen = new Set();
              for (let a = headA; a; a = a.next) seen.add(a); // object references
              for (let b = headB; b; b = b.next) if (seen.has(b)) return b;
              return null;
            }
            `, `
            public ListNode linkedListIntersectionHashSet(ListNode headA, ListNode headB) {
                Set<ListNode> seen = new HashSet<>(); // ListNode uses identity equals/hashCode
                for (ListNode a = headA; a != null; a = a.next) seen.add(a);
                for (ListNode b = headB; b != null; b = b.next) if (seen.contains(b)) return b;
                return null;
            }
            `),
          cost("$O(n + m)$.", "$O(n)$ for the set."),
          ap(3, 'Align the lengths first'),
          p("If both lists had the same length before the merge point, two pointers walking in lockstep would arrive at the merge node together. The lists after the merge are identical, so the only difference is in the parts before it. Count both lengths, advance the pointer of the **longer** list by the difference, then walk both together until they meet."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def linked_list_intersection_lengths(head_a: ListNode, head_b: ListNode) -> ListNode:
                def length(node):
                    n = 0
                    while node:
                        n, node = n + 1, node.next
                    return n
                la, lb = length(head_a), length(head_b)
                a, b = head_a, head_b
                for _ in range(la - lb):  # only runs if A is longer
                    a = a.next
                for _ in range(lb - la):  # only runs if B is longer
                    b = b.next
                while a is not b:
                    a, b = a.next, b.next
                return a
            `, `
            function linkedListIntersectionLengths(headA, headB) {
              const length = node => { let n = 0; for (; node; node = node.next) n++; return n; };
              const la = length(headA), lb = length(headB);
              let a = headA, b = headB;
              for (let i = 0; i < la - lb; i++) a = a.next; // A is longer
              for (let i = 0; i < lb - la; i++) b = b.next; // B is longer
              while (a !== b) { a = a.next; b = b.next; }
              return a;
            }
            `, `
            public ListNode linkedListIntersectionLengths(ListNode headA, ListNode headB) {
                int la = 0, lb = 0;
                for (ListNode n = headA; n != null; n = n.next) la++;
                for (ListNode n = headB; n != null; n = n.next) lb++;
                ListNode a = headA, b = headB;
                for (int i = 0; i < la - lb; i++) a = a.next; // A is longer
                for (int i = 0; i < lb - la; i++) b = b.next; // B is longer
                while (a != b) { a = a.next; b = b.next; }
                return a;
            }
            `),
          cost("$O(n + m)$.", "$O(1)$."),
          p("That's optimal, but it needs separate passes to count. The last approach gets the same alignment without counting anything."),
          ap(4, 'Switch heads at the end (optimal, no counting)'),
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
          vs([
            ['1. Compare every pair of nodes', '$O(n · m)$', '$O(1)$', 'Only as a baseline.'],
            ['2. Hash set of A', '$O(n + m)$', '$O(n)$', 'Quick to write; uses memory.'],
            ['3. Align lengths', '$O(n + m)$', '$O(1)$', 'Optimal and easy to explain.'],
            ['4. Switch heads', '$O(n + m)$', '$O(1)$', 'Optimal and shortest; be ready to prove why the pointers meet.'],
          ]),
          tests([
            ['a = [], b = [], shared = []', 'None', 'Both lists empty.'],
            ['a = [1, 2], b = [3], shared = []', 'None', 'The lists never meet.'],
            ['a = [], b = [], shared = [5]', '5', 'Both heads are the same node.'],
            ['a = [1, 2, 3], b = [], shared = [8]', '8', 'B starts exactly at the merge point.'],
            ['a = [4, 6], b = [4, 1], shared = [7]', '7', 'Equal values before the merge: compare nodes, not values.'],
            ['a = [2, 9], b = [7], shared = [4, 6, 1]', '4', 'Example 1: different lengths before merging.'],
          ], {
            fn: ['linked_list_intersection_brute_force', 'linked_list_intersection_hash_set', 'linked_list_intersection_lengths', 'linked_list_intersection'],
            call: "lambda fn, kw: (lambda s: (lambda r: r.val if r else None)(fn(_attach(_build(kw['a']), s), _attach(_build(kw['b']), s))))(_build(kw['shared']))",
            jscall: "(fn, kw) => { const s = build(kw.shared); const r = fn(attach(build(kw.a), s), attach(build(kw.b), s)); return r ? r.val : null; }",
          }),
          note("In the table, list A is the values in `a` followed by the nodes in `shared`, and list B is `b` followed by the **same** shared nodes. The expected output is the value of the first shared node, or `None` when the lists don't meet."),
          tips(
            "Say explicitly that you compare node **references**. Comparing values is the most common mistake on this problem.",
            "For the switch-heads version, explain why it terminates when the lists don't meet: both pointers reach `null` together after $n + m$ steps."
          ),
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
          ap(1, 'A list ordered by recency'),
          p("The most direct design keeps the `(key, value)` pairs in an array ordered from least to most recently used. `get` searches the array, moves the pair to the end and returns its value. `put` removes any existing pair for the key, appends the new one, and evicts the first pair if the cache is over capacity."),
          code(`
            class LRUCacheList:
                def __init__(self, capacity: int):
                    self.capacity = capacity
                    self.items = []  # [key, value] pairs, least recent first

                def get(self, key: int) -> int:
                    for i, (k, v) in enumerate(self.items):
                        if k == key:
                            self.items.append(self.items.pop(i))  # now most recent
                            return v
                    return -1

                def put(self, key: int, value: int) -> None:
                    for i, (k, _) in enumerate(self.items):
                        if k == key:
                            self.items.pop(i)
                            break
                    self.items.append([key, value])
                    if len(self.items) > self.capacity:
                        self.items.pop(0)  # least recently used
            `, `
            class LRUCacheList {
              constructor(capacity) {
                this.capacity = capacity;
                this.items = []; // [key, value] pairs, least recent first
              }

              get(key) {
                const i = this.items.findIndex(([k]) => k === key);
                if (i < 0) return -1;
                const [item] = this.items.splice(i, 1);
                this.items.push(item); // now most recent
                return item[1];
              }

              put(key, value) {
                const i = this.items.findIndex(([k]) => k === key);
                if (i >= 0) this.items.splice(i, 1);
                this.items.push([key, value]);
                if (this.items.length > this.capacity) this.items.shift(); // least recently used
              }
            }
            `, `
            class LRUCacheList {
                private final int capacity;
                private final List<int[]> items = new ArrayList<>(); // {key, value}, least recent first

                public LRUCacheList(int capacity) { this.capacity = capacity; }

                public int get(int key) {
                    for (int i = 0; i < items.size(); i++) {
                        if (items.get(i)[0] == key) {
                            int[] item = items.remove(i);
                            items.add(item); // now most recent
                            return item[1];
                        }
                    }
                    return -1;
                }

                public void put(int key, int value) {
                    for (int i = 0; i < items.size(); i++) {
                        if (items.get(i)[0] == key) { items.remove(i); break; }
                    }
                    items.add(new int[]{key, value});
                    if (items.size() > capacity) items.remove(0); // least recently used
                }
            }
            `),
          cost("$O(capacity)$ per operation: searching, removing from the middle and removing from the front of an array are all linear.", "$O(capacity)$."),
          ap(2, "Built-in ordered maps"),
          p("Several standard libraries already ship a hash map that remembers order: Python's `OrderedDict`, JavaScript's `Map` (which iterates in insertion order), and Java's `LinkedHashMap` (which can even track access order and evict automatically). Each is a hash table and a linked list combined, so every operation is $O(1)$."),
          code(`
            from collections import OrderedDict

            class LRUCacheOrdered:
                def __init__(self, capacity: int):
                    self.capacity = capacity
                    self.data = OrderedDict()  # least recent first

                def get(self, key: int) -> int:
                    if key not in self.data:
                        return -1
                    self.data.move_to_end(key)  # mark as most recent
                    return self.data[key]

                def put(self, key: int, value: int) -> None:
                    self.data[key] = value
                    self.data.move_to_end(key)
                    if len(self.data) > self.capacity:
                        self.data.popitem(last=False)  # evict the least recent
            `, `
            class LRUCacheOrdered {
              constructor(capacity) {
                this.capacity = capacity;
                this.data = new Map(); // iterates in insertion order: least recent first
              }

              get(key) {
                if (!this.data.has(key)) return -1;
                const value = this.data.get(key);
                this.data.delete(key); // re-insert to make it the most recent
                this.data.set(key, value);
                return value;
              }

              put(key, value) {
                this.data.delete(key);
                this.data.set(key, value);
                if (this.data.size > this.capacity) this.data.delete(this.data.keys().next().value);
              }
            }
            `, `
            class LRUCacheOrdered {
                private final LinkedHashMap<Integer, Integer> data;

                public LRUCacheOrdered(int capacity) {
                    // accessOrder = true: iteration runs from least to most recently used.
                    data = new LinkedHashMap<>(16, 0.75f, true) {
                        @Override
                        protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
                            return size() > capacity;
                        }
                    };
                }

                public int get(int key) { return data.getOrDefault(key, -1); }

                public void put(int key, int value) { data.put(key, value); }
            }
            `),
          cost("$O(1)$ per operation.", "$O(capacity)$."),
          p("Mention this in an interview, but expect the follow-up: *now build it without the library class.* That's the final approach."),
          ap(3, 'Hash map + doubly linked list, from scratch (optimal)'),
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
          vs([
            ['1. Array ordered by recency', '$O(capacity)$ per operation', '$O(capacity)$', 'Small caches only.'],
            ['2. Built-in ordered map', '$O(1)$', '$O(capacity)$', 'Production code; mention it first.'],
            ['3. Hash map + doubly linked list', '$O(1)$', '$O(capacity)$', 'What the interview is really asking you to build.'],
          ]),
          tests([
            ['LRUCache(2); get(7)', '[-1]', 'A key that was never inserted.'],
            ['LRUCache(1); put(1, 10); put(2, 20); get(1); get(2)', '[-1, 20]', 'Capacity 1: every new key evicts the previous one.'],
            ['LRUCache(2); put(1, 1); put(1, 5); get(1)', '[5]', 'Updating an existing key replaces its value.'],
            ['LRUCache(2); put(1, 1); put(2, 2); put(1, 10); put(3, 3); get(2); get(1); get(3)', '[-1, 10, 3]', 'An update also counts as a use, so key 2 is evicted.'],
            ['LRUCache(3); put(1, 1); put(2, 2); put(3, 3); get(1); put(4, 4); get(2); get(3); get(4); get(1)', '[1, -1, 3, 4, 1]', 'A read refreshes key 1, so key 2 is the one evicted.'],
            ['LRUCache(2); put(1, 100); put(2, 250); get(1); put(3, 400); get(2)', '[100, -1]', 'Example 1.'],
          ], { ops: ['LRUCacheList', 'LRUCacheOrdered', 'LRUCache'] }),
          note("Each test is a sequence of calls on a new cache; the expected output lists the values returned by the `get` calls, in order."),
          tips(
            "Name the two dummy nodes and the two private helpers (`remove`, `add_to_front`) before writing code. With them, `get` and `put` are each four lines.",
            "Store the **key** inside each list node. When you evict `tail.prev`, you need its key to delete it from the map.",
            "Follow-ups: make it thread-safe (one lock around both structures, or lock striping), or add a time-to-live per entry."
          ),
        ],
      },

      {
        id: 'palindromic-linked-list',
        title: 'Palindromic Linked List',
        body: [
          p("Given the head of a singly linked list, return whether its values read the **same forwards and backwards**."),
          ex('head = 2 → 5 → 8 → 5 → 2', 'True'),
          ex('head = 1 → 2 → 2 → 3', 'False'),
          ap(1, 'Copy the values into an array'),
          p("A linked list can't be read backwards, but an array can. Copy the values into an array, then check it with two pointers moving inward, exactly as in [Is Palindrome Valid](#/two-pointers/is-palindrome-valid)."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def palindromic_linked_list_array(head: ListNode) -> bool:
                values = []
                while head:
                    values.append(head.val)
                    head = head.next
                left, right = 0, len(values) - 1
                while left < right:
                    if values[left] != values[right]:
                        return False
                    left, right = left + 1, right - 1
                return True
            `, `
            function palindromicLinkedListArray(head) {
              const values = [];
              for (let node = head; node; node = node.next) values.push(node.val);
              for (let l = 0, r = values.length - 1; l < r; l++, r--) {
                if (values[l] !== values[r]) return false;
              }
              return true;
            }
            `, `
            public boolean palindromicLinkedListArray(ListNode head) {
                List<Integer> values = new ArrayList<>();
                for (ListNode node = head; node != null; node = node.next) values.add(node.val);
                for (int l = 0, r = values.size() - 1; l < r; l++, r--) {
                    if (!values.get(l).equals(values.get(r))) return false;
                }
                return true;
            }
            `),
          cost("$O(n)$.", "$O(n)$ for the copied values."),
          ap(2, 'Reverse the second half in place (optimal)'),
          p("With a linked list we can't walk backwards… unless we **reverse the second half**. Then we can walk forward from both the head and the middle and compare as we go."),
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
          vs([
            ['1. Copy into an array', '$O(n)$', '$O(n)$', 'When the list must not be touched, even temporarily.'],
            ['2. Reverse the second half', '$O(n)$', '$O(1)$', 'The expected answer; restore the list afterwards if asked.'],
          ]),
          tests([
            ['head = []', 'True', 'An empty list reads the same both ways.'],
            ['head = [7]', 'True', 'A single node.'],
            ['head = [1, 2]', 'False', 'Two different values.'],
            ['head = [3, 3]', 'True', 'Two equal values (even length, no middle node).'],
            ['head = [4, 1, 1, 4]', 'True', 'Even-length palindrome.'],
            ['head = [1, 2, 3, 1]', 'False', 'The ends match but the middle does not.'],
            ['head = [1, 2, 2, 3]', 'False', 'Example 2.'],
            ['head = [2, 5, 8, 5, 2]', 'True', 'Example 1: odd length.'],
          ], { fn: ['palindromic_linked_list_array', 'palindromic_linked_list'], conv: { head: 'list' } }),
          tips(
            "Ask whether you may modify the list. If not, either use the array approach or reverse the second half back before returning.",
            "Walk through both an odd and an even length out loud. The midpoint convention (first or second middle) is where off-by-one bugs hide."
          ),
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
          ap(1, 'Breadth-first search with a queue'),
          p("Level order is breadth-first order, so a **queue** of list heads does the job. Start with the head of level 1. Take a list from the queue, walk it, record each node, and put every child list you meet at the back of the queue. Lists of deeper levels are reached only after every list queued before them. Finally, relink the recorded nodes in order and clear all `child` pointers."),
          code(`
            from collections import deque

            class MultiLevelListNode:
                def __init__(self, val, next=None, child=None):
                    self.val, self.next, self.child = val, next, child

            def flatten_multi_level_list_queue(head: MultiLevelListNode) -> MultiLevelListNode:
                order = []
                queue = deque([head] if head else [])
                while queue:
                    node = queue.popleft()
                    while node:  # walk one list, queue its children for later
                        order.append(node)
                        if node.child:
                            queue.append(node.child)
                        node = node.next
                for a, b in zip(order, order[1:]):
                    a.next = b
                for node in order:
                    node.child = None
                if order:
                    order[-1].next = None
                return head
            `, `
            function flattenMultiLevelListQueue(head) {
              const order = [];
              const queue = head ? [head] : [];
              while (queue.length) {
                let node = queue.shift();
                for (; node; node = node.next) { // walk one list, queue its children
                  order.push(node);
                  if (node.child) queue.push(node.child);
                }
              }
              order.forEach((node, i) => {
                node.next = order[i + 1] || null;
                node.child = null;
              });
              return head;
            }
            `, `
            // class MultiLevelListNode { int val; MultiLevelListNode next, child; }
            public MultiLevelListNode flattenMultiLevelListQueue(MultiLevelListNode head) {
                List<MultiLevelListNode> order = new ArrayList<>();
                Deque<MultiLevelListNode> queue = new ArrayDeque<>();
                if (head != null) queue.add(head);
                while (!queue.isEmpty()) {
                    for (MultiLevelListNode node = queue.poll(); node != null; node = node.next) {
                        order.add(node);
                        if (node.child != null) queue.add(node.child);
                    }
                }
                for (int i = 0; i < order.size(); i++) {
                    order.get(i).next = i + 1 < order.size() ? order.get(i + 1) : null;
                    order.get(i).child = null;
                }
                return head;
            }
            `),
          cost("$O(n)$: every node is recorded once and relinked once.", "$O(n)$ for the recorded nodes and the queue."),
          p("The queue and the array are only there to remember *what comes next*. But the list we are building already remembers that, if we append to its tail."),
          ap(2, 'Append each child list at the tail (optimal)'),
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
          vs([
            ['1. Queue (breadth-first)', '$O(n)$', '$O(n)$', 'Mirrors the definition of level order directly.'],
            ['2. Append at the tail', '$O(n)$', '$O(1)$', 'The expected answer: the list itself acts as the queue.'],
          ]),
          tests([
            ['head = []', '[]', 'Empty list.'],
            ['head = [1, 2, 3]', '[1, 2, 3]', 'No children: the list is already flat.'],
            ['head = [[1, [2, 3]]]', '[1, 2, 3]', 'A single node with a child list.'],
            ['head = [[1, [[2, [[3, [4]]]]]]]', '[1, 2, 3, 4]', 'Four levels with one node each.'],
            ['head = [[1, [5, 6]], [2, [7]], 3]', '[1, 2, 3, 5, 6, 7]', 'Children of earlier parents come first.'],
            ['head = [1, [2, [4, [5, [6]]]], [3, [7]]]', '[1, 2, 3, 4, 5, 7, 6]', 'Example 1.'],
          ], { fn: ['flatten_multi_level_list_queue', 'flatten_multi_level_list'], conv: { head: '_ml' }, jsconv: { head: 'ml' }, out: '_mlflat', jsout: 'mlflat' }),
          note("Input notation: each list is an array; a plain value is a node without a child, and `[value, [...]]` is a node whose `child` is the list in the inner array. The expected output is the flattened list, and the checker also verifies that every `child` pointer was cleared."),
          tips(
            "Clarify the required order. This problem wants **level order**. A popular variant wants **depth-first** order (a child list is spliced in right after its parent); that version uses a stack or recursion instead.",
            "Remember to clear the `child` pointers. Leaving them set produces a structure that still looks multi-level to the caller."
          ),
        ],
      },
    ],
  });
})();
