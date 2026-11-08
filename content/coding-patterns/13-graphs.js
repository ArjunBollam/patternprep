(function () {
  const { p, h, h3, ul, ol, note, ex, grid, graph, state, code, impl, cx, table, pre } = K;

  K.section({
    id: 'graphs',
    title: 'Graphs',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction to Graphs',
        body: [
          p("A **graph** is a set of **vertices** (nodes) connected by **edges**. Edges can be **directed** (one-way, like a follower relationship) or **undirected** (two-way, like a friendship), and they can carry **weights** (distances, costs). Trees and linked lists are special cases of graphs; general graphs may have cycles and disconnected pieces."),
          K.row(
            graph({ nodes: { A: [0, 0], B: [1.4, 0], C: [0, 1.2], D: [1.4, 1.2], E: [2.8, 0.6] }, edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E']], cap: 'undirected' }),
            graph({ nodes: { 1: [0, 0], 2: [1.4, 0], 3: [0.7, 1.2], 4: [2.4, 1.2] }, edges: [[1, 2], [2, 3], [3, 1], [2, 4]], directed: true, cap: 'directed (with a cycle 1→2→3→1)' }),
            graph({ nodes: { S: [0, 0.6], X: [1.4, 0], Y: [1.4, 1.2], T: [2.8, 0.6] }, edges: [['S', 'X', 4], ['S', 'Y', 1], ['Y', 'X', 2], ['X', 'T', 3]], cap: 'weighted' })
          ),
          h('Representations'),
          table(['Representation', 'Space', 'Check edge (u, v)', 'Best for'], [
            ['Adjacency list: `node → [neighbours]`', '$O(V + E)$', '$O(\\deg(u))$', 'most interview problems (sparse graphs)'],
            ['Adjacency matrix: `V × V` booleans', '$O(V^2)$', '$O(1)$', 'dense graphs, quick edge checks'],
            ['Edge list: `[(u, v, w), …]`', '$O(E)$', '$O(E)$', 'algorithms that sort edges (Kruskal)'],
            ['Implicit grid', 'none extra', '$O(1)$', 'matrix problems: each cell is a node, neighbours are adjacent cells'],
          ]),
          h('The two fundamental traversals'),
          ul(
            "**Depth-first search (DFS)** goes as deep as possible before backtracking, using recursion or a stack. Use it for connectivity, counting components, cycle detection, topological order and exploring all paths.",
            "**Breadth-first search (BFS)** explores in rings of increasing distance using a queue. In an **unweighted** graph, BFS finds **shortest paths** (fewest edges)."
          ),
          p("Both visit each vertex and edge once, $O(V + E)$, as long as you keep a **visited set** so that cycles don't cause infinite loops."),
          h('Other algorithms in this section'),
          table(['Problem', 'Tool'], [
            ['Shortest path with non-negative weights', "Dijkstra's algorithm (BFS + min-heap)"],
            ['Ordering tasks with dependencies', 'Topological sort (Kahn\'s algorithm)'],
            ['Merging groups, dynamic connectivity', 'Union-Find (disjoint set union)'],
            ['Two-colouring / splitting into two groups', 'BFS or DFS with colours'],
          ]),
          h('Real-world uses'),
          ul(
            "**Maps and navigation**: roads are weighted edges; route planning is shortest paths.",
            "**Social networks**: friend suggestions, degrees of separation, communities.",
            "**Build systems and package managers**: dependency graphs and topological order.",
            "**The web**: pages and links form a directed graph that crawlers and ranking algorithms traverse."
          ),
          h('Template'),
          code(`
            from collections import deque

            def bfs(graph, start):
                visited = {start}
                queue = deque([start])
                while queue:
                    node = queue.popleft()
                    for nxt in graph[node]:
                        if nxt not in visited:
                            visited.add(nxt)
                            queue.append(nxt)
                return visited
            `, `
            function bfs(graph, start) {
              const visited = new Set([start]);
              const queue = [start];
              for (let head = 0; head < queue.length; head++) {
                const node = queue[head];
                for (const nxt of graph[node]) {
                  if (!visited.has(nxt)) {
                    visited.add(nxt);
                    queue.push(nxt);
                  }
                }
              }
              return visited;
            }
            `, `
            Set<Integer> bfs(List<List<Integer>> graph, int start) {
                Set<Integer> visited = new HashSet<>(List.of(start));
                Queue<Integer> queue = new ArrayDeque<>(List.of(start));
                while (!queue.isEmpty()) {
                    int node = queue.poll();
                    for (int nxt : graph.get(node)) {
                        if (visited.add(nxt)) queue.offer(nxt);
                    }
                }
                return visited;
            }
            `),
        ],
      },

      {
        id: 'graph-deep-copy',
        title: 'Graph Deep Copy',
        body: [
          p("Given a reference to one node of a **connected, undirected** graph, return a **deep copy** of the whole graph: brand-new nodes with the same values and the same connections. No node of the copy may be shared with the original. Each node has a `val` and a list of `neighbors`."),
          ex('graph: 1 – 2, 1 – 3, 2 – 4, 3 – 4 (given node 1)', 'a new graph with the same structure, starting at the copy of node 1'),
          graph({ nodes: { 1: [0, 0], 2: [1.5, 0], 3: [0, 1.2], 4: [1.5, 1.2] }, edges: [[1, 2], [1, 3], [2, 4], [3, 4]] }),
          h('Intuition'),
          p("Copy the nodes while traversing the graph, say with DFS. The difficulty is **cycles**: node 1 links to 2, which links back to 1. If we blindly copied every neighbour we'd loop forever and create duplicates."),
          p("Keep a hash map **original node → its clone**. It doubles as the visited set:"),
          ol(
            "If the node is already in the map, return its clone (don't copy it again).",
            "Otherwise create the clone, **store it in the map first**, then clone each neighbour recursively and append the results to the clone's neighbour list."
          ),
          state('clone(1): create 1\'; map {1: 1\'}\n  clone(2): create 2\'; neighbours of 2 are 1 (already cloned → 1\'), 4\n    clone(4): create 4\'; neighbours 2 (→ 2\'), 3\n      clone(3): create 3\'; neighbours 1 (→ 1\'), 4 (→ 4\')'),
          note("Registering the clone in the map **before** recursing is what stops infinite recursion on cycles."),
          impl(`
            from typing import Dict

            class GraphNode:
                def __init__(self, val: int):
                    self.val = val
                    self.neighbors = []

            def graph_deep_copy(node: GraphNode) -> GraphNode:
                clones: Dict[GraphNode, GraphNode] = {}

                def clone(n: GraphNode) -> GraphNode:
                    if n in clones:
                        return clones[n]
                    copy = GraphNode(n.val)
                    clones[n] = copy          # register before visiting neighbours
                    for nb in n.neighbors:
                        copy.neighbors.append(clone(nb))
                    return copy

                return clone(node) if node else None
            `, `
            function graphDeepCopy(node) {
              const clones = new Map();
              const clone = n => {
                if (clones.has(n)) return clones.get(n);
                const copy = { val: n.val, neighbors: [] };
                clones.set(n, copy);           // register before visiting neighbours
                for (const nb of n.neighbors) copy.neighbors.push(clone(nb));
                return copy;
              };
              return node ? clone(node) : null;
            }
            `, `
            // class GraphNode { int val; List<GraphNode> neighbors; }
            public GraphNode graphDeepCopy(GraphNode node) {
                if (node == null) return null;
                return clone(node, new HashMap<>());
            }

            private GraphNode clone(GraphNode n, Map<GraphNode, GraphNode> clones) {
                if (clones.containsKey(n)) return clones.get(n);
                GraphNode copy = new GraphNode(n.val);
                clones.put(n, copy);           // register before visiting neighbours
                for (GraphNode nb : n.neighbors) copy.neighbors.add(clone(nb, clones));
                return copy;
            }
            `),
          cx("$O(V + E)$. Each node is cloned once and each edge is followed once from each end.",
            "$O(V)$ for the map and the recursion stack."),
        ],
      },

      {
        id: 'count-islands',
        title: 'Count Islands',
        body: [
          p("Given a grid of `1`s (land) and `0`s (water), return the **number of islands**. An island is a group of land cells connected **horizontally or vertically**; diagonal neighbours don't count."),
          ex('grid = [[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1], [1, 0, 0, 0]]', '3'),
          grid([[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1], [1, 0, 0, 0]], { hl: [[0, 0], [0, 1], [1, 0]], hl2: [[1, 3], [2, 2], [2, 3]], dim: [[0, 2], [0, 3], [1, 1], [1, 2], [2, 0], [2, 1], [3, 1], [3, 2], [3, 3]] }),
          h('Intuition'),
          p("Treat every land cell as a graph node with edges to its land neighbours. Then an island is a **connected component**, and the question becomes \"how many components are there?\""),
          ol(
            "Scan the grid. When we find a land cell that hasn't been visited, it's the start of a **new island**: increment the count.",
            "Flood-fill that island with DFS (or BFS), marking every reachable land cell as visited so it's never counted again."
          ),
          p("A simple way to mark cells is to overwrite them with `0` (\"sink\" the island). If the input must not be modified, use a separate visited set."),
          state('(0,0) land → island 1, sink (0,0), (0,1), (1,0)\n(1,3) land → island 2, sink (1,3), (2,3), (2,2)\n(3,0) land → island 3\nanswer = 3'),
          impl(`
            from typing import List

            def count_islands(grid: List[List[int]]) -> int:
                if not grid:
                    return 0
                rows, cols = len(grid), len(grid[0])

                def sink(r: int, c: int) -> None:
                    if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != 1:
                        return
                    grid[r][c] = 0           # mark visited
                    sink(r + 1, c)
                    sink(r - 1, c)
                    sink(r, c + 1)
                    sink(r, c - 1)

                count = 0
                for r in range(rows):
                    for c in range(cols):
                        if grid[r][c] == 1:
                            count += 1       # found a new island
                            sink(r, c)
                return count
            `, `
            function countIslands(grid) {
              if (!grid.length) return 0;
              const rows = grid.length, cols = grid[0].length;
              const sink = (r, c) => {
                if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== 1) return;
                grid[r][c] = 0; // mark visited
                sink(r + 1, c);
                sink(r - 1, c);
                sink(r, c + 1);
                sink(r, c - 1);
              };
              let count = 0;
              for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                  if (grid[r][c] === 1) {
                    count++;      // found a new island
                    sink(r, c);
                  }
                }
              }
              return count;
            }
            `, `
            public int countIslands(int[][] grid) {
                int count = 0;
                for (int r = 0; r < grid.length; r++) {
                    for (int c = 0; c < grid[0].length; c++) {
                        if (grid[r][c] == 1) {
                            count++;          // found a new island
                            sink(grid, r, c);
                        }
                    }
                }
                return count;
            }

            private void sink(int[][] grid, int r, int c) {
                if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != 1) return;
                grid[r][c] = 0;               // mark visited
                sink(grid, r + 1, c);
                sink(grid, r - 1, c);
                sink(grid, r, c + 1);
                sink(grid, r, c - 1);
            }
            `),
          cx("$O(m·n)$. Every cell is visited a constant number of times.",
            "$O(m·n)$ in the worst case for the recursion stack (a grid that is all land). Use an explicit stack or BFS queue to avoid recursion-depth limits."),
        ],
      },

      {
        id: 'matrix-infection',
        title: 'Matrix Infection',
        body: [
          p("A grid contains `0` (empty), `1` (healthy) and `2` (infected) cells. Every second, each infected cell infects its **healthy horizontal and vertical neighbours**. Return the **number of seconds** until no healthy cells remain, or `-1` if some healthy cell can never be reached."),
          ex('grid = [[1, 1, 1, 0], [0, 0, 2, 1], [0, 1, 1, 0]]', '3'),
          ex('grid = [[1, 0, 2]]', '-1', 'the healthy cell is cut off by an empty cell.'),
          K.row(
            grid([[1, 1, 1, 0], [0, 0, 2, 1], [0, 1, 1, 0]], { hl: [[1, 2]], cap: 't = 0' }),
            grid([[1, 1, 2, 0], [0, 0, 2, 2], [0, 1, 2, 0]], { hl: [[1, 2]], hl2: [[0, 2], [1, 3], [2, 2]], cap: 't = 1' }),
            grid([[1, 2, 2, 0], [0, 0, 2, 2], [0, 2, 2, 0]], { hl2: [[0, 1], [2, 1]], cap: 't = 2' }),
            grid([[2, 2, 2, 0], [0, 0, 2, 2], [0, 2, 2, 0]], { hl2: [[0, 0]], cap: 't = 3' })
          ),
          h('Intuition'),
          p("Infection spreads outward one ring per second from **all** infected cells at once. That's exactly what **breadth-first search** does when the queue starts with **every** initially infected cell: a **multi-source BFS**. Each BFS level is one second."),
          ol(
            "Put every infected cell in the queue and count the healthy cells.",
            "Process the queue level by level. For each infected cell, infect its healthy neighbours, decrement the healthy count, and enqueue them.",
            "Each completed level that infected something adds one second.",
            "At the end, return the seconds if no healthy cells are left, otherwise `-1`."
          ),
          impl(`
            from collections import deque
            from typing import List

            def matrix_infection(grid: List[List[int]]) -> int:
                rows, cols = len(grid), len(grid[0])
                queue = deque()
                healthy = 0
                for r in range(rows):
                    for c in range(cols):
                        if grid[r][c] == 2:
                            queue.append((r, c))
                        elif grid[r][c] == 1:
                            healthy += 1
                seconds = 0
                while queue and healthy > 0:
                    seconds += 1
                    for _ in range(len(queue)):           # one level = one second
                        r, c = queue.popleft()
                        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                                grid[nr][nc] = 2
                                healthy -= 1
                                queue.append((nr, nc))
                return seconds if healthy == 0 else -1
            `, `
            function matrixInfection(grid) {
              const rows = grid.length, cols = grid[0].length;
              let queue = [];
              let healthy = 0;
              for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                  if (grid[r][c] === 2) queue.push([r, c]);
                  else if (grid[r][c] === 1) healthy++;
                }
              }
              let seconds = 0;
              while (queue.length && healthy > 0) {
                seconds++;
                const next = [];                     // one level = one second
                for (const [r, c] of queue) {
                  for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
                      grid[nr][nc] = 2;
                      healthy--;
                      next.push([nr, nc]);
                    }
                  }
                }
                queue = next;
              }
              return healthy === 0 ? seconds : -1;
            }
            `, `
            public int matrixInfection(int[][] grid) {
                int rows = grid.length, cols = grid[0].length, healthy = 0;
                Queue<int[]> queue = new ArrayDeque<>();
                for (int r = 0; r < rows; r++) {
                    for (int c = 0; c < cols; c++) {
                        if (grid[r][c] == 2) queue.offer(new int[]{r, c});
                        else if (grid[r][c] == 1) healthy++;
                    }
                }
                int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
                int seconds = 0;
                while (!queue.isEmpty() && healthy > 0) {
                    seconds++;
                    for (int size = queue.size(); size > 0; size--) { // one level = one second
                        int[] cell = queue.poll();
                        for (int[] d : dirs) {
                            int nr = cell[0] + d[0], nc = cell[1] + d[1];
                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                                grid[nr][nc] = 2;
                                healthy--;
                                queue.offer(new int[]{nr, nc});
                            }
                        }
                    }
                }
                return healthy == 0 ? seconds : -1;
            }
            `),
          cx("$O(m·n)$. Every cell enters the queue at most once.", "$O(m·n)$ for the queue."),
        ],
      },

      {
        id: 'bipartite-graph-validation',
        title: 'Bipartite Graph Validation',
        body: [
          p("An undirected graph is **bipartite** if its nodes can be split into two groups so that **every edge connects a node from one group to a node from the other**. Given the graph as an adjacency list (`graph[i]` lists the neighbours of node `i`), determine whether it is bipartite. The graph may be disconnected."),
          ex('graph = [[1, 3], [0, 2], [1, 3], [0, 2]]', 'True', 'groups {0, 2} and {1, 3}.'),
          ex('graph = [[1, 2], [0, 2], [0, 1]]', 'False', 'a triangle can\'t be split.'),
          K.row(
            graph({ nodes: { 0: [0, 0], 1: [1.4, 0], 2: [1.4, 1.2], 3: [0, 1.2] }, edges: [[0, 1], [1, 2], [2, 3], [3, 0]], hl: [0, 2], hl2: [1, 3], cap: 'bipartite: colour alternates' }),
            graph({ nodes: { 0: [0.7, 0], 1: [0, 1.2], 2: [1.4, 1.2] }, edges: [[0, 1], [1, 2], [2, 0]], hl: [0, 2], hl2: [1], hlE: ['0-2'], cap: 'triangle: 0 and 2 clash' })
          ),
          h('Intuition'),
          p("Think of it as **two-colouring**: give each node one of two colours so that neighbours always differ. Start anywhere with colour A; then all of its neighbours are forced to be B, their neighbours A, and so on. A BFS or DFS propagates these forced choices."),
          p("If we ever find an edge whose two ends already have the **same** colour, no valid split exists. (This happens exactly when the graph has an **odd-length cycle**.) Because the graph may be disconnected, start a new traversal from every node that hasn't been coloured yet."),
          impl(`
            from typing import List

            def bipartite_graph_validation(graph: List[List[int]]) -> bool:
                colour = [0] * len(graph)   # 0 = uncoloured, 1 / -1 = the two groups

                def dfs(node: int, c: int) -> bool:
                    colour[node] = c
                    for nb in graph[node]:
                        if colour[nb] == c:
                            return False                  # same colour on both ends
                        if colour[nb] == 0 and not dfs(nb, -c):
                            return False
                    return True

                for start in range(len(graph)):
                    if colour[start] == 0 and not dfs(start, 1):
                        return False
                return True
            `, `
            function bipartiteGraphValidation(graph) {
              const colour = new Array(graph.length).fill(0); // 0 = uncoloured, 1 / -1
              const dfs = (node, c) => {
                colour[node] = c;
                for (const nb of graph[node]) {
                  if (colour[nb] === c) return false;        // same colour on both ends
                  if (colour[nb] === 0 && !dfs(nb, -c)) return false;
                }
                return true;
              };
              for (let start = 0; start < graph.length; start++) {
                if (colour[start] === 0 && !dfs(start, 1)) return false;
              }
              return true;
            }
            `, `
            public boolean bipartiteGraphValidation(int[][] graph) {
                int[] colour = new int[graph.length]; // 0 = uncoloured, 1 / -1
                for (int start = 0; start < graph.length; start++) {
                    if (colour[start] == 0 && !dfs(graph, start, 1, colour)) return false;
                }
                return true;
            }

            private boolean dfs(int[][] graph, int node, int c, int[] colour) {
                colour[node] = c;
                for (int nb : graph[node]) {
                    if (colour[nb] == c) return false;   // same colour on both ends
                    if (colour[nb] == 0 && !dfs(graph, nb, -c, colour)) return false;
                }
                return true;
            }
            `),
          cx("$O(V + E)$.", "$O(V)$ for the colours and the recursion stack."),
        ],
      },

      {
        id: 'prerequisites',
        title: 'Prerequisites',
        body: [
          p("There are `n` courses labelled `0` to `n - 1`. Each pair `[a, b]` in `prerequisites` means **course `a` must be taken before course `b`**. Return whether it's possible to finish **all** courses."),
          ex('n = 3, prerequisites = [[0, 1], [1, 2]]', 'True', 'take 0, then 1, then 2.'),
          ex('n = 3, prerequisites = [[0, 1], [1, 2], [2, 1]]', 'False', '1 and 2 each require the other.'),
          K.row(
            graph({ nodes: { 0: [0, 0], 1: [1.4, 0], 2: [2.8, 0] }, edges: [[0, 1], [1, 2]], directed: true, cap: 'possible' }),
            graph({ nodes: { 0: [0, 0.5], 1: [1.4, 0], 2: [1.4, 1.2] }, edges: [[0, 1], [1, 2], [2, 1]], directed: true, hl: [1, 2], cap: 'cycle → impossible' })
          ),
          h('Intuition'),
          p("Model courses as nodes and prerequisites as **directed edges** `a → b`. All courses can be finished exactly when the graph has **no directed cycle**, which is the same as saying a **topological order** exists."),
          p("**Kahn's algorithm** builds that order greedily:"),
          ol(
            "Count each node's **in-degree** (number of unmet prerequisites).",
            "Start a queue with every course whose in-degree is 0: they can be taken right away.",
            "Pop a course, \"take\" it, and decrement the in-degree of every course that depends on it. Any course that reaches 0 joins the queue.",
            "If we manage to take all `n` courses, return `True`. Courses stuck in a cycle never reach in-degree 0, so the count falls short."
          ),
          state('n = 3, edges 0→1, 1→2, 2→1\nin-degree: 0:0, 1:2, 2:1\nqueue [0] → take 0 → in-degree of 1 becomes 1\nqueue empty, taken 1 of 3  →  False'),
          impl(`
            from collections import deque
            from typing import List

            def prerequisites(n: int, prereqs: List[List[int]]) -> bool:
                graph = [[] for _ in range(n)]
                in_degree = [0] * n
                for a, b in prereqs:
                    graph[a].append(b)
                    in_degree[b] += 1
                queue = deque(i for i in range(n) if in_degree[i] == 0)
                taken = 0
                while queue:
                    course = queue.popleft()
                    taken += 1
                    for nxt in graph[course]:
                        in_degree[nxt] -= 1
                        if in_degree[nxt] == 0:   # all its prerequisites are done
                            queue.append(nxt)
                return taken == n
            `, `
            function prerequisites(n, prereqs) {
              const graph = Array.from({ length: n }, () => []);
              const inDegree = new Array(n).fill(0);
              for (const [a, b] of prereqs) {
                graph[a].push(b);
                inDegree[b]++;
              }
              const queue = [];
              for (let i = 0; i < n; i++) if (inDegree[i] === 0) queue.push(i);
              let taken = 0;
              for (let head = 0; head < queue.length; head++) {
                taken++;
                for (const nxt of graph[queue[head]]) {
                  if (--inDegree[nxt] === 0) queue.push(nxt); // prerequisites done
                }
              }
              return taken === n;
            }
            `, `
            public boolean prerequisites(int n, int[][] prereqs) {
                List<List<Integer>> graph = new ArrayList<>();
                for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
                int[] inDegree = new int[n];
                for (int[] p : prereqs) {
                    graph.get(p[0]).add(p[1]);
                    inDegree[p[1]]++;
                }
                Queue<Integer> queue = new ArrayDeque<>();
                for (int i = 0; i < n; i++) if (inDegree[i] == 0) queue.offer(i);
                int taken = 0;
                while (!queue.isEmpty()) {
                    int course = queue.poll();
                    taken++;
                    for (int nxt : graph.get(course)) {
                        if (--inDegree[nxt] == 0) queue.offer(nxt); // prerequisites done
                    }
                }
                return taken == n;
            }
            `),
          cx("$O(n + e)$, where $e$ is the number of prerequisite pairs.", "$O(n + e)$ for the graph and the queue."),
        ],
      },

      {
        id: 'merging-communities',
        title: 'Merging Communities',
        body: [
          p("There are `n` people, labelled `0` to `n - 1`, each starting in their own community. Implement:"),
          ul(
            "`connect(x, y)`: merge the communities of `x` and `y` (if they're different).",
            "`get_community_size(x)`: return the number of people in `x`'s community."
          ),
          ex('n = 5; connect(0, 1); connect(1, 2); get_community_size(2); get_community_size(4); connect(3, 4); connect(2, 4); get_community_size(0)', '3, 1, 5'),
          h('Intuition'),
          p("Re-running a graph traversal after every `connect` would be slow. The **Union-Find** (disjoint set union) structure is built for exactly this: merging groups and asking which group something is in."),
          ul(
            "Each community is a tree; `parent[x]` points towards its **representative** (the root).",
            "`find(x)` follows parents up to the root. **Path compression** points every visited node directly at the root, flattening the tree for future calls.",
            "`union(x, y)` finds both roots and attaches one under the other. **Union by size** attaches the smaller tree under the larger, which keeps trees shallow. Store each root's size so `get_community_size` is just `size[find(x)]`."
          ),
          pre(`
            after connect(0,1), connect(1,2):      after connect(3,4), connect(2,4):

                 0          3   4                        0
                / \\                                 / | \\
               1   2       (size 3)                1  2  3
                                                          \\
                                                           4      (size 5)
          `),
          note("With both optimisations, each operation takes **amortised $O(α(n))$** time, where $α$ is the inverse Ackermann function: at most 4 or 5 for any realistic input, i.e. effectively constant."),
          impl(`
            class MergingCommunities:
                def __init__(self, n: int):
                    self.parent = list(range(n))
                    self.size = [1] * n

                def find(self, x: int) -> int:
                    if self.parent[x] != x:
                        self.parent[x] = self.find(self.parent[x])  # path compression
                    return self.parent[x]

                def connect(self, x: int, y: int) -> None:
                    rx, ry = self.find(x), self.find(y)
                    if rx == ry:
                        return
                    if self.size[rx] < self.size[ry]:              # union by size
                        rx, ry = ry, rx
                    self.parent[ry] = rx
                    self.size[rx] += self.size[ry]

                def get_community_size(self, x: int) -> int:
                    return self.size[self.find(x)]
            `, `
            class MergingCommunities {
              constructor(n) {
                this.parent = Array.from({ length: n }, (_, i) => i);
                this.size = new Array(n).fill(1);
              }

              find(x) {
                if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]); // path compression
                return this.parent[x];
              }

              connect(x, y) {
                let rx = this.find(x), ry = this.find(y);
                if (rx === ry) return;
                if (this.size[rx] < this.size[ry]) [rx, ry] = [ry, rx]; // union by size
                this.parent[ry] = rx;
                this.size[rx] += this.size[ry];
              }

              getCommunitySize(x) {
                return this.size[this.find(x)];
              }
            }
            `, `
            class MergingCommunities {
                private final int[] parent, size;

                public MergingCommunities(int n) {
                    parent = new int[n];
                    size = new int[n];
                    for (int i = 0; i < n; i++) {
                        parent[i] = i;
                        size[i] = 1;
                    }
                }

                private int find(int x) {
                    if (parent[x] != x) parent[x] = find(parent[x]); // path compression
                    return parent[x];
                }

                public void connect(int x, int y) {
                    int rx = find(x), ry = find(y);
                    if (rx == ry) return;
                    if (size[rx] < size[ry]) { int t = rx; rx = ry; ry = t; } // union by size
                    parent[ry] = rx;
                    size[rx] += size[ry];
                }

                public int getCommunitySize(int x) {
                    return size[find(x)];
                }
            }
            `),
          cx("Amortised $O(α(n))$ per operation, effectively constant; construction is $O(n)$.", "$O(n)$ for the parent and size arrays."),
        ],
      },

      {
        id: 'shortest-path',
        title: 'Shortest Path',
        body: [
          p("Given `n` nodes and a list of **undirected weighted edges** `[u, v, w]` with **non-negative** weights, return the **shortest distance** from a `start` node to every node. Use `-1` for nodes that can't be reached."),
          ex('n = 5, edges = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], start = 0', '[0, 3, 1, 4, -1]'),
          graph({ nodes: { 0: [0, 0.6], 1: [1.6, 0], 2: [1.6, 1.3], 3: [3.2, 0.6], 4: [4.4, 0.6] }, edges: [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], hl: [0], hlE: ['0-2', '2-1', '1-3'] }),
          h('Intuition'),
          p("BFS finds shortest paths when every edge costs the same. With weights, the path with fewer edges isn't necessarily cheaper (0 → 1 directly costs 4, but 0 → 2 → 1 costs 3)."),
          p("**Dijkstra's algorithm** generalises BFS: always expand the **closest unfinished node**, using a **min-heap** keyed by distance. Because weights are non-negative, the first time a node is popped from the heap its distance is final: any other route would pass through nodes that are at least as far away."),
          ol(
            "Set `dist[start] = 0` and push `(0, start)`.",
            "Pop the smallest `(d, node)`. If `d` is larger than the recorded `dist[node]`, it's an outdated entry: skip it.",
            "For each neighbour, if `d + weight` beats its recorded distance, update it and push the new pair (this update is called **relaxing** the edge)."
          ),
          state('pop (0, 0): relax 1 → 4, 2 → 1\npop (1, 2): relax 1 → 3 (better than 4), 3 → 6\npop (3, 1): relax 3 → 4 (better than 6)\npop (4, 1) stale → skip; pop (4, 3) …\nresult [0, 3, 1, 4, -1]'),
          impl(`
            import heapq
            from typing import List

            def shortest_path(n: int, edges: List[List[int]], start: int) -> List[int]:
                graph = [[] for _ in range(n)]
                for u, v, w in edges:
                    graph[u].append((v, w))
                    graph[v].append((u, w))
                dist = [float('inf')] * n
                dist[start] = 0
                heap = [(0, start)]
                while heap:
                    d, node = heapq.heappop(heap)
                    if d > dist[node]:
                        continue                      # stale entry
                    for nb, w in graph[node]:
                        if d + w < dist[nb]:          # relax the edge
                            dist[nb] = d + w
                            heapq.heappush(heap, (dist[nb], nb))
                return [x if x != float('inf') else -1 for x in dist]
            `, `
            // Uses the Heap class from "Introduction to Heaps".
            function shortestPath(n, edges, start) {
              const graph = Array.from({ length: n }, () => []);
              for (const [u, v, w] of edges) {
                graph[u].push([v, w]);
                graph[v].push([u, w]);
              }
              const dist = new Array(n).fill(Infinity);
              dist[start] = 0;
              const heap = new Heap((a, b) => a[0] - b[0]);
              heap.push([0, start]);
              while (heap.size()) {
                const [d, node] = heap.pop();
                if (d > dist[node]) continue;        // stale entry
                for (const [nb, w] of graph[node]) {
                  if (d + w < dist[nb]) {            // relax the edge
                    dist[nb] = d + w;
                    heap.push([dist[nb], nb]);
                  }
                }
              }
              return dist.map(x => (x === Infinity ? -1 : x));
            }
            `, `
            public int[] shortestPath(int n, int[][] edges, int start) {
                List<List<int[]>> graph = new ArrayList<>();
                for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
                for (int[] e : edges) {
                    graph.get(e[0]).add(new int[]{e[1], e[2]});
                    graph.get(e[1]).add(new int[]{e[0], e[2]});
                }
                int[] dist = new int[n];
                Arrays.fill(dist, Integer.MAX_VALUE);
                dist[start] = 0;
                PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
                heap.offer(new int[]{0, start});
                while (!heap.isEmpty()) {
                    int[] top = heap.poll();
                    int d = top[0], node = top[1];
                    if (d > dist[node]) continue;          // stale entry
                    for (int[] e : graph.get(node)) {
                        int nb = e[0], w = e[1];
                        if (d + w < dist[nb]) {            // relax the edge
                            dist[nb] = d + w;
                            heap.offer(new int[]{dist[nb], nb});
                        }
                    }
                }
                for (int i = 0; i < n; i++) if (dist[i] == Integer.MAX_VALUE) dist[i] = -1;
                return dist;
            }
            `),
          cx("$O((V + E) \\log V)$ with a binary heap.", "$O(V + E)$ for the graph, distances and heap."),
        ],
      },
    ],
  });
})();
