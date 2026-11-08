(function () {
  const { p, h, h3, ul, ol, note, ex, bars, state, code, impl, cx, table, ap, cost, vs, tests, tips } = K;

  K.section({
    id: 'intervals',
    title: 'Intervals',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Intervals',
        body: [
          p("An **interval** is a range `[start, end]`: a meeting from 9 to 11, a reserved block of memory, a span of text. Interval problems ask how ranges **overlap**, **merge**, **intersect** or **stack up**. Almost all of them start the same way: **sort by start time**, so overlapping intervals end up next to each other."),
          h('When do two intervals overlap?'),
          p("Intervals `A = [a1, a2]` and `B = [b1, b2]` overlap exactly when **each one starts before the other ends**:"),
          state('a1 <= b2  and  b1 <= a2'),
          bars([[1, 4], [3, 6], [7, 9]], { hl: [0, 1], cap: '[1, 4] and [3, 6] overlap; [7, 9] overlaps neither' }),
          p("When they do overlap, their **intersection** is `[max(a1, b1), min(a2, b2)]` and their **union** (merge) is `[min(a1, b1), max(a2, b2)]`."),
          note("Always check whether the problem treats touching endpoints (like `[1, 3]` and `[3, 5]`) as overlapping. For meetings, ending at 3 and starting at 3 is usually fine (no overlap); for closed numeric ranges they share the point 3."),
          h('Common techniques'),
          table(['Technique', 'Used for'], [
            ['Sort by start, then scan and compare with the last kept interval', 'merging, inserting, removing overlaps'],
            ['Two pointers over two sorted interval lists', 'intersections of two schedules'],
            ['Sweep line: turn intervals into +1 / -1 events and sort by time', 'maximum concurrent intervals, rooms needed'],
            ['Min-heap of end times', 'assigning resources (rooms, machines) greedily'],
          ]),
          h('Real-world uses'),
          ul(
            "**Calendars**: finding free slots shared by several people, or detecting double bookings.",
            "**Resource allocation**: how many meeting rooms, servers or CPU cores are needed at peak.",
            "**Genomics**: merging overlapping gene regions.",
            "**Video and audio editing**: combining and trimming clips on a timeline."
          ),
        ],
      },

      {
        id: 'merge-overlapping-intervals',
        title: 'Merge Overlapping Intervals',
        body: [
          p("Given a list of intervals, **merge every group of overlapping intervals** into one interval, and return the resulting non-overlapping intervals sorted by start. Intervals that share an endpoint (like `[6, 7]` and `[7, 8]`) count as overlapping."),
          ex('intervals = [[3, 4], [7, 8], [2, 5], [6, 7], [1, 4]]', '[[1, 5], [6, 8]]'),
          ex('intervals = [[1, 2], [4, 6]]', '[[1, 2], [4, 6]]'),
          ap(1, 'Brute force: merge any overlapping pair until none is left'),
          p("Two intervals `[s1, e1]` and `[s2, e2]` overlap when `s1 <= e2` and `s2 <= e1`. Look for any overlapping pair, replace it by its union, and start looking again. When no pair overlaps, sort what's left."),
          code(`
            from typing import List

            def merge_overlapping_intervals_brute_force(intervals: List[List[int]]) -> List[List[int]]:
                result = [list(iv) for iv in intervals]
                merged_any = True
                while merged_any:
                    merged_any = False
                    for i in range(len(result)):
                        for j in range(i + 1, len(result)):
                            a, b = result[i], result[j]
                            if a[0] <= b[1] and b[0] <= a[1]:  # overlap (touching counts)
                                result[i] = [min(a[0], b[0]), max(a[1], b[1])]
                                result.pop(j)
                                merged_any = True
                                break
                        if merged_any:
                            break
                return sorted(result)
            `, `
            function mergeOverlappingIntervalsBruteForce(intervals) {
              const result = intervals.map(iv => [...iv]);
              let mergedAny = true;
              while (mergedAny) {
                mergedAny = false;
                outer: for (let i = 0; i < result.length; i++) {
                  for (let j = i + 1; j < result.length; j++) {
                    const [a, b] = [result[i], result[j]];
                    if (a[0] <= b[1] && b[0] <= a[1]) { // overlap (touching counts)
                      result[i] = [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
                      result.splice(j, 1);
                      mergedAny = true;
                      break outer;
                    }
                  }
                }
              }
              return result.sort((x, y) => x[0] - y[0]);
            }
            `, `
            public int[][] mergeOverlappingIntervalsBruteForce(int[][] intervals) {
                List<int[]> result = new ArrayList<>();
                for (int[] iv : intervals) result.add(new int[]{iv[0], iv[1]});
                boolean mergedAny = true;
                while (mergedAny) {
                    mergedAny = false;
                    outer:
                    for (int i = 0; i < result.size(); i++) {
                        for (int j = i + 1; j < result.size(); j++) {
                            int[] a = result.get(i), b = result.get(j);
                            if (a[0] <= b[1] && b[0] <= a[1]) { // overlap (touching counts)
                                result.set(i, new int[]{Math.min(a[0], b[0]), Math.max(a[1], b[1])});
                                result.remove(j);
                                mergedAny = true;
                                break outer;
                            }
                        }
                    }
                }
                result.sort((x, y) -> Integer.compare(x[0], y[0]));
                return result.toArray(new int[0][]);
            }
            `),
          cost("$O(n^3)$ in the worst case: up to $n$ merges, each found by an $O(n^2)$ pair search.", "$O(n)$."),
          p("All that searching is needed because overlapping intervals can be anywhere in the list. Sorting puts them next to each other."),
          ap(2, 'Sort by start, then one pass (optimal)'),
          p("If the intervals are **sorted by start**, every interval that overlaps the current merged block comes right after it. So we scan once, keeping the last merged interval:"),
          ul(
            "If the next interval **starts at or before the end** of the last merged one, they overlap: extend the end to `max(last.end, next.end)`.",
            "Otherwise, start a new merged interval."
          ),
          bars([[1, 4], [2, 5], [3, 4], [6, 7], [7, 8]], { hl: [0, 1, 2], hl2: [3, 4], cap: 'sorted by start: two groups' }),
          state('[1,4] → merged = [[1,4]]\n[2,5] starts at 2 ≤ 4  → extend to [1,5]\n[3,4] starts at 3 ≤ 5  → still [1,5] (end max(5,4))\n[6,7] starts at 6 > 5  → new [6,7]\n[7,8] starts at 7 ≤ 7  → extend to [6,8]'),
          note("Use `max` when extending: a short interval inside a long one (like `[3, 4]` inside `[1, 5]`) must not shrink the merged end."),
          impl(`
            from typing import List

            def merge_overlapping_intervals(intervals: List[List[int]]) -> List[List[int]]:
                merged = []
                for start, end in sorted(intervals):
                    if merged and start <= merged[-1][1]:
                        merged[-1][1] = max(merged[-1][1], end)  # overlap: extend
                    else:
                        merged.append([start, end])              # new block
                return merged
            `, `
            function mergeOverlappingIntervals(intervals) {
              const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
              const merged = [];
              for (const [start, end] of sorted) {
                const last = merged[merged.length - 1];
                if (last && start <= last[1]) last[1] = Math.max(last[1], end); // extend
                else merged.push([start, end]);                                // new block
              }
              return merged;
            }
            `, `
            public int[][] mergeOverlappingIntervals(int[][] intervals) {
                int[][] sorted = intervals.clone();
                Arrays.sort(sorted, (a, b) -> Integer.compare(a[0], b[0]));
                List<int[]> merged = new ArrayList<>();
                for (int[] iv : sorted) {
                    if (!merged.isEmpty() && iv[0] <= merged.get(merged.size() - 1)[1]) {
                        int[] last = merged.get(merged.size() - 1);
                        last[1] = Math.max(last[1], iv[1]);   // extend
                    } else {
                        merged.add(new int[]{iv[0], iv[1]});  // new block
                    }
                }
                return merged.toArray(new int[0][]);
            }
            `),
          cx("$O(n \\log n)$ for sorting; the merge scan is $O(n)$.", "$O(n)$ for the sorted copy and the output."),
          vs([
            ['1. Merge pairs until stable', '$O(n^3)$', '$O(n)$', 'Never; it only shows why sorting helps.'],
            ['2. Sort + single pass', '$O(n log n)$', '$O(n)$', 'The expected answer.'],
          ]),
          tests([
            ['intervals = []', '[]', 'No intervals.'],
            ['intervals = [[1, 5]]', '[[1, 5]]', 'A single interval.'],
            ['intervals = [[1, 10], [2, 3], [4, 5]]', '[[1, 10]]', 'Short intervals inside a long one.'],
            ['intervals = [[5, 6], [1, 2], [2, 5]]', '[[1, 6]]', 'Unsorted input; a chain of touching intervals.'],
            ['intervals = [[1, 1], [1, 1]]', '[[1, 1]]', 'Identical zero-length intervals.'],
            ['intervals = [[1, 2], [4, 6]]', '[[1, 2], [4, 6]]', 'Example 2: nothing to merge.'],
            ['intervals = [[3, 4], [7, 8], [2, 5], [6, 7], [1, 4]]', '[[1, 5], [6, 8]]', 'Example 1.'],
          ], { fn: ['merge_overlapping_intervals_brute_force', 'merge_overlapping_intervals'] }),
          tips(
            "Ask whether touching intervals (`[1, 2]` and `[2, 3]`) should merge. Here they do (`<=`); for half-open intervals they wouldn't (`<`).",
            "Related follow-up: **insert** one new interval into an already sorted, merged list in $O(n)$ by copying the intervals before it, merging the overlapping ones, and copying the rest."
          ),
        ],
      },

      {
        id: 'identify-all-interval-overlaps',
        title: 'Identify All Interval Overlaps',
        body: [
          p("You are given two lists of intervals, `a` and `b`. Within each list the intervals are **sorted and don't overlap each other**. Return **every overlap** between an interval of `a` and an interval of `b`, in sorted order. Intervals are closed, so `[9, 10]` and `[8, 9]` overlap at `[9, 9]`."),
          ex('a = [[1, 4], [5, 6], [9, 10]], b = [[2, 7], [8, 9]]', '[[2, 4], [5, 6], [9, 9]]'),
          ap(1, 'Brute force: compare every pair'),
          p("Two closed intervals overlap exactly on `[max(starts), min(ends)]`, as long as that range isn't empty. Check every pair from `a` and `b`, collect the non-empty overlaps, and sort them."),
          code(`
            from typing import List

            def identify_all_interval_overlaps_brute_force(a: List[List[int]], b: List[List[int]]) -> List[List[int]]:
                overlaps = []
                for s1, e1 in a:
                    for s2, e2 in b:
                        start, end = max(s1, s2), min(e1, e2)
                        if start <= end:
                            overlaps.append([start, end])
                return sorted(overlaps)
            `, `
            function identifyAllIntervalOverlapsBruteForce(a, b) {
              const overlaps = [];
              for (const [s1, e1] of a) {
                for (const [s2, e2] of b) {
                  const start = Math.max(s1, s2), end = Math.min(e1, e2);
                  if (start <= end) overlaps.push([start, end]);
                }
              }
              return overlaps.sort((x, y) => x[0] - y[0]);
            }
            `, `
            public List<int[]> identifyAllIntervalOverlapsBruteForce(int[][] a, int[][] b) {
                List<int[]> overlaps = new ArrayList<>();
                for (int[] x : a) {
                    for (int[] y : b) {
                        int start = Math.max(x[0], y[0]), end = Math.min(x[1], y[1]);
                        if (start <= end) overlaps.add(new int[]{start, end});
                    }
                }
                overlaps.sort((p, q) -> Integer.compare(p[0], q[0]));
                return overlaps;
            }
            `),
          cost("$O(n · m)$ comparisons (plus sorting the overlaps).", "$O(1)$ beyond the output."),
          ap(2, 'Two pointers over both sorted lists (optimal)'),
          p("Since both lists are sorted, walk through them together with **two pointers** `i` and `j`:"),
          ol(
            "The current pair overlaps if `max(starts) <= min(ends)`. If so, record `[max(starts), min(ends)]`.",
            "Then advance the pointer whose interval **ends first**. That interval can't overlap anything further along in the other list, because everything there starts even later."
          ),
          bars([[1, 4], [5, 6], [9, 10], [2, 7], [8, 9]], { hl: [0, 1, 2], hl2: [3, 4], cap: 'orange: list a, blue: list b' }),
          state('a[0]=[1,4], b[0]=[2,7]  → overlap [2,4]; a ends first → i++\na[1]=[5,6], b[0]=[2,7]  → overlap [5,6]; a ends first → i++\na[2]=[9,10], b[0]=[2,7] → no overlap; b ends first → j++\na[2]=[9,10], b[1]=[8,9] → overlap [9,9]; b ends first → j++'),
          impl(`
            from typing import List

            def identify_all_interval_overlaps(a: List[List[int]], b: List[List[int]]) -> List[List[int]]:
                overlaps = []
                i = j = 0
                while i < len(a) and j < len(b):
                    start = max(a[i][0], b[j][0])
                    end = min(a[i][1], b[j][1])
                    if start <= end:
                        overlaps.append([start, end])
                    # The interval that ends first can't overlap anything else.
                    if a[i][1] < b[j][1]:
                        i += 1
                    else:
                        j += 1
                return overlaps
            `, `
            function identifyAllIntervalOverlaps(a, b) {
              const overlaps = [];
              let i = 0, j = 0;
              while (i < a.length && j < b.length) {
                const start = Math.max(a[i][0], b[j][0]);
                const end = Math.min(a[i][1], b[j][1]);
                if (start <= end) overlaps.push([start, end]);
                if (a[i][1] < b[j][1]) i++;
                else j++;
              }
              return overlaps;
            }
            `, `
            public List<int[]> identifyAllIntervalOverlaps(int[][] a, int[][] b) {
                List<int[]> overlaps = new ArrayList<>();
                int i = 0, j = 0;
                while (i < a.length && j < b.length) {
                    int start = Math.max(a[i][0], b[j][0]);
                    int end = Math.min(a[i][1], b[j][1]);
                    if (start <= end) overlaps.add(new int[]{start, end});
                    if (a[i][1] < b[j][1]) i++;
                    else j++;
                }
                return overlaps;
            }
            `),
          cx("$O(n + m)$. Each step advances one of the two pointers.", "$O(1)$ beyond the output."),
          vs([
            ['1. Compare every pair', '$O(n · m)$', '$O(1)$', 'Unsorted input.'],
            ['2. Two pointers', '$O(n + m)$', '$O(1)$', 'The expected answer for sorted, disjoint lists.'],
          ]),
          tests([
            ['a = [], b = [[1, 2]]', '[]', 'One list is empty.'],
            ['a = [[1, 2]], b = [[3, 4]]', '[]', 'No overlap at all.'],
            ['a = [[1, 3]], b = [[3, 5]]', '[[3, 3]]', 'Closed intervals touching at one point.'],
            ['a = [[1, 10]], b = [[2, 3], [5, 7]]', '[[2, 3], [5, 7]]', 'One long interval covers several short ones.'],
            ['a = [[0, 2], [5, 10]], b = [[1, 5], [8, 12]]', '[[1, 2], [5, 5], [8, 10]]', 'Pointers alternate between the lists.'],
            ['a = [[1, 4], [5, 6], [9, 10]], b = [[2, 7], [8, 9]]', '[[2, 4], [5, 6], [9, 9]]', 'Example 1.'],
          ], { fn: ['identify_all_interval_overlaps_brute_force', 'identify_all_interval_overlaps'] }),
          tips(
            "The step to justify is *advance the interval that ends first*: it can't overlap anything later in the other list, because those intervals start after the current one in that list."
          ),
        ],
      },

      {
        id: 'largest-overlap-of-intervals',
        title: 'Largest Overlap of Intervals',
        body: [
          p("Given a list of intervals `[start, end)` (each one includes its start but **not** its end, like a meeting that frees its room at `end`), return the **maximum number of intervals that overlap at any single moment**."),
          ex('intervals = [[1, 3], [5, 7], [2, 6], [4, 8]]', '3', 'at time 5, the intervals [5, 7), [2, 6) and [4, 8) are all active.'),
          ex('intervals = [[1, 2], [2, 3]]', '1', 'the first interval ends exactly when the second starts.'),
          ap(1, 'Brute force: count the active intervals at every start'),
          p("The overlap count only goes up when an interval **starts**, so the maximum is reached at some start time. For each start time `t`, count the intervals active at `t`, meaning `start <= t < end`."),
          code(`
            from typing import List

            def largest_overlap_brute_force(intervals: List[List[int]]) -> int:
                best = 0
                for t, _ in intervals:  # the maximum happens at some start time
                    active = sum(1 for s, e in intervals if s <= t < e)
                    best = max(best, active)
                return best
            `, `
            function largestOverlapBruteForce(intervals) {
              let best = 0;
              for (const [t] of intervals) { // the maximum happens at some start time
                const active = intervals.filter(([s, e]) => s <= t && t < e).length;
                best = Math.max(best, active);
              }
              return best;
            }
            `, `
            public int largestOverlapBruteForce(int[][] intervals) {
                int best = 0;
                for (int[] iv : intervals) { // the maximum happens at some start time
                    int t = iv[0], active = 0;
                    for (int[] other : intervals) if (other[0] <= t && t < other[1]) active++;
                    best = Math.max(best, active);
                }
                return best;
            }
            `),
          cost("$O(n^2)$.", "$O(1)$."),
          ap(2, 'Sorted starts and sorted ends, two pointers'),
          p("We don't need to know **which** intervals are active, only how many. Sort all start times and, separately, all end times. Walk both lists with two pointers: if the next start comes strictly before the next end, one more interval is active; otherwise one interval has ended (an end at the same time as a start is processed first, because the intervals are half-open)."),
          code(`
            from typing import List

            def largest_overlap_two_pointers(intervals: List[List[int]]) -> int:
                starts = sorted(s for s, _ in intervals)
                ends = sorted(e for _, e in intervals)
                active = best = 0
                i = j = 0
                while i < len(starts):
                    if starts[i] < ends[j]:  # next event is a start
                        active += 1
                        best = max(best, active)
                        i += 1
                    else:                    # an end comes first (or at the same time)
                        active -= 1
                        j += 1
                return best
            `, `
            function largestOverlapTwoPointers(intervals) {
              const starts = intervals.map(iv => iv[0]).sort((a, b) => a - b);
              const ends = intervals.map(iv => iv[1]).sort((a, b) => a - b);
              let active = 0, best = 0, i = 0, j = 0;
              while (i < starts.length) {
                if (starts[i] < ends[j]) { active++; best = Math.max(best, active); i++; } // a start
                else { active--; j++; }                                                     // an end
              }
              return best;
            }
            `, `
            public int largestOverlapTwoPointers(int[][] intervals) {
                int n = intervals.length;
                int[] starts = new int[n], ends = new int[n];
                for (int k = 0; k < n; k++) { starts[k] = intervals[k][0]; ends[k] = intervals[k][1]; }
                Arrays.sort(starts);
                Arrays.sort(ends);
                int active = 0, best = 0, i = 0, j = 0;
                while (i < n) {
                    if (starts[i] < ends[j]) { active++; best = Math.max(best, active); i++; } // a start
                    else { active--; j++; }                                                     // an end
                }
                return best;
            }
            `),
          cost("$O(n log n)$ for the two sorts.", "$O(n)$."),
          ap(3, 'Sweep line over events (optimal)'),
          p("The same idea, written as a single sorted list of events, is the classic **sweep line**. Imagine a vertical line sweeping from left to right across the timeline. The number of active intervals only changes at **endpoints**: it goes up by 1 at a start and down by 1 at an end. So we turn every interval into two **events**, sort them by time, and keep a running count. The answer is the largest count seen."),
          bars([[1, 3], [5, 7], [2, 6], [4, 8]], { hl: [1, 2, 3] }),
          p("When a start and an end happen at the **same time**, process the **end first**. With half-open intervals, the ending interval is no longer active at that moment, so counting it would overstate the overlap."),
          state('events (time, +1 start / -1 end), ends first on ties:\n1 S→1   2 S→2   3 E→1   4 S→2   5 S→3   6 E→2   7 E→1   8 E→0\nmaximum = 3'),
          impl(`
            from typing import List

            def largest_overlap_of_intervals(intervals: List[List[int]]) -> int:
                events = []
                for start, end in intervals:
                    events.append((start, 1))   # interval begins
                    events.append((end, -1))    # interval ends
                # Sort by time; on ties -1 sorts before +1, so ends are handled first.
                events.sort()
                active = best = 0
                for _, delta in events:
                    active += delta
                    best = max(best, active)
                return best
            `, `
            function largestOverlapOfIntervals(intervals) {
              const events = [];
              for (const [start, end] of intervals) {
                events.push([start, 1]);  // interval begins
                events.push([end, -1]);   // interval ends
              }
              // Sort by time; on ties ends (-1) come before starts (+1).
              events.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
              let active = 0, best = 0;
              for (const [, delta] of events) {
                active += delta;
                best = Math.max(best, active);
              }
              return best;
            }
            `, `
            public int largestOverlapOfIntervals(int[][] intervals) {
                List<int[]> events = new ArrayList<>();
                for (int[] iv : intervals) {
                    events.add(new int[]{iv[0], 1});  // interval begins
                    events.add(new int[]{iv[1], -1}); // interval ends
                }
                // Sort by time; on ties ends (-1) come before starts (+1).
                events.sort((x, y) -> x[0] != y[0] ? Integer.compare(x[0], y[0]) : Integer.compare(x[1], y[1]));
                int active = 0, best = 0;
                for (int[] e : events) {
                    active += e[1];
                    best = Math.max(best, active);
                }
                return best;
            }
            `),
          cx("$O(n \\log n)$ to sort the $2n$ events.", "$O(n)$ for the events."),
          vs([
            ['1. Count at every start', '$O(n^2)$', '$O(1)$', 'Small inputs.'],
            ['2. Sorted starts + sorted ends', '$O(n log n)$', '$O(n)$', 'Same speed, no tuples; popular for *meeting rooms*.'],
            ['3. Sweep over events', '$O(n log n)$', '$O(n)$', 'The general technique; extends to weighted events.'],
          ]),
          tests([
            ['intervals = []', '0', 'No intervals.'],
            ['intervals = [[1, 5]]', '1', 'A single interval.'],
            ['intervals = [[1, 4], [1, 4], [1, 4]]', '3', 'Identical intervals.'],
            ['intervals = [[1, 10], [2, 3], [4, 5], [6, 7]]', '2', 'Nested intervals that never overlap each other.'],
            ['intervals = [[0, 30], [5, 10], [15, 20]]', '2', 'One long meeting with two short ones inside.'],
            ['intervals = [[1, 2], [2, 3]]', '1', 'Example 2: an end and a start at the same time.'],
            ['intervals = [[1, 3], [5, 7], [2, 6], [4, 8]]', '3', 'Example 1.'],
          ], { fn: ['largest_overlap_brute_force', 'largest_overlap_two_pointers', 'largest_overlap_of_intervals'] }),
          tips(
            "This is the *minimum number of meeting rooms* problem in disguise: the largest overlap is exactly the number of rooms needed.",
            "Settle the tie rule before coding. For closed intervals, process **starts** first on ties instead."
          ),
        ],
      },
    ],
  });
})();
