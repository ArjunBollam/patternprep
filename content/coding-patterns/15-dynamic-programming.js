(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, state, code, impl, cx, table, pre, rg } = K;

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
          h('Intuition'),
          p("Think about the **last move**. To stand on step `i`, you either came from step `i - 1` (a 1-step) or from step `i - 2` (a 2-step). Those two groups of routes don't overlap and together cover every route, so:"),
          state('ways(i) = ways(i - 1) + ways(i - 2)\nways(0) = 1 (stand still),  ways(1) = 1'),
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
        ],
      },

      {
        id: 'minimum-coin-combination',
        title: 'Minimum Coin Combination',
        body: [
          p("Given coin denominations and a `target` amount, return the **fewest coins** needed to make exactly the target. You have an unlimited supply of each coin. Return `-1` if the target can't be made."),
          ex('coins = [1, 3, 4], target = 6', '2', '3 + 3. (Taking the largest coin first gives 4 + 1 + 1 = 3 coins, so greedy fails here.)'),
          ex('coins = [5], target = 3', '-1'),
          h('Intuition'),
          p("Again, look at the **last coin** used. If it's coin `c`, the rest of the coins must form `amount - c` as cheaply as possible. We don't know which coin is last, so try all of them:"),
          state('dp[amount] = 1 + min(dp[amount - c] for each coin c ≤ amount)\ndp[0] = 0'),
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
        ],
      },

      {
        id: 'matrix-pathways',
        title: 'Matrix Pathways',
        body: [
          p("You start in the **top-left** cell of an `m × n` grid and want to reach the **bottom-right** cell, moving only **right** or **down**. Count the number of distinct paths."),
          ex('m = 3, n = 3', '6'),
          ex('m = 1, n = 5', '1'),
          h('Intuition'),
          p("The only ways into cell `(r, c)` are from the cell **above** or the cell to the **left**. So the number of paths to `(r, c)` is the sum of the paths to those two cells. Every cell in the first row or first column has exactly one path (go straight)."),
          state('dp[r][c] = dp[r - 1][c] + dp[r][c - 1]\ndp[0][*] = dp[*][0] = 1'),
          grid([[1, 1, 1], [1, 2, 3], [1, 3, 6]], { hl: [[2, 2]], hl2: [[1, 2], [2, 1]], cap: 'number of paths into each cell', state: 'dp[2][2] = dp[1][2] + dp[2][1]\n        = 3 + 3 = 6' }),
          p("Each row only depends on the row above, so a single array of length `n` is enough: `row[c] += row[c - 1]` adds the left neighbour to the value that came from above."),
          note("There's also a closed form: a path is a sequence of `m - 1` downs and `n - 1` rights, so the answer is the binomial coefficient $C(m + n - 2, m - 1)$."),
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
        ],
      },

      {
        id: 'neighborhood-burglary',
        title: 'Neighborhood Burglary',
        body: [
          p("A street of houses holds the amounts of money given in `houses`. A thief can't rob **two adjacent houses** (the alarms are linked). Return the **maximum** amount that can be stolen."),
          ex('houses = [3, 10, 3, 1, 2]', '12', 'rob houses 1 and 4: 10 + 2.'),
          ex('houses = [2, 7, 9, 3, 1]', '12', '2 + 9 + 1.'),
          h('Intuition'),
          p("Consider house `i`. There are only two options:"),
          ul(
            "**Skip it**: the best total is whatever was best for the first `i - 1` houses.",
            "**Rob it**: then house `i - 1` must be skipped, so the total is `houses[i]` plus the best for the first `i - 2` houses."
          ),
          state('best(i) = max(best(i - 1), houses[i] + best(i - 2))'),
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
        ],
      },

      {
        id: 'longest-common-subsequence',
        title: 'Longest Common Subsequence',
        body: [
          p("A **subsequence** keeps some characters of a string in their original order, possibly skipping others (`\"ace\"` is a subsequence of `\"abcde\"`). Given two strings, return the length of their **longest common subsequence (LCS)**."),
          ex('s1 = "acabac", s2 = "aebab"', '3', 'for example `"aba"` or `"aab"`.'),
          ex('s1 = "abc", s2 = "xyz"', '0'),
          h('Intuition'),
          p("Compare the strings from the front. Let `dp[i][j]` be the LCS length of the **suffixes** `s1[i:]` and `s2[j:]`:"),
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
        ],
      },

      {
        id: '0-1-knapsack',
        title: '0/1 Knapsack',
        body: [
          p("You have a bag that holds a total weight of at most `cap` and a set of items, each with a `weight` and a `value`. Each item can be taken **at most once** (0 or 1 times). Return the **maximum total value** that fits in the bag."),
          ex('cap = 7, weights = [5, 3, 4, 1], values = [70, 50, 40, 10]', '90', 'take the items of weight 3 and 4.'),
          h('Intuition'),
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
        ],
      },
    ],
  });
})();
