(function () {
  const { p, h, h3, ul, ol, note, ex, ll, arr, state, code, impl, cx, pre, ap, cost, vs, tests, tips } = K;

  K.section({
    id: 'fast-and-slow-pointers',
    title: 'Fast and Slow Pointers',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Fast and Slow Pointers',
        body: [
          p("The **fast and slow pointers** technique (also called *Floyd's tortoise and hare*) moves two pointers through a sequence at **different speeds**, typically one step and two steps at a time. The gap between them grows by one every iteration, and that simple fact answers two classic questions without any extra memory:"),
          ul(
            "**Is there a cycle?** If the sequence loops, the fast pointer eventually laps the slow one and they land on the same node. If there's no loop, the fast pointer simply reaches the end.",
            "**Where is the middle?** When the fast pointer reaches the end, the slow pointer has travelled half as far, so it sits at the midpoint."
          ),
          ll([1, 2, 3, 4, 5], { p: { slow: 1, fast: 2 }, on: ['fast'], state: 'after 1 step: slow moved 1, fast moved 2' }),
          h('Where it applies'),
          p("Anything you can model as \"follow the next pointer\" works: linked lists, but also **implicit sequences** where the next value is computed from the current one (`x → f(x)`), like the digit-square sequence in [Happy Number](#/fast-and-slow-pointers/happy-number), or arrays where each value is an index to jump to."),
          h('Why not just use a hash set?'),
          p("Storing every visited node in a set also detects cycles, in $O(n)$ time **and $O(n)$ space**. Fast and slow pointers achieve the same in $O(1)$ space, which matters for huge lists or when the problem forbids extra memory."),
          h('Real-world uses'),
          ul(
            "**Detecting infinite loops** in iterative processes, such as pseudo-random number generators (Pollard's rho factoring algorithm is built on it).",
            "**Detecting cycles in pointer structures**, e.g. corrupted linked structures in memory or circular references in a chain of redirects.",
            "**Splitting a list in half** for merge sort on linked lists."
          ),
          h('Template'),
          code(`
            def has_cycle(head):
                slow = fast = head
                while fast and fast.next:
                    slow = slow.next
                    fast = fast.next.next
                    if slow is fast:
                        return True
                return False
            `, `
            function hasCycle(head) {
              let slow = head, fast = head;
              while (fast && fast.next) {
                slow = slow.next;
                fast = fast.next.next;
                if (slow === fast) return true;
              }
              return false;
            }
            `, `
            boolean hasCycle(ListNode head) {
                ListNode slow = head, fast = head;
                while (fast != null && fast.next != null) {
                    slow = slow.next;
                    fast = fast.next.next;
                    if (slow == fast) return true;
                }
                return false;
            }
            `),
        ],
      },

      {
        id: 'linked-list-loop',
        title: 'Linked List Loop',
        body: [
          p("Given the head of a singly linked list, determine whether the list contains a **cycle**: some node whose `next` pointer leads back to an earlier node, so that following `next` never reaches `null`."),
          ex('head = 0 → 2 → 3 → 4 → 5 → (back to 3)', 'True'),
          ex('head = 1 → 2 → null', 'False'),
          ap(1, 'Hash set of visited nodes'),
          p("Walk the list and remember every node in a hash set. Reaching `null` means there's no cycle. Seeing a node that's **already in the set** means we've come back around, so there is a cycle."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def linked_list_loop_hash_set(head: ListNode) -> bool:
                visited = set()
                while head:
                    if head in visited:  # node identity, not value
                        return True
                    visited.add(head)
                    head = head.next
                return False
            `, `
            function linkedListLoopHashSet(head) {
              const visited = new Set();
              for (let node = head; node; node = node.next) {
                if (visited.has(node)) return true; // node identity, not value
                visited.add(node);
              }
              return false;
            }
            `, `
            public boolean linkedListLoopHashSet(ListNode head) {
                Set<ListNode> visited = new HashSet<>();
                for (ListNode node = head; node != null; node = node.next) {
                    if (!visited.add(node)) return true; // already seen this node
                }
                return false;
            }
            `),
          cost("$O(n)$: each node is visited at most once before a repeat is found.", "$O(n)$ for the set."),
          ap(2, "Fast and slow pointers (Floyd's algorithm, optimal)"),
          p("To use **constant** space, send two pointers down the list: `slow` moves one node per step and `fast` moves two."),
          ul(
            "**No cycle:** `fast` reaches `null` (or a node whose `next` is `null`) and we return `False`.",
            "**Cycle:** both pointers eventually enter the loop. From then on, each iteration `fast` gains exactly one node on `slow`. A gap that shrinks by one each step must hit zero, so they meet, and they can't \"jump over\" each other."
          ),
          ll([0, 2, 3, 4, 5], { cycleTo: 2, p: { slow: 0, fast: 0 }, on: ['slow', 'fast'], state: 'start' }),
          ll([0, 2, 3, 4, 5], { cycleTo: 2, p: { slow: 1, fast: 2 }, on: ['slow', 'fast'], state: 'step 1' }),
          ll([0, 2, 3, 4, 5], { cycleTo: 2, p: { slow: 2, fast: 4 }, on: ['slow', 'fast'], state: 'step 2: fast is in the loop' }),
          ll([0, 2, 3, 4, 5], { cycleTo: 2, p: { slow: 3, fast: 3 }, on: ['slow', 'fast'], hl: [3], state: 'step 3: fast went 5 → 3 → 4\nslow == fast  →  cycle!' }),
          h3('Follow-up: where does the cycle start?'),
          p("After they meet, put one pointer back at the head and move **both** one step at a time. The node where they meet again is the start of the cycle. (If the distance from head to cycle start is `a`, a little algebra shows the meeting point is also `a` steps, modulo the loop length, away from the cycle start.)"),
          impl(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def linked_list_loop(head: ListNode) -> bool:
                slow = fast = head
                while fast and fast.next:
                    slow = slow.next
                    fast = fast.next.next
                    if slow is fast:
                        return True
                return False

            def cycle_start(head: ListNode) -> ListNode:
                slow = fast = head
                while fast and fast.next:
                    slow, fast = slow.next, fast.next.next
                    if slow is fast:
                        slow = head
                        while slow is not fast:
                            slow, fast = slow.next, fast.next
                        return slow
                return None
            `, `
            function linkedListLoop(head) {
              let slow = head, fast = head;
              while (fast && fast.next) {
                slow = slow.next;
                fast = fast.next.next;
                if (slow === fast) return true;
              }
              return false;
            }

            function cycleStart(head) {
              let slow = head, fast = head;
              while (fast && fast.next) {
                slow = slow.next;
                fast = fast.next.next;
                if (slow === fast) {
                  slow = head;
                  while (slow !== fast) {
                    slow = slow.next;
                    fast = fast.next;
                  }
                  return slow;
                }
              }
              return null;
            }
            `, `
            public boolean linkedListLoop(ListNode head) {
                ListNode slow = head, fast = head;
                while (fast != null && fast.next != null) {
                    slow = slow.next;
                    fast = fast.next.next;
                    if (slow == fast) return true;
                }
                return false;
            }

            public ListNode cycleStart(ListNode head) {
                ListNode slow = head, fast = head;
                while (fast != null && fast.next != null) {
                    slow = slow.next;
                    fast = fast.next.next;
                    if (slow == fast) {
                        slow = head;
                        while (slow != fast) {
                            slow = slow.next;
                            fast = fast.next;
                        }
                        return slow;
                    }
                }
                return null;
            }
            `),
          cx("$O(n)$. Without a cycle, `fast` reaches the end in $n/2$ steps. With a cycle, `slow` enters the loop within $n$ steps and is caught within one more lap.",
            "$O(1)$."),
          vs([
            ['1. Hash set of visited nodes', '$O(n)$', '$O(n)$', 'Easiest to explain; also tells you the first repeated node.'],
            ['2. Fast and slow pointers', '$O(n)$', '$O(1)$', 'The expected answer, plus the cycle-start follow-up.'],
          ]),
          tests([
            ['values = [], pos = -1', 'False', 'Empty list.'],
            ['values = [1], pos = -1', 'False', 'One node, no cycle.'],
            ['values = [1], pos = 0', 'True', 'A node that points to itself.'],
            ['values = [1, 2], pos = 0', 'True', 'Two-node cycle.'],
            ['values = [1, 2, 3, 4], pos = -1', 'False', 'Even length, no cycle (fast stops on null).'],
            ['values = [1, 2, 3, 4, 5], pos = 4', 'True', 'The tail points to itself.'],
            ['values = [0, 2, 3, 4, 5], pos = 2', 'True', 'Example 1.'],
          ], {
            fn: ['linked_list_loop_hash_set', 'linked_list_loop'],
            call: "lambda fn, kw: fn(_cyc(kw['values'], kw['pos']))",
            jscall: "(fn, kw) => fn(cyc(kw.values, kw.pos))",
          }),
          note("In the table, `values` lists the nodes in order and `pos` is the index of the node the tail links back to; `pos = -1` means the tail points to `null`."),
          tips(
            "Interviewers often ask *why* the pointers must meet. Inside the loop, the gap between them shrinks by exactly one node per step, so it reaches zero instead of skipping past it.",
            "Be ready for the follow-ups: the start of the cycle (reset one pointer to the head) and the cycle's length (keep one pointer still and count steps until the other returns)."
          ),
        ],
      },

      {
        id: 'linked-list-midpoint',
        title: 'Linked List Midpoint',
        body: [
          p("Given the head of a non-empty singly linked list, return its **middle node**. If the list has an even number of nodes, return the **second** of the two middle nodes."),
          ex('head = 1 → 2 → 3 → 4 → 5', 'node 3'),
          ex('head = 1 → 2 → 3 → 4', 'node 3', 'the two middle nodes are 2 and 3; we return the second.'),
          ap(1, 'Count the nodes, then walk halfway'),
          p("First count the nodes, `n`. The second middle node is at index `n // 2` (for `n = 5` that's index 2, for `n = 4` index 2 as well), so a second pass walks that many steps from the head."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def linked_list_midpoint_count(head: ListNode) -> ListNode:
                n = 0
                node = head
                while node:
                    n += 1
                    node = node.next
                node = head
                for _ in range(n // 2):
                    node = node.next
                return node
            `, `
            function linkedListMidpointCount(head) {
              let n = 0;
              for (let node = head; node; node = node.next) n++;
              let node = head;
              for (let i = 0; i < Math.floor(n / 2); i++) node = node.next;
              return node;
            }
            `, `
            public ListNode linkedListMidpointCount(ListNode head) {
                int n = 0;
                for (ListNode node = head; node != null; node = node.next) n++;
                ListNode node = head;
                for (int i = 0; i < n / 2; i++) node = node.next;
                return node;
            }
            `),
          cost("$O(n)$: one full pass and one half pass.", "$O(1)$."),
          ap(2, 'Fast and slow pointers (one pass, optimal)'),
          p("With fast and slow pointers we need only one pass: `fast` moves two nodes for every one that `slow` moves, so when `fast` runs out of list, `slow` has covered half of it."),
          ll([1, 2, 3, 4, 5], { p: { slow: 0, fast: 0 }, on: ['slow', 'fast'] }),
          ll([1, 2, 3, 4, 5], { p: { slow: 1, fast: 2 }, on: ['slow', 'fast'] }),
          ll([1, 2, 3, 4, 5], { p: { slow: 2, fast: 4 }, on: ['slow', 'fast'], hl: [2], state: 'fast.next is null  →  stop\nslow is the middle' }),
          p("For an even length the loop condition `fast and fast.next` lets `fast` step past the last node to `null`, which leaves `slow` on the **second** middle node:"),
          ll([1, 2, 3, 4], { p: { slow: 2, fast: 4 }, on: ['slow', 'fast'], hl: [2], state: 'fast is null  →  stop\nslow = node 3' }),
          note("If you need the **first** middle for even lengths instead (handy when splitting a list for merge sort), loop while `fast.next and fast.next.next`."),
          impl(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def linked_list_midpoint(head: ListNode) -> ListNode:
                slow = fast = head
                while fast and fast.next:
                    slow = slow.next
                    fast = fast.next.next
                return slow
            `, `
            function linkedListMidpoint(head) {
              let slow = head, fast = head;
              while (fast && fast.next) {
                slow = slow.next;
                fast = fast.next.next;
              }
              return slow;
            }
            `, `
            public ListNode linkedListMidpoint(ListNode head) {
                ListNode slow = head, fast = head;
                while (fast != null && fast.next != null) {
                    slow = slow.next;
                    fast = fast.next.next;
                }
                return slow;
            }
            `),
          cx("$O(n)$. `fast` traverses the list once.", "$O(1)$."),
          vs([
            ['1. Count, then walk', '$O(n)$', '$O(1)$', 'Straightforward; needs two traversals.'],
            ['2. Fast and slow pointers', '$O(n)$', '$O(1)$', 'One traversal; the building block for palindrome checks and merge sort on lists.'],
          ]),
          tests([
            ['head = [1]', '[1]', 'A single node is the middle.'],
            ['head = [1, 2]', '[2]', 'Two nodes: return the second.'],
            ['head = [1, 2, 3]', '[2, 3]', 'Smallest odd length above one.'],
            ['head = [5, 5, 5, 5]', '[5, 5]', 'Equal values: the position is what matters.'],
            ['head = [1, 2, 3, 4]', '[3, 4]', 'Example 2: even length returns the second middle.'],
            ['head = [1, 2, 3, 4, 5]', '[3, 4, 5]', 'Example 1.'],
          ], { fn: ['linked_list_midpoint_count', 'linked_list_midpoint'], conv: { head: 'list' }, out: 'list' }),
          note("The expected output is the returned node **followed by the rest of the list**, which pins down exactly which node was returned."),
          tips(
            "Ask which middle is wanted for even lengths, then pick the loop condition to match: `fast and fast.next` gives the second middle, `fast.next and fast.next.next` gives the first."
          ),
        ],
      },

      {
        id: 'happy-number',
        title: 'Happy Number',
        body: [
          p("Start with a positive integer and repeatedly replace it with the **sum of the squares of its digits**. If this process eventually reaches **1**, the number is **happy**. Otherwise the process loops forever through a cycle that never includes 1. Return whether the given number is happy."),
          ex('n = 19', 'True', "19 → 1² + 9² = 82 → 68 → 100 → 1."),
          ex('n = 4', 'False', "4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 → … repeats without reaching 1."),
          ap(1, 'Hash set of seen numbers'),
          p("Simulate the process and remember every number in a hash set. If we reach 1, the number is happy. If we produce a number we've **already seen**, the sequence has entered a loop that doesn't contain 1, so it never will."),
          code(`
            def happy_number_hash_set(n: int) -> bool:
                seen = set()
                while n != 1 and n not in seen:
                    seen.add(n)
                    n = sum(int(d) ** 2 for d in str(n))
                return n == 1
            `, `
            function happyNumberHashSet(n) {
              const seen = new Set();
              while (n !== 1 && !seen.has(n)) {
                seen.add(n);
                n = String(n).split('').reduce((sum, d) => sum + d * d, 0);
              }
              return n === 1;
            }
            `, `
            public boolean happyNumberHashSet(int n) {
                Set<Integer> seen = new HashSet<>();
                while (n != 1 && seen.add(n)) { // add() is false if n was already seen
                    int next = 0;
                    for (int x = n; x > 0; x /= 10) next += (x % 10) * (x % 10);
                    n = next;
                }
                return n == 1;
            }
            `),
          cost("$O(log n)$ per step for the digits, and only a small, bounded number of steps once values drop below a few hundred.", "$O(log n)$ for the stored numbers (the sequence visits only a small set of values)."),
          p("This is the answer most people write first, and it's perfectly good. The follow-up asks whether we can avoid storing the numbers at all."),
          ap(2, 'Fast and slow pointers (constant space, optimal)'),
          p("Think of each number as a node whose `next` is its digit-square sum. The sequence starting at `n` is then an **implicit linked list**. Since numbers can't grow without bound (any number with 4 or more digits maps to a smaller number), the sequence must eventually repeat, so it always ends in a cycle. The question is just whether that cycle is the trivial loop `1 → 1`."),
          pre(`
            n = 4:   4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 ┐
                     ↑                                    │
                     └────────────────────────────────────┘
            n = 19:  19 → 82 → 68 → 100 → 1 ⟲
          `),
          p("That's exactly cycle detection, so fast and slow pointers apply: advance `slow` by one step of the sequence and `fast` by two. They're guaranteed to meet inside the cycle. If they meet at 1, the number is happy."),
          state('n = 4\nslow: 16, 37, 58, 89, 145, 42, 20, 4\nfast: 37, 89, 42,  4,  37, 89, 42, 4\nafter 8 steps both are at 4 (≠ 1)  →  not happy'),
          note("Compared with the hash set, fast and slow pointers bring the extra space down to $O(1)$, at the price of computing some numbers twice."),
          impl(`
            def happy_number(n: int) -> bool:
                slow = fast = n
                while True:
                    slow = next_number(slow)
                    fast = next_number(next_number(fast))
                    if fast == 1:
                        return True
                    if slow == fast:
                        return False

            def next_number(x: int) -> int:
                total = 0
                while x > 0:
                    x, digit = divmod(x, 10)
                    total += digit * digit
                return total
            `, `
            function happyNumber(n) {
              const nextNumber = x => {
                let total = 0;
                while (x > 0) {
                  const digit = x % 10;
                  total += digit * digit;
                  x = Math.floor(x / 10);
                }
                return total;
              };
              let slow = n, fast = n;
              while (true) {
                slow = nextNumber(slow);
                fast = nextNumber(nextNumber(fast));
                if (fast === 1) return true;
                if (slow === fast) return false;
              }
            }
            `, `
            public boolean happyNumber(int n) {
                int slow = n, fast = n;
                while (true) {
                    slow = nextNumber(slow);
                    fast = nextNumber(nextNumber(fast));
                    if (fast == 1) return true;
                    if (slow == fast) return false;
                }
            }

            private int nextNumber(int x) {
                int total = 0;
                while (x > 0) {
                    int digit = x % 10;
                    total += digit * digit;
                    x /= 10;
                }
                return total;
            }
            `),
          cx("$O(\\log n)$. Computing the next number takes time proportional to the number of digits, and values quickly drop below a few hundred, after which the cycle is found in a bounded number of steps.",
            "$O(1)$."),
          vs([
            ['1. Hash set of seen numbers', '$O(log n)$', '$O(log n)$', 'The first answer most people write; easy to reason about.'],
            ['2. Fast and slow pointers', '$O(log n)$', '$O(1)$', 'When asked to avoid extra memory.'],
          ]),
          tests([
            ['n = 1', 'True', 'Already 1.'],
            ['n = 10', 'True', '1² + 0² = 1 in a single step.'],
            ['n = 7', 'True', '7 → 49 → 97 → 130 → 10 → 1.'],
            ['n = 2', 'False', 'Falls into the 4 → 16 → … → 4 loop.'],
            ['n = 1111111', 'True', 'Seven 1s sum to 7, which is happy.'],
            ['n = 999999999', 'False', 'A large number collapses quickly (to 729) and then loops.'],
            ['n = 19', 'True', 'Example 1.'],
            ['n = 4', 'False', 'Example 2.'],
          ], { fn: ['happy_number_hash_set', 'happy_number'] }),
          tips(
            "Explain why the sequence can't grow forever: a number with $d$ digits maps to at most $81d$, which is smaller than the number itself once $d ≥ 4$. That proves a cycle must appear.",
            "A cute fact to mention: every unhappy number eventually enters the same cycle, the one through 4 (4, 16, 37, 58, 89, 145, 42, 20). Hard-coding it works but is not what interviewers want to see."
          ),
        ],
      },
    ],
  });
})();
