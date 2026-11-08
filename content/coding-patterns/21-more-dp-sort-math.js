/* Additional classic problems for Dynamic Programming, Sort and Search, and Math and Geometry. */
(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, state, code, impl, cx, pre, rg, table, ap, cost, vs, tests, tips } = K;

  K.lessons('dynamic-programming', [
    {
      id: 'maximum-subarray-sum',
      title: 'Maximum Subarray Sum',
      body: [
        p("Given an array of integers (possibly negative), return the **largest sum of any non-empty contiguous subarray**."),
        ex('nums = [3, 1, -6, 2, -1, 4, -9]', '5', 'the subarray `[2, -1, 4]`.'),
        ex('nums = [-4, -2, -7]', '-2'),
        ap(1, 'Brute force: every subarray'),
        p("Fix a start index and extend the end one step at a time, keeping a running sum so each extension is $O(1)$."),
        code(`
          from typing import List

          def maximum_subarray_brute_force(nums: List[int]) -> int:
              best = float('-inf')
              for i in range(len(nums)):
                  total = 0
                  for j in range(i, len(nums)):
                      total += nums[j]  # sum of nums[i..j]
                      best = max(best, total)
              return best
          `, `
          function maximumSubarrayBruteForce(nums) {
            let best = -Infinity;
            for (let i = 0; i < nums.length; i++) {
              let total = 0;
              for (let j = i; j < nums.length; j++) best = Math.max(best, (total += nums[j])); // nums[i..j]
            }
            return best;
          }
          `, `
          public int maximumSubarrayBruteForce(int[] nums) {
              int best = Integer.MIN_VALUE;
              for (int i = 0; i < nums.length; i++) {
                  int total = 0;
                  for (int j = i; j < nums.length; j++) best = Math.max(best, total += nums[j]); // nums[i..j]
              }
              return best;
          }
          `),
        cost("$O(n^2)$.", "$O(1)$."),
        ap(2, 'Divide and conquer'),
        p("Split the array in half. The best subarray lies entirely in the left half, entirely in the right half, or **crosses the middle**. The first two are recursive calls. The crossing one is the best suffix of the left half plus the best prefix of the right half, found with two linear scans from the middle outwards."),
        code(`
          from typing import List

          def maximum_subarray_divide_and_conquer(nums: List[int]) -> int:
              def best(lo: int, hi: int) -> int:  # best sum within nums[lo..hi]
                  if lo == hi:
                      return nums[lo]
                  mid = (lo + hi) // 2
                  left_suffix, total = float('-inf'), 0
                  for i in range(mid, lo - 1, -1):      # best sum ending at mid
                      total += nums[i]
                      left_suffix = max(left_suffix, total)
                  right_prefix, total = float('-inf'), 0
                  for i in range(mid + 1, hi + 1):      # best sum starting at mid + 1
                      total += nums[i]
                      right_prefix = max(right_prefix, total)
                  return max(best(lo, mid), best(mid + 1, hi), left_suffix + right_prefix)

              return best(0, len(nums) - 1)
          `, `
          function maximumSubarrayDivideAndConquer(nums) {
            const best = (lo, hi) => { // best sum within nums[lo..hi]
              if (lo === hi) return nums[lo];
              const mid = (lo + hi) >> 1;
              let leftSuffix = -Infinity, rightPrefix = -Infinity, total = 0;
              for (let i = mid; i >= lo; i--) leftSuffix = Math.max(leftSuffix, (total += nums[i])); // ends at mid
              total = 0;
              for (let i = mid + 1; i <= hi; i++) rightPrefix = Math.max(rightPrefix, (total += nums[i])); // starts at mid + 1
              return Math.max(best(lo, mid), best(mid + 1, hi), leftSuffix + rightPrefix);
            };
            return best(0, nums.length - 1);
          }
          `, `
          public int maximumSubarrayDivideAndConquer(int[] nums) {
              return best(nums, 0, nums.length - 1);
          }

          private int best(int[] nums, int lo, int hi) { // best sum within nums[lo..hi]
              if (lo == hi) return nums[lo];
              int mid = (lo + hi) / 2;
              int leftSuffix = Integer.MIN_VALUE, rightPrefix = Integer.MIN_VALUE, total = 0;
              for (int i = mid; i >= lo; i--) leftSuffix = Math.max(leftSuffix, total += nums[i]); // ends at mid
              total = 0;
              for (int i = mid + 1; i <= hi; i++) rightPrefix = Math.max(rightPrefix, total += nums[i]); // starts at mid + 1
              return Math.max(Math.max(best(nums, lo, mid), best(nums, mid + 1, hi)), leftSuffix + rightPrefix);
          }
          `),
        cost("$O(n log n)$: linear work per level, $log n$ levels.", "$O(log n)$ recursion depth."),
        ap(3, 'Prefix sums: subtract the smallest earlier prefix'),
        p("The sum of `nums[i..j]` is `prefix[j + 1] - prefix[i]`. For a fixed end, it's largest when we subtract the **smallest prefix seen so far**. One pass tracks the running prefix and its minimum."),
        code(`
          from typing import List

          def maximum_subarray_prefix(nums: List[int]) -> int:
              best = float('-inf')
              prefix = 0
              min_prefix = 0  # smallest prefix sum before the current position
              for x in nums:
                  prefix += x
                  best = max(best, prefix - min_prefix)
                  min_prefix = min(min_prefix, prefix)
              return best
          `, `
          function maximumSubarrayPrefix(nums) {
            let best = -Infinity, prefix = 0, minPrefix = 0; // smallest prefix before the current position
            for (const x of nums) {
              prefix += x;
              best = Math.max(best, prefix - minPrefix);
              minPrefix = Math.min(minPrefix, prefix);
            }
            return best;
          }
          `, `
          public int maximumSubarrayPrefix(int[] nums) {
              int best = Integer.MIN_VALUE, prefix = 0, minPrefix = 0; // smallest prefix before here
              for (int x : nums) {
                  prefix += x;
                  best = Math.max(best, prefix - minPrefix);
                  minPrefix = Math.min(minPrefix, prefix);
              }
              return best;
          }
          `),
        cost("$O(n)$.", "$O(1)$."),
        ap(4, "Kadane's algorithm (optimal)"),
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
        vs([
          ['1. Every subarray', '$O(n^2)$', '$O(1)$', 'Baseline.'],
          ['2. Divide and conquer', '$O(n log n)$', '$O(log n)$', 'Classic textbook solution; parallelises well.'],
          ['3. Prefix minus smallest prefix', '$O(n)$', '$O(1)$', 'Same speed as Kadane; links to the prefix-sum pattern.'],
          ['4. Kadane', '$O(n)$', '$O(1)$', 'The expected answer.'],
        ]),
        tests([
          ['nums = [5]', '5', 'A single element.'],
          ['nums = [-4, -2, -7]', '-2', 'Example 2: all negative, so the best is one element.'],
          ['nums = [0, -1, 0]', '0', 'Zero beats any negative sum.'],
          ['nums = [1, 2, 3]', '6', 'All positive: the whole array.'],
          ['nums = [-1, 4, -2, 5, -10, 3]', '7', 'A dip inside the best subarray (4, -2, 5).'],
          ['nums = [3, 1, -6, 2, -1, 4, -9]', '5', 'Example 1.'],
        ], { fn: ['maximum_subarray_brute_force', 'maximum_subarray_divide_and_conquer', 'maximum_subarray_prefix', 'maximum_subarray_sum'] }),
        tips(
          "Start `best` at the first element (or $-∞$), not at 0, or an all-negative array returns 0.",
          "Follow-up: return the subarray itself. Remember where the current run started, and record start and end whenever `best` improves."
        ),
      ],
    },

    {
      id: 'longest-palindrome-in-a-string',
      title: 'Longest Palindrome in a String',
      body: [
        p("Return the **longest substring** of a string that is a palindrome. If several have the same length, return any of them."),
        ex('s = "abccbaba"', '"abccba"'),
        ex('s = "racecars"', '"racecar"'),
        ap(1, 'Brute force: check every substring'),
        p("Try every substring, longest first, and return the first one that reads the same backwards."),
        code(`
          def longest_palindrome_brute_force(s: str) -> str:
              n = len(s)
              for length in range(n, 0, -1):  # longest first
                  for start in range(n - length + 1):
                      sub = s[start:start + length]
                      if sub == sub[::-1]:
                          return sub
              return ''
          `, `
          function longestPalindromeBruteForce(s) {
            for (let length = s.length; length > 0; length--) { // longest first
              for (let start = 0; start + length <= s.length; start++) {
                const sub = s.slice(start, start + length);
                if (sub === [...sub].reverse().join('')) return sub;
              }
            }
            return '';
          }
          `, `
          public String longestPalindromeBruteForce(String s) {
              for (int length = s.length(); length > 0; length--) { // longest first
                  for (int start = 0; start + length <= s.length(); start++) {
                      String sub = s.substring(start, start + length);
                      if (new StringBuilder(sub).reverse().toString().equals(sub)) return sub;
                  }
              }
              return "";
          }
          `),
        cost("$O(n^3)$: $O(n^2)$ substrings, each checked in $O(n)$.", "$O(n)$ for the reversed copy."),
        ap(2, 'Dynamic programming table'),
        p("A substring `s[i..j]` is a palindrome when its ends match **and** the inside `s[i+1..j-1]` is a palindrome. Filling `is_pal[i][j]` by increasing length reuses the inner answers, so every check is $O(1)$."),
        code(`
          def longest_palindrome_dp(s: str) -> str:
              n = len(s)
              if n == 0:
                  return ''
              is_pal = [[False] * n for _ in range(n)]
              best_start, best_len = 0, 1
              for i in range(n):
                  is_pal[i][i] = True  # length 1
              for length in range(2, n + 1):
                  for i in range(n - length + 1):
                      j = i + length - 1
                      # ends match, and the inside is a palindrome (or empty)
                      if s[i] == s[j] and (length == 2 or is_pal[i + 1][j - 1]):
                          is_pal[i][j] = True
                          if length > best_len:
                              best_start, best_len = i, length
              return s[best_start:best_start + best_len]
          `, `
          function longestPalindromeDp(s) {
            const n = s.length;
            if (!n) return '';
            const isPal = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j));
            let bestStart = 0, bestLen = 1;
            for (let length = 2; length <= n; length++) {
              for (let i = 0; i + length <= n; i++) {
                const j = i + length - 1;
                if (s[i] === s[j] && (length === 2 || isPal[i + 1][j - 1])) { // ends match, inside is a palindrome
                  isPal[i][j] = true;
                  if (length > bestLen) { bestStart = i; bestLen = length; }
                }
              }
            }
            return s.slice(bestStart, bestStart + bestLen);
          }
          `, `
          public String longestPalindromeDp(String s) {
              int n = s.length();
              if (n == 0) return "";
              boolean[][] isPal = new boolean[n][n];
              int bestStart = 0, bestLen = 1;
              for (int i = 0; i < n; i++) isPal[i][i] = true;
              for (int length = 2; length <= n; length++) {
                  for (int i = 0; i + length <= n; i++) {
                      int j = i + length - 1;
                      if (s.charAt(i) == s.charAt(j) && (length == 2 || isPal[i + 1][j - 1])) { // inside is a palindrome
                          isPal[i][j] = true;
                          if (length > bestLen) { bestStart = i; bestLen = length; }
                      }
                  }
              }
              return s.substring(bestStart, bestStart + bestLen);
          }
          `),
        cost("$O(n^2)$.", "$O(n^2)$ for the table."),
        p("The table stores $n^2$ booleans but we only ever extend palindromes **outwards from their centre**. Doing exactly that, directly, needs no table."),
        ap(3, 'Expand around every centre (optimal)'),
        p("Every palindrome has a **centre**, either a single character (odd length) or the gap between two characters (even length). There are `2n - 1` centres; from each one, **expand outwards** while the characters on both sides match."),
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
        vs([
          ['1. Check every substring', '$O(n^3)$', '$O(n)$', 'Baseline.'],
          ['2. DP table', '$O(n^2)$', '$O(n^2)$', 'Useful when you need palindrome checks for many ranges.'],
          ['3. Expand around centres', '$O(n^2)$', '$O(1)$', 'The expected answer.'],
        ]),
        tests([
          ['s = ""', '""', 'Empty string.'],
          ['s = "a"', '"a"', 'A single character.'],
          ['s = "ab"', '"a"', 'No longer palindrome: either single letter is accepted.'],
          ['s = "aaaa"', '"aaaa"', 'An even-length palindrome covering everything.'],
          ['s = "xabay"', '"aba"', 'An odd-length palindrome in the middle.'],
          ['s = "abccbaba"', '"abccba"', 'Example 1.'],
          ['s = "racecars"', '"racecar"', 'Example 2.'],
        ], {
          fn: ['longest_palindrome_brute_force', 'longest_palindrome_dp', 'longest_palindrome'],
          check: "lambda r, e, kw: len(r) == len(e) and r == r[::-1] and r in kw['s']",
          jscheck: "(r, e, kw) => r.length === e.length && r === [...r].reverse().join('') && kw.s.includes(r)",
        }),
        note("When several palindromes share the maximum length, any of them is correct, so the checker accepts any palindromic substring of the expected length."),
        tips(
          "Remember both kinds of centres. Forgetting the even ones (between two characters) misses answers like `\"abba\"`.",
          "Manacher's algorithm finds the answer in $O(n)$. It's rarely expected, but naming it shows depth."
        ),
      ],
    },

    {
      id: 'largest-square-in-a-matrix',
      title: 'Largest Square in a Matrix',
      body: [
        p("Given a binary matrix, return the **area of the largest square** containing only 1s."),
        ex('matrix = [[1, 0, 1, 1, 0], [0, 1, 1, 1, 1], [1, 1, 1, 1, 0], [1, 1, 1, 1, 1]]', '9', 'a 3 × 3 square of 1s in rows 1-3, columns 1-3.'),
        grid([[1, 0, 1, 1, 0], [0, 1, 1, 1, 1], [1, 1, 1, 1, 0], [1, 1, 1, 1, 1]], { hl: [[1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3]] }),
        ap(1, 'Brute force: grow a square from every cell'),
        p("Treat each cell as a top-left corner and try squares of side 1, 2, 3, … as long as they fit. For each size, check every cell of the square."),
        code(`
          from typing import List

          def largest_square_brute_force(matrix: List[List[int]]) -> int:
              rows, cols = len(matrix), len(matrix[0]) if matrix else 0
              best = 0
              for r in range(rows):
                  for c in range(cols):
                      size = 1
                      while r + size <= rows and c + size <= cols and all(
                              matrix[i][j] == 1 for i in range(r, r + size) for j in range(c, c + size)):
                          best = max(best, size)
                          size += 1
              return best * best
          `, `
          function largestSquareBruteForce(matrix) {
            const rows = matrix.length, cols = rows ? matrix[0].length : 0;
            const allOnes = (r, c, size) => {
              for (let i = r; i < r + size; i++) for (let j = c; j < c + size; j++) if (matrix[i][j] !== 1) return false;
              return true;
            };
            let best = 0;
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                for (let size = 1; r + size <= rows && c + size <= cols && allOnes(r, c, size); size++) best = Math.max(best, size);
              }
            }
            return best * best;
          }
          `, `
          public int largestSquareBruteForce(int[][] matrix) {
              int rows = matrix.length, cols = rows == 0 ? 0 : matrix[0].length, best = 0;
              for (int r = 0; r < rows; r++) {
                  for (int c = 0; c < cols; c++) {
                      for (int size = 1; r + size <= rows && c + size <= cols && allOnes(matrix, r, c, size); size++) {
                          best = Math.max(best, size);
                      }
                  }
              }
              return best * best;
          }

          private boolean allOnes(int[][] m, int r, int c, int size) {
              for (int i = r; i < r + size; i++) for (int j = c; j < c + size; j++) if (m[i][j] != 1) return false;
              return true;
          }
          `),
        cost("$O((m·n)^2)$ in the worst case (a matrix of all 1s): each cell grows up to $min(m, n)$ squares, each checked cell by cell.", "$O(1)$."),
        p("Each larger square re-checks the cells of all the smaller ones. The trick is to describe squares by their **bottom-right** corner, so each answer can be built from three neighbouring answers."),
        ap(2, 'Dynamic programming on the bottom-right corner (optimal)'),
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
        h('Approach 3: The same DP with one row of memory'),
        p("Each `dp` row only reads the row above it, and the cell to its left. Keep a single array for the previous row, plus one variable holding the old value of the diagonal neighbour before it's overwritten."),
        code(`
          from typing import List

          def largest_square_one_row(matrix: List[List[int]]) -> int:
              if not matrix:
                  return 0
              cols = len(matrix[0])
              row = [0] * (cols + 1)  # row[c + 1] = dp value of the previous row
              side = 0
              for r in range(len(matrix)):
                  diagonal = 0  # dp[r - 1][c - 1] before it is overwritten
                  for c in range(cols):
                      above = row[c + 1]
                      row[c + 1] = 1 + min(above, row[c], diagonal) if matrix[r][c] == 1 else 0
                      diagonal = above
                      side = max(side, row[c + 1])
              return side * side
          `, `
          function largestSquareOneRow(matrix) {
            if (!matrix.length) return 0;
            const cols = matrix[0].length;
            const row = new Array(cols + 1).fill(0); // previous row's dp values, shifted by one
            let side = 0;
            for (let r = 0; r < matrix.length; r++) {
              let diagonal = 0; // dp[r - 1][c - 1] before it is overwritten
              for (let c = 0; c < cols; c++) {
                const above = row[c + 1];
                row[c + 1] = matrix[r][c] === 1 ? 1 + Math.min(above, row[c], diagonal) : 0;
                diagonal = above;
                side = Math.max(side, row[c + 1]);
              }
            }
            return side * side;
          }
          `, `
          public int largestSquareOneRow(int[][] matrix) {
              if (matrix.length == 0) return 0;
              int cols = matrix[0].length, side = 0;
              int[] row = new int[cols + 1]; // previous row's dp values, shifted by one
              for (int[] cells : matrix) {
                  int diagonal = 0; // dp[r - 1][c - 1] before it is overwritten
                  for (int c = 0; c < cols; c++) {
                      int above = row[c + 1];
                      row[c + 1] = cells[c] == 1 ? 1 + Math.min(above, Math.min(row[c], diagonal)) : 0;
                      diagonal = above;
                      side = Math.max(side, row[c + 1]);
                  }
              }
              return side * side;
          }
          `),
        cost("$O(m·n)$.", "$O(n)$."),
        vs([
          ['1. Grow from every cell', '$O((m·n)^2)$', '$O(1)$', 'Baseline.'],
          ['2. DP table', '$O(m·n)$', '$O(m·n)$', 'The expected answer.'],
          ['3. DP with one row', '$O(m·n)$', '$O(n)$', 'When memory matters.'],
        ]),
        tests([
          ['matrix = [[0]]', '0', 'No 1s at all.'],
          ['matrix = [[1]]', '1', 'A single 1.'],
          ['matrix = [[0, 1], [1, 0]]', '1', 'Diagonal 1s don\'t form a bigger square.'],
          ['matrix = [[1, 1], [1, 1]]', '4', 'The whole matrix.'],
          ['matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]', '1', 'A hole in the middle breaks every larger square.'],
          ['matrix = [[1, 0, 1, 1, 0], [0, 1, 1, 1, 1], [1, 1, 1, 1, 0], [1, 1, 1, 1, 1]]', '9', 'Example 1.'],
        ], { fn: ['largest_square_brute_force', 'largest_square', 'largest_square_one_row'] }),
        tips(
          "Return the **area** (side squared) if that's what's asked. Returning the side length is a common slip.",
          "The same bottom-right-corner idea counts *all* square submatrices: add up every `dp` value instead of taking the maximum."
        ),
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
        ap(1, 'Counting sort (two passes)'),
        p("With only three possible values, count how many of each there are, then overwrite the array: that many 0s, then 1s, then 2s. It's linear, but it reads the array twice, which the problem rules out."),
        code(`
          from typing import List

          def dutch_flag_counting(nums: List[int]) -> None:
              counts = [0, 0, 0]
              for x in nums:
                  counts[x] += 1
              i = 0
              for value in (0, 1, 2):  # rewrite the array from the counts
                  for _ in range(counts[value]):
                      nums[i] = value
                      i += 1
          `, `
          function dutchFlagCounting(nums) {
            const counts = [0, 0, 0];
            for (const x of nums) counts[x]++;
            let i = 0;
            for (let value = 0; value < 3; value++) { // rewrite the array from the counts
              for (let c = 0; c < counts[value]; c++) nums[i++] = value;
            }
          }
          `, `
          public void dutchFlagCounting(int[] nums) {
              int[] counts = new int[3];
              for (int x : nums) counts[x]++;
              int i = 0;
              for (int value = 0; value < 3; value++) { // rewrite the array from the counts
                  for (int c = 0; c < counts[value]; c++) nums[i++] = value;
              }
          }
          `),
        cost("$O(n)$: two passes.", "$O(1)$."),
        ap(2, 'Two partition passes'),
        p("Use the read/write idea from [Shift Zeros to the End](#/two-pointers/shift-zeros-to-the-end) twice: the first pass swaps every 0 to the front, the second pass swaps every 1 right after the 0s. Whatever is left at the end is 2s."),
        code(`
          from typing import List

          def dutch_flag_two_pass(nums: List[int]) -> None:
              write = 0
              for i in range(len(nums)):  # pass 1: 0s to the front
                  if nums[i] == 0:
                      nums[write], nums[i] = nums[i], nums[write]
                      write += 1
              for i in range(write, len(nums)):  # pass 2: 1s right after the 0s
                  if nums[i] == 1:
                      nums[write], nums[i] = nums[i], nums[write]
                      write += 1
          `, `
          function dutchFlagTwoPass(nums) {
            let write = 0;
            for (let i = 0; i < nums.length; i++) { // pass 1: 0s to the front
              if (nums[i] === 0) { [nums[write], nums[i]] = [nums[i], nums[write]]; write++; }
            }
            for (let i = write; i < nums.length; i++) { // pass 2: 1s right after the 0s
              if (nums[i] === 1) { [nums[write], nums[i]] = [nums[i], nums[write]]; write++; }
            }
          }
          `, `
          public void dutchFlagTwoPass(int[] nums) {
              int write = 0;
              for (int i = 0; i < nums.length; i++) { // pass 1: 0s to the front
                  if (nums[i] == 0) { int t = nums[write]; nums[write] = nums[i]; nums[i] = t; write++; }
              }
              for (int i = write; i < nums.length; i++) { // pass 2: 1s right after the 0s
                  if (nums[i] == 1) { int t = nums[write]; nums[write] = nums[i]; nums[i] = t; write++; }
              }
          }
          `),
        cost("$O(n)$: two passes.", "$O(1)$."),
        ap(3, 'One pass with three pointers (optimal)'),
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
        vs([
          ['1. Counting sort', '$O(n)$, two passes', '$O(1)$', 'When two passes are allowed (simplest).'],
          ['2. Two partition passes', '$O(n)$, two passes', '$O(1)$', 'Works when values are objects with a 0/1/2 key.'],
          ['3. Three pointers, one pass', '$O(n)$, one pass', '$O(1)$', 'The expected answer.'],
        ]),
        tests([
          ['nums = []', '[]', 'Empty array.'],
          ['nums = [1]', '[1]', 'A single element.'],
          ['nums = [2, 0]', '[0, 2]', 'Two elements, swapped.'],
          ['nums = [2, 2, 2]', '[2, 2, 2]', 'Only 2s.'],
          ['nums = [2, 1, 0]', '[0, 1, 2]', 'Reversed.'],
          ['nums = [1, 0, 1, 0]', '[0, 0, 1, 1]', 'No 2s at all.'],
          ['nums = [2, 0, 1, 2, 1, 0]', '[0, 0, 1, 1, 2, 2]', 'Example 1.'],
        ], { fn: ['dutch_flag_counting', 'dutch_flag_two_pass', 'dutch_national_flag'], inplace: 'nums' }),
        tips(
          "The bug to avoid: advancing `mid` after swapping with `high`. The value that arrives from `high` hasn't been examined yet.",
          "The same three-way partition makes quicksort fast on arrays with many duplicates."
        ),
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
        ap(1, 'Brute force: every pair defines a line; count the points on it'),
        p("Any line with two or more points passes through some pair of them. For every pair, count how many points lie on the line through it. Point `(x3, y3)` is on the line through `(x1, y1)` and `(x2, y2)` exactly when the **cross product** `(x2 - x1)(y3 - y1) - (y2 - y1)(x3 - x1)` is 0, which needs only integer arithmetic."),
        code(`
          from typing import List

          def max_collinear_brute_force(points: List[List[int]]) -> int:
              n = len(points)
              if n <= 2:
                  return n
              best = 0
              for i in range(n):
                  for j in range(i + 1, n):
                      (x1, y1), (x2, y2) = points[i], points[j]
                      # (x3, y3) is on line (i, j) when the cross product is 0
                      count = sum(1 for x3, y3 in points if (x2 - x1) * (y3 - y1) == (y2 - y1) * (x3 - x1))
                      best = max(best, count)
              return best
          `, `
          function maxCollinearBruteForce(points) {
            const n = points.length;
            if (n <= 2) return n;
            let best = 0;
            for (let i = 0; i < n; i++) {
              for (let j = i + 1; j < n; j++) {
                const [x1, y1] = points[i], [x2, y2] = points[j];
                // (x3, y3) is on line (i, j) when the cross product is 0
                const count = points.filter(([x3, y3]) => (x2 - x1) * (y3 - y1) === (y2 - y1) * (x3 - x1)).length;
                best = Math.max(best, count);
              }
            }
            return best;
          }
          `, `
          public int maxCollinearBruteForce(int[][] points) {
              int n = points.length;
              if (n <= 2) return n;
              int best = 0;
              for (int i = 0; i < n; i++) {
                  for (int j = i + 1; j < n; j++) {
                      long x1 = points[i][0], y1 = points[i][1], x2 = points[j][0], y2 = points[j][1];
                      int count = 0;
                      for (int[] p : points) if ((x2 - x1) * (p[1] - y1) == (y2 - y1) * (p[0] - x1)) count++; // cross product 0
                      best = Math.max(best, count);
                  }
              }
              return best;
          }
          `),
        cost("$O(n^3)$: $O(n^2)$ pairs, each checked against all $n$ points.", "$O(1)$."),
        p("Counting per pair re-discovers the same line many times. Grouping points by direction from a fixed anchor finds all lines through that anchor in one pass."),
        ap(2, 'Anchor + slope hash map (optimal)'),
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
        vs([
          ['1. Every pair + cross products', '$O(n^3)$', '$O(1)$', 'Small inputs; no hashing or GCD needed.'],
          ['2. Anchor + reduced slopes', '$O(n^2 log C)$', '$O(n)$', 'The expected answer.'],
        ]),
        tests([
          ['points = [[0, 0]]', '1', 'One point.'],
          ['points = [[0, 0], [5, 7]]', '2', 'Any two points are collinear.'],
          ['points = [[0, 0], [1, 1], [2, 3]]', '2', 'No three points on one line.'],
          ['points = [[1, 0], [1, 5], [1, -3], [2, 2]]', '3', 'A vertical line (infinite slope).'],
          ['points = [[0, 2], [3, 2], [-4, 2], [1, 1]]', '3', 'A horizontal line (zero slope).'],
          ['points = [[0, 0], [3, 1], [6, 2], [9, 3], [1, 1]]', '4', 'Slope 1/3, which floating-point slopes can get wrong.'],
          ['points = [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3], [4, 4]]', '4', 'Example 1.'],
        ], { fn: ['max_collinear_brute_force', 'max_collinear_points'] }),
        tips(
          "Never key a hash map on a floating-point slope: `1/3` computed two different ways can differ in the last bit. Reduced integer fractions are exact.",
          "If duplicate points are allowed, count copies of the anchor separately and add them to every line through it."
        ),
      ],
    },

    {
      id: 'triangle-numbers',
      title: 'Triangle Numbers',
      body: [
        p("Build a triangle of numbers row by row. Row 1 is a single `1`. Every number in the next row is the **sum of up to three numbers above it**: the one directly above, and the ones above-left and above-right (missing neighbours count as 0). So row `n` has `2n - 1` numbers."),
        pre(`
          row 1:              1
          row 2:           1  1  1
          row 3:        1  2  3  2  1
          row 4:     1  3  6  7  6  3  1
          row 5:  1  4 10 16 19 16 10  4  1
        `),
        p("Given a row number `n`, return the **position of the first even number** in that row, counting positions from 1 on the left. If the row has no even number, return `-1`."),
        ex('n = 4', '3', 'row 4 is 1, 3, 6, 7, 6, 3, 1; the first even number is 6, in position 3.'),
        ex('n = 2', '-1', 'row 2 is 1, 1, 1.'),
        ex('n = 5', '2', 'row 5 starts 1, 4, …'),

        ap(1, 'Build the rows, keeping only parity'),
        p("The direct approach generates rows until row `n` and scans it. The numbers grow quickly (roughly like $3^n$), but we only care whether each one is **even or odd**, and the parity of a sum depends only on the parities of its terms. So we can build the whole triangle with values mod 2."),
        code(`
          def triangle_numbers_simulate(n: int) -> int:
              row = [1]  # row 1, stored as parities (1 = odd, 0 = even)
              for _ in range(n - 1):
                  padded = [0, 0] + row + [0, 0]
                  # each entry: (above-left + above + above-right) mod 2
                  row = [(padded[i] + padded[i + 1] + padded[i + 2]) % 2 for i in range(len(row) + 2)]
              for position, parity in enumerate(row, start=1):
                  if parity == 0:
                      return position
              return -1
          `, `
          function triangleNumbersSimulate(n) {
            let row = [1]; // row 1, stored as parities (1 = odd, 0 = even)
            for (let r = 1; r < n; r++) {
              const padded = [0, 0, ...row, 0, 0];
              // each entry: (above-left + above + above-right) mod 2
              row = Array.from({ length: row.length + 2 }, (_, i) => (padded[i] + padded[i + 1] + padded[i + 2]) % 2);
            }
            const index = row.indexOf(0);
            return index === -1 ? -1 : index + 1;
          }
          `, `
          public int triangleNumbersSimulate(int n) {
              int[] row = {1}; // row 1, stored as parities (1 = odd, 0 = even)
              for (int r = 1; r < n; r++) {
                  int[] padded = new int[row.length + 4];
                  System.arraycopy(row, 0, padded, 2, row.length);
                  int[] next = new int[row.length + 2];
                  // each entry: (above-left + above + above-right) mod 2
                  for (int i = 0; i < next.length; i++) next[i] = (padded[i] + padded[i + 1] + padded[i + 2]) % 2;
                  row = next;
              }
              for (int i = 0; i < row.length; i++) if (row[i] == 0) return i + 1;
              return -1;
          }
          `),
        cost("$O(n^2)$: row `r` has $2r - 1$ entries.", "$O(n)$ for one row."),
        p("Printing the answers for the first rows reveals a striking pattern: `-1, -1, 2, 3, 2, 4, 2, 3, 2, 4, …`. The answer only depends on `n % 4`. Let's see why, so we can trust it for every `n`."),

        ap(2, 'Find and prove the pattern (optimal)'),
        p("Write `m = n - 1`. Row `n` lists the coefficients of $(1 + x + x^2)^m$, because each step multiplies by `1 + x + x²`, which is exactly the *sum of three neighbours* rule. Only the first few coefficients matter, and they are easy to count: each of the `m` factors contributes $x^0$, $x^1$ or $x^2$."),
        table(['Position', 'Coefficient of', 'Value', 'How it arises'], [
          ['1', '$x^0$', '`1`', 'every factor contributes 1'],
          ['2', '$x^1$', '`m`', 'one factor contributes $x$'],
          ['3', '$x^2$', '`m(m + 1) / 2`', 'two factors give $x$, or one gives $x^2$: $C(m, 2) + m$'],
          ['4', '$x^3$', '`C(m, 3) + m(m - 1)`', 'three give $x$, or one gives $x^2$ and another $x$'],
        ]),
        ul(
          "**`n` odd** (`m` even): position 2 holds `m`, which is even. Answer **2**.",
          "**`n` divisible by 4** (`m ≡ 3 mod 4`): position 2 (`m`) is odd, but `m + 1` is a multiple of 4, so `m(m + 1) / 2` is even. Answer **3**.",
          "**`n ≡ 2 mod 4`** (`m ≡ 1 mod 4`): `m` is odd, and `m + 1 ≡ 2 mod 4` makes `m(m + 1) / 2` odd. At position 4, `m(m - 1)` is even, and `C(m, 3) = m(m - 1)(m - 2) / 6` is even too, because `m - 1` is a multiple of 4. Answer **4**.",
          "**Rows 1 and 2** contain only 1s (and row 2 has just 3 positions), so the answer is **-1**."
        ),
        state('n:      1   2   3   4   5   6   7   8\nanswer: -1  -1  2   3   2   4   2   3'),
        impl(`
          def triangle_numbers(n: int) -> int:
              if n <= 2:
                  return -1  # rows 1 and 2 contain only 1s
              if n % 2 == 1:
                  return 2   # position 2 holds n - 1, which is even
              if n % 4 == 0:
                  return 3   # position 3 holds n(n - 1) / 2, which is even
              return 4       # n % 4 == 2: positions 2 and 3 are odd, position 4 is even
          `, `
          function triangleNumbers(n) {
            if (n <= 2) return -1; // rows 1 and 2 contain only 1s
            if (n % 2 === 1) return 2; // position 2 holds n - 1, which is even
            if (n % 4 === 0) return 3; // position 3 holds n(n - 1) / 2, which is even
            return 4;                  // n % 4 == 2: position 4 is the first even number
          }
          `, `
          public int triangleNumbers(int n) {
              if (n <= 2) return -1; // rows 1 and 2 contain only 1s
              if (n % 2 == 1) return 2; // position 2 holds n - 1, which is even
              if (n % 4 == 0) return 3; // position 3 holds n(n - 1) / 2, which is even
              return 4;                 // n % 4 == 2: position 4 is the first even number
          }
          `),
        cx("$O(1)$.", "$O(1)$."),
        vs([
          ['1. Build rows mod 2', '$O(n^2)$', '$O(n)$', 'To discover (and double-check) the pattern.'],
          ['2. The `n % 4` pattern', '$O(1)$', '$O(1)$', 'The expected answer, with the proof.'],
        ]),
        tests([
          ['n = 1', '-1', 'Row 1 is just 1.'],
          ['n = 2', '-1', 'Example 2: row 2 is 1, 1, 1.'],
          ['n = 3', '2', 'Row 3 starts 1, 2.'],
          ['n = 4', '3', 'Example 1.'],
          ['n = 5', '2', 'Example 3: odd rows always answer 2.'],
          ['n = 6', '4', 'The n % 4 == 2 case.'],
          ['n = 99', '2', 'A large odd row.'],
          ['n = 100', '3', 'A large row divisible by 4.'],
          ['n = 102', '4', 'A large row with n % 4 == 2.'],
        ], { fn: ['triangle_numbers_simulate', 'triangle_numbers'] }),
        tips(
          "When a problem's input is a single number and the brute force is cheap for small inputs, **print the first 20 answers**. A pattern is often hiding there; then prove it rather than just guessing.",
          "Reducing everything mod 2 is a general trick: if only parity is asked for, the huge numbers never need to exist."
        ),
      ],
    },
  ]);

  // Lesson order within each section, matching the standard order of the course.
  K.order('trees', ['introduction', 'invert-binary-tree', 'balanced-binary-tree-validation', 'rightmost-nodes-of-a-binary-tree',
    'widest-binary-tree-level', 'binary-search-tree-validation', 'lowest-common-ancestor', 'build-binary-tree-from-preorder-and-inorder',
    'maximum-sum-of-a-continuous-path', 'binary-tree-symmetry', 'binary-tree-columns', 'kth-smallest-number-in-bst',
    'serialize-and-deserialize-a-binary-tree']);
  K.order('graphs', ['introduction', 'graph-deep-copy', 'count-islands', 'matrix-infection', 'bipartite-graph-validation',
    'longest-increasing-path', 'shortest-transformation-sequence', 'merging-communities', 'prerequisites', 'shortest-path',
    'connect-the-dots']);
  K.order('dynamic-programming', ['introduction', 'climbing-stairs', 'minimum-coin-combination', 'matrix-pathways',
    'neighborhood-burglary', 'longest-common-subsequence', 'longest-palindrome-in-a-string', 'maximum-subarray-sum',
    '0-1-knapsack', 'largest-square-in-a-matrix']);
  K.order('math-and-geometry', ['introduction', 'spiral-traversal', 'reverse-32-bit-integer', 'maximum-collinear-points',
    'the-josephus-problem', 'triangle-numbers']);
})();
