(function () {
  const { p, h, h3, ul, ol, note, ex, arr, state, code, impl, cx, table, rg, ap, cost, vs, tests, tips } = K;

  K.section({
    id: 'greedy',
    title: 'Greedy',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Greedy Algorithms',
        body: [
          p("A **greedy algorithm** builds a solution step by step, always taking the choice that looks **best right now**, and never revisiting it. When it works, it's usually the simplest and fastest solution available. The catch is that it **doesn't always work**: a locally best move can lead to a globally worse result."),
          h('Greedy that works vs. greedy that fails'),
          table(['Problem', 'Greedy rule', 'Correct?'], [
            ['Make change with coins 1, 5, 10, 25', 'always take the largest coin that fits', '✓ for these denominations'],
            ['Make 6 with coins 1, 3, 4', 'largest coin first: 4 + 1 + 1', '✗ 3 + 3 is better ([Minimum Coin Combination](#/dynamic-programming/minimum-coin-combination))'],
            ['Most non-overlapping meetings', 'always pick the meeting that ends earliest', '✓'],
            ['Can I reach the end of the array?', 'track the farthest reachable index', '✓ ([Jump to the End](#/greedy/jump-to-the-end))'],
          ]),
          h('How to trust a greedy solution'),
          p("Before committing to greedy, convince yourself with an argument such as:"),
          ul(
            "**Exchange argument**: take any optimal solution that differs from the greedy one, and show you can swap in the greedy choice without making it worse.",
            "**Staying ahead**: show that after each step, the greedy partial solution is at least as good as any other partial solution.",
            "**Counterexample hunt**: try small tricky inputs. If greedy fails on one, switch to DP or search."
          ),
          h('When should I think of greedy?'),
          ul(
            "The problem asks for a **minimum or maximum** and choices seem **independent** once ordered correctly (often after sorting).",
            "There's a natural **\"best next move\"**: earliest deadline, smallest cost, farthest reach.",
            "A DP solution exists but you notice each state only ever uses one obvious transition."
          ),
          h('Real-world uses'),
          ul(
            "**Huffman coding** (data compression) greedily merges the two least frequent symbols.",
            "**Minimum spanning trees** (Kruskal, Prim) for laying cables or network design.",
            "**Scheduling**: earliest-deadline-first and shortest-job-first policies.",
            "**Making change** in cash registers and vending machines."
          ),
        ],
      },

      {
        id: 'jump-to-the-end',
        title: 'Jump to the End',
        body: [
          p("You start at index 0 of an array of non-negative integers. `nums[i]` is the **maximum** jump length from index `i` (you may jump any distance from 0 up to that). Return whether you can reach the **last index**."),
          ex('nums = [3, 2, 0, 2, 5]', 'True', 'jump 0 → 3 → 4 (or 0 → 1 → 3 → 4).'),
          ex('nums = [2, 1, 0, 3]', 'False', 'every route gets stuck at index 2, whose jump length is 0.'),
          ap(1, 'Dynamic programming: which indexes can reach the end?'),
          p("Work backwards. The last index trivially reaches the end. Index `i` reaches the end if **any** index it can jump to does. Filling these answers from right to left gives the answer for index 0."),
          code(`
            from typing import List

            def jump_to_the_end_dp(nums: List[int]) -> bool:
                n = len(nums)
                good = [False] * n  # good[i]: the last index is reachable from i
                good[-1] = True
                for i in range(n - 2, -1, -1):
                    good[i] = any(good[j] for j in range(i + 1, min(n, i + nums[i] + 1)))
                return good[0]
            `, `
            function jumpToTheEndDp(nums) {
              const n = nums.length;
              const good = new Array(n).fill(false); // good[i]: the end is reachable from i
              good[n - 1] = true;
              for (let i = n - 2; i >= 0; i--) {
                for (let j = i + 1; j <= Math.min(n - 1, i + nums[i]); j++) if (good[j]) { good[i] = true; break; }
              }
              return good[0];
            }
            `, `
            public boolean jumpToTheEndDp(int[] nums) {
                int n = nums.length;
                boolean[] good = new boolean[n]; // good[i]: the end is reachable from i
                good[n - 1] = true;
                for (int i = n - 2; i >= 0; i--) {
                    for (int j = i + 1; j <= Math.min(n - 1, i + nums[i]); j++) if (good[j]) { good[i] = true; break; }
                }
                return good[0];
            }
            `),
          cost("$O(n^2)$: each index may scan up to $n$ jump targets.", "$O(n)$."),
          ap(2, 'Greedy backwards: move the goal'),
          p("We only ever need the **leftmost** good index found so far. Keep it as `goal`, starting at the last index. Walking left, whenever `i + nums[i] >= goal`, index `i` can reach the goal, so it becomes the new goal."),
          code(`
            from typing import List

            def jump_to_the_end_backward(nums: List[int]) -> bool:
                goal = len(nums) - 1
                for i in range(len(nums) - 2, -1, -1):
                    if i + nums[i] >= goal:  # i reaches the goal, so reaching i is enough
                        goal = i
                return goal == 0
            `, `
            function jumpToTheEndBackward(nums) {
              let goal = nums.length - 1;
              for (let i = nums.length - 2; i >= 0; i--) if (i + nums[i] >= goal) goal = i; // reaching i is enough
              return goal === 0;
            }
            `, `
            public boolean jumpToTheEndBackward(int[] nums) {
                int goal = nums.length - 1;
                for (int i = nums.length - 2; i >= 0; i--) if (i + nums[i] >= goal) goal = i; // reaching i is enough
                return goal == 0;
            }
            `),
          cost("$O(n)$.", "$O(1)$."),
          ap(3, 'Greedy forwards: track the farthest reachable index (optimal)'),
          p("We don't need to know **which** jumps to make, only how far we can possibly get. Walk left to right keeping `farthest`, the farthest index reachable so far. If we ever arrive at an index **beyond** `farthest`, there's a gap we can't cross."),
          arr([2, 1, 0, 3], { p: { i: 0 }, on: ['i'], hl: [0, 1, 2], state: 'farthest = max(0, 0 + 2) = 2' }),
          arr([2, 1, 0, 3], { p: { i: 2 }, on: ['i'], hl: [0, 1, 2], state: 'i = 1: farthest = max(2, 1 + 1) = 2\ni = 2: farthest = max(2, 2 + 0) = 2' }),
          arr([2, 1, 0, 3], { p: { i: 3 }, on: ['i'], dim: [3], state: 'i = 3 > farthest = 2  →  unreachable' }),
          note("The forward and backward greedy versions are mirror images and equally good; pick whichever you can explain most clearly."),
          impl(`
            from typing import List

            def jump_to_the_end(nums: List[int]) -> bool:
                farthest = 0
                for i, jump in enumerate(nums):
                    if i > farthest:
                        return False               # a gap we can't cross
                    farthest = max(farthest, i + jump)
                return True
            `, `
            function jumpToTheEnd(nums) {
              let farthest = 0;
              for (let i = 0; i < nums.length; i++) {
                if (i > farthest) return false;    // a gap we can't cross
                farthest = Math.max(farthest, i + nums[i]);
              }
              return true;
            }
            `, `
            public boolean jumpToTheEnd(int[] nums) {
                int farthest = 0;
                for (int i = 0; i < nums.length; i++) {
                    if (i > farthest) return false;  // a gap we can't cross
                    farthest = Math.max(farthest, i + nums[i]);
                }
                return true;
            }
            `),
          cx("$O(n)$.", "$O(1)$."),
          vs([
            ['1. DP over indexes', '$O(n^2)$', '$O(n)$', 'The natural first idea.'],
            ['2. Greedy backwards', '$O(n)$', '$O(1)$', 'Optimal; easy to prove.'],
            ['3. Greedy forwards', '$O(n)$', '$O(1)$', 'Optimal; the most common answer.'],
          ]),
          tests([
            ['nums = [0]', 'True', 'Already standing on the last index.'],
            ['nums = [0, 1]', 'False', 'Stuck at the start.'],
            ['nums = [1, 0]', 'True', 'A zero on the last index is fine.'],
            ['nums = [2, 0, 0]', 'True', 'One jump clears the zeros.'],
            ['nums = [1, 1, 0, 1]', 'False', 'Every route lands on the zero.'],
            ['nums = [5, 0, 0, 0, 0, 0]', 'True', 'One long jump.'],
            ['nums = [3, 2, 0, 2, 5]', 'True', 'Example 1.'],
            ['nums = [2, 1, 0, 3]', 'False', 'Example 2.'],
          ], { fn: ['jump_to_the_end_dp', 'jump_to_the_end_backward', 'jump_to_the_end'] }),
          tips(
            "Follow-up: the **fewest jumps** to reach the end. Process the array in BFS-like layers: each layer is the range reachable with one more jump, and the next layer ends at the farthest index reachable from the current one."
          ),
        ],
      },

      {
        id: 'gas-stations',
        title: 'Gas Stations',
        body: [
          p("Gas stations are arranged in a **circle**. At station `i` you can fill up `gas[i]` units, and driving from station `i` to the next one costs `cost[i]` units. Your tank starts empty and has no limit. Return the index of a station from which you can drive **all the way around once**, or `-1` if none exists. If a solution exists, it is unique."),
          ex('gas = [2, 5, 1, 3], cost = [3, 2, 1, 4]', '1'),
          ex('gas = [1, 1], cost = [2, 2]', '-1'),
          ap(1, 'Brute force: try every start'),
          p("Simulate the trip from every station: drive around the circle once, adding `gas[i] - cost[i]` at each stop, and give up on that start as soon as the tank goes negative."),
          code(`
            from typing import List

            def gas_stations_brute_force(gas: List[int], cost: List[int]) -> int:
                n = len(gas)
                for start in range(n):
                    tank = 0
                    for k in range(n):  # one lap from start
                        i = (start + k) % n
                        tank += gas[i] - cost[i]
                        if tank < 0:
                            break
                    else:
                        return start  # completed the lap
                return -1
            `, `
            function gasStationsBruteForce(gas, cost) {
              const n = gas.length;
              for (let start = 0; start < n; start++) {
                let tank = 0, ok = true;
                for (let k = 0; k < n && ok; k++) { // one lap from start
                  const i = (start + k) % n;
                  tank += gas[i] - cost[i];
                  if (tank < 0) ok = false;
                }
                if (ok) return start;
              }
              return -1;
            }
            `, `
            public int gasStationsBruteForce(int[] gas, int[] cost) {
                int n = gas.length;
                for (int start = 0; start < n; start++) {
                    int tank = 0;
                    boolean ok = true;
                    for (int k = 0; k < n && ok; k++) { // one lap from start
                        int i = (start + k) % n;
                        tank += gas[i] - cost[i];
                        if (tank < 0) ok = false;
                    }
                    if (ok) return start;
                }
                return -1;
            }
            `),
          cost("$O(n^2)$.", "$O(1)$."),
          p("A failed attempt tells us much more than *this start is bad*, which leads to a single-pass solution."),
          ap(2, 'One-pass greedy (optimal)'),
          p("Two observations make this linear:"),
          ol(
            "**Feasibility**: if the total gas is less than the total cost, no start works. Otherwise some start does.",
            "**Skipping**: if you start at `s` and first run out of gas when trying to leave station `i`, then **no station between `s` and `i`** works as a start either. You arrived at each of those stations with a non-negative tank, so starting there with an empty tank can only be worse. So the next candidate is `i + 1`."
          ),
          arr([-1, 3, 0, -1], { name: 'gas - cost', p: { start: 0 }, on: ['start'], state: 'i = 0: tank = -1 < 0\n→ no start ≤ 0 works; start = 1, tank = 0' }),
          arr([-1, 3, 0, -1], { name: 'gas - cost', p: { start: 1 }, hl: [1, 2, 3], state: 'tank: 3, 3, 2 (never negative)\ntotal = 1 ≥ 0  →  answer 1' }),
          impl(`
            from typing import List

            def gas_stations(gas: List[int], cost: List[int]) -> int:
                if sum(gas) < sum(cost):
                    return -1
                start = tank = 0
                for i in range(len(gas)):
                    tank += gas[i] - cost[i]
                    if tank < 0:
                        start = i + 1    # no station up to i can be the start
                        tank = 0
                return start
            `, `
            function gasStations(gas, cost) {
              let total = 0, tank = 0, start = 0;
              for (let i = 0; i < gas.length; i++) {
                total += gas[i] - cost[i];
                tank += gas[i] - cost[i];
                if (tank < 0) {
                  start = i + 1; // no station up to i can be the start
                  tank = 0;
                }
              }
              return total < 0 ? -1 : start;
            }
            `, `
            public int gasStations(int[] gas, int[] cost) {
                int total = 0, tank = 0, start = 0;
                for (int i = 0; i < gas.length; i++) {
                    total += gas[i] - cost[i];
                    tank += gas[i] - cost[i];
                    if (tank < 0) {
                        start = i + 1; // no station up to i can be the start
                        tank = 0;
                    }
                }
                return total < 0 ? -1 : start;
            }
            `),
          cx("$O(n)$.", "$O(1)$."),
          vs([
            ['1. Simulate from every start', '$O(n^2)$', '$O(1)$', 'Baseline.'],
            ['2. One-pass greedy', '$O(n)$', '$O(1)$', 'The expected answer; justify both observations.'],
          ]),
          tests([
            ['gas = [5], cost = [4]', '0', 'One station with enough gas.'],
            ['gas = [3], cost = [4]', '-1', 'One station without enough gas.'],
            ['gas = [4, 0, 0], cost = [1, 1, 2]', '0', 'The total is exactly enough (tank ends at 0).'],
            ['gas = [0, 0, 7], cost = [2, 3, 2]', '2', 'Only the last station works.'],
            ['gas = [1, 1], cost = [2, 2]', '-1', 'Example 2.'],
            ['gas = [2, 5, 1, 3], cost = [3, 2, 1, 4]', '1', 'Example 1.'],
          ], { fn: ['gas_stations_brute_force', 'gas_stations'] }),
          tips(
            "The proof is what makes this answer convincing. Practise saying both observations: *total gas ≥ total cost means some start works*, and *a failure at station `i` rules out every start up to `i`*."
          ),
        ],
      },

      {
        id: 'candies',
        title: 'Candies',
        body: [
          p("Children stand in a line, each with a `rating`. Hand out candies so that **every child gets at least one**, and **a child with a higher rating than an adjacent child gets more candies than that neighbour**. Return the **minimum** total number of candies."),
          ex('ratings = [4, 3, 2, 4, 5, 1]', '12', 'candies = [3, 2, 1, 2, 3, 1].'),
          ex('ratings = [1, 1, 1]', '3', 'equal neighbours have no constraint.'),
          ap(1, 'Brute force: fix violations until none remain'),
          p("Start with one candy each. Repeatedly scan the line, and whenever a child out-rates a neighbour without having more candy, give them one more than that neighbour. Stop when a full scan changes nothing."),
          code(`
            from typing import List

            def candies_brute_force(ratings: List[int]) -> int:
                n = len(ratings)
                candy = [1] * n
                changed = True
                while changed:  # keep fixing until a full pass changes nothing
                    changed = False
                    for i in range(n):
                        if i > 0 and ratings[i] > ratings[i - 1] and candy[i] <= candy[i - 1]:
                            candy[i] = candy[i - 1] + 1
                            changed = True
                        if i < n - 1 and ratings[i] > ratings[i + 1] and candy[i] <= candy[i + 1]:
                            candy[i] = candy[i + 1] + 1
                            changed = True
                return sum(candy)
            `, `
            function candiesBruteForce(ratings) {
              const n = ratings.length;
              const candy = new Array(n).fill(1);
              let changed = true;
              while (changed) { // keep fixing until a full pass changes nothing
                changed = false;
                for (let i = 0; i < n; i++) {
                  if (i > 0 && ratings[i] > ratings[i - 1] && candy[i] <= candy[i - 1]) { candy[i] = candy[i - 1] + 1; changed = true; }
                  if (i < n - 1 && ratings[i] > ratings[i + 1] && candy[i] <= candy[i + 1]) { candy[i] = candy[i + 1] + 1; changed = true; }
                }
              }
              return candy.reduce((a, b) => a + b, 0);
            }
            `, `
            public int candiesBruteForce(int[] ratings) {
                int n = ratings.length;
                int[] candy = new int[n];
                Arrays.fill(candy, 1);
                boolean changed = true;
                while (changed) { // keep fixing until a full pass changes nothing
                    changed = false;
                    for (int i = 0; i < n; i++) {
                        if (i > 0 && ratings[i] > ratings[i - 1] && candy[i] <= candy[i - 1]) { candy[i] = candy[i - 1] + 1; changed = true; }
                        if (i < n - 1 && ratings[i] > ratings[i + 1] && candy[i] <= candy[i + 1]) { candy[i] = candy[i + 1] + 1; changed = true; }
                    }
                }
                int total = 0;
                for (int c : candy) total += c;
                return total;
            }
            `),
          cost("$O(n^2)$: a long decreasing run needs up to $n$ passes, each linear.", "$O(n)$."),
          p("The repeated passes are needed because fixing the right neighbour can break the left one again. Handling each side in its own **direction** settles everything in two passes."),
          ap(2, 'Two greedy passes (optimal)'),
          p("Each child has two constraints: one with the **left** neighbour and one with the **right** neighbour. Handle them in two greedy passes:"),
          ol(
            "**Left to right**: give everyone 1; if a child's rating beats the **left** neighbour, give them one more than that neighbour.",
            "**Right to left**: if a child's rating beats the **right** neighbour, make sure they have at least one more than that neighbour: `max(current, right + 1)`."
          ),
          p("Taking the maximum keeps the left-side constraint satisfied while fixing the right side, and each child ends up with the smallest count that satisfies both, so the total is minimal."),
          arr([4, 3, 2, 4, 5, 1], { name: 'ratings' }),
          arr([1, 1, 1, 2, 3, 1], { name: 'pass 1 ', hl2: [3, 4], cap: 'left to right: rising runs get 1, 2, 3, …' }),
          arr([3, 2, 1, 2, 3, 1], { name: 'pass 2 ', hl: [0, 1], state: 'right to left fixes the descending run 4 > 3 > 2\ntotal = 12' }),
          impl(`
            from typing import List

            def candies(ratings: List[int]) -> int:
                n = len(ratings)
                given = [1] * n
                for i in range(1, n):                    # left neighbour constraint
                    if ratings[i] > ratings[i - 1]:
                        given[i] = given[i - 1] + 1
                for i in range(n - 2, -1, -1):           # right neighbour constraint
                    if ratings[i] > ratings[i + 1]:
                        given[i] = max(given[i], given[i + 1] + 1)
                return sum(given)
            `, `
            function candies(ratings) {
              const n = ratings.length;
              const given = new Array(n).fill(1);
              for (let i = 1; i < n; i++) {                 // left neighbour constraint
                if (ratings[i] > ratings[i - 1]) given[i] = given[i - 1] + 1;
              }
              for (let i = n - 2; i >= 0; i--) {            // right neighbour constraint
                if (ratings[i] > ratings[i + 1]) given[i] = Math.max(given[i], given[i + 1] + 1);
              }
              return given.reduce((a, b) => a + b, 0);
            }
            `, `
            public int candies(int[] ratings) {
                int n = ratings.length;
                int[] given = new int[n];
                Arrays.fill(given, 1);
                for (int i = 1; i < n; i++) {                 // left neighbour constraint
                    if (ratings[i] > ratings[i - 1]) given[i] = given[i - 1] + 1;
                }
                for (int i = n - 2; i >= 0; i--) {            // right neighbour constraint
                    if (ratings[i] > ratings[i + 1]) given[i] = Math.max(given[i], given[i + 1] + 1);
                }
                int total = 0;
                for (int g : given) total += g;
                return total;
            }
            `),
          cx("$O(n)$. Two passes.", "$O(n)$ for the candy counts."),
          vs([
            ['1. Fix violations until stable', '$O(n^2)$', '$O(n)$', 'Baseline.'],
            ['2. Two passes', '$O(n)$', '$O(n)$', 'The expected answer.'],
          ]),
          tests([
            ['ratings = [7]', '1', 'One child.'],
            ['ratings = [1, 1, 1]', '3', 'Example 2: equal ratings, one candy each.'],
            ['ratings = [1, 2, 2]', '4', 'Equal neighbours don\'t need more candy.'],
            ['ratings = [1, 2, 3]', '6', 'Increasing: 1 + 2 + 3.'],
            ['ratings = [3, 2, 1]', '6', 'Decreasing: needs the right-to-left pass.'],
            ['ratings = [1, 3, 1]', '4', 'A peak.'],
            ['ratings = [2, 1, 2]', '5', 'A valley.'],
            ['ratings = [4, 3, 2, 4, 5, 1]', '12', 'Example 1.'],
          ], { fn: ['candies_brute_force', 'candies'] }),
          tips(
            "A peak between an increasing and a decreasing run needs `max` of both runs' requirements; that's exactly the `max(current, right + 1)` step.",
            "There is also a one-pass, $O(1)$-space solution that counts the lengths of rising and falling slopes. It's elegant but hard to get right under pressure."
          ),
        ],
      },
    ],
  });
})();
