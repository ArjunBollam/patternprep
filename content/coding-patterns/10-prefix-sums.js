(function () {
  const { p, h, h3, ul, ol, note, ex, arr, state, code, impl, cx, rg, ap, cost, vs, tests, tips } = K;

  K.section({
    id: 'prefix-sums',
    title: 'Prefix Sums',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Prefix Sums',
        body: [
          p("A **prefix sum** array stores running totals: `prefix[i]` is the sum of the first `i` elements. Building it takes one $O(n)$ pass, and afterwards the sum of **any** contiguous range can be read in $O(1)$ by subtracting two prefix values."),
          arr([3, -7, 6, 0, -2, 5], { name: 'nums' }),
          arr([0, 3, -4, 2, 2, 0, 5], { name: 'prefix', hl: [1, 5], state: 'sum(nums[1..4]) = prefix[5] - prefix[1]\n                = 0 - 3 = -3' }),
          p("Here we use the convention `prefix[0] = 0` and `prefix[i + 1] = prefix[i] + nums[i]`, so the array is one longer than the input. Then:"),
          state('sum(nums[i..j]) = prefix[j + 1] - prefix[i]'),
          p("The extra leading zero removes the special case for ranges that start at index 0."),
          h('When should I think of prefix sums?'),
          ul(
            "Many **range-sum queries** on an array that doesn't change.",
            "Counting **subarrays with a given sum** (combine prefix sums with a hash map: [K-Sum Subarrays](#/prefix-sums/k-sum-subarrays)).",
            "The same idea works for **products**, **XOR**, **counts** of a property, and in **2D** (summed-area tables) for rectangle sums.",
            "Running totals from both ends, as in [Product Array Without Current Element](#/prefix-sums/product-array-without-current-element)."
          ),
          h('Real-world uses'),
          ul(
            "**Analytics dashboards**: cumulative revenue or visitors, so \"total between two dates\" is instant.",
            "**Image processing**: integral images let blur filters and face detectors sum any rectangle in $O(1)$.",
            "**Databases**: pre-aggregated running totals for fast range queries.",
            "**Games**: cumulative probability tables for weighted random choices ([Weighted Random Selection](#/binary-search/weighted-random-selection))."
          ),
          h('Template'),
          code(`
            def build_prefix(nums):
                prefix = [0] * (len(nums) + 1)
                for i, x in enumerate(nums):
                    prefix[i + 1] = prefix[i] + x
                return prefix

            # sum of nums[i..j] (inclusive) = prefix[j + 1] - prefix[i]
            `, `
            function buildPrefix(nums) {
              const prefix = new Array(nums.length + 1).fill(0);
              for (let i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
              return prefix;
            }
            // sum of nums[i..j] (inclusive) = prefix[j + 1] - prefix[i]
            `, `
            long[] buildPrefix(int[] nums) {
                long[] prefix = new long[nums.length + 1];
                for (int i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
                return prefix;
            }
            // sum of nums[i..j] (inclusive) = prefix[j + 1] - prefix[i]
            `),
        ],
      },

      {
        id: 'sum-between-range',
        title: 'Sum Between Range',
        body: [
          p("Given an integer array `nums`, build a structure that answers many queries `sum_range(i, j)`: the **sum of `nums[i]` through `nums[j]`, inclusive**. The array never changes after construction."),
          ex('nums = [3, -7, 6, 0, -2, 5]; sum_range(0, 3), sum_range(2, 4), sum_range(2, 2)', '2, 4, 6'),
          ap(1, 'Sum the range on every query'),
          p("Store the array and add up `nums[i..j]` whenever a query arrives."),
          code(`
            from typing import List

            class SumBetweenRangeLoop:
                def __init__(self, nums: List[int]):
                    self.nums = nums

                def sum_range(self, i: int, j: int) -> int:
                    return sum(self.nums[i:j + 1])  # O(j - i) per query
            `, `
            class SumBetweenRangeLoop {
              constructor(nums) {
                this.nums = nums;
              }

              sumRange(i, j) {
                let total = 0;
                for (let k = i; k <= j; k++) total += this.nums[k]; // O(j - i) per query
                return total;
              }
            }
            `, `
            class SumBetweenRangeLoop {
                private final int[] nums;

                public SumBetweenRangeLoop(int[] nums) { this.nums = nums; }

                public long sumRange(int i, int j) {
                    long total = 0;
                    for (int k = i; k <= j; k++) total += nums[k]; // O(j - i) per query
                    return total;
                }
            }
            `),
          cost("$O(1)$ to build; $O(n)$ per query.", "$O(1)$ extra."),
          ap(2, 'Precompute every answer'),
          p("At the other extreme, compute the sum of every pair `(i, j)` up front. Extending each row one element at a time makes each entry $O(1)$, so a query becomes a table lookup."),
          code(`
            from typing import List

            class SumBetweenRangeTable:
                def __init__(self, nums: List[int]):
                    n = len(nums)
                    self.table = [[0] * n for _ in range(n)]  # table[i][j] = sum of nums[i..j]
                    for i in range(n):
                        total = 0
                        for j in range(i, n):
                            total += nums[j]
                            self.table[i][j] = total

                def sum_range(self, i: int, j: int) -> int:
                    return self.table[i][j]
            `, `
            class SumBetweenRangeTable {
              constructor(nums) {
                const n = nums.length;
                this.table = Array.from({ length: n }, () => new Array(n).fill(0)); // [i][j] = sum i..j
                for (let i = 0; i < n; i++) {
                  let total = 0;
                  for (let j = i; j < n; j++) this.table[i][j] = (total += nums[j]);
                }
              }

              sumRange(i, j) {
                return this.table[i][j];
              }
            }
            `, `
            class SumBetweenRangeTable {
                private final long[][] table; // table[i][j] = sum of nums[i..j]

                public SumBetweenRangeTable(int[] nums) {
                    int n = nums.length;
                    table = new long[n][n];
                    for (int i = 0; i < n; i++) {
                        long total = 0;
                        for (int j = i; j < n; j++) table[i][j] = (total += nums[j]);
                    }
                }

                public long sumRange(int i, int j) { return table[i][j]; }
            }
            `),
          cost("$O(n^2)$ to build; $O(1)$ per query.", "$O(n^2)$ for the table."),
          p("Queries are now instant, but the table is quadratic. A single array of $n + 1$ prefix sums gives the same $O(1)$ queries."),
          ap(3, 'Prefix sums (optimal)'),
          p("Because the array is fixed, we can pay $O(n)$ **once** to build a prefix-sum array and then answer every query in $O(1)$."),
          arr([3, -7, 6, 0, -2, 5], { name: 'nums', hl: rg(2, 4) }),
          arr([0, 3, -4, 2, 2, 0, 5], { name: 'prefix', hl: [2, 5], state: 'sum_range(2, 4) = prefix[5] - prefix[2]\n               = 0 - (-4) = 4' }),
          p("`prefix[5]` is the sum of the first five elements and `prefix[2]` the sum of the first two. Subtracting removes the part before index 2, leaving exactly `nums[2] + nums[3] + nums[4]`."),
          impl(`
            from typing import List

            class SumBetweenRange:
                def __init__(self, nums: List[int]):
                    self.prefix = [0]
                    for x in nums:
                        self.prefix.append(self.prefix[-1] + x)

                def sum_range(self, i: int, j: int) -> int:
                    return self.prefix[j + 1] - self.prefix[i]
            `, `
            class SumBetweenRange {
              constructor(nums) {
                this.prefix = [0];
                for (const x of nums) this.prefix.push(this.prefix[this.prefix.length - 1] + x);
              }

              sumRange(i, j) {
                return this.prefix[j + 1] - this.prefix[i];
              }
            }
            `, `
            class SumBetweenRange {
                private final long[] prefix;

                public SumBetweenRange(int[] nums) {
                    prefix = new long[nums.length + 1];
                    for (int i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
                }

                public long sumRange(int i, int j) {
                    return prefix[j + 1] - prefix[i];
                }
            }
            `),
          cx("$O(n)$ to build; $O(1)$ per query.", "$O(n)$ for the prefix-sum array."),
          vs([
            ['1. Sum per query', '$O(n)$ per query', '$O(1)$', 'Few queries.'],
            ['2. Table of all answers', '$O(n^2)$ build, $O(1)$ query', '$O(n^2)$', 'Never better than prefix sums.'],
            ['3. Prefix sums', '$O(n)$ build, $O(1)$ query', '$O(n)$', 'The expected answer.'],
          ]),
          tests([
            ['SumBetweenRange([5]); sum_range(0, 0)', '[5]', 'A one-element array.'],
            ['SumBetweenRange([0, 0, 0]); sum_range(0, 2)', '[0]', 'Zeros.'],
            ['SumBetweenRange([-1, -1, -1]); sum_range(0, 2); sum_range(1, 2)', '[-3, -2]', 'Negative values.'],
            ['SumBetweenRange([1, 2, 3, 4]); sum_range(0, 3); sum_range(3, 3); sum_range(1, 2)', '[10, 4, 5]', 'Whole array, last element, middle.'],
            ['SumBetweenRange([3, -7, 6, 0, -2, 5]); sum_range(0, 3); sum_range(2, 4); sum_range(2, 2)', '[2, 4, 6]', 'Example 1.'],
          ], { ops: ['SumBetweenRangeLoop', 'SumBetweenRangeTable', 'SumBetweenRange'] }),
          note("Each test builds the structure with the given array, then runs the queries; the expected output lists the query results."),
          tips(
            "Use a leading zero (`prefix[0] = 0`) so `prefix[j + 1] - prefix[i]` works for `i = 0` without a special case.",
            "If the array can **change** between queries, prefix sums need $O(n)$ per update. A Fenwick tree or segment tree handles both updates and queries in $O(log n)$."
          ),
        ],
      },

      {
        id: 'k-sum-subarrays',
        title: 'K-Sum Subarrays',
        body: [
          p("Given an integer array (which may contain **negative** numbers) and an integer `k`, return the **number of contiguous subarrays whose sum equals `k`**."),
          ex('nums = [1, 2, -1, 1, 2], k = 3', '3', 'the subarrays are `[1, 2]` (indexes 0-1), `[1, 2, -1, 1]` (0-3) and `[1, 2]` (3-4).'),
          ex('nums = [2, 2], k = 2', '2'),
          ap(1, 'Brute force: every subarray'),
          p("Fix a start `i` and extend the end `j` one step at a time, keeping a running sum so each extension costs $O(1)$. Count every running sum equal to `k`."),
          code(`
            from typing import List

            def k_sum_subarrays_brute_force(nums: List[int], k: int) -> int:
                count = 0
                for i in range(len(nums)):
                    total = 0
                    for j in range(i, len(nums)):
                        total += nums[j]  # sum of nums[i..j], built incrementally
                        if total == k:
                            count += 1
                return count
            `, `
            function kSumSubarraysBruteForce(nums, k) {
              let count = 0;
              for (let i = 0; i < nums.length; i++) {
                let total = 0;
                for (let j = i; j < nums.length; j++) {
                  total += nums[j]; // sum of nums[i..j]
                  if (total === k) count++;
                }
              }
              return count;
            }
            `, `
            public int kSumSubarraysBruteForce(int[] nums, int k) {
                int count = 0;
                for (int i = 0; i < nums.length; i++) {
                    int total = 0;
                    for (int j = i; j < nums.length; j++) {
                        total += nums[j]; // sum of nums[i..j]
                        if (total == k) count++;
                    }
                }
                return count;
            }
            `),
          cost("$O(n^2)$.", "$O(1)$."),
          p("Because of negative numbers, a sliding window doesn't work here: growing the window can make the sum smaller, so we can't decide which side to move."),
          ap(2, 'Prefix sums + hash map of counts (optimal)'),
          p("Prefix sums do work. The subarray `nums[i..j]` sums to `k` exactly when:"),
          state('prefix[j + 1] - prefix[i] = k   ⟺   prefix[i] = prefix[j + 1] - k'),
          p("So as we walk through the array maintaining the running sum `curr`, the number of good subarrays **ending here** is the number of **earlier** prefix sums equal to `curr - k`. A hash map counts how many times each prefix sum has appeared. Seed it with `{0: 1}` for the empty prefix, so that subarrays starting at index 0 are counted."),
          arr([1, 2, -1, 1, 2], { name: 'nums' }),
          arr([0, 1, 3, 2, 3, 5], { name: 'prefix', hl: [0, 2], hl2: [3, 5], state: 'prefix 3 (×2) - k = 0  → matches prefix[0]\nprefix 5 - k = 2       → matches prefix[3]\ntotal = 1 + 1 + 1 = 3' }),
          state('curr = 1  need -2  seen {0:1}            → +0\ncurr = 3  need 0   seen {0:1, 1:1}       → +1\ncurr = 2  need -1                         → +0\ncurr = 3  need 0                          → +1\ncurr = 5  need 2   seen has 2 once        → +1'),
          impl(`
            from typing import List

            def k_sum_subarrays(nums: List[int], k: int) -> int:
                seen = {0: 1}   # prefix sum -> how many times it has occurred
                curr = 0
                count = 0
                for x in nums:
                    curr += x
                    count += seen.get(curr - k, 0)
                    seen[curr] = seen.get(curr, 0) + 1
                return count
            `, `
            function kSumSubarrays(nums, k) {
              const seen = new Map([[0, 1]]); // prefix sum -> occurrences
              let curr = 0, count = 0;
              for (const x of nums) {
                curr += x;
                count += seen.get(curr - k) || 0;
                seen.set(curr, (seen.get(curr) || 0) + 1);
              }
              return count;
            }
            `, `
            public int kSumSubarrays(int[] nums, int k) {
                Map<Integer, Integer> seen = new HashMap<>(); // prefix sum -> occurrences
                seen.put(0, 1);
                int curr = 0, count = 0;
                for (int x : nums) {
                    curr += x;
                    count += seen.getOrDefault(curr - k, 0);
                    seen.merge(curr, 1, Integer::sum);
                }
                return count;
            }
            `),
          cx("$O(n)$. One pass with $O(1)$ map operations.", "$O(n)$ for the map of prefix sums."),
          vs([
            ['1. Every subarray', '$O(n^2)$', '$O(1)$', 'Small inputs.'],
            ['2. Prefix sums + hash map', '$O(n)$', '$O(n)$', 'The expected answer; works with negative numbers.'],
          ]),
          tests([
            ['nums = [], k = 0', '0', 'No subarrays at all (the empty subarray is not counted).'],
            ['nums = [5], k = 5', '1', 'The single element matches.'],
            ['nums = [5], k = 3', '0', 'No match.'],
            ['nums = [0, 0, 0], k = 0', '6', 'Every one of the 6 subarrays sums to 0.'],
            ['nums = [1, -1, 1, -1], k = 0', '4', 'Repeated prefix sums produce several matches.'],
            ['nums = [-3, 4, -1, 3], k = 3', '3', 'Negative numbers; one match spans the whole array.'],
            ['nums = [2, 2], k = 2', '2', 'Example 2.'],
            ['nums = [1, 2, -1, 1, 2], k = 3', '3', 'Example 1.'],
          ], { fn: ['k_sum_subarrays_brute_force', 'k_sum_subarrays'] }),
          tips(
            "Seed the map with `{0: 1}`; forgetting it misses every subarray that starts at index 0.",
            "Look up `curr - k` **before** inserting `curr`. Otherwise, when `k = 0`, the current prefix would count itself as an empty subarray."
          ),
        ],
      },

      {
        id: 'product-array-without-current-element',
        title: 'Product Array Without Current Element',
        body: [
          p("Given an integer array `nums`, return an array `result` where `result[i]` is the **product of every element except `nums[i]`**. Don't use division (it fails when the array contains zeros), and aim for $O(n)$ time."),
          ex('nums = [2, 3, 1, 4, 5]', '[60, 40, 120, 30, 24]', 'e.g. `result[1] = 2 × 1 × 4 × 5 = 40`.'),
          ex('nums = [2, 0, 3]', '[0, 6, 0]'),
          ap(1, 'Brute force: multiply everything else, for every index'),
          p("For each index, multiply all the other elements."),
          code(`
            from typing import List

            def product_array_brute_force(nums: List[int]) -> List[int]:
                result = []
                for i in range(len(nums)):
                    product = 1
                    for j, x in enumerate(nums):
                        if j != i:
                            product *= x
                    result.append(product)
                return result
            `, `
            function productArrayBruteForce(nums) {
              return nums.map((_, i) => nums.reduce((product, x, j) => (j === i ? product : product * x), 1));
            }
            `, `
            public int[] productArrayBruteForce(int[] nums) {
                int[] result = new int[nums.length];
                for (int i = 0; i < nums.length; i++) {
                    int product = 1;
                    for (int j = 0; j < nums.length; j++) if (j != i) product *= nums[j];
                    result[i] = product;
                }
                return result;
            }
            `),
          cost("$O(n^2)$.", "$O(1)$ besides the output."),
          ap(2, 'Total product and division (if division were allowed)'),
          p("It's worth knowing why division is banned. The obvious trick is `result[i] = total / nums[i]`, but zeros break it, so it needs special cases: with **two or more** zeros every product is 0; with **exactly one** zero, only the zero's own position gets the product of the other numbers."),
          code(`
            from typing import List

            def product_array_division(nums: List[int]) -> List[int]:
                zeros = nums.count(0)
                product = 1
                for x in nums:
                    if x != 0:
                        product *= x  # product of the non-zero values
                result = []
                for x in nums:
                    if zeros > 1:
                        result.append(0)
                    elif zeros == 1:
                        result.append(product if x == 0 else 0)
                    else:
                        result.append(product // x)  # exact: x divides the product
                return result
            `, `
            function productArrayDivision(nums) {
              const zeros = nums.filter(x => x === 0).length;
              const product = nums.reduce((p, x) => (x === 0 ? p : p * x), 1); // non-zero values
              return nums.map(x => (zeros > 1 ? 0 : zeros === 1 ? (x === 0 ? product : 0) : product / x));
            }
            `, `
            public int[] productArrayDivision(int[] nums) {
                int zeros = 0;
                long product = 1;
                for (int x : nums) {
                    if (x == 0) zeros++;
                    else product *= x; // product of the non-zero values
                }
                int[] result = new int[nums.length];
                for (int i = 0; i < nums.length; i++) {
                    if (zeros > 1) result[i] = 0;
                    else if (zeros == 1) result[i] = nums[i] == 0 ? (int) product : 0;
                    else result[i] = (int) (product / nums[i]);
                }
                return result;
            }
            `),
          cost("$O(n)$.", "$O(1)$ besides the output."),
          p("It's linear, but it relies on the forbidden operation and on careful zero handling. The intended solution avoids division entirely."),
          ap(3, 'Left and right product arrays'),
          p("The product of everything except `nums[i]` splits into two parts: the product of everything **to its left** and the product of everything **to its right**. Both are prefix-style running products:"),
          arr([2, 3, 1, 4, 5], { name: 'nums', p: { i: 2 }, on: ['i'], hl: [0, 1], hl2: [3, 4] }),
          arr([1, 2, 6, 6, 24], { name: 'left ', hl: [2], cap: 'left[i]  = product of nums[0..i-1]' }),
          arr([60, 20, 20, 5, 1], { name: 'right', hl: [2], cap: 'right[i] = product of nums[i+1..n-1]' }),
          state('result[2] = left[2] × right[2] = 6 × 20 = 120'),
          code(`
            from typing import List

            def product_array_left_right(nums: List[int]) -> List[int]:
                n = len(nums)
                left = [1] * n   # left[i] = product of nums[0..i-1]
                right = [1] * n  # right[i] = product of nums[i+1..n-1]
                for i in range(1, n):
                    left[i] = left[i - 1] * nums[i - 1]
                for i in range(n - 2, -1, -1):
                    right[i] = right[i + 1] * nums[i + 1]
                return [left[i] * right[i] for i in range(n)]
            `, `
            function productArrayLeftRight(nums) {
              const n = nums.length;
              const left = new Array(n).fill(1), right = new Array(n).fill(1);
              for (let i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
              for (let i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
              return left.map((l, i) => l * right[i]);
            }
            `, `
            public int[] productArrayLeftRight(int[] nums) {
                int n = nums.length;
                int[] left = new int[n], right = new int[n], result = new int[n];
                Arrays.fill(left, 1);
                Arrays.fill(right, 1);
                for (int i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
                for (int i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
                for (int i = 0; i < n; i++) result[i] = left[i] * right[i];
                return result;
            }
            `),
          cost("$O(n)$: three linear passes.", "$O(n)$ for the two helper arrays."),
          ap(4, 'Reuse the output array (optimal)'),
          p("We can avoid the two extra arrays: fill `result` with the left products in a forward pass, then sweep backwards multiplying in a running right product."),
          impl(`
            from typing import List

            def product_array_without_current_element(nums: List[int]) -> List[int]:
                n = len(nums)
                result = [1] * n
                # Forward pass: result[i] = product of everything left of i.
                left = 1
                for i in range(n):
                    result[i] = left
                    left *= nums[i]
                # Backward pass: multiply in the product of everything right of i.
                right = 1
                for i in range(n - 1, -1, -1):
                    result[i] *= right
                    right *= nums[i]
                return result
            `, `
            function productArrayWithoutCurrentElement(nums) {
              const n = nums.length;
              const result = new Array(n).fill(1);
              let left = 1;
              for (let i = 0; i < n; i++) {   // product of everything left of i
                result[i] = left;
                left *= nums[i];
              }
              let right = 1;
              for (let i = n - 1; i >= 0; i--) { // times product of everything right of i
                result[i] *= right;
                right *= nums[i];
              }
              return result;
            }
            `, `
            public int[] productArrayWithoutCurrentElement(int[] nums) {
                int n = nums.length;
                int[] result = new int[n];
                int left = 1;
                for (int i = 0; i < n; i++) {      // product of everything left of i
                    result[i] = left;
                    left *= nums[i];
                }
                int right = 1;
                for (int i = n - 1; i >= 0; i--) { // times product of everything right of i
                    result[i] *= right;
                    right *= nums[i];
                }
                return result;
            }
            `),
          cx("$O(n)$. Two linear passes.", "$O(1)$ extra space besides the output array."),
          vs([
            ['1. Multiply everything else', '$O(n^2)$', '$O(1)$', 'Baseline.'],
            ['2. Total product ÷ element', '$O(n)$', '$O(1)$', 'Not allowed here; needs zero handling.'],
            ['3. Left and right arrays', '$O(n)$', '$O(n)$', 'The key idea, easy to explain.'],
            ['4. Output array + running right product', '$O(n)$', '$O(1)$ extra', 'The expected final answer.'],
          ]),
          tests([
            ['nums = [10]', '[1]', 'One element: the product of nothing is 1.'],
            ['nums = [5, 7]', '[7, 5]', 'Two elements swap.'],
            ['nums = [1, 1, 1]', '[1, 1, 1]', 'All ones.'],
            ['nums = [-1, 2, -3]', '[-6, 3, -2]', 'Negative numbers.'],
            ['nums = [0, 4, 0]', '[0, 0, 0]', 'Two zeros: every product contains a zero.'],
            ['nums = [2, 0, 3]', '[0, 6, 0]', 'Example 2: exactly one zero.'],
            ['nums = [2, 3, 1, 4, 5]', '[60, 40, 120, 30, 24]', 'Example 1.'],
          ], { fn: ['product_array_brute_force', 'product_array_division', 'product_array_left_right', 'product_array_without_current_element'] }),
          tips(
            "The output array doesn't count as extra space, so the final version uses only two running variables. Say that explicitly when you state the space complexity.",
            "The same *product of everything to my left / to my right* split shows up in problems like trapping rain water (with maximums instead of products)."
          ),
        ],
      },
    ],
  });
})();
