(function () {
  const { p, h, h3, ul, ol, note, ex, arr, state, code, impl, cx, table, rg, ap, cost, vs, tests, tips } = K;

  K.section({
    id: 'two-pointers',
    title: 'Two Pointers',
    lessons: [
      // -------------------------------------------------------------------
      {
        id: 'introduction',
        title: 'Introduction to Two Pointers',
        body: [
          p("The **two-pointer technique** walks through a sequence with two indexes at the same time instead of one. Each step looks at the pair of elements under the pointers, makes a decision, and moves one (or both) of the pointers. Because every move permanently rules out some candidates, a problem that looks like it needs every pair ($O(n^2)$) can often be solved in a single pass ($O(n)$)."),
          h('Common pointer strategies'),
          h3('1. Inward traversal'),
          p("One pointer starts at the beginning and the other at the end. They move toward each other until they meet. This works best when the input has some order (sorted values, or a string that should read the same from both ends), so that comparing the two ends tells you which side to give up on."),
          arr([1, 3, 4, 7, 9, 12], { p: { left: 0, right: 5 }, on: ['left', 'right'], state: 'move toward each other  →  ←' }),
          h3('2. Unidirectional traversal'),
          p("Both pointers start at the beginning and move in the same direction. Usually one pointer **reads** every element while the other marks where the next **kept** element should be **written**. This is how in-place filtering and compaction problems are solved."),
          arr([4, 0, 2, 0, 5], { p: { write: 0, read: 1 }, on: ['read'], state: 'read scans every item,\nwrite trails behind' }),
          h3('3. Staged traversal'),
          p("The first pointer searches for something specific. Once it finds it, a second pointer starts its own search relative to the first. [Next Lexicographical Sequence](#/two-pointers/next-lexicographical-sequence) is a good example: one pointer finds a pivot, a second finds the element to swap with it."),
          h('When should I think of two pointers?'),
          ul(
            "The input is a **linear structure**: an array, a string or a linked list.",
            "The input is **sorted**, or sorting it does not break the problem.",
            "The question asks for a **pair or triplet** that satisfies a condition, or asks you to **rearrange in place** with $O(1)$ extra space.",
            "A brute force solution would compare every pair, and you notice that one comparison tells you an entire group of pairs is useless."
          ),
          h('Why it works'),
          p("The key idea is **elimination**. In a sorted array, if `nums[left] + nums[right]` is too small, pairing `nums[left]` with anything to the left of `right` gives an even smaller sum, so `left` can never be part of the answer and we move past it. Each step throws away a whole row of the brute-force pair table, which is why a single pass is enough."),
          h('Real-world uses'),
          ul(
            "**Merging sorted data**: merge steps in merge sort, database merge-joins, and combining sorted log files all walk two pointers through two sorted streams.",
            "**Memory compaction**: garbage collectors and in-place filters slide live objects forward using a read pointer and a write pointer.",
            "**Text processing**: checking palindromes, trimming whitespace from both ends of a string, and reversing buffers in place.",
            "**Network diffing**: comparing two sorted lists of IDs (e.g. which files changed between two snapshots) in linear time."
          ),
          h('Template'),
          code(`
            def inward(nums):
                left, right = 0, len(nums) - 1
                while left < right:
                    # look at nums[left] and nums[right]
                    if should_move_left(nums, left, right):
                        left += 1
                    else:
                        right -= 1
            `, `
            function inward(nums) {
              let left = 0, right = nums.length - 1;
              while (left < right) {
                // look at nums[left] and nums[right]
                if (shouldMoveLeft(nums, left, right)) left++;
                else right--;
              }
            }
            `, `
            void inward(int[] nums) {
                int left = 0, right = nums.length - 1;
                while (left < right) {
                    // look at nums[left] and nums[right]
                    if (shouldMoveLeft(nums, left, right)) left++;
                    else right--;
                }
            }
            `),
        ],
      },

      // -------------------------------------------------------------------
      {
        id: 'pair-sum-sorted',
        title: 'Pair Sum - Sorted',
        body: [
          p("You are given an array of integers sorted in **ascending order** and a target value. Return the **indexes of any two numbers** whose values **add up to the target**. The two indexes must be different and can be returned in either order. If no such pair exists, return an empty array."),
          ex('nums = [-6, -1, 2, 4, 9], target = 6', '[2, 3]', "`nums[2] + nums[3] = 2 + 4 = 6`"),
          ex('nums = [1, 1, 1], target = 2', '[0, 1]', "any two different indexes work, so `[0, 2]`, `[1, 2]` or the same pairs in reverse order are also accepted."),

          ap(1, 'Brute force: check every pair'),
          p("The most direct approach is to try every pair. An outer loop fixes the first index `i`, and an inner loop tries every later index `j` as its partner. As soon as a pair adds up to the target we return it."),
          code(`
            from typing import List

            def pair_sum_sorted_brute_force(nums: List[int], target: int) -> List[int]:
                n = len(nums)
                for i in range(n):
                    for j in range(i + 1, n):
                        if nums[i] + nums[j] == target:
                            return [i, j]
                return []
            `, `
            function pairSumSortedBruteForce(nums, target) {
              const n = nums.length;
              for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                  if (nums[i] + nums[j] === target) return [i, j];
                }
              }
              return [];
            }
            `, `
            public int[] pairSumSortedBruteForce(int[] nums, int target) {
                int n = nums.length;
                for (int i = 0; i < n; i++) {
                    for (int j = i + 1; j < n; j++) {
                        if (nums[i] + nums[j] == target) return new int[]{i, j};
                    }
                }
                return new int[0];
            }
            `),
          cost("$O(n^2)$: up to $n(n-1)/2$ pairs are checked.", "$O(1)$."),
          p("This never uses the fact that the array is **sorted**. That fact is a strong hint that we can find a partner, or rule one out, without looking at every pair."),

          ap(2, 'Binary search for the partner'),
          p("Once we pick `nums[i]`, we know exactly which value its partner must have: `target - nums[i]`. Because the array is sorted, we can **binary search** for that value instead of scanning for it. Searching only to the right of `i` guarantees we never pair an element with itself and never test the same pair twice."),
          code(`
            from typing import List

            def pair_sum_sorted_binary_search(nums: List[int], target: int) -> List[int]:
                n = len(nums)
                for i in range(n):
                    need = target - nums[i]
                    lo, hi = i + 1, n - 1  # search only to the right of i
                    while lo <= hi:
                        mid = (lo + hi) // 2
                        if nums[mid] == need:
                            return [i, mid]
                        if nums[mid] < need:
                            lo = mid + 1
                        else:
                            hi = mid - 1
                return []
            `, `
            function pairSumSortedBinarySearch(nums, target) {
              const n = nums.length;
              for (let i = 0; i < n; i++) {
                const need = target - nums[i];
                let lo = i + 1, hi = n - 1; // search only to the right of i
                while (lo <= hi) {
                  const mid = (lo + hi) >> 1;
                  if (nums[mid] === need) return [i, mid];
                  if (nums[mid] < need) lo = mid + 1;
                  else hi = mid - 1;
                }
              }
              return [];
            }
            `, `
            public int[] pairSumSortedBinarySearch(int[] nums, int target) {
                int n = nums.length;
                for (int i = 0; i < n; i++) {
                    int need = target - nums[i];
                    int lo = i + 1, hi = n - 1; // search only to the right of i
                    while (lo <= hi) {
                        int mid = lo + (hi - lo) / 2;
                        if (nums[mid] == need) return new int[]{i, mid};
                        if (nums[mid] < need) lo = mid + 1;
                        else hi = mid - 1;
                    }
                }
                return new int[0];
            }
            `),
          cost("$O(n log n)$: one $O(log n)$ binary search for each of the $n$ elements.", "$O(1)$."),
          p("A hash map gives $O(n)$ time (that is how [Pair Sum - Unsorted](#/hash-maps-and-sets/pair-sum-unsorted) works), but it costs $O(n)$ extra memory and ignores the sorted order. Can we have linear time **and** constant memory?"),

          ap(3, 'Two pointers (optimal)'),
          p("Let's put one pointer on each end of the array and see what a single comparison tells us. We'll use the first example:"),
          arr([-6, -1, 2, 4, 9], { state: 'target = 6' }),
          p("Start with the **smallest** value (`left = 0`) and the **largest** value (`right = 4`). Their sum is `-6 + 9 = 3`."),
          arr([-6, -1, 2, 4, 9], { p: { left: 0, right: 4 }, on: ['left', 'right'], state: 'sum = 3' }),
          p("A sum of 3 is **smaller** than 6, so we need a bigger sum. Which pointer should move?"),
          ul(
            "**Moving `right` to the left** can only pick a value less than or equal to 9, so the sum could only shrink or stay the same. That never helps.",
            "**Moving `left` to the right** picks a value greater than or equal to -6, so the sum can grow. In fact, -6 is useless from now on: even paired with the largest value available (9) it falls short of the target, so it can't pair with anything smaller either."
          ),
          p("So when the sum is too small, we increment `left`:"),
          arr([-6, -1, 2, 4, 9], { p: { left: 0, right: 4 }, state: 'sum = 3 < 6  →  left += 1' }),
          arr([-6, -1, 2, 4, 9], { p: { left: 1, right: 4 }, on: ['left'], dim: [0] }),
          p("Now the sum is `-1 + 9 = 8`, which is **too large**. The reasoning flips: moving `left` rightward could only make the sum larger, while moving `right` leftward can make it smaller. 9 is now useless, because even paired with the smallest value still available (-1) it overshoots. So we decrement `right`:"),
          arr([-6, -1, 2, 4, 9], { p: { left: 1, right: 4 }, dim: [0], state: 'sum = 8 > 6  →  right -= 1' }),
          arr([-6, -1, 2, 4, 9], { p: { left: 1, right: 3 }, on: ['right'], dim: [0, 4] }),
          p("The sum `-1 + 4 = 3` is below the target again, so -1 is discarded the same way -6 was:"),
          arr([-6, -1, 2, 4, 9], { p: { left: 1, right: 3 }, dim: [0, 4], state: 'sum = 3 < 6  →  left += 1' }),
          p("Finally `2 + 4 = 6` equals the target, so we return `[left, right] = [2, 3]`."),
          arr([-6, -1, 2, 4, 9], { p: { left: 2, right: 3 }, hl: [2, 3], dim: [0, 1, 4], state: 'sum = 6 == 6  →  return [2, 3]' }),
          p("If the pointers ever meet without finding the target, every pair has been ruled out and we return an empty array."),
          h3('The rule in one box'),
          table(['Current sum', 'Action', 'Why'], [
            ['`sum < target`', '`left += 1`', "`nums[left]` is too small to pair with anything that is left"],
            ['`sum > target`', '`right -= 1`', "`nums[right]` is too large to pair with anything that is left"],
            ['`sum == target`', 'return `[left, right]`', 'found a valid pair'],
          ]),
          impl(`
            from typing import List

            def pair_sum_sorted(nums: List[int], target: int) -> List[int]:
                left, right = 0, len(nums) - 1
                while left < right:
                    total = nums[left] + nums[right]
                    if total < target:
                        # Sum too small: nums[left] can't be in the answer.
                        left += 1
                    elif total > target:
                        # Sum too large: nums[right] can't be in the answer.
                        right -= 1
                    else:
                        return [left, right]
                return []
            `, `
            function pairSumSorted(nums, target) {
              let left = 0;
              let right = nums.length - 1;
              while (left < right) {
                const sum = nums[left] + nums[right];
                if (sum < target) {
                  // Sum too small: nums[left] can't be in the answer.
                  left++;
                } else if (sum > target) {
                  // Sum too large: nums[right] can't be in the answer.
                  right--;
                } else {
                  return [left, right];
                }
              }
              return [];
            }
            `, `
            public int[] pairSumSorted(int[] nums, int target) {
                int left = 0, right = nums.length - 1;
                while (left < right) {
                    int sum = nums[left] + nums[right];
                    if (sum < target) {
                        // Sum too small: nums[left] can't be in the answer.
                        left++;
                    } else if (sum > target) {
                        // Sum too large: nums[right] can't be in the answer.
                        right--;
                    } else {
                        return new int[]{left, right};
                    }
                }
                return new int[0];
            }
            `),
          cx("$O(n)$, where $n$ is the length of `nums`. Each iteration moves one pointer one step closer to the other, so the loop runs at most $n - 1$ times.",
            "$O(1)$. Only two index variables are used, regardless of input size."),
          vs([
            ['1. Brute force', '$O(n^2)$', '$O(1)$', 'To state the problem precisely before optimizing.'],
            ['2. Binary search per element', '$O(n log n)$', '$O(1)$', 'A good stepping stone; also works when you can only search, not scan, the array.'],
            ['Hash map (see Pair Sum - Unsorted)', '$O(n)$', '$O(n)$', 'When the input is **not** sorted.'],
            ['3. Two pointers', '$O(n)$', '$O(1)$', 'The expected answer for sorted input.'],
          ]),
          tests([
            ['nums = [], target = 0', '[]', 'Empty array.'],
            ['nums = [4], target = 8', '[]', 'A single element cannot pair with itself.'],
            ['nums = [1, 2, 3], target = 10', '[]', 'No pair reaches the target.'],
            ['nums = [2, 5, 9], target = 11', '[0, 2]', 'The answer uses both ends.'],
            ['nums = [-3, -3, 0, 4], target = -6', '[0, 1]', 'Negative numbers and duplicate values.'],
            ['nums = [1, 3, 3, 8], target = 6', '[1, 2]', 'Two equal values at different indexes.'],
            ['nums = [-6, -1, 2, 4, 9], target = 6', '[2, 3]', 'Example 1: both pointers have to move.'],
          ], {
            fn: ['pair_sum_sorted_brute_force', 'pair_sum_sorted_binary_search', 'pair_sum_sorted'],
            check: "lambda r, e, kw: r == [] if e == [] else (len(r) == 2 and r[0] != r[1] and kw['nums'][r[0]] + kw['nums'][r[1]] == kw['target'])",
            jscheck: "(r, e, kw) => e.length === 0 ? r.length === 0 : (r.length === 2 && r[0] !== r[1] && kw.nums[r[0]] + kw.nums[r[1]] === kw.target)",
          }),
          tips(
            "Confirm the details before coding: can the same index be used twice (no), are there always answers (no, return `[]`), and does any valid pair count when there are several (yes).",
            "If the interviewer asks for **all** pairs, don't stop at the first match: record it, move both pointers inward, and skip repeated values (this is the inner loop of [Triplet Sum](#/coding-interview-patterns/two-pointers/triplet-sum)).",
            "Mention that the two-pointer argument depends on the sorted order. For unsorted input you would either sort first ($O(n log n)$, but the original indexes are lost unless you sort index pairs) or use a hash map."
          ),
        ],
      },

      // -------------------------------------------------------------------
      {
        id: 'triplet-sum',
        title: 'Triplet Sum',
        body: [
          p("Given an array of integers, return **every triplet** `[a, b, c]` of values taken from **three different positions** such that `a + b + c = 0`. The answer must **not contain duplicate triplets**: two triplets made of the same three values count as one, whatever their order. Each triplet, and the list of triplets, can be returned in any order. If no triplet sums to zero, return an empty array."),
          ex('nums = [3, -2, 1, 0, -1, -3]', '[[-3, 0, 3], [-2, -1, 3], [-1, 0, 1]]'),
          ex('nums = [2, 2, -4, -4, 0]', '[[-4, 2, 2]]', "the values -4, 2 and 2 sum to zero. Pairing the second -4 with the two 2s gives the same triplet again, so it is reported once."),
          ex('nums = [1, 2, 3]', '[]', "three positive numbers can never add up to zero."),

          ap(1, 'Brute force'),
          p("The most direct solution tries **every combination of three indexes** `i < j < k` with three nested loops and keeps the combinations whose values add up to zero."),
          p("The tricky part is the *no duplicates* rule. The same three values can show up at many different index combinations (for example `[2, -4, 2]` and `[2, 2, -4]` in the second example). A simple fix is to **sort the three values** of every match before storing it, so equal triplets always look identical, and to store them in a **hash set**, which keeps only one copy of each."),
          code(`
            from typing import List

            def triplet_sum_brute_force(nums: List[int]) -> List[List[int]]:
                n = len(nums)
                found = set()  # sorted tuples, so equal triplets collapse into one
                for i in range(n):
                    for j in range(i + 1, n):
                        for k in range(j + 1, n):
                            if nums[i] + nums[j] + nums[k] == 0:
                                found.add(tuple(sorted((nums[i], nums[j], nums[k]))))
                return [list(t) for t in found]
            `, `
            function tripletSumBruteForce(nums) {
              const n = nums.length;
              const found = new Map(); // "a,b,c" -> [a, b, c] with a <= b <= c
              for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                  for (let k = j + 1; k < n; k++) {
                    if (nums[i] + nums[j] + nums[k] === 0) {
                      const t = [nums[i], nums[j], nums[k]].sort((x, y) => x - y);
                      found.set(t.join(','), t);
                    }
                  }
                }
              }
              return [...found.values()];
            }
            `, `
            public List<List<Integer>> tripletSumBruteForce(int[] nums) {
                int n = nums.length;
                Set<List<Integer>> found = new HashSet<>(); // sorted lists, so duplicates collapse
                for (int i = 0; i < n; i++) {
                    for (int j = i + 1; j < n; j++) {
                        for (int k = j + 1; k < n; k++) {
                            if (nums[i] + nums[j] + nums[k] == 0) {
                                int[] t = {nums[i], nums[j], nums[k]};
                                Arrays.sort(t);
                                found.add(Arrays.asList(t[0], t[1], t[2]));
                            }
                        }
                    }
                }
                return new ArrayList<>(found);
            }
            `),
          cost("$O(n^3)$, because there are about $n^3/6$ index combinations and each is checked in constant time.",
            "$O(t)$ for the set of found triplets, where $t$ is the number of distinct triplets."),
          p("Correct, but far too slow for large inputs. The next step is to stop searching for all three numbers at once."),

          ap(2, 'Fix one number, then hash-set pair search'),
          p("If we **fix the first number** `a = nums[i]`, the equation `a + b + c = 0` turns into `b + c = -a`. That is simply a pair-sum problem for the target `-a`, which [Pair Sum - Unsorted](#/hash-maps-and-sets/pair-sum-unsorted) solves in one pass with a hash set: walk through the numbers after `i`, and for each value `c` ask whether its partner `b = -a - c` has already been seen."),
          p("To make deduplication easy we **sort the array first**. Then, for a fixed `i`, every value in the hash set came from an index before `j`, so `a <= b <= c` always holds, and each triplet is produced in the same order every time. We skip a fixed value that equals the one before it (it would only find the same triplets again), and a result set catches any remaining repeats."),
          code(`
            from typing import List

            def triplet_sum_hash_set(nums: List[int]) -> List[List[int]]:
                nums = sorted(nums)
                found = set()
                for i in range(len(nums)):
                    if i > 0 and nums[i] == nums[i - 1]:
                        continue  # same 'a' as last time: same triplets
                    seen = set()
                    for j in range(i + 1, len(nums)):
                        b = -nums[i] - nums[j]  # the partner nums[j] needs
                        if b in seen:
                            found.add((nums[i], b, nums[j]))
                        seen.add(nums[j])
                return [list(t) for t in found]
            `, `
            function tripletSumHashSet(nums) {
              nums = [...nums].sort((x, y) => x - y);
              const found = new Map();
              for (let i = 0; i < nums.length; i++) {
                if (i > 0 && nums[i] === nums[i - 1]) continue; // same 'a' as last time
                const seen = new Set();
                for (let j = i + 1; j < nums.length; j++) {
                  const b = -nums[i] - nums[j]; // the partner nums[j] needs
                  if (seen.has(b)) found.set(nums[i] + ',' + b + ',' + nums[j], [nums[i], b, nums[j]]);
                  seen.add(nums[j]);
                }
              }
              return [...found.values()];
            }
            `, `
            public List<List<Integer>> tripletSumHashSet(int[] nums) {
                int[] a = nums.clone();
                Arrays.sort(a);
                Set<List<Integer>> found = new HashSet<>();
                for (int i = 0; i < a.length; i++) {
                    if (i > 0 && a[i] == a[i - 1]) continue; // same 'a' as last time
                    Set<Integer> seen = new HashSet<>();
                    for (int j = i + 1; j < a.length; j++) {
                        int b = -a[i] - a[j]; // the partner a[j] needs
                        if (seen.contains(b)) found.add(Arrays.asList(a[i], b, a[j]));
                        seen.add(a[j]);
                    }
                }
                return new ArrayList<>(found);
            }
            `),
          cost("$O(n^2)$: sorting is $O(n log n)$, then for each of the $n$ fixed values we make one linear pass with constant-time set lookups.",
            "$O(n)$ for the `seen` set (plus the result set)."),
          p("This is already optimal in time. The final approach keeps $O(n^2)$ time but **drops the hash set**: since the array is sorted anyway, the pair search can use two pointers instead."),

          ap(3, 'Sort, then two-pointer pair search (optimal)'),
          p("Once the array is sorted, the pair search for `b + c = -a` is exactly [Pair Sum - Sorted](#/two-pointers/pair-sum-sorted): put `left` just after `i` and `right` at the end, and move whichever pointer brings the sum closer to the target. Sorting costs $O(n log n)$, which is cheap next to the $O(n^2)$ we spend on the pair searches anyway."),
          p("Sorting the first example gives `[-3, -2, -1, 0, 1, 3]`. Fix `i = 0` (value -3), so we need a pair that sums to **3** in the rest of the array:"),
          arr([-3, -2, -1, 0, 1, 3], { p: { i: 0, left: 1, right: 5 }, on: ['i'], state: 'need b + c = 3\n-2 + 3 = 1 < 3  →  left += 1' }),
          arr([-3, -2, -1, 0, 1, 3], { p: { i: 0, left: 2, right: 5 }, on: ['left'], dim: [1], state: '-1 + 3 = 2 < 3  →  left += 1' }),
          arr([-3, -2, -1, 0, 1, 3], { p: { i: 0, left: 3, right: 5 }, on: ['left'], dim: [1, 2], hl: [0, 3, 5], state: '0 + 3 = 3  →  record [-3, 0, 3]\nkeep searching: left += 1' }),
          arr([-3, -2, -1, 0, 1, 3], { p: { i: 0, left: 4, right: 5 }, on: ['left'], dim: [1, 2, 3], state: '1 + 3 = 4 > 3  →  right -= 1\npointers meet: done with i = 0' }),
          p("Notice the difference from Pair Sum - Sorted: we **don't stop at the first match**. After recording a pair we move `left` forward and keep going, because the same `a` can belong to several triplets."),
          p("Next, fix `i = 1` (value -2) and look for a pair summing to **2**:"),
          arr([-3, -2, -1, 0, 1, 3], { p: { i: 1, left: 2, right: 5 }, on: ['i'], dim: [0], hl: [1, 2, 5], state: '-1 + 3 = 2  →  record [-2, -1, 3]' }),
          p("Then `i = 2` (value -1) finds `0 + 1 = 1`, giving `[-1, 0, 1]`, and `i = 3` (value 0) finds nothing. At `i = 4` the fixed value is positive, so we stop (see *Early exit* below). The result is `[[-3, 0, 3], [-2, -1, 3], [-1, 0, 1]]`."),
          h3('Avoiding duplicate triplets'),
          p("Sorting puts equal values side by side, so duplicates can be skipped with a comparison against the previous element. There are two places where a duplicate could sneak in:"),
          ul(
            "**A repeated first number `a`.** If `nums[i] == nums[i - 1]`, the pair search for `-nums[i]` would find exactly the pairs it found last time. Skip this `i`.",
            "**A repeated second number `b`.** For a fixed `a`, once `[b, c]` is recorded, any later `left` with the same value `b` needs the same `c`. So after a match, advance `left` past every copy of the value just used."
          ),
          arr([-4, -4, 0, 2, 2], { p: { i: 1 }, on: ['i'], dim: [1], state: 'nums[1] == nums[0]  →  skip i = 1\n(i = 0 already found [-4, 2, 2])' }),
          arr([-4, 1, 1, 3, 3], { p: { i: 0, left: 2, right: 4 }, on: ['left'], dim: [1], state: 'after recording [-4, 1, 3]:\nnums[2] == nums[1]  →  skip it too' }),
          p("We never need a third check for `c`. With `a` and `b` fixed, `c = -(a + b)` is fully determined, so once every `(a, b)` pair is unique, every triplet is unique."),
          h3('Early exit'),
          p("After sorting, if `nums[i] > 0` then every number to its right is positive as well, and three positive numbers can't sum to zero. We can stop the outer loop right there."),
          impl(`
            from typing import List

            def triplet_sum(nums: List[int]) -> List[List[int]]:
                nums.sort()
                triplets = []
                for i in range(len(nums)):
                    if nums[i] > 0:
                        break  # no three positives can sum to 0
                    if i > 0 and nums[i] == nums[i - 1]:
                        continue  # same fixed value as before
                    for b, c in pair_sums(nums, i + 1, -nums[i]):
                        triplets.append([nums[i], b, c])
                return triplets

            def pair_sums(nums: List[int], start: int, target: int) -> List[List[int]]:
                """Every distinct pair in the sorted range nums[start:] that adds up to target."""
                pairs = []
                left, right = start, len(nums) - 1
                while left < right:
                    total = nums[left] + nums[right]
                    if total < target:
                        left += 1
                    elif total > target:
                        right -= 1
                    else:
                        pairs.append([nums[left], nums[right]])
                        left += 1
                        # skip copies of the 'b' we just used
                        while left < right and nums[left] == nums[left - 1]:
                            left += 1
                return pairs
            `, `
            function tripletSum(nums) {
              nums.sort((a, b) => a - b);
              const triplets = [];
              for (let i = 0; i < nums.length; i++) {
                if (nums[i] > 0) break; // no three positives can sum to 0
                if (i > 0 && nums[i] === nums[i - 1]) continue; // same fixed value
                for (const [b, c] of pairSums(nums, i + 1, -nums[i])) triplets.push([nums[i], b, c]);
              }
              return triplets;
            }

            function pairSums(nums, start, target) {
              const pairs = [];
              let left = start, right = nums.length - 1;
              while (left < right) {
                const sum = nums[left] + nums[right];
                if (sum < target) left++;
                else if (sum > target) right--;
                else {
                  pairs.push([nums[left], nums[right]]);
                  left++;
                  // skip copies of the 'b' we just used
                  while (left < right && nums[left] === nums[left - 1]) left++;
                }
              }
              return pairs;
            }
            `, `
            public List<List<Integer>> tripletSum(int[] nums) {
                Arrays.sort(nums);
                List<List<Integer>> triplets = new ArrayList<>();
                for (int i = 0; i < nums.length; i++) {
                    if (nums[i] > 0) break; // no three positives can sum to 0
                    if (i > 0 && nums[i] == nums[i - 1]) continue; // same fixed value
                    for (int[] pair : pairSums(nums, i + 1, -nums[i])) {
                        triplets.add(Arrays.asList(nums[i], pair[0], pair[1]));
                    }
                }
                return triplets;
            }

            private List<int[]> pairSums(int[] nums, int start, int target) {
                List<int[]> pairs = new ArrayList<>();
                int left = start, right = nums.length - 1;
                while (left < right) {
                    int sum = nums[left] + nums[right];
                    if (sum < target) left++;
                    else if (sum > target) right--;
                    else {
                        pairs.add(new int[]{nums[left], nums[right]});
                        left++;
                        // skip copies of the 'b' we just used
                        while (left < right && nums[left] == nums[left - 1]) left++;
                    }
                }
                return pairs;
            }
            `),
          cx("$O(n^2)$. Sorting takes $O(n log n)$. Then each of the (at most) $n$ fixed values starts one two-pointer scan, and a scan moves its pointers at most $n$ times in total. $O(n log n) + O(n^2) = O(n^2)$.",
            "Between $O(log n)$ and $O(n)$, depending on the language's sort: Python's Timsort may use $O(n)$ helper space, while Java's `Arrays.sort` on an `int[]` (dual-pivot quicksort) needs only $O(log n)$ of stack. Apart from sorting, the algorithm uses a few pointers. This excludes the output."),
          note("**If the interviewer counts the output:** the number of distinct zero-sum triplets can grow quadratically (each fixed value can pair with up to about $n/2$ pairs), so including the returned list the space is $O(n^2)$ in the worst case."),
          vs([
            ['1. Brute force (three loops + set)', '$O(n^3)$', '$O(t)$', 'Only as a starting point to explain the problem.'],
            ['2. Fix one number + hash set', '$O(n^2)$', '$O(n)$', 'When you must not reorder the input in place (sort a copy first).'],
            ['3. Sort + two pointers', '$O(n^2)$', '$O(log n)$ to $O(n)$ (the sort)', 'The expected answer: same speed, no hash set, duplicates skipped naturally.'],
          ]),
          tests([
            ['nums = []', '[]', 'Empty input.'],
            ['nums = [0, 0]', '[]', 'Fewer than three numbers.'],
            ['nums = [0, 0, 0, 0]', '[[0, 0, 0]]', 'Many zeros still make exactly one triplet.'],
            ['nums = [4, 1, 7]', '[]', 'All positive: the early exit triggers immediately.'],
            ['nums = [-2, 1, 1, -2, 1, 1]', '[[-2, 1, 1]]', 'The same triplet can be built many ways but must be reported once.'],
            ['nums = [-5, 2, 3, -1, -2, 0, 1]', '[[-5, 2, 3], [-2, -1, 3], [-2, 0, 2], [-1, 0, 1]]', 'One fixed value (-2) belongs to two different triplets.'],
            ['nums = [3, -2, 1, 0, -1, -3]', '[[-3, 0, 3], [-2, -1, 3], [-1, 0, 1]]', 'Example 1.'],
          ], { fn: ['triplet_sum_brute_force', 'triplet_sum_hash_set', 'triplet_sum'], cmp: 'sort2' }),
          tips(
            "Say the brute force out loud first, including how you would remove duplicates, then explain the reduction *triplet sum → fix one number → pair sum*. Interviewers mostly grade that reduction.",
            "Ask whether you may modify the input. If not, sort a copy (the space cost becomes $O(n)$).",
            "A common follow-up is **k-sum**: fix one number and recurse on (k-1)-sum, bottoming out at the two-pointer pair sum. That runs in $O(n^{k-1})$.",
            "Another variant asks for the triplet whose sum is **closest** to a target. The same sort + two pointers loop works; track the best difference instead of collecting matches."
          ),
        ],
      },

      // -------------------------------------------------------------------
      {
        id: 'is-palindrome-valid',
        title: 'Is Palindrome Valid',
        body: [
          p("A **palindrome** reads the same forwards and backwards. Given a string, decide whether it is a palindrome **when only letters and digits are considered**. Spaces, punctuation and other symbols should be ignored. Treat uppercase and lowercase letters as equal."),
          ex('s = "Step on no pets!"', 'True', "keeping only letters and digits gives `steponnopets`, which reads the same in both directions."),
          ex('s = "abc123"', 'False'),
          ex('s = "!!"', 'True', "an empty sequence of letters is a palindrome."),
          ap(1, 'Clean the string, then compare it with its reverse'),
          p("The most literal solution follows the definition: build a new string that keeps only the letters and digits, lowercase it, and check whether it equals its own reverse."),
          code(`
            def is_palindrome_valid_clean(s: str) -> bool:
                cleaned = [c.lower() for c in s if c.isalnum()]
                return cleaned == cleaned[::-1]
            `, `
            function isPalindromeValidClean(s) {
              const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
              return cleaned === [...cleaned].reverse().join('');
            }
            `, `
            public boolean isPalindromeValidClean(String s) {
                StringBuilder cleaned = new StringBuilder();
                for (char c : s.toCharArray()) {
                    if (Character.isLetterOrDigit(c)) cleaned.append(Character.toLowerCase(c));
                }
                String forward = cleaned.toString();
                return forward.equals(cleaned.reverse().toString());
            }
            `),
          cost("$O(n)$: one pass to filter, one to reverse and one to compare.", "$O(n)$ for the cleaned copy and its reverse."),
          p("The running time is already optimal, but the copies aren't needed. We can compare the characters right where they are."),
          ap(2, 'Two pointers from both ends (optimal)'),
          p("Compare characters **from both ends at once** with two pointers that skip anything that isn't a letter or digit."),
          arr('race, car', { p: { left: 0, right: 8 }, on: ['left', 'right'], state: "'r' == 'r'  →  move both inward" }),
          p("When a pointer lands on a character we should ignore, we move just that pointer:"),
          arr('race, car', { p: { left: 3, right: 5 }, on: ['left'], dim: [0, 1, 2, 6, 7, 8], state: "'e' vs ' '  →  right skips the space" }),
          arr('race, car', { p: { left: 3, right: 3 }, on: ['right'], dim: [0, 1, 2, 4, 5, 6, 7, 8], state: "right skipped ',' and ' '\nleft == right  →  stop: palindrome" }),
          p("The letters of `\"race, car\"` are r-a-c-e-c-a-r, and every compared pair matched, so the answer is `True`. If we ever compare two **different** characters, we return `False` immediately."),
          h3('Steps'),
          ol(
            "Set `left = 0` and `right = len(s) - 1`.",
            "While `left < right`: advance `left` past non-alphanumeric characters, and retreat `right` past them (never letting them cross).",
            "Compare the lowercase forms of `s[left]` and `s[right]`. If they differ, return `False`.",
            "Move both pointers inward and repeat. If the loop ends, return `True`."
          ),
          impl(`
            def is_palindrome_valid(s: str) -> bool:
                left, right = 0, len(s) - 1
                while left < right:
                    # skip characters that are not letters or digits
                    while left < right and not s[left].isalnum():
                        left += 1
                    while left < right and not s[right].isalnum():
                        right -= 1
                    if s[left].lower() != s[right].lower():
                        return False
                    left += 1
                    right -= 1
                return True
            `, `
            function isPalindromeValid(s) {
              const isAlnum = c => /[a-z0-9]/i.test(c);
              let left = 0, right = s.length - 1;
              while (left < right) {
                // skip characters that are not letters or digits
                while (left < right && !isAlnum(s[left])) left++;
                while (left < right && !isAlnum(s[right])) right--;
                if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
                left++;
                right--;
              }
              return true;
            }
            `, `
            public boolean isPalindromeValid(String s) {
                int left = 0, right = s.length() - 1;
                while (left < right) {
                    // skip characters that are not letters or digits
                    while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
                    while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
                    if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                        return false;
                    }
                    left++;
                    right--;
                }
                return true;
            }
            `),
          cx("$O(n)$. Every character is visited at most once by one of the pointers.",
            "$O(1)$. We compare characters in place without building a new string."),
          vs([
            ['1. Clean copy + reverse', '$O(n)$', '$O(n)$', 'Quick to write; fine when memory is not a concern.'],
            ['2. Two pointers', '$O(n)$', '$O(1)$', 'The expected answer: no copies of the string.'],
          ]),
          tests([
            ['s = ""', 'True', 'Empty string.'],
            ['s = "a"', 'True', 'A single character.'],
            ['s = ".,"', 'True', 'Only punctuation: nothing left to compare.'],
            ['s = "ab"', 'False', 'Two different letters.'],
            ['s = "0P"', 'False', 'A digit and a letter are compared as characters.'],
            ['s = "12a21"', 'True', 'Digits count.'],
            ["s = \"No 'x' in Nixon\"", 'True', 'Mixed case, spaces and quotes are ignored.'],
            ['s = "Step on no pets!"', 'True', 'Example 1.'],
          ], { fn: ['is_palindrome_valid_clean', 'is_palindrome_valid'] }),
          tips(
            "Ask which characters count. Here only letters and digits do, and case is ignored. Some versions compare every character, or allow deleting one character (*valid palindrome II*: on the first mismatch, try skipping either side once).",
            "Watch the inner skip loops: each must also check `left < right`, or a string of punctuation runs a pointer off the end."
          ),
        ],
      },

      // -------------------------------------------------------------------
      {
        id: 'largest-container',
        title: 'Largest Container',
        body: [
          p("You are given an array `heights` where `heights[i]` is the height of a vertical wall standing at position `i`. Choose **two walls** that, together with the ground, form a container. Return the **largest amount of water** any such container can hold."),
          p("The water held between walls `i` and `j` is limited by the **shorter** wall: `min(heights[i], heights[j]) * (j - i)`."),
          ex('heights = [3, 1, 6, 2, 5, 4]', '15', "walls 0 (height 3) and 5 (height 4) are 5 apart, giving `min(3, 4) * 5 = 15`."),
          ex('heights = [2, 2]', '2'),
          ap(1, 'Brute force: try every pair of walls'),
          p("Every container is formed by a pair of walls, so we can compute the water for every pair `i < j` and keep the maximum."),
          code(`
            from typing import List

            def largest_container_brute_force(heights: List[int]) -> int:
                best = 0
                n = len(heights)
                for i in range(n):
                    for j in range(i + 1, n):
                        water = min(heights[i], heights[j]) * (j - i)
                        best = max(best, water)
                return best
            `, `
            function largestContainerBruteForce(heights) {
              let best = 0;
              const n = heights.length;
              for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                  best = Math.max(best, Math.min(heights[i], heights[j]) * (j - i));
                }
              }
              return best;
            }
            `, `
            public int largestContainerBruteForce(int[] heights) {
                int best = 0, n = heights.length;
                for (int i = 0; i < n; i++) {
                    for (int j = i + 1; j < n; j++) {
                        best = Math.max(best, Math.min(heights[i], heights[j]) * (j - i));
                    }
                }
                return best;
            }
            `),
          cost("$O(n^2)$ for the $n(n-1)/2$ pairs.", "$O(1)$."),
          p("Most of those pairs can be ruled out without computing them. To see which ones, look at the two things that make a container large: **width** and the **height of its shorter wall**."),
          ap(2, 'Two pointers from the outside in (optimal)'),
          p("Start with the **widest** possible container, using the first and last walls. Any other container is narrower, so the only way it can beat the current one is by being **taller**."),
          arr([3, 1, 6, 2, 5, 4], { p: { left: 0, right: 5 }, on: ['left', 'right'], state: 'water = min(3, 4) × 5 = 15\nmax = 15' }),
          p("Which wall do we give up? The container's height is set by the **shorter** wall (3, on the left). If we kept the left wall and moved `right` inward, the width would shrink and the height could never exceed 3, so the water could only go down. Every container that uses the left wall has therefore already been beaten, and we can safely move `left` past it."),
          arr([3, 1, 6, 2, 5, 4], { p: { left: 1, right: 5 }, on: ['left'], dim: [0], state: 'water = min(1, 4) × 4 = 4\n1 < 4  →  left += 1' }),
          arr([3, 1, 6, 2, 5, 4], { p: { left: 2, right: 5 }, on: ['left'], dim: [0, 1], state: 'water = min(6, 4) × 3 = 12\n6 > 4  →  right -= 1' }),
          arr([3, 1, 6, 2, 5, 4], { p: { left: 2, right: 4 }, on: ['right'], dim: [0, 1, 5], state: 'water = min(6, 5) × 2 = 10\n6 > 5  →  right -= 1' }),
          arr([3, 1, 6, 2, 5, 4], { p: { left: 2, right: 3 }, on: ['right'], dim: [0, 1, 4, 5], state: 'water = min(6, 2) × 1 = 2\npointers about to meet  →  answer 15' }),
          note("**Rule:** always move the pointer at the shorter wall. If both walls are the same height, moving either one (or both) is safe, because neither wall can form a larger container with anything in between."),
          impl(`
            from typing import List

            def largest_container(heights: List[int]) -> int:
                best = 0
                left, right = 0, len(heights) - 1
                while left < right:
                    water = min(heights[left], heights[right]) * (right - left)
                    best = max(best, water)
                    # The shorter wall limits every narrower container that uses it,
                    # so discard it.
                    if heights[left] < heights[right]:
                        left += 1
                    elif heights[left] > heights[right]:
                        right -= 1
                    else:
                        left += 1
                        right -= 1
                return best
            `, `
            function largestContainer(heights) {
              let best = 0;
              let left = 0, right = heights.length - 1;
              while (left < right) {
                const water = Math.min(heights[left], heights[right]) * (right - left);
                best = Math.max(best, water);
                // Discard the shorter wall: it limits every narrower container.
                if (heights[left] < heights[right]) left++;
                else if (heights[left] > heights[right]) right--;
                else { left++; right--; }
              }
              return best;
            }
            `, `
            public int largestContainer(int[] heights) {
                int best = 0;
                int left = 0, right = heights.length - 1;
                while (left < right) {
                    int water = Math.min(heights[left], heights[right]) * (right - left);
                    best = Math.max(best, water);
                    // Discard the shorter wall: it limits every narrower container.
                    if (heights[left] < heights[right]) left++;
                    else if (heights[left] > heights[right]) right--;
                    else { left++; right--; }
                }
                return best;
            }
            `),
          cx("$O(n)$. The pointers start $n - 1$ apart and every iteration closes the gap by at least one.",
            "$O(1)$."),
          vs([
            ['1. Every pair', '$O(n^2)$', '$O(1)$', 'Only to explain the problem.'],
            ['2. Two pointers', '$O(n)$', '$O(1)$', 'The expected answer. Be ready to explain *why* discarding the shorter wall is safe.'],
          ]),
          tests([
            ['heights = []', '0', 'No walls at all.'],
            ['heights = [5]', '0', 'One wall cannot hold water.'],
            ['heights = [0, 0, 0]', '0', 'Walls of height zero.'],
            ['heights = [4, 4]', '4', 'Two equal walls (the equal-height branch).'],
            ['heights = [1, 2, 3, 4, 5]', '6', 'Increasing heights: the widest pair is not the best one.'],
            ['heights = [6, 1, 1, 1, 6]', '24', 'The two outer walls win.'],
            ['heights = [2, 9, 1, 1, 9, 2]', '27', 'Two tall inner walls beat the wider outer pair.'],
            ['heights = [3, 1, 6, 2, 5, 4]', '15', 'Example 1.'],
          ], { fn: ['largest_container_brute_force', 'largest_container'] }),
          tips(
            "The proof is what interviewers listen for: the shorter wall can't do better with any narrower partner, because the width shrinks and the height is capped by that wall. So it can be discarded.",
            "Don't confuse this with *trapping rain water*, where water sits on top of every bar. That problem needs prefix maxima or a different two-pointer argument."
          ),
        ],
      },

      // -------------------------------------------------------------------
      {
        id: 'shift-zeros-to-the-end',
        title: 'Shift Zeros to the End',
        body: [
          p("Given an array of integers, move **every zero to the end** of the array while keeping the **relative order of the non-zero elements**. Do this **in place**, without creating a copy of the array."),
          ex('nums = [3, 0, 5, 0, 0, 7]', '[3, 5, 7, 0, 0, 0]'),
          ex('nums = [0, 0, 1]', '[1, 0, 0]'),
          ap(1, 'Extra array'),
          p("Ignoring the in-place rule for a moment, the task is easy with a second array: copy the non-zero values over in their original order, fill the remaining slots with zeros, then copy everything back into `nums`."),
          code(`
            from typing import List

            def shift_zeros_to_the_end_extra_array(nums: List[int]) -> None:
                result = [x for x in nums if x != 0]
                result += [0] * (len(nums) - len(result))
                nums[:] = result
            `, `
            function shiftZerosToTheEndExtraArray(nums) {
              const result = nums.filter(x => x !== 0);
              while (result.length < nums.length) result.push(0);
              for (let i = 0; i < nums.length; i++) nums[i] = result[i];
            }
            `, `
            public void shiftZerosToTheEndExtraArray(int[] nums) {
                int[] result = new int[nums.length]; // starts out as all zeros
                int k = 0;
                for (int x : nums) if (x != 0) result[k++] = x;
                System.arraycopy(result, 0, nums, 0, nums.length);
            }
            `),
          cost("$O(n)$.", "$O(n)$ for the temporary array, which the problem asks us to avoid."),
          ap(2, 'Two passes in place'),
          p("We can build the same result inside `nums`. A `write` index marks where the next non-zero value belongs. The first pass copies every non-zero value to `nums[write]`. `write` never gets ahead of the element being read, so nothing is overwritten before it is read. The second pass fills positions `write` to `n - 1` with zeros."),
          code(`
            from typing import List

            def shift_zeros_to_the_end_two_pass(nums: List[int]) -> None:
                write = 0
                for x in nums:
                    if x != 0:
                        nums[write] = x
                        write += 1
                for i in range(write, len(nums)):
                    nums[i] = 0
            `, `
            function shiftZerosToTheEndTwoPass(nums) {
              let write = 0;
              for (const x of nums) {
                if (x !== 0) nums[write++] = x;
              }
              for (let i = write; i < nums.length; i++) nums[i] = 0;
            }
            `, `
            public void shiftZerosToTheEndTwoPass(int[] nums) {
                int write = 0;
                for (int x : nums) {
                    if (x != 0) nums[write++] = x;
                }
                for (int i = write; i < nums.length; i++) nums[i] = 0;
            }
            `),
          cost("$O(n)$: two linear passes.", "$O(1)$."),
          p("That is already optimal. The final version does the same work in a **single pass**: it swaps values instead of copying them, so the array is always a rearrangement of the original and no clean-up pass is needed."),
          ap(3, 'One pass with read and write pointers (optimal)'),
          p("We use the unidirectional pattern: a `read` pointer visits every element, and a `write` pointer marks where the next non-zero value belongs."),
          p("Whenever `read` finds a non-zero value, we **swap** it into position `write` and advance `write`. Zeros are simply passed over by `read`, so they drift towards the back."),
          arr([3, 0, 5, 0, 0, 7], { p: { write: 0, read: 0 }, on: ['read'], state: 'nums[read] = 3 ≠ 0\nswap(read, write); write += 1' }),
          arr([3, 0, 5, 0, 0, 7], { p: { write: 1, read: 1 }, on: ['read'], hl: [0], state: 'nums[read] = 0  →  just move read' }),
          arr([3, 0, 5, 0, 0, 7], { p: { write: 1, read: 2 }, on: ['read'], hl: [0], state: 'nums[read] = 5 ≠ 0\nswap(2, 1); write += 1' }),
          arr([3, 5, 0, 0, 0, 7], { p: { write: 2, read: 5 }, on: ['read'], hl: [0, 1], state: 'read skipped two zeros\nnums[read] = 7 ≠ 0  →  swap(5, 2)' }),
          arr([3, 5, 7, 0, 0, 0], { p: { write: 3 }, on: ['write'], hl: [0, 1, 2], state: 'everything before write is non-zero,\neverything from write onward is zero' }),
          p("The invariant that makes this work: **all positions before `write` hold the non-zero values seen so far, in their original order.** Because `write` never passes `read`, a swap never moves a value we still need to read."),
          impl(`
            from typing import List

            def shift_zeros_to_the_end(nums: List[int]) -> None:
                write = 0  # next slot for a non-zero value
                for read in range(len(nums)):
                    if nums[read] != 0:
                        nums[write], nums[read] = nums[read], nums[write]
                        write += 1
            `, `
            function shiftZerosToTheEnd(nums) {
              let write = 0; // next slot for a non-zero value
              for (let read = 0; read < nums.length; read++) {
                if (nums[read] !== 0) {
                  [nums[write], nums[read]] = [nums[read], nums[write]];
                  write++;
                }
              }
            }
            `, `
            public void shiftZerosToTheEnd(int[] nums) {
                int write = 0; // next slot for a non-zero value
                for (int read = 0; read < nums.length; read++) {
                    if (nums[read] != 0) {
                        int tmp = nums[write];
                        nums[write] = nums[read];
                        nums[read] = tmp;
                        write++;
                    }
                }
            }
            `),
          cx("$O(n)$. `read` visits each element once, and each swap is constant time.",
            "$O(1)$. The array is rearranged in place."),
          vs([
            ['1. Extra array', '$O(n)$', '$O(n)$', 'When in-place is not required.'],
            ['2. Two passes in place', '$O(n)$', '$O(1)$', 'Simple and in place; writes every slot after the last non-zero twice.'],
            ['3. One pass with swaps', '$O(n)$', '$O(1)$', 'The usual answer; a single pass, and every element stays in the array.'],
          ]),
          tests([
            ['nums = []', '[]', 'Empty array.'],
            ['nums = [0]', '[0]', 'A single zero.'],
            ['nums = [0, 0, 0]', '[0, 0, 0]', 'Only zeros.'],
            ['nums = [1, 2, 3]', '[1, 2, 3]', 'No zeros: nothing moves.'],
            ['nums = [0, 0, 1]', '[1, 0, 0]', 'Zeros at the front.'],
            ['nums = [4, 0, -2, 0, 9, 0]', '[4, -2, 9, 0, 0, 0]', 'Negative values keep their relative order.'],
          ], { fn: ['shift_zeros_to_the_end_extra_array', 'shift_zeros_to_the_end_two_pass', 'shift_zeros_to_the_end'], inplace: 'nums' }),
          tips(
            "State the invariant (everything left of `write` is the non-zero prefix, in order). It makes the correctness argument one sentence long.",
            "A popular variant moves all values equal to some `x` to the end, or removes them and returns the new length. The same read/write loop solves both."
          ),
        ],
      },

      // -------------------------------------------------------------------
      {
        id: 'next-lexicographical-sequence',
        title: 'Next Lexicographical Sequence',
        body: [
          p("Given a string of lowercase letters, rearrange its letters to form the **next string in dictionary order**, i.e. the smallest rearrangement that is strictly **larger** than the current one. If the string is already the largest possible arrangement, return the **smallest** arrangement instead (wrap around)."),
          ex('s = "acdb"', '"adbc"', "the arrangements of these letters in order are `\"acbd\"`, `\"acdb\"`, `\"adbc\"`, ... so the one right after `\"acdb\"` is `\"adbc\"`."),
          ex('s = "cba"', '"abc"', "`\"cba\"` is the largest arrangement, so we wrap around to the smallest."),
          ap(1, 'Brute force: list every arrangement'),
          p("By definition, we could generate **every distinct arrangement** of the letters, sort them, find the current string, and return the one right after it (or the first one if the current string is the last)."),
          code(`
            from itertools import permutations

            def next_lexicographical_sequence_brute_force(s: str) -> str:
                arrangements = sorted(set(''.join(p) for p in permutations(s)))
                i = arrangements.index(s)
                return arrangements[(i + 1) % len(arrangements)]
            `, `
            function nextLexicographicalSequenceBruteForce(s) {
              const all = new Set();
              const letters = s.split('');
              const used = new Array(letters.length).fill(false);
              const generate = (cur) => {
                if (cur.length === letters.length) { all.add(cur.join('')); return; }
                for (let i = 0; i < letters.length; i++) {
                  if (used[i]) continue;
                  used[i] = true; cur.push(letters[i]);
                  generate(cur);
                  cur.pop(); used[i] = false;
                }
              };
              generate([]);
              const sorted = [...all].sort();
              const i = sorted.indexOf(s);
              return sorted[(i + 1) % sorted.length];
            }
            `, `
            public String nextLexicographicalSequenceBruteForce(String s) {
                TreeSet<String> all = new TreeSet<>(); // sorted, no duplicates
                permute(s.toCharArray(), 0, all);
                String next = all.higher(s);
                return next != null ? next : all.first();
            }

            private void permute(char[] a, int k, Set<String> out) {
                if (k == a.length) { out.add(new String(a)); return; }
                for (int i = k; i < a.length; i++) {
                    char t = a[k]; a[k] = a[i]; a[i] = t;
                    permute(a, k + 1, out);
                    t = a[k]; a[k] = a[i]; a[i] = t;
                }
            }
            `),
          cost("$O(n! · n)$: there can be $n!$ arrangements of length $n$ to build, sort and compare.", "$O(n! · n)$ to hold them."),
          p("Even a 12-letter string has almost half a billion arrangements, so this only works as a definition. The real solution edits the string directly."),
          ap(2, 'Pivot, successor, reverse (optimal)'),
          p("Think of the string like a number on an odometer. To get the *next* value we want to change the string as far to the **right** as possible, and by the smallest amount possible."),
          h3('Step 1: find the pivot'),
          p("Scan from the right. As long as letters keep getting larger (or staying equal) as we move left, that suffix is already at its **largest** arrangement and can't be increased on its own. The first letter that is **smaller than the letter to its right** is the **pivot**: it's the rightmost position we can increase."),
          arr('acdb', { p: { pivot: 1 }, on: ['pivot'], hl2: [2, 3], state: "suffix 'db' is non-increasing\n'c' < 'd'  →  pivot = 1" }),
          p("If there's no pivot, the whole string is non-increasing (like `\"cba\"`), so it's the largest arrangement; reverse it to get the smallest."),
          h3('Step 2: find the successor'),
          p("We want to replace the pivot with the **smallest letter in the suffix that is still larger than it**. Because the suffix is non-increasing, scanning it from the right finds that letter first: it's the **rightmost** letter greater than the pivot."),
          arr('acdb', { p: { pivot: 1, succ: 2 }, on: ['succ'], hl2: [2, 3], state: "from the right: 'b' ≤ 'c', 'd' > 'c'\nsuccessor = 2" }),
          h3('Step 3: swap, then reverse the suffix'),
          p("Swap the pivot and the successor. The suffix is still non-increasing, which is its **largest** order, but we want the **smallest** string with the new prefix, so we reverse the suffix to make it ascending."),
          arr('adcb', { p: { pivot: 1 }, hl: [1], hl2: [2, 3], state: "after swap: 'adcb'" }),
          arr('adbc', { hl: [1], hl2: [2, 3], state: "reverse suffix 'cb' → 'bc'\nresult: 'adbc'" }),
          impl(`
            def next_lexicographical_sequence(s: str) -> str:
                letters = list(s)
                # 1. Find the pivot: rightmost letter smaller than its right neighbour.
                pivot = len(letters) - 2
                while pivot >= 0 and letters[pivot] >= letters[pivot + 1]:
                    pivot -= 1
                if pivot < 0:
                    # Largest arrangement (or fewer than 2 letters): wrap around.
                    return ''.join(reversed(letters))
                # 2. Rightmost letter in the suffix that is larger than the pivot.
                succ = len(letters) - 1
                while letters[succ] <= letters[pivot]:
                    succ -= 1
                # 3. Swap, then make the suffix as small as possible.
                letters[pivot], letters[succ] = letters[succ], letters[pivot]
                letters[pivot + 1:] = reversed(letters[pivot + 1:])
                return ''.join(letters)
            `, `
            function nextLexicographicalSequence(s) {
              const letters = s.split('');
              // 1. Find the pivot: rightmost letter smaller than its right neighbour.
              let pivot = letters.length - 2;
              while (pivot >= 0 && letters[pivot] >= letters[pivot + 1]) pivot--;
              if (pivot < 0) return letters.reverse().join(''); // largest arrangement: wrap around
              // 2. Rightmost letter in the suffix that is larger than the pivot.
              let succ = letters.length - 1;
              while (letters[succ] <= letters[pivot]) succ--;
              // 3. Swap, then reverse the suffix.
              [letters[pivot], letters[succ]] = [letters[succ], letters[pivot]];
              let l = pivot + 1, r = letters.length - 1;
              while (l < r) {
                [letters[l], letters[r]] = [letters[r], letters[l]];
                l++;
                r--;
              }
              return letters.join('');
            }
            `, `
            public String nextLexicographicalSequence(String s) {
                char[] letters = s.toCharArray();
                // 1. Find the pivot: rightmost letter smaller than its right neighbour.
                int pivot = letters.length - 2;
                while (pivot >= 0 && letters[pivot] >= letters[pivot + 1]) pivot--;
                if (pivot >= 0) {
                    // 2. Rightmost letter in the suffix that is larger than the pivot.
                    int succ = letters.length - 1;
                    while (letters[succ] <= letters[pivot]) succ--;
                    char tmp = letters[pivot];
                    letters[pivot] = letters[succ];
                    letters[succ] = tmp;
                }
                // 3. Reverse the suffix (the whole string if there was no pivot).
                for (int l = pivot + 1, r = letters.length - 1; l < r; l++, r--) {
                    char tmp = letters[l];
                    letters[l] = letters[r];
                    letters[r] = tmp;
                }
                return new String(letters);
            }
            `),
          cx("$O(n)$. Finding the pivot, finding the successor and reversing the suffix are each a single linear pass.",
            "$O(n)$ for the character array, since strings are immutable in all three languages. The algorithm itself only uses $O(1)$ extra variables."),
          vs([
            ['1. Generate all arrangements', '$O(n! · n)$', '$O(n! · n)$', 'Only for tiny inputs or to check answers.'],
            ['2. Pivot, successor, reverse', '$O(n)$', '$O(n)$ (string copy)', 'The expected answer; in place for a mutable array.'],
          ]),
          tests([
            ['s = ""', '""', 'Empty string.'],
            ['s = "a"', '"a"', 'One letter: its only arrangement wraps to itself.'],
            ['s = "aaa"', '"aaa"', 'All letters equal: there is no larger arrangement.'],
            ['s = "ab"', '"ba"', 'The smallest case with a pivot.'],
            ['s = "ba"', '"ab"', 'Already the largest: wrap around.'],
            ['s = "aabb"', '"abab"', 'Repeated letters; the successor is the rightmost larger letter.'],
            ['s = "ynnoz"', '"ynnzo"', 'The pivot is the second-to-last letter.'],
            ['s = "dcba"', '"abcd"', 'Fully decreasing: reverse the whole string.'],
            ['s = "acdb"', '"adbc"', 'Example 1.'],
          ], { fn: ['next_lexicographical_sequence_brute_force', 'next_lexicographical_sequence'] }),
          tips(
            "This is the classic *next permutation* algorithm (C++ even ships it as `std::next_permutation`). Walk through a 4-letter example on the whiteboard; the three steps are much easier to justify that way.",
            "Use `>=` when searching for the pivot and `<=` when searching for the successor. With strict comparisons, repeated letters break the algorithm."
          ),
        ],
      },
    ],
  });
})();
