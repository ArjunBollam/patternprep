(function () {
  const { p, h, h3, ul, ol, note, ex, grid, state, code, impl, cx, pre } = K;

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
          h('Intuition'),
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
        ],
      },

      {
        id: 'find-all-subsets',
        title: 'Find All Subsets',
        body: [
          p("Given an array of **distinct** integers, return **all possible subsets** (the power set), including the empty set, in any order."),
          ex('nums = [4, 5, 6]', '[[], [4], [5], [6], [4, 5], [4, 6], [5, 6], [4, 5, 6]]'),
          h('Intuition'),
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
          h('Intuition'),
          p("Every row must contain exactly one queen, so place queens **row by row**, choosing a column for each. Before placing, check that the column and both diagonals through that square are free. If no column works, backtrack to the previous row and move that queen."),
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
        ],
      },

      {
        id: 'combinations-of-a-sum',
        title: 'Combinations of a Sum',
        body: [
          p("Given an array of **distinct positive** integers and a `target`, return **all unique combinations** of numbers that sum to the target. Each number may be used **any number of times**. Two combinations are the same if they use the same numbers with the same counts, regardless of order."),
          ex('nums = [1, 2, 3], target = 4', '[[1, 1, 1, 1], [1, 1, 2], [1, 3], [2, 2]]'),
          ex('nums = [5], target = 3', '[]'),
          h('Intuition'),
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
        ],
      },

      {
        id: 'phone-keypad-combinations',
        title: 'Phone Keypad Combinations',
        body: [
          p("On an old phone keypad, the digits 2-9 each map to several letters (2 → abc, 3 → def, 4 → ghi, 5 → jkl, 6 → mno, 7 → pqrs, 8 → tuv, 9 → wxyz). Given a string of digits, return **every letter string** it could represent. Return an empty list for an empty input."),
          ex('digits = "47"', '["gp", "gq", "gr", "gs", "hp", "hq", "hr", "hs", "ip", "iq", "ir", "is"]'),
          ex('digits = ""', '[]'),
          h('Intuition'),
          p("Each digit independently contributes one of its letters, so the answers are the **Cartesian product** of the letter groups. Backtracking builds them position by position: for digit `i`, try each of its letters, recurse for digit `i + 1`, then undo."),
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
        ],
      },
    ],
  });
})();
