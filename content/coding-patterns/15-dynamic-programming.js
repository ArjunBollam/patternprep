(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, state, code, impl, cx, table, pre, rg, ap, cost, vs, tests, tips } = K;

  K.section({
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Dynamic Programming',
        body: [
          p("**Dynamic programming (DP)** solves a problem by breaking it into **overlapping subproblems**, solving each subproblem **once**, and reusing the stored answers. It applies when the problem has **optimal substructure**: the best answer for the whole can be built from the best answers to smaller pieces."),
          h('A tiny example: Fibonacci'),
          p("The naive recursion `fib(n) = fib(n - 1) + fib(n - 2)` recomputes the same values again and again, which takes exponential time:"),
          pre(`
                        fib(5)
                   /             \\
               fib(4)           fib(3)        ← fib(3) computed twice,
              /      \\         /      \\         fib(2) three times …
          fib(3)   fib(2)   fib(2)  fib(1)
          `),
          p("Storing each result the first time it's computed makes it $O(n)$."),
          h('Two ways to write DP'),
          table(['', 'Top-down (memoisation)', 'Bottom-up (tabulation)'], [
            ['Idea', 'write the natural recursion, cache results in a map/array', 'fill a table from the smallest subproblems upward'],
            ['Pros', 'easy to derive; only computes needed states', 'no recursion limit; easy to optimise space'],
            ['Cons', 'recursion depth; call overhead', 'must figure out a valid fill order'],
          ]),
          h('A recipe for DP problems'),
          ol(
            "**Define the state.** What does `dp[i]` (or `dp[i][j]`) mean, in words? E.g. \"the number of ways to reach step `i`\".",
            "**Find the recurrence.** How does a state depend on smaller states? Think about the **last decision** made.",
            "**Set the base cases.** The smallest states whose answers are obvious.",
            "**Choose the order** so that every state's dependencies are computed first, and identify where the final answer lives.",
            "**Optimise space** if each row only depends on the previous one or two."
          ),
          h('When should I think of DP?'),
          ul(
            "The question asks for the **number of ways**, the **minimum / maximum** cost, or **whether something is possible**.",
            "A brute-force recursion makes the **same calls repeatedly**.",
            "Decisions are made **in sequence** (take/skip an item, move right/down, match/skip a character)."
          ),
          h('Real-world uses'),
          ul(
            "**Diff tools** (like `git diff`) use longest-common-subsequence style DP.",
            "**Spell checkers and DNA alignment** use edit-distance DP.",
            "**Speech recognition** and decoding use the Viterbi algorithm.",
            "**Resource allocation** (budgeting, cargo loading) uses knapsack-style DP."
          ),
          h('Template'),
          code(`
            from functools import lru_cache

            def fib(n: int) -> int:
                @lru_cache(maxsize=None)         # top-down: memoised recursion
                def go(i: int) -> int:
                    return i if i < 2 else go(i - 1) + go(i - 2)
                return go(n)

            def fib_bottom_up(n: int) -> int:     # bottom-up with O(1) space
                prev, curr = 0, 1
                for _ in range(n):
                    prev, curr = curr, prev + curr
                return prev
            `, `
            function fib(n, memo = new Map()) {     // top-down: memoised recursion
              if (n < 2) return n;
              if (!memo.has(n)) memo.set(n, fib(n - 1, memo) + fib(n - 2, memo));
              return memo.get(n);
            }

            function fibBottomUp(n) {               // bottom-up with O(1) space
              let prev = 0, curr = 1;
              for (let i = 0; i < n; i++) [prev, curr] = [curr, prev + curr];
              return prev;
            }
            `, `
            long fib(int n, Map<Integer, Long> memo) { // top-down: memoised recursion
                if (n < 2) return n;
                if (!memo.containsKey(n)) memo.put(n, fib(n - 1, memo) + fib(n - 2, memo));
                return memo.get(n);
            }

            long fibBottomUp(int n) {                  // bottom-up with O(1) space
                long prev = 0, curr = 1;
                for (int i = 0; i < n; i++) {
                    long next = prev + curr;
                    prev = curr;
                    curr = next;
                }
                return prev;
            }
            `),
        ],
      },

      {
        id: 'climbing-stairs',
        title: 'Climbing Stairs',
        body: [
          p("A staircase has `n` steps. Each move climbs **either 1 or 2 steps**. In how many **distinct ways** can you reach the top?"),
          ex('n = 4', '5', '1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2.'),
          ex('n = 1', '1'),
          p("Think about the **last move**. To stand on step `i`, you either came from step `i - 1` (a 1-step) or from step `i - 2` (a 2-step). Those two groups of routes don't overlap and together cover every route, so:"),
          state('ways(i) = ways(i - 1) + ways(i - 2)\nways(0) = 1 (stand still),  ways(1) = 1'),
          ap(1, 'Plain recursion'),
          p("Translate the recurrence directly into a recursive function."),
          code(`
            def climbing_stairs_recursive(n: int) -> int:
                if n <= 1:
                    return 1
                return climbing_stairs_recursive(n - 1) + climbing_stairs_recursive(n - 2)
            `, `
            function climbingStairsRecursive(n) {
              if (n <= 1) return 1;
              return climbingStairsRecursive(n - 1) + climbingStairsRecursive(n - 2);
            }
            `, `
            public int climbingStairsRecursive(int n) {
                if (n <= 1) return 1;
                return climbingStairsRecursive(n - 1) + climbingStairsRecursive(n - 2);
            }
            `),
          cost("$O(2^n)$ (more precisely about $1.6^n$): the same subproblems are solved over and over, e.g. `ways(2)` is recomputed for every route that passes through it.", "$O(n)$ for the recursion."),
          ap(2, 'Top-down with memoisation'),
          p("Store each answer the first time it is computed, and return the stored value afterwards. Every `ways(i)` is then computed once."),
          code(`
            from functools import lru_cache

            def climbing_stairs_memo(n: int) -> int:
                @lru_cache(maxsize=None)
                def ways(i: int) -> int:
                    return 1 if i <= 1 else ways(i - 1) + ways(i - 2)

                return ways(n)
            `, `
            function climbingStairsMemo(n, memo = new Map()) {
              if (n <= 1) return 1;
              if (!memo.has(n)) memo.set(n, climbingStairsMemo(n - 1, memo) + climbingStairsMemo(n - 2, memo));
              return memo.get(n);
            }
            `, `
            public int climbingStairsMemo(int n) {
                return ways(n, new HashMap<>());
            }

            private int ways(int i, Map<Integer, Integer> memo) {
                if (i <= 1) return 1;
                Integer cached = memo.get(i);
                if (cached != null) return cached;
                int result = ways(i - 1, memo) + ways(i - 2, memo);
                memo.put(i, result);
                return result;
            }
            `),
          cost("$O(n)$.", "$O(n)$ for the memo and the recursion stack."),
          ap(3, 'Bottom-up with two variables (optimal)'),
          arr([1, 1, 2, 3, 5], { name: 'ways', hl: [4], hl2: [2, 3], state: 'ways(4) = ways(3) + ways(2) = 3 + 2 = 5' }),
          p("That's the Fibonacci recurrence. Each value only depends on the previous two, so we only need two variables."),
          impl(`
            def climbing_stairs(n: int) -> int:
                one_back, two_back = 1, 1   # ways(i - 1), ways(i - 2)
                for _ in range(2, n + 1):
                    one_back, two_back = one_back + two_back, one_back
                return one_back
            `, `
            function climbingStairs(n) {
              let oneBack = 1, twoBack = 1; // ways(i - 1), ways(i - 2)
              for (let i = 2; i <= n; i++) [oneBack, twoBack] = [oneBack + twoBack, oneBack];
              return oneBack;
            }
            `, `
            public int climbingStairs(int n) {
                int oneBack = 1, twoBack = 1; // ways(i - 1), ways(i - 2)
                for (int i = 2; i <= n; i++) {
                    int current = oneBack + twoBack;
                    twoBack = oneBack;
                    oneBack = current;
                }
                return oneBack;
            }
            `),
          cx("$O(n)$.", "$O(1)$."),
          vs([
            ['1. Plain recursion', '$O(2^n)$', '$O(n)$', 'Only to derive the recurrence.'],
            ['2. Memoisation', '$O(n)$', '$O(n)$', 'The natural first DP answer.'],
            ['3. Bottom-up, two variables', '$O(n)$', '$O(1)$', 'The expected final answer.'],
          ]),
          tests([
            ['n = 1', '1', 'Example 2: one step, one way.'],
            ['n = 2', '2', '1 + 1 or 2.'],
            ['n = 3', '3', 'The first case where the recurrence adds two non-trivial values.'],
            ['n = 4', '5', 'Example 1.'],
            ['n = 10', '89', 'A longer staircase.'],
            ['n = 20', '10946', 'Large enough to make plain recursion noticeably slower.'],
          ], { fn: ['climbing_stairs_recursive', 'climbing_stairs_memo', 'climbing_stairs'] }),
          tips(
            "Variants change the allowed moves (1, 2 or 3 steps; a cost per step). The method stays the same: describe the last move, write the recurrence, then decide how many previous values you need to keep.",
            "For huge `n` (modulo a prime), the Fibonacci recurrence can be computed in $O(log n)$ with 2 × 2 matrix exponentiation."
          ),
        ],
      },

      {
        id: 'minimum-coin-combination',
        title: 'Minimum Coin Combination',
        body: [
          p("Given coin denominations and a `target` amount, return the **fewest coins** needed to make exactly the target. You have an unlimited supply of each coin. Return `-1` if the target can't be made."),
          ex('coins = [1, 3, 4], target = 6', '2', '3 + 3. (Taking the largest coin first gives 4 + 1 + 1 = 3 coins, so greedy fails here.)'),
          ex('coins = [5], target = 3', '-1'),
          p("Look at the **last coin** used. If it's coin `c`, the rest of the coins must form `amount - c` as cheaply as possible. We don't know which coin is last, so try all of them:"),
          state('dp[amount] = 1 + min(dp[amount - c] for each coin c ≤ amount)\ndp[0] = 0'),
          ap(1, 'Plain recursion'),
          p("Try every coin as the last one and recurse on what's left. A negative remainder means that choice overshot."),
          code(`
            from typing import List

            def min_coins_recursive(coins: List[int], target: int) -> int:
                def best(amount: int) -> float:
                    if amount == 0:
                        return 0
                    result = float('inf')
                    for c in coins:
                        if c <= amount:
                            result = min(result, 1 + best(amount - c))
                    return result

                answer = best(target)
                return answer if answer != float('inf') else -1
            `, `
            function minCoinsRecursive(coins, target) {
              const best = amount => {
                if (amount === 0) return 0;
                let result = Infinity;
                for (const c of coins) if (c <= amount) result = Math.min(result, 1 + best(amount - c));
                return result;
              };
              const answer = best(target);
              return answer === Infinity ? -1 : answer;
            }
            `, `
            public int minCoinsRecursive(int[] coins, int target) {
                int answer = best(coins, target);
                return answer == Integer.MAX_VALUE ? -1 : answer;
            }

            private int best(int[] coins, int amount) {
                if (amount == 0) return 0;
                int result = Integer.MAX_VALUE;
                for (int c : coins) {
                    if (c <= amount) {
                        int sub = best(coins, amount - c);
                        if (sub != Integer.MAX_VALUE) result = Math.min(result, sub + 1);
                    }
                }
                return result;
            }
            `),
          cost("Exponential, roughly $O(k^{t})$ for $k$ coin types and target $t$: every amount is re-solved for every way of reaching it.", "$O(t)$ recursion depth."),
          ap(2, 'Top-down with memoisation'),
          p("There are only `target + 1` different amounts, so remember the answer for each."),
          code(`
            from functools import lru_cache
            from typing import List

            def min_coins_memo(coins: List[int], target: int) -> int:
                @lru_cache(maxsize=None)
                def best(amount: int) -> float:
                    if amount == 0:
                        return 0
                    return min((1 + best(amount - c) for c in coins if c <= amount), default=float('inf'))

                answer = best(target)
                return answer if answer != float('inf') else -1
            `, `
            function minCoinsMemo(coins, target) {
              const memo = new Map([[0, 0]]);
              const best = amount => {
                if (memo.has(amount)) return memo.get(amount);
                let result = Infinity;
                for (const c of coins) if (c <= amount) result = Math.min(result, 1 + best(amount - c));
                memo.set(amount, result);
                return result;
              };
              const answer = best(target);
              return answer === Infinity ? -1 : answer;
            }
            `, `
            public int minCoinsMemo(int[] coins, int target) {
                int[] memo = new int[target + 1];
                Arrays.fill(memo, -2); // -2 = not computed yet
                int answer = best(coins, target, memo);
                return answer == Integer.MAX_VALUE ? -1 : answer;
            }

            private int best(int[] coins, int amount, int[] memo) {
                if (amount == 0) return 0;
                if (memo[amount] != -2) return memo[amount];
                int result = Integer.MAX_VALUE;
                for (int c : coins) {
                    if (c <= amount) {
                        int sub = best(coins, amount - c, memo);
                        if (sub != Integer.MAX_VALUE) result = Math.min(result, sub + 1);
                    }
                }
                return memo[amount] = result;
            }
            `),
          cost("$O(t · k)$.", "$O(t)$ for the memo and the recursion."),
          p("The recursion can be as deep as the target (with a coin of value 1). Filling the table from small amounts upward avoids recursion entirely."),
          ap(3, 'Bottom-up table (optimal)'),
          p("Fill `dp` from 0 up to the target. Unreachable amounts stay at infinity."),
          arr([0, 1, 2, 1, 1, 2, 2], { name: 'dp', hl: [6], hl2: [5, 3, 2], state: 'dp[6] = 1 + min(dp[5], dp[3], dp[2])\n      = 1 + min(2, 1, 2) = 2' }),
          impl(`
            from typing import List

            def minimum_coin_combination(coins: List[int], target: int) -> int:
                INF = float('inf')
                dp = [0] + [INF] * target
                for amount in range(1, target + 1):
                    for c in coins:
                        if c <= amount and dp[amount - c] + 1 < dp[amount]:
                            dp[amount] = dp[amount - c] + 1
                return dp[target] if dp[target] != INF else -1
            `, `
            function minimumCoinCombination(coins, target) {
              const dp = new Array(target + 1).fill(Infinity);
              dp[0] = 0;
              for (let amount = 1; amount <= target; amount++) {
                for (const c of coins) {
                  if (c <= amount) dp[amount] = Math.min(dp[amount], dp[amount - c] + 1);
                }
              }
              return dp[target] === Infinity ? -1 : dp[target];
            }
            `, `
            public int minimumCoinCombination(int[] coins, int target) {
                int INF = Integer.MAX_VALUE;
                int[] dp = new int[target + 1];
                Arrays.fill(dp, INF);
                dp[0] = 0;
                for (int amount = 1; amount <= target; amount++) {
                    for (int c : coins) {
                        if (c <= amount && dp[amount - c] != INF) {
                            dp[amount] = Math.min(dp[amount], dp[amount - c] + 1);
                        }
                    }
                }
                return dp[target] == INF ? -1 : dp[target];
            }
            `),
          cx("$O(t · k)$, where $t$ is the target and $k$ the number of coin types.", "$O(t)$ for the table."),
          vs([
            ['1. Plain recursion', 'exponential', '$O(t)$', 'Only to derive the recurrence.'],
            ['2. Memoisation', '$O(t · k)$', '$O(t)$', 'Natural top-down DP; deep recursion for large targets.'],
            ['3. Bottom-up table', '$O(t · k)$', '$O(t)$', 'The expected answer.'],
          ]),
          tests([
            ['coins = [2], target = 0', '0', 'A target of 0 needs no coins.'],
            ['coins = [1], target = 7', '7', 'Only one coin type.'],
            ['coins = [2, 5], target = 3', '-1', 'Unreachable amount.'],
            ['coins = [7, 3], target = 13', '3', '7 + 3 + 3; no pair of coins works.'],
            ['coins = [1, 2, 5], target = 11', '3', '5 + 5 + 1.'],
            ['coins = [5], target = 3', '-1', 'Example 2.'],
            ['coins = [1, 3, 4], target = 6', '2', 'Example 1: greedy would use 3 coins.'],
          ], { fn: ['min_coins_recursive', 'min_coins_memo', 'minimum_coin_combination'] }),
          tips(
            "Point out why greedy fails (largest coin first): with coins `[1, 3, 4]` and target 6, greedy takes 4 + 1 + 1, while 3 + 3 is better.",
            "Another view: amounts are nodes, coins are edges of length 1, so a **BFS** from 0 finds the fewest coins too.",
            "The sister problem *count the number of ways to make the target* uses the same table with `+` instead of `min`, iterating coins in the outer loop."
          ),
        ],
      },

      {
        id: 'matrix-pathways',
        title: 'Matrix Pathways',
        body: [
          p("You start in the **top-left** cell of an `m × n` grid and want to reach the **bottom-right** cell, moving only **right** or **down**. Count the number of distinct paths."),
          ex('m = 3, n = 3', '6'),
          ex('m = 1, n = 5', '1'),
          ap(1, 'Plain recursion'),
          p("The paths into a cell come from the cell above or the cell to the left, so the count is the sum of theirs. Recursing on that directly works, but recomputes the same cells exponentially often."),
          code(`
            def matrix_pathways_recursive(m: int, n: int) -> int:
                def paths(r: int, c: int) -> int:
                    if r == 0 or c == 0:
                        return 1  # first row or column: a single straight path
                    return paths(r - 1, c) + paths(r, c - 1)

                return paths(m - 1, n - 1)
            `, `
            function matrixPathwaysRecursive(m, n) {
              const paths = (r, c) => (r === 0 || c === 0 ? 1 : paths(r - 1, c) + paths(r, c - 1));
              return paths(m - 1, n - 1);
            }
            `, `
            public long matrixPathwaysRecursive(int m, int n) {
                return paths(m - 1, n - 1);
            }

            private long paths(int r, int c) {
                if (r == 0 || c == 0) return 1; // first row or column: a single straight path
                return paths(r - 1, c) + paths(r, c - 1);
            }
            `),
          cost("Exponential: roughly proportional to the answer itself, $C(m + n - 2, m - 1)$.", "$O(m + n)$ recursion depth."),
          ap(2, 'Top-down with memoisation'),
          p("Each of the `m · n` cells has one answer; cache it."),
          code(`
            from functools import lru_cache

            def matrix_pathways_memo(m: int, n: int) -> int:
                @lru_cache(maxsize=None)
                def paths(r: int, c: int) -> int:
                    if r == 0 or c == 0:
                        return 1
                    return paths(r - 1, c) + paths(r, c - 1)

                return paths(m - 1, n - 1)
            `, `
            function matrixPathwaysMemo(m, n) {
              const memo = new Map();
              const paths = (r, c) => {
                if (r === 0 || c === 0) return 1;
                const key = r + ',' + c;
                if (!memo.has(key)) memo.set(key, paths(r - 1, c) + paths(r, c - 1));
                return memo.get(key);
              };
              return paths(m - 1, n - 1);
            }
            `, `
            public long matrixPathwaysMemo(int m, int n) {
                return paths(m - 1, n - 1, new long[m][n]);
            }

            private long paths(int r, int c, long[][] memo) {
                if (r == 0 || c == 0) return 1;
                if (memo[r][c] == 0) memo[r][c] = paths(r - 1, c, memo) + paths(r, c - 1, memo);
                return memo[r][c];
            }
            `),
          cost("$O(m · n)$.", "$O(m · n)$ for the memo."),
          ap(3, 'Bottom-up, one row at a time (optimal DP)'),
          p("The only ways into cell `(r, c)` are from the cell **above** or the cell to the **left**. So the number of paths to `(r, c)` is the sum of the paths to those two cells. Every cell in the first row or first column has exactly one path (go straight)."),
          state('dp[r][c] = dp[r - 1][c] + dp[r][c - 1]\ndp[0][*] = dp[*][0] = 1'),
          grid([[1, 1, 1], [1, 2, 3], [1, 3, 6]], { hl: [[2, 2]], hl2: [[1, 2], [2, 1]], cap: 'number of paths into each cell', state: 'dp[2][2] = dp[1][2] + dp[2][1]\n        = 3 + 3 = 6' }),
          p("Each row only depends on the row above, so a single array of length `n` is enough: `row[c] += row[c - 1]` adds the left neighbour to the value that came from above."),
          note("There's also a closed form, covered in Approach 4 below."),
          impl(`
            def matrix_pathways(m: int, n: int) -> int:
                row = [1] * n              # first row: one path to each cell
                for _ in range(1, m):
                    for c in range(1, n):
                        row[c] += row[c - 1]   # from above (row[c]) + from the left
                return row[-1]
            `, `
            function matrixPathways(m, n) {
              const row = new Array(n).fill(1); // first row: one path to each cell
              for (let r = 1; r < m; r++) {
                for (let c = 1; c < n; c++) row[c] += row[c - 1]; // above + left
              }
              return row[n - 1];
            }
            `, `
            public long matrixPathways(int m, int n) {
                long[] row = new long[n];
                Arrays.fill(row, 1);           // first row: one path to each cell
                for (int r = 1; r < m; r++) {
                    for (int c = 1; c < n; c++) row[c] += row[c - 1]; // above + left
                }
                return row[n - 1];
            }
            `),
          cx("$O(m·n)$.", "$O(n)$ for one row."),
          h('Approach 4: Combinatorics (closed form)'),
          p("Every path is a sequence of exactly `m - 1` **down** moves and `n - 1` **right** moves, in some order. Choosing which of the `m + n - 2` moves are the downs determines the path, so the answer is the binomial coefficient $C(m + n - 2, m - 1)$. It can be computed with a running product that stays an exact integer at every step."),
          code(`
            def matrix_pathways_formula(m: int, n: int) -> int:
                result = 1
                for i in range(1, m):  # C(m + n - 2, m - 1), built up one factor at a time
                    result = result * (n - 1 + i) // i
                return result
            `, `
            function matrixPathwaysFormula(m, n) {
              let result = 1;
              for (let i = 1; i < m; i++) result = (result * (n - 1 + i)) / i; // C(m + n - 2, m - 1)
              return Math.round(result);
            }
            `, `
            public long matrixPathwaysFormula(int m, int n) {
                long result = 1;
                for (int i = 1; i < m; i++) result = result * (n - 1 + i) / i; // C(m + n - 2, m - 1)
                return result;
            }
            `),
          cost("$O(m)$ (or $O(min(m, n))$ by swapping so that `m` is the smaller side).", "$O(1)$."),
          vs([
            ['1. Plain recursion', 'exponential', '$O(m + n)$', 'Only to derive the recurrence.'],
            ['2. Memoisation', '$O(m · n)$', '$O(m · n)$', 'Top-down DP.'],
            ['3. Bottom-up row', '$O(m · n)$', '$O(n)$', 'The expected DP answer; extends to grids with obstacles.'],
            ['4. Binomial coefficient', '$O(min(m, n))$', '$O(1)$', 'Fastest, but only for the plain grid.'],
          ]),
          tests([
            ['m = 1, n = 1', '1', 'Start is the destination.'],
            ['m = 1, n = 5', '1', 'Example 2: a single row.'],
            ['m = 2, n = 2', '2', 'Right-down or down-right.'],
            ['m = 3, n = 3', '6', 'Example 1.'],
            ['m = 3, n = 7', '28', 'A rectangular grid.'],
            ['m = 10, n = 10', '48620', 'A larger square grid.'],
          ], { fn: ['matrix_pathways_recursive', 'matrix_pathways_memo', 'matrix_pathways', 'matrix_pathways_formula'] }),
          tips(
            "The DP version handles the common follow-up of **blocked cells**: set their count to 0. The formula can't.",
            "Answers grow quickly; use 64-bit integers (or a modulus if the problem asks for one)."
          ),
        ],
      },

      {
        id: 'neighborhood-burglary',
        title: 'Neighborhood Burglary',
        body: [
          p("A street of houses holds the amounts of money given in `houses`. A thief can't rob **two adjacent houses** (the alarms are linked). Return the **maximum** amount that can be stolen."),
          ex('houses = [3, 10, 3, 1, 2]', '12', 'rob houses 1 and 4: 10 + 2.'),
          ex('houses = [2, 7, 9, 3, 1]', '12', '2 + 9 + 1.'),
          p("Consider house `i`. There are only two options:"),
          ul(
            "**Skip it**: the best total is whatever was best for the first `i - 1` houses.",
            "**Rob it**: then house `i - 1` must be skipped, so the total is `houses[i]` plus the best for the first `i - 2` houses."
          ),
          state('best(i) = max(best(i - 1), houses[i] + best(i - 2))'),
          ap(1, 'Plain recursion'),
          p("Apply the recurrence from the last house backwards."),
          code(`
            from typing import List

            def burglary_recursive(houses: List[int]) -> int:
                def best(i: int) -> int:  # best total using houses[0..i]
                    if i < 0:
                        return 0
                    return max(best(i - 1), houses[i] + best(i - 2))

                return best(len(houses) - 1)
            `, `
            function burglaryRecursive(houses) {
              const best = i => (i < 0 ? 0 : Math.max(best(i - 1), houses[i] + best(i - 2))); // houses[0..i]
              return best(houses.length - 1);
            }
            `, `
            public int burglaryRecursive(int[] houses) {
                return best(houses, houses.length - 1);
            }

            private int best(int[] houses, int i) { // best total using houses[0..i]
                if (i < 0) return 0;
                return Math.max(best(houses, i - 1), houses[i] + best(houses, i - 2));
            }
            `),
          cost("$O(2^n)$.", "$O(n)$ recursion depth."),
          ap(2, 'Top-down with memoisation'),
          code(`
            from functools import lru_cache
            from typing import List

            def burglary_memo(houses: List[int]) -> int:
                @lru_cache(maxsize=None)
                def best(i: int) -> int:
                    if i < 0:
                        return 0
                    return max(best(i - 1), houses[i] + best(i - 2))

                return best(len(houses) - 1)
            `, `
            function burglaryMemo(houses) {
              const memo = new Map();
              const best = i => {
                if (i < 0) return 0;
                if (!memo.has(i)) memo.set(i, Math.max(best(i - 1), houses[i] + best(i - 2)));
                return memo.get(i);
              };
              return best(houses.length - 1);
            }
            `, `
            public int burglaryMemo(int[] houses) {
                Integer[] memo = new Integer[houses.length];
                return best(houses, houses.length - 1, memo);
            }

            private int best(int[] houses, int i, Integer[] memo) {
                if (i < 0) return 0;
                if (memo[i] == null) memo[i] = Math.max(best(houses, i - 1, memo), houses[i] + best(houses, i - 2, memo));
                return memo[i];
            }
            `),
          cost("$O(n)$.", "$O(n)$."),
          ap(3, 'Bottom-up with two variables (optimal)'),
          p("Each `best(i)` only needs the previous two values, so two variables are enough."),
          arr([3, 10, 3, 1, 2], { name: 'houses' }),
          arr([3, 10, 10, 11, 12], { name: 'best  ', hl: [4], hl2: [2], state: 'best(4) = max(best(3), 2 + best(2))\n        = max(11, 2 + 10) = 12' }),
          impl(`
            from typing import List

            def neighborhood_burglary(houses: List[int]) -> int:
                prev2, prev1 = 0, 0          # best(i - 2), best(i - 1)
                for money in houses:
                    prev2, prev1 = prev1, max(prev1, money + prev2)
                return prev1
            `, `
            function neighborhoodBurglary(houses) {
              let prev2 = 0, prev1 = 0; // best(i - 2), best(i - 1)
              for (const money of houses) [prev2, prev1] = [prev1, Math.max(prev1, money + prev2)];
              return prev1;
            }
            `, `
            public int neighborhoodBurglary(int[] houses) {
                int prev2 = 0, prev1 = 0; // best(i - 2), best(i - 1)
                for (int money : houses) {
                    int current = Math.max(prev1, money + prev2);
                    prev2 = prev1;
                    prev1 = current;
                }
                return prev1;
            }
            `),
          cx("$O(n)$.", "$O(1)$."),
          vs([
            ['1. Plain recursion', '$O(2^n)$', '$O(n)$', 'Only to derive the recurrence.'],
            ['2. Memoisation', '$O(n)$', '$O(n)$', 'Top-down DP.'],
            ['3. Two variables', '$O(n)$', '$O(1)$', 'The expected answer.'],
          ]),
          tests([
            ['houses = []', '0', 'No houses.'],
            ['houses = [5]', '5', 'One house.'],
            ['houses = [5, 9]', '9', 'Two neighbours: take the larger.'],
            ['houses = [0, 0, 0]', '0', 'Nothing worth taking.'],
            ['houses = [4, 1, 1, 4]', '8', 'The first and last houses.'],
            ['houses = [3, 10, 3, 1, 2]', '12', 'Example 1.'],
            ['houses = [2, 7, 9, 3, 1]', '12', 'Example 2.'],
          ], { fn: ['burglary_recursive', 'burglary_memo', 'neighborhood_burglary'] }),
          tips(
            "Follow-up: houses arranged in a **circle** (first and last are neighbours). Run the linear solution twice, once without the first house and once without the last, and take the better.",
            "Another follow-up: houses on a **tree**. Each node returns two values (best if robbed, best if not) in a post-order traversal."
          ),
        ],
      },

      {
        id: 'longest-common-subsequence',
        title: 'Longest Common Subsequence',
        body: [
          p("A **subsequence** keeps some characters of a string in their original order, possibly skipping others (`\"ace\"` is a subsequence of `\"abcde\"`). Given two strings, return the length of their **longest common subsequence (LCS)**."),
          ex('s1 = "acabac", s2 = "aebab"', '3', 'for example `"aba"` or `"aab"`.'),
          ex('s1 = "abc", s2 = "xyz"', '0'),
          ap(1, 'Plain recursion on the two suffixes'),
          p("Compare the first characters of the two strings. If they match, they can both be part of the LCS; otherwise, one of them isn't, so try dropping each and keep the better result."),
          code(`
            def lcs_recursive(s1: str, s2: str) -> int:
                def lcs(i: int, j: int) -> int:  # LCS of s1[i:] and s2[j:]
                    if i == len(s1) or j == len(s2):
                        return 0
                    if s1[i] == s2[j]:
                        return 1 + lcs(i + 1, j + 1)
                    return max(lcs(i + 1, j), lcs(i, j + 1))

                return lcs(0, 0)
            `, `
            function lcsRecursive(s1, s2) {
              const lcs = (i, j) => { // LCS of s1[i..] and s2[j..]
                if (i === s1.length || j === s2.length) return 0;
                if (s1[i] === s2[j]) return 1 + lcs(i + 1, j + 1);
                return Math.max(lcs(i + 1, j), lcs(i, j + 1));
              };
              return lcs(0, 0);
            }
            `, `
            public int lcsRecursive(String s1, String s2) {
                return lcs(s1, s2, 0, 0);
            }

            private int lcs(String s1, String s2, int i, int j) { // LCS of s1[i..] and s2[j..]
                if (i == s1.length() || j == s2.length()) return 0;
                if (s1.charAt(i) == s2.charAt(j)) return 1 + lcs(s1, s2, i + 1, j + 1);
                return Math.max(lcs(s1, s2, i + 1, j), lcs(s1, s2, i, j + 1));
            }
            `),
          cost("$O(2^{m + n})$ in the worst case (no characters match, so every call branches twice).", "$O(m + n)$ recursion depth."),
          ap(2, 'Top-down with memoisation'),
          p("There are only `(m + 1)(n + 1)` distinct pairs `(i, j)`; cache each answer."),
          code(`
            from functools import lru_cache

            def lcs_memo(s1: str, s2: str) -> int:
                @lru_cache(maxsize=None)
                def lcs(i: int, j: int) -> int:
                    if i == len(s1) or j == len(s2):
                        return 0
                    if s1[i] == s2[j]:
                        return 1 + lcs(i + 1, j + 1)
                    return max(lcs(i + 1, j), lcs(i, j + 1))

                return lcs(0, 0)
            `, `
            function lcsMemo(s1, s2) {
              const memo = new Map();
              const lcs = (i, j) => {
                if (i === s1.length || j === s2.length) return 0;
                const key = i * (s2.length + 1) + j;
                if (!memo.has(key)) {
                  memo.set(key, s1[i] === s2[j] ? 1 + lcs(i + 1, j + 1) : Math.max(lcs(i + 1, j), lcs(i, j + 1)));
                }
                return memo.get(key);
              };
              return lcs(0, 0);
            }
            `, `
            public int lcsMemo(String s1, String s2) {
                Integer[][] memo = new Integer[s1.length()][s2.length()];
                return lcs(s1, s2, 0, 0, memo);
            }

            private int lcs(String s1, String s2, int i, int j, Integer[][] memo) {
                if (i == s1.length() || j == s2.length()) return 0;
                if (memo[i][j] == null) {
                    memo[i][j] = s1.charAt(i) == s2.charAt(j) ? 1 + lcs(s1, s2, i + 1, j + 1, memo)
                            : Math.max(lcs(s1, s2, i + 1, j, memo), lcs(s1, s2, i, j + 1, memo));
                }
                return memo[i][j];
            }
            `),
          cost("$O(m · n)$.", "$O(m · n)$ for the memo, plus recursion."),
          ap(3, 'Bottom-up table (optimal)'),
          p("Fill the same values iteratively. Let `dp[i][j]` be the LCS length of the **suffixes** `s1[i:]` and `s2[j:]`:"),
          ul(
            "If `s1[i] == s2[j]`, use that matching character and continue with both strings: `1 + dp[i + 1][j + 1]`.",
            "Otherwise one of the two characters isn't part of the LCS. Skip one or the other and keep the better result: `max(dp[i + 1][j], dp[i][j + 1])`.",
            "An empty suffix has LCS 0, so the extra last row and column are all 0."
          ),
          grid([
            [3, 2, 2, 2, 1, 0],
            [3, 2, 2, 2, 1, 0],
            [3, 2, 2, 2, 1, 0],
            [2, 2, 2, 1, 1, 0],
            [1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
          ], { cols: ['a', 'e', 'b', 'a', 'b', '∅'], rowsLabels: ['a', 'c', 'a', 'b', 'a', 'c', '∅'], hl: [[0, 0]], hl2: [[1, 1]], cap: 'dp[i][j] for s1 (rows) and s2 (columns); answer in the top-left' }),
          state('dp[0][0]: s1[0] = s2[0] = "a"  →  1 + dp[1][1] = 1 + 2 = 3'),
          note("Only the next row is needed to compute the current one, so the table can be reduced to two rows of length `len(s2) + 1`."),
          impl(`
            def longest_common_subsequence(s1: str, s2: str) -> int:
                m, n = len(s1), len(s2)
                dp = [[0] * (n + 1) for _ in range(m + 1)]
                for i in range(m - 1, -1, -1):
                    for j in range(n - 1, -1, -1):
                        if s1[i] == s2[j]:
                            dp[i][j] = 1 + dp[i + 1][j + 1]
                        else:
                            dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])
                return dp[0][0]
            `, `
            function longestCommonSubsequence(s1, s2) {
              const m = s1.length, n = s2.length;
              const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
              for (let i = m - 1; i >= 0; i--) {
                for (let j = n - 1; j >= 0; j--) {
                  dp[i][j] = s1[i] === s2[j]
                    ? 1 + dp[i + 1][j + 1]
                    : Math.max(dp[i + 1][j], dp[i][j + 1]);
                }
              }
              return dp[0][0];
            }
            `, `
            public int longestCommonSubsequence(String s1, String s2) {
                int m = s1.length(), n = s2.length();
                int[][] dp = new int[m + 1][n + 1];
                for (int i = m - 1; i >= 0; i--) {
                    for (int j = n - 1; j >= 0; j--) {
                        if (s1.charAt(i) == s2.charAt(j)) dp[i][j] = 1 + dp[i + 1][j + 1];
                        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
                    }
                }
                return dp[0][0];
            }
            `),
          cx("$O(m·n)$.", "$O(m·n)$ for the table, or $O(n)$ with two rows."),
          vs([
            ['1. Plain recursion', '$O(2^{m+n})$', '$O(m + n)$', 'Only to derive the recurrence.'],
            ['2. Memoisation', '$O(m · n)$', '$O(m · n)$', 'Top-down DP.'],
            ['3. Bottom-up table', '$O(m · n)$', '$O(m · n)$, or $O(n)$ with two rows', 'The expected answer; the table also lets you rebuild the subsequence.'],
          ]),
          tests([
            ['s1 = "", s2 = "abc"', '0', 'One string is empty.'],
            ['s1 = "abc", s2 = "abc"', '3', 'Identical strings.'],
            ['s1 = "abc", s2 = "cba"', '1', 'Reversed: only one character can stay in order.'],
            ['s1 = "kitten", s2 = "sitting"', '4', '"ittn".'],
            ['s1 = "abc", s2 = "xyz"', '0', 'Example 2: nothing in common.'],
            ['s1 = "acabac", s2 = "aebab"', '3', 'Example 1.'],
          ], { fn: ['lcs_recursive', 'lcs_memo', 'longest_common_subsequence'] }),
          tips(
            "To return the subsequence itself, walk the table from `dp[0][0]`: take the character on a match and move diagonally, otherwise move toward the larger neighbour.",
            "Related problems with the same table shape: edit distance, shortest common supersequence, and diff tools."
          ),
        ],
      },

      {
        id: '0-1-knapsack',
        title: '0/1 Knapsack',
        body: [
          p("You have a bag that holds a total weight of at most `cap` and a set of items, each with a `weight` and a `value`. Each item can be taken **at most once** (0 or 1 times). Return the **maximum total value** that fits in the bag."),
          ex('cap = 7, weights = [5, 3, 4, 1], values = [70, 50, 40, 10]', '90', 'take the items of weight 3 and 4.'),
          ap(1, 'Brute force: take or skip every item'),
          p("Every subset of items is a candidate. Recursively decide for each item whether to take it (if it still fits) or skip it, and keep the best total."),
          code(`
            from typing import List

            def knapsack_brute_force(cap: int, weights: List[int], values: List[int]) -> int:
                def best(i: int, room: int) -> int:  # items i.. with room capacity left
                    if i == len(weights):
                        return 0
                    skip = best(i + 1, room)
                    if weights[i] > room:
                        return skip
                    return max(skip, values[i] + best(i + 1, room - weights[i]))

                return best(0, cap)
            `, `
            function knapsackBruteForce(cap, weights, values) {
              const best = (i, room) => { // items i.. with room capacity left
                if (i === weights.length) return 0;
                const skip = best(i + 1, room);
                return weights[i] > room ? skip : Math.max(skip, values[i] + best(i + 1, room - weights[i]));
              };
              return best(0, cap);
            }
            `, `
            public int knapsackBruteForce(int cap, int[] weights, int[] values) {
                return best(weights, values, 0, cap);
            }

            private int best(int[] weights, int[] values, int i, int room) { // items i.. with room left
                if (i == weights.length) return 0;
                int skip = best(weights, values, i + 1, room);
                if (weights[i] > room) return skip;
                return Math.max(skip, values[i] + best(weights, values, i + 1, room - weights[i]));
            }
            `),
          cost("$O(2^n)$: two choices per item.", "$O(n)$ recursion depth."),
          ap(2, 'Top-down with memoisation'),
          p("The recursion only depends on `(i, room)`, and there are at most `n · (cap + 1)` such pairs. Cache them."),
          code(`
            from functools import lru_cache
            from typing import List

            def knapsack_memo(cap: int, weights: List[int], values: List[int]) -> int:
                @lru_cache(maxsize=None)
                def best(i: int, room: int) -> int:
                    if i == len(weights):
                        return 0
                    skip = best(i + 1, room)
                    if weights[i] > room:
                        return skip
                    return max(skip, values[i] + best(i + 1, room - weights[i]))

                return best(0, cap)
            `, `
            function knapsackMemo(cap, weights, values) {
              const memo = new Map();
              const best = (i, room) => {
                if (i === weights.length) return 0;
                const key = i * (cap + 1) + room;
                if (!memo.has(key)) {
                  const skip = best(i + 1, room);
                  memo.set(key, weights[i] > room ? skip : Math.max(skip, values[i] + best(i + 1, room - weights[i])));
                }
                return memo.get(key);
              };
              return best(0, cap);
            }
            `, `
            public int knapsackMemo(int cap, int[] weights, int[] values) {
                return best(weights, values, 0, cap, new Integer[weights.length][cap + 1]);
            }

            private int best(int[] weights, int[] values, int i, int room, Integer[][] memo) {
                if (i == weights.length) return 0;
                if (memo[i][room] == null) {
                    int skip = best(weights, values, i + 1, room, memo);
                    memo[i][room] = weights[i] > room ? skip
                            : Math.max(skip, values[i] + best(weights, values, i + 1, room - weights[i], memo));
                }
                return memo[i][room];
            }
            `),
          cost("$O(n · cap)$.", "$O(n · cap)$ for the memo."),
          ap(3, 'Bottom-up table, then a single array (optimal)'),
          p("Process the items one by one. For item `i` and a capacity `c`, there are two choices:"),
          ul(
            "**Skip it**: the best value is whatever the previous items achieve with capacity `c`.",
            "**Take it** (if it fits): `values[i]` plus the best the previous items achieve with the **remaining** capacity `c - weights[i]`."
          ),
          state('dp[i][c] = max(dp[i - 1][c], values[i] + dp[i - 1][c - weights[i]])'),
          grid([
            [0, 0, 0, 0, 0, 70, 70, 70],
            [0, 0, 0, 50, 50, 70, 70, 70],
            [0, 0, 0, 50, 50, 70, 70, 90],
            [0, 10, 10, 50, 60, 70, 80, 90],
          ], { cols: [0, 1, 2, 3, 4, 5, 6, 7], rowsLabels: ['w5 v70', 'w3 v50', 'w4 v40', 'w1 v10'], hl: [[2, 7]], hl2: [[1, 3]], cap: 'best value using the first rows of items with each capacity', state: 'item w4 v40 at cap 7:\nmax(70, 40 + best(cap 3) = 40 + 50) = 90' }),
          h3('Saving space'),
          p("Each row only reads the row above. With a single array, iterate capacities **from high to low**: then `dp[c - weight]` still holds the previous row's value when we read it, so each item is used at most once. (Iterating from low to high would let an item be reused, which is the *unbounded* knapsack.)"),
          impl(`
            from typing import List

            def knapsack(cap: int, weights: List[int], values: List[int]) -> int:
                dp = [0] * (cap + 1)   # dp[c] = best value with capacity c
                for w, v in zip(weights, values):
                    for c in range(cap, w - 1, -1):   # high to low: each item at most once
                        dp[c] = max(dp[c], v + dp[c - w])
                return dp[cap]
            `, `
            function knapsack(cap, weights, values) {
              const dp = new Array(cap + 1).fill(0); // dp[c] = best value with capacity c
              for (let i = 0; i < weights.length; i++) {
                for (let c = cap; c >= weights[i]; c--) { // high to low: each item once
                  dp[c] = Math.max(dp[c], values[i] + dp[c - weights[i]]);
                }
              }
              return dp[cap];
            }
            `, `
            public int knapsack(int cap, int[] weights, int[] values) {
                int[] dp = new int[cap + 1]; // dp[c] = best value with capacity c
                for (int i = 0; i < weights.length; i++) {
                    for (int c = cap; c >= weights[i]; c--) { // high to low: each item once
                        dp[c] = Math.max(dp[c], values[i] + dp[c - weights[i]]);
                    }
                }
                return dp[cap];
            }
            `),
          cx("$O(n · cap)$ for $n$ items.", "$O(cap)$ with the single-array version."),
          vs([
            ['1. Take or skip (no memo)', '$O(2^n)$', '$O(n)$', 'A handful of items, or a huge capacity.'],
            ['2. Memoisation', '$O(n · cap)$', '$O(n · cap)$', 'Top-down DP; only visits reachable states.'],
            ['3. One array, high to low', '$O(n · cap)$', '$O(cap)$', 'The expected answer.'],
          ]),
          tests([
            ['cap = 0, weights = [1], values = [5]', '0', 'No capacity at all.'],
            ['cap = 10, weights = [], values = []', '0', 'No items.'],
            ['cap = 5, weights = [6], values = [10]', '0', 'The only item is too heavy.'],
            ['cap = 3, weights = [1, 1, 1], values = [5, 5, 5]', '15', 'Everything fits.'],
            ['cap = 4, weights = [4, 2, 2], values = [10, 6, 6]', '12', 'Two light items beat one heavy item.'],
            ['cap = 50, weights = [10, 20, 30], values = [60, 100, 120]', '220', 'The densest item is not in the best set.'],
            ['cap = 7, weights = [5, 3, 4, 1], values = [70, 50, 40, 10]', '90', 'Example 1.'],
          ], { fn: ['knapsack_brute_force', 'knapsack_memo', 'knapsack'] }),
          tips(
            "Explain the loop direction in the one-array version (capacities from high to low). It's the detail interviewers ask about most.",
            "Greedy by value per weight is **not** correct for 0/1 knapsack (the last test shows why); it only works when items can be split (*fractional* knapsack)."
          ),
        ],
      },
    ],
  });
})();
