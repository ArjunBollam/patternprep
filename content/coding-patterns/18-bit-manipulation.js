(function () {
  const { p, h, h3, ul, ol, note, ex, arr, state, code, impl, cx, table, pre, ap, cost, vs, tests, tips } = K;

  K.section({
    id: 'bit-manipulation',
    title: 'Bit Manipulation',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Bit Manipulation',
        body: [
          p("Computers store integers in **binary**. Bit manipulation works on those individual bits directly with bitwise operators. The operations are extremely fast and often replace loops, extra memory or arithmetic with a single instruction."),
          h('The operators'),
          table(['Operator', 'Meaning', 'Example (4-bit)'], [
            ['`a & b`', 'AND: 1 only where both bits are 1', '`1100 & 1010 = 1000`'],
            ['`a | b`', 'OR: 1 where either bit is 1', '`1100 | 1010 = 1110`'],
            ['`a ^ b`', 'XOR: 1 where the bits differ', '`1100 ^ 1010 = 0110`'],
            ['`~a`', 'NOT: flip every bit', '`~1100 = 0011` (in 4 bits)'],
            ['`a << k`', 'shift left, multiplies by $2^k$', '`0011 << 2 = 1100`'],
            ['`a >> k`', 'shift right, divides by $2^k$ (rounding down)', '`1100 >> 2 = 0011`'],
          ]),
          h('Tricks worth memorising'),
          table(['Goal', 'Expression'], [
            ['Is bit `i` set?', '`(n >> i) & 1`'],
            ['Set bit `i`', '`n | (1 << i)`'],
            ['Clear bit `i`', '`n & ~(1 << i)`'],
            ['Toggle bit `i`', '`n ^ (1 << i)`'],
            ['Clear the lowest set bit', '`n & (n - 1)`'],
            ['Isolate the lowest set bit', '`n & -n`'],
            ['Is `n` a power of two?', '`n > 0 and n & (n - 1) == 0`'],
            ['Is `n` odd?', '`n & 1`'],
          ]),
          h3('XOR identities'),
          ul(
            "`x ^ 0 = x` and `x ^ x = 0`.",
            "XOR is commutative and associative, so the order doesn't matter: pairs cancel out. That's the trick behind [Lonely Integer](#/bit-manipulation/lonely-integer)."
          ),
          h('Language notes'),
          ul(
            "**Python** integers have unlimited precision and negative numbers behave as if they had infinitely many leading 1s. Mask with `& 0xFFFFFFFF` to emulate 32-bit behaviour.",
            "**JavaScript** bitwise operators work on **32-bit signed** integers. Use `>>>` (unsigned right shift) and `x >>> 0` to read a value as unsigned.",
            "**Java** `int` is 32-bit signed and `long` 64-bit. `>>` keeps the sign bit; `>>>` shifts in zeros. `Integer.bitCount(n)` counts set bits."
          ),
          h('Real-world uses'),
          ul(
            "**Permission flags** (Unix file modes, feature flags) packed into one integer.",
            "**Networking**: subnet masks, checksums and protocol headers.",
            "**Graphics**: packing RGBA colour channels into 32 bits.",
            "**Bitsets and Bloom filters** for memory-efficient sets; hash functions mixing bits."
          ),
        ],
      },

      {
        id: 'hamming-weights-of-integers',
        title: 'Hamming Weights of Integers',
        body: [
          p("The **Hamming weight** of a number is the count of `1` bits in its binary representation. Given a non-negative integer `n`, return an array where index `i` holds the Hamming weight of `i`, for every `i` from `0` to `n`."),
          ex('n = 7', '[0, 1, 1, 2, 1, 2, 2, 3]', '`5 = 101` has two set bits, `7 = 111` has three.'),
          ap(1, 'Count the bits of every number separately'),
          p("For each number, look at its lowest bit and shift right until nothing is left."),
          code(`
            from typing import List

            def hamming_weights_count_each(n: int) -> List[int]:
                result = []
                for i in range(n + 1):
                    count, x = 0, i
                    while x:
                        count += x & 1  # lowest bit
                        x >>= 1
                    result.append(count)
                return result
            `, `
            function hammingWeightsCountEach(n) {
              const result = [];
              for (let i = 0; i <= n; i++) {
                let count = 0;
                for (let x = i; x; x >>>= 1) count += x & 1; // lowest bit, then shift
                result.push(count);
              }
              return result;
            }
            `, `
            public int[] hammingWeightsCountEach(int n) {
                int[] result = new int[n + 1];
                for (int i = 0; i <= n; i++) {
                    int count = 0;
                    for (int x = i; x != 0; x >>>= 1) count += x & 1; // lowest bit, then shift
                    result[i] = count;
                }
                return result;
            }
            `),
          cost("$O(n log n)$: each number has $O(log n)$ bits.", "$O(1)$ beyond the output."),
          p("We can do better by **reusing earlier answers**. Every number is a smaller number plus one bit, and the smaller number's count is already in the array."),
          ap(2, 'Reuse the count of i with its lowest set bit removed'),
          p("`i & (i - 1)` clears the **lowest set bit** of `i` (subtracting 1 flips that bit and every 0 below it). The result is smaller than `i` and has exactly one bit fewer."),
          code(`
            from typing import List

            def hamming_weights_lowest_bit(n: int) -> List[int]:
                bits = [0] * (n + 1)
                for i in range(1, n + 1):
                    bits[i] = bits[i & (i - 1)] + 1  # i & (i - 1) drops the lowest set bit
                return bits
            `, `
            function hammingWeightsLowestBit(n) {
              const bits = new Array(n + 1).fill(0);
              for (let i = 1; i <= n; i++) bits[i] = bits[i & (i - 1)] + 1; // drop the lowest set bit
              return bits;
            }
            `, `
            public int[] hammingWeightsLowestBit(int n) {
                int[] bits = new int[n + 1];
                for (int i = 1; i <= n; i++) bits[i] = bits[i & (i - 1)] + 1; // drop the lowest set bit
                return bits;
            }
            `),
          cost("$O(n)$.", "$O(1)$ beyond the output."),
          ap(3, 'Reuse the count of i shifted right (optimal)'),
          p("Shifting `i` right by one drops its lowest bit: `i >> 1` has exactly the same bits as `i` except the last one. And `i >> 1` is smaller than `i`, so its count is already known. So:"),
          state('bits[i] = bits[i >> 1] + (i & 1)'),
          pre(`
            i = 6 → 110    i >> 1 = 3 → 11 (2 bits)    lowest bit 0    → 2
            i = 7 → 111    i >> 1 = 3 → 11 (2 bits)    lowest bit 1    → 3
          `),
          note("Approaches 2 and 3 are both linear; they just remove a different bit to find a smaller, already-solved number."),
          impl(`
            from typing import List

            def hamming_weights_of_integers(n: int) -> List[int]:
                bits = [0] * (n + 1)
                for i in range(1, n + 1):
                    bits[i] = bits[i >> 1] + (i & 1)
                return bits
            `, `
            function hammingWeightsOfIntegers(n) {
              const bits = new Array(n + 1).fill(0);
              for (let i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
              return bits;
            }
            `, `
            public int[] hammingWeightsOfIntegers(int n) {
                int[] bits = new int[n + 1];
                for (int i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
                return bits;
            }
            `),
          cx("$O(n)$. Constant work per number.", "$O(1)$ beyond the output array."),
          vs([
            ['1. Count each number', '$O(n log n)$', '$O(1)$', 'Baseline; also what a single popcount does.'],
            ['2. Drop the lowest set bit', '$O(n)$', '$O(1)$', 'Optimal DP.'],
            ['3. Shift right', '$O(n)$', '$O(1)$', 'Optimal DP; the easiest recurrence to explain.'],
          ]),
          tests([
            ['n = 0', '[0]', 'Only the number 0.'],
            ['n = 1', '[0, 1]', 'The smallest non-trivial range.'],
            ['n = 2', '[0, 1, 1]', 'Powers of two have a single set bit.'],
            ['n = 8', '[0, 1, 1, 2, 1, 2, 2, 3, 1]', 'Crossing a power of two resets to one bit.'],
            ['n = 16', '[0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1]', 'Two full blocks of the pattern.'],
            ['n = 7', '[0, 1, 1, 2, 1, 2, 2, 3]', 'Example 1.'],
          ], { fn: ['hamming_weights_count_each', 'hamming_weights_lowest_bit', 'hamming_weights_of_integers'] }),
          tips(
            "To count the bits of a **single** number fast, loop `x &= x - 1` until it's 0; the loop runs once per set bit (Brian Kernighan's trick). Most languages also have a built-in popcount."
          ),
        ],
      },

      {
        id: 'lonely-integer',
        title: 'Lonely Integer',
        body: [
          p("Every number in a non-empty array appears **exactly twice**, except for **one** number that appears once. Find that lonely number using $O(1)$ extra space."),
          ex('nums = [1, 3, 3, 2, 1]', '2'),
          ex('nums = [7]', '7'),
          ap(1, 'Count occurrences with a hash map'),
          p("Count every value, then return the one whose count is 1."),
          code(`
            from collections import Counter
            from typing import List

            def lonely_integer_hash_map(nums: List[int]) -> int:
                counts = Counter(nums)
                for x, c in counts.items():
                    if c == 1:
                        return x
                return -1  # not reached for valid input
            `, `
            function lonelyIntegerHashMap(nums) {
              const counts = new Map();
              for (const x of nums) counts.set(x, (counts.get(x) || 0) + 1);
              for (const [x, c] of counts) if (c === 1) return x;
              return -1; // not reached for valid input
            }
            `, `
            public int lonelyIntegerHashMap(int[] nums) {
                Map<Integer, Integer> counts = new HashMap<>();
                for (int x : nums) counts.merge(x, 1, Integer::sum);
                for (Map.Entry<Integer, Integer> e : counts.entrySet()) if (e.getValue() == 1) return e.getKey();
                return -1; // not reached for valid input
            }
            `),
          cost("$O(n)$.", "$O(n)$ for the counts."),
          ap(2, 'Sort, then check pairs'),
          p("After sorting, equal values sit side by side. Walk the array two at a time: the first pair whose two values differ starts with the lonely number. If every pair matches, the lonely number is the last element."),
          code(`
            from typing import List

            def lonely_integer_sort(nums: List[int]) -> int:
                s = sorted(nums)
                for i in range(0, len(s) - 1, 2):  # pairs are adjacent after sorting
                    if s[i] != s[i + 1]:
                        return s[i]
                return s[-1]
            `, `
            function lonelyIntegerSort(nums) {
              const s = [...nums].sort((a, b) => a - b);
              for (let i = 0; i + 1 < s.length; i += 2) if (s[i] !== s[i + 1]) return s[i]; // adjacent pairs
              return s[s.length - 1];
            }
            `, `
            public int lonelyIntegerSort(int[] nums) {
                int[] s = nums.clone();
                Arrays.sort(s);
                for (int i = 0; i + 1 < s.length; i += 2) if (s[i] != s[i + 1]) return s[i]; // adjacent pairs
                return s[s.length - 1];
            }
            `),
          cost("$O(n log n)$.", "$O(1)$ to $O(n)$, depending on the sort."),
          ap(3, 'XOR everything (optimal)'),
          p("XOR finds it in one pass with a single variable, thanks to two identities: `x ^ x = 0` and `x ^ 0 = x`. Since XOR is commutative and associative, XOR-ing **everything** together lets every pair cancel out, leaving only the lonely number."),
          state('1 ^ 3 ^ 3 ^ 2 ^ 1\n= (1 ^ 1) ^ (3 ^ 3) ^ 2\n= 0 ^ 0 ^ 2\n= 2'),
          pre(`
            running XOR in binary:
            start      000
            ^ 1 (001)  001
            ^ 3 (011)  010
            ^ 3 (011)  001
            ^ 2 (010)  011
            ^ 1 (001)  010  → 2
          `),
          impl(`
            from typing import List

            def lonely_integer(nums: List[int]) -> int:
                result = 0
                for x in nums:
                    result ^= x   # pairs cancel out
                return result
            `, `
            function lonelyInteger(nums) {
              let result = 0;
              for (const x of nums) result ^= x; // pairs cancel out
              return result;
            }
            `, `
            public int lonelyInteger(int[] nums) {
                int result = 0;
                for (int x : nums) result ^= x; // pairs cancel out
                return result;
            }
            `),
          cx("$O(n)$.", "$O(1)$."),
          vs([
            ['1. Hash map of counts', '$O(n)$', '$O(n)$', 'When the "twice" rule might not hold.'],
            ['2. Sort and check pairs', '$O(n log n)$', '$O(1)$ to $O(n)$', 'No hashing needed.'],
            ['3. XOR', '$O(n)$', '$O(1)$', 'The expected answer.'],
          ]),
          tests([
            ['nums = [7]', '7', 'Example 2: a single element.'],
            ['nums = [2, 1, 2]', '1', 'The lonely number in the middle.'],
            ['nums = [0, 4, 4]', '0', 'The lonely number is 0.'],
            ['nums = [-2, 5, 5]', '-2', 'A negative lonely number.'],
            ['nums = [9, 9, 1000000]', '1000000', 'A large value.'],
            ['nums = [1, 3, 3, 2, 1]', '2', 'Example 1.'],
          ], { fn: ['lonely_integer_hash_map', 'lonely_integer_sort', 'lonely_integer'] }),
          tips(
            "Another constant-space trick: `2 * sum(set(nums)) - sum(nums)`. It works, but it needs a set (so it isn't really $O(1)$ space) and can overflow.",
            "Follow-up: every number appears **three** times except one. Count each bit position modulo 3 instead of XOR-ing."
          ),
        ],
      },

      {
        id: 'swap-odd-and-even-bits',
        title: 'Swap Odd and Even Bits',
        body: [
          p("Given an unsigned 32-bit integer, **swap every pair of adjacent bits**: bit 0 with bit 1, bit 2 with bit 3, and so on. Return the resulting number."),
          ex('n = 41', '22', '41 is `101001`; swapping each pair gives `010110`, which is 22.'),
          ex('n = 1', '2'),
          ap(1, 'Swap each pair of bits in a loop'),
          p("Walk over the 16 pairs of positions `(0, 1), (2, 3), …, (30, 31)`. Read both bits of each pair, and write them back into the result in swapped positions."),
          code(`
            def swap_bits_loop(n: int) -> int:
                result = 0
                for i in range(0, 32, 2):  # pair of positions (i, i + 1)
                    low = (n >> i) & 1
                    high = (n >> (i + 1)) & 1
                    result |= (low << (i + 1)) | (high << i)
                return result
            `, `
            function swapBitsLoop(n) {
              let result = 0;
              for (let i = 0; i < 32; i += 2) { // pair of positions (i, i + 1)
                const low = (n >>> i) & 1, high = (n >>> (i + 1)) & 1;
                result = (result | (low << (i + 1)) | (high << i)) >>> 0; // keep it unsigned
              }
              return result;
            }
            `, `
            public int swapBitsLoop(int n) {
                int result = 0;
                for (int i = 0; i < 32; i += 2) { // pair of positions (i, i + 1)
                    int low = (n >>> i) & 1, high = (n >>> (i + 1)) & 1;
                    result |= (low << (i + 1)) | (high << i);
                }
                return result;
            }
            `),
          cost("$O(1)$: always 16 iterations for a 32-bit number ($O(w)$ for a $w$-bit word).", "$O(1)$."),
          ap(2, 'Masks and two shifts (optimal)'),
          p("A pair of **masks** handles all 16 pairs at once:"),
          ul(
            "`0x55555555` is `0101…0101`: it keeps only the **even-position** bits (0, 2, 4, …).",
            "`0xAAAAAAAA` is `1010…1010`: it keeps only the **odd-position** bits (1, 3, 5, …)."
          ),
          p("Shift the even bits **left** by one so they land in the odd positions, shift the odd bits **right** by one so they land in the even positions, and combine with OR."),
          pre(`
            n                    = 101001
            even bits (& 0x55…)  = 000001   << 1  →  000010
            odd bits  (& 0xAA…)  = 101000   >> 1  →  010100
            OR                                       010110  = 22
          `),
          note("Use an **unsigned/logical** right shift for the odd bits (`>>>` in Java and JavaScript). With a signed shift, a set bit 31 would drag 1s in from the left."),
          impl(`
            def swap_odd_and_even_bits(n: int) -> int:
                even_bits = n & 0x55555555   # bits 0, 2, 4, ...
                odd_bits = n & 0xAAAAAAAA    # bits 1, 3, 5, ...
                return ((even_bits << 1) | (odd_bits >> 1)) & 0xFFFFFFFF
            `, `
            function swapOddAndEvenBits(n) {
              const evenBits = n & 0x55555555; // bits 0, 2, 4, ...
              const oddBits = n & 0xaaaaaaaa;  // bits 1, 3, 5, ...
              return ((evenBits << 1) | (oddBits >>> 1)) >>> 0; // read as unsigned
            }
            `, `
            public int swapOddAndEvenBits(int n) {
                int evenBits = n & 0x55555555; // bits 0, 2, 4, ...
                int oddBits = n & 0xAAAAAAAA;  // bits 1, 3, 5, ...
                return (evenBits << 1) | (oddBits >>> 1);
            }
            `),
          cx("$O(1)$. A fixed number of bitwise operations.", "$O(1)$."),
          vs([
            ['1. Loop over the pairs', '$O(w)$ for $w$ bits', '$O(1)$', 'Clear and general.'],
            ['2. Masks', '$O(1)$: five operations', '$O(1)$', 'The expected answer.'],
          ]),
          tests([
            ['n = 0', '0', 'No bits set.'],
            ['n = 1', '2', 'Example 2: bit 0 moves to bit 1.'],
            ['n = 2', '1', 'Bit 1 moves to bit 0.'],
            ['n = 3', '3', 'Both bits of a pair set: no change.'],
            ['n = 2147483648', '1073741824', 'Bit 31 moves to bit 30 (needs a logical shift).'],
            ['n = 4294967295', '4294967295', 'All 32 bits set.'],
            ['n = 41', '22', 'Example 1.'],
          ], { fn: ['swap_bits_loop', 'swap_odd_and_even_bits'] }),
          tips(
            "Writing the masks in hex is much less error-prone than in decimal: `0x5` is `0101` and `0xA` is `1010`, repeated eight times.",
            "In Java the result is an `int`, so a set bit 31 makes it print as a negative number. Interpret it with `Integer.toUnsignedString` if needed."
          ),
        ],
      },
    ],
  });
})();
