(function () {
  const { p, h, h3, ul, ol, note, ex, arr, ll, tree, state, code, impl, cx, table, rg, ap, cost, vs, tests, tips } = K;

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
          p("Every approach starts the same way: **count** each string with a hash map in $O(n)$. Let $m$ be the number of distinct strings. The approaches differ in how they pick the `k` best entries, where \"best\" means a higher count and, for equal counts, the alphabetically smaller string."),

          ap(1, 'Count, then sort every distinct string'),
          p("Sort the distinct strings by count (descending), then alphabetically, and take the first `k`."),
          code(`
            from collections import Counter
            from typing import List

            def k_most_frequent_strings_sort(strs: List[str], k: int) -> List[str]:
                counts = Counter(strs)
                ordered = sorted(counts, key=lambda s: (-counts[s], s))
                return ordered[:k]
            `, `
            function kMostFrequentStringsSort(strs, k) {
              const counts = new Map();
              for (const s of strs) counts.set(s, (counts.get(s) || 0) + 1);
              const ordered = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a) || (a < b ? -1 : a > b ? 1 : 0));
              return ordered.slice(0, k);
            }
            `, `
            public List<String> kMostFrequentStringsSort(String[] strs, int k) {
                Map<String, Integer> counts = new HashMap<>();
                for (String s : strs) counts.merge(s, 1, Integer::sum);
                List<String> ordered = new ArrayList<>(counts.keySet());
                ordered.sort((a, b) -> counts.get(a).equals(counts.get(b)) ? a.compareTo(b) : counts.get(b) - counts.get(a));
                return ordered.subList(0, Math.min(k, ordered.size()));
            }
            `),
          cost("$O(n + m log m)$.", "$O(m)$."),
          p("Sorting orders **all** $m$ strings, but we only need the top `k`. A heap can hand them out without ordering the rest."),

          ap(2, 'Max-heap: heapify everything, pop k times'),
          p("Put every `(count, string)` entry into a heap that keeps the **best** entry on top. Building a heap from $m$ entries takes $O(m)$, and each of the `k` pops costs $O(log m)$."),
          code(`
            import heapq
            from collections import Counter
            from typing import List

            def k_most_frequent_strings_max_heap(strs: List[str], k: int) -> List[str]:
                counts = Counter(strs)
                # Negated counts turn Python's min-heap into a max-heap;
                # equal counts fall back to alphabetical order.
                heap = [(-freq, s) for s, freq in counts.items()]
                heapq.heapify(heap)
                return [heapq.heappop(heap)[1] for _ in range(min(k, len(heap)))]
            `, `
            // Uses the Heap class from "Introduction to Heaps".
            function kMostFrequentStringsMaxHeap(strs, k) {
              const counts = new Map();
              for (const s of strs) counts.set(s, (counts.get(s) || 0) + 1);
              // Best entry first: higher count, then alphabetically smaller.
              const heap = new Heap((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
              for (const entry of counts) heap.push(entry);
              const result = [];
              while (result.length < k && heap.size()) result.push(heap.pop()[0]);
              return result;
            }
            `, `
            public List<String> kMostFrequentStringsMaxHeap(String[] strs, int k) {
                Map<String, Integer> counts = new HashMap<>();
                for (String s : strs) counts.merge(s, 1, Integer::sum);
                // Best entry first: higher count, then alphabetically smaller.
                PriorityQueue<String> heap = new PriorityQueue<>((a, b) ->
                    counts.get(a).equals(counts.get(b)) ? a.compareTo(b) : counts.get(b) - counts.get(a));
                heap.addAll(counts.keySet());
                List<String> result = new ArrayList<>();
                while (result.size() < k && !heap.isEmpty()) result.add(heap.poll());
                return result;
            }
            `),
          cost("$O(n + m + k log m)$.", "$O(m)$ for the heap."),
          p("This still keeps **all** $m$ entries in memory. When `k` is much smaller than $m$ (say, the top 10 of a million distinct search terms), we can do better."),

          ap(3, 'Min-heap of size k (optimal for small k)'),
          p("Keep a heap of only the `k` best entries seen so far, with the **worst** of them on top. For each new entry, push it, and if the heap now holds `k + 1` entries, pop the worst. Whatever survives is the top `k`. The heap pops from worst to best, so reverse at the end."),
          p("\"Worst\" is the exact opposite of \"best\": a **lower** count, or, for equal counts, the alphabetically **larger** string. Python's `heapq` has no comparator argument, so we wrap entries in a tiny class whose `<` means *worse than*."),
          state('counts: go 3, java 2, rust 1, c 1\nmin-heap (worst on top), k = 2:\npush go → [go]; push java → [java, go]\npush rust → pop rust; push c → pop c\nresult (best first): go, java'),
          impl(`
            import heapq
            from collections import Counter
            from typing import List

            class Entry:
                def __init__(self, s: str, freq: int):
                    self.s, self.freq = s, freq

                def __lt__(self, other: 'Entry') -> bool:
                    # "Less than" means "worse": lower count, or same count and later alphabetically.
                    if self.freq != other.freq:
                        return self.freq < other.freq
                    return self.s > other.s

            def k_most_frequent_strings(strs: List[str], k: int) -> List[str]:
                counts = Counter(strs)
                heap = []  # the k best so far, worst on top
                for s, freq in counts.items():
                    heapq.heappush(heap, Entry(s, freq))
                    if len(heap) > k:
                        heapq.heappop(heap)  # drop the worst
                result = [heapq.heappop(heap).s for _ in range(len(heap))]
                return result[::-1]  # best first
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
          cx("$O(n + m log k)$, where $n$ is the number of strings and $m$ the number of distinct strings: counting is linear, and each distinct string costs one push (and maybe one pop) on a heap of size at most $k + 1$.",
            "$O(m)$ for the counts plus $O(k)$ for the heap."),
          vs([
            ['1. Count + sort', '$O(n + m log m)$', '$O(m)$', 'Simplest; fine when $m$ is small.'],
            ['2. Count + max-heap, pop k', '$O(n + m + k log m)$', '$O(m)$', 'When `k` is close to $m$.'],
            ['3. Count + min-heap of size k', '$O(n + m log k)$', '$O(m + k)$', 'When `k` is much smaller than $m$; also works on a stream of counts.'],
          ]),
          tests([
            ['strs = [], k = 0', '[]', 'Empty input.'],
            ['strs = ["a"], k = 1', '["a"]', 'A single string.'],
            ['strs = ["a", "a"], k = 3', '["a"]', '`k` larger than the number of distinct strings.'],
            ['strs = ["x", "y", "x"], k = 1', '["x"]', 'Only the most frequent string.'],
            ['strs = ["d", "c", "b", "a"], k = 4', '["a", "b", "c", "d"]', 'All counts tie: pure alphabetical order.'],
            ['strs = ["kiwi", "fig", "kiwi", "fig", "apple"], k = 3', '["fig", "kiwi", "apple"]', 'A tie at the top, then a lower count.'],
            ['strs = ["b", "a", "c", "a", "b", "c"], k = 2', '["a", "b"]', 'Example 2.'],
            ['strs = ["go", "java", "go", "rust", "java", "go", "c"], k = 2', '["go", "java"]', 'Example 1.'],
          ], { fn: ['k_most_frequent_strings_sort', 'k_most_frequent_strings_max_heap', 'k_most_frequent_strings'] }),
          tips(
            "Write the comparison down in words before coding: *better = more frequent, then alphabetically smaller*. The min-heap needs the exact opposite, and flipping only one of the two rules is the classic bug.",
            "Bucket sort is another linear-time option: put each string in a bucket indexed by its count (counts are at most $n$), then read buckets from high to low, sorting within each bucket for the tie rule."
          ),
        ],
      },

      {
        id: 'combine-sorted-linked-lists',
        title: 'Combine Sorted Linked Lists',
        body: [
          p("Given an array of `k` linked lists, each sorted in ascending order, **merge them into one sorted linked list** and return its head."),
          ex('lists = [1 → 6, 1 → 4 → 6, 3 → 7]', '1 → 1 → 3 → 4 → 6 → 6 → 7'),
          ex('lists = []', 'null'),
          ap(1, 'Collect every value, sort, rebuild'),
          p("Ignore the fact that the lists are sorted: copy all values into an array, sort it, and build a new list."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)
            from typing import List

            def combine_sorted_linked_lists_sort(lists: List[ListNode]) -> ListNode:
                values = []
                for head in lists:
                    while head:
                        values.append(head.val)
                        head = head.next
                dummy = tail = ListNode(0)
                for v in sorted(values):
                    tail.next = ListNode(v)
                    tail = tail.next
                return dummy.next
            `, `
            function combineSortedLinkedListsSort(lists) {
              const values = [];
              for (let head of lists) for (; head; head = head.next) values.push(head.val);
              values.sort((a, b) => a - b);
              const dummy = new ListNode(0);
              let tail = dummy;
              for (const v of values) tail = tail.next = new ListNode(v);
              return dummy.next;
            }
            `, `
            public ListNode combineSortedLinkedListsSort(ListNode[] lists) {
                List<Integer> values = new ArrayList<>();
                for (ListNode head : lists) for (ListNode n = head; n != null; n = n.next) values.add(n.val);
                Collections.sort(values);
                ListNode dummy = new ListNode(0), tail = dummy;
                for (int v : values) tail = tail.next = new ListNode(v);
                return dummy.next;
            }
            `),
          cost("$O(n log n)$ for $n$ nodes in total.", "$O(n)$ for the values and the new nodes."),
          ap(2, 'Merge the lists one at a time'),
          p("Merging **two** sorted lists is easy: repeatedly take the smaller head. So fold the lists together: merge list 0 with list 1, merge the result with list 2, and so on. The catch is that the growing result is walked again in every merge."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)
            from typing import List

            def combine_sorted_linked_lists_one_by_one(lists: List[ListNode]) -> ListNode:
                result = None
                for head in lists:
                    result = merge_two(result, head)
                return result

            def merge_two(a: ListNode, b: ListNode) -> ListNode:
                dummy = tail = ListNode(0)
                while a and b:
                    if a.val <= b.val:
                        tail.next, a = a, a.next
                    else:
                        tail.next, b = b, b.next
                    tail = tail.next
                tail.next = a or b  # attach whatever is left
                return dummy.next
            `, `
            function combineSortedLinkedListsOneByOne(lists) {
              let result = null;
              for (const head of lists) result = mergeTwo(result, head);
              return result;
            }

            function mergeTwo(a, b) {
              const dummy = new ListNode(0);
              let tail = dummy;
              while (a && b) {
                if (a.val <= b.val) { tail.next = a; a = a.next; }
                else { tail.next = b; b = b.next; }
                tail = tail.next;
              }
              tail.next = a || b; // attach whatever is left
              return dummy.next;
            }
            `, `
            public ListNode combineSortedLinkedListsOneByOne(ListNode[] lists) {
                ListNode result = null;
                for (ListNode head : lists) result = mergeTwo(result, head);
                return result;
            }

            private ListNode mergeTwo(ListNode a, ListNode b) {
                ListNode dummy = new ListNode(0), tail = dummy;
                while (a != null && b != null) {
                    if (a.val <= b.val) { tail.next = a; a = a.next; }
                    else { tail.next = b; b = b.next; }
                    tail = tail.next;
                }
                tail.next = (a != null) ? a : b; // attach whatever is left
                return dummy.next;
            }
            `),
          cost("$O(n · k)$: the merged result grows by about $n/k$ nodes per merge and is walked again each time.", "$O(1)$: nodes are relinked, not copied."),
          ap(3, 'Divide and conquer: merge in pairs'),
          p("Merge the lists **in pairs** instead: 0 with 1, 2 with 3, and so on, then merge the results in pairs again, like the levels of merge sort. Each round walks every node once, and there are only $log k$ rounds."),
          code(`
            # ListNode: val, next (see Introduction to Linked Lists)
            from typing import List

            def combine_sorted_linked_lists_divide_and_conquer(lists: List[ListNode]) -> ListNode:
                if not lists:
                    return None
                lists = list(lists)
                while len(lists) > 1:
                    merged = []
                    for i in range(0, len(lists), 2):
                        b = lists[i + 1] if i + 1 < len(lists) else None
                        merged.append(merge_two(lists[i], b))
                    lists = merged
                return lists[0]

            def merge_two(a: ListNode, b: ListNode) -> ListNode:
                dummy = tail = ListNode(0)
                while a and b:
                    if a.val <= b.val:
                        tail.next, a = a, a.next
                    else:
                        tail.next, b = b, b.next
                    tail = tail.next
                tail.next = a or b
                return dummy.next
            `, `
            function combineSortedLinkedListsDivideAndConquer(lists) {
              if (!lists.length) return null;
              let level = [...lists];
              while (level.length > 1) {
                const merged = [];
                for (let i = 0; i < level.length; i += 2) merged.push(mergeTwo(level[i], level[i + 1] || null));
                level = merged;
              }
              return level[0];
            }

            function mergeTwo(a, b) {
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
            public ListNode combineSortedLinkedListsDivideAndConquer(ListNode[] lists) {
                if (lists.length == 0) return null;
                List<ListNode> level = new ArrayList<>(Arrays.asList(lists));
                while (level.size() > 1) {
                    List<ListNode> merged = new ArrayList<>();
                    for (int i = 0; i < level.size(); i += 2) {
                        merged.add(mergeTwo(level.get(i), i + 1 < level.size() ? level.get(i + 1) : null));
                    }
                    level = merged;
                }
                return level.get(0);
            }

            private ListNode mergeTwo(ListNode a, ListNode b) {
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
          cost("$O(n log k)$: $log k$ rounds, each touching every node once.", "$O(k)$ for the list of heads ($O(1)$ extra if done in place)."),
          ap(4, 'Min-heap of the current heads (optimal)'),
          p("Another way to reach $O(n log k)$ looks at all lists at once. With `k` lists, the next node of the result is the **smallest of the `k` current heads**. Scanning all heads every time costs $O(k)$ per node. A **min-heap** of the current heads gives us the smallest in $O(\\log k)$."),
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
          vs([
            ['1. Collect, sort, rebuild', '$O(n log n)$', '$O(n)$', 'Quick to write; throws away the sortedness.'],
            ['2. Merge one at a time', '$O(n · k)$', '$O(1)$', 'Fine for two or three lists.'],
            ['3. Divide and conquer', '$O(n log k)$', '$O(k)$', 'Optimal without a heap.'],
            ['4. Min-heap of heads', '$O(n log k)$', '$O(k)$', 'Optimal; also works when the lists are streams.'],
          ]),
          tests([
            ['lists = []', '[]', 'No lists at all.'],
            ['lists = [[]]', '[]', 'One empty list.'],
            ['lists = [[], [2], []]', '[2]', 'Empty lists mixed in.'],
            ['lists = [[1, 2, 3]]', '[1, 2, 3]', 'A single list is returned as is.'],
            ['lists = [[5], [1], [3]]', '[1, 3, 5]', 'Single-node lists.'],
            ['lists = [[1, 1], [1]]', '[1, 1, 1]', 'Equal values across lists.'],
            ['lists = [[-3, 0, 7], [-5, 10]]', '[-5, -3, 0, 7, 10]', 'Negative values.'],
            ['lists = [[1, 6], [1, 4, 6], [3, 7]]', '[1, 1, 3, 4, 6, 6, 7]', 'Example 1.'],
          ], {
            fn: ['combine_sorted_linked_lists_sort', 'combine_sorted_linked_lists_one_by_one', 'combine_sorted_linked_lists_divide_and_conquer', 'combine_sorted_linked_lists'],
            conv: { lists: 'lambda ls: [_build(x) for x in ls]' }, jsconv: { lists: 'ls => ls.map(build)' }, out: 'list',
          }),
          note("Each inner array is one sorted linked list, and the expected output is the merged list written as an array."),
          tips(
            "Mention both optimal approaches. Interviewers who forbid a heap usually want divide and conquer.",
            "The heap only ever holds one node per list, so it uses $O(k)$ memory however long the lists are."
          ),
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
          ap(1, 'Store everything, sort on every query'),
          p("Append each number to a list, and sort the list whenever the median is requested."),
          code(`
            class MedianStreamSortOnQuery:
                def __init__(self):
                    self.values = []

                def add(self, num: int) -> None:
                    self.values.append(num)  # O(1)

                def get_median(self) -> float:
                    s = sorted(self.values)  # O(n log n) on every query
                    n, mid = len(s), len(s) // 2
                    return float(s[mid]) if n % 2 else (s[mid - 1] + s[mid]) / 2
            `, `
            class MedianStreamSortOnQuery {
              constructor() {
                this.values = [];
              }

              add(num) {
                this.values.push(num); // O(1)
              }

              getMedian() {
                const s = [...this.values].sort((a, b) => a - b); // O(n log n) per query
                const n = s.length, mid = n >> 1;
                return n % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
              }
            }
            `, `
            class MedianStreamSortOnQuery {
                private final List<Integer> values = new ArrayList<>();

                public void add(int num) { values.add(num); } // O(1)

                public double getMedian() {
                    List<Integer> s = new ArrayList<>(values);
                    Collections.sort(s); // O(n log n) per query
                    int n = s.size(), mid = n / 2;
                    return n % 2 == 1 ? s.get(mid) : (s.get(mid - 1) + (double) s.get(mid)) / 2;
                }
            }
            `),
          cost("`add` $O(1)$; `get_median` $O(n log n)$.", "$O(n)$."),
          ap(2, 'Keep the list sorted on insert'),
          p("Insert each number at its sorted position instead (binary search finds the position). Then the median is just the middle element. Finding the position is fast, but **shifting** the later elements to make room is still linear."),
          code(`
            import bisect

            class MedianStreamSortedInsert:
                def __init__(self):
                    self.values = []  # always sorted

                def add(self, num: int) -> None:
                    bisect.insort(self.values, num)  # O(log n) search + O(n) shift

                def get_median(self) -> float:
                    n, mid = len(self.values), len(self.values) // 2
                    if n % 2:
                        return float(self.values[mid])
                    return (self.values[mid - 1] + self.values[mid]) / 2
            `, `
            class MedianStreamSortedInsert {
              constructor() {
                this.values = []; // always sorted
              }

              add(num) {
                let lo = 0, hi = this.values.length; // first index with a larger value
                while (lo < hi) {
                  const mid = (lo + hi) >> 1;
                  if (this.values[mid] <= num) lo = mid + 1;
                  else hi = mid;
                }
                this.values.splice(lo, 0, num); // shifting is O(n)
              }

              getMedian() {
                const n = this.values.length, mid = n >> 1;
                return n % 2 ? this.values[mid] : (this.values[mid - 1] + this.values[mid]) / 2;
              }
            }
            `, `
            class MedianStreamSortedInsert {
                private final List<Integer> values = new ArrayList<>(); // always sorted

                public void add(int num) {
                    int i = Collections.binarySearch(values, num);
                    values.add(i >= 0 ? i : -i - 1, num); // shifting is O(n)
                }

                public double getMedian() {
                    int n = values.size(), mid = n / 2;
                    return n % 2 == 1 ? values.get(mid) : (values.get(mid - 1) + (double) values.get(mid)) / 2;
                }
            }
            `),
          cost("`add` $O(n)$; `get_median` $O(1)$.", "$O(n)$."),
          ap(3, 'Two heaps (optimal)'),
          p("Notice we don't need full order: we only need the **middle**. Split the numbers into two halves:"),
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
          vs([
            ['1. Sort on every query', '$O(1)$ add, $O(n log n)$ median', '$O(n)$', 'Many adds and very few queries.'],
            ['2. Sorted insert', '$O(n)$ add, $O(1)$ median', '$O(n)$', 'Small streams.'],
            ['3. Two heaps', '$O(log n)$ add, $O(1)$ median', '$O(n)$', 'The expected answer.'],
          ]),
          tests([
            ['MedianOfAnIntegerStream(); add(7); get_median()', '[7.0]', 'One number.'],
            ['MedianOfAnIntegerStream(); add(1); add(2); get_median()', '[1.5]', 'Even count: average of the two middles.'],
            ['MedianOfAnIntegerStream(); add(5); add(5); add(5); get_median()', '[5.0]', 'Repeated values.'],
            ['MedianOfAnIntegerStream(); add(-1); add(-2); add(-3); get_median(); add(-4); get_median()', '[-2.0, -2.5]', 'Negative numbers, arriving in decreasing order.'],
            ['MedianOfAnIntegerStream(); add(10); add(1); add(9); add(2); add(8); get_median()', '[8.0]', 'Values alternate between the two extremes.'],
            ['MedianOfAnIntegerStream(); add(3); add(1); get_median(); add(5); get_median(); add(4); get_median()', '[2.0, 3.0, 3.5]', 'Example 1.'],
          ], { ops: ['MedianStreamSortOnQuery', 'MedianStreamSortedInsert', 'MedianOfAnIntegerStream'] }),
          note("Each test is a sequence of calls on a new object; the expected output lists the values returned by `get_median`."),
          tips(
            "State the two invariants: every value in `low` is ≤ every value in `high`, and `len(low)` is `len(high)` or one more. Every line of `add` exists to restore one of them.",
            "Follow-up: if all numbers lie in a small range (say 0-100), keep a count per value and walk the counts to find the median in $O(100)$."
          ),
        ],
      },

      {
        id: 'sort-a-k-sorted-array',
        title: 'Sort a K-Sorted Array',
        body: [
          p("An array is **k-sorted** if every element is **at most `k` positions away** from where it would be in sorted order. Given a k-sorted array and `k`, sort it more efficiently than a general-purpose sort."),
          ex('nums = [5, 1, 9, 4, 7, 10], k = 2', '[1, 4, 5, 7, 9, 10]'),
          ap(1, 'Ignore k and sort'),
          p("Any general-purpose sort works, but it can't take advantage of the fact that elements are already close to their final positions."),
          code(`
            from typing import List

            def sort_k_sorted_array_builtin(nums: List[int], k: int) -> List[int]:
                nums.sort()  # ignores k
                return nums
            `, `
            function sortKSortedArrayBuiltin(nums, k) {
              return nums.sort((a, b) => a - b); // ignores k
            }
            `, `
            public int[] sortKSortedArrayBuiltin(int[] nums, int k) {
                Arrays.sort(nums); // ignores k
                return nums;
            }
            `),
          cost("$O(n log n)$.", "$O(log n)$ to $O(n)$, depending on the sort."),
          ap(2, 'Insertion sort'),
          p("Insertion sort moves each element left past the larger elements before it. In a k-sorted array, no element has more than `k` larger elements before it, so each insertion takes at most `k` steps."),
          code(`
            from typing import List

            def sort_k_sorted_array_insertion(nums: List[int], k: int) -> List[int]:
                for i in range(1, len(nums)):
                    x, j = nums[i], i - 1
                    while j >= 0 and nums[j] > x:  # at most k steps here
                        nums[j + 1] = nums[j]
                        j -= 1
                    nums[j + 1] = x
                return nums
            `, `
            function sortKSortedArrayInsertion(nums, k) {
              for (let i = 1; i < nums.length; i++) {
                const x = nums[i];
                let j = i - 1;
                while (j >= 0 && nums[j] > x) { nums[j + 1] = nums[j]; j--; } // at most k steps
                nums[j + 1] = x;
              }
              return nums;
            }
            `, `
            public int[] sortKSortedArrayInsertion(int[] nums, int k) {
                for (int i = 1; i < nums.length; i++) {
                    int x = nums[i], j = i - 1;
                    while (j >= 0 && nums[j] > x) { nums[j + 1] = nums[j]; j--; } // at most k steps
                    nums[j + 1] = x;
                }
                return nums;
            }
            `),
          cost("$O(n · k)$.", "$O(1)$."),
          p("That's great for tiny `k`, but for larger `k` we want each placement to cost $O(log k)$ instead of $O(k)$."),
          ap(3, 'Min-heap of size k + 1 (optimal)'),
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
          vs([
            ['1. General-purpose sort', '$O(n log n)$', '$O(log n)$ to $O(n)$', 'When `k` is close to `n`.'],
            ['2. Insertion sort', '$O(n · k)$', '$O(1)$', 'Very small `k` (it beats heaps for, say, `k ≤ 8`).'],
            ['3. Min-heap of size k + 1', '$O(n log k)$', '$O(k)$', 'The expected answer.'],
          ]),
          tests([
            ['nums = [], k = 0', '[]', 'Empty array.'],
            ['nums = [1], k = 0', '[1]', 'Single element.'],
            ['nums = [1, 2, 3], k = 0', '[1, 2, 3]', '`k = 0`: already sorted.'],
            ['nums = [2, 1, 4, 3], k = 1', '[1, 2, 3, 4]', 'Every element is one step off.'],
            ['nums = [3, 3, 1, 1], k = 2', '[1, 1, 3, 3]', 'Duplicate values.'],
            ['nums = [4, 3, 2, 1], k = 3', '[1, 2, 3, 4]', '`k = n - 1`: fully reversed.'],
            ['nums = [6, 5, 3, 2, 8, 10, 9], k = 3', '[2, 3, 5, 6, 8, 9, 10]', 'A longer 3-sorted array.'],
            ['nums = [5, 1, 9, 4, 7, 10], k = 2', '[1, 4, 5, 7, 9, 10]', 'Example 1.'],
          ], { fn: ['sort_k_sorted_array_builtin', 'sort_k_sorted_array_insertion', 'sort_k_sorted_array'] }),
          tips(
            "Name the property that makes the heap work: the next smallest element is always within the next `k + 1` unread elements.",
            "Real-world fit: merging timestamps that arrive slightly out of order (network packets, log lines) is exactly a k-sorted stream."
          ),
        ],
      },
    ],
  });
})();
