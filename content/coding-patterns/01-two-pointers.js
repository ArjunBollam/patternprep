(function () {
  const { p, h, h3, ul, ol, note, ex, arr, state, code, impl, cx, table, rg } = K;

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
          p("You are given an array of integers sorted in **ascending order** and a target value. Return the **indexes of any two numbers** whose values **add up to the target**. The two indexes can be returned in either order. If no such pair exists, return an empty array."),
          ex('nums = [-5, -2, 3, 4, 6], target = 7', '[2, 3]', "`nums[2] + nums[3] = 3 + 4 = 7`"),
          ex('nums = [1, 1, 1], target = 2', '[0, 1]', "any two different indexes work, so `[0, 2]`, `[1, 2]` or the same pairs in reverse order are also accepted."),
          h('Intuition'),
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
          p("This checks up to $n(n-1)/2$ pairs, so it runs in $O(n^2)$ time. Notice that it never uses the fact that the array is **sorted**. That fact is a strong hint that we can discard many pairs without looking at them."),
          p("Let's put one pointer on each end of the array and see what a single comparison tells us. We'll use the first example:"),
          arr([-5, -2, 3, 4, 6], { state: 'target = 7' }),
          p("Start with the **smallest** value (`left = 0`) and the **largest** value (`right = 4`). Their sum is `-5 + 6 = 1`."),
          arr([-5, -2, 3, 4, 6], { p: { left: 0, right: 4 }, on: ['left', 'right'], state: 'sum = 1' }),
          p("A sum of 1 is **smaller** than 7, so we need a bigger sum. Which pointer should move?"),
          ul(
            "**Moving `right` to the left** can only pick a value that is less than or equal to 6, so the sum could only shrink or stay the same. That never helps.",
            "**Moving `left` to the right** picks a value that is greater than or equal to -5, so the sum can grow. In fact, -5 is useless from now on: even paired with the largest value available (6) it falls short of the target, so it can't pair with anything smaller either."
          ),
          p("So when the sum is too small, we increment `left`:"),
          arr([-5, -2, 3, 4, 6], { p: { left: 0, right: 4 }, state: 'sum = 1 < 7  →  left += 1' }),
          arr([-5, -2, 3, 4, 6], { p: { left: 1, right: 4 }, on: ['left'], dim: [0] }),
          p("Now the sum is `-2 + 6 = 4`. That's still below the target, and by the same reasoning -2 cannot be part of any answer, so `left` moves again:"),
          arr([-5, -2, 3, 4, 6], { p: { left: 1, right: 4 }, dim: [0], state: 'sum = 4 < 7  →  left += 1' }),
          arr([-5, -2, 3, 4, 6], { p: { left: 2, right: 4 }, on: ['left'], dim: [0, 1] }),
          p("This time the sum is `3 + 6 = 9`, which is **too large**. The reasoning flips: moving `left` rightward could only make the sum larger, while moving `right` leftward can make it smaller. 6 is now useless, because even paired with the smallest value still available (3) it overshoots. So we decrement `right`:"),
          arr([-5, -2, 3, 4, 6], { p: { left: 2, right: 4 }, dim: [0, 1], state: 'sum = 9 > 7  →  right -= 1' }),
          arr([-5, -2, 3, 4, 6], { p: { left: 2, right: 3 }, on: ['right'], dim: [0, 1, 4] }),
          p("Finally `3 + 4 = 7` equals the target, so we return `[left, right] = [2, 3]`."),
          arr([-5, -2, 3, 4, 6], { p: { left: 2, right: 3 }, hl: [2, 3], dim: [0, 1, 4], state: 'sum = 7 == 7  →  return [2, 3]' }),
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
          h('Test cases'),
          ul(
            "Empty array or a single element → `[]` (no pair exists).",
            "No valid pair, e.g. `nums = [1, 2, 3], target = 10` → `[]`.",
            "Pair uses the two ends, e.g. `nums = [2, 5, 9], target = 11` → `[0, 2]`.",
            "Negative numbers and duplicates, e.g. `nums = [-3, -3, 0, 4], target = -6` → `[0, 1]`."
          ),
        ],
      },

      // -------------------------------------------------------------------
      {
        id: 'triplet-sum',
        title: 'Triplet Sum',
        body: [
          p("Given an array of integers, return **every triplet** `[a, b, c]` of values from **three different positions** such that `a + b + c = 0`. The result must **not contain duplicate triplets** (two triplets with the same values count as the same triplet). Each triplet and the list of triplets can be in any order."),
          ex('nums = [0, -1, 2, -3, 1]', '[[-3, 1, 2], [-1, 0, 1]]'),
          ex('nums = [2, 2, -4, -4, 0]', '[[-4, 2, 2]]', "the value pair (2, 2) and -4 sum to zero. Using the second -4 would only produce the same triplet again."),
          ex('nums = [1, 2, 3]', '[]'),
          h('Intuition'),
          p("Brute force tries every combination of three indexes and stores sorted triplets in a set to drop duplicates. That costs $O(n^3)$ time."),
          p("A better idea: **fix one number** and look for the other two. If we fix `a = nums[i]`, then we need two numbers that sum to `-a`. That is exactly [Pair Sum - Sorted](#/two-pointers/pair-sum-sorted), provided the array is sorted. Sorting costs $O(n log n)$, which is cheap compared with the $O(n^2)$ we're about to spend anyway."),
          p("Sorting `[0, -1, 2, -3, 1]` gives `[-3, -1, 0, 1, 2]`. Fix `i = 0` (value -3); we now need a pair in the rest of the array summing to 3:"),
          arr([-3, -1, 0, 1, 2], { p: { i: 0, left: 1, right: 4 }, on: ['i'], state: 'need pair sum = 3\n-1 + 2 = 1 < 3  →  left += 1' }),
          arr([-3, -1, 0, 1, 2], { p: { i: 0, left: 2, right: 4 }, on: ['left'], state: '0 + 2 = 2 < 3  →  left += 1' }),
          arr([-3, -1, 0, 1, 2], { p: { i: 0, left: 3, right: 4 }, on: ['left'], hl: [0, 3, 4], state: '1 + 2 = 3  →  record [-3, 1, 2]' }),
          p("Then fix `i = 1` (value -1) and search for a pair summing to 1, which finds `[-1, 0, 1]`, and so on."),
          h3('Avoiding duplicates'),
          p("Sorting puts equal values next to each other, which makes duplicates easy to skip:"),
          ul(
            "**For the fixed number:** if `nums[i] == nums[i - 1]`, every triplet starting with this value was already found, so skip `i`.",
            "**For the pair:** after recording a match, move `left` forward and keep moving it while it equals the previous value. This prevents recording the same pair twice for the same `a`."
          ),
          arr([-4, -4, 0, 2, 2], { p: { i: 1 }, on: ['i'], dim: [1], state: 'nums[1] == nums[0]  →  skip, already handled' }),
          h3('Early exit'),
          p("Once `nums[i] > 0`, every number to its right is also positive, so no triplet can sum to zero. We can stop there."),
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
                    triplets.extend(pair_sums(nums, i + 1, -nums[i]))
                return triplets

            def pair_sums(nums: List[int], start: int, target: int) -> List[List[int]]:
                pairs = []
                left, right = start, len(nums) - 1
                while left < right:
                    total = nums[left] + nums[right]
                    if total < target:
                        left += 1
                    elif total > target:
                        right -= 1
                    else:
                        pairs.append([-target, nums[left], nums[right]])
                        left += 1
                        # skip equal values so the same pair isn't added twice
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
                const target = -nums[i];
                let left = i + 1, right = nums.length - 1;
                while (left < right) {
                  const sum = nums[left] + nums[right];
                  if (sum < target) left++;
                  else if (sum > target) right--;
                  else {
                    triplets.push([nums[i], nums[left], nums[right]]);
                    left++;
                    while (left < right && nums[left] === nums[left - 1]) left++;
                  }
                }
              }
              return triplets;
            }
            `, `
            public List<List<Integer>> tripletSum(int[] nums) {
                Arrays.sort(nums);
                List<List<Integer>> triplets = new ArrayList<>();
                for (int i = 0; i < nums.length; i++) {
                    if (nums[i] > 0) break; // no three positives can sum to 0
                    if (i > 0 && nums[i] == nums[i - 1]) continue; // same fixed value
                    int target = -nums[i];
                    int left = i + 1, right = nums.length - 1;
                    while (left < right) {
                        int sum = nums[left] + nums[right];
                        if (sum < target) left++;
                        else if (sum > target) right--;
                        else {
                            triplets.add(Arrays.asList(nums[i], nums[left], nums[right]));
                            left++;
                            while (left < right && nums[left] == nums[left - 1]) left++;
                        }
                    }
                }
                return triplets;
            }
            `),
          cx("$O(n^2)$. Sorting takes $O(n log n)$; then for each of the $n$ fixed values we run a linear two-pointer scan.",
            "$O(1)$ extra space beyond the output (ignoring the space the sorting algorithm uses internally, which is $O(log n)$ for typical in-place sorts)."),
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
          h('Intuition'),
          p("We could build a cleaned-up copy of the string and compare it with its reverse, but that uses $O(n)$ extra memory. Instead, compare characters **from both ends at once** with two pointers that skip anything that isn't a letter or digit."),
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
          h('Intuition'),
          p("Checking every pair of walls takes $O(n^2)$. To do better, notice the two things that make a container large: **width** and the **height of its shorter wall**."),
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
          h('Intuition'),
          p("With an extra array this is easy: copy the non-zero values over in order, then fill the remaining slots with zeros. To do it **in place** we use the unidirectional pattern: a `read` pointer visits every element, and a `write` pointer marks where the next non-zero value belongs."),
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
          h('Intuition'),
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
                if pivot == -1:
                    # Largest arrangement: wrap around to the smallest.
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
              if (pivot === -1) return letters.reverse().join('');
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
        ],
      },
    ],
  });
})();
