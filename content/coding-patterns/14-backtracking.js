(function () {
  const { p, h, h3, ul, ol, note, ex, grid, state, code, impl, cx, pre, ap, cost, vs, tests, tips } = K;

  K.section({
    id: 'backtracking',
    title: 'Backtracking',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Backtracking',
        body: [
          p("**Backtracking** builds solutions one **choice** at a time and explores every possibility in a depth-first way. When a partial solution can't possibly lead to a valid answer, or once a complete answer has been recorded, we **undo the last choice** (backtrack) and try the next option. It's the systematic way to enumerate permutations, subsets, arrangements and paths."),
          h('The state-space tree'),
          p("Picture every decision as a branch. The root is the empty solution, each level makes one more choice, and leaves are complete candidates. Backtracking is just a DFS over this tree that never builds the tree explicitly."),
          pre(`
            choose subsets of [a, b]:

                          []
                  include a?    skip a?
                     [a]           []
                   /    \\        /    \\
                [a,b]   [a]    [b]     []      ← leaves = all 4 subsets
          `),
          h('The template'),
          p("Almost every backtracking solution has the same shape:"),
          code(`
            def backtrack(state, choices, result):
                if is_complete(state):
                    result.append(copy(state))   # record a solution
                    return
                for choice in choices:
                    if not is_valid(state, choice):
                        continue                 # prune
                    make(state, choice)          # choose
                    backtrack(state, next_choices(choice), result)  # explore
                    undo(state, choice)          # un-choose (backtrack)
            `, `
            function backtrack(state, choices, result) {
              if (isComplete(state)) {
                result.push([...state]); // record a copy of the solution
                return;
              }
              for (const choice of choices) {
                if (!isValid(state, choice)) continue; // prune
                make(state, choice);                   // choose
                backtrack(state, nextChoices(choice), result); // explore
                undo(state, choice);                   // un-choose (backtrack)
              }
            }
            `, `
            void backtrack(List<Integer> state, List<Integer> choices, List<List<Integer>> result) {
                if (isComplete(state)) {
                    result.add(new ArrayList<>(state)); // record a copy
                    return;
                }
                for (int choice : choices) {
                    if (!isValid(state, choice)) continue; // prune
                    state.add(choice);                     // choose
                    backtrack(state, nextChoices(choice), result); // explore
                    state.remove(state.size() - 1);        // un-choose
                }
            }
            `),
          note("Always store a **copy** of the current state when recording a solution. The state object keeps changing as the search continues."),
          h('When should I think of backtracking?'),
          ul(
            "The problem asks for **all** solutions: all permutations, subsets, combinations, placements, paths.",
            "It's a **constraint satisfaction** puzzle: Sudoku, N-Queens, crosswords, graph colouring.",
            "The input is small (often `n ≤ 15` or so), a hint that an exponential search is expected.",
            "**Pruning** matters: the earlier you detect a dead end, the more of the tree you skip."
          ),
          h('Real-world uses'),
          ul(
            "**Puzzle and game solvers** (Sudoku, crosswords, chess problems).",
            "**Constraint solvers** for scheduling and timetabling.",
            "**Regular-expression engines** that try alternatives and back up on failure.",
            "**Configuration search**: trying combinations of options under constraints."
          ),
        ],
      },

      {
        id: 'find-all-permutations',
        title: 'Find All Permutations',
        body: [
          p("Given an array of **distinct** integers, return **all of its permutations** (every possible ordering), in any order."),
          ex('nums = [4, 5, 6]', '[[4, 5, 6], [4, 6, 5], [5, 4, 6], [5, 6, 4], [6, 4, 5], [6, 5, 4]]'),
          ap(1, 'Iterative: insert each number into every position'),
          p("Grow the permutations one number at a time. The permutations of `[4]` are just `[[4]]`. To add 5, insert it into **every possible position** of every existing permutation: `[5, 4]` and `[4, 5]`. Adding 6 to each of those in all three positions gives all six permutations."),
          code(`
            from typing import List

            def find_all_permutations_insertion(nums: List[int]) -> List[List[int]]:
                perms = [[]]
                for x in nums:
                    # put x into every gap of every permutation built so far
                    perms = [p[:i] + [x] + p[i:] for p in perms for i in range(len(p) + 1)]
                return perms
            `, `
            function findAllPermutationsInsertion(nums) {
              let perms = [[]];
              for (const x of nums) {
                // put x into every gap of every permutation built so far
                perms = perms.flatMap(p => Array.from({ length: p.length + 1 }, (_, i) => [...p.slice(0, i), x, ...p.slice(i)]));
              }
              return perms;
            }
            `, `
            public List<List<Integer>> findAllPermutationsInsertion(int[] nums) {
                List<List<Integer>> perms = new ArrayList<>();
                perms.add(new ArrayList<>());
                for (int x : nums) {
                    List<List<Integer>> next = new ArrayList<>();
                    for (List<Integer> p : perms) {
                        for (int i = 0; i <= p.size(); i++) { // every gap
                            List<Integer> q = new ArrayList<>(p);
                            q.add(i, x);
                            next.add(q);
                        }
                    }
                    perms = next;
                }
                return perms;
            }
            `),
          cost("$O(n · n!)$: the output alone has $n!$ lists of length $n$.", "$O(n · n!)$ for the lists being built."),
          ap(2, 'Backtracking by swapping in place'),
          p("Instead of a separate candidate list, treat the array itself as the candidate. To fill position `start`, swap each of the remaining elements into it in turn, recurse on `start + 1`, and swap back. When `start` reaches the end, the array holds a full permutation."),
          code(`
            from typing import List

            def find_all_permutations_swap(nums: List[int]) -> List[List[int]]:
                nums = nums[:]
                result = []

                def backtrack(start: int) -> None:
                    if start == len(nums):
                        result.append(nums[:])
                        return
                    for i in range(start, len(nums)):
                        nums[start], nums[i] = nums[i], nums[start]  # choose nums[i] for this slot
                        backtrack(start + 1)
                        nums[start], nums[i] = nums[i], nums[start]  # undo

                backtrack(0)
                return result
            `, `
            function findAllPermutationsSwap(nums) {
              nums = [...nums];
              const result = [];
              const backtrack = start => {
                if (start === nums.length) { result.push([...nums]); return; }
                for (let i = start; i < nums.length; i++) {
                  [nums[start], nums[i]] = [nums[i], nums[start]]; // choose nums[i] for this slot
                  backtrack(start + 1);
                  [nums[start], nums[i]] = [nums[i], nums[start]]; // undo
                }
              };
              backtrack(0);
              return result;
            }
            `, `
            public List<List<Integer>> findAllPermutationsSwap(int[] nums) {
                List<List<Integer>> result = new ArrayList<>();
                permute(nums.clone(), 0, result);
                return result;
            }

            private void permute(int[] a, int start, List<List<Integer>> result) {
                if (start == a.length) {
                    List<Integer> p = new ArrayList<>();
                    for (int x : a) p.add(x);
                    result.add(p);
                    return;
                }
                for (int i = start; i < a.length; i++) {
                    int t = a[start]; a[start] = a[i]; a[i] = t; // choose a[i] for this slot
                    permute(a, start + 1, result);
                    t = a[start]; a[start] = a[i]; a[i] = t;     // undo
                }
            }
            `),
          cost("$O(n · n!)$.", "$O(n)$ besides the output: the recursion stack only."),
          ap(3, 'Backtracking with a used set (the classic template)'),
          p("Build a permutation one position at a time. For the first position we can pick any of the `n` numbers; for the second, any of the remaining `n - 1`; and so on. Each path from the root to a leaf of this decision tree is one permutation, so there are $n!$ leaves."),
          pre(`
                               []
                 /              |              \\
              [4]              [5]              [6]
             /   \\            /   \\            /   \\
          [4,5] [4,6]      [5,4] [5,6]      [6,4] [6,5]
            |     |          |     |          |     |
         [4,5,6] [4,6,5] [5,4,6] [5,6,4] [6,4,5] [6,5,4]
          `),
          p("A `used` set records which numbers are already in the current permutation. After exploring a choice, remove it from both the candidate and `used` so the next branch starts clean."),
          impl(`
            from typing import List

            def find_all_permutations(nums: List[int]) -> List[List[int]]:
                result = []
                candidate = []
                used = set()

                def backtrack() -> None:
                    if len(candidate) == len(nums):
                        result.append(candidate[:])     # record a copy
                        return
                    for x in nums:
                        if x in used:
                            continue
                        candidate.append(x)             # choose
                        used.add(x)
                        backtrack()                     # explore
                        candidate.pop()                 # un-choose
                        used.remove(x)

                backtrack()
                return result
            `, `
            function findAllPermutations(nums) {
              const result = [];
              const candidate = [];
              const used = new Set();
              const backtrack = () => {
                if (candidate.length === nums.length) {
                  result.push([...candidate]);          // record a copy
                  return;
                }
                for (const x of nums) {
                  if (used.has(x)) continue;
                  candidate.push(x);                    // choose
                  used.add(x);
                  backtrack();                          // explore
                  candidate.pop();                      // un-choose
                  used.delete(x);
                }
              };
              backtrack();
              return result;
            }
            `, `
            public List<List<Integer>> findAllPermutations(int[] nums) {
                List<List<Integer>> result = new ArrayList<>();
                backtrack(nums, new ArrayList<>(), new boolean[nums.length], result);
                return result;
            }

            private void backtrack(int[] nums, List<Integer> candidate, boolean[] used, List<List<Integer>> result) {
                if (candidate.size() == nums.length) {
                    result.add(new ArrayList<>(candidate)); // record a copy
                    return;
                }
                for (int i = 0; i < nums.length; i++) {
                    if (used[i]) continue;
                    candidate.add(nums[i]);                 // choose
                    used[i] = true;
                    backtrack(nums, candidate, used, result); // explore
                    candidate.remove(candidate.size() - 1); // un-choose
                    used[i] = false;
                }
            }
            `),
          cx("$O(n · n!)$. There are $n!$ permutations, and copying each one costs $O(n)$.",
            "$O(n)$ for the recursion and the current candidate, excluding the output."),
          vs([
            ['1. Insert into every gap', '$O(n · n!)$', '$O(n · n!)$', 'A neat iterative construction.'],
            ['2. Swap in place', '$O(n · n!)$', '$O(n)$ extra', 'The leanest backtracking version.'],
            ['3. Used set', '$O(n · n!)$', '$O(n)$ extra', 'The general template; extends easily to duplicates and constraints.'],
          ]),
          tests([
            ['nums = []', '[[]]', 'The empty array has exactly one ordering: itself.'],
            ['nums = [7]', '[[7]]', 'A single element.'],
            ['nums = [1, 2]', '[[1, 2], [2, 1]]', 'Two elements.'],
            ['nums = [-1, 0, 1]', '[[-1, 0, 1], [-1, 1, 0], [0, -1, 1], [0, 1, -1], [1, -1, 0], [1, 0, -1]]', 'Negative numbers and zero.'],
            ['nums = [4, 5, 6]', '[[4, 5, 6], [4, 6, 5], [5, 4, 6], [5, 6, 4], [6, 4, 5], [6, 5, 4]]', 'Example 1.'],
          ], { fn: ['find_all_permutations_insertion', 'find_all_permutations_swap', 'find_all_permutations'], cmp: 'sort' }),
          note("Permutations may be returned in any order, so the checker sorts both lists before comparing (the order *within* each permutation still matters)."),
          tips(
            "Follow-up with **duplicates** in the input: sort first, and skip a number if it equals the previous one and the previous one is not currently in use. That avoids generating the same permutation twice.",
            "Quote the output size ($n!$) when giving the complexity. No algorithm can beat the size of its output."
          ),
        ],
      },

      {
        id: 'find-all-subsets',
        title: 'Find All Subsets',
        body: [
          p("Given an array of **distinct** integers, return **all possible subsets** (the power set), including the empty set, in any order."),
          ex('nums = [4, 5, 6]', '[[], [4], [5], [6], [4, 5], [4, 6], [5, 6], [4, 5, 6]]'),
          ap(1, 'Iterative: every new number doubles the subsets'),
          p("Start with just the empty subset. Each new number can be **added to every subset found so far**, which doubles the list: `[[]]` → `[[], [4]]` → `[[], [4], [5], [4, 5]]` → …"),
          code(`
            from typing import List

            def find_all_subsets_iterative(nums: List[int]) -> List[List[int]]:
                subsets = [[]]
                for x in nums:
                    subsets += [s + [x] for s in subsets]  # every old subset, plus x
                return subsets
            `, `
            function findAllSubsetsIterative(nums) {
              let subsets = [[]];
              for (const x of nums) subsets = [...subsets, ...subsets.map(s => [...s, x])]; // plus x
              return subsets;
            }
            `, `
            public List<List<Integer>> findAllSubsetsIterative(int[] nums) {
                List<List<Integer>> subsets = new ArrayList<>();
                subsets.add(new ArrayList<>());
                for (int x : nums) {
                    int size = subsets.size();
                    for (int i = 0; i < size; i++) { // every old subset, plus x
                        List<Integer> s = new ArrayList<>(subsets.get(i));
                        s.add(x);
                        subsets.add(s);
                    }
                }
                return subsets;
            }
            `),
          cost("$O(n · 2^n)$.", "$O(n · 2^n)$ for the output."),
          ap(2, 'Bitmasks: count from 0 to 2^n - 1'),
          p("Each subset corresponds to an `n`-bit number: bit `i` says whether `nums[i]` is included. Counting from `0` to `2^n - 1` visits every combination of bits exactly once."),
          code(`
            from typing import List

            def find_all_subsets_bitmask(nums: List[int]) -> List[List[int]]:
                n = len(nums)
                return [[nums[i] for i in range(n) if mask >> i & 1]  # bit i set: include nums[i]
                        for mask in range(1 << n)]
            `, `
            function findAllSubsetsBitmask(nums) {
              const result = [];
              for (let mask = 0; mask < (1 << nums.length); mask++) {
                result.push(nums.filter((_, i) => (mask >> i) & 1)); // bit i set: include nums[i]
              }
              return result;
            }
            `, `
            public List<List<Integer>> findAllSubsetsBitmask(int[] nums) {
                List<List<Integer>> result = new ArrayList<>();
                for (int mask = 0; mask < (1 << nums.length); mask++) {
                    List<Integer> subset = new ArrayList<>();
                    for (int i = 0; i < nums.length; i++) if ((mask >> i & 1) == 1) subset.add(nums[i]); // bit i set
                    result.add(subset);
                }
                return result;
            }
            `),
          cost("$O(n · 2^n)$.", "$O(n)$ besides the output."),
          ap(3, 'Backtracking: include or exclude each element'),
          p("Each element faces exactly one yes/no decision: **include it or not**. With `n` elements that's $2^n$ combinations of decisions, and each combination is one subset. So the decision tree is a binary tree of depth `n`, and its leaves are the subsets."),
          pre(`
            index 0 (4):            include            exclude
                                    [4]                  []
            index 1 (5):      [4,5]     [4]        [5]       []
            index 2 (6):  [4,5,6][4,5] [4,6][4]  [5,6][5]  [6] []
          `),
          p("Recursively: at index `i`, first explore the branch that includes `nums[i]`, then undo it and explore the branch that excludes it. When `i` reaches the end of the array, record the current subset."),
          impl(`
            from typing import List

            def find_all_subsets(nums: List[int]) -> List[List[int]]:
                result = []
                subset = []

                def backtrack(i: int) -> None:
                    if i == len(nums):
                        result.append(subset[:])
                        return
                    subset.append(nums[i])   # include nums[i]
                    backtrack(i + 1)
                    subset.pop()             # exclude nums[i]
                    backtrack(i + 1)

                backtrack(0)
                return result
            `, `
            function findAllSubsets(nums) {
              const result = [];
              const subset = [];
              const backtrack = i => {
                if (i === nums.length) {
                  result.push([...subset]);
                  return;
                }
                subset.push(nums[i]); // include nums[i]
                backtrack(i + 1);
                subset.pop();         // exclude nums[i]
                backtrack(i + 1);
              };
              backtrack(0);
              return result;
            }
            `, `
            public List<List<Integer>> findAllSubsets(int[] nums) {
                List<List<Integer>> result = new ArrayList<>();
                backtrack(nums, 0, new ArrayList<>(), result);
                return result;
            }

            private void backtrack(int[] nums, int i, List<Integer> subset, List<List<Integer>> result) {
                if (i == nums.length) {
                    result.add(new ArrayList<>(subset));
                    return;
                }
                subset.add(nums[i]);                    // include nums[i]
                backtrack(nums, i + 1, subset, result);
                subset.remove(subset.size() - 1);       // exclude nums[i]
                backtrack(nums, i + 1, subset, result);
            }
            `),
          cx("$O(n · 2^n)$. There are $2^n$ subsets, each copied in $O(n)$.",
            "$O(n)$ for the recursion depth and current subset, excluding the output."),
          vs([
            ['1. Iterative doubling', '$O(n · 2^n)$', '$O(n · 2^n)$', 'Shortest code.'],
            ['2. Bitmasks', '$O(n · 2^n)$', '$O(n)$ extra', 'Handy when subsets must be indexed or enumerated in a loop.'],
            ['3. Include / exclude backtracking', '$O(n · 2^n)$', '$O(n)$ extra', 'The template that adapts to constraints (subset sums, sizes, duplicates).'],
          ]),
          tests([
            ['nums = []', '[[]]', 'Only the empty set.'],
            ['nums = [9]', '[[], [9]]', 'One element: two subsets.'],
            ['nums = [1, 2]', '[[], [1], [2], [1, 2]]', 'Two elements: four subsets.'],
            ['nums = [-3, 0]', '[[], [-3], [0], [-3, 0]]', 'Negative numbers and zero are ordinary elements.'],
            ['nums = [4, 5, 6]', '[[], [4], [5], [6], [4, 5], [4, 6], [5, 6], [4, 5, 6]]', 'Example 1.'],
          ], { fn: ['find_all_subsets_iterative', 'find_all_subsets_bitmask', 'find_all_subsets'], cmp: 'sort2' }),
          note("Subsets may come back in any order, and the order inside a subset doesn't matter, so the checker sorts both levels before comparing."),
          tips(
            "Follow-up with duplicates (*subsets II*): sort the input, and in the include/exclude recursion, when you skip a value, skip all its copies too."
          ),
        ],
      },

      {
        id: 'n-queens',
        title: 'N Queens',
        body: [
          p("Place `n` chess queens on an `n × n` board so that **no two queens attack each other**: no two share a row, a column, or a diagonal. Return the **number of distinct arrangements**."),
          ex('n = 4', '2'),
          ex('n = 1', '1'),
          K.row(
            grid([['', 'Q', '', ''], ['', '', '', 'Q'], ['Q', '', '', ''], ['', '', 'Q', '']], { hl: [[0, 1], [1, 3], [2, 0], [3, 2]], cap: 'solution 1' }),
            grid([['', '', 'Q', ''], ['Q', '', '', ''], ['', '', '', 'Q'], ['', 'Q', '', '']], { hl: [[0, 2], [1, 0], [2, 3], [3, 1]], cap: 'solution 2' })
          ),
          p("Every row must contain exactly one queen, and so must every column. So an arrangement is really a choice of **one column per row**, with all columns different."),
          ap(1, 'Brute force: try every column permutation'),
          p("Generate every permutation of the columns `0 … n-1` (row `r` gets column `perm[r]`). Rows and columns are automatically distinct, so only the diagonals need checking: queens in rows `i` and `j` share a diagonal when `|perm[i] - perm[j]| == |i - j|`."),
          code(`
            from itertools import permutations

            def n_queens_brute_force(n: int) -> int:
                count = 0
                for perm in permutations(range(n)):  # perm[row] = column
                    if all(abs(perm[i] - perm[j]) != j - i
                           for i in range(n) for j in range(i + 1, n)):
                        count += 1
                return count
            `, `
            function nQueensBruteForce(n) {
              const perm = Array.from({ length: n }, (_, i) => i); // perm[row] = column
              let count = 0;
              const valid = () => {
                for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(perm[i] - perm[j]) === j - i) return false;
                return true;
              };
              const generate = k => { // every permutation of perm[k..]
                if (k === n) { if (valid()) count++; return; }
                for (let i = k; i < n; i++) {
                  [perm[k], perm[i]] = [perm[i], perm[k]];
                  generate(k + 1);
                  [perm[k], perm[i]] = [perm[i], perm[k]];
                }
              };
              generate(0);
              return count;
            }
            `, `
            public int nQueensBruteForce(int n) {
                int[] perm = new int[n]; // perm[row] = column
                for (int i = 0; i < n; i++) perm[i] = i;
                return countValid(perm, 0);
            }

            private int countValid(int[] perm, int k) { // every permutation of perm[k..]
                int n = perm.length;
                if (k == n) {
                    for (int i = 0; i < n; i++)
                        for (int j = i + 1; j < n; j++) if (Math.abs(perm[i] - perm[j]) == j - i) return 0;
                    return 1;
                }
                int count = 0;
                for (int i = k; i < n; i++) {
                    int t = perm[k]; perm[k] = perm[i]; perm[i] = t;
                    count += countValid(perm, k + 1);
                    t = perm[k]; perm[k] = perm[i]; perm[i] = t;
                }
                return count;
            }
            `),
          cost("$O(n! · n^2)$: every permutation is generated in full before it's checked.", "$O(n)$."),
          p("Most permutations fail in their first few rows, yet we build them completely. Backtracking checks each queen **as it's placed** and abandons a partial board the moment it's broken."),
          ap(2, 'Backtracking, scanning the earlier queens'),
          p("Place queens **row by row**, choosing a column for each. Before placing, compare the square with every queen already placed (same column, or same diagonal). If no column works, backtrack to the previous row and move that queen."),
          code(`
            def n_queens_scan(n: int) -> int:
                queens = []  # queens[row] = column of the queen in that row

                def safe(row: int, col: int) -> bool:
                    return all(c != col and abs(c - col) != row - r for r, c in enumerate(queens))

                def place(row: int) -> int:
                    if row == n:
                        return 1
                    count = 0
                    for col in range(n):
                        if safe(row, col):
                            queens.append(col)
                            count += place(row + 1)
                            queens.pop()  # backtrack
                    return count

                return place(0)
            `, `
            function nQueensScan(n) {
              const queens = []; // queens[row] = column of the queen in that row
              const safe = (row, col) => queens.every((c, r) => c !== col && Math.abs(c - col) !== row - r);
              const place = row => {
                if (row === n) return 1;
                let count = 0;
                for (let col = 0; col < n; col++) {
                  if (safe(row, col)) { queens.push(col); count += place(row + 1); queens.pop(); } // backtrack
                }
                return count;
              };
              return place(0);
            }
            `, `
            public int nQueensScan(int n) {
                return place(new int[n], 0);
            }

            private int place(int[] queens, int row) { // queens[r] = column of the queen in row r
                int n = queens.length;
                if (row == n) return 1;
                int count = 0;
                for (int col = 0; col < n; col++) {
                    boolean safe = true;
                    for (int r = 0; r < row && safe; r++) safe = queens[r] != col && Math.abs(queens[r] - col) != row - r;
                    if (safe) { queens[row] = col; count += place(queens, row + 1); } // overwritten when backtracking
                }
                return count;
            }
            `),
          cost("$O(n! · n)$ in the worst case, with heavy pruning in practice.", "$O(n)$."),
          p("Each safety check still costs $O(n)$. Remembering which columns and diagonals are taken makes it $O(1)$."),
          ap(3, 'Backtracking with column and diagonal sets (optimal)'),
          h3('Checking diagonals in O(1)'),
          p("All squares on the same **↘ diagonal** share the same `row - col`, and all squares on the same **↙ anti-diagonal** share the same `row + col`. So three sets (`cols`, `diagonals`, `anti_diagonals`) tell us instantly whether a square is attacked."),
          grid([[0, -1, -2, -3], [1, 0, -1, -2], [2, 1, 0, -1], [3, 2, 1, 0]], { hl2: [[0, 0], [1, 1], [2, 2], [3, 3]], cap: 'row - col (one diagonal highlighted)' }),
          impl(`
            def n_queens(n: int) -> int:
                cols, diagonals, anti_diagonals = set(), set(), set()

                def place(row: int) -> int:
                    if row == n:
                        return 1                      # all queens placed
                    count = 0
                    for col in range(n):
                        if col in cols or (row - col) in diagonals or (row + col) in anti_diagonals:
                            continue                  # square is attacked
                        cols.add(col)
                        diagonals.add(row - col)
                        anti_diagonals.add(row + col)
                        count += place(row + 1)
                        cols.remove(col)              # backtrack
                        diagonals.remove(row - col)
                        anti_diagonals.remove(row + col)
                    return count

                return place(0)
            `, `
            function nQueens(n) {
              const cols = new Set(), diagonals = new Set(), antiDiagonals = new Set();
              const place = row => {
                if (row === n) return 1;            // all queens placed
                let count = 0;
                for (let col = 0; col < n; col++) {
                  if (cols.has(col) || diagonals.has(row - col) || antiDiagonals.has(row + col)) continue;
                  cols.add(col);
                  diagonals.add(row - col);
                  antiDiagonals.add(row + col);
                  count += place(row + 1);
                  cols.delete(col);                 // backtrack
                  diagonals.delete(row - col);
                  antiDiagonals.delete(row + col);
                }
                return count;
              };
              return place(0);
            }
            `, `
            public int nQueens(int n) {
                return place(0, n, new boolean[n], new boolean[2 * n], new boolean[2 * n]);
            }

            // diag index: row - col + n (shifted to be non-negative); anti index: row + col
            private int place(int row, int n, boolean[] cols, boolean[] diag, boolean[] anti) {
                if (row == n) return 1;                       // all queens placed
                int count = 0;
                for (int col = 0; col < n; col++) {
                    if (cols[col] || diag[row - col + n] || anti[row + col]) continue;
                    cols[col] = diag[row - col + n] = anti[row + col] = true;
                    count += place(row + 1, n, cols, diag, anti);
                    cols[col] = diag[row - col + n] = anti[row + col] = false; // backtrack
                }
                return count;
            }
            `),
          cx("$O(n!)$. The first row has $n$ options, the second at most $n - 1$ that aren't in the same column, and so on; diagonal pruning cuts this further in practice.",
            "$O(n)$ for the sets and the recursion depth."),
          vs([
            ['1. Check every permutation', '$O(n! · n^2)$', '$O(n)$', 'Tiny boards.'],
            ['2. Backtracking + scan', '$O(n! · n)$', '$O(n)$', 'Prunes early; simple checks.'],
            ['3. Backtracking + sets', '$O(n!)$', '$O(n)$', 'The expected answer (bitmasks make it faster still).'],
          ]),
          tests([
            ['n = 1', '1', 'Example 2: one queen on a 1 × 1 board.'],
            ['n = 2', '0', 'No arrangement exists.'],
            ['n = 3', '0', 'Still impossible.'],
            ['n = 4', '2', 'Example 1.'],
            ['n = 5', '10', 'Odd board size.'],
            ['n = 6', '4', 'More squares, fewer solutions than n = 5.'],
            ['n = 8', '92', 'The classic chessboard.'],
          ], { fn: ['n_queens_brute_force', 'n_queens_scan', 'n_queens'] }),
          tips(
            "If asked for the boards themselves, keep `queens[row] = col` and build the strings of `.` and `Q` when `row == n`.",
            "Bitmask version: keep three integers for columns and the two diagonal directions, shifting the diagonal masks by one bit per row. It's the fastest practical solver."
          ),
        ],
      },

      {
        id: 'combinations-of-a-sum',
        title: 'Combinations of a Sum',
        body: [
          p("Given an array of **distinct positive** integers and a `target`, return **all unique combinations** of numbers that sum to the target. Each number may be used **any number of times**. Two combinations are the same if they use the same numbers with the same counts, regardless of order."),
          ex('nums = [1, 2, 3], target = 4', '[[1, 1, 1, 1], [1, 1, 2], [1, 3], [2, 2]]'),
          ex('nums = [5], target = 3', '[]'),
          ap(1, 'Dynamic programming over the target'),
          p("Build the answer bottom-up. Let `dp[t]` hold every combination that sums to `t` using the numbers processed so far. Process the numbers one at a time **in the outer loop**: for number `x`, every combination for `t - x` extends to a combination for `t`. Because `x` is added only after all the smaller-index numbers, each combination is built in one fixed order, so no duplicates appear."),
          code(`
            from typing import List

            def combinations_of_a_sum_dp(nums: List[int], target: int) -> List[List[int]]:
                dp = [[] for _ in range(target + 1)]  # dp[t] = combinations summing to t
                dp[0] = [[]]
                for x in nums:  # numbers outside: each combination is built in one order
                    for t in range(x, target + 1):
                        for combo in dp[t - x]:
                            dp[t].append(combo + [x])
                return dp[target]
            `, `
            function combinationsOfASumDp(nums, target) {
              const dp = Array.from({ length: target + 1 }, () => []); // dp[t] = combinations summing to t
              dp[0] = [[]];
              for (const x of nums) { // numbers outside: each combination is built in one order
                for (let t = x; t <= target; t++) {
                  for (const combo of dp[t - x]) dp[t].push([...combo, x]);
                }
              }
              return dp[target];
            }
            `, `
            public List<List<Integer>> combinationsOfASumDp(int[] nums, int target) {
                List<List<List<Integer>>> dp = new ArrayList<>(); // dp.get(t) = combinations summing to t
                for (int t = 0; t <= target; t++) dp.add(new ArrayList<>());
                dp.get(0).add(new ArrayList<>());
                for (int x : nums) { // numbers outside: each combination is built in one order
                    for (int t = x; t <= target; t++) {
                        for (List<Integer> combo : dp.get(t - x)) {
                            List<Integer> c = new ArrayList<>(combo);
                            c.add(x);
                            dp.get(t).add(c);
                        }
                    }
                }
                return dp.get(target);
            }
            `),
          cost("Proportional to the total size of all partial combinations for every `t ≤ target`, which can be far more than the final answer.", "Every `dp[t]` list is kept, even for sums that never lead to the target."),
          p("The table stores many partial combinations that are never needed. Backtracking builds only the combinations on the way to the target, one at a time."),
          ap(2, 'Backtracking with a start index (optimal)'),
          p("Build combinations by choosing numbers and tracking the remaining target. The danger is **duplicates**: `[1, 3]` and `[3, 1]` are the same combination. We avoid them by only ever choosing numbers **at or after** the index of the last number chosen. Each combination is then built in non-decreasing index order, so it's generated exactly once."),
          ul(
            "If the remaining target is 0, record the combination.",
            "If it's negative, this path overshot: stop (prune).",
            "Otherwise, for each index `i` from `start` onward: choose `nums[i]`, recurse with `start = i` (the same number can be reused), then undo."
          ),
          pre(`
            target 4, start at index 0
            [1] → [1,1] → [1,1,1] → [1,1,1,1] ✓
                                  → [1,1,1,2] ✗ (5)
                        → [1,1,2] ✓
                        → [1,1,3] ✗
                → [1,2] → [1,2,2] ✗ …          (never goes back to 1 after 2)
                → [1,3] ✓
            [2] → [2,2] ✓
            [3] → [3,3] ✗
          `),
          note("Sorting the numbers first lets you **break** out of the loop as soon as a number exceeds the remaining target, because every later number is larger too."),
          impl(`
            from typing import List

            def combinations_of_a_sum(nums: List[int], target: int) -> List[List[int]]:
                nums = sorted(nums)
                result = []
                combo = []

                def backtrack(start: int, remaining: int) -> None:
                    if remaining == 0:
                        result.append(combo[:])
                        return
                    for i in range(start, len(nums)):
                        if nums[i] > remaining:
                            break                       # every later number is too big as well
                        combo.append(nums[i])
                        backtrack(i, remaining - nums[i])  # i, not i + 1: reuse allowed
                        combo.pop()

                backtrack(0, target)
                return result
            `, `
            function combinationsOfASum(nums, target) {
              const sorted = [...nums].sort((a, b) => a - b);
              const result = [];
              const combo = [];
              const backtrack = (start, remaining) => {
                if (remaining === 0) {
                  result.push([...combo]);
                  return;
                }
                for (let i = start; i < sorted.length; i++) {
                  if (sorted[i] > remaining) break;    // later numbers are too big as well
                  combo.push(sorted[i]);
                  backtrack(i, remaining - sorted[i]); // i, not i + 1: reuse allowed
                  combo.pop();
                }
              };
              backtrack(0, target);
              return result;
            }
            `, `
            public List<List<Integer>> combinationsOfASum(int[] nums, int target) {
                int[] sorted = nums.clone();
                Arrays.sort(sorted);
                List<List<Integer>> result = new ArrayList<>();
                backtrack(sorted, 0, target, new ArrayList<>(), result);
                return result;
            }

            private void backtrack(int[] nums, int start, int remaining, List<Integer> combo, List<List<Integer>> result) {
                if (remaining == 0) {
                    result.add(new ArrayList<>(combo));
                    return;
                }
                for (int i = start; i < nums.length; i++) {
                    if (nums[i] > remaining) break;           // later numbers are too big as well
                    combo.add(nums[i]);
                    backtrack(nums, i, remaining - nums[i], combo, result); // reuse allowed
                    combo.remove(combo.size() - 1);
                }
            }
            `),
          cx("Exponential: roughly $O(n^{t/m})$, where $t$ is the target and $m$ the smallest number, since that bounds the depth of the tree and each level branches up to $n$ ways.",
            "$O(t/m)$ for the recursion depth and current combination, excluding the output."),
          vs([
            ['1. DP over the target', 'large: stores combinations for every sum', 'large', 'When you need answers for many targets at once.'],
            ['2. Backtracking with a start index', 'exponential, proportional to the search tree', '$O(target / min)$ recursion', 'The expected answer.'],
          ]),
          tests([
            ['nums = [1], target = 0', '[[]]', 'Target 0: only the empty combination.'],
            ['nums = [5], target = 3', '[]', 'Example 2: every number is too big.'],
            ['nums = [2], target = 4', '[[2, 2]]', 'One number reused.'],
            ['nums = [3, 7], target = 7', '[[7]]', 'Only one combination works.'],
            ['nums = [3, 4, 5], target = 9', '[[3, 3, 3], [4, 5]]', 'Reuse and a mixed pair.'],
            ['nums = [1, 2, 3], target = 4', '[[1, 1, 1, 1], [1, 1, 2], [1, 3], [2, 2]]', 'Example 1.'],
          ], { fn: ['combinations_of_a_sum_dp', 'combinations_of_a_sum'], cmp: 'sort2' }),
          note("Combinations may be returned in any order, and so may the numbers inside each one, so the checker sorts both levels."),
          tips(
            "If each number may be used **at most once** (*combination sum II*), recurse with `start = i + 1` instead of `i`, and skip equal neighbours after sorting.",
            "If only the **number** of combinations is needed, don't list them: a counting DP (similar to [Minimum Coin Combination](#/dynamic-programming/minimum-coin-combination)) answers it in $O(n · target)$."
          ),
        ],
      },

      {
        id: 'phone-keypad-combinations',
        title: 'Phone Keypad Combinations',
        body: [
          p("On an old phone keypad, the digits 2-9 each map to several letters (2 → abc, 3 → def, 4 → ghi, 5 → jkl, 6 → mno, 7 → pqrs, 8 → tuv, 9 → wxyz). Given a string of digits, return **every letter string** it could represent. Return an empty list for an empty input."),
          ex('digits = "47"', '["gp", "gq", "gr", "gs", "hp", "hq", "hr", "hs", "ip", "iq", "ir", "is"]'),
          ex('digits = ""', '[]'),
          p("Each digit independently contributes one of its letters, so the answers are the **Cartesian product** of the letter groups."),
          ap(1, 'Iterative: extend every partial string, digit by digit'),
          p("Start with the list `[\"\"]`. For each digit, replace the list by every existing string followed by every letter of that digit. After the last digit, the list holds every combination."),
          code(`
            from typing import List

            KEYPAD = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
                      '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}

            def phone_keypad_iterative(digits: str) -> List[str]:
                if not digits:
                    return []
                combos = ['']
                for d in digits:
                    combos = [s + letter for s in combos for letter in KEYPAD[d]]
                return combos
            `, `
            function phoneKeypadIterative(digits) {
              const keypad = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
              if (!digits) return [];
              let combos = [''];
              for (const d of digits) combos = combos.flatMap(s => [...keypad[d]].map(letter => s + letter));
              return combos;
            }
            `, `
            public List<String> phoneKeypadIterative(String digits) {
                String[] keypad = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
                if (digits.isEmpty()) return new ArrayList<>();
                List<String> combos = List.of("");
                for (char d : digits.toCharArray()) {
                    List<String> next = new ArrayList<>();
                    for (String s : combos) for (char letter : keypad[d - '0'].toCharArray()) next.add(s + letter);
                    combos = next;
                }
                return combos;
            }
            `),
          cost("$O(n · 4^n)$.", "$O(n · 4^n)$: all partial strings of the current length are kept."),
          ap(2, 'Backtracking, one position at a time (optimal)'),
          p("Backtracking builds the strings position by position: for digit `i`, try each of its letters, recurse for digit `i + 1`, then undo. Only one partial string exists at a time."),
          pre(`
                       ""
                 /      |      \\
               g        h        i           digit 4
             / | | \\   ...      ...
            gp gq gr gs                      digit 7
          `),
          impl(`
            from typing import List

            KEYPAD = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
                      '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}

            def phone_keypad_combinations(digits: str) -> List[str]:
                if not digits:
                    return []
                result = []
                letters = []

                def backtrack(i: int) -> None:
                    if i == len(digits):
                        result.append(''.join(letters))
                        return
                    for letter in KEYPAD[digits[i]]:
                        letters.append(letter)
                        backtrack(i + 1)
                        letters.pop()

                backtrack(0)
                return result
            `, `
            const KEYPAD = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };

            function phoneKeypadCombinations(digits) {
              if (!digits) return [];
              const result = [];
              const letters = [];
              const backtrack = i => {
                if (i === digits.length) {
                  result.push(letters.join(''));
                  return;
                }
                for (const letter of KEYPAD[digits[i]]) {
                  letters.push(letter);
                  backtrack(i + 1);
                  letters.pop();
                }
              };
              backtrack(0);
              return result;
            }
            `, `
            private static final String[] KEYPAD = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

            public List<String> phoneKeypadCombinations(String digits) {
                List<String> result = new ArrayList<>();
                if (digits.isEmpty()) return result;
                backtrack(digits, 0, new StringBuilder(), result);
                return result;
            }

            private void backtrack(String digits, int i, StringBuilder letters, List<String> result) {
                if (i == digits.length()) {
                    result.add(letters.toString());
                    return;
                }
                for (char letter : KEYPAD[digits.charAt(i) - '0'].toCharArray()) {
                    letters.append(letter);
                    backtrack(digits, i + 1, letters, result);
                    letters.deleteCharAt(letters.length() - 1);
                }
            }
            `),
          cx("$O(n · 4^n)$. Each digit has at most 4 letters, giving up to $4^n$ strings of length $n$.",
            "$O(n)$ for the recursion depth, excluding the output."),
          vs([
            ['1. Iterative expansion', '$O(n · 4^n)$', '$O(n · 4^n)$', 'Short and clear.'],
            ['2. Backtracking', '$O(n · 4^n)$', '$O(n)$ extra', 'The expected answer; one string in progress at a time.'],
          ]),
          tests([
            ['digits = ""', '[]', 'Example 2: no digits, no strings.'],
            ['digits = "2"', '["a", "b", "c"]', 'One digit.'],
            ['digits = "9"', '["w", "x", "y", "z"]', 'A four-letter digit.'],
            ['digits = "22"', '["aa", "ab", "ac", "ba", "bb", "bc", "ca", "cb", "cc"]', 'A repeated digit.'],
            ['digits = "79"', '["pw", "px", "py", "pz", "qw", "qx", "qy", "qz", "rw", "rx", "ry", "rz", "sw", "sx", "sy", "sz"]', 'Two four-letter digits: 16 strings.'],
            ['digits = "47"', '["gp", "gq", "gr", "gs", "hp", "hq", "hr", "hs", "ip", "iq", "ir", "is"]', 'Example 1.'],
          ], { fn: ['phone_keypad_iterative', 'phone_keypad_combinations'], cmp: 'sort' }),
          tips(
            "In Python, `itertools.product(*(KEYPAD[d] for d in digits))` produces the same Cartesian product in one line. It's worth mentioning, but write the backtracking version too.",
            "Ask about `0` and `1`, which map to no letters. Decide with the interviewer whether they're invalid or should be skipped."
          ),
        ],
      },
    ],
  });
})();
