(function () {
  const { p, h, h3, ul, ol, note, ex, arr, grid, state, code, impl, cx, table, pre, ap, cost, vs, tests, tips } = K;

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
          ap(1, 'Simulate the walk with directions and a visited grid'),
          p("Walk like a robot: move right until the next cell is outside the matrix or already visited, then turn clockwise (right → down → left → up) and continue. A visited grid tells us when to turn, and we stop after `m · n` cells."),
          code(`
            from typing import List

            def spiral_traversal_visited(matrix: List[List[int]]) -> List[int]:
                if not matrix or not matrix[0]:
                    return []
                m, n = len(matrix), len(matrix[0])
                seen = [[False] * n for _ in range(m)]
                dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # right, down, left, up
                r = c = d = 0
                result = []
                for _ in range(m * n):
                    result.append(matrix[r][c])
                    seen[r][c] = True
                    nr, nc = r + dirs[d][0], c + dirs[d][1]
                    if not (0 <= nr < m and 0 <= nc < n) or seen[nr][nc]:
                        d = (d + 1) % 4  # turn clockwise
                        nr, nc = r + dirs[d][0], c + dirs[d][1]
                    r, c = nr, nc
                return result
            `, `
            function spiralTraversalVisited(matrix) {
              if (!matrix.length || !matrix[0].length) return [];
              const m = matrix.length, n = matrix[0].length;
              const seen = Array.from({ length: m }, () => new Array(n).fill(false));
              const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up
              let r = 0, c = 0, d = 0;
              const result = [];
              for (let step = 0; step < m * n; step++) {
                result.push(matrix[r][c]);
                seen[r][c] = true;
                let nr = r + dirs[d][0], nc = c + dirs[d][1];
                if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen[nr][nc]) {
                  d = (d + 1) % 4; // turn clockwise
                  nr = r + dirs[d][0];
                  nc = c + dirs[d][1];
                }
                r = nr;
                c = nc;
              }
              return result;
            }
            `, `
            public List<Integer> spiralTraversalVisited(int[][] matrix) {
                List<Integer> result = new ArrayList<>();
                if (matrix.length == 0 || matrix[0].length == 0) return result;
                int m = matrix.length, n = matrix[0].length, r = 0, c = 0, d = 0;
                boolean[][] seen = new boolean[m][n];
                int[][] dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}}; // right, down, left, up
                for (int step = 0; step < m * n; step++) {
                    result.add(matrix[r][c]);
                    seen[r][c] = true;
                    int nr = r + dirs[d][0], nc = c + dirs[d][1];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen[nr][nc]) {
                        d = (d + 1) % 4; // turn clockwise
                        nr = r + dirs[d][0];
                        nc = c + dirs[d][1];
                    }
                    r = nr;
                    c = nc;
                }
                return result;
            }
            `),
          cost("$O(m·n)$.", "$O(m·n)$ for the visited grid."),
          p("The visited grid only exists to tell us where the walls are. Four shrinking boundaries carry the same information in four variables."),
          ap(2, 'Shrinking boundaries, layer by layer (optimal)'),
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
          vs([
            ['1. Directions + visited grid', '$O(m·n)$', '$O(m·n)$', 'Easy to get right; generalises to other walking orders.'],
            ['2. Shrinking boundaries', '$O(m·n)$', '$O(1)$', 'The expected answer.'],
          ]),
          tests([
            ['matrix = []', '[]', 'Empty matrix.'],
            ['matrix = [[1]]', '[1]', 'A single cell.'],
            ['matrix = [[1, 2, 3]]', '[1, 2, 3]', 'A single row.'],
            ['matrix = [[1], [2], [3]]', '[1, 2, 3]', 'A single column (the up/left checks matter here).'],
            ['matrix = [[1, 2], [3, 4]]', '[1, 2, 4, 3]', 'A 2 × 2 square.'],
            ['matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', '[1, 2, 3, 6, 9, 8, 7, 4, 5]', 'An odd square ending in the centre.'],
            ['matrix = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14]]', '[0, 1, 2, 3, 4, 9, 14, 13, 12, 11, 10, 5, 6, 7, 8]', 'Example 1.'],
          ], { fn: ['spiral_traversal_visited', 'spiral_traversal'] }),
          tips(
            "Test a single row and a single column before you finish. They are exactly the cases the two boundary checks exist for.",
            "Related follow-up: generate an `n × n` matrix **filled** in spiral order. Same boundaries, writing instead of reading."
          ),
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
          ap(1, 'Reverse the digits as a string, then range-check'),
          p("Turn the absolute value into a string, reverse it, convert it back and reapply the sign. Then check whether it fits in 32 bits. It's short, but the check needs a **wider** number type, which the problem asks us to pretend we don't have."),
          code(`
            def reverse_32_bit_integer_string(n: int) -> int:
                sign = -1 if n < 0 else 1
                result = sign * int(str(abs(n))[::-1])  # may not fit in 32 bits
                return result if -2**31 <= result <= 2**31 - 1 else 0
            `, `
            function reverse32BitIntegerString(n) {
              const sign = n < 0 ? -1 : 1;
              const result = sign * Number(String(Math.abs(n)).split('').reverse().join('')); // may not fit in 32 bits
              return result >= -(2 ** 31) && result <= 2 ** 31 - 1 ? result : 0;
            }
            `, `
            public int reverse32BitIntegerString(int n) {
                long sign = n < 0 ? -1 : 1;
                String digits = new StringBuilder(String.valueOf(Math.abs((long) n))).reverse().toString();
                long result = sign * Long.parseLong(digits); // needs a 64-bit value
                return result >= Integer.MIN_VALUE && result <= Integer.MAX_VALUE ? (int) result : 0;
            }
            `),
          cost("$O(log n)$ for the digits.", "$O(log n)$ for the string."),
          ap(2, 'Pop and push digits, checking for overflow first (optimal)'),
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
          vs([
            ['1. String reverse + range check', '$O(log n)$', '$O(log n)$', 'Fine when a 64-bit type is allowed.'],
            ['2. Digit by digit with a pre-check', '$O(log n)$', '$O(1)$', 'The expected answer under the 32-bit rule.'],
          ]),
          tests([
            ['n = 0', '0', 'Zero.'],
            ['n = 7', '7', 'A single digit.'],
            ['n = 420', '24', 'Example 1: trailing zeros disappear.'],
            ['n = -15', '-51', 'Example 2: the sign stays in front.'],
            ['n = 1463847412', '2147483641', 'Example 3: just inside the limit.'],
            ['n = 1563847412', '0', 'Example 4: overflow.'],
            ['n = 1000000003', '0', 'Overflow caused by the first digit popped.'],
            ['n = -1463847412', '-2147483641', 'Negative, just inside the limit.'],
            ['n = -2147483648', '0', 'The smallest 32-bit integer reverses to an overflow.'],
          ], { fn: ['reverse_32_bit_integer_string', 'reverse_32_bit_integer'] }),
          tips(
            "Explain the overflow check before writing it: compare against `MAX / 10` *before* multiplying, because after multiplying it's too late.",
            "Ask how trailing zeros and negative numbers should be handled; both are common sources of off-by-one surprises."
          ),
        ],
      },

      {
        id: 'the-josephus-problem',
        title: 'The Josephus Problem',
        body: [
          p("`n` people, numbered `0` to `n - 1`, stand in a circle. Starting from person 0, count `k` people clockwise; the `k`-th person is eliminated. Counting resumes from the next person, and this repeats until one person remains. Return the **survivor's number**."),
          ex('n = 5, k = 2', '2', 'eliminated in order: 1, 3, 0, 4.'),
          ex('n = 1, k = 3', '0'),
          ap(1, 'Simulate with a list'),
          p("Keep the people still in the circle in a list. From the current position, the person to eliminate is `k - 1` places further on (wrapping around). Remove them; the next count starts at the same index, where the following person now stands."),
          code(`
            def josephus_list(n: int, k: int) -> int:
                people = list(range(n))
                i = 0
                while len(people) > 1:
                    i = (i + k - 1) % len(people)  # the k-th person from position i
                    people.pop(i)                  # counting restarts at index i
                return people[0]
            `, `
            function josephusList(n, k) {
              const people = Array.from({ length: n }, (_, i) => i);
              let i = 0;
              while (people.length > 1) {
                i = (i + k - 1) % people.length; // the k-th person from position i
                people.splice(i, 1);             // counting restarts at index i
              }
              return people[0];
            }
            `, `
            public int josephusList(int n, int k) {
                List<Integer> people = new ArrayList<>();
                for (int p = 0; p < n; p++) people.add(p);
                int i = 0;
                while (people.size() > 1) {
                    i = (i + k - 1) % people.size(); // the k-th person from position i
                    people.remove(i);                // counting restarts at index i
                }
                return people.get(0);
            }
            `),
          cost("$O(n^2)$: each removal shifts the rest of the list.", "$O(n)$."),
          ap(2, 'Simulate with a queue'),
          p("A queue models the circle directly: move `k - 1` people from the front to the back, then remove the person at the front. No shifting is needed, but each elimination costs `k` steps."),
          code(`
            from collections import deque

            def josephus_queue(n: int, k: int) -> int:
                queue = deque(range(n))
                while len(queue) > 1:
                    queue.rotate(-(k - 1))  # k - 1 people go from the front to the back
                    queue.popleft()         # the k-th is eliminated
                return queue[0]
            `, `
            function josephusQueue(n, k) {
              const queue = Array.from({ length: n }, (_, i) => i);
              let head = 0; // queue[head..] is the circle, front first
              while (queue.length - head > 1) {
                for (let s = 0; s < k - 1; s++) queue.push(queue[head++]); // front to back
                head++;                                                     // eliminate the k-th
              }
              return queue[head];
            }
            `, `
            public int josephusQueue(int n, int k) {
                Deque<Integer> queue = new ArrayDeque<>();
                for (int p = 0; p < n; p++) queue.add(p);
                while (queue.size() > 1) {
                    for (int s = 0; s < k - 1; s++) queue.add(queue.poll()); // front to back
                    queue.poll();                                            // eliminate the k-th
                }
                return queue.peek();
            }
            `),
          cost("$O(n · k)$.", "$O(n)$."),
          p("Both simulations track every person. A recurrence tracks only the survivor's **number**."),
          ap(3, 'The recurrence (optimal)'),
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
          vs([
            ['1. List simulation', '$O(n^2)$', '$O(n)$', 'When you need the elimination order too.'],
            ['2. Queue simulation', '$O(n · k)$', '$O(n)$', 'Small `k`; also yields the elimination order.'],
            ['3. Recurrence', '$O(n)$', '$O(1)$', 'The expected answer for the survivor alone.'],
          ]),
          tests([
            ['n = 1, k = 3', '0', 'Example 2: one person survives by default.'],
            ['n = 2, k = 1', '1', 'k = 1 eliminates people in order, so the last one survives.'],
            ['n = 6, k = 1', '5', 'k = 1 again: the survivor is n - 1.'],
            ['n = 7, k = 3', '3', 'The classic setting.'],
            ['n = 10, k = 10', '7', 'k equal to n.'],
            ['n = 5, k = 2', '2', 'Example 1.'],
          ], { fn: ['josephus_list', 'josephus_queue', 'josephus'] }),
          tips(
            "Say why the recurrence works: after one elimination the circle is the same problem with `n - 1` people, just renumbered by `k` positions.",
            "For `k = 2` there's a closed form: write `n` in binary and move the leading 1 to the end (0-indexed survivor = `2 · (n - 2^⌊log₂ n⌋)`)."
          ),
        ],
      },
    ],
  });
})();
