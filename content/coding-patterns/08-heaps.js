(function () {
  const { p, h, h3, ul, ol, note, ex, arr, ll, tree, state, code, impl, cx, table, rg } = K;

  K.section({
    id: 'heaps',
    title: 'Heaps',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Heaps',
        body: [
          p("A **heap** is a binary tree that keeps one simple promise: every parent is **≤ its children** (a *min-heap*) or **≥ its children** (a *max-heap*). That doesn't sort the whole tree, but it guarantees the **smallest (or largest) element is always at the root**, available in $O(1)$. Inserting and removing the root take $O(\\log n)$, because the tree is kept **complete** (filled level by level) and therefore has height about $\\log_2 n$."),
          K.row(
            tree([1, 3, 2, 7, 4, 5], { hl: [1], cap: 'min-heap' }),
            arr([1, 3, 2, 7, 4, 5], { cap: 'stored as an array', hl: [0] })
          ),
          p("Because the tree is complete, it's stored in a plain array: the children of index `i` are at `2i + 1` and `2i + 2`, and its parent is at `(i - 1) // 2`."),
          h('Core operations'),
          table(['Operation', 'How', 'Time'], [
            ['peek', 'read index 0', '$O(1)$'],
            ['push', 'append at the end, then **sift up**: swap with the parent while smaller', '$O(\\log n)$'],
            ['pop', 'move the last element to the root, then **sift down**: swap with the smaller child while larger', '$O(\\log n)$'],
            ['heapify', 'build a heap from an unsorted array in place', '$O(n)$'],
          ]),
          h('When should I think of a heap?'),
          ul(
            "You repeatedly need the **smallest or largest** item of a changing collection.",
            "**Top-k** questions: keep a heap of size `k` (a min-heap of the `k` largest seen so far).",
            "**Merging k sorted sources**: a heap holds the current head of each source.",
            "**Running medians** or balancing two halves of a stream.",
            "**Scheduling** by priority or by earliest deadline; Dijkstra's shortest paths."
          ),
          h('Language notes'),
          ul(
            "**Python**: `heapq` turns a list into a **min-heap** (`heappush`, `heappop`, `heapify`). For a max-heap, push negated values. Tuples compare element by element, which is handy for tie-breaking.",
            "**Java**: `PriorityQueue<T>` is a min-heap by default; pass a comparator such as `Collections.reverseOrder()` or `(a, b) -> b - a` for a max-heap.",
            "**JavaScript** has no built-in heap. The lessons in this section use the small `Heap` class below."
          ),
          code(`
            import heapq

            heap = []
            heapq.heappush(heap, 5)
            heapq.heappush(heap, 1)
            heapq.heappush(heap, 3)
            smallest = heap[0]            # 1
            heapq.heappop(heap)           # removes 1
            max_heap = [-x for x in [5, 1, 3]]
            heapq.heapify(max_heap)       # -max_heap[0] == 5
            `, `
            // A small binary heap. compare(a, b) < 0 means "a comes out first".
            class Heap {
              constructor(compare = (a, b) => a - b) {
                this.data = [];
                this.compare = compare;
              }
              size() { return this.data.length; }
              peek() { return this.data[0]; }
              push(x) {
                const d = this.data;
                d.push(x);
                let i = d.length - 1;
                while (i > 0) {
                  const parent = (i - 1) >> 1;
                  if (this.compare(d[i], d[parent]) >= 0) break;
                  [d[i], d[parent]] = [d[parent], d[i]];
                  i = parent;
                }
              }
              pop() {
                const d = this.data;
                const top = d[0];
                const last = d.pop();
                if (d.length) {
                  d[0] = last;
                  let i = 0;
                  while (true) {
                    const l = 2 * i + 1, r = l + 1;
                    let best = i;
                    if (l < d.length && this.compare(d[l], d[best]) < 0) best = l;
                    if (r < d.length && this.compare(d[r], d[best]) < 0) best = r;
                    if (best === i) break;
                    [d[i], d[best]] = [d[best], d[i]];
                    i = best;
                  }
                }
                return top;
              }
            }
            `, `
            PriorityQueue<Integer> minHeap = new PriorityQueue<>();
            PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
            minHeap.offer(5);
            minHeap.offer(1);
            minHeap.offer(3);
            int smallest = minHeap.peek(); // 1
            minHeap.poll();                // removes 1
            `),
          h('Real-world uses'),
          ul(
            "**Operating-system schedulers** and job queues that always run the highest-priority task next.",
            "**Network routing** (shortest-path algorithms) and **map navigation**.",
            "**Event-driven simulations** that process the earliest event first.",
            "**Leaderboards and monitoring**: \"top 10 slowest requests\" computed over a stream."
          ),
        ],
      },

      {
        id: 'k-most-frequent-strings',
        title: 'K Most Frequent Strings',
        body: [
          p("Given a list of strings and an integer `k`, return the **`k` most frequent strings**, ordered from most to least frequent. Break ties by **lexicographical (alphabetical) order**."),
          ex('strs = ["go", "java", "go", "rust", "java", "go", "c"], k = 2', '["go", "java"]', '"go" appears 3 times and "java" twice.'),
          ex('strs = ["b", "a", "c", "a", "b", "c"], k = 2', '["a", "b"]', 'all three appear twice, so alphabetical order decides.'),
          h('Intuition'),
          ol(
            "**Count** each string with a hash map: $O(n)$.",
            "Pick the `k` best entries, where \"best\" means higher frequency, and for equal frequency, alphabetically smaller."
          ),
          p("Sorting all distinct strings would cost $O(m \\log m)$. A heap lets us pull out just the top `k`."),
          h3('Option 1: max-heap, pop k times'),
          p("Heapify all `(frequency, string)` entries into a max-heap ordered by \"best first\" in $O(m)$, then pop `k` times: $O(m + k \\log m)$."),
          h3('Option 2: min-heap of size k'),
          p("Keep a heap of the `k` best entries seen so far, with the **worst** of them on top. For each new entry, push it, and if the heap grows beyond `k`, pop the worst. That costs $O(m \\log k)$ and only $O(k)$ heap space, which is better when `k` is much smaller than `m`. Remember to reverse at the end, because the heap pops from worst to best."),
          state('counts: go 3, java 2, rust 1, c 1\nmin-heap (worst on top), k = 2:\npush go → [go]; push java → [java, go]\npush rust → pop rust; push c → pop c\nresult (best first): go, java'),
          impl(`
            import heapq
            from collections import Counter
            from typing import List

            def k_most_frequent_strings(strs: List[str], k: int) -> List[str]:
                counts = Counter(strs)
                # Max-heap via negated counts; ties fall back to alphabetical order.
                heap = [(-freq, s) for s, freq in counts.items()]
                heapq.heapify(heap)
                return [heapq.heappop(heap)[1] for _ in range(min(k, len(heap)))]
            `, `
            // Uses the Heap class from "Introduction to Heaps".
            function kMostFrequentStrings(strs, k) {
              const counts = new Map();
              for (const s of strs) counts.set(s, (counts.get(s) || 0) + 1);
              // "worse" entries come out first: lower count, or same count and later alphabetically.
              const worseFirst = (a, b) => a[1] - b[1] || (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0);
              const heap = new Heap(worseFirst);
              for (const entry of counts) {
                heap.push(entry);
                if (heap.size() > k) heap.pop(); // drop the worst
              }
              const result = [];
              while (heap.size()) result.push(heap.pop()[0]);
              return result.reverse();             // best first
            }
            `, `
            public List<String> kMostFrequentStrings(String[] strs, int k) {
                Map<String, Integer> counts = new HashMap<>();
                for (String s : strs) counts.merge(s, 1, Integer::sum);
                // Min-heap where the "worst" entry is on top.
                PriorityQueue<String> heap = new PriorityQueue<>((a, b) -> {
                    int byCount = Integer.compare(counts.get(a), counts.get(b));
                    return byCount != 0 ? byCount : b.compareTo(a);
                });
                for (String s : counts.keySet()) {
                    heap.offer(s);
                    if (heap.size() > k) heap.poll(); // drop the worst
                }
                List<String> result = new ArrayList<>();
                while (!heap.isEmpty()) result.add(heap.poll());
                Collections.reverse(result);         // best first
                return result;
            }
            `),
          cx("$O(n + m \\log k)$ for the size-k heap (Python version: $O(n + m + k \\log m)$), where $n$ is the number of strings and $m$ the number of distinct strings.",
            "$O(m)$ for the counts, plus $O(k)$ (or $O(m)$) for the heap."),
        ],
      },

      {
        id: 'combine-sorted-linked-lists',
        title: 'Combine Sorted Linked Lists',
        body: [
          p("Given an array of `k` linked lists, each sorted in ascending order, **merge them into one sorted linked list** and return its head."),
          ex('lists = [1 → 6, 1 → 4 → 6, 3 → 7]', '1 → 1 → 3 → 4 → 6 → 6 → 7'),
          ex('lists = []', 'null'),
          h('Intuition'),
          p("Merging two sorted lists is easy: repeatedly take the smaller of the two heads. With `k` lists, the next node of the result is the **smallest of the `k` current heads**. Scanning all heads every time costs $O(k)$ per node. A **min-heap** of the current heads gives us the smallest in $O(\\log k)$."),
          ol(
            "Push the head of every non-empty list into a min-heap.",
            "Pop the smallest node, append it to the result, and push its `next` (if any) into the heap.",
            "Repeat until the heap is empty."
          ),
          ll([1, 6], { p: { h: 0 }, on: ['h'], cap: 'list 0' }),
          ll([1, 4, 6], { p: { h: 0 }, cap: 'list 1' }),
          ll([3, 7], { p: { h: 0 }, cap: 'list 2' }),
          state('heap: [1 (list 0), 1 (list 1), 3 (list 2)]\npop 1 (list 0) → append, push 6 (list 0)\nheap: [1, 3, 6] → pop 1 (list 1) → push 4 …'),
          note("In Python, `ListNode` objects can't be compared, so we push `(value, list_index, node)` tuples. The unique `list_index` breaks ties before Python ever tries to compare two nodes."),
          impl(`
            import heapq
            from typing import List

            # ListNode: val, next (see Introduction to Linked Lists)

            def combine_sorted_linked_lists(lists: List[ListNode]) -> ListNode:
                heap = [(head.val, i, head) for i, head in enumerate(lists) if head]
                heapq.heapify(heap)
                dummy = tail = ListNode(0)
                while heap:
                    val, i, node = heapq.heappop(heap)
                    tail.next = node
                    tail = node
                    if node.next:
                        heapq.heappush(heap, (node.next.val, i, node.next))
                return dummy.next
            `, `
            // Uses the Heap class from "Introduction to Heaps".
            function combineSortedLinkedLists(lists) {
              const heap = new Heap((a, b) => a.val - b.val);
              for (const head of lists) if (head) heap.push(head);
              const dummy = new ListNode(0);
              let tail = dummy;
              while (heap.size()) {
                const node = heap.pop();
                tail.next = node;
                tail = node;
                if (node.next) heap.push(node.next);
              }
              return dummy.next;
            }
            `, `
            public ListNode combineSortedLinkedLists(ListNode[] lists) {
                PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
                for (ListNode head : lists) if (head != null) heap.offer(head);
                ListNode dummy = new ListNode(0), tail = dummy;
                while (!heap.isEmpty()) {
                    ListNode node = heap.poll();
                    tail.next = node;
                    tail = node;
                    if (node.next != null) heap.offer(node.next);
                }
                return dummy.next;
            }
            `),
          cx("$O(n \\log k)$, where $n$ is the total number of nodes: each node is pushed and popped once, and the heap never holds more than $k$ nodes.",
            "$O(k)$ for the heap."),
        ],
      },

      {
        id: 'median-of-an-integer-stream',
        title: 'Median of an Integer Stream',
        body: [
          p("Design a structure that receives integers one at a time and can report the **median of everything seen so far** at any moment:"),
          ul(
            "`add(num)`: add an integer from the stream.",
            "`get_median()`: return the current median (the average of the two middle values when the count is even)."
          ),
          ex('add(3); add(1); get_median(); add(5); get_median(); add(4); get_median()', '2.0, 3.0, 3.5'),
          h('Intuition'),
          p("Keeping a sorted list makes `get_median` $O(1)$ but `add` $O(n)$. Notice we don't need full order: we only need the **middle**. Split the numbers into two halves:"),
          ul(
            "`low`: the **smaller half**, in a **max-heap** (so its largest value is on top).",
            "`high`: the **larger half**, in a **min-heap** (so its smallest value is on top)."
          ),
          p("If every value in `low` is ≤ every value in `high` and the sizes differ by at most one, the median sits on top of the heaps: the top of the bigger heap (odd count), or the average of both tops (even count)."),
          h3('Adding a number'),
          ol(
            "Push it into `low`, then move `low`'s largest into `high`. This keeps the \"low ≤ high\" order no matter where the number belongs.",
            "If `high` now has more elements than `low`, move `high`'s smallest back into `low`. So `low` always holds the extra element when the count is odd."
          ),
          state('add 3: low [3]         high []\nadd 1: low [1]         high [3]      median (1+3)/2 = 2.0\nadd 5: low [3, 1]      high [5]      median 3\nadd 4: low [3, 1]      high [4, 5]   median (3+4)/2 = 3.5'),
          impl(`
            import heapq

            class MedianOfAnIntegerStream:
                def __init__(self):
                    self.low = []   # max-heap (store negatives)
                    self.high = []  # min-heap

                def add(self, num: int) -> None:
                    heapq.heappush(self.low, -num)
                    heapq.heappush(self.high, -heapq.heappop(self.low))
                    if len(self.high) > len(self.low):
                        heapq.heappush(self.low, -heapq.heappop(self.high))

                def get_median(self) -> float:
                    if len(self.low) > len(self.high):
                        return float(-self.low[0])
                    return (-self.low[0] + self.high[0]) / 2
            `, `
            // Uses the Heap class from "Introduction to Heaps".
            class MedianOfAnIntegerStream {
              constructor() {
                this.low = new Heap((a, b) => b - a);  // max-heap
                this.high = new Heap((a, b) => a - b); // min-heap
              }

              add(num) {
                this.low.push(num);
                this.high.push(this.low.pop());
                if (this.high.size() > this.low.size()) this.low.push(this.high.pop());
              }

              getMedian() {
                if (this.low.size() > this.high.size()) return this.low.peek();
                return (this.low.peek() + this.high.peek()) / 2;
              }
            }
            `, `
            class MedianOfAnIntegerStream {
                private final PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder()); // max-heap
                private final PriorityQueue<Integer> high = new PriorityQueue<>();                          // min-heap

                public void add(int num) {
                    low.offer(num);
                    high.offer(low.poll());
                    if (high.size() > low.size()) low.offer(high.poll());
                }

                public double getMedian() {
                    if (low.size() > high.size()) return low.peek();
                    return ((long) low.peek() + high.peek()) / 2.0;
                }
            }
            `),
          cx("`add` is $O(\\log n)$ (a constant number of heap operations); `get_median` is $O(1)$.",
            "$O(n)$ for the two heaps."),
        ],
      },

      {
        id: 'sort-a-k-sorted-array',
        title: 'Sort a K-Sorted Array',
        body: [
          p("An array is **k-sorted** if every element is **at most `k` positions away** from where it would be in sorted order. Given a k-sorted array and `k`, sort it more efficiently than a general-purpose sort."),
          ex('nums = [5, 1, 9, 4, 7, 10], k = 2', '[1, 4, 5, 7, 9, 10]'),
          h('Intuition'),
          p("The smallest element of the whole array must belong at index 0, and since it can be at most `k` positions away, it lies somewhere in `nums[0..k]`. So the smallest of the first `k + 1` elements is the first sorted value. After placing it, the same argument applies to the next position, using the next window of `k + 1` candidates."),
          p("A **min-heap of size `k + 1`** maintains exactly those candidates. Slide through the array: push the next element, pop the minimum into the next output position."),
          arr([5, 1, 9, 4, 7, 10], { hl: rg(0, 2), state: 'heap of first k + 1 = 3: {5, 1, 9}\npop 1 → position 0; push 4' }),
          arr([5, 1, 9, 4, 7, 10], { hl: [0, 2, 3], dim: [1], state: 'heap {5, 9, 4}\npop 4 → position 1; push 7' }),
          note("We can write the output into the same array: the write position always trails the read position by `k + 1`, so we never overwrite an element that hasn't been pushed yet."),
          impl(`
            import heapq
            from typing import List

            def sort_k_sorted_array(nums: List[int], k: int) -> List[int]:
                heap = nums[:k + 1]
                heapq.heapify(heap)
                write = 0
                for read in range(k + 1, len(nums)):
                    nums[write] = heapq.heappop(heap)
                    write += 1
                    heapq.heappush(heap, nums[read])
                while heap:
                    nums[write] = heapq.heappop(heap)
                    write += 1
                return nums
            `, `
            // Uses the Heap class from "Introduction to Heaps".
            function sortKSortedArray(nums, k) {
              const heap = new Heap((a, b) => a - b);
              let write = 0;
              for (let read = 0; read < nums.length; read++) {
                heap.push(nums[read]);
                if (heap.size() > k) nums[write++] = heap.pop();
              }
              while (heap.size()) nums[write++] = heap.pop();
              return nums;
            }
            `, `
            public int[] sortKSortedArray(int[] nums, int k) {
                PriorityQueue<Integer> heap = new PriorityQueue<>();
                int write = 0;
                for (int read = 0; read < nums.length; read++) {
                    heap.offer(nums[read]);
                    if (heap.size() > k) nums[write++] = heap.poll();
                }
                while (!heap.isEmpty()) nums[write++] = heap.poll();
                return nums;
            }
            `),
          cx("$O(n \\log k)$. Every element is pushed and popped once on a heap of size at most $k + 1$.",
            "$O(k)$ for the heap."),
        ],
      },
    ],
  });
})();
