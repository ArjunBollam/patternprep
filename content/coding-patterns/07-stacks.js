(function () {
  const { p, h, h3, ul, ol, note, ex, arr, state, code, impl, cx, pre, rg, ap, cost, vs, tests, tips } = K;

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
          ap(1, 'Brute force: delete matched pairs until nothing changes'),
          p("A valid string always contains at least one **adjacent** matched pair, such as `()` or `[]`, somewhere in its innermost level. Deleting it leaves another valid string. So we can delete every `()`, `[]` and `{}` we find, repeat until the string stops changing, and check whether anything is left."),
          code(`
            def valid_parenthesis_expression_replace(s: str) -> bool:
                previous = None
                while previous != s:
                    previous = s
                    s = s.replace('()', '').replace('[]', '').replace('{}', '')
                return s == ''
            `, `
            function validParenthesisExpressionReplace(s) {
              let previous = null;
              while (previous !== s) {
                previous = s;
                s = s.split('()').join('').split('[]').join('').split('{}').join('');
              }
              return s === '';
            }
            `, `
            public boolean validParenthesisExpressionReplace(String s) {
                String previous = null;
                while (!s.equals(previous)) {
                    previous = s;
                    s = s.replace("()", "").replace("[]", "").replace("{}", "");
                }
                return s.isEmpty();
            }
            `),
          cost("$O(n^2)$: each round is linear and removes at least one pair, and a deeply nested string needs about $n/2$ rounds.", "$O(n)$ for the new strings."),
          ap(2, 'Stack of open brackets (optimal)'),
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
          vs([
            ['1. Delete matched pairs repeatedly', '$O(n^2)$', '$O(n)$', 'A neat observation, too slow for long inputs.'],
            ['2. Stack', '$O(n)$', '$O(n)$', 'The expected answer.'],
          ]),
          tests([
            ['s = ""', 'True', 'Empty string.'],
            ['s = "("', 'False', 'An opener that is never closed.'],
            ['s = ")"', 'False', 'A closer with nothing to match.'],
            ['s = "()[]{}"', 'True', 'Pairs side by side.'],
            ['s = "{[()]}"', 'True', 'Pairs nested inside each other.'],
            ['s = "(]"', 'False', 'Wrong bracket type.'],
            ['s = "())("', 'False', 'Equal counts, wrong order.'],
            ['s = "(("', 'False', 'Example 3.'],
            ['s = "([]{})"', 'True', 'Example 1.'],
            ['s = "([)]"', 'False', 'Example 2.'],
          ], { fn: ['valid_parenthesis_expression_replace', 'valid_parenthesis_expression'] }),
          tips(
            "Return early when the length is odd: an odd number of brackets can never be balanced.",
            "With only one bracket type you can replace the stack with a counter, but it must never go negative. Interviewers like to ask this variant."
          ),
        ],
      },

      {
        id: 'next-largest-number-to-the-right',
        title: 'Next Largest Number to the Right',
        body: [
          p("Given an array of integers, return an array where position `i` holds the **first number to the right of `nums[i]` that is strictly larger** than it, or `-1` if there is none."),
          ex('nums = [5, 2, 4, 6, 1]', '[6, 4, 6, -1, -1]'),
          ex('nums = [3, 3, 3]', '[-1, -1, -1]'),
          ap(1, 'Brute force: scan right from every element'),
          p("For each index, walk to the right until a strictly larger value appears."),
          code(`
            from typing import List

            def next_largest_brute_force(nums: List[int]) -> List[int]:
                result = [-1] * len(nums)
                for i in range(len(nums)):
                    for j in range(i + 1, len(nums)):
                        if nums[j] > nums[i]:
                            result[i] = nums[j]
                            break
                return result
            `, `
            function nextLargestBruteForce(nums) {
              return nums.map((x, i) => {
                for (let j = i + 1; j < nums.length; j++) if (nums[j] > x) return nums[j];
                return -1;
              });
            }
            `, `
            public int[] nextLargestBruteForce(int[] nums) {
                int[] result = new int[nums.length];
                Arrays.fill(result, -1);
                for (int i = 0; i < nums.length; i++) {
                    for (int j = i + 1; j < nums.length; j++) {
                        if (nums[j] > nums[i]) { result[i] = nums[j]; break; }
                    }
                }
                return result;
            }
            `),
          cost("$O(n^2)$ in the worst case, for example a decreasing array where every scan runs to the end.", "$O(1)$ besides the output."),
          ap(2, 'Monotonic stack, right to left (optimal)'),
          p("Scan **from right to left** and keep a stack of **candidates**: values to the right that could still be someone's answer."),
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
          vs([
            ['1. Scan right from every element', '$O(n^2)$', '$O(1)$', 'Baseline.'],
            ['2. Monotonic stack', '$O(n)$', '$O(n)$', 'The expected answer, and the template for every *next greater / smaller* problem.'],
          ]),
          tests([
            ['nums = []', '[]', 'Empty array.'],
            ['nums = [7]', '[-1]', 'A single element has nothing to its right.'],
            ['nums = [3, 3, 3]', '[-1, -1, -1]', 'Example 2: equal values are not *strictly* larger.'],
            ['nums = [1, 2, 3]', '[2, 3, -1]', 'Increasing: each answer is the neighbour.'],
            ['nums = [3, 2, 1]', '[-1, -1, -1]', 'Decreasing: no element has a larger one after it.'],
            ['nums = [-1, -3, 0]', '[0, 0, -1]', 'Negative values.'],
            ['nums = [2, 7, 3, 5, 4, 6, 8]', '[7, 8, 5, 6, 6, 8, -1]', 'Several pops in a row.'],
            ['nums = [5, 2, 4, 6, 1]', '[6, 4, 6, -1, -1]', 'Example 1.'],
          ], { fn: ['next_largest_brute_force', 'next_largest_number_to_the_right'] }),
          tips(
            "Variants you can solve by flipping one comparison or the scan direction: next **smaller** element, previous greater element, daily temperatures (store indexes, return distances).",
            "For a **circular** array, scan the indexes `2n - 1` down to `0` and use `i % n`."
          ),
        ],
      },

      {
        id: 'evaluate-expression',
        title: 'Evaluate Expression',
        body: [
          p("Evaluate a string containing non-negative integers, `+`, `-`, parentheses and spaces, and return the result. `-` is only used as a binary operator or directly after `(` / at the start (e.g. `\"-(2+3)\"`). Don't use any built-in `eval`."),
          ex('s = "18 - (7 + (2 - 4))"', '13', '2 - 4 = -2, 7 + (-2) = 5, 18 - 5 = 13.'),
          ex('s = "-(3 + 4) + 10"', '3'),
          p("Without parentheses this is easy: walk left to right keeping a running `result`, the number being read (`num`), and the `sign` (+1 or -1) that applies to it. When an operator arrives, add `sign * num` to `result` and set the new sign. The only question is what to do with **parentheses**."),
          ap(1, 'Recursion: evaluate each parenthesis as a sub-expression'),
          p("A parenthesised group is itself an expression. So when we meet `(`, we can **call the same evaluator recursively**, let it consume everything up to the matching `)`, and treat the value it returns exactly like a number we just read. A shared cursor makes the recursive call continue from where the outer call stopped."),
          code(`
            def evaluate_expression_recursive(s: str) -> int:
                pos = 0

                def parse() -> int:
                    nonlocal pos
                    result, num, sign = 0, 0, 1
                    while pos < len(s):
                        c = s[pos]
                        pos += 1
                        if c.isdigit():
                            num = num * 10 + int(c)
                        elif c in '+-':
                            result += sign * num
                            num, sign = 0, (1 if c == '+' else -1)
                        elif c == '(':
                            num = parse()  # the bracketed value acts like a number
                        elif c == ')':
                            break
                    return result + sign * num

                return parse()
            `, `
            function evaluateExpressionRecursive(s) {
              let pos = 0;
              const parse = () => {
                let result = 0, num = 0, sign = 1;
                while (pos < s.length) {
                  const c = s[pos++];
                  if (c >= '0' && c <= '9') num = num * 10 + Number(c);
                  else if (c === '+' || c === '-') { result += sign * num; num = 0; sign = c === '+' ? 1 : -1; }
                  else if (c === '(') num = parse(); // the bracketed value acts like a number
                  else if (c === ')') break;
                }
                return result + sign * num;
              };
              return parse();
            }
            `, `
            public int evaluateExpressionRecursive(String s) {
                return parse(s, new int[]{0}); // int[] = shared cursor
            }

            private int parse(String s, int[] pos) {
                int result = 0, num = 0, sign = 1;
                while (pos[0] < s.length()) {
                    char c = s.charAt(pos[0]++);
                    if (Character.isDigit(c)) num = num * 10 + (c - '0');
                    else if (c == '+' || c == '-') { result += sign * num; num = 0; sign = c == '+' ? 1 : -1; }
                    else if (c == '(') num = parse(s, pos); // the bracketed value acts like a number
                    else if (c == ')') break;
                }
                return result + sign * num;
            }
            `),
          cost("$O(n)$: every character is read once.", "$O(d)$ for the call stack, where $d$ is the nesting depth ($O(n)$ in the worst case)."),
          p("Recursion is elegant, but very deep nesting can overflow the call stack. The iterative version keeps the same information on an explicit stack."),
          ap(2, 'Explicit stack (optimal, iterative)'),
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
          vs([
            ['1. Recursive evaluator', '$O(n)$', '$O(n)$ call stack', 'Natural to write; extends to `*` and `/` as a recursive-descent parser.'],
            ['2. Explicit stack', '$O(n)$', '$O(n)$', 'The expected answer; no recursion-depth limits.'],
          ]),
          tests([
            ['s = "7"', '7', 'A single number.'],
            ['s = "123"', '123', 'Multi-digit number.'],
            ['s = "-5"', '-5', 'Leading minus sign.'],
            ['s = "1 + 2 - 3"', '0', 'No parentheses.'],
            ['s = "((((8))))"', '8', 'Deep nesting around one number.'],
            ['s = "2 - (5 - 6)"', '3', 'A minus before parentheses flips the signs inside.'],
            ['s = "10 - (-(2 + 3))"', '15', 'A minus right after an opening parenthesis.'],
            ['s = "-(3 + 4) + 10"', '3', 'Example 2.'],
            ['s = "18 - (7 + (2 - 4))"', '13', 'Example 1.'],
          ], { fn: ['evaluate_expression_recursive', 'evaluate_expression'] }),
          tips(
            "Ask which operators appear. With `*` and `/` you also need precedence: keep a stack of terms, apply `*` and `/` to the top immediately, and sum the stack at the end.",
            "Reset `num` after every operator and parenthesis; forgetting it is the most common bug."
          ),
        ],
      },

      {
        id: 'repeated-removal-of-adjacent-duplicates',
        title: 'Repeated Removal of Adjacent Duplicates',
        body: [
          p("Given a string, repeatedly delete **pairs of adjacent equal characters** until no such pair remains, and return the final string. The result is the same no matter which pair you remove first."),
          ex('s = "xyyxz"', '"z"', 'remove `"yy"` to get `"xxz"`, then remove `"xx"` to get `"z"`.'),
          ex('s = "abc"', '"abc"'),
          ap(1, 'Brute force: simulate the deletions'),
          p("Do exactly what the problem says: scan for the first pair of equal neighbours, delete it, rebuild the string and start over, until no pair is left."),
          code(`
            def repeated_removal_simulate(s: str) -> str:
                changed = True
                while changed:
                    changed = False
                    for i in range(len(s) - 1):
                        if s[i] == s[i + 1]:
                            s = s[:i] + s[i + 2:]  # delete one pair, then rescan
                            changed = True
                            break
                return s
            `, `
            function repeatedRemovalSimulate(s) {
              let changed = true;
              while (changed) {
                changed = false;
                for (let i = 0; i + 1 < s.length; i++) {
                  if (s[i] === s[i + 1]) {
                    s = s.slice(0, i) + s.slice(i + 2); // delete one pair, then rescan
                    changed = true;
                    break;
                  }
                }
              }
              return s;
            }
            `, `
            public String repeatedRemovalSimulate(String s) {
                boolean changed = true;
                while (changed) {
                    changed = false;
                    for (int i = 0; i + 1 < s.length(); i++) {
                        if (s.charAt(i) == s.charAt(i + 1)) {
                            s = s.substring(0, i) + s.substring(i + 2); // delete, then rescan
                            changed = true;
                            break;
                        }
                    }
                }
                return s;
            }
            `),
          cost("$O(n^2)$: up to $n/2$ deletions, each followed by a linear rebuild and rescan.", "$O(n)$ for the rebuilt strings."),
          ap(2, 'Stack of kept characters (optimal)'),
          p("Notice that deleting a pair can bring two characters together that were previously separated, like the two x's above. The character that gets newly exposed is always the **most recently kept** one, so we keep the result in a **stack**:"),
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
          vs([
            ['1. Simulate deletions', '$O(n^2)$', '$O(n)$', 'Matches the statement literally; slow.'],
            ['2. Stack', '$O(n)$', '$O(n)$', 'The expected answer.'],
          ]),
          tests([
            ['s = ""', '""', 'Empty string.'],
            ['s = "a"', '"a"', 'Nothing to remove.'],
            ['s = "aa"', '""', 'One pair removes everything.'],
            ['s = "aaa"', '"a"', 'An odd run leaves one character.'],
            ['s = "abba"', '""', 'Removing `bb` exposes the `aa` pair.'],
            ['s = "aabccbdd"', '""', 'A chain of cascading removals.'],
            ['s = "abc"', '"abc"', 'Example 2.'],
            ['s = "xyyxz"', '"z"', 'Example 1.'],
          ], { fn: ['repeated_removal_simulate', 'repeated_removal_of_adjacent_duplicates'] }),
          tips(
            "Variant: remove runs of **k** equal characters. Store `[char, count]` pairs on the stack and pop when a count reaches `k`."
          ),
        ],
      },

      {
        id: 'implement-a-queue-using-stacks',
        title: 'Implement a Queue using Stacks',
        body: [
          p("Implement a first-in, first-out **queue** using only **stacks** (push to top, pop from top, peek at top, check empty). Support `push(x)`, `pop()` (remove and return the front), and `peek()` (return the front). Make each operation **amortised $O(1)$**."),
          ex('push(1); push(2); peek(); push(3); pop(); pop()', '1, 1, 2'),
          ap(1, 'Keep one stack in queue order (expensive push)'),
          p("We can keep a single stack arranged so that the **front of the queue is on top**. Then `pop` and `peek` are trivial. The work moves to `push`: the new element has to go to the **bottom**, so we move every element to a helper stack, push the new one, and move everything back."),
          code(`
            class QueueCostlyPush:
                def __init__(self):
                    self.stack = []  # front of the queue on top
                    self.temp = []

                def push(self, x: int) -> None:
                    while self.stack:                  # move everything aside
                        self.temp.append(self.stack.pop())
                    self.stack.append(x)               # newest goes to the bottom
                    while self.temp:                   # put the rest back on top
                        self.stack.append(self.temp.pop())

                def pop(self) -> int:
                    return self.stack.pop()

                def peek(self) -> int:
                    return self.stack[-1]

                def empty(self) -> bool:
                    return not self.stack
            `, `
            class QueueCostlyPush {
              constructor() {
                this.stack = []; // front of the queue on top
                this.temp = [];
              }

              push(x) {
                while (this.stack.length) this.temp.push(this.stack.pop()); // move aside
                this.stack.push(x);                                          // newest at the bottom
                while (this.temp.length) this.stack.push(this.temp.pop());  // put the rest back
              }

              pop() {
                return this.stack.pop();
              }

              peek() {
                return this.stack[this.stack.length - 1];
              }

              empty() {
                return this.stack.length === 0;
              }
            }
            `, `
            class StackQueueCostlyPush {
                private final Deque<Integer> stack = new ArrayDeque<>(); // front of the queue on top
                private final Deque<Integer> temp = new ArrayDeque<>();

                public void push(int x) {
                    while (!stack.isEmpty()) temp.push(stack.pop()); // move aside
                    stack.push(x);                                   // newest at the bottom
                    while (!temp.isEmpty()) stack.push(temp.pop());  // put the rest back
                }

                public int pop() { return stack.pop(); }

                public int peek() { return stack.peek(); }

                public boolean empty() { return stack.isEmpty(); }
            }
            `),
          cost("`push` $O(n)$; `pop` and `peek` $O(1)$.", "$O(n)$."),
          p("Every push moves the whole queue twice. The better design moves each element only **once**, and only when someone actually needs the front."),
          ap(2, 'Two stacks with lazy transfer (amortised optimal)'),
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
          vs([
            ['1. One ordered stack', '$O(n)$ push, $O(1)$ pop', '$O(n)$', 'When pops vastly outnumber pushes.'],
            ['2. Two stacks, lazy transfer', 'amortised $O(1)$ for all', '$O(n)$', 'The expected answer.'],
          ]),
          tests([
            ['Queue(); empty()', '[True]', 'A new queue is empty.'],
            ['Queue(); push(5); pop(); empty()', '[5, True]', 'Push one, pop one.'],
            ['Queue(); push(7); push(8); peek(); peek(); pop(); peek()', '[7, 7, 7, 8]', '`peek` does not remove anything.'],
            ['Queue(); push(1); push(2); push(3); pop(); push(4); pop(); pop(); pop(); empty()', '[1, 2, 3, 4, True]', 'A push between pops keeps FIFO order.'],
            ['Queue(); push(1); push(2); peek(); push(3); pop(); pop()', '[1, 1, 2]', 'Example 1.'],
          ], { ops: ['QueueCostlyPush', 'Queue'] }),
          note("Each test is a sequence of calls on a new queue; the expected output lists what `pop`, `peek` and `empty` returned, in order."),
          tips(
            "Explain amortised cost with the *banker's* argument: each element pays for one push, one move and one pop, so any sequence of $m$ operations costs $O(m)$.",
            "The mirror problem, a **stack using queues**, needs an $O(n)$ operation: rotate the queue after each push so the newest element is at the front."
          ),
        ],
      },

      {
        id: 'maximums-of-sliding-window',
        title: 'Maximums of Sliding Window',
        body: [
          p("Given an array and an integer `k`, a window of size `k` slides from the left end of the array to the right end, one position at a time. Return the **maximum of each window**."),
          ex('nums = [3, 2, 4, 1, 2, 1, 1], k = 3', '[4, 4, 4, 2, 2]', 'the windows are [3,2,4], [2,4,1], [4,1,2], [1,2,1], [2,1,1].'),
          ap(1, 'Brute force: recompute every window'),
          p("Take the maximum of each window from scratch."),
          code(`
            from typing import List

            def maximums_of_sliding_window_brute_force(nums: List[int], k: int) -> List[int]:
                return [max(nums[i:i + k]) for i in range(len(nums) - k + 1)]
            `, `
            function maximumsOfSlidingWindowBruteForce(nums, k) {
              const result = [];
              for (let i = 0; i + k <= nums.length; i++) result.push(Math.max(...nums.slice(i, i + k)));
              return result;
            }
            `, `
            public int[] maximumsOfSlidingWindowBruteForce(int[] nums, int k) {
                int[] result = new int[Math.max(0, nums.length - k + 1)];
                for (int i = 0; i + k <= nums.length; i++) {
                    int best = Integer.MIN_VALUE;
                    for (int j = i; j < i + k; j++) best = Math.max(best, nums[j]);
                    result[i] = best;
                }
                return result;
            }
            `),
          cost("$O(n · k)$.", "$O(1)$ besides the output."),
          ap(2, 'Max-heap with lazy deletion'),
          p("A max-heap gives the largest value in $O(1)$. The difficulty is removing the element that leaves the window, because heaps can't delete from the middle cheaply. We don't have to: store `(value, index)` pairs, and only when the **top** of the heap has an index outside the window do we pop it. Stale entries deeper in the heap don't matter until they reach the top."),
          code(`
            import heapq
            from typing import List

            def maximums_of_sliding_window_heap(nums: List[int], k: int) -> List[int]:
                heap = []  # (-value, index): Python's heapq is a min-heap
                result = []
                for right, x in enumerate(nums):
                    heapq.heappush(heap, (-x, right))
                    while heap[0][1] <= right - k:  # top slid out of the window
                        heapq.heappop(heap)
                    if right >= k - 1:
                        result.append(-heap[0][0])
                return result
            `, `
            function maximumsOfSlidingWindowHeap(nums, k) {
              // A small binary max-heap of [value, index] pairs.
              const heap = [];
              const higher = (a, b) => heap[a][0] > heap[b][0];
              const swap = (a, b) => { [heap[a], heap[b]] = [heap[b], heap[a]]; };
              const push = item => {
                heap.push(item);
                for (let i = heap.length - 1; i > 0 && higher(i, (i - 1) >> 1); i = (i - 1) >> 1) swap(i, (i - 1) >> 1);
              };
              const pop = () => {
                swap(0, heap.length - 1);
                heap.pop();
                for (let i = 0; ;) {
                  const l = 2 * i + 1, r = l + 1;
                  let top = i;
                  if (l < heap.length && higher(l, top)) top = l;
                  if (r < heap.length && higher(r, top)) top = r;
                  if (top === i) break;
                  swap(i, top);
                  i = top;
                }
              };
              const result = [];
              for (let right = 0; right < nums.length; right++) {
                push([nums[right], right]);
                while (heap[0][1] <= right - k) pop(); // top slid out of the window
                if (right >= k - 1) result.push(heap[0][0]);
              }
              return result;
            }
            `, `
            public int[] maximumsOfSlidingWindowHeap(int[] nums, int k) {
                // {value, index}, largest value first
                PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(b[0], a[0]));
                int[] result = new int[Math.max(0, nums.length - k + 1)];
                for (int right = 0; right < nums.length; right++) {
                    heap.offer(new int[]{nums[right], right});
                    while (heap.peek()[1] <= right - k) heap.poll(); // top slid out of the window
                    if (right >= k - 1) result[right - k + 1] = heap.peek()[0];
                }
                return result;
            }
            `),
          cost("$O(n log n)$: every index is pushed and popped at most once, at $O(log n)$ each.", "$O(n)$: stale entries can pile up in the heap."),
          ap(3, 'Monotonic deque (optimal)'),
          p("We want to update the maximum in $O(1)$ amortised time as the window slides."),
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
          vs([
            ['1. Recompute each window', '$O(n · k)$', '$O(1)$', 'Small `k`.'],
            ['2. Max-heap, lazy deletion', '$O(n log n)$', '$O(n)$', 'Generalises to *k-th largest in a window* with two heaps.'],
            ['3. Monotonic deque', '$O(n)$', '$O(k)$', 'The expected answer.'],
          ]),
          tests([
            ['nums = [5], k = 1', '[5]', 'One element, one window.'],
            ['nums = [1, 3, 2], k = 1', '[1, 3, 2]', 'Windows of one: the array itself.'],
            ['nums = [1, 3, 2], k = 3', '[3]', 'The window is the whole array.'],
            ['nums = [4, 4, 4, 4], k = 2', '[4, 4, 4]', 'Equal values.'],
            ['nums = [1, 2, 3, 4, 5], k = 2', '[2, 3, 4, 5]', 'Increasing: each new value is the maximum.'],
            ['nums = [5, 4, 3, 2, 1], k = 2', '[5, 4, 3, 2]', 'Decreasing: maximums expire from the front.'],
            ['nums = [-2, -7, -1, -9], k = 2', '[-2, -1, -1]', 'Negative values.'],
            ['nums = [3, 2, 4, 1, 2, 1, 1], k = 3', '[4, 4, 4, 2, 2]', 'Example 1.'],
          ], { fn: ['maximums_of_sliding_window_brute_force', 'maximums_of_sliding_window_heap', 'maximums_of_sliding_window'] }),
          tips(
            "Store **indexes** in the deque, not values. You need them to know when the front has left the window.",
            "The same deque gives sliding-window **minimums** by flipping the comparison, and it is the core of several DP optimisations."
          ),
        ],
      },
    ],
  });
})();
