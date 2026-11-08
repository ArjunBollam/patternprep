(function () {
  const { p, h, h3, ul, ol, note, ex, ll, arr, state, code, impl, cx, pre } = K;

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
          h('Intuition'),
          p("A hash set of visited nodes solves this in $O(n)$ space: if we ever see a node twice, there's a cycle. To use **constant** space, send two pointers down the list: `slow` moves one node per step and `fast` moves two."),
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
        ],
      },

      {
        id: 'linked-list-midpoint',
        title: 'Linked List Midpoint',
        body: [
          p("Given the head of a non-empty singly linked list, return its **middle node**. If the list has an even number of nodes, return the **second** of the two middle nodes."),
          ex('head = 1 → 2 → 3 → 4 → 5', 'node 3'),
          ex('head = 1 → 2 → 3 → 4', 'node 3', 'the two middle nodes are 2 and 3; we return the second.'),
          h('Intuition'),
          p("Counting the nodes and then walking `n / 2` steps takes two passes. With fast and slow pointers we need one: `fast` moves two nodes for every one that `slow` moves, so when `fast` runs out of list, `slow` has covered half of it."),
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
        ],
      },

      {
        id: 'happy-number',
        title: 'Happy Number',
        body: [
          p("Start with a positive integer and repeatedly replace it with the **sum of the squares of its digits**. If this process eventually reaches **1**, the number is **happy**. Otherwise the process loops forever through a cycle that never includes 1. Return whether the given number is happy."),
          ex('n = 19', 'True', "19 → 1² + 9² = 82 → 68 → 100 → 1."),
          ex('n = 4', 'False', "4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 → … repeats without reaching 1."),
          h('Intuition'),
          p("Think of each number as a node whose `next` is its digit-square sum. The sequence starting at `n` is then an **implicit linked list**. Since numbers can't grow without bound (any number with 4 or more digits maps to a smaller number), the sequence must eventually repeat, so it always ends in a cycle. The question is just whether that cycle is the trivial loop `1 → 1`."),
          pre(`
            n = 4:   4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 ┐
                     ↑                                    │
                     └────────────────────────────────────┘
            n = 19:  19 → 82 → 68 → 100 → 1 ⟲
          `),
          p("That's exactly cycle detection, so fast and slow pointers apply: advance `slow` by one step of the sequence and `fast` by two. They're guaranteed to meet inside the cycle. If they meet at 1, the number is happy."),
          state('n = 4\nslow: 16, 37, 58, 89, 145, 42, 20, 4\nfast: 37, 89, 42,  4,  37, 89, 42, 4\nafter 8 steps both are at 4 (≠ 1)  →  not happy'),
          note("A hash set of seen numbers also works and is often what people write first. Fast and slow pointers bring the extra space down from $O(\\log n)$-ish to $O(1)$."),
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
        ],
      },
    ],
  });
})();
