(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, state, code, impl, cx, table } = K;

  K.section({
    id: 'hash-maps-and-sets',
    title: 'Hash Maps and Sets',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Hash Maps and Sets',
        body: [
          p("A **hash map** stores key → value pairs and a **hash set** stores unique keys. Both use a *hash function* to turn a key into a bucket position, so inserting, deleting and looking up a key take **$O(1)$ time on average**. That single property, \"have I seen this before, and what did I record about it?\" in constant time, turns many quadratic searches into linear ones."),
          h('How hashing works'),
          p("The hash function maps a key to an integer, and that integer (modulo the table size) chooses a bucket. Two keys can land in the same bucket (a **collision**); implementations resolve it by chaining entries in a small list or by probing for the next free slot. When the table gets too full it is resized, which is why the $O(1)$ cost is *amortised*."),
          table(['Operation', 'Average', 'Worst case'], [
            ['insert / put', '$O(1)$', '$O(n)$'],
            ['lookup / contains', '$O(1)$', '$O(n)$'],
            ['delete / remove', '$O(1)$', '$O(n)$'],
          ]),
          h('Map or set?'),
          ul(
            "Use a **set** when you only need to remember *that* something exists: duplicates, membership, visited markers.",
            "Use a **map** when you need to remember something *about* a key: a count, an index, the last time it was seen, a grouping."
          ),
          h('When should I think of hashing?'),
          ul(
            "A brute-force solution has an inner loop that **searches** for a value. Replace the search with an $O(1)$ lookup.",
            "You need **frequency counts** (anagrams, majority element, top-k).",
            "You need to **group** items by some signature (same letters, same row, same slope).",
            "You need to detect **duplicates** or **cycles** in a sequence of states."
          ),
          h('Real-world uses'),
          ul(
            "**Caches** such as an in-memory key/value store or a browser cache are hash maps underneath.",
            "**Database indexes** (hash indexes) and **symbol tables** in compilers.",
            "**De-duplication**: removing repeated rows, detecting repeated uploads by content hash.",
            "**Counting**: word frequencies, page-view counters, rate limiters keyed by user ID."
          ),
          h('Template'),
          code(`
            def count_frequencies(items):
                counts = {}
                for x in items:
                    counts[x] = counts.get(x, 0) + 1
                return counts
            `, `
            function countFrequencies(items) {
              const counts = new Map();
              for (const x of items) counts.set(x, (counts.get(x) || 0) + 1);
              return counts;
            }
            `, `
            Map<Integer, Integer> countFrequencies(int[] items) {
                Map<Integer, Integer> counts = new HashMap<>();
                for (int x : items) counts.merge(x, 1, Integer::sum);
                return counts;
            }
            `),
        ],
      },

      {
        id: 'pair-sum-unsorted',
        title: 'Pair Sum - Unsorted',
        body: [
          p("Given an array of integers that is **not sorted**, return the **indexes of two different elements** that **sum to a target**. Return them in any order, or an empty array if there is no such pair."),
          ex('nums = [5, -2, 9, 1], target = 6', '[0, 3]', "`nums[0] + nums[3] = 5 + 1 = 6`"),
          ex('nums = [3, 3], target = 6', '[0, 1]'),
          h('Intuition'),
          p("We could sort and reuse the two-pointer solution, but sorting shuffles the indexes we're supposed to return, and costs $O(n \\log n)$. Let's find a linear solution."),
          p("For each number `x`, the partner we need is its **complement** `target - x`. The brute-force inner loop searches the array for that complement. A hash map can answer \"have I already seen the complement, and at which index?\" in $O(1)$."),
          p("We scan left to right. Before storing the current number, we check whether its complement is already in the map:"),
          arr([5, -2, 9, 1], { p: { i: 0 }, on: ['i'], state: 'complement = 6 - 5 = 1  →  not seen\nseen = {5: 0}' }),
          arr([5, -2, 9, 1], { p: { i: 1 }, on: ['i'], state: 'complement = 6 - (-2) = 8  →  not seen\nseen = {5: 0, -2: 1}' }),
          arr([5, -2, 9, 1], { p: { i: 2 }, on: ['i'], state: 'complement = 6 - 9 = -3  →  not seen\nseen = {5: 0, -2: 1, 9: 2}' }),
          arr([5, -2, 9, 1], { p: { i: 3 }, on: ['i'], hl: [0, 3], state: 'complement = 6 - 1 = 5  →  seen at index 0\nreturn [0, 3]' }),
          p("Checking the map **before** inserting the current number guarantees we never pair an element with itself. For `nums = [3, 3]`, the first 3 isn't matched (the map is empty), and the second 3 finds the first one."),
          impl(`
            from typing import List

            def pair_sum_unsorted(nums: List[int], target: int) -> List[int]:
                seen = {}  # value -> index
                for i, x in enumerate(nums):
                    complement = target - x
                    if complement in seen:
                        return [seen[complement], i]
                    seen[x] = i
                return []
            `, `
            function pairSumUnsorted(nums, target) {
              const seen = new Map(); // value -> index
              for (let i = 0; i < nums.length; i++) {
                const complement = target - nums[i];
                if (seen.has(complement)) return [seen.get(complement), i];
                seen.set(nums[i], i);
              }
              return [];
            }
            `, `
            public int[] pairSumUnsorted(int[] nums, int target) {
                Map<Integer, Integer> seen = new HashMap<>(); // value -> index
                for (int i = 0; i < nums.length; i++) {
                    int complement = target - nums[i];
                    if (seen.containsKey(complement)) {
                        return new int[]{seen.get(complement), i};
                    }
                    seen.put(nums[i], i);
                }
                return new int[0];
            }
            `),
          cx("$O(n)$. One pass, with $O(1)$ average-time map operations.",
            "$O(n)$ for the map, which can hold up to $n$ entries."),
        ],
      },

      {
        id: 'verify-sudoku-board',
        title: 'Verify Sudoku Board',
        body: [
          p("You are given a partially filled **9 × 9 Sudoku board**, where empty cells are `0`. Decide whether the filled cells follow the Sudoku rules: each digit 1-9 may appear **at most once in every row**, **every column**, and **every 3 × 3 sub-box**. You don't need to check whether the puzzle is solvable."),
          ex('board = (the grid below)', 'False', "the digit 9 appears twice in column 8 (highlighted)."),
          grid([
            [5, 3, 0, 0, 7, 0, 0, 0, 9],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9],
          ].map(r => r.map(v => v || '')), { hl: [[0, 8], [8, 8]], hl2: [[1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8]], cols: [0, 1, 2, 3, 4, 5, 6, 7, 8], rowsLabels: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
          p("Every row and every 3 × 3 box of this board is fine; only column 8 breaks the rules. Spotting that by eye is slow, so we want an algorithm that checks all 27 groups systematically."),
          h('Intuition'),
          p("Each rule is a duplicate check on a group of 9 cells, and **duplicate detection is exactly what hash sets are for**. We keep one set per row, one per column and one per sub-box (27 sets in total) and make a single pass over the board."),
          p("For cell `(r, c)` holding digit `d`:"),
          ul(
            "If `d` is already in `rows[r]`, `cols[c]` or `boxes[r // 3][c // 3]`, the board is invalid.",
            "Otherwise add `d` to all three sets and continue."
          ),
          h3('Which box is a cell in?'),
          p("Integer-dividing the row and column by 3 maps every cell to a box coordinate from `(0, 0)` to `(2, 2)`:"),
          grid([
            ['0,0', '0,0', '0,0', '0,1', '0,1', '0,1', '0,2', '0,2', '0,2'],
            ['0,0', '0,0', '0,0', '0,1', '0,1', '0,1', '0,2', '0,2', '0,2'],
            ['0,0', '0,0', '0,0', '0,1', '0,1', '0,1', '0,2', '0,2', '0,2'],
            ['1,0', '1,0', '1,0', '1,1', '1,1', '1,1', '1,2', '1,2', '1,2'],
            ['1,0', '1,0', '1,0', '1,1', '1,1', '1,1', '1,2', '1,2', '1,2'],
            ['1,0', '1,0', '1,0', '1,1', '1,1', '1,1', '1,2', '1,2', '1,2'],
          ], { hl2: [[3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [4, 5], [5, 3], [5, 4], [5, 5]], cap: 'box index = (r // 3, c // 3) (first six rows shown)' }),
          p("For example, if we wrote a 5 into the empty cell `(1, 1)`, the row check would fail immediately because row 1 already holds a 5 at column 5. The box check would also catch it, because the top-left box `(0, 0)` holds a 5 at `(0, 0)`."),
          impl(`
            from typing import List

            def verify_sudoku_board(board: List[List[int]]) -> bool:
                rows = [set() for _ in range(9)]
                cols = [set() for _ in range(9)]
                boxes = [[set() for _ in range(3)] for _ in range(3)]
                for r in range(9):
                    for c in range(9):
                        d = board[r][c]
                        if d == 0:
                            continue
                        box = boxes[r // 3][c // 3]
                        if d in rows[r] or d in cols[c] or d in box:
                            return False
                        rows[r].add(d)
                        cols[c].add(d)
                        box.add(d)
                return True
            `, `
            function verifySudokuBoard(board) {
              const rows = Array.from({ length: 9 }, () => new Set());
              const cols = Array.from({ length: 9 }, () => new Set());
              const boxes = Array.from({ length: 9 }, () => new Set());
              for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                  const d = board[r][c];
                  if (d === 0) continue;
                  const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
                  if (rows[r].has(d) || cols[c].has(d) || boxes[b].has(d)) return false;
                  rows[r].add(d);
                  cols[c].add(d);
                  boxes[b].add(d);
                }
              }
              return true;
            }
            `, `
            public boolean verifySudokuBoard(int[][] board) {
                List<Set<Integer>> rows = new ArrayList<>(), cols = new ArrayList<>(), boxes = new ArrayList<>();
                for (int i = 0; i < 9; i++) {
                    rows.add(new HashSet<>());
                    cols.add(new HashSet<>());
                    boxes.add(new HashSet<>());
                }
                for (int r = 0; r < 9; r++) {
                    for (int c = 0; c < 9; c++) {
                        int d = board[r][c];
                        if (d == 0) continue;
                        int b = (r / 3) * 3 + (c / 3);
                        // Set.add returns false if the digit was already present.
                        if (!rows.get(r).add(d) || !cols.get(c).add(d) || !boxes.get(b).add(d)) {
                            return false;
                        }
                    }
                }
                return true;
            }
            `),
          cx("$O(n^2)$ for an $n × n$ board, which is $O(81) = O(1)$ for a standard Sudoku. Every cell is visited once.",
            "$O(n^2)$ for the sets, again constant for a 9 × 9 board."),
        ],
      },

      {
        id: 'zero-striping',
        title: 'Zero Striping',
        body: [
          p("Given an `m × n` matrix of integers, for every cell that contains **0**, set its **entire row and entire column to 0**. Modify the matrix in place. Only zeros that were in the **original** matrix should cause striping."),
          ex('matrix = [[1, 2, 3], [4, 0, 6], [7, 8, 9]]', '[[1, 0, 3], [0, 0, 0], [7, 0, 9]]'),
          ex('matrix = [[0, 2], [3, 4], [5, 6]]', '[[0, 0], [0, 4], [0, 6]]'),
          h('Intuition'),
          p("The tempting approach is to zero out a row and column as soon as we find a 0 while scanning. That breaks: the zeros we just wrote look like original zeros later in the scan, and the whole matrix ends up zeroed."),
          row2(),
          p("The fix is to **separate discovery from modification**. In a first pass, record which rows and which columns contain a zero. Hash sets are perfect for that. In a second pass, a cell becomes 0 if its row **or** its column was recorded."),
          grid([[1, 2, 3], [4, 0, 6], [7, 8, 9]], { hl: [[1, 1]], cols: ['c0', 'c1', 'c2'], rowsLabels: ['r0', 'r1', 'r2'], state: 'pass 1: zero at (1, 1)\nzero_rows = {1}\nzero_cols = {1}' }),
          grid([[1, 0, 3], [0, 0, 0], [7, 0, 9]], { hl2: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]], cols: ['c0', 'c1', 'c2'], rowsLabels: ['r0', 'r1', 'r2'], state: 'pass 2: cell (r, c) = 0 if\nr in zero_rows or c in zero_cols' }),
          h3('Can we avoid the extra space?'),
          p("Yes. A common follow-up is to use the matrix's **first row and first column** as the markers instead of sets: write `matrix[r][0] = 0` and `matrix[0][c] = 0` when you find a zero at `(r, c)`. Because those marker cells are overwritten, first remember (in two booleans) whether the first row and first column originally contained a zero, and stripe them last. That brings the extra space down to $O(1)$ with the same $O(m·n)$ time."),
          impl(`
            from typing import List

            def zero_striping(matrix: List[List[int]]) -> None:
                if not matrix or not matrix[0]:
                    return
                m, n = len(matrix), len(matrix[0])
                zero_rows, zero_cols = set(), set()
                # Pass 1: remember where the original zeros are.
                for r in range(m):
                    for c in range(n):
                        if matrix[r][c] == 0:
                            zero_rows.add(r)
                            zero_cols.add(c)
                # Pass 2: stripe.
                for r in range(m):
                    for c in range(n):
                        if r in zero_rows or c in zero_cols:
                            matrix[r][c] = 0
            `, `
            function zeroStriping(matrix) {
              if (!matrix.length || !matrix[0].length) return;
              const m = matrix.length, n = matrix[0].length;
              const zeroRows = new Set(), zeroCols = new Set();
              // Pass 1: remember where the original zeros are.
              for (let r = 0; r < m; r++) {
                for (let c = 0; c < n; c++) {
                  if (matrix[r][c] === 0) { zeroRows.add(r); zeroCols.add(c); }
                }
              }
              // Pass 2: stripe.
              for (let r = 0; r < m; r++) {
                for (let c = 0; c < n; c++) {
                  if (zeroRows.has(r) || zeroCols.has(c)) matrix[r][c] = 0;
                }
              }
            }
            `, `
            public void zeroStriping(int[][] matrix) {
                if (matrix.length == 0 || matrix[0].length == 0) return;
                int m = matrix.length, n = matrix[0].length;
                Set<Integer> zeroRows = new HashSet<>(), zeroCols = new HashSet<>();
                // Pass 1: remember where the original zeros are.
                for (int r = 0; r < m; r++) {
                    for (int c = 0; c < n; c++) {
                        if (matrix[r][c] == 0) { zeroRows.add(r); zeroCols.add(c); }
                    }
                }
                // Pass 2: stripe.
                for (int r = 0; r < m; r++) {
                    for (int c = 0; c < n; c++) {
                        if (zeroRows.contains(r) || zeroCols.contains(c)) matrix[r][c] = 0;
                    }
                }
            }
            `),
          cx("$O(m·n)$. Two passes over every cell.",
            "$O(m + n)$ for the two sets (or $O(1)$ with the first-row / first-column marker trick)."),
        ],
      },

      {
        id: 'longest-chain-of-consecutive-numbers',
        title: 'Longest Chain of Consecutive Numbers',
        body: [
          p("Given an **unsorted** array of integers, return the length of the **longest run of consecutive values** (like 4, 5, 6, 7) that can be formed from its elements. The values don't have to be adjacent in the array. Aim for linear time."),
          ex('nums = [1, 6, 2, 5, 8, 7, 10, 3]', '4', "the longest chain is 5, 6, 7, 8. The chain 1, 2, 3 has length 3."),
          ex('nums = [4, 4, 4]', '1'),
          h('Intuition'),
          p("Sorting the array and counting runs works in $O(n \\log n)$. To reach $O(n)$ we put every number in a **hash set**, so \"is `x + 1` present?\" becomes an $O(1)$ question."),
          p("Now we could start at every number and count upwards while `x + 1` exists, but that repeats a lot of work: starting from 6 recounts most of the chain we already counted from 5. The trick is to only start counting from the **beginning of a chain**: a number `x` whose predecessor `x - 1` is **not** in the set."),
          arr([1, 6, 2, 5, 8, 7, 10, 3], { hl: [0, 3, 6], cap: 'chain starts (no x - 1 in the set): 1, 5, 10', state: 'from 1: 1,2,3     → 3\nfrom 5: 5,6,7,8   → 4\nfrom 10: 10       → 1' }),
          p("Every number is visited at most twice: once by the outer loop, and at most once while extending the chain it belongs to. So the total work is linear."),
          impl(`
            from typing import List

            def longest_chain_of_consecutive_numbers(nums: List[int]) -> int:
                values = set(nums)
                longest = 0
                for x in values:
                    if x - 1 in values:
                        continue  # not the start of a chain
                    length = 1
                    while x + length in values:
                        length += 1
                    longest = max(longest, length)
                return longest
            `, `
            function longestChainOfConsecutiveNumbers(nums) {
              const values = new Set(nums);
              let longest = 0;
              for (const x of values) {
                if (values.has(x - 1)) continue; // not the start of a chain
                let length = 1;
                while (values.has(x + length)) length++;
                longest = Math.max(longest, length);
              }
              return longest;
            }
            `, `
            public int longestChainOfConsecutiveNumbers(int[] nums) {
                Set<Integer> values = new HashSet<>();
                for (int x : nums) values.add(x);
                int longest = 0;
                for (int x : values) {
                    if (values.contains(x - 1)) continue; // not the start of a chain
                    int length = 1;
                    while (values.contains(x + length)) length++;
                    longest = Math.max(longest, length);
                }
                return longest;
            }
            `),
          cx("$O(n)$. Building the set is linear, and each value is touched a constant number of times across all chain extensions.",
            "$O(n)$ for the set."),
        ],
      },

      {
        id: 'geometric-sequence-triplets',
        title: 'Geometric Sequence Triplets',
        body: [
          p("A **geometric triplet** is three numbers `(x, x·r, x·r²)` for a fixed ratio `r`. Given an array `nums` and a positive integer ratio `r`, count the index triplets `i < j < k` such that `nums[j] = nums[i] · r` and `nums[k] = nums[j] · r`."),
          ex('nums = [2, 1, 2, 4, 8, 8], r = 2', '5', "(1, 2, 4) using indexes (1, 2, 3), plus (2, 4, 8) using either 2 (indexes 0 or 2) and either 8 (indexes 4 or 5): 1 + 2 × 2 = 5."),
          ex('nums = [3, 3, 3], r = 1', '1'),
          h('Intuition'),
          p("Checking every triple of indexes is $O(n^3)$. Instead, treat each element as the **middle** of a triplet. If `nums[j] = y`, the triplet needs a `y / r` somewhere **to the left** of `j` and a `y · r` somewhere **to the right**. Every left choice combines with every right choice, so the number of triplets with middle `j` is:"),
          state('count(y / r on the left)  ×  count(y · r on the right)'),
          p("Two hash maps keep those counts up to date as `j` sweeps from left to right:"),
          ul(
            "`left` counts values at indexes **before** `j`. It starts empty.",
            "`right` counts values at indexes **after** `j`. It starts with every value, and we remove `nums[j]` from it when `j` arrives."
          ),
          arr([2, 1, 2, 4, 8, 8], { p: { j: 3 }, on: ['j'], hl: [0, 2], hl2: [4, 5], state: 'y = 4, need 2 on the left and 8 on the right\nleft[2] = 2, right[8] = 2  →  +4' }),
          arr([2, 1, 2, 4, 8, 8], { p: { j: 2 }, on: ['j'], hl: [1], hl2: [3], state: 'y = 2, need 1 on the left and 4 on the right\nleft[1] = 1, right[4] = 1  →  +1' }),
          note("Only add a contribution when `y` is divisible by `r`. Otherwise `y / r` isn't an integer and can't appear in the array."),
          impl(`
            from collections import defaultdict
            from typing import List

            def geometric_sequence_triplets(nums: List[int], r: int) -> int:
                left = defaultdict(int)
                right = defaultdict(int)
                for x in nums:
                    right[x] += 1
                count = 0
                for y in nums:
                    right[y] -= 1  # y is now the middle, not on the right
                    if y % r == 0:
                        count += left[y // r] * right[y * r]
                    left[y] += 1   # y moves to the left side
                return count
            `, `
            function geometricSequenceTriplets(nums, r) {
              const left = new Map(), right = new Map();
              const get = (m, k) => m.get(k) || 0;
              for (const x of nums) right.set(x, get(right, x) + 1);
              let count = 0;
              for (const y of nums) {
                right.set(y, get(right, y) - 1); // y is now the middle
                if (y % r === 0) count += get(left, y / r) * get(right, y * r);
                left.set(y, get(left, y) + 1);   // y moves to the left side
              }
              return count;
            }
            `, `
            public long geometricSequenceTriplets(int[] nums, int r) {
                Map<Long, Long> left = new HashMap<>(), right = new HashMap<>();
                for (int x : nums) right.merge((long) x, 1L, Long::sum);
                long count = 0;
                for (int v : nums) {
                    long y = v;
                    right.merge(y, -1L, Long::sum); // y is now the middle
                    if (y % r == 0) {
                        count += left.getOrDefault(y / r, 0L) * right.getOrDefault(y * r, 0L);
                    }
                    left.merge(y, 1L, Long::sum);   // y moves to the left side
                }
                return count;
            }
            `),
          cx("$O(n)$. Two passes with $O(1)$ average map operations.",
            "$O(n)$ for the two maps."),
        ],
      },
    ],
  });

  function row2() {
    return K.row(
      grid([[1, 2, 3], [4, 0, 6], [7, 8, 9]], { hl: [[1, 1]], cap: 'original' }),
      grid([[1, 0, 3], [0, 0, 0], [7, 0, 9]], { hl: [[1, 1]], hl2: [[0, 1], [1, 0], [1, 2], [2, 1]], cap: 'after striping (1, 1) immediately' }),
      grid([[0, 0, 0], [0, 0, 0], [0, 0, 0]], { cap: 'the new zeros trigger more striping ✗' })
    );
  }
})();
