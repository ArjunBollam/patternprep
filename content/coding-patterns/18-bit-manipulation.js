(function () {
  const { p, h, h3, ul, ol, note, ex, arr, state, code, impl, cx, table, pre } = K;

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
          h('Intuition'),
          p("Counting bits separately for each number takes $O(\\log n)$ per number, $O(n \\log n)$ in total. We can do better by **reusing earlier answers**:"),
          p("Shifting `i` right by one drops its lowest bit: `i >> 1` has exactly the same bits as `i` except the last one. And `i >> 1` is smaller than `i`, so its count is already known. So:"),
          state('bits[i] = bits[i >> 1] + (i & 1)'),
          pre(`
            i = 6 → 110    i >> 1 = 3 → 11 (2 bits)    lowest bit 0    → 2
            i = 7 → 111    i >> 1 = 3 → 11 (2 bits)    lowest bit 1    → 3
          `),
          note("Another neat recurrence: `bits[i] = bits[i & (i - 1)] + 1`, because `i & (i - 1)` is `i` with its lowest set bit removed."),
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
        ],
      },

      {
        id: 'lonely-integer',
        title: 'Lonely Integer',
        body: [
          p("Every number in a non-empty array appears **exactly twice**, except for **one** number that appears once. Find that lonely number using $O(1)$ extra space."),
          ex('nums = [1, 3, 3, 2, 1]', '2'),
          ex('nums = [7]', '7'),
          h('Intuition'),
          p("A hash set would find it but needs $O(n)$ space. XOR does it with a single variable, thanks to two identities: `x ^ x = 0` and `x ^ 0 = x`. Since XOR is commutative and associative, XOR-ing **everything** together lets every pair cancel out, leaving only the lonely number."),
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
        ],
      },

      {
        id: 'swap-odd-and-even-bits',
        title: 'Swap Odd and Even Bits',
        body: [
          p("Given an unsigned 32-bit integer, **swap every pair of adjacent bits**: bit 0 with bit 1, bit 2 with bit 3, and so on. Return the resulting number."),
          ex('n = 41', '22', '41 is `101001`; swapping each pair gives `010110`, which is 22.'),
          ex('n = 1', '2'),
          h('Intuition'),
          p("Looping over all 16 pairs works, but a pair of **masks** does it all at once:"),
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
        ],
      },
    ],
  });
})();
