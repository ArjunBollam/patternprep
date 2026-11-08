(function () {
  const { p, h, h3, ul, ol, note, ex, arr, state, code, impl, cx, rg } = K;

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
          h('Intuition'),
          p("Summing the range on every query costs $O(n)$ per query. Because the array is fixed, we can pay $O(n)$ **once** to build a prefix-sum array and then answer every query in $O(1)$."),
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
        ],
      },

      {
        id: 'k-sum-subarrays',
        title: 'K-Sum Subarrays',
        body: [
          p("Given an integer array (which may contain **negative** numbers) and an integer `k`, return the **number of contiguous subarrays whose sum equals `k`**."),
          ex('nums = [1, 2, -1, 1, 2], k = 3', '3', 'the subarrays are `[1, 2]` (indexes 0-1), `[1, 2, -1, 1]` (0-3) and `[1, 2]` (3-4).'),
          ex('nums = [2, 2], k = 2', '2'),
          h('Intuition'),
          p("Because of negative numbers, a sliding window doesn't work here: growing the window can make the sum smaller. Prefix sums do work. The subarray `nums[i..j]` sums to `k` exactly when:"),
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
        ],
      },

      {
        id: 'product-array-without-current-element',
        title: 'Product Array Without Current Element',
        body: [
          p("Given an integer array `nums`, return an array `result` where `result[i]` is the **product of every element except `nums[i]`**. Don't use division (it fails when the array contains zeros), and aim for $O(n)$ time."),
          ex('nums = [2, 3, 1, 4, 5]', '[60, 40, 120, 30, 24]', 'e.g. `result[1] = 2 × 1 × 4 × 5 = 40`.'),
          ex('nums = [2, 0, 3]', '[0, 6, 0]'),
          h('Intuition'),
          p("The product of everything except `nums[i]` splits into two parts: the product of everything **to its left** and the product of everything **to its right**. Both are prefix-style running products:"),
          arr([2, 3, 1, 4, 5], { name: 'nums', p: { i: 2 }, on: ['i'], hl: [0, 1], hl2: [3, 4] }),
          arr([1, 2, 6, 6, 24], { name: 'left ', hl: [2], cap: 'left[i]  = product of nums[0..i-1]' }),
          arr([60, 20, 20, 5, 1], { name: 'right', hl: [2], cap: 'right[i] = product of nums[i+1..n-1]' }),
          state('result[2] = left[2] × right[2] = 6 × 20 = 120'),
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
        ],
      },
    ],
  });
})();
