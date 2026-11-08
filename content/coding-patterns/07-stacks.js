(function () {
  const { p, h, h3, ul, ol, note, ex, arr, state, code, impl, cx, pre, rg } = K;

  K.section({
    id: 'stacks',
    title: 'Stacks',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Stacks',
        body: [
          p("A **stack** is a last-in, first-out (**LIFO**) collection: the last item you `push` is the first one you `pop`, like a pile of plates. Pushing, popping and peeking at the top are all $O(1)$."),
          pre(`
            push 4   push 7   push 1   pop → 1   peek → 7
                              ┌───┐
                     ┌───┐    │ 1 │
            ┌───┐    │ 7 │    │ 7 │    ┌───┐
            │ 4 │    │ 4 │    │ 4 │    │ 7 │
            └───┘    └───┘    └───┘    │ 4 │
                                       └───┘
          `),
          h('When should I think of a stack?'),
          ul(
            "**Matching nested structure**: brackets, HTML tags, nested function calls. The most recently opened thing must be closed first.",
            "**Undo / backtracking**: you need to go back to the most recent state.",
            "**\"Next greater / smaller element\"** questions: a **monotonic stack** keeps elements in sorted order and pops everything that a new element \"beats\".",
            "**Evaluating expressions** and converting between notations (infix, postfix).",
            "**Turning recursion into iteration**: the call stack is literally a stack."
          ),
          h3('Monotonic stacks'),
          p("A monotonic stack keeps its contents increasing (or decreasing) from bottom to top. When a new element would break the order, we pop until it fits, and every pop is a moment where we learn something: \"this new element is the next greater element for the one we just popped\". Each element is pushed and popped at most once, so the whole scan is $O(n)$."),
          h('Language notes'),
          ul(
            "**Python**: use a list with `append` / `pop` / `stack[-1]`.",
            "**JavaScript**: use an array with `push` / `pop` / `stack[stack.length - 1]`.",
            "**Java**: prefer `Deque<Integer> stack = new ArrayDeque<>()` with `push` / `pop` / `peek` over the legacy `Stack` class."
          ),
          h('Real-world uses'),
          ul(
            "The **call stack** that tracks function calls in every program.",
            "**Undo** in text editors and the **back button** in browsers.",
            "**Parsers and compilers** checking syntax and evaluating expressions.",
            "**Depth-first search** in graphs and file-system walkers."
          ),
        ],
      },

      {
        id: 'valid-parenthesis-expression',
        title: 'Valid Parenthesis Expression',
        body: [
          p("Given a string made only of the characters `(`, `)`, `[`, `]`, `{` and `}`, decide whether it is **valid**: every opening bracket is closed by the **same type** of bracket, and brackets close in the **correct order** (the most recently opened one closes first)."),
          ex('s = "([]{})"', 'True'),
          ex('s = "([)]"', 'False', 'the `[` is closed by `)` before it was closed by `]`.'),
          ex('s = "(("', 'False'),
          h('Intuition'),
          p("Whenever we meet a closing bracket, it must match the **most recent opening bracket that hasn't been closed yet**. \"Most recent, not yet handled\" is exactly what a stack gives us."),
          ul(
            "Opening bracket → push it.",
            "Closing bracket → the stack must be non-empty and its top must be the matching opener; pop it. Otherwise the string is invalid.",
            "At the end, the stack must be **empty** (nothing left unclosed)."
          ),
          arr('([]{})', { p: { i: 2 }, on: ['i'], state: "stack: ( [\n']' matches '['  →  pop" }),
          arr('([]{})', { p: { i: 4 }, on: ['i'], state: "stack: ( {\n'}' matches '{'  →  pop" }),
          arr('([)]', { p: { i: 2 }, on: ['i'], hl: [2], state: "stack: ( [\n')' does not match '['  →  invalid" }),
          impl(`
            def valid_parenthesis_expression(s: str) -> bool:
                pairs = {')': '(', ']': '[', '}': '{'}
                stack = []
                for c in s:
                    if c in pairs:                      # closing bracket
                        if not stack or stack[-1] != pairs[c]:
                            return False
                        stack.pop()
                    else:                               # opening bracket
                        stack.append(c)
                return not stack
            `, `
            function validParenthesisExpression(s) {
              const pairs = { ')': '(', ']': '[', '}': '{' };
              const stack = [];
              for (const c of s) {
                if (c in pairs) {                       // closing bracket
                  if (!stack.length || stack[stack.length - 1] !== pairs[c]) return false;
                  stack.pop();
                } else {                                // opening bracket
                  stack.push(c);
                }
              }
              return stack.length === 0;
            }
            `, `
            public boolean validParenthesisExpression(String s) {
                Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
                Deque<Character> stack = new ArrayDeque<>();
                for (char c : s.toCharArray()) {
                    if (pairs.containsKey(c)) {             // closing bracket
                        if (stack.isEmpty() || stack.peek() != pairs.get(c)) return false;
                        stack.pop();
                    } else {                                // opening bracket
                        stack.push(c);
                    }
                }
                return stack.isEmpty();
            }
            `),
          cx("$O(n)$. One pass with $O(1)$ stack operations.", "$O(n)$ in the worst case (all opening brackets)."),
        ],
      },

      {
        id: 'next-largest-number-to-the-right',
        title: 'Next Largest Number to the Right',
        body: [
          p("Given an array of integers, return an array where position `i` holds the **first number to the right of `nums[i]` that is strictly larger** than it, or `-1` if there is none."),
          ex('nums = [5, 2, 4, 6, 1]', '[6, 4, 6, -1, -1]'),
          ex('nums = [3, 3, 3]', '[-1, -1, -1]'),
          h('Intuition'),
          p("For each element, scanning rightwards until we find something bigger is $O(n^2)$ in the worst case (e.g. a decreasing array). Instead, scan **from right to left** and keep a stack of **candidates**: values to the right that could still be someone's answer."),
          p("When we look at `nums[i]`, any candidate **≤ `nums[i]`** can never be the answer for anything further left, because `nums[i]` is both closer and at least as large. So we pop those. Whatever is left on top (if anything) is the next larger number. Then push `nums[i]` as a candidate for the elements to its left."),
          p("The stack therefore stays **strictly decreasing from bottom to top**: a monotonic stack."),
          arr([5, 2, 4, 6, 1], { p: { i: 4 }, on: ['i'], state: 'stack: []        → answer -1\npush 1  → stack [1]' }),
          arr([5, 2, 4, 6, 1], { p: { i: 3 }, on: ['i'], state: 'pop 1 (≤ 6)  → stack empty → answer -1\npush 6  → stack [6]' }),
          arr([5, 2, 4, 6, 1], { p: { i: 2 }, on: ['i'], state: 'top 6 > 4  → answer 6\npush 4  → stack [6, 4]' }),
          arr([5, 2, 4, 6, 1], { p: { i: 1 }, on: ['i'], state: 'top 4 > 2  → answer 4\npush 2  → stack [6, 4, 2]' }),
          arr([5, 2, 4, 6, 1], { p: { i: 0 }, on: ['i'], state: 'pop 2, pop 4 (≤ 5) → top 6 → answer 6\npush 5  → stack [6, 5]' }),
          impl(`
            from typing import List

            def next_largest_number_to_the_right(nums: List[int]) -> List[int]:
                result = [-1] * len(nums)
                stack = []  # candidates, decreasing from bottom to top
                for i in range(len(nums) - 1, -1, -1):
                    # Candidates that aren't larger than nums[i] are useless now.
                    while stack and stack[-1] <= nums[i]:
                        stack.pop()
                    if stack:
                        result[i] = stack[-1]
                    stack.append(nums[i])
                return result
            `, `
            function nextLargestNumberToTheRight(nums) {
              const result = new Array(nums.length).fill(-1);
              const stack = []; // candidates, decreasing from bottom to top
              for (let i = nums.length - 1; i >= 0; i--) {
                while (stack.length && stack[stack.length - 1] <= nums[i]) stack.pop();
                if (stack.length) result[i] = stack[stack.length - 1];
                stack.push(nums[i]);
              }
              return result;
            }
            `, `
            public int[] nextLargestNumberToTheRight(int[] nums) {
                int[] result = new int[nums.length];
                Deque<Integer> stack = new ArrayDeque<>(); // decreasing from bottom to top
                for (int i = nums.length - 1; i >= 0; i--) {
                    while (!stack.isEmpty() && stack.peek() <= nums[i]) stack.pop();
                    result[i] = stack.isEmpty() ? -1 : stack.peek();
                    stack.push(nums[i]);
                }
                return result;
            }
            `),
          cx("$O(n)$. Each element is pushed once and popped at most once.", "$O(n)$ for the stack."),
        ],
      },

      {
        id: 'evaluate-expression',
        title: 'Evaluate Expression',
        body: [
          p("Evaluate a string containing non-negative integers, `+`, `-`, parentheses and spaces, and return the result. `-` is only used as a binary operator or directly after `(` / at the start (e.g. `\"-(2+3)\"`). Don't use any built-in `eval`."),
          ex('s = "18 - (7 + (2 - 4))"', '13', '2 - 4 = -2, 7 + (-2) = 5, 18 - 5 = 13.'),
          ex('s = "-(3 + 4) + 10"', '3'),
          h('Intuition'),
          p("Without parentheses this is easy: walk left to right keeping a running `result`, the number being read (`num`), and the `sign` (+1 or -1) that applies to it. When an operator arrives, add `sign * num` to `result` and set the new sign."),
          p("Parentheses start a **fresh sub-expression**, and when it finishes we must come back to where we were. That \"save and come back\" is a stack:"),
          ul(
            "On `(`: push the current `result` and the `sign` in front of the parenthesis, then reset `result = 0`, `sign = 1`.",
            "On `)`: finish the inner result, pop the saved sign and outer result, and combine: `result = outer + saved_sign * result`."
          ),
          state('"18 - (7 + (2 - 4))"\nread 18, see "-"   → result = 18, sign = -1\n"("               → push (18, -1); result = 0, sign = 1\nread 7, "+"       → result = 7\n"("               → push (7, +1); result = 0\n2 - 4             → result = -2\n")"               → result = 7 + (+1)(-2) = 5\n")"               → result = 18 + (-1)(5) = 13'),
          impl(`
            def evaluate_expression(s: str) -> int:
                stack = []
                result, num, sign = 0, 0, 1
                for c in s:
                    if c.isdigit():
                        num = num * 10 + int(c)
                    elif c in '+-':
                        result += sign * num
                        num = 0
                        sign = 1 if c == '+' else -1
                    elif c == '(':
                        stack.append(result)   # save the outer result
                        stack.append(sign)     # and the sign before "("
                        result, sign = 0, 1
                    elif c == ')':
                        result += sign * num
                        num = 0
                        saved_sign = stack.pop()
                        outer = stack.pop()
                        result = outer + saved_sign * result
                    # spaces are ignored
                return result + sign * num
            `, `
            function evaluateExpression(s) {
              const stack = [];
              let result = 0, num = 0, sign = 1;
              for (const c of s) {
                if (c >= '0' && c <= '9') {
                  num = num * 10 + Number(c);
                } else if (c === '+' || c === '-') {
                  result += sign * num;
                  num = 0;
                  sign = c === '+' ? 1 : -1;
                } else if (c === '(') {
                  stack.push(result, sign); // save outer result and sign
                  result = 0;
                  sign = 1;
                } else if (c === ')') {
                  result += sign * num;
                  num = 0;
                  const savedSign = stack.pop();
                  const outer = stack.pop();
                  result = outer + savedSign * result;
                }
              }
              return result + sign * num;
            }
            `, `
            public int evaluateExpression(String s) {
                Deque<Integer> stack = new ArrayDeque<>();
                int result = 0, num = 0, sign = 1;
                for (char c : s.toCharArray()) {
                    if (Character.isDigit(c)) {
                        num = num * 10 + (c - '0');
                    } else if (c == '+' || c == '-') {
                        result += sign * num;
                        num = 0;
                        sign = (c == '+') ? 1 : -1;
                    } else if (c == '(') {
                        stack.push(result); // save outer result
                        stack.push(sign);   // and the sign before "("
                        result = 0;
                        sign = 1;
                    } else if (c == ')') {
                        result += sign * num;
                        num = 0;
                        int savedSign = stack.pop();
                        int outer = stack.pop();
                        result = outer + savedSign * result;
                    }
                }
                return result + sign * num;
            }
            `),
          cx("$O(n)$. Every character is processed once.", "$O(n)$ for the stack in the worst case (deeply nested parentheses)."),
        ],
      },

      {
        id: 'repeated-removal-of-adjacent-duplicates',
        title: 'Repeated Removal of Adjacent Duplicates',
        body: [
          p("Given a string, repeatedly delete **pairs of adjacent equal characters** until no such pair remains, and return the final string. The result is the same no matter which pair you remove first."),
          ex('s = "xyyxz"', '"z"', 'remove `"yy"` to get `"xxz"`, then remove `"xx"` to get `"z"`.'),
          ex('s = "abc"', '"abc"'),
          h('Intuition'),
          p("Simulating literally (scan, delete a pair, rebuild the string, repeat) can take $O(n^2)$. Notice that deleting a pair can bring two characters together that were previously separated, like the two x's above. The character that gets newly exposed is always the **most recently kept** one, so we keep the result in a **stack**:"),
          ul(
            "If the next character equals the top of the stack, they form a pair: pop.",
            "Otherwise push it."
          ),
          arr('xyyxz', { p: { i: 2 }, on: ['i'], state: "stack: x y\n'y' == top  →  pop  → stack: x" }),
          arr('xyyxz', { p: { i: 3 }, on: ['i'], state: "stack: x\n'x' == top  →  pop  → stack: (empty)" }),
          arr('xyyxz', { p: { i: 4 }, on: ['i'], state: "stack: z  →  result \"z\"" }),
          impl(`
            def repeated_removal_of_adjacent_duplicates(s: str) -> str:
                stack = []
                for c in s:
                    if stack and stack[-1] == c:
                        stack.pop()       # c cancels the previous character
                    else:
                        stack.append(c)
                return ''.join(stack)
            `, `
            function repeatedRemovalOfAdjacentDuplicates(s) {
              const stack = [];
              for (const c of s) {
                if (stack.length && stack[stack.length - 1] === c) stack.pop();
                else stack.push(c);
              }
              return stack.join('');
            }
            `, `
            public String repeatedRemovalOfAdjacentDuplicates(String s) {
                StringBuilder stack = new StringBuilder(); // used as a stack
                for (char c : s.toCharArray()) {
                    int top = stack.length() - 1;
                    if (top >= 0 && stack.charAt(top) == c) stack.deleteCharAt(top);
                    else stack.append(c);
                }
                return stack.toString();
            }
            `),
          cx("$O(n)$. Each character is pushed and popped at most once; building the final string is linear.", "$O(n)$ for the stack."),
        ],
      },

      {
        id: 'implement-a-queue-using-stacks',
        title: 'Implement a Queue using Stacks',
        body: [
          p("Implement a first-in, first-out **queue** using only **stacks** (push to top, pop from top, peek at top, check empty). Support `push(x)`, `pop()` (remove and return the front), and `peek()` (return the front). Make each operation **amortised $O(1)$**."),
          ex('push(1); push(2); peek(); push(3); pop(); pop()', '1, 1, 2'),
          h('Intuition'),
          p("A stack reverses order. Reverse twice and you're back to the original order, which is what a queue needs. Use two stacks:"),
          ul(
            "`in_stack` receives every `push`.",
            "`out_stack` serves `pop` and `peek`. Its top is always the **front** of the queue."
          ),
          p("When `out_stack` is empty and someone wants the front, **move everything** from `in_stack` to `out_stack`. This reverses the order so the oldest element ends up on top."),
          pre(`
            push 1, 2, 3          pop()                     push 4
            in:  [1, 2, 3]        in:  []                   in:  [4]
            out: []               out: [3, 2]  → returns 1  out: [3, 2]
                                  (moved 3, 2, 1, popped 1)
          `),
          p("Why amortised $O(1)$? Each element is moved from `in_stack` to `out_stack` **at most once** in its lifetime, and pushed/popped a constant number of times overall. A single `pop` may be slow, but across any sequence of operations the average cost per operation is constant."),
          impl(`
            class Queue:
                def __init__(self):
                    self.in_stack = []
                    self.out_stack = []

                def push(self, x: int) -> None:
                    self.in_stack.append(x)

                def pop(self) -> int:
                    self._refill()
                    return self.out_stack.pop()

                def peek(self) -> int:
                    self._refill()
                    return self.out_stack[-1]

                def empty(self) -> bool:
                    return not self.in_stack and not self.out_stack

                def _refill(self) -> None:
                    # Only move elements when the out stack has run dry.
                    if not self.out_stack:
                        while self.in_stack:
                            self.out_stack.append(self.in_stack.pop())
            `, `
            class Queue {
              constructor() {
                this.inStack = [];
                this.outStack = [];
              }

              push(x) {
                this.inStack.push(x);
              }

              pop() {
                this.refill();
                return this.outStack.pop();
              }

              peek() {
                this.refill();
                return this.outStack[this.outStack.length - 1];
              }

              empty() {
                return this.inStack.length === 0 && this.outStack.length === 0;
              }

              refill() {
                // Only move elements when the out stack has run dry.
                if (this.outStack.length === 0) {
                  while (this.inStack.length) this.outStack.push(this.inStack.pop());
                }
              }
            }
            `, `
            class StackQueue {
                private final Deque<Integer> inStack = new ArrayDeque<>();
                private final Deque<Integer> outStack = new ArrayDeque<>();

                public void push(int x) {
                    inStack.push(x);
                }

                public int pop() {
                    refill();
                    return outStack.pop();
                }

                public int peek() {
                    refill();
                    return outStack.peek();
                }

                public boolean empty() {
                    return inStack.isEmpty() && outStack.isEmpty();
                }

                private void refill() {
                    // Only move elements when the out stack has run dry.
                    if (outStack.isEmpty()) {
                        while (!inStack.isEmpty()) outStack.push(inStack.pop());
                    }
                }
            }
            `),
          cx("`push` $O(1)$; `pop` and `peek` amortised $O(1)$ (a single call can be $O(n)$ when it triggers a refill).",
            "$O(n)$ for the stored elements."),
        ],
      },

      {
        id: 'maximums-of-sliding-window',
        title: 'Maximums of Sliding Window',
        body: [
          p("Given an array and an integer `k`, a window of size `k` slides from the left end of the array to the right end, one position at a time. Return the **maximum of each window**."),
          ex('nums = [3, 2, 4, 1, 2, 1, 1], k = 3', '[4, 4, 4, 2, 2]', 'the windows are [3,2,4], [2,4,1], [4,1,2], [1,2,1], [2,1,1].'),
          h('Intuition'),
          p("Recomputing each window's maximum costs $O(k)$ per window, $O(n·k)$ overall. We want to update the maximum in $O(1)$ amortised time as the window slides."),
          p("Think about which elements could **ever** be a window maximum. If an element has a **larger element to its right inside the window**, it can never be a maximum again: the larger one stays in the window at least as long as it does. So we only keep \"potential maximums\", in a **deque** of indexes whose values are **decreasing** from front to back:"),
          ul(
            "**New element arrives**: pop from the back every index whose value is ≤ the new value (they're now useless), then push the new index.",
            "**Element leaves**: if the index at the front has slid out of the window, pop it from the front.",
            "**The maximum** of the current window is always at the front."
          ),
          arr([3, 2, 4, 1, 2, 1, 1], { p: { right: 2 }, on: ['right'], hl: rg(0, 2), state: 'deque values: 3, 2 → 4 pops both\ndeque: [4]  → max 4' }),
          arr([3, 2, 4, 1, 2, 1, 1], { p: { right: 4 }, on: ['right'], hl: rg(2, 4), state: 'deque values: 4, 1 → 2 pops 1\ndeque: [4, 2]  → max 4' }),
          arr([3, 2, 4, 1, 2, 1, 1], { p: { right: 5 }, on: ['right'], hl: rg(3, 5), state: '4 (index 2) left the window → pop front\ndeque: [2, 1]  → max 2' }),
          impl(`
            from collections import deque
            from typing import List

            def maximums_of_sliding_window(nums: List[int], k: int) -> List[int]:
                dq = deque()  # indexes; their values decrease from front to back
                result = []
                for right, x in enumerate(nums):
                    # Smaller values behind x can never be a maximum again.
                    while dq and nums[dq[-1]] <= x:
                        dq.pop()
                    dq.append(right)
                    # Drop the front if it slid out of the window.
                    if dq[0] <= right - k:
                        dq.popleft()
                    if right >= k - 1:
                        result.append(nums[dq[0]])
                return result
            `, `
            function maximumsOfSlidingWindow(nums, k) {
              // Array used as a deque; 'head' marks the front to keep popleft O(1).
              const dq = [];
              let head = 0;
              const result = [];
              for (let right = 0; right < nums.length; right++) {
                while (dq.length > head && nums[dq[dq.length - 1]] <= nums[right]) dq.pop();
                dq.push(right);
                if (dq[head] <= right - k) head++;
                if (right >= k - 1) result.push(nums[dq[head]]);
              }
              return result;
            }
            `, `
            public int[] maximumsOfSlidingWindow(int[] nums, int k) {
                Deque<Integer> dq = new ArrayDeque<>(); // indexes, decreasing values
                int[] result = new int[Math.max(0, nums.length - k + 1)];
                for (int right = 0; right < nums.length; right++) {
                    while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[right]) dq.pollLast();
                    dq.offerLast(right);
                    if (dq.peekFirst() <= right - k) dq.pollFirst();
                    if (right >= k - 1) result[right - k + 1] = nums[dq.peekFirst()];
                }
                return result;
            }
            `),
          cx("$O(n)$. Each index enters and leaves the deque at most once.", "$O(k)$ for the deque."),
        ],
      },
    ],
  });
})();
