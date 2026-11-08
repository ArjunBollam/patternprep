(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, state, code, impl, cx, table, pre } = K;

  K.section({
    id: 'math-and-geometry',
    title: 'Math and Geometry',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Math and Geometry',
        body: [
          p("Some interview problems are less about a data structure and more about **spotting a mathematical pattern**: a formula, a recurrence, a property of numbers or of coordinates. The code is often short; the work is in the reasoning and in handling **edge cases** like overflow, negative numbers and precision."),
          h('Toolbox'),
          table(['Topic', 'What to remember'], [
            ['Modular arithmetic', '`(a + b) % m = ((a % m) + (b % m)) % m`, same for `*`. Use it to keep numbers small and for circular indexing.'],
            ['GCD / LCM', 'Euclid: `gcd(a, b) = gcd(b, a % b)`, `lcm(a, b) = a / gcd(a, b) * b`. GCD also reduces fractions such as slopes.'],
            ['Primes', 'Trial division up to $\\sqrt{n}$; the Sieve of Eratosthenes finds all primes up to $n$ in $O(n \\log \\log n)$.'],
            ['Integer overflow', 'Java/C++ `int` holds about ±2.1 billion. Check before multiplying, or use `long`.'],
            ['Floating point', 'Avoid comparing floats with `==`. Represent slopes as reduced integer pairs instead of decimals.'],
            ['Matrices', 'Traverse by **layers** (spiral) or by **diagonals**; rotate = transpose + reverse rows.'],
            ['Geometry', 'Distance $\\sqrt{dx^2 + dy^2}$ (compare squared distances to avoid square roots); collinearity via equal reduced slopes; cross product for orientation.'],
          ]),
          h('Approach'),
          ol(
            "Work through **small examples by hand** and write the outputs down. Patterns jump out of tables.",
            "Look for a **recurrence** (how does the answer for `n` relate to `n - 1`?) or an **invariant**.",
            "Double-check **boundaries**: zero, negatives, the largest values, empty inputs."
          ),
          h('Real-world uses'),
          ul(
            "**Cryptography** relies on modular arithmetic and primes.",
            "**Graphics and games**: rotating images, collision detection, line intersection.",
            "**Mapping**: distances and bearings between coordinates.",
            "**Image processing**: matrix traversals and rotations."
          ),
        ],
      },

      {
        id: 'spiral-traversal',
        title: 'Spiral Traversal',
        body: [
          p("Return all elements of an `m × n` matrix in **clockwise spiral order**, starting from the top-left corner."),
          ex('matrix = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14]]', '[0, 1, 2, 3, 4, 9, 14, 13, 12, 11, 10, 5, 6, 7, 8]'),
          grid([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14]], { hl: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [2, 1], [2, 0], [1, 0]], hl2: [[1, 1], [1, 2], [1, 3]], cap: 'outer layer (orange), then the inner layer (blue)' }),
          h('Intuition'),
          p("Keep four **boundaries**: `top`, `bottom`, `left` and `right`. Each lap of the spiral walks around the current outer layer and then shrinks the boundaries inward:"),
          ol(
            "Go **right** along row `top`, then `top += 1`.",
            "Go **down** along column `right`, then `right -= 1`.",
            "If rows remain, go **left** along row `bottom`, then `bottom -= 1`.",
            "If columns remain, go **up** along column `left`, then `left += 1`."
          ),
          p("The two \"if rows / columns remain\" checks matter for non-square matrices: without them, a single remaining row or column would be visited twice."),
          state('lap 1: right 0-4, down 9, 14, left 13-10, up 5\nboundaries now top = 1, bottom = 1, left = 1, right = 3\nlap 2: right 6, 7, 8 → top = 2 > bottom → done'),
          impl(`
            from typing import List

            def spiral_traversal(matrix: List[List[int]]) -> List[int]:
                result = []
                if not matrix:
                    return result
                top, bottom = 0, len(matrix) - 1
                left, right = 0, len(matrix[0]) - 1
                while top <= bottom and left <= right:
                    for c in range(left, right + 1):          # right
                        result.append(matrix[top][c])
                    top += 1
                    for r in range(top, bottom + 1):          # down
                        result.append(matrix[r][right])
                    right -= 1
                    if top <= bottom:
                        for c in range(right, left - 1, -1):  # left
                            result.append(matrix[bottom][c])
                        bottom -= 1
                    if left <= right:
                        for r in range(bottom, top - 1, -1):  # up
                            result.append(matrix[r][left])
                        left += 1
                return result
            `, `
            function spiralTraversal(matrix) {
              const result = [];
              if (!matrix.length) return result;
              let top = 0, bottom = matrix.length - 1;
              let left = 0, right = matrix[0].length - 1;
              while (top <= bottom && left <= right) {
                for (let c = left; c <= right; c++) result.push(matrix[top][c]); // right
                top++;
                for (let r = top; r <= bottom; r++) result.push(matrix[r][right]); // down
                right--;
                if (top <= bottom) {
                  for (let c = right; c >= left; c--) result.push(matrix[bottom][c]); // left
                  bottom--;
                }
                if (left <= right) {
                  for (let r = bottom; r >= top; r--) result.push(matrix[r][left]); // up
                  left++;
                }
              }
              return result;
            }
            `, `
            public List<Integer> spiralTraversal(int[][] matrix) {
                List<Integer> result = new ArrayList<>();
                if (matrix.length == 0) return result;
                int top = 0, bottom = matrix.length - 1;
                int left = 0, right = matrix[0].length - 1;
                while (top <= bottom && left <= right) {
                    for (int c = left; c <= right; c++) result.add(matrix[top][c]);   // right
                    top++;
                    for (int r = top; r <= bottom; r++) result.add(matrix[r][right]); // down
                    right--;
                    if (top <= bottom) {
                        for (int c = right; c >= left; c--) result.add(matrix[bottom][c]); // left
                        bottom--;
                    }
                    if (left <= right) {
                        for (int r = bottom; r >= top; r--) result.add(matrix[r][left]); // up
                        left++;
                    }
                }
                return result;
            }
            `),
          cx("$O(m·n)$. Every element is visited once.", "$O(1)$ beyond the output."),
        ],
      },

      {
        id: 'reverse-32-bit-integer',
        title: 'Reverse 32-Bit Integer',
        body: [
          p("Reverse the **decimal digits** of a signed 32-bit integer. If the reversed value falls outside the 32-bit range $[-2^{31}, 2^{31} - 1]$, return `0`. Pretend you can't store 64-bit integers."),
          ex('n = 420', '24'),
          ex('n = -15', '-51'),
          ex('n = 1463847412', '2147483641', 'just inside the limit of 2147483647.'),
          ex('n = 1563847412', '0', '2147483651 would overflow.'),
          h('Intuition'),
          p("Pop digits off the end with `% 10` and `/ 10`, and push them onto the result with `result * 10 + digit`. The interesting part is detecting overflow **before** it happens, since we can't store the too-large value to check it afterwards."),
          state('before computing result * 10 + digit, overflow happens iff\nresult > MAX / 10, or\nresult == MAX / 10 and digit > 7     (MAX = 2147483647)\n(and symmetrically for negatives with MIN = -2147483648 and digit < -8)'),
          note("In Python, `%` and `//` round toward negative infinity, so it's easiest to reverse the absolute value and reapply the sign. In Java and JavaScript, `%` keeps the sign of the dividend, so negative numbers produce negative digits naturally."),
          impl(`
            def reverse_32_bit_integer(n: int) -> int:
                INT_MAX = 2**31 - 1
                sign = -1 if n < 0 else 1
                n = abs(n)
                limit = INT_MAX if sign > 0 else INT_MAX + 1   # |MIN| = MAX + 1
                result = 0
                while n:
                    n, digit = divmod(n, 10)
                    # Would result * 10 + digit exceed the limit?
                    if result > (limit - digit) // 10:
                        return 0
                    result = result * 10 + digit
                return sign * result
            `, `
            function reverse32BitInteger(n) {
              const MAX = 2147483647, MIN = -2147483648;
              let result = 0;
              while (n !== 0) {
                const digit = n % 10;         // keeps the sign of n
                n = Math.trunc(n / 10);
                if (result > Math.trunc(MAX / 10) || (result === Math.trunc(MAX / 10) && digit > 7)) return 0;
                if (result < Math.trunc(MIN / 10) || (result === Math.trunc(MIN / 10) && digit < -8)) return 0;
                result = result * 10 + digit;
              }
              return result;
            }
            `, `
            public int reverse32BitInteger(int n) {
                int result = 0;
                while (n != 0) {
                    int digit = n % 10;           // keeps the sign of n
                    n /= 10;
                    if (result > Integer.MAX_VALUE / 10 || (result == Integer.MAX_VALUE / 10 && digit > 7)) return 0;
                    if (result < Integer.MIN_VALUE / 10 || (result == Integer.MIN_VALUE / 10 && digit < -8)) return 0;
                    result = result * 10 + digit;
                }
                return result;
            }
            `),
          cx("$O(\\log n)$, one iteration per decimal digit (at most 10).", "$O(1)$."),
        ],
      },

      {
        id: 'the-josephus-problem',
        title: 'The Josephus Problem',
        body: [
          p("`n` people, numbered `0` to `n - 1`, stand in a circle. Starting from person 0, count `k` people clockwise; the `k`-th person is eliminated. Counting resumes from the next person, and this repeats until one person remains. Return the **survivor's number**."),
          ex('n = 5, k = 2', '2', 'eliminated in order: 1, 3, 0, 4.'),
          ex('n = 1, k = 3', '0'),
          h('Intuition'),
          p("Simulating with a list costs $O(n^2)$ (removing from the middle) or $O(n·k)$ with a linked list. There's a neat recurrence instead."),
          p("After the first elimination (person `(k - 1) % n`), we have a circle of `n - 1` people, and counting starts at person `k % n`. If we **renumber** that smaller circle so the starting person is 0, the problem is exactly the same with `n - 1` people. The survivor's number in the smaller circle, shifted back by `k`, gives the survivor in the bigger one:"),
          state('J(1) = 0\nJ(n) = (J(n - 1) + k) % n'),
          table(['n', '1', '2', '3', '4', '5'], [
            ['J(n), k = 2', '0', '(0 + 2) % 2 = 0', '(0 + 2) % 3 = 2', '(2 + 2) % 4 = 0', '(0 + 2) % 5 = **2**'],
          ]),
          pre(`
            circle 0 1 2 3 4, k = 2
            eliminate 1  → 0 _ 2 3 4
            eliminate 3  → 0 _ 2 _ 4
            eliminate 0  → _ _ 2 _ 4
            eliminate 4  → survivor 2
          `),
          impl(`
            def josephus(n: int, k: int) -> int:
                survivor = 0                 # J(1)
                for size in range(2, n + 1):
                    survivor = (survivor + k) % size
                return survivor
            `, `
            function josephus(n, k) {
              let survivor = 0; // J(1)
              for (let size = 2; size <= n; size++) survivor = (survivor + k) % size;
              return survivor;
            }
            `, `
            public int josephus(int n, int k) {
                int survivor = 0; // J(1)
                for (int size = 2; size <= n; size++) survivor = (survivor + k) % size;
                return survivor;
            }
            `),
          cx("$O(n)$.", "$O(1)$ (the iterative form avoids the $O(n)$ recursion stack)."),
        ],
      },
    ],
  });
})();
