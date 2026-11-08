(function () {
  const { p, h, h3, ul, ol, note, ex, arr, state, code, impl, cx, rg, ap, cost, vs, tests, tips } = K;

  K.section({
    id: 'sliding-windows',
    title: 'Sliding Windows',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Sliding Windows',
        body: [
          p("A **sliding window** is a contiguous range `[left, right]` of an array or string that moves across the input. Instead of recomputing a property (a sum, a set of characters, a count) for every possible subarray from scratch, we **update it incrementally**: add the element entering the window on the right and remove the element leaving on the left. That turns many $O(n^2)$ or $O(n·k)$ scans into $O(n)$."),
          arr([2, 7, 1, 8, 2, 8, 1], { p: { left: 1, right: 3 }, hl: rg(1, 3), state: 'window = [7, 1, 8], sum = 16\nslide: sum += 2, sum -= 7' }),
          p("Sliding windows are a special case of two pointers: both pointers move in the same direction, and everything between them is \"the window\"."),
          h('Two flavours'),
          h3('Fixed-size window'),
          p("The window always holds exactly `k` elements. Each step moves both ends one position to the right. Typical questions: the maximum sum of `k` consecutive elements, or which length-`k` substrings are anagrams of a word ([Substring Anagrams](#/sliding-windows/substring-anagrams))."),
          h3('Dynamic-size window'),
          p("The window **expands** by moving `right` while it stays valid, and **shrinks** by moving `left` when it becomes invalid. Typical questions: the longest substring with some property, or the shortest subarray whose sum reaches a target."),
          h('When should I think of a sliding window?'),
          ul(
            "The question is about a **contiguous** subarray or substring.",
            "It asks for the **longest / shortest / count** of windows satisfying a condition.",
            "The condition can be **updated in $O(1)$** (or close) when one element enters or leaves, typically with a running sum or a frequency map.",
            "For dynamic windows, the condition is **monotonic**: if a window is invalid, every larger window containing it is also invalid (or vice versa)."
          ),
          h('Real-world uses'),
          ul(
            "**Rate limiting**: count requests in the last 60 seconds as time slides forward.",
            "**Network protocols**: TCP's sliding window controls how many unacknowledged packets may be in flight.",
            "**Moving averages** in stock charts and sensor smoothing.",
            "**Streaming analytics**: \"top pages in the last 5 minutes\"."
          ),
          h('Template (dynamic window)'),
          code(`
            def longest_valid_window(s):
                left = 0
                best = 0
                for right in range(len(s)):
                    add(s[right])                 # grow the window
                    while not window_is_valid():
                        remove(s[left])           # shrink until valid
                        left += 1
                    best = max(best, right - left + 1)
                return best
            `, `
            function longestValidWindow(s) {
              let left = 0, best = 0;
              for (let right = 0; right < s.length; right++) {
                add(s[right]);                 // grow the window
                while (!windowIsValid()) {
                  remove(s[left]);             // shrink until valid
                  left++;
                }
                best = Math.max(best, right - left + 1);
              }
              return best;
            }
            `, `
            int longestValidWindow(String s) {
                int left = 0, best = 0;
                for (int right = 0; right < s.length(); right++) {
                    add(s.charAt(right));              // grow the window
                    while (!windowIsValid()) {
                        remove(s.charAt(left));        // shrink until valid
                        left++;
                    }
                    best = Math.max(best, right - left + 1);
                }
                return best;
            }
            `),
        ],
      },

      {
        id: 'substring-anagrams',
        title: 'Substring Anagrams',
        body: [
          p("Given two lowercase strings `s` and `t`, return the **number of substrings of `s` that are anagrams of `t`**. An anagram uses exactly the same letters with the same counts, in any order."),
          ex('s = "bcaacbab", t = "abc"', '3', 'the substrings `"bca"`, `"acb"` and `"cba"` are anagrams of `"abc"`.'),
          ex('s = "ab", t = "abc"', '0'),
          ap(1, 'Brute force: sort every substring'),
          p("Two strings are anagrams exactly when their **sorted** letters are equal. So we sort `t` once, then sort every substring of `s` that has the same length and compare."),
          code(`
            def substring_anagrams_brute_force(s: str, t: str) -> int:
                k = len(t)
                target = sorted(t)
                return sum(1 for i in range(len(s) - k + 1) if sorted(s[i:i + k]) == target)
            `, `
            function substringAnagramsBruteForce(s, t) {
              const k = t.length;
              const key = str => [...str].sort().join('');
              const target = key(t);
              let count = 0;
              for (let i = 0; i + k <= s.length; i++) if (key(s.slice(i, i + k)) === target) count++;
              return count;
            }
            `, `
            public int substringAnagramsBruteForce(String s, String t) {
                int k = t.length(), count = 0;
                char[] target = t.toCharArray();
                Arrays.sort(target);
                for (int i = 0; i + k <= s.length(); i++) {
                    char[] window = s.substring(i, i + k).toCharArray();
                    Arrays.sort(window);
                    if (Arrays.equals(window, target)) count++;
                }
                return count;
            }
            `),
          cost("$O(n · k log k)$ for $n$ = `len(s)` and $k$ = `len(t)`: about $n$ windows, each sorted from scratch.", "$O(k)$ for the sorted copies."),
          p("Neighbouring windows share all but two letters, yet we redo the whole sort for each one. A sliding window can instead **update** the window's letter counts in constant time."),
          ap(2, 'Fixed-size sliding window with letter counts (optimal)'),
          p("Every anagram of `t` has length `len(t)`, so we only care about windows of that **fixed size**. Two strings are anagrams exactly when their **letter counts** match, and with only 26 letters, comparing two count arrays costs $O(26) = O(1)$."),
          p("Build the count array for `t` once. Then slide a window of length 3 across `s`, keeping a count array for the window: when the window moves, add the incoming letter and subtract the outgoing one."),
          arr('bcaacbab', { p: { left: 0, right: 2 }, hl: rg(0, 2), state: 'window b,c,a  →  counts match ✓  (count = 1)' }),
          arr('bcaacbab', { p: { left: 1, right: 3 }, on: ['left', 'right'], hl2: rg(1, 3), state: "add 'a', remove 'b'\nwindow c,a,a  →  no match" }),
          arr('bcaacbab', { p: { left: 3, right: 5 }, on: ['left', 'right'], hl: rg(3, 5), state: 'window a,c,b  →  match ✓  (count = 2)' }),
          arr('bcaacbab', { p: { left: 4, right: 6 }, on: ['left', 'right'], hl: rg(4, 6), state: 'window c,b,a  →  match ✓  (count = 3)' }),
          note("Comparing two 26-element arrays each step is constant work. A further optimisation keeps a running number of letters whose counts already match, so each step is updated in $O(1)$ without a full comparison."),
          impl(`
            def substring_anagrams(s: str, t: str) -> int:
                k = len(t)
                if k > len(s):
                    return 0
                need = [0] * 26
                window = [0] * 26
                for c in t:
                    need[ord(c) - ord('a')] += 1
                count = 0
                for right, c in enumerate(s):
                    window[ord(c) - ord('a')] += 1          # letter enters
                    if right >= k:
                        window[ord(s[right - k]) - ord('a')] -= 1  # letter leaves
                    if right >= k - 1 and window == need:
                        count += 1
                return count
            `, `
            function substringAnagrams(s, t) {
              const k = t.length;
              if (k > s.length) return 0;
              const code = c => c.charCodeAt(0) - 97;
              const need = new Array(26).fill(0);
              const window = new Array(26).fill(0);
              for (const c of t) need[code(c)]++;
              let count = 0;
              for (let right = 0; right < s.length; right++) {
                window[code(s[right])]++;                     // letter enters
                if (right >= k) window[code(s[right - k])]--; // letter leaves
                if (right >= k - 1 && window.every((v, i) => v === need[i])) count++;
              }
              return count;
            }
            `, `
            public int substringAnagrams(String s, String t) {
                int k = t.length();
                if (k > s.length()) return 0;
                int[] need = new int[26], window = new int[26];
                for (char c : t.toCharArray()) need[c - 'a']++;
                int count = 0;
                for (int right = 0; right < s.length(); right++) {
                    window[s.charAt(right) - 'a']++;                     // letter enters
                    if (right >= k) window[s.charAt(right - k) - 'a']--; // letter leaves
                    if (right >= k - 1 && Arrays.equals(window, need)) count++;
                }
                return count;
            }
            `),
          cx("$O(n)$, where $n$ is the length of `s`. Each step does a constant amount of work (the 26-letter comparison is $O(1)$).",
            "$O(1)$. Two arrays of 26 counts."),
          vs([
            ['1. Sort every substring', '$O(n · k log k)$', '$O(k)$', 'Only for very short inputs.'],
            ['2. Sliding window of counts', '$O(n)$', '$O(1)$ (26 counts)', 'The expected answer.'],
          ]),
          tests([
            ['s = "", t = "a"', '0', 'Empty string `s`.'],
            ['s = "ab", t = "abc"', '0', 'Example 2: `t` is longer than `s`.'],
            ['s = "a", t = "a"', '1', 'Window equals the whole string.'],
            ['s = "aaaa", t = "aa"', '3', 'Overlapping windows are counted separately.'],
            ['s = "abab", t = "ab"', '3', 'Windows "ab", "ba" and "ab".'],
            ['s = "xyz", t = "abc"', '0', 'No letters in common.'],
            ['s = "bcaacbab", t = "abc"', '3', 'Example 1.'],
          ], { fn: ['substring_anagrams_brute_force', 'substring_anagrams'] }),
          tips(
            "For a fixed-size window, the loop shape is always the same: add `s[right]`, remove `s[right - k]` once the window is full, then check.",
            "If the alphabet is large (Unicode), use a hash map of counts and a *matches* counter instead of comparing whole arrays."
          ),
        ],
      },

      {
        id: 'longest-substring-with-unique-characters',
        title: 'Longest Substring With Unique Characters',
        body: [
          p("Given a string, return the length of its **longest substring in which no character repeats**."),
          ex('s = "abcbdca"', '4', 'the substring `"bdca"` has four distinct characters. `"abc"` and `"cbd"` only have three.'),
          ex('s = "zzzz"', '1'),
          ap(1, 'Brute force: grow a substring from every start'),
          p("From each starting index, extend the substring one character at a time while its characters stay unique (tracked in a set). As soon as a character repeats, every longer substring from that start would also contain the repeat, so we move on to the next start."),
          code(`
            def longest_substring_brute_force(s: str) -> int:
                best = 0
                for i in range(len(s)):
                    seen = set()
                    for j in range(i, len(s)):
                        if s[j] in seen:
                            break  # every longer substring from i repeats too
                        seen.add(s[j])
                        best = max(best, j - i + 1)
                return best
            `, `
            function longestSubstringBruteForce(s) {
              let best = 0;
              for (let i = 0; i < s.length; i++) {
                const seen = new Set();
                for (let j = i; j < s.length; j++) {
                  if (seen.has(s[j])) break; // every longer substring from i repeats too
                  seen.add(s[j]);
                  best = Math.max(best, j - i + 1);
                }
              }
              return best;
            }
            `, `
            public int longestSubstringBruteForce(String s) {
                int best = 0;
                for (int i = 0; i < s.length(); i++) {
                    Set<Character> seen = new HashSet<>();
                    for (int j = i; j < s.length(); j++) {
                        if (!seen.add(s.charAt(j))) break; // repeat: stop extending
                        best = Math.max(best, j - i + 1);
                    }
                }
                return best;
            }
            `),
          cost("$O(n · m)$, where $m$ is the alphabet size, since no unique substring is longer than $m$; $O(n^2)$ when the alphabet is unbounded.", "$O(m)$ for the set."),
          ap(2, 'Sliding window that shrinks one step at a time'),
          p("Notice the **monotonic** property: if a window contains a duplicate, every larger window containing it does too. That's the signal for a dynamic sliding window."),
          ul(
            "**Expand**: move `right` forward and add `s[right]` to the window.",
            "**Shrink**: if `s[right]` was already in the window, move `left` forward until the earlier copy is gone.",
            "After each step the window has no duplicates, so its length is a candidate answer."
          ),
          code(`
            def longest_substring_shrinking(s: str) -> int:
                window = set()
                left = best = 0
                for right, c in enumerate(s):
                    while c in window:  # shrink until the old copy of c is gone
                        window.remove(s[left])
                        left += 1
                    window.add(c)
                    best = max(best, right - left + 1)
                return best
            `, `
            function longestSubstringShrinking(s) {
              const window = new Set();
              let left = 0, best = 0;
              for (let right = 0; right < s.length; right++) {
                while (window.has(s[right])) window.delete(s[left++]); // drop the old copy
                window.add(s[right]);
                best = Math.max(best, right - left + 1);
              }
              return best;
            }
            `, `
            public int longestSubstringShrinking(String s) {
                Set<Character> window = new HashSet<>();
                int left = 0, best = 0;
                for (int right = 0; right < s.length(); right++) {
                    while (window.contains(s.charAt(right))) window.remove(s.charAt(left++));
                    window.add(s.charAt(right));
                    best = Math.max(best, right - left + 1);
                }
                return best;
            }
            `),
          cost("$O(n)$: every character is added once and removed at most once.", "$O(m)$ for the set."),
          ap(3, 'Sliding window that jumps (optimal)'),
          p("Instead of shrinking one character at a time, we can remember the **last index** where each character appeared and **jump** `left` straight past it:"),
          arr('abcbdca', { p: { left: 0, right: 2 }, hl: rg(0, 2), state: 'window "abc" (length 3)\nlast = {a:0, b:1, c:2}' }),
          arr('abcbdca', { p: { left: 2, right: 3 }, on: ['left', 'right'], hl: rg(2, 3), dim: [0, 1], state: "'b' last seen at 1 (inside window)\nleft jumps to 1 + 1 = 2" }),
          arr('abcbdca', { p: { left: 3, right: 5 }, on: ['left'], hl: rg(3, 5), dim: [0, 1, 2], state: "'c' last seen at 2 (inside window)\nleft jumps to 3; window \"bdc\"" }),
          arr('abcbdca', { p: { left: 3, right: 6 }, on: ['right'], hl: rg(3, 6), dim: [0, 1, 2], state: "'a' last seen at 0, which is before left\nso it's not in the window: no jump\nwindow \"bdca\" (length 4)" }),
          note("Only jump if the previous occurrence is **inside** the window (`last[c] >= left`). Otherwise `left` would move backwards."),
          impl(`
            def longest_substring_with_unique_chars(s: str) -> int:
                last_seen = {}
                left = 0
                best = 0
                for right, c in enumerate(s):
                    if c in last_seen and last_seen[c] >= left:
                        left = last_seen[c] + 1  # jump past the duplicate
                    last_seen[c] = right
                    best = max(best, right - left + 1)
                return best
            `, `
            function longestSubstringWithUniqueChars(s) {
              const lastSeen = new Map();
              let left = 0, best = 0;
              for (let right = 0; right < s.length; right++) {
                const c = s[right];
                if (lastSeen.has(c) && lastSeen.get(c) >= left) {
                  left = lastSeen.get(c) + 1; // jump past the duplicate
                }
                lastSeen.set(c, right);
                best = Math.max(best, right - left + 1);
              }
              return best;
            }
            `, `
            public int longestSubstringWithUniqueChars(String s) {
                Map<Character, Integer> lastSeen = new HashMap<>();
                int left = 0, best = 0;
                for (int right = 0; right < s.length(); right++) {
                    char c = s.charAt(right);
                    if (lastSeen.containsKey(c) && lastSeen.get(c) >= left) {
                        left = lastSeen.get(c) + 1; // jump past the duplicate
                    }
                    lastSeen.put(c, right);
                    best = Math.max(best, right - left + 1);
                }
                return best;
            }
            `),
          cx("$O(n)$. `right` visits each character once and `left` only moves forward.",
            "$O(m)$, where $m$ is the number of distinct characters (at most the alphabet size)."),
          vs([
            ['1. Grow from every start', '$O(n · m)$', '$O(m)$', 'Baseline only.'],
            ['2. Window that shrinks step by step', '$O(n)$', '$O(m)$', 'Clear and optimal; `left` may visit each character once more.'],
            ['3. Window that jumps via last index', '$O(n)$', '$O(m)$', 'The tightest version: one pass, no inner loop.'],
          ]),
          tests([
            ['s = ""', '0', 'Empty string.'],
            ['s = "a"', '1', 'Single character.'],
            ['s = "zzzz"', '1', 'Example 2: one repeated character.'],
            ['s = "abcdef"', '6', 'No repeats: the whole string.'],
            ['s = "abba"', '2', 'The second `a` was last seen before `left`, so `left` must not jump back.'],
            ['s = "dvdf"', '3', 'The best window ("vdf") starts after a jump.'],
            ['s = "a b!a"', '4', 'Spaces and punctuation are characters too.'],
            ['s = "abcbdca"', '4', 'Example 1.'],
          ], { fn: ['longest_substring_brute_force', 'longest_substring_shrinking', 'longest_substring_with_unique_chars'] }),
          tips(
            "Always state the window invariant: *the window never contains a repeated character*. Each step restores it, so every window length you record is valid.",
            "The `last_seen[c] >= left` check is the classic bug in the jump version; `\"abba\"` exposes it."
          ),
        ],
      },

      {
        id: 'longest-uniform-substring-after-replacements',
        title: 'Longest Uniform Substring After Replacements',
        body: [
          p("A string is **uniform** if all its characters are the same. Given a string `s` and an integer `k`, you may **replace up to `k` characters** with any other character. Return the length of the **longest uniform substring** you can produce."),
          ex('s = "aabcdcca", k = 2', '5', 'take `"cdcca"`, which has three c\'s, and replace `d` and `a` with `c` to get `"ccccc"`.'),
          ex('s = "xyyx", k = 1', '3'),
          ap(1, 'Brute force: check every substring'),
          p("For any substring, the cheapest way to make it uniform is to keep its **most frequent** character and replace everything else. So a substring of length `L` works when `L - (highest frequency) ≤ k`. We can test every substring, updating the letter counts incrementally as each one grows from a fixed start."),
          code(`
            def longest_uniform_brute_force(s: str, k: int) -> int:
                best = 0
                for i in range(len(s)):
                    freq = {}
                    max_freq = 0
                    for j in range(i, len(s)):
                        freq[s[j]] = freq.get(s[j], 0) + 1
                        max_freq = max(max_freq, freq[s[j]])
                        if (j - i + 1) - max_freq <= k:
                            best = max(best, j - i + 1)
                return best
            `, `
            function longestUniformBruteForce(s, k) {
              let best = 0;
              for (let i = 0; i < s.length; i++) {
                const freq = new Map();
                let maxFreq = 0;
                for (let j = i; j < s.length; j++) {
                  freq.set(s[j], (freq.get(s[j]) || 0) + 1);
                  maxFreq = Math.max(maxFreq, freq.get(s[j]));
                  if (j - i + 1 - maxFreq <= k) best = Math.max(best, j - i + 1);
                }
              }
              return best;
            }
            `, `
            public int longestUniformBruteForce(String s, int k) {
                int best = 0;
                for (int i = 0; i < s.length(); i++) {
                    Map<Character, Integer> freq = new HashMap<>();
                    int maxFreq = 0;
                    for (int j = i; j < s.length(); j++) {
                        maxFreq = Math.max(maxFreq, freq.merge(s.charAt(j), 1, Integer::sum));
                        if (j - i + 1 - maxFreq <= k) best = Math.max(best, j - i + 1);
                    }
                }
                return best;
            }
            `),
          cost("$O(n^2)$ substrings, each updated in $O(1)$.", "$O(m)$ for the counts, $m$ = number of distinct characters."),
          ap(2, 'One sliding window per target letter'),
          p("Fix the letter we want to end up with, say `c`. The question becomes: what is the longest window containing **at most `k` letters other than `c`**? That's a standard dynamic window: grow `right`, and shrink `left` while there are more than `k` mismatches. Repeat for each distinct letter and keep the best."),
          code(`
            def longest_uniform_per_letter(s: str, k: int) -> int:
                best = 0
                for target in set(s):
                    left = mismatches = 0
                    for right, c in enumerate(s):
                        if c != target:
                            mismatches += 1
                        while mismatches > k:  # too many letters to replace
                            if s[left] != target:
                                mismatches -= 1
                            left += 1
                        best = max(best, right - left + 1)
                return best
            `, `
            function longestUniformPerLetter(s, k) {
              let best = 0;
              for (const target of new Set(s)) {
                let left = 0, mismatches = 0;
                for (let right = 0; right < s.length; right++) {
                  if (s[right] !== target) mismatches++;
                  while (mismatches > k) { // too many letters to replace
                    if (s[left] !== target) mismatches--;
                    left++;
                  }
                  best = Math.max(best, right - left + 1);
                }
              }
              return best;
            }
            `, `
            public int longestUniformPerLetter(String s, int k) {
                int best = 0;
                Set<Character> letters = new HashSet<>();
                for (char c : s.toCharArray()) letters.add(c);
                for (char target : letters) {
                    int left = 0, mismatches = 0;
                    for (int right = 0; right < s.length(); right++) {
                        if (s.charAt(right) != target) mismatches++;
                        while (mismatches > k) { // too many letters to replace
                            if (s.charAt(left) != target) mismatches--;
                            left++;
                        }
                        best = Math.max(best, right - left + 1);
                    }
                }
                return best;
            }
            `),
          cost("$O(m · n)$: one linear window per distinct letter ($m ≤ 26$ for lowercase, so effectively linear).", "$O(m)$."),
          p("The final version handles every letter in **a single window** by tracking the most frequent letter inside it."),
          ap(3, 'One window with a running maximum frequency (optimal)'),
          p("A window is valid when:"),
          K.state('window length - highest frequency in window ≤ k'),
          p("That condition is monotonic in window length, so we use a dynamic window with a frequency map. Expand `right`; whenever the window becomes invalid, move `left` forward by one."),
          arr('aabcdcca', { p: { left: 0, right: 3 }, hl: rg(0, 3), state: 'window "aabc": length 4, max freq 2 (a)\n4 - 2 = 2 ≤ k  ✓' }),
          arr('aabcdcca', { p: { left: 1, right: 4 }, on: ['left', 'right'], hl2: rg(1, 4), dim: [0], state: 'adding d: "aabcd" needs 3 > k\nslide: left += 1 → "abcd"' }),
          arr('aabcdcca', { p: { left: 3, right: 7 }, hl: rg(3, 7), dim: [0, 1, 2], state: 'window "cdcca": length 5, max freq 3 (c)\n5 - 3 = 2 ≤ k  ✓  → best = 5' }),
          h3('A subtle trick'),
          p("When the window slides, the true highest frequency might go *down*, but we don't bother decreasing our recorded `max_freq`. That's safe: the answer can only improve when a window has a **higher** frequency than any seen before, and a stale (too large) `max_freq` only ever keeps the window at its current size rather than letting it grow incorrectly. This keeps each step $O(1)$."),
          impl(`
            def longest_uniform_substring_after_replacements(s: str, k: int) -> int:
                freq = {}
                max_freq = 0
                left = 0
                best = 0
                for right, c in enumerate(s):
                    freq[c] = freq.get(c, 0) + 1
                    max_freq = max(max_freq, freq[c])
                    # Too many characters to replace: slide the window.
                    if (right - left + 1) - max_freq > k:
                        freq[s[left]] -= 1
                        left += 1
                    best = max(best, right - left + 1)
                return best
            `, `
            function longestUniformSubstringAfterReplacements(s, k) {
              const freq = new Map();
              let maxFreq = 0, left = 0, best = 0;
              for (let right = 0; right < s.length; right++) {
                const c = s[right];
                freq.set(c, (freq.get(c) || 0) + 1);
                maxFreq = Math.max(maxFreq, freq.get(c));
                // Too many characters to replace: slide the window.
                if (right - left + 1 - maxFreq > k) {
                  freq.set(s[left], freq.get(s[left]) - 1);
                  left++;
                }
                best = Math.max(best, right - left + 1);
              }
              return best;
            }
            `, `
            public int longestUniformSubstringAfterReplacements(String s, int k) {
                Map<Character, Integer> freq = new HashMap<>();
                int maxFreq = 0, left = 0, best = 0;
                for (int right = 0; right < s.length(); right++) {
                    char c = s.charAt(right);
                    freq.merge(c, 1, Integer::sum);
                    maxFreq = Math.max(maxFreq, freq.get(c));
                    // Too many characters to replace: slide the window.
                    if (right - left + 1 - maxFreq > k) {
                        freq.merge(s.charAt(left), -1, Integer::sum);
                        left++;
                    }
                    best = Math.max(best, right - left + 1);
                }
                return best;
            }
            `),
          cx("$O(n)$. Each character enters the window once and leaves at most once.",
            "$O(m)$ for the frequency map, where $m$ is the number of distinct characters."),
          vs([
            ['1. Every substring', '$O(n^2)$', '$O(m)$', 'Baseline.'],
            ['2. One window per letter', '$O(m · n)$', '$O(m)$', 'Easiest correct linear-ish answer; simple to prove.'],
            ['3. One window, running max frequency', '$O(n)$', '$O(m)$', 'The expected answer; be ready to defend the stale `max_freq`.'],
          ]),
          tests([
            ['s = "", k = 2', '0', 'Empty string.'],
            ['s = "a", k = 0', '1', 'Single character.'],
            ['s = "abc", k = 0', '1', 'No replacements allowed.'],
            ['s = "aaaa", k = 2', '4', 'Already uniform.'],
            ['s = "abcd", k = 10', '4', '`k` is larger than the string.'],
            ['s = "abbbcbb", k = 1', '6', 'One replacement joins two runs of b.'],
            ['s = "xyyx", k = 1', '3', 'Example 2.'],
            ['s = "aabcdcca", k = 2', '5', 'Example 1.'],
          ], { fn: ['longest_uniform_brute_force', 'longest_uniform_per_letter', 'longest_uniform_substring_after_replacements'] }),
          tips(
            "If the stale `max_freq` trick feels risky in an interview, present the per-letter window first: it's obviously correct and still linear for a fixed alphabet.",
            "Note that the optimal window never shrinks, it only slides. That is why an `if` is enough where most dynamic windows need a `while`."
          ),
        ],
      },
    ],
  });
})();
