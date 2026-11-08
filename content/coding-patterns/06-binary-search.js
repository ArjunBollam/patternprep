(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, state, code, impl, cx, table, rg } = K;

  K.section({
    id: 'binary-search',
    title: 'Binary Search',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Binary Search',
        body: [
          p("**Binary search** finds a target in a **sorted** search space by repeatedly checking the middle and **discarding the half that cannot contain the answer**. Each step halves the remaining range, so even a billion elements need only about 30 comparisons: $O(\\log n)$."),
          arr([1, 3, 4, 6, 8, 9, 11, 14], { p: { left: 0, mid: 3, right: 7 }, on: ['mid'], state: 'target = 9\nnums[mid] = 6 < 9  →  discard left half' }),
          arr([1, 3, 4, 6, 8, 9, 11, 14], { p: { left: 4, mid: 5, right: 7 }, on: ['mid'], dim: rg(0, 3), hl: [5], state: 'nums[mid] = 9  →  found at index 5' }),
          h('It is not just for sorted arrays'),
          p("The real requirement is a **monotonic condition**: some yes/no question about a candidate answer that is false for everything on one side of a boundary and true for everything on the other. Binary search finds that boundary. Examples:"),
          ul(
            "\"Is `nums[i] >= target`?\" → finds the first position where the target could be inserted ([Find the Insertion Index](#/binary-search/find-the-insertion-index)).",
            "\"Does cutting the trees at height `H` give at least `k` wood?\" → true for small `H`, false for large `H` ([Cutting Wood](#/binary-search/cutting-wood)).",
            "\"Is `nums[i]` part of the rotated (smaller) half?\" → finds the rotation point in a rotated array."
          ),
          h('Getting the details right'),
          table(['Decision', 'Options'], [
            ['Search space', '`[0, n - 1]` if the answer is an existing index; `[0, n]` if it can be one past the end; a value range like `[lo, hi]` when searching over answers.'],
            ['Loop condition', '`left <= right` when you return as soon as you find the target; `left < right` when you narrow down to a single remaining candidate.'],
            ['Midpoint', '`mid = left + (right - left) // 2` avoids integer overflow in Java/C++. Use `+ 1` to bias the midpoint upwards when the update is `left = mid`, otherwise the loop can get stuck.'],
            ['Updates', 'Exclude `mid` (`mid ± 1`) when you know it is not the answer; keep it (`left = mid` or `right = mid`) when it still might be.'],
          ]),
          h('Real-world uses'),
          ul(
            "**`git bisect`** binary-searches the commit history to find the commit that introduced a bug.",
            "**Database indexes** (B-trees) and sorted files are searched with the same halving idea.",
            "**Capacity planning**: find the smallest number of servers or the largest batch size that meets a latency target by testing a candidate value.",
            "**Standard libraries**: `bisect` in Python, `Arrays.binarySearch` in Java, `lower_bound` in C++."
          ),
          h('Template'),
          code(`
            def binary_search(nums, target):
                left, right = 0, len(nums) - 1
                while left <= right:
                    mid = left + (right - left) // 2
                    if nums[mid] == target:
                        return mid
                    if nums[mid] < target:
                        left = mid + 1
                    else:
                        right = mid - 1
                return -1
            `, `
            function binarySearch(nums, target) {
              let left = 0, right = nums.length - 1;
              while (left <= right) {
                const mid = left + Math.floor((right - left) / 2);
                if (nums[mid] === target) return mid;
                if (nums[mid] < target) left = mid + 1;
                else right = mid - 1;
              }
              return -1;
            }
            `, `
            int binarySearch(int[] nums, int target) {
                int left = 0, right = nums.length - 1;
                while (left <= right) {
                    int mid = left + (right - left) / 2;
                    if (nums[mid] == target) return mid;
                    if (nums[mid] < target) left = mid + 1;
                    else right = mid - 1;
                }
                return -1;
            }
            `),
        ],
      },

      {
        id: 'find-the-insertion-index',
        title: 'Find the Insertion Index',
        body: [
          p("Given a sorted array of **distinct** integers and a target, return the target's index if it is present. Otherwise return the index where it **would be inserted** to keep the array sorted."),
          ex('nums = [1, 2, 4, 5, 7, 8, 9], target = 4', '2'),
          ex('nums = [1, 2, 4, 5, 7, 8, 9], target = 6', '4', '6 belongs between 5 (index 3) and 7 (index 4).'),
          ex('nums = [1, 2, 4], target = 10', '3'),
          h('Intuition'),
          p("Both cases ask for the same thing: the **first index whose value is greater than or equal to the target** (often called the *lower bound*). If the target exists, that is its index; if not, that is where it would go."),
          p("The condition `nums[i] >= target` is false, false, …, then true, true, … across the array, so binary search can find the first `true`. Because the answer can be `n` (insert at the end), the search space is `[0, n]`."),
          ul(
            "If `nums[mid] >= target`, `mid` could be the answer, but something further left might be too: `right = mid`.",
            "Otherwise `mid` is too small to be the answer: `left = mid + 1`."
          ),
          arr([1, 2, 4, 5, 7, 8, 9], { p: { left: 0, mid: 3, right: 7 }, on: ['mid'], state: 'target = 6\nnums[3] = 5 < 6  →  left = mid + 1' }),
          arr([1, 2, 4, 5, 7, 8, 9], { p: { left: 4, mid: 5, right: 7 }, on: ['mid'], dim: rg(0, 3), state: 'nums[5] = 8 ≥ 6  →  right = mid' }),
          arr([1, 2, 4, 5, 7, 8, 9], { p: { left: 4, mid: 4, right: 5 }, on: ['mid'], dim: [0, 1, 2, 3, 5, 6], state: 'nums[4] = 7 ≥ 6  →  right = mid' }),
          arr([1, 2, 4, 5, 7, 8, 9], { p: { left: 4, right: 4 }, on: ['left', 'right'], hl: [4], dim: [0, 1, 2, 3, 5, 6], state: 'left == right  →  return 4' }),
          impl(`
            from typing import List

            def find_the_insertion_index(nums: List[int], target: int) -> int:
                left, right = 0, len(nums)  # answer may be len(nums)
                while left < right:
                    mid = (left + right) // 2
                    if nums[mid] >= target:
                        right = mid      # mid might be the answer
                    else:
                        left = mid + 1   # mid is too small
                return left
            `, `
            function findTheInsertionIndex(nums, target) {
              let left = 0, right = nums.length; // answer may be nums.length
              while (left < right) {
                const mid = Math.floor((left + right) / 2);
                if (nums[mid] >= target) right = mid; // mid might be the answer
                else left = mid + 1;                  // mid is too small
              }
              return left;
            }
            `, `
            public int findTheInsertionIndex(int[] nums, int target) {
                int left = 0, right = nums.length; // answer may be nums.length
                while (left < right) {
                    int mid = left + (right - left) / 2;
                    if (nums[mid] >= target) right = mid; // mid might be the answer
                    else left = mid + 1;                  // mid is too small
                }
                return left;
            }
            `),
          cx("$O(\\log n)$. The search space halves every iteration.", "$O(1)$."),
        ],
      },

      {
        id: 'first-and-last-occurrences-of-a-number',
        title: 'First and Last Occurrences of a Number',
        body: [
          p("Given a sorted array of integers that may contain **duplicates**, return the indexes of the **first and last occurrence** of a target. If the target is not present, return `[-1, -1]`."),
          ex('nums = [2, 3, 3, 3, 6, 8], target = 3', '[1, 3]'),
          ex('nums = [2, 3, 3, 3, 6, 8], target = 5', '[-1, -1]'),
          h('Intuition'),
          p("A normal binary search stops at *any* copy of the target. We need two modified searches that **keep going** after finding the target:"),
          ul(
            "**Lower bound** (first occurrence): when `nums[mid] == target`, there may be more copies on the left, so keep `mid` and search left: `right = mid`.",
            "**Upper bound** (last occurrence): when `nums[mid] == target`, there may be more copies on the right, so keep `mid` and search right: `left = mid`."
          ),
          arr([2, 3, 3, 3, 6, 8], { p: { left: 0, mid: 2, right: 5 }, on: ['mid'], state: 'lower bound: nums[2] = 3 == target\nkeep mid, go left: right = 2' }),
          arr([2, 3, 3, 3, 6, 8], { p: { left: 1, right: 1 }, hl: [1], dim: [0, 2, 3, 4, 5], state: 'first occurrence = 1' }),
          arr([2, 3, 3, 3, 6, 8], { p: { left: 0, mid: 3, right: 5 }, on: ['mid'], state: 'upper bound: mid = (0 + 5) // 2 + 1 = 3\nnums[3] = 3 == target  →  keep mid, go right: left = 3' }),
          arr([2, 3, 3, 3, 6, 8], { p: { left: 3, mid: 4, right: 4 }, on: ['mid'], dim: [0, 1, 2, 5], state: 'after 8 > 3 moved right to 4:\nnums[4] = 6 > target  →  right = mid - 1' }),
          arr([2, 3, 3, 3, 6, 8], { p: { left: 3, right: 3 }, hl: [3], dim: [0, 1, 2, 4, 5], state: 'last occurrence = 3' }),
          note("**Bias the midpoint upward** in the upper-bound search (`mid = (left + right) // 2 + 1`). With `left = mid` as an update, a downward-rounded midpoint can equal `left` forever when only two elements remain, causing an infinite loop."),
          impl(`
            from typing import List

            def first_and_last_occurrences(nums: List[int], target: int) -> List[int]:
                return [lower_bound(nums, target), upper_bound(nums, target)]

            def lower_bound(nums: List[int], target: int) -> int:
                left, right = 0, len(nums) - 1
                while left < right:
                    mid = (left + right) // 2
                    if nums[mid] < target:
                        left = mid + 1
                    else:
                        right = mid       # mid may be the first occurrence
                return left if nums and nums[left] == target else -1

            def upper_bound(nums: List[int], target: int) -> int:
                left, right = 0, len(nums) - 1
                while left < right:
                    mid = (left + right) // 2 + 1  # bias right
                    if nums[mid] > target:
                        right = mid - 1
                    else:
                        left = mid        # mid may be the last occurrence
                return right if nums and nums[right] == target else -1
            `, `
            function firstAndLastOccurrences(nums, target) {
              return [lowerBound(nums, target), upperBound(nums, target)];
            }

            function lowerBound(nums, target) {
              let left = 0, right = nums.length - 1;
              while (left < right) {
                const mid = Math.floor((left + right) / 2);
                if (nums[mid] < target) left = mid + 1;
                else right = mid; // mid may be the first occurrence
              }
              return nums.length && nums[left] === target ? left : -1;
            }

            function upperBound(nums, target) {
              let left = 0, right = nums.length - 1;
              while (left < right) {
                const mid = Math.floor((left + right) / 2) + 1; // bias right
                if (nums[mid] > target) right = mid - 1;
                else left = mid; // mid may be the last occurrence
              }
              return nums.length && nums[right] === target ? right : -1;
            }
            `, `
            public int[] firstAndLastOccurrences(int[] nums, int target) {
                return new int[]{lowerBound(nums, target), upperBound(nums, target)};
            }

            private int lowerBound(int[] nums, int target) {
                int left = 0, right = nums.length - 1;
                while (left < right) {
                    int mid = left + (right - left) / 2;
                    if (nums[mid] < target) left = mid + 1;
                    else right = mid; // mid may be the first occurrence
                }
                return nums.length > 0 && nums[left] == target ? left : -1;
            }

            private int upperBound(int[] nums, int target) {
                int left = 0, right = nums.length - 1;
                while (left < right) {
                    int mid = left + (right - left) / 2 + 1; // bias right
                    if (nums[mid] > target) right = mid - 1;
                    else left = mid; // mid may be the last occurrence
                }
                return nums.length > 0 && nums[right] == target ? right : -1;
            }
            `),
          cx("$O(\\log n)$. Two binary searches.", "$O(1)$."),
        ],
      },

      {
        id: 'cutting-wood',
        title: 'Cutting Wood',
        body: [
          p("You have a row of trees with the given `heights` and need **at least `k` metres of wood**. You set a saw at height `H` and cut every tree taller than `H` down to `H`, collecting the parts above it (trees at or below `H` give nothing). Return the **highest** `H` that still collects at least `k` metres. Assume it is always possible (at `H = 0` you collect everything)."),
          ex('heights = [2, 6, 3, 8], k = 7', '3', 'at H = 3 you collect (6 - 3) + (8 - 3) = 8 ≥ 7. At H = 4 you only get 2 + 4 = 6.'),
          ex('heights = [5, 5], k = 10', '0'),
          h('Intuition'),
          p("We could try every height from the tallest tree down to 0, but each try costs $O(n)$ and there might be a huge range of heights. Instead, notice that the amount of wood is **monotonic** in `H`: raising the saw never gives *more* wood."),
          K.table(['H', '0', '1', '2', '3', '4', '5', '6', '7', '8'], [
            ['wood', '19', '15', '11', '8', '6', '4', '2', '1', '0'],
            ['≥ 7?', '✓', '✓', '✓', '✓', '✗', '✗', '✗', '✗', '✗'],
          ]),
          p("So the answers form a run of ✓ followed by a run of ✗, and we want the **last ✓**. That's a binary search over **heights**, not over array indexes: the search space is `[0, max(heights)]`."),
          ul(
            "If `H = mid` collects at least `k`, `mid` is valid, and maybe something higher is too: `left = mid`.",
            "Otherwise `mid` is too high: `right = mid - 1`.",
            "Because we update with `left = mid`, bias the midpoint upward."
          ),
          state('left = 0, right = 8\nmid = 5 → wood 4 < 7   → right = 4\nmid = 3 → wood 8 ≥ 7   → left = 3\nmid = 4 → wood 6 < 7   → right = 3\nleft == right → answer 3'),
          impl(`
            from typing import List

            def cutting_wood(heights: List[int], k: int) -> int:
                left, right = 0, max(heights)
                while left < right:
                    mid = (left + right) // 2 + 1  # bias right (we use left = mid)
                    if wood_collected(heights, mid) >= k:
                        left = mid       # valid: try higher
                    else:
                        right = mid - 1  # too high
                return left

            def wood_collected(heights: List[int], h: int) -> int:
                return sum(height - h for height in heights if height > h)
            `, `
            function cuttingWood(heights, k) {
              const woodCollected = h => heights.reduce((sum, x) => sum + (x > h ? x - h : 0), 0);
              let left = 0, right = Math.max(...heights);
              while (left < right) {
                const mid = Math.floor((left + right) / 2) + 1; // bias right
                if (woodCollected(mid) >= k) left = mid; // valid: try higher
                else right = mid - 1;                    // too high
              }
              return left;
            }
            `, `
            public int cuttingWood(int[] heights, int k) {
                int left = 0, right = 0;
                for (int x : heights) right = Math.max(right, x);
                while (left < right) {
                    int mid = left + (right - left) / 2 + 1; // bias right
                    if (woodCollected(heights, mid) >= k) left = mid; // valid: try higher
                    else right = mid - 1;                           // too high
                }
                return left;
            }

            private long woodCollected(int[] heights, int h) {
                long total = 0;
                for (int x : heights) if (x > h) total += x - h;
                return total;
            }
            `),
          cx("$O(n \\log m)$, where $n$ is the number of trees and $m$ the tallest height: $\\log m$ binary-search steps, each summing over all trees.",
            "$O(1)$."),
        ],
      },

      {
        id: 'find-the-target-in-a-rotated-sorted-array',
        title: 'Find the Target in a Rotated Sorted Array',
        body: [
          p("A sorted array of **distinct** integers has been **rotated** at an unknown point, so `[1, 3, 4, 6, 7, 9]` might become `[6, 7, 9, 1, 3, 4]`. Given the rotated array and a target, return the target's index, or `-1` if it is absent. Aim for $O(\\log n)$."),
          ex('nums = [6, 7, 9, 1, 3, 4], target = 3', '4'),
          ex('nums = [6, 7, 9, 1, 3, 4], target = 5', '-1'),
          h('Intuition'),
          p("The array is no longer fully sorted, but here is the key observation: **when you split a rotated array at any `mid`, at least one of the two halves is sorted.** Compare `nums[left]` with `nums[mid]` to tell which one:"),
          ul(
            "If `nums[left] <= nums[mid]`, the **left half** `[left, mid]` is sorted.",
            "Otherwise the **right half** `[mid, right]` is sorted."
          ),
          p("In a sorted half we can check with two comparisons whether the target lies inside it. If it does, search there; if not, it must be in the other half."),
          arr([6, 7, 9, 1, 3, 4], { p: { left: 0, mid: 2, right: 5 }, on: ['mid'], hl2: [0, 1, 2], state: 'target = 3\nnums[0] = 6 ≤ nums[2] = 9  →  left half sorted\n3 is not in [6, 9]  →  left = mid + 1' }),
          arr([6, 7, 9, 1, 3, 4], { p: { left: 3, mid: 4, right: 5 }, on: ['mid'], dim: [0, 1, 2], hl: [4], state: 'nums[4] = 3 == target  →  return 4' }),
          impl(`
            from typing import List

            def find_target_in_rotated_sorted_array(nums: List[int], target: int) -> int:
                left, right = 0, len(nums) - 1
                while left <= right:
                    mid = (left + right) // 2
                    if nums[mid] == target:
                        return mid
                    if nums[left] <= nums[mid]:          # left half is sorted
                        if nums[left] <= target < nums[mid]:
                            right = mid - 1
                        else:
                            left = mid + 1
                    else:                                 # right half is sorted
                        if nums[mid] < target <= nums[right]:
                            left = mid + 1
                        else:
                            right = mid - 1
                return -1
            `, `
            function findTargetInRotatedSortedArray(nums, target) {
              let left = 0, right = nums.length - 1;
              while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                if (nums[mid] === target) return mid;
                if (nums[left] <= nums[mid]) { // left half is sorted
                  if (nums[left] <= target && target < nums[mid]) right = mid - 1;
                  else left = mid + 1;
                } else {                       // right half is sorted
                  if (nums[mid] < target && target <= nums[right]) left = mid + 1;
                  else right = mid - 1;
                }
              }
              return -1;
            }
            `, `
            public int findTargetInRotatedSortedArray(int[] nums, int target) {
                int left = 0, right = nums.length - 1;
                while (left <= right) {
                    int mid = left + (right - left) / 2;
                    if (nums[mid] == target) return mid;
                    if (nums[left] <= nums[mid]) { // left half is sorted
                        if (nums[left] <= target && target < nums[mid]) right = mid - 1;
                        else left = mid + 1;
                    } else {                       // right half is sorted
                        if (nums[mid] < target && target <= nums[right]) left = mid + 1;
                        else right = mid - 1;
                    }
                }
                return -1;
            }
            `),
          cx("$O(\\log n)$. Every iteration discards half of the range.", "$O(1)$."),
        ],
      },

      {
        id: 'find-the-median-from-two-sorted-arrays',
        title: 'Find the Median From Two Sorted Arrays',
        body: [
          p("Given two sorted arrays `nums1` and `nums2`, return the **median** of all their elements combined. (The median of an even-sized collection is the average of its two middle values.) Aim for **$O(\\log(\\min(m, n)))$** time."),
          ex('nums1 = [1, 3, 8], nums2 = [2, 4, 6, 9]', '4.0', 'combined: [1, 2, 3, 4, 6, 8, 9]; the middle value is 4.'),
          ex('nums1 = [1, 2], nums2 = [3, 4]', '2.5'),
          h('Intuition'),
          p("Merging the arrays and picking the middle is $O(m + n)$. To do better, think about what the median *means*: it splits the combined elements into a **left half** and a **right half** of equal size (the left gets one extra when the total is odd), where **everything on the left is ≤ everything on the right**."),
          p("Suppose the left half takes the first `i` elements of `nums1` and the first `j` of `nums2`. Since the left half's size is fixed at `half = (m + n + 1) // 2`, choosing `i` determines `j = half - i`. So we only need to **binary search for `i`** in the shorter array."),
          K.pre(`
            nums1:  1  3 | 8              i = 2   L1 = 3, R1 = 8
            nums2:  2  4 | 6  9           j = 2   L2 = 4, R2 = 6
                    left half | right half
          `),
          p("Because each array is sorted, the split is valid when the two **cross** conditions hold: `L1 ≤ R2` and `L2 ≤ R1`."),
          ul(
            "If `L1 > R2`, we took too many from `nums1`: move `i` left (`hi = i - 1`).",
            "If `L2 > R1`, we took too few from `nums1`: move `i` right (`lo = i + 1`).",
            "Otherwise the split is correct. The median is `max(L1, L2)` for an odd total, or the average of `max(L1, L2)` and `min(R1, R2)` for an even total."
          ),
          p("Use $-∞$ / $+∞$ when a side of the split is empty (e.g. `i = 0` means `L1` doesn't exist)."),
          state('m + n = 7, half = 4\ntry i = 1, j = 3: L1 = 1, R1 = 3, L2 = 6, R2 = 9  → L2 > R1, lo = 2\ntry i = 2, j = 2: L1 = 3, R1 = 8, L2 = 4, R2 = 6  → valid\nodd total → median = max(3, 4) = 4'),
          impl(`
            from typing import List

            def find_the_median(nums1: List[int], nums2: List[int]) -> float:
                if len(nums1) > len(nums2):
                    nums1, nums2 = nums2, nums1      # binary search the shorter one
                m, n = len(nums1), len(nums2)
                half = (m + n + 1) // 2
                lo, hi = 0, m
                while lo <= hi:
                    i = (lo + hi) // 2                # elements taken from nums1
                    j = half - i                      # elements taken from nums2
                    l1 = nums1[i - 1] if i > 0 else float('-inf')
                    r1 = nums1[i] if i < m else float('inf')
                    l2 = nums2[j - 1] if j > 0 else float('-inf')
                    r2 = nums2[j] if j < n else float('inf')
                    if l1 > r2:
                        hi = i - 1
                    elif l2 > r1:
                        lo = i + 1
                    elif (m + n) % 2 == 1:
                        return float(max(l1, l2))
                    else:
                        return (max(l1, l2) + min(r1, r2)) / 2
                return 0.0  # not reached for valid input
            `, `
            function findTheMedian(nums1, nums2) {
              if (nums1.length > nums2.length) [nums1, nums2] = [nums2, nums1];
              const m = nums1.length, n = nums2.length;
              const half = Math.floor((m + n + 1) / 2);
              let lo = 0, hi = m;
              while (lo <= hi) {
                const i = Math.floor((lo + hi) / 2); // elements taken from nums1
                const j = half - i;                  // elements taken from nums2
                const l1 = i > 0 ? nums1[i - 1] : -Infinity;
                const r1 = i < m ? nums1[i] : Infinity;
                const l2 = j > 0 ? nums2[j - 1] : -Infinity;
                const r2 = j < n ? nums2[j] : Infinity;
                if (l1 > r2) hi = i - 1;
                else if (l2 > r1) lo = i + 1;
                else if ((m + n) % 2 === 1) return Math.max(l1, l2);
                else return (Math.max(l1, l2) + Math.min(r1, r2)) / 2;
              }
              return 0;
            }
            `, `
            public double findTheMedian(int[] nums1, int[] nums2) {
                if (nums1.length > nums2.length) return findTheMedian(nums2, nums1);
                int m = nums1.length, n = nums2.length;
                int half = (m + n + 1) / 2;
                int lo = 0, hi = m;
                while (lo <= hi) {
                    int i = (lo + hi) / 2; // elements taken from nums1
                    int j = half - i;      // elements taken from nums2
                    long l1 = i > 0 ? nums1[i - 1] : Long.MIN_VALUE;
                    long r1 = i < m ? nums1[i] : Long.MAX_VALUE;
                    long l2 = j > 0 ? nums2[j - 1] : Long.MIN_VALUE;
                    long r2 = j < n ? nums2[j] : Long.MAX_VALUE;
                    if (l1 > r2) hi = i - 1;
                    else if (l2 > r1) lo = i + 1;
                    else if ((m + n) % 2 == 1) return Math.max(l1, l2);
                    else return (Math.max(l1, l2) + Math.min(r1, r2)) / 2.0;
                }
                return 0;
            }
            `),
          cx("$O(\\log(\\min(m, n)))$. We binary search over the shorter array's split positions.", "$O(1)$."),
        ],
      },

      {
        id: 'matrix-search',
        title: 'Matrix Search',
        body: [
          p("You are given an `m × n` matrix where **each row is sorted** in ascending order and the **first value of each row is greater than the last value of the previous row**. Return whether a target value is in the matrix."),
          ex('matrix = [[2, 3, 4, 6], [7, 10, 11, 17], [20, 21, 24, 33]], target = 21', 'True'),
          ex('same matrix, target = 5', 'False'),
          h('Intuition'),
          p("Read the rows one after another and you get a single sorted list of `m · n` values. So we can binary search over **virtual indexes** `0 … m·n - 1` without actually building that list. A virtual index `k` maps back to a cell with integer division:"),
          state('row = k // n        col = k % n'),
          grid([[2, 3, 4, 6], [7, 10, 11, 17], [20, 21, 24, 33]], { hl2: [[1, 1]], cols: [0, 1, 2, 3], rowsLabels: [0, 1, 2], cap: 'virtual index 5 → row 5 // 4 = 1, col 5 % 4 = 1 → value 10' }),
          state('target = 21, search k in [0, 11]\nk = 5  → 10 < 21  → left = 6\nk = 8  → 20 < 21  → left = 9\nk = 10 → 24 > 21  → right = 9\nk = 9  → 21 == 21 → found'),
          impl(`
            from typing import List

            def matrix_search(matrix: List[List[int]], target: int) -> bool:
                if not matrix or not matrix[0]:
                    return False
                m, n = len(matrix), len(matrix[0])
                left, right = 0, m * n - 1
                while left <= right:
                    mid = (left + right) // 2
                    value = matrix[mid // n][mid % n]
                    if value == target:
                        return True
                    if value < target:
                        left = mid + 1
                    else:
                        right = mid - 1
                return False
            `, `
            function matrixSearch(matrix, target) {
              if (!matrix.length || !matrix[0].length) return false;
              const m = matrix.length, n = matrix[0].length;
              let left = 0, right = m * n - 1;
              while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                const value = matrix[Math.floor(mid / n)][mid % n];
                if (value === target) return true;
                if (value < target) left = mid + 1;
                else right = mid - 1;
              }
              return false;
            }
            `, `
            public boolean matrixSearch(int[][] matrix, int target) {
                if (matrix.length == 0 || matrix[0].length == 0) return false;
                int m = matrix.length, n = matrix[0].length;
                int left = 0, right = m * n - 1;
                while (left <= right) {
                    int mid = left + (right - left) / 2;
                    int value = matrix[mid / n][mid % n];
                    if (value == target) return true;
                    if (value < target) left = mid + 1;
                    else right = mid - 1;
                }
                return false;
            }
            `),
          cx("$O(\\log(m·n))$.", "$O(1)$."),
        ],
      },

      {
        id: 'local-maxima-in-array',
        title: 'Local Maxima in Array',
        body: [
          p("A **local maximum** is an element greater than its neighbours. Treat the positions just outside the array as $-∞$. Given an array in which **no two adjacent elements are equal**, return the index of **any** local maximum in $O(\\log n)$ time."),
          ex('nums = [1, 4, 3, 2, 3]', '1', 'index 4 (value 3, whose right neighbour is -∞) would also be accepted.'),
          ex('nums = [5, 4, 3]', '0'),
          h('Intuition'),
          p("A local maximum always exists: start anywhere and keep walking uphill; since the array ends in $-∞$ on both sides, the climb must stop at a peak. Binary search exploits this \"walk uphill\" idea:"),
          ul(
            "If `nums[mid] < nums[mid + 1]`, we're on an **ascending slope**. Walking right from `mid` goes uphill and must reach a peak before the $-∞$ edge, so a peak exists in `[mid + 1, right]`.",
            "Otherwise we're on a **descending slope** (or at a peak). A peak exists in `[left, mid]`, and `mid` itself might be it."
          ),
          arr([1, 4, 3, 2, 3], { p: { left: 0, mid: 2, right: 4 }, on: ['mid'], state: 'nums[2] = 3 > nums[3] = 2  →  descending\nright = mid' }),
          arr([1, 4, 3, 2, 3], { p: { left: 0, mid: 1, right: 2 }, on: ['mid'], dim: [3, 4], state: 'nums[1] = 4 > nums[2] = 3  →  right = mid' }),
          arr([1, 4, 3, 2, 3], { p: { left: 0, mid: 0, right: 1 }, on: ['mid'], dim: [2, 3, 4], state: 'nums[0] = 1 < nums[1] = 4  →  ascending\nleft = mid + 1' }),
          arr([1, 4, 3, 2, 3], { p: { left: 1, right: 1 }, hl: [1], dim: [0, 2, 3, 4], state: 'left == right  →  return 1' }),
          impl(`
            from typing import List

            def local_maxima_in_array(nums: List[int]) -> int:
                left, right = 0, len(nums) - 1
                while left < right:
                    mid = (left + right) // 2
                    if nums[mid] < nums[mid + 1]:
                        left = mid + 1   # uphill to the right
                    else:
                        right = mid      # mid may be the peak
                return left
            `, `
            function localMaximaInArray(nums) {
              let left = 0, right = nums.length - 1;
              while (left < right) {
                const mid = Math.floor((left + right) / 2);
                if (nums[mid] < nums[mid + 1]) left = mid + 1; // uphill to the right
                else right = mid;                              // mid may be the peak
              }
              return left;
            }
            `, `
            public int localMaximaInArray(int[] nums) {
                int left = 0, right = nums.length - 1;
                while (left < right) {
                    int mid = left + (right - left) / 2;
                    if (nums[mid] < nums[mid + 1]) left = mid + 1; // uphill to the right
                    else right = mid;                              // mid may be the peak
                }
                return left;
            }
            `),
          cx("$O(\\log n)$.", "$O(1)$."),
        ],
      },

      {
        id: 'weighted-random-selection',
        title: 'Weighted Random Selection',
        body: [
          p("Given an array of positive integer `weights`, implement `select()`, which returns an index `i` at random with probability **`weights[i] / sum(weights)`**."),
          ex('weights = [3, 1, 2]', 'select() returns 0 with probability 3/6, 1 with 1/6, 2 with 2/6'),
          h('Intuition'),
          p("Picture the weights laid end to end on a number line from 1 to the total. Each index **owns a stretch** whose length equals its weight. Pick a random integer in `[1, total]` and return the index whose stretch contains it. Bigger weights own longer stretches, so they're picked proportionally more often."),
          K.bars([[0, 3], [3, 4], [4, 6]], { hl: [0], hl2: [2], cap: 'index 0 owns 1-3, index 1 owns 4, index 2 owns 5-6' }),
          p("The right end of each stretch is a **prefix sum**: `prefix = [3, 4, 6]`. A random value `r` belongs to the **first index whose prefix sum is ≥ r**, which is a lower-bound binary search on the (sorted, because weights are positive) prefix array."),
          arr([3, 4, 6], { name: 'prefix', p: { left: 0, right: 2 }, state: 'r = 5\nfirst prefix ≥ 5 is 6 at index 2  →  select 2' }),
          impl(`
            import random
            from typing import List

            class WeightedRandomSelection:
                def __init__(self, weights: List[int]):
                    self.prefix = []
                    total = 0
                    for w in weights:
                        total += w
                        self.prefix.append(total)

                def select(self) -> int:
                    r = random.randint(1, self.prefix[-1])  # inclusive
                    left, right = 0, len(self.prefix) - 1
                    while left < right:                     # first prefix >= r
                        mid = (left + right) // 2
                        if self.prefix[mid] >= r:
                            right = mid
                        else:
                            left = mid + 1
                    return left
            `, `
            class WeightedRandomSelection {
              constructor(weights) {
                this.prefix = [];
                let total = 0;
                for (const w of weights) {
                  total += w;
                  this.prefix.push(total);
                }
              }

              select() {
                const total = this.prefix[this.prefix.length - 1];
                const r = Math.floor(Math.random() * total) + 1; // 1..total
                let left = 0, right = this.prefix.length - 1;
                while (left < right) {                           // first prefix >= r
                  const mid = Math.floor((left + right) / 2);
                  if (this.prefix[mid] >= r) right = mid;
                  else left = mid + 1;
                }
                return left;
              }
            }
            `, `
            class WeightedRandomSelection {
                private final int[] prefix;
                private final Random random = new Random();

                public WeightedRandomSelection(int[] weights) {
                    prefix = new int[weights.length];
                    int total = 0;
                    for (int i = 0; i < weights.length; i++) {
                        total += weights[i];
                        prefix[i] = total;
                    }
                }

                public int select() {
                    int r = random.nextInt(prefix[prefix.length - 1]) + 1; // 1..total
                    int left = 0, right = prefix.length - 1;
                    while (left < right) {                                 // first prefix >= r
                        int mid = left + (right - left) / 2;
                        if (prefix[mid] >= r) right = mid;
                        else left = mid + 1;
                    }
                    return left;
                }
            }
            `),
          cx("Constructor $O(n)$ to build the prefix sums; `select()` $O(\\log n)$.",
            "$O(n)$ for the prefix-sum array."),
        ],
      },
    ],
  });
})();
