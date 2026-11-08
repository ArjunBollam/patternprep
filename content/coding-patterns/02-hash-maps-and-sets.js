(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, state, code, impl, cx, table, ap, cost, vs, tests, tips } = K;

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
          ap(1, 'Brute force: check every pair'),
          p("Try every pair of indexes `i < j` and return the first pair whose values add up to the target."),
          code(`
            from typing import List

            def pair_sum_unsorted_brute_force(nums: List[int], target: int) -> List[int]:
                n = len(nums)
                for i in range(n):
                    for j in range(i + 1, n):
                        if nums[i] + nums[j] == target:
                            return [i, j]
                return []
            `, `
            function pairSumUnsortedBruteForce(nums, target) {
              for (let i = 0; i < nums.length; i++) {
                for (let j = i + 1; j < nums.length; j++) {
                  if (nums[i] + nums[j] === target) return [i, j];
                }
              }
              return [];
            }
            `, `
            public int[] pairSumUnsortedBruteForce(int[] nums, int target) {
                for (int i = 0; i < nums.length; i++) {
                    for (int j = i + 1; j < nums.length; j++) {
                        if (nums[i] + nums[j] == target) return new int[]{i, j};
                    }
                }
                return new int[0];
            }
            `),
          cost("$O(n^2)$.", "$O(1)$."),
          ap(2, 'Sort the indexes, then two pointers'),
          p("[Pair Sum - Sorted](#/two-pointers/pair-sum-sorted) solves this in linear time once the values are sorted. Sorting `nums` directly would lose the original indexes we must return, so we sort a list of **indexes ordered by their values** and run the two-pointer scan over that list."),
          code(`
            from typing import List

            def pair_sum_unsorted_sorting(nums: List[int], target: int) -> List[int]:
                order = sorted(range(len(nums)), key=lambda i: nums[i])  # indexes by value
                left, right = 0, len(order) - 1
                while left < right:
                    total = nums[order[left]] + nums[order[right]]
                    if total < target:
                        left += 1
                    elif total > target:
                        right -= 1
                    else:
                        return [order[left], order[right]]
                return []
            `, `
            function pairSumUnsortedSorting(nums, target) {
              const order = nums.map((_, i) => i).sort((a, b) => nums[a] - nums[b]); // indexes by value
              let left = 0, right = order.length - 1;
              while (left < right) {
                const sum = nums[order[left]] + nums[order[right]];
                if (sum < target) left++;
                else if (sum > target) right--;
                else return [order[left], order[right]];
              }
              return [];
            }
            `, `
            public int[] pairSumUnsortedSorting(int[] nums, int target) {
                Integer[] order = new Integer[nums.length];
                for (int i = 0; i < nums.length; i++) order[i] = i;
                Arrays.sort(order, (a, b) -> Integer.compare(nums[a], nums[b])); // indexes by value
                int left = 0, right = order.length - 1;
                while (left < right) {
                    int sum = nums[order[left]] + nums[order[right]];
                    if (sum < target) left++;
                    else if (sum > target) right--;
                    else return new int[]{order[left], order[right]};
                }
                return new int[0];
            }
            `),
          cost("$O(n log n)$ for the sort; the scan itself is linear.", "$O(n)$ for the index list."),
          p("Sorting is now the bottleneck. Can we find the partner without ordering anything?"),
          ap(3, 'One-pass hash map (optimal)'),
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
          vs([
            ['1. Brute force', '$O(n^2)$', '$O(1)$', 'Tiny inputs, or when memory is extremely tight.'],
            ['2. Sort indexes + two pointers', '$O(n log n)$', '$O(n)$', 'When you also need the pairs in value order.'],
            ['3. One-pass hash map', '$O(n)$', '$O(n)$', 'The expected answer.'],
          ]),
          tests([
            ['nums = [], target = 1', '[]', 'Empty array.'],
            ['nums = [7], target = 14', '[]', 'One element cannot be used twice.'],
            ['nums = [1, 2, 3], target = 7', '[]', 'No pair reaches the target.'],
            ['nums = [3, 3], target = 6', '[0, 1]', 'Two equal values form the pair.'],
            ['nums = [-4, 10, 0, 6], target = 2', '[0, 3]', 'A negative number in the pair.'],
            ['nums = [8, 0, -8, 5], target = 0', '[0, 2]', 'Target of zero.'],
            ['nums = [5, -2, 9, 1], target = 6', '[0, 3]', 'Example 1.'],
          ], {
            fn: ['pair_sum_unsorted_brute_force', 'pair_sum_unsorted_sorting', 'pair_sum_unsorted'],
            check: "lambda r, e, kw: r == [] if e == [] else (len(r) == 2 and r[0] != r[1] and kw['nums'][r[0]] + kw['nums'][r[1]] == kw['target'])",
            jscheck: "(r, e, kw) => e.length === 0 ? r.length === 0 : (r.length === 2 && r[0] !== r[1] && kw.nums[r[0]] + kw.nums[r[1]] === kw.target)",
          }),
          tips(
            "Check the map **before** inserting the current value. Inserting first would let `x + x = target` match an element with itself.",
            "If asked for every pair, or for the number of pairs, store a count (or a list of indexes) per value instead of a single index."
          ),
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
          ap(1, 'Brute force: compare every digit with its row, column and box'),
          p("For every filled cell, scan the other cells of its row, its column and its 3 × 3 box, and fail if any of them holds the same digit."),
          code(`
            from typing import List

            def verify_sudoku_board_brute_force(board: List[List[int]]) -> bool:
                for r in range(9):
                    for c in range(9):
                        d = board[r][c]
                        if d == 0:
                            continue
                        for k in range(9):
                            if k != c and board[r][k] == d:  # same row
                                return False
                            if k != r and board[k][c] == d:  # same column
                                return False
                        br, bc = 3 * (r // 3), 3 * (c // 3)  # top-left of the box
                        for i in range(br, br + 3):
                            for j in range(bc, bc + 3):
                                if (i, j) != (r, c) and board[i][j] == d:
                                    return False
                return True
            `, `
            function verifySudokuBoardBruteForce(board) {
              for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                  const d = board[r][c];
                  if (d === 0) continue;
                  for (let k = 0; k < 9; k++) {
                    if (k !== c && board[r][k] === d) return false; // same row
                    if (k !== r && board[k][c] === d) return false; // same column
                  }
                  const br = 3 * Math.floor(r / 3), bc = 3 * Math.floor(c / 3);
                  for (let i = br; i < br + 3; i++) {
                    for (let j = bc; j < bc + 3; j++) {
                      if ((i !== r || j !== c) && board[i][j] === d) return false;
                    }
                  }
                }
              }
              return true;
            }
            `, `
            public boolean verifySudokuBoardBruteForce(int[][] board) {
                for (int r = 0; r < 9; r++) {
                    for (int c = 0; c < 9; c++) {
                        int d = board[r][c];
                        if (d == 0) continue;
                        for (int k = 0; k < 9; k++) {
                            if (k != c && board[r][k] == d) return false; // same row
                            if (k != r && board[k][c] == d) return false; // same column
                        }
                        int br = 3 * (r / 3), bc = 3 * (c / 3);
                        for (int i = br; i < br + 3; i++) {
                            for (int j = bc; j < bc + 3; j++) {
                                if ((i != r || j != c) && board[i][j] == d) return false;
                            }
                        }
                    }
                }
                return true;
            }
            `),
          cost("$O(n^3)$ for an $n × n$ board: each of the $n^2$ cells scans $O(n)$ others. For 9 × 9 that is about 81 × 27 ≈ 2,200 comparisons.",
            "$O(1)$."),
          p("Every pair of cells in the same group gets compared twice, once from each side. Remembering what each group has already seen removes that repetition."),
          ap(2, 'One hash set per row, column and box (optimal)'),
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
          vs([
            ['1. Scan row, column and box per cell', '$O(n^3)$', '$O(1)$', 'Fine for a single 9 × 9 board; easy to get right.'],
            ['2. 27 hash sets, one pass', '$O(n^2)$', '$O(n^2)$', 'The expected answer; each cell is looked at once.'],
          ]),
          tests([
            ['board = [".........", ".........", ".........", ".........", ".........", ".........", ".........", ".........", "........."]', 'True', 'An empty board breaks no rule.'],
            ['board = ["1.......2", ".........", ".........", ".........", "....5....", ".........", ".........", ".........", "3.......1"]', 'True', 'A sparse, valid board (two 1s in different rows, columns and boxes).'],
            ['board = ["5.......5", ".........", ".........", ".........", ".........", ".........", ".........", ".........", "........."]', 'False', 'Only the row rule is broken.'],
            ['board = ["....7....", ".........", ".........", ".........", ".........", ".........", ".........", ".........", "....7...."]', 'False', 'Only the column rule is broken.'],
            ['board = ["3........", ".........", "..3......", ".........", ".........", ".........", ".........", ".........", "........."]', 'False', 'Only the box rule is broken.'],
            ['board = ["123456789", "456789123", "789123456", "234567891", "567891234", "891234567", "345678912", "678912345", "912345678"]', 'True', 'A completely filled, valid board.'],
            ['board = ["53..7...9", "6..195...", ".98....6.", "8...6...3", "4..8.3..1", "7...2...6", ".6....28.", "...419..5", "....8..79"]', 'False', 'The example board (two 9s in column 8).'],
          ], {
            fn: ['verify_sudoku_board_brute_force', 'verify_sudoku_board'],
            conv: { board: "lambda rows: [[0 if ch == '.' else int(ch) for ch in row] for row in rows]" },
            jsconv: { board: "rows => rows.map(r => [...r].map(ch => (ch === '.' ? 0 : Number(ch))))" },
          }),
          note("In the table each row of the board is written as a 9-character string, with `.` for an empty cell, to keep it readable. The functions themselves take the 9 × 9 integer grid, with `0` for empty."),
          tips(
            "Bitmasks are a nice optimization to mention: one 9-bit integer per row, column and box replaces each set, and `mask & (1 << d)` checks a digit in one operation.",
            "Clarify the scope: you only verify the filled cells; you don't solve the puzzle or check that a solution exists."
          ),
        ],
      },

      {
        id: 'zero-striping',
        title: 'Zero Striping',
        body: [
          p("Given an `m × n` matrix of integers, for every cell that contains **0**, set its **entire row and entire column to 0**. Modify the matrix in place. Only zeros that were in the **original** matrix should cause striping."),
          ex('matrix = [[1, 2, 3], [4, 0, 6], [7, 8, 9]]', '[[1, 0, 3], [0, 0, 0], [7, 0, 9]]'),
          ex('matrix = [[0, 2], [3, 4], [5, 6]]', '[[0, 0], [0, 4], [0, 6]]'),

          ap(1, 'Brute force: stripe from a copy'),
          p("The tempting approach is to zero out a row and column as soon as we find a 0 while scanning. That breaks: the zeros we just wrote look like original zeros later in the scan, and the whole matrix ends up zeroed."),
          row2(),
          p("The simplest correct fix is to look for zeros in an untouched **copy** of the matrix and do all the writing in the original. Each original zero then stripes its row and column exactly once, and the new zeros are never mistaken for original ones."),
          code(`
            from typing import List

            def zero_striping_copy(matrix: List[List[int]]) -> None:
                original = [row[:] for row in matrix]
                m = len(matrix)
                n = len(matrix[0]) if m else 0
                for r in range(m):
                    for c in range(n):
                        if original[r][c] == 0:
                            for k in range(n):
                                matrix[r][k] = 0  # stripe the row
                            for k in range(m):
                                matrix[k][c] = 0  # stripe the column
            `, `
            function zeroStripingCopy(matrix) {
              const original = matrix.map(row => [...row]);
              const m = matrix.length, n = m ? matrix[0].length : 0;
              for (let r = 0; r < m; r++) {
                for (let c = 0; c < n; c++) {
                  if (original[r][c] === 0) {
                    for (let k = 0; k < n; k++) matrix[r][k] = 0; // stripe the row
                    for (let k = 0; k < m; k++) matrix[k][c] = 0; // stripe the column
                  }
                }
              }
            }
            `, `
            public void zeroStripingCopy(int[][] matrix) {
                int m = matrix.length, n = m == 0 ? 0 : matrix[0].length;
                int[][] original = new int[m][];
                for (int r = 0; r < m; r++) original[r] = matrix[r].clone();
                for (int r = 0; r < m; r++) {
                    for (int c = 0; c < n; c++) {
                        if (original[r][c] == 0) {
                            for (int k = 0; k < n; k++) matrix[r][k] = 0; // stripe the row
                            for (int k = 0; k < m; k++) matrix[k][c] = 0; // stripe the column
                        }
                    }
                }
            }
            `),
          cost("$O(m·n·(m + n))$ in the worst case: each of up to $m·n$ zeros writes a whole row and a whole column.",
            "$O(m·n)$ for the copy."),
          p("Copying the whole matrix just to remember where the zeros were is wasteful. All we really need to know is **which rows** and **which columns** contained a zero."),

          ap(2, 'Hash sets of zero rows and zero columns'),
          p("The fix is to **separate discovery from modification**. In a first pass, record which rows and which columns contain a zero. Hash sets are perfect for that. In a second pass, a cell becomes 0 if its row **or** its column was recorded."),
          grid([[1, 2, 3], [4, 0, 6], [7, 8, 9]], { hl: [[1, 1]], cols: ['c0', 'c1', 'c2'], rowsLabels: ['r0', 'r1', 'r2'], state: 'pass 1: zero at (1, 1)\nzero_rows = {1}\nzero_cols = {1}' }),
          grid([[1, 0, 3], [0, 0, 0], [7, 0, 9]], { hl2: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]], cols: ['c0', 'c1', 'c2'], rowsLabels: ['r0', 'r1', 'r2'], state: 'pass 2: cell (r, c) = 0 if\nr in zero_rows or c in zero_cols' }),
          code(`
            from typing import List

            def zero_striping_hash_sets(matrix: List[List[int]]) -> None:
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
            function zeroStripingHashSets(matrix) {
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
            public void zeroStripingHashSets(int[][] matrix) {
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
          cost("$O(m·n)$: two passes over every cell.", "$O(m + n)$ for the two sets."),
          p("A very common follow-up: *can you do it with constant extra space?*"),

          ap(3, 'Use the first row and column as markers (optimal space)'),
          p("The matrix already has a natural place to store one flag per row and one flag per column: its own **first column** and **first row**. When we find a zero at `(r, c)`, we write `matrix[r][0] = 0` (\"row `r` must be striped\") and `matrix[0][c] = 0` (\"column `c` must be striped\")."),
          p("There is one catch. The marker cells are real data, so before we overwrite them we must remember whether the first row and the first column **originally** contained a zero. Two booleans are enough. The order of the steps matters:"),
          ol(
            "Record `first_row_zero` and `first_col_zero` by scanning row 0 and column 0.",
            "Scan the inner cells (`r ≥ 1`, `c ≥ 1`). For every zero, set its two marker cells to 0.",
            "Scan the inner cells again: zero a cell if its row marker `matrix[r][0]` or its column marker `matrix[0][c]` is 0.",
            "Finally stripe row 0 if `first_row_zero`, and column 0 if `first_col_zero`. These go last, because doing them earlier would destroy the markers."
          ),
          grid([[1, 0, 3, 4], [0, 0, 7, 8], [9, 10, 11, 12]], { hl: [[1, 1]], hl2: [[1, 0], [0, 1]], cols: ['c0', 'c1', 'c2', 'c3'], rowsLabels: ['r0', 'r1', 'r2'], state: 'step 2: zero at (1, 1)\nmarkers written: matrix[1][0] = 0\nand matrix[0][1] = 0' }),
          grid([[1, 0, 3, 4], [0, 0, 0, 0], [9, 0, 11, 12]], { hl2: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3], [2, 1]], cols: ['c0', 'c1', 'c2', 'c3'], rowsLabels: ['r0', 'r1', 'r2'], state: 'inner cells striped from the markers;\nrow 0 / column 0 had no original zero,\nso step 4 does nothing' }),
          impl(`
            from typing import List

            def zero_striping(matrix: List[List[int]]) -> None:
                if not matrix or not matrix[0]:
                    return
                m, n = len(matrix), len(matrix[0])
                # 1. Remember whether row 0 / column 0 had zeros before we reuse them as markers.
                first_row_zero = any(matrix[0][c] == 0 for c in range(n))
                first_col_zero = any(matrix[r][0] == 0 for r in range(m))
                # 2. Mark: row r -> matrix[r][0], column c -> matrix[0][c].
                for r in range(1, m):
                    for c in range(1, n):
                        if matrix[r][c] == 0:
                            matrix[r][0] = 0
                            matrix[0][c] = 0
                # 3. Stripe the inner cells using the markers.
                for r in range(1, m):
                    for c in range(1, n):
                        if matrix[r][0] == 0 or matrix[0][c] == 0:
                            matrix[r][c] = 0
                # 4. Stripe the marker row and column last.
                if first_row_zero:
                    for c in range(n):
                        matrix[0][c] = 0
                if first_col_zero:
                    for r in range(m):
                        matrix[r][0] = 0
            `, `
            function zeroStriping(matrix) {
              if (!matrix.length || !matrix[0].length) return;
              const m = matrix.length, n = matrix[0].length;
              // 1. Remember whether row 0 / column 0 had zeros before we reuse them as markers.
              const firstRowZero = matrix[0].some(v => v === 0);
              const firstColZero = matrix.some(row => row[0] === 0);
              // 2. Mark: row r -> matrix[r][0], column c -> matrix[0][c].
              for (let r = 1; r < m; r++) {
                for (let c = 1; c < n; c++) {
                  if (matrix[r][c] === 0) { matrix[r][0] = 0; matrix[0][c] = 0; }
                }
              }
              // 3. Stripe the inner cells using the markers.
              for (let r = 1; r < m; r++) {
                for (let c = 1; c < n; c++) {
                  if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;
                }
              }
              // 4. Stripe the marker row and column last.
              if (firstRowZero) for (let c = 0; c < n; c++) matrix[0][c] = 0;
              if (firstColZero) for (let r = 0; r < m; r++) matrix[r][0] = 0;
            }
            `, `
            public void zeroStriping(int[][] matrix) {
                if (matrix.length == 0 || matrix[0].length == 0) return;
                int m = matrix.length, n = matrix[0].length;
                // 1. Remember whether row 0 / column 0 had zeros before we reuse them as markers.
                boolean firstRowZero = false, firstColZero = false;
                for (int c = 0; c < n; c++) if (matrix[0][c] == 0) firstRowZero = true;
                for (int r = 0; r < m; r++) if (matrix[r][0] == 0) firstColZero = true;
                // 2. Mark: row r -> matrix[r][0], column c -> matrix[0][c].
                for (int r = 1; r < m; r++) {
                    for (int c = 1; c < n; c++) {
                        if (matrix[r][c] == 0) { matrix[r][0] = 0; matrix[0][c] = 0; }
                    }
                }
                // 3. Stripe the inner cells using the markers.
                for (int r = 1; r < m; r++) {
                    for (int c = 1; c < n; c++) {
                        if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
                    }
                }
                // 4. Stripe the marker row and column last.
                if (firstRowZero) for (int c = 0; c < n; c++) matrix[0][c] = 0;
                if (firstColZero) for (int r = 0; r < m; r++) matrix[r][0] = 0;
            }
            `),
          cx("$O(m·n)$. A constant number of passes over the matrix.",
            "$O(1)$. The markers live inside the matrix; only two booleans are added."),
          vs([
            ['1. Stripe from a copy', '$O(m·n·(m + n))$', '$O(m·n)$', 'Only as the first correct idea.'],
            ['2. Hash sets of rows and columns', '$O(m·n)$', '$O(m + n)$', 'The clearest optimal-time answer; start here in an interview.'],
            ['3. First row / column as markers', '$O(m·n)$', '$O(1)$', 'The follow-up for constant space. Mind the order of the four steps.'],
          ]),
          tests([
            ['matrix = []', '[]', 'Empty matrix.'],
            ['matrix = [[1]]', '[[1]]', 'One non-zero cell.'],
            ['matrix = [[0]]', '[[0]]', 'One zero cell.'],
            ['matrix = [[1, 2], [3, 4]]', '[[1, 2], [3, 4]]', 'No zeros: nothing changes.'],
            ['matrix = [[5, 0, 5], [5, 5, 5]]', '[[0, 0, 0], [5, 0, 5]]', 'A zero in the first row (a marker row).'],
            ['matrix = [[1, 2], [0, 3]]', '[[0, 2], [0, 0]]', 'A zero in the first column (a marker column).'],
            ['matrix = [[1, 2, 3, 4], [5, 0, 7, 8], [9, 10, 11, 0]]', '[[1, 0, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0]]', 'Two zeros in a non-square matrix.'],
            ['matrix = [[0, 2], [3, 4], [5, 6]]', '[[0, 0], [0, 4], [0, 6]]', 'Example 2: a zero in the corner.'],
          ], { fn: ['zero_striping_copy', 'zero_striping_hash_sets', 'zero_striping'], inplace: 'matrix' }),
          tips(
            "Explain why striping immediately fails before writing any code. It shows you understand the *original zeros only* rule.",
            "For the $O(1)$-space version, interviewers mostly check the order: save the two booleans first, and stripe row 0 and column 0 last."
          ),
        ],
      },

      {
        id: 'longest-chain-of-consecutive-numbers',
        title: 'Longest Chain of Consecutive Numbers',
        body: [
          p("Given an **unsorted** array of integers, return the length of the **longest run of consecutive values** (like 4, 5, 6, 7) that can be formed from its elements. The values don't have to be adjacent in the array. Aim for linear time."),
          ex('nums = [1, 6, 2, 5, 8, 7, 10, 3]', '4', "the longest chain is 5, 6, 7, 8. The chain 1, 2, 3 has length 3."),
          ex('nums = [4, 4, 4]', '1'),
          ap(1, 'Brute force: extend a chain from every number'),
          p("Start from every number `x` and keep asking whether `x + 1`, `x + 2`, ... exist by **scanning the array** each time. The longest run found from any start is the answer."),
          code(`
            from typing import List

            def longest_chain_brute_force(nums: List[int]) -> int:
                longest = 0
                for x in nums:
                    length = 1
                    while (x + length) in nums:  # 'in' on a list is a linear scan
                        length += 1
                    longest = max(longest, length)
                return longest
            `, `
            function longestChainBruteForce(nums) {
              let longest = 0;
              for (const x of nums) {
                let length = 1;
                while (nums.includes(x + length)) length++; // linear scan
                longest = Math.max(longest, length);
              }
              return longest;
            }
            `, `
            public int longestChainBruteForce(int[] nums) {
                int longest = 0;
                for (int x : nums) {
                    int length = 1;
                    while (contains(nums, x + length)) length++;
                    longest = Math.max(longest, length);
                }
                return longest;
            }

            private boolean contains(int[] nums, int target) { // linear scan
                for (int v : nums) if (v == target) return true;
                return false;
            }
            `),
          cost("$O(n^3)$: $n$ starting points, chains up to $n$ long, and a linear scan for each step.", "$O(1)$."),
          ap(2, 'Sort, then count runs'),
          p("After sorting, consecutive values sit next to each other, so one pass can measure every run. Equal neighbours neither extend nor break a run, so they are skipped."),
          code(`
            from typing import List

            def longest_chain_sorting(nums: List[int]) -> int:
                if not nums:
                    return 0
                nums = sorted(nums)
                longest = current = 1
                for i in range(1, len(nums)):
                    if nums[i] == nums[i - 1]:
                        continue  # duplicate: run unchanged
                    current = current + 1 if nums[i] == nums[i - 1] + 1 else 1
                    longest = max(longest, current)
                return longest
            `, `
            function longestChainSorting(nums) {
              if (!nums.length) return 0;
              const a = [...nums].sort((x, y) => x - y);
              let longest = 1, current = 1;
              for (let i = 1; i < a.length; i++) {
                if (a[i] === a[i - 1]) continue; // duplicate: run unchanged
                current = a[i] === a[i - 1] + 1 ? current + 1 : 1;
                longest = Math.max(longest, current);
              }
              return longest;
            }
            `, `
            public int longestChainSorting(int[] nums) {
                if (nums.length == 0) return 0;
                int[] a = nums.clone();
                Arrays.sort(a);
                int longest = 1, current = 1;
                for (int i = 1; i < a.length; i++) {
                    if (a[i] == a[i - 1]) continue; // duplicate: run unchanged
                    current = a[i] == a[i - 1] + 1 ? current + 1 : 1;
                    longest = Math.max(longest, current);
                }
                return longest;
            }
            `),
          cost("$O(n log n)$ for the sort; the scan is linear.", "$O(n)$ for the sorted copy ($O(1)$ extra if sorting in place is allowed)."),
          p("The problem asks for linear time, so sorting is off the table. What we really need is a fast answer to \"does this value exist?\"."),
          ap(3, 'Hash set, counting only from chain starts (optimal)'),
          p("To reach $O(n)$ we put every number in a **hash set**, so \"is `x + 1` present?\" becomes an $O(1)$ question."),
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
          vs([
            ['1. Extend from every number by scanning', '$O(n^3)$', '$O(1)$', 'Never in practice; it defines the problem.'],
            ['2. Sort and count runs', '$O(n log n)$', '$O(n)$ or $O(1)$', 'When linear time is not required, or memory matters more.'],
            ['3. Hash set + chain starts', '$O(n)$', '$O(n)$', 'The expected answer when linear time is requested.'],
          ]),
          tests([
            ['nums = []', '0', 'Empty array.'],
            ['nums = [7]', '1', 'A single value is a chain of length 1.'],
            ['nums = [4, 4, 4]', '1', 'Duplicates of one value.'],
            ['nums = [10, 30, 20]', '1', 'No two values are consecutive.'],
            ['nums = [3, 2, 1, 0, -1]', '5', 'Negative values, given in decreasing order.'],
            ['nums = [1, 2, 2, 3]', '3', 'A duplicate inside a chain does not break it.'],
            ['nums = [9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]', '7', 'Two chains (-1 to 1 and 3 to 9); the longer one wins.'],
            ['nums = [1, 6, 2, 5, 8, 7, 10, 3]', '4', 'Example 1.'],
          ], { fn: ['longest_chain_brute_force', 'longest_chain_sorting', 'longest_chain_of_consecutive_numbers'] }),
          tips(
            "Explain why the hash-set version is linear even though it has a nested `while` loop: the inner loop only runs from chain starts, so across the whole run it advances at most $n$ times in total.",
            "Loop over the **set**, not the original array. With many duplicates of a chain start, looping over the array would repeat the same chain."
          ),
        ],
      },

      {
        id: 'geometric-sequence-triplets',
        title: 'Geometric Sequence Triplets',
        body: [
          p("A **geometric triplet** is three numbers `(x, x·r, x·r²)` for a fixed ratio `r`. Given an array `nums` and a positive integer ratio `r`, count the index triplets `i < j < k` such that `nums[j] = nums[i] · r` and `nums[k] = nums[j] · r`."),
          ex('nums = [2, 1, 2, 4, 8, 8], r = 2', '5', "(1, 2, 4) using indexes (1, 2, 3), plus (2, 4, 8) using either 2 (indexes 0 or 2) and either 8 (indexes 4 or 5): 1 + 2 × 2 = 5."),
          ex('nums = [3, 3, 3], r = 1', '1'),
          ap(1, 'Brute force: every triple of indexes'),
          p("Check every combination `i < j < k` directly. We can skip the innermost loop whenever `nums[j]` isn't `nums[i] · r`, but the worst case still tries every triple."),
          code(`
            from typing import List

            def geometric_sequence_triplets_brute_force(nums: List[int], r: int) -> int:
                n = len(nums)
                count = 0
                for i in range(n):
                    for j in range(i + 1, n):
                        if nums[j] != nums[i] * r:
                            continue
                        for k in range(j + 1, n):
                            if nums[k] == nums[j] * r:
                                count += 1
                return count
            `, `
            function geometricSequenceTripletsBruteForce(nums, r) {
              const n = nums.length;
              let count = 0;
              for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                  if (nums[j] !== nums[i] * r) continue;
                  for (let k = j + 1; k < n; k++) {
                    if (nums[k] === nums[j] * r) count++;
                  }
                }
              }
              return count;
            }
            `, `
            public long geometricSequenceTripletsBruteForce(int[] nums, int r) {
                int n = nums.length;
                long count = 0;
                for (int i = 0; i < n; i++) {
                    for (int j = i + 1; j < n; j++) {
                        if ((long) nums[j] != (long) nums[i] * r) continue;
                        for (int k = j + 1; k < n; k++) {
                            if ((long) nums[k] == (long) nums[j] * r) count++;
                        }
                    }
                }
                return count;
            }
            `),
          cost("$O(n^3)$.", "$O(1)$."),
          ap(2, 'Fix the middle element and count both sides'),
          p("A triplet is fully described by its **middle** element. If `nums[j] = y`, the triplet needs a `y / r` somewhere **to the left** of `j` and a `y · r` somewhere **to the right**. Every left choice combines with every right choice, so we count each side separately and multiply. Counting with two plain scans gives a quadratic algorithm:"),
          code(`
            from typing import List

            def geometric_sequence_triplets_middle_scan(nums: List[int], r: int) -> int:
                count = 0
                for j, y in enumerate(nums):
                    left = sum(1 for i in range(j) if nums[i] * r == y)
                    right = sum(1 for k in range(j + 1, len(nums)) if nums[k] == y * r)
                    count += left * right
                return count
            `, `
            function geometricSequenceTripletsMiddleScan(nums, r) {
              let count = 0;
              for (let j = 0; j < nums.length; j++) {
                const y = nums[j];
                let left = 0, right = 0;
                for (let i = 0; i < j; i++) if (nums[i] * r === y) left++;
                for (let k = j + 1; k < nums.length; k++) if (nums[k] === y * r) right++;
                count += left * right;
              }
              return count;
            }
            `, `
            public long geometricSequenceTripletsMiddleScan(int[] nums, int r) {
                long count = 0;
                for (int j = 0; j < nums.length; j++) {
                    long y = nums[j], left = 0, right = 0;
                    for (int i = 0; i < j; i++) if ((long) nums[i] * r == y) left++;
                    for (int k = j + 1; k < nums.length; k++) if (nums[k] == y * r) right++;
                    count += left * right;
                }
                return count;
            }
            `),
          cost("$O(n^2)$: two linear scans per middle element.", "$O(1)$."),
          ap(3, 'Middle element with two hash maps (optimal)'),
          p("The scans recount almost the same elements for every `j`. Instead, keep the counts in two hash maps and update them as `j` moves one step to the right. The number of triplets with middle `j` is then:"),
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
          vs([
            ['1. Every triple', '$O(n^3)$', '$O(1)$', 'Only to define the count.'],
            ['2. Middle element + scans', '$O(n^2)$', '$O(1)$', 'The key insight, without extra memory.'],
            ['3. Middle element + two hash maps', '$O(n)$', '$O(n)$', 'The expected answer.'],
          ]),
          tests([
            ['nums = [], r = 2', '0', 'Empty array.'],
            ['nums = [1, 2], r = 2', '0', 'Fewer than three numbers.'],
            ['nums = [4, 2, 1], r = 2', '0', 'The right values in the wrong order.'],
            ['nums = [3, 3, 3], r = 1', '1', 'Ratio 1: the triplet is three equal values.'],
            ['nums = [1, 1, 1, 1], r = 1', '4', 'Ratio 1 with four copies: choose any 3 of 4 positions.'],
            ['nums = [5, 10, 7, 20], r = 2', '1', 'An unrelated value sits between the triplet members.'],
            ['nums = [1, 3, 9, 9, 27, 81], r = 3', '6', 'A repeated middle value multiplies the choices.'],
            ['nums = [2, 1, 2, 4, 8, 8], r = 2', '5', 'Example 1.'],
          ], { fn: ['geometric_sequence_triplets_brute_force', 'geometric_sequence_triplets_middle_scan', 'geometric_sequence_triplets'] }),
          tips(
            "The *fix the middle element* idea works for many counting problems on triples (for example, counting increasing triplets): count matches on each side and multiply.",
            "Watch the update order in the hash-map version: remove `y` from `right` **before** counting and add it to `left` **after**. Otherwise `y` can pair with itself when `r = 1`.",
            "Counts can grow like $n^3$; use 64-bit integers in Java."
          ),
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
