(function () {
  const { p, h, h3, ul, ol, note, ex, arr, ll, state, code, impl, cx, table, pre, rg } = K;

  K.section({
    id: 'sort-and-search',
    title: 'Sort and Search',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Sort and Search',
        body: [
          p("Sorting is often the **first step** that makes everything else easy: it unlocks two pointers, binary search, merging intervals and grouping duplicates. Interviews also ask you to implement sorting algorithms directly, or to adapt their ideas (partitioning, merging) to new problems."),
          h('The algorithms worth knowing'),
          table(['Algorithm', 'Average', 'Worst', 'Extra space', 'Stable?'], [
            ['Merge sort', '$O(n \\log n)$', '$O(n \\log n)$', '$O(n)$ (arrays), $O(\\log n)$ (linked lists)', 'yes'],
            ['Quicksort', '$O(n \\log n)$', '$O(n^2)$', '$O(\\log n)$', 'no'],
            ['Heapsort', '$O(n \\log n)$', '$O(n \\log n)$', '$O(1)$', 'no'],
            ['Insertion sort', '$O(n^2)$', '$O(n^2)$', '$O(1)$', 'yes; fast on nearly sorted data'],
            ['Counting sort', '$O(n + k)$', '$O(n + k)$', '$O(k)$', 'yes; integers in a small range $k$'],
          ]),
          p("A sort is **stable** if equal elements keep their original relative order, which matters when sorting records by one field after another."),
          h('Two building blocks'),
          ul(
            "**Merging**: combine two sorted sequences into one in linear time. The heart of merge sort, and of problems like merging sorted lists or intervals.",
            "**Partitioning**: rearrange elements around a **pivot** so smaller ones come first and larger ones after. The heart of quicksort and of **quickselect**, which finds the k-th smallest element in average $O(n)$ without fully sorting."
          ),
          h('Language notes'),
          ul(
            "**Python**: `sorted()` / `list.sort()` use Timsort (stable, $O(n \\log n)$). Pass `key=` to sort by a derived value.",
            "**JavaScript**: `array.sort()` compares as **strings** by default! Always pass a comparator for numbers: `nums.sort((a, b) => a - b)`.",
            "**Java**: `Arrays.sort` on primitives uses a dual-pivot quicksort; on objects (and `Collections.sort`) a stable merge sort. Use `Comparator` lambdas for custom orders."
          ),
          h('Real-world uses'),
          ul(
            "**Databases** sort data for `ORDER BY`, merge joins and building indexes; external merge sort handles data larger than memory.",
            "**Search engines and feeds** rank results, often with partial sorting (top-k).",
            "**Statistics**: medians and percentiles via quickselect.",
            "**Deduplication**: sort, then remove adjacent duplicates."
          ),
        ],
      },

      {
        id: 'sort-linked-list',
        title: 'Sort Linked List',
        body: [
          p("Given the head of a singly linked list, **sort it in ascending order** and return the new head. Aim for $O(n \\log n)$ time."),
          ex('head = 3 → 2 → 4 → 5 → 1', '1 → 2 → 3 → 4 → 5'),
          h('Intuition'),
          p("Quicksort relies on fast random access, which linked lists don't have. **Merge sort**, on the other hand, fits linked lists perfectly: splitting needs only the midpoint, and merging two sorted lists just relinks nodes with no extra arrays."),
          ol(
            "**Split** the list in half using fast and slow pointers ([Linked List Midpoint](#/fast-and-slow-pointers/linked-list-midpoint)), stopping `slow` at the **first** middle so the left half is never empty.",
            "**Sort** each half recursively.",
            "**Merge** the two sorted halves by repeatedly taking the smaller head."
          ),
          pre(`
            3 → 2 → 4 → 5 → 1
            split:      3 → 2 → 4        5 → 1
            split:    3 → 2    4         5    1
            split:   3    2
            merge:   2 → 3      → 2 → 3 → 4      1 → 5
            merge:                1 → 2 → 3 → 4 → 5
          `),
          impl(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def sort_linked_list(head: ListNode) -> ListNode:
                if head is None or head.next is None:
                    return head
                # 1. Split: slow stops at the first middle node.
                slow, fast = head, head.next
                while fast and fast.next:
                    slow, fast = slow.next, fast.next.next
                second = slow.next
                slow.next = None
                # 2. Sort both halves, 3. merge them.
                return merge(sort_linked_list(head), sort_linked_list(second))

            def merge(a: ListNode, b: ListNode) -> ListNode:
                dummy = tail = ListNode(0)
                while a and b:
                    if a.val <= b.val:          # <= keeps the sort stable
                        tail.next, a = a, a.next
                    else:
                        tail.next, b = b, b.next
                    tail = tail.next
                tail.next = a or b
                return dummy.next
            `, `
            function sortLinkedList(head) {
              if (!head || !head.next) return head;
              // 1. Split: slow stops at the first middle node.
              let slow = head, fast = head.next;
              while (fast && fast.next) {
                slow = slow.next;
                fast = fast.next.next;
              }
              const second = slow.next;
              slow.next = null;
              // 2. Sort both halves, 3. merge them.
              return merge(sortLinkedList(head), sortLinkedList(second));
            }

            function merge(a, b) {
              const dummy = new ListNode(0);
              let tail = dummy;
              while (a && b) {
                if (a.val <= b.val) { tail.next = a; a = a.next; }
                else { tail.next = b; b = b.next; }
                tail = tail.next;
              }
              tail.next = a || b;
              return dummy.next;
            }
            `, `
            public ListNode sortLinkedList(ListNode head) {
                if (head == null || head.next == null) return head;
                // 1. Split: slow stops at the first middle node.
                ListNode slow = head, fast = head.next;
                while (fast != null && fast.next != null) {
                    slow = slow.next;
                    fast = fast.next.next;
                }
                ListNode second = slow.next;
                slow.next = null;
                // 2. Sort both halves, 3. merge them.
                return merge(sortLinkedList(head), sortLinkedList(second));
            }

            private ListNode merge(ListNode a, ListNode b) {
                ListNode dummy = new ListNode(0), tail = dummy;
                while (a != null && b != null) {
                    if (a.val <= b.val) { tail.next = a; a = a.next; }
                    else { tail.next = b; b = b.next; }
                    tail = tail.next;
                }
                tail.next = (a != null) ? a : b;
                return dummy.next;
            }
            `),
          cx("$O(n \\log n)$. There are $\\log n$ levels of splitting, and each level merges $n$ nodes in total.",
            "$O(\\log n)$ for the recursion stack; merging itself only relinks nodes."),
        ],
      },

      {
        id: 'sort-array',
        title: 'Sort Array',
        body: [
          p("Sort an array of integers in ascending order **without using a built-in sort**. Aim for $O(n \\log n)$ on average."),
          ex('nums = [6, 8, 4, 2, 7, 3, 1, 5]', '[1, 2, 3, 4, 5, 6, 7, 8]'),
          h('Intuition: quicksort'),
          p("Quicksort picks a **pivot**, **partitions** the array so everything smaller than the pivot is on its left and everything else on its right, and then sorts the two sides recursively. After partitioning, the pivot is already in its final position."),
          h3('Lomuto partition'),
          p("Move the pivot to the end. Scan with `i`; a pointer `lo` marks where the next element smaller than the pivot should go. Finally, swap the pivot into position `lo`."),
          arr([6, 8, 4, 2, 7, 3, 1, 5], { p: { lo: 0, i: 0 }, hl2: [7], state: 'pivot = 5 (last element)' }),
          arr([4, 2, 3, 1, 7, 6, 8, 5], { p: { lo: 4, i: 7 }, hl: [0, 1, 2, 3], hl2: [7], state: 'after scanning: values < 5 moved to the front\nlo = 4' }),
          arr([4, 2, 3, 1, 5, 6, 8, 7], { p: { pivot: 4 }, on: ['pivot'], hl: [0, 1, 2, 3], hl2: [4], state: 'swap pivot into lo: 5 is in its final spot\nrecurse on [0..3] and [5..7]' }),
          note("Always choosing the last element as the pivot degrades to $O(n^2)$ on already-sorted input. Picking a **random** pivot makes that worst case vanishingly unlikely."),
          impl(`
            import random
            from typing import List

            def sort_array(nums: List[int]) -> List[int]:
                quicksort(nums, 0, len(nums) - 1)
                return nums

            def quicksort(nums: List[int], left: int, right: int) -> None:
                if left >= right:
                    return
                p = partition(nums, left, right)
                quicksort(nums, left, p - 1)
                quicksort(nums, p + 1, right)

            def partition(nums: List[int], left: int, right: int) -> int:
                r = random.randint(left, right)          # random pivot
                nums[r], nums[right] = nums[right], nums[r]
                pivot = nums[right]
                lo = left
                for i in range(left, right):
                    if nums[i] < pivot:
                        nums[lo], nums[i] = nums[i], nums[lo]
                        lo += 1
                nums[lo], nums[right] = nums[right], nums[lo]  # pivot to its final spot
                return lo
            `, `
            function sortArray(nums) {
              const swap = (i, j) => { [nums[i], nums[j]] = [nums[j], nums[i]]; };
              const partition = (left, right) => {
                swap(left + Math.floor(Math.random() * (right - left + 1)), right); // random pivot
                const pivot = nums[right];
                let lo = left;
                for (let i = left; i < right; i++) {
                  if (nums[i] < pivot) swap(lo++, i);
                }
                swap(lo, right); // pivot to its final spot
                return lo;
              };
              const quicksort = (left, right) => {
                if (left >= right) return;
                const p = partition(left, right);
                quicksort(left, p - 1);
                quicksort(p + 1, right);
              };
              quicksort(0, nums.length - 1);
              return nums;
            }
            `, `
            private final Random random = new Random();

            public int[] sortArray(int[] nums) {
                quicksort(nums, 0, nums.length - 1);
                return nums;
            }

            private void quicksort(int[] nums, int left, int right) {
                if (left >= right) return;
                int p = partition(nums, left, right);
                quicksort(nums, left, p - 1);
                quicksort(nums, p + 1, right);
            }

            private int partition(int[] nums, int left, int right) {
                swap(nums, left + random.nextInt(right - left + 1), right); // random pivot
                int pivot = nums[right], lo = left;
                for (int i = left; i < right; i++) {
                    if (nums[i] < pivot) swap(nums, lo++, i);
                }
                swap(nums, lo, right); // pivot to its final spot
                return lo;
            }

            private void swap(int[] nums, int i, int j) {
                int t = nums[i];
                nums[i] = nums[j];
                nums[j] = t;
            }
            `),
          cx("$O(n \\log n)$ on average; $O(n^2)$ in the (unlikely, with random pivots) worst case.",
            "$O(\\log n)$ on average for the recursion stack."),
        ],
      },

      {
        id: 'kth-largest-integer',
        title: 'Kth Largest Integer',
        body: [
          p("Return the **k-th largest** integer in an unsorted array (counting duplicates: in `[3, 3, 1]` the 2nd largest is 3)."),
          ex('nums = [5, 2, 4, 3, 1, 6], k = 2', '5'),
          ex('nums = [3, 3, 1], k = 2', '3'),
          h('Intuition'),
          p("Three approaches, each better in some situation:"),
          table(['Approach', 'Time', 'Space'], [
            ['Sort, then index `n - k`', '$O(n \\log n)$', 'depends on sort'],
            ['Min-heap of size `k` (its top is the k-th largest)', '$O(n \\log k)$', '$O(k)$'],
            ['**Quickselect**', '$O(n)$ average', '$O(1)$ extra'],
          ]),
          p("**Quickselect** borrows quicksort's partition step. After partitioning, the pivot sits at its **final sorted index** `p`. The k-th largest lives at sorted index `n - k`:"),
          ul(
            "If `p == n - k`, the pivot is the answer.",
            "If `p < n - k`, the answer is to the right: continue **only** in that part.",
            "Otherwise continue only in the left part."
          ),
          p("Unlike quicksort, we recurse into just **one** side, so on average the work is $n + n/2 + n/4 + … ≈ 2n$, i.e. linear."),
          arr([2, 1, 3, 4, 5, 6], { p: { pivot: 3 }, on: ['pivot'], hl2: [4], state: 'n - k = 4; partition around 4 → p = 3\np < 4  →  search right part [4..5]' }),
          arr([2, 1, 3, 4, 5, 6], { p: { pivot: 4 }, on: ['pivot'], hl: [4], dim: [0, 1, 2, 3], state: 'partition [5, 6] around 5 → p = 4 == n - k\nanswer 5' }),
          impl(`
            import random
            from typing import List

            def kth_largest_integer(nums: List[int], k: int) -> int:
                target = len(nums) - k            # index in ascending sorted order
                left, right = 0, len(nums) - 1
                while True:
                    p = partition(nums, left, right)
                    if p == target:
                        return nums[p]
                    if p < target:
                        left = p + 1
                    else:
                        right = p - 1

            def partition(nums: List[int], left: int, right: int) -> int:
                r = random.randint(left, right)
                nums[r], nums[right] = nums[right], nums[r]
                pivot, lo = nums[right], left
                for i in range(left, right):
                    if nums[i] < pivot:
                        nums[lo], nums[i] = nums[i], nums[lo]
                        lo += 1
                nums[lo], nums[right] = nums[right], nums[lo]
                return lo
            `, `
            function kthLargestInteger(nums, k) {
              const swap = (i, j) => { [nums[i], nums[j]] = [nums[j], nums[i]]; };
              const partition = (left, right) => {
                swap(left + Math.floor(Math.random() * (right - left + 1)), right);
                const pivot = nums[right];
                let lo = left;
                for (let i = left; i < right; i++) if (nums[i] < pivot) swap(lo++, i);
                swap(lo, right);
                return lo;
              };
              const target = nums.length - k; // index in ascending sorted order
              let left = 0, right = nums.length - 1;
              while (true) {
                const p = partition(left, right);
                if (p === target) return nums[p];
                if (p < target) left = p + 1;
                else right = p - 1;
              }
            }
            `, `
            private final Random random = new Random();

            public int kthLargestInteger(int[] nums, int k) {
                int target = nums.length - k; // index in ascending sorted order
                int left = 0, right = nums.length - 1;
                while (true) {
                    int p = partition(nums, left, right);
                    if (p == target) return nums[p];
                    if (p < target) left = p + 1;
                    else right = p - 1;
                }
            }

            private int partition(int[] nums, int left, int right) {
                swap(nums, left + random.nextInt(right - left + 1), right);
                int pivot = nums[right], lo = left;
                for (int i = left; i < right; i++) if (nums[i] < pivot) swap(nums, lo++, i);
                swap(nums, lo, right);
                return lo;
            }

            private void swap(int[] nums, int i, int j) {
                int t = nums[i];
                nums[i] = nums[j];
                nums[j] = t;
            }
            `),
          cx("$O(n)$ on average; $O(n^2)$ in the worst case (very unlikely with random pivots).", "$O(1)$ extra space; the array is rearranged in place."),
        ],
      },
    ],
  });
})();
