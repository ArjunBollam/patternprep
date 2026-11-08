/* Additional classic problems for Dynamic Programming, Sort and Search, and Math and Geometry. */
(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, state, code, impl, cx, pre, rg } = K;

  K.lessons('dynamic-programming', [
    {
      id: 'maximum-subarray-sum',
      title: 'Maximum Subarray Sum',
      body: [
        p("Given an array of integers (possibly negative), return the **largest sum of any non-empty contiguous subarray**."),
        ex('nums = [3, 1, -6, 2, -1, 4, -9]', '5', 'the subarray `[2, -1, 4]`.'),
        ex('nums = [-4, -2, -7]', '-2'),
        h('Intuition: Kadane\'s algorithm'),
        p("Let `best_ending_here` be the best sum of a subarray that **ends at** index `i`. Such a subarray either extends the best one ending at `i - 1`, or starts fresh at `i`, whichever is larger:"),
        state('ending_here(i) = max(nums[i], ending_here(i - 1) + nums[i])\nanswer = max over all i of ending_here(i)'),
        p("In words: if the running sum has become negative, it can only hurt what follows, so drop it and start again."),
        arr([3, 1, -6, 2, -1, 4, -9], { hl: rg(3, 5), state: 'ending_here: 3, 4, -2, 2, 1, 5, -4\nbest = 5' }),
        impl(`
          from typing import List

          def maximum_subarray_sum(nums: List[int]) -> int:
              best = ending_here = nums[0]
              for x in nums[1:]:
                  ending_here = max(x, ending_here + x)   # extend or start fresh
                  best = max(best, ending_here)
              return best
          `, `
          function maximumSubarraySum(nums) {
            let best = nums[0], endingHere = nums[0];
            for (let i = 1; i < nums.length; i++) {
              endingHere = Math.max(nums[i], endingHere + nums[i]); // extend or start fresh
              best = Math.max(best, endingHere);
            }
            return best;
          }
          `, `
          public int maximumSubarraySum(int[] nums) {
              int best = nums[0], endingHere = nums[0];
              for (int i = 1; i < nums.length; i++) {
                  endingHere = Math.max(nums[i], endingHere + nums[i]); // extend or start fresh
                  best = Math.max(best, endingHere);
              }
              return best;
          }
          `),
        cx("$O(n)$.", "$O(1)$."),
      ],
    },

    {
      id: 'longest-palindrome-in-a-string',
      title: 'Longest Palindrome in a String',
      body: [
        p("Return the **longest substring** of a string that is a palindrome. If several have the same length, return any of them."),
        ex('s = "abccbaba"', '"abccba"'),
        ex('s = "racecars"', '"racecar"'),
        h('Intuition'),
        p("A DP table `is_pal[i][j]` works in $O(n^2)$ time and space. A simpler approach with $O(1)$ space: every palindrome has a **centre**, either a single character (odd length) or the gap between two characters (even length). There are `2n - 1` centres; from each one, **expand outwards** while the characters on both sides match."),
        arr('abccbaba', { p: { l: 0, r: 5 }, hl: rg(0, 5), state: 'centre between the two c\'s\nexpand: cc → bccb → abccba (length 6)' }),
        impl(`
          def longest_palindrome(s: str) -> str:
              best_start, best_len = 0, 0
              for center in range(len(s)):
                  for left, right in ((center, center), (center, center + 1)):  # odd, even
                      while left >= 0 and right < len(s) and s[left] == s[right]:
                          left -= 1
                          right += 1
                      length = right - left - 1
                      if length > best_len:
                          best_start, best_len = left + 1, length
              return s[best_start:best_start + best_len]
          `, `
          function longestPalindrome(s) {
            let bestStart = 0, bestLen = 0;
            for (let center = 0; center < s.length; center++) {
              for (const [l0, r0] of [[center, center], [center, center + 1]]) { // odd, even
                let left = l0, right = r0;
                while (left >= 0 && right < s.length && s[left] === s[right]) { left--; right++; }
                const length = right - left - 1;
                if (length > bestLen) { bestStart = left + 1; bestLen = length; }
              }
            }
            return s.slice(bestStart, bestStart + bestLen);
          }
          `, `
          public String longestPalindrome(String s) {
              int bestStart = 0, bestLen = 0;
              for (int center = 0; center < s.length(); center++) {
                  for (int k = 0; k < 2; k++) {               // k = 0: odd, k = 1: even
                      int left = center, right = center + k;
                      while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) { left--; right++; }
                      int length = right - left - 1;
                      if (length > bestLen) { bestStart = left + 1; bestLen = length; }
                  }
              }
              return s.substring(bestStart, bestStart + bestLen);
          }
          `),
        cx("$O(n^2)$: up to $O(n)$ expansion from each of $2n - 1$ centres.", "$O(1)$ beyond the output."),
      ],
    },

    {
      id: 'largest-square-in-a-matrix',
      title: 'Largest Square in a Matrix',
      body: [
        p("Given a binary matrix, return the **area of the largest square** containing only 1s."),
        ex('matrix = [[1, 0, 1, 1, 0], [0, 1, 1, 1, 1], [1, 1, 1, 1, 0], [1, 1, 1, 1, 1]]', '9', 'a 3 × 3 square of 1s in rows 1-3, columns 1-3.'),
        grid([[1, 0, 1, 1, 0], [0, 1, 1, 1, 1], [1, 1, 1, 1, 0], [1, 1, 1, 1, 1]], { hl: [[1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3]] }),
        h('Intuition'),
        p("Let `dp[r][c]` be the side length of the largest all-1 square whose **bottom-right corner** is at `(r, c)`. A square of side `k` ending there needs squares of side `k - 1` ending above, to the left, and diagonally up-left, so:"),
        state('dp[r][c] = 1 + min(dp[r-1][c], dp[r][c-1], dp[r-1][c-1])   if matrix[r][c] == 1\ndp[r][c] = 0                                                  otherwise'),
        p("The answer is the square of the largest `dp` value."),
        impl(`
          from typing import List

          def largest_square(matrix: List[List[int]]) -> int:
              if not matrix:
                  return 0
              rows, cols = len(matrix), len(matrix[0])
              dp = [[0] * (cols + 1) for _ in range(rows + 1)]   # padded with a zero border
              side = 0
              for r in range(rows):
                  for c in range(cols):
                      if matrix[r][c] == 1:
                          dp[r + 1][c + 1] = 1 + min(dp[r][c + 1], dp[r + 1][c], dp[r][c])
                          side = max(side, dp[r + 1][c + 1])
              return side * side
          `, `
          function largestSquare(matrix) {
            if (!matrix.length) return 0;
            const rows = matrix.length, cols = matrix[0].length;
            const dp = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
            let side = 0;
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                if (matrix[r][c] === 1) {
                  dp[r + 1][c + 1] = 1 + Math.min(dp[r][c + 1], dp[r + 1][c], dp[r][c]);
                  side = Math.max(side, dp[r + 1][c + 1]);
                }
              }
            }
            return side * side;
          }
          `, `
          public int largestSquare(int[][] matrix) {
              if (matrix.length == 0) return 0;
              int rows = matrix.length, cols = matrix[0].length, side = 0;
              int[][] dp = new int[rows + 1][cols + 1]; // padded with a zero border
              for (int r = 0; r < rows; r++) {
                  for (int c = 0; c < cols; c++) {
                      if (matrix[r][c] == 1) {
                          dp[r + 1][c + 1] = 1 + Math.min(dp[r][c + 1], Math.min(dp[r + 1][c], dp[r][c]));
                          side = Math.max(side, dp[r + 1][c + 1]);
                      }
                  }
              }
              return side * side;
          }
          `),
        cx("$O(m·n)$.", "$O(m·n)$, or $O(n)$ keeping only the previous row."),
      ],
    },
  ]);

  K.lessons('sort-and-search', [
    {
      id: 'dutch-national-flag',
      title: 'Dutch National Flag',
      body: [
        p("Given an array containing only `0`, `1` and `2`, sort it **in place in one pass**, without a counting pass."),
        ex('nums = [2, 0, 1, 2, 1, 0]', '[0, 0, 1, 1, 2, 2]'),
        h('Intuition'),
        p("Maintain three regions with three pointers: everything before `low` is 0, everything after `high` is 2, and `mid` scans the unknown middle."),
        ul(
          "`nums[mid] == 0`: swap it to `low`; advance both `low` and `mid`.",
          "`nums[mid] == 1`: already in the right region; advance `mid`.",
          "`nums[mid] == 2`: swap it to `high` and move `high` left. **Don't** advance `mid`: the value swapped in hasn't been examined yet."
        ),
        arr([0, 1, 1, 2, 0, 2], { p: { low: 1, mid: 3, high: 4 }, on: ['mid'], hl: [0], hl2: [5], state: 'nums[mid] = 2 → swap with high, high -= 1' }),
        impl(`
          from typing import List

          def dutch_national_flag(nums: List[int]) -> None:
              low, mid, high = 0, 0, len(nums) - 1
              while mid <= high:
                  if nums[mid] == 0:
                      nums[low], nums[mid] = nums[mid], nums[low]
                      low += 1
                      mid += 1
                  elif nums[mid] == 1:
                      mid += 1
                  else:
                      nums[mid], nums[high] = nums[high], nums[mid]
                      high -= 1          # don't advance mid: new value is unexamined
          `, `
          function dutchNationalFlag(nums) {
            let low = 0, mid = 0, high = nums.length - 1;
            while (mid <= high) {
              if (nums[mid] === 0) { [nums[low], nums[mid]] = [nums[mid], nums[low]]; low++; mid++; }
              else if (nums[mid] === 1) mid++;
              else { [nums[mid], nums[high]] = [nums[high], nums[mid]]; high--; } // new value unexamined
            }
          }
          `, `
          public void dutchNationalFlag(int[] nums) {
              int low = 0, mid = 0, high = nums.length - 1;
              while (mid <= high) {
                  if (nums[mid] == 0) { swap(nums, low++, mid++); }
                  else if (nums[mid] == 1) { mid++; }
                  else { swap(nums, mid, high--); } // new value at mid is unexamined
              }
          }

          private void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
          `),
        cx("$O(n)$, a single pass.", "$O(1)$."),
      ],
    },
  ]);

  K.lessons('math-and-geometry', [
    {
      id: 'maximum-collinear-points',
      title: 'Maximum Collinear Points',
      body: [
        p("Given distinct points on a 2-D plane, return the **largest number of points that lie on the same straight line**."),
        ex('points = [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3], [4, 4]]', '4', '(1, 1), (2, 2), (3, 3) and (4, 4) lie on the line y = x.'),
        h('Intuition'),
        p("Fix one point as an **anchor**. Every other point defines a line through the anchor, identified by its **slope**. Points with the same slope from the anchor are on the same line, so count slopes with a hash map: the best line through this anchor has `max count + 1` points. Try every anchor."),
        h3('Representing slopes exactly'),
        p("Floating-point slopes like `1/3` can compare unequal due to rounding, and vertical lines have infinite slope. Instead store the slope as a **reduced fraction** `(dy, dx)`: divide both by their GCD and normalise the sign (e.g. make `dx` positive, and for vertical lines use `(1, 0)`)."),
        state('anchor (1,1): (2,2) → (1,1), (3,3) → (1,1), (4,4) → (1,1)\nslope (1,1) appears 3 times → 3 + 1 = 4 points'),
        impl(`
          from math import gcd
          from typing import List

          def max_collinear_points(points: List[List[int]]) -> int:
              if len(points) <= 2:
                  return len(points)
              best = 0
              for i, (x1, y1) in enumerate(points):
                  slopes = {}
                  for j, (x2, y2) in enumerate(points):
                      if i == j:
                          continue
                      dy, dx = y2 - y1, x2 - x1
                      g = gcd(dy, dx)
                      dy, dx = dy // g, dx // g
                      if dx < 0 or (dx == 0 and dy < 0):   # one canonical sign per direction
                          dy, dx = -dy, -dx
                      slopes[(dy, dx)] = slopes.get((dy, dx), 0) + 1
                  best = max(best, max(slopes.values()) + 1)
              return best
          `, `
          function maxCollinearPoints(points) {
            if (points.length <= 2) return points.length;
            const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
            let best = 0;
            for (let i = 0; i < points.length; i++) {
              const slopes = new Map();
              for (let j = 0; j < points.length; j++) {
                if (i === j) continue;
                let dy = points[j][1] - points[i][1], dx = points[j][0] - points[i][0];
                const g = gcd(dy, dx);
                dy /= g; dx /= g;
                if (dx < 0 || (dx === 0 && dy < 0)) { dy = -dy; dx = -dx; } // canonical sign
                const key = dy + '/' + dx;
                slopes.set(key, (slopes.get(key) || 0) + 1);
              }
              best = Math.max(best, Math.max(...slopes.values()) + 1);
            }
            return best;
          }
          `, `
          public int maxCollinearPoints(int[][] points) {
              if (points.length <= 2) return points.length;
              int best = 0;
              for (int i = 0; i < points.length; i++) {
                  Map<String, Integer> slopes = new HashMap<>();
                  for (int j = 0; j < points.length; j++) {
                      if (i == j) continue;
                      int dy = points[j][1] - points[i][1], dx = points[j][0] - points[i][0];
                      int g = gcd(dy, dx);
                      dy /= g; dx /= g;
                      if (dx < 0 || (dx == 0 && dy < 0)) { dy = -dy; dx = -dx; } // canonical sign
                      slopes.merge(dy + "/" + dx, 1, Integer::sum);
                  }
                  for (int count : slopes.values()) best = Math.max(best, count + 1);
              }
              return best;
          }

          private int gcd(int a, int b) { return b == 0 ? Math.abs(a) : gcd(b, a % b); }
          `),
        cx("$O(n^2)$ slope computations (each with an $O(\\log)$ GCD).", "$O(n)$ for the slope map."),
      ],
    },
  ]);
})();
