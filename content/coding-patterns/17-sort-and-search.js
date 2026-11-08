(function () {
  const { p, h, h3, ul, ol, note, ex, arr, ll, state, code, impl, cx, table, pre, rg, ap, cost, vs, tests, tips } = K;

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
          ap(1, 'Copy the values out, sort, write them back'),
          p("The simplest working answer: copy the values into an array, use any array sort, and write the sorted values back into the same nodes."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def sort_linked_list_array(head: ListNode) -> ListNode:
                values = []
                node = head
                while node:
                    values.append(node.val)
                    node = node.next
                values.sort()
                node = head
                for v in values:  # reuse the same nodes, in order
                    node.val = v
                    node = node.next
                return head
            `, `
            function sortLinkedListArray(head) {
              const values = [];
              for (let node = head; node; node = node.next) values.push(node.val);
              values.sort((a, b) => a - b);
              let node = head;
              for (const v of values) { node.val = v; node = node.next; } // reuse the same nodes
              return head;
            }
            `, `
            public ListNode sortLinkedListArray(ListNode head) {
                List<Integer> values = new ArrayList<>();
                for (ListNode node = head; node != null; node = node.next) values.add(node.val);
                Collections.sort(values);
                ListNode node = head;
                for (int v : values) { node.val = v; node = node.next; } // reuse the same nodes
                return head;
            }
            `),
          cost("$O(n log n)$.", "$O(n)$ for the copied values."),
          ap(2, 'Insertion sort on the list'),
          p("Build a sorted list one node at a time: take each node off the input and splice it into the right place in the sorted list. A dummy node in front of the sorted part keeps the splicing simple."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)

            def sort_linked_list_insertion(head: ListNode) -> ListNode:
                dummy = ListNode(0)  # dummy.next is the sorted part
                while head:
                    nxt = head.next
                    prev = dummy
                    while prev.next and prev.next.val < head.val:  # find where head belongs
                        prev = prev.next
                    head.next = prev.next
                    prev.next = head
                    head = nxt
                return dummy.next
            `, `
            function sortLinkedListInsertion(head) {
              const dummy = new ListNode(0); // dummy.next is the sorted part
              while (head) {
                const nxt = head.next;
                let prev = dummy;
                while (prev.next && prev.next.val < head.val) prev = prev.next; // find where head belongs
                head.next = prev.next;
                prev.next = head;
                head = nxt;
              }
              return dummy.next;
            }
            `, `
            public ListNode sortLinkedListInsertion(ListNode head) {
                ListNode dummy = new ListNode(0); // dummy.next is the sorted part
                while (head != null) {
                    ListNode nxt = head.next, prev = dummy;
                    while (prev.next != null && prev.next.val < head.val) prev = prev.next; // where head belongs
                    head.next = prev.next;
                    prev.next = head;
                    head = nxt;
                }
                return dummy.next;
            }
            `),
          cost("$O(n^2)$ in the worst case (each insertion may walk the whole sorted part).", "$O(1)$."),
          ap(3, 'Merge sort (optimal)'),
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
          vs([
            ['1. Array copy + sort', '$O(n log n)$', '$O(n)$', 'Quick to write when extra memory is fine.'],
            ['2. Insertion sort', '$O(n^2)$', '$O(1)$', 'Nearly sorted or very short lists.'],
            ['3. Merge sort', '$O(n log n)$', '$O(log n)$ recursion', 'The expected answer.'],
          ]),
          tests([
            ['head = []', '[]', 'Empty list.'],
            ['head = [1]', '[1]', 'A single node.'],
            ['head = [2, 1]', '[1, 2]', 'Two nodes out of order.'],
            ['head = [1, 2, 3]', '[1, 2, 3]', 'Already sorted.'],
            ['head = [3, 3, 1, 1]', '[1, 1, 3, 3]', 'Duplicate values.'],
            ['head = [-5, 10, 0, -5]', '[-5, -5, 0, 10]', 'Negative values.'],
            ['head = [3, 2, 4, 5, 1]', '[1, 2, 3, 4, 5]', 'Example 1.'],
          ], { fn: ['sort_linked_list_array', 'sort_linked_list_insertion', 'sort_linked_list'], conv: { head: 'list' }, out: 'list' }),
          tips(
            "Follow-up: $O(1)$ extra space. **Bottom-up** merge sort merges runs of length 1, 2, 4, … iteratively, with no recursion.",
            "Use the **first** middle when splitting (stop `fast` one step early). With the second middle, a two-node list never shrinks and the recursion never ends."
          ),
        ],
      },

      {
        id: 'sort-array',
        title: 'Sort Array',
        body: [
          p("Sort an array of integers in ascending order **without using a built-in sort**. Aim for $O(n \\log n)$ on average."),
          ex('nums = [6, 8, 4, 2, 7, 3, 1, 5]', '[1, 2, 3, 4, 5, 6, 7, 8]'),
          ap(1, 'A simple quadratic sort (insertion sort)'),
          p("Insertion sort grows a sorted prefix: each new element is shifted left past the larger elements until it's in place. It's short and correct, but quadratic."),
          code(`
            from typing import List

            def sort_array_insertion(nums: List[int]) -> List[int]:
                for i in range(1, len(nums)):
                    x, j = nums[i], i - 1
                    while j >= 0 and nums[j] > x:  # shift larger elements right
                        nums[j + 1] = nums[j]
                        j -= 1
                    nums[j + 1] = x
                return nums
            `, `
            function sortArrayInsertion(nums) {
              for (let i = 1; i < nums.length; i++) {
                const x = nums[i];
                let j = i - 1;
                while (j >= 0 && nums[j] > x) { nums[j + 1] = nums[j]; j--; } // shift larger elements right
                nums[j + 1] = x;
              }
              return nums;
            }
            `, `
            public int[] sortArrayInsertion(int[] nums) {
                for (int i = 1; i < nums.length; i++) {
                    int x = nums[i], j = i - 1;
                    while (j >= 0 && nums[j] > x) { nums[j + 1] = nums[j]; j--; } // shift larger elements right
                    nums[j + 1] = x;
                }
                return nums;
            }
            `),
          cost("$O(n^2)$ (but $O(n)$ on already sorted input).", "$O(1)$."),
          ap(2, 'Merge sort'),
          p("Split the array in half, sort each half recursively, and merge the two sorted halves with two pointers. It's $O(n log n)$ in **every** case and **stable** (equal elements keep their order), at the cost of a temporary array."),
          code(`
            from typing import List

            def sort_array_merge(nums: List[int]) -> List[int]:
                if len(nums) <= 1:
                    return nums
                mid = len(nums) // 2
                left, right = sort_array_merge(nums[:mid]), sort_array_merge(nums[mid:])
                merged, i, j = [], 0, 0
                while i < len(left) and j < len(right):
                    if left[i] <= right[j]:  # <= keeps the sort stable
                        merged.append(left[i])
                        i += 1
                    else:
                        merged.append(right[j])
                        j += 1
                return merged + left[i:] + right[j:]
            `, `
            function sortArrayMerge(nums) {
              if (nums.length <= 1) return nums;
              const mid = nums.length >> 1;
              const left = sortArrayMerge(nums.slice(0, mid)), right = sortArrayMerge(nums.slice(mid));
              const merged = [];
              let i = 0, j = 0;
              while (i < left.length && j < right.length) merged.push(left[i] <= right[j] ? left[i++] : right[j++]); // stable
              return merged.concat(left.slice(i), right.slice(j));
            }
            `, `
            public int[] sortArrayMerge(int[] nums) {
                if (nums.length <= 1) return nums;
                int mid = nums.length / 2;
                int[] left = sortArrayMerge(Arrays.copyOfRange(nums, 0, mid));
                int[] right = sortArrayMerge(Arrays.copyOfRange(nums, mid, nums.length));
                int[] merged = new int[nums.length];
                int i = 0, j = 0, k = 0;
                while (i < left.length && j < right.length) merged[k++] = left[i] <= right[j] ? left[i++] : right[j++]; // stable
                while (i < left.length) merged[k++] = left[i++];
                while (j < right.length) merged[k++] = right[j++];
                return merged;
            }
            `),
          cost("$O(n log n)$ always.", "$O(n)$ for the temporary arrays."),
          ap(3, 'Quicksort with a random pivot (fastest on average, in place)'),
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
          vs([
            ['1. Insertion sort', '$O(n^2)$', '$O(1)$', 'Small or nearly sorted arrays (real libraries switch to it for tiny ranges).'],
            ['2. Merge sort', '$O(n log n)$ always', '$O(n)$', 'When stability or a guaranteed bound matters.'],
            ['3. Quicksort', '$O(n log n)$ average', '$O(log n)$ stack', 'In-place and fast in practice.'],
          ]),
          tests([
            ['nums = []', '[]', 'Empty array.'],
            ['nums = [1]', '[1]', 'A single element.'],
            ['nums = [2, 1]', '[1, 2]', 'Two elements.'],
            ['nums = [5, 5, 5]', '[5, 5, 5]', 'All equal.'],
            ['nums = [1, 2, 3, 4]', '[1, 2, 3, 4]', 'Already sorted.'],
            ['nums = [3, -1, 0, -1]', '[-1, -1, 0, 3]', 'Negative numbers and duplicates.'],
            ['nums = [6, 8, 4, 2, 7, 3, 1, 5]', '[1, 2, 3, 4, 5, 6, 7, 8]', 'Example 1.'],
          ], { fn: ['sort_array_insertion', 'sort_array_merge', 'sort_array'] }),
          tips(
            "Heapsort is a fourth option: $O(n log n)$ worst case and in place, but not stable and slower in practice.",
            "If the values come from a small range (say 0-100), **counting sort** runs in $O(n + range)$; mention it when the constraints allow."
          ),
        ],
      },

      {
        id: 'kth-largest-integer',
        title: 'Kth Largest Integer',
        body: [
          p("Return the **k-th largest** integer in an unsorted array (counting duplicates: in `[3, 3, 1]` the 2nd largest is 3)."),
          ex('nums = [5, 2, 4, 3, 1, 6], k = 2', '5'),
          ex('nums = [3, 3, 1], k = 2', '3'),
          ap(1, 'Sort, then index'),
          p("In ascending order, the k-th largest value sits at index `n - k`."),
          code(`
            from typing import List

            def kth_largest_sort(nums: List[int], k: int) -> int:
                return sorted(nums)[len(nums) - k]
            `, `
            function kthLargestSort(nums, k) {
              return [...nums].sort((a, b) => a - b)[nums.length - k];
            }
            `, `
            public int kthLargestSort(int[] nums, int k) {
                int[] sorted = nums.clone();
                Arrays.sort(sorted);
                return sorted[nums.length - k];
            }
            `),
          cost("$O(n log n)$.", "$O(n)$ for the sorted copy (or $O(1)$ when sorting in place)."),
          ap(2, 'Min-heap of size k'),
          p("Keep the `k` largest values seen so far in a **min-heap**. Whenever it grows past `k`, pop the smallest. After one pass, the heap holds the top `k` values, and its top is the k-th largest."),
          code(`
            import heapq
            from typing import List

            def kth_largest_heap(nums: List[int], k: int) -> int:
                heap = []  # the k largest so far; smallest of them on top
                for x in nums:
                    heapq.heappush(heap, x)
                    if len(heap) > k:
                        heapq.heappop(heap)
                return heap[0]
            `, `
            // Uses the Heap class from "Introduction to Heaps".
            function kthLargestHeap(nums, k) {
              const heap = new Heap((a, b) => a - b); // the k largest so far; smallest on top
              for (const x of nums) {
                heap.push(x);
                if (heap.size() > k) heap.pop();
              }
              return heap.peek();
            }
            `, `
            public int kthLargestHeap(int[] nums, int k) {
                PriorityQueue<Integer> heap = new PriorityQueue<>(); // the k largest so far; smallest on top
                for (int x : nums) {
                    heap.offer(x);
                    if (heap.size() > k) heap.poll();
                }
                return heap.peek();
            }
            `),
          cost("$O(n log k)$.", "$O(k)$."),
          p("This is the right choice for a **stream** of numbers. For an array we can do better on average."),
          ap(3, 'Quickselect (optimal on average)'),
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
          vs([
            ['1. Sort, then index', '$O(n log n)$', '$O(1)$ to $O(n)$', 'Simplest; fine for small inputs.'],
            ['2. Min-heap of size k', '$O(n log k)$', '$O(k)$', 'Streams, or when `k` is small.'],
            ['3. Quickselect', '$O(n)$ average', '$O(1)$ extra', 'The expected answer for a single array.'],
          ]),
          tests([
            ['nums = [7], k = 1', '7', 'A single element.'],
            ['nums = [-1, -5, -3], k = 1', '-1', 'Negative numbers; k = 1 is the maximum.'],
            ['nums = [2, 2, 2, 2], k = 3', '2', 'All values equal.'],
            ['nums = [5, 2, 4, 3, 1, 6], k = 6', '1', 'k = n is the minimum.'],
            ['nums = [3, 3, 1], k = 2', '3', 'Example 2: duplicates count separately.'],
            ['nums = [5, 2, 4, 3, 1, 6], k = 2', '5', 'Example 1.'],
          ], { fn: ['kth_largest_sort', 'kth_largest_heap', 'kth_largest_integer'] }),
          tips(
            "Quickselect is $O(n^2)$ in the worst case with a bad pivot; a random pivot makes that vanishingly unlikely. (The *median of medians* pivot guarantees $O(n)$ but is rarely expected.)",
            "Quickselect rearranges the input. If that's not allowed, work on a copy or use the heap."
          ),
        ],
      },
    ],
  });
})();
