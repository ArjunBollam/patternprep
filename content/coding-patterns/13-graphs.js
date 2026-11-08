(function () {
  const { p, h, h3, ul, ol, note, ex, grid, graph, state, code, impl, cx, table, pre, ap, cost, vs, tests, tips } = K;

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
          ap(1, 'Two passes: clone every node, then copy the edges'),
          p("Split the job in two. First, traverse the original graph (BFS here) and create a clone for every node, remembering `original → clone` in a hash map. Second, go through the map and give each clone the clones of its original's neighbours."),
          code(`
            from collections import deque

            class GraphNode:
                def __init__(self, val: int):
                    self.val = val
                    self.neighbors = []

            def graph_deep_copy_two_pass(node: GraphNode) -> GraphNode:
                if node is None:
                    return None
                clones = {node: GraphNode(node.val)}
                queue = deque([node])
                while queue:  # pass 1: one clone per reachable node
                    n = queue.popleft()
                    for nb in n.neighbors:
                        if nb not in clones:
                            clones[nb] = GraphNode(nb.val)
                            queue.append(nb)
                for original, copy in clones.items():  # pass 2: wire the edges
                    copy.neighbors = [clones[nb] for nb in original.neighbors]
                return clones[node]
            `, `
            function graphDeepCopyTwoPass(node) {
              if (!node) return null;
              const clones = new Map([[node, { val: node.val, neighbors: [] }]]);
              const queue = [node];
              while (queue.length) { // pass 1: one clone per reachable node
                const n = queue.shift();
                for (const nb of n.neighbors) {
                  if (!clones.has(nb)) { clones.set(nb, { val: nb.val, neighbors: [] }); queue.push(nb); }
                }
              }
              for (const [original, copy] of clones) copy.neighbors = original.neighbors.map(nb => clones.get(nb)); // pass 2
              return clones.get(node);
            }
            `, `
            // class GraphNode { int val; List<GraphNode> neighbors; }
            public GraphNode graphDeepCopyTwoPass(GraphNode node) {
                if (node == null) return null;
                Map<GraphNode, GraphNode> clones = new HashMap<>();
                clones.put(node, new GraphNode(node.val));
                Deque<GraphNode> queue = new ArrayDeque<>(List.of(node));
                while (!queue.isEmpty()) { // pass 1: one clone per reachable node
                    GraphNode n = queue.poll();
                    for (GraphNode nb : n.neighbors) {
                        if (!clones.containsKey(nb)) { clones.put(nb, new GraphNode(nb.val)); queue.add(nb); }
                    }
                }
                for (Map.Entry<GraphNode, GraphNode> e : clones.entrySet()) { // pass 2: wire the edges
                    for (GraphNode nb : e.getKey().neighbors) e.getValue().neighbors.add(clones.get(nb));
                }
                return clones.get(node);
            }
            `),
          cost("$O(V + E)$.", "$O(V)$ for the map and the queue."),
          p("Two passes are perfectly fine. A recursive DFS can do both jobs in a single pass, as long as it handles cycles."),
          ap(2, 'One DFS with a clone map (optimal)'),
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
          vs([
            ['1. Clone nodes, then wire edges', '$O(V + E)$', '$O(V)$', 'Iterative; easy to reason about.'],
            ['2. One DFS with a clone map', '$O(V + E)$', '$O(V)$', 'The usual answer; recursion depth can reach $V$.'],
          ]),
          tests([
            ['adj = []', '[]', 'No graph (the given node is null).'],
            ['adj = [[]]', '[[]]', 'A single node without edges.'],
            ['adj = [[2], [1]]', '[[2], [1]]', 'Two nodes pointing at each other: the smallest cycle.'],
            ['adj = [[2], [1, 3], [2, 4], [3]]', '[[2], [1, 3], [2, 4], [3]]', 'A path of four nodes.'],
            ['adj = [[2, 3], [1, 3], [1, 2]]', '[[2, 3], [1, 3], [1, 2]]', 'A triangle.'],
            ['adj = [[2, 3], [1, 4], [1, 4], [2, 3]]', '[[2, 3], [1, 4], [1, 4], [2, 3]]', 'Example 1.'],
          ], {
            fn: ['graph_deep_copy_two_pass', 'graph_deep_copy'],
            call: "lambda fn, kw: (lambda nodes: _gdump(fn(nodes[0] if nodes else None), nodes))(_gbuild(kw['adj']))",
            jscall: "(fn, kw) => { const nodes = gbuild(kw.adj); return gdump(fn(nodes[0] || null), nodes); }",
          }),
          note("In the table, `adj[i]` lists the neighbours of the node with value `i + 1`, and the copy starts from node 1. The checker rebuilds the adjacency list from the returned copy and also fails if any node of the copy is an original node."),
          tips(
            "State why the map is filled **before** recursing: on a cycle, the recursive call comes back to a node whose clone is still being built, and must reuse it.",
            "If the graph may be disconnected, you need a list of all nodes; then clone every node that isn't in the map yet."
          ),
        ],
      },

      {
        id: 'count-islands',
        title: 'Count Islands',
        body: [
          p("Given a grid of `1`s (land) and `0`s (water), return the **number of islands**. An island is a group of land cells connected **horizontally or vertically**; diagonal neighbours don't count."),
          ex('grid = [[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1], [1, 0, 0, 0]]', '3'),
          grid([[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1], [1, 0, 0, 0]], { hl: [[0, 0], [0, 1], [1, 0]], hl2: [[1, 3], [2, 2], [2, 3]], dim: [[0, 2], [0, 3], [1, 1], [1, 2], [2, 0], [2, 1], [3, 1], [3, 2], [3, 3]] }),
          p("Treat every land cell as a graph node with edges to its land neighbours. Then an island is a **connected component**, and the question becomes \"how many components are there?\""),
          ap(1, 'Breadth-first search with a visited set'),
          p("Scan the grid; every unvisited land cell starts a new island. A BFS from that cell visits the whole island and records each cell in a visited set, so no cell is counted twice. The input grid stays untouched."),
          code(`
            from collections import deque
            from typing import List

            def count_islands_bfs(grid: List[List[int]]) -> int:
                rows, cols = len(grid), len(grid[0]) if grid else 0
                visited = set()
                count = 0
                for r in range(rows):
                    for c in range(cols):
                        if grid[r][c] != 1 or (r, c) in visited:
                            continue
                        count += 1  # a new island
                        visited.add((r, c))
                        queue = deque([(r, c)])
                        while queue:
                            cr, cc = queue.popleft()
                            for nr, nc in ((cr + 1, cc), (cr - 1, cc), (cr, cc + 1), (cr, cc - 1)):
                                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and (nr, nc) not in visited:
                                    visited.add((nr, nc))
                                    queue.append((nr, nc))
                return count
            `, `
            function countIslandsBfs(grid) {
              const rows = grid.length, cols = rows ? grid[0].length : 0;
              const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
              let count = 0;
              for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                  if (grid[r][c] !== 1 || visited[r][c]) continue;
                  count++; // a new island
                  visited[r][c] = true;
                  const queue = [[r, c]];
                  while (queue.length) {
                    const [cr, cc] = queue.shift();
                    for (const [nr, nc] of [[cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1]]) {
                      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1 && !visited[nr][nc]) {
                        visited[nr][nc] = true;
                        queue.push([nr, nc]);
                      }
                    }
                  }
                }
              }
              return count;
            }
            `, `
            public int countIslandsBfs(int[][] grid) {
                int rows = grid.length, cols = rows == 0 ? 0 : grid[0].length, count = 0;
                boolean[][] visited = new boolean[rows][cols];
                int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
                for (int r = 0; r < rows; r++) {
                    for (int c = 0; c < cols; c++) {
                        if (grid[r][c] != 1 || visited[r][c]) continue;
                        count++; // a new island
                        visited[r][c] = true;
                        Deque<int[]> queue = new ArrayDeque<>();
                        queue.add(new int[]{r, c});
                        while (!queue.isEmpty()) {
                            int[] cell = queue.poll();
                            for (int[] d : dirs) {
                                int nr = cell[0] + d[0], nc = cell[1] + d[1];
                                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1 && !visited[nr][nc]) {
                                    visited[nr][nc] = true;
                                    queue.add(new int[]{nr, nc});
                                }
                            }
                        }
                    }
                }
                return count;
            }
            `),
          cost("$O(m·n)$.", "$O(m·n)$ for the visited set (plus the queue)."),
          ap(2, 'Depth-first search that sinks each island (optimal)'),
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
          vs([
            ['1. BFS + visited set', '$O(m·n)$', '$O(m·n)$', 'When the input must not change; no recursion limits.'],
            ['2. DFS that sinks islands', '$O(m·n)$', '$O(m·n)$ recursion in the worst case', 'The shortest code when modifying the grid is allowed.'],
          ]),
          tests([
            ['grid = []', '0', 'Empty grid.'],
            ['grid = [[0]]', '0', 'Only water.'],
            ['grid = [[1]]', '1', 'One land cell.'],
            ['grid = [[1, 0, 1, 0, 1]]', '3', 'A single row of separate islands.'],
            ['grid = [[1, 0], [0, 1]]', '2', 'Diagonal cells are not connected.'],
            ['grid = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]', '1', 'A ring of land around a lake is one island.'],
            ['grid = [[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1], [1, 0, 0, 0]]', '3', 'Example 1.'],
          ], { fn: ['count_islands_bfs', 'count_islands'] }),
          tips(
            "Union-Find is a third option: union every land cell with its land neighbours and count the distinct roots. It shines when land is **added over time** (count islands after each addition).",
            "On huge grids, recursive DFS can overflow the call stack; mention BFS or an explicit stack."
          ),
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
          ap(1, 'Simulate second by second'),
          p("Follow the rules literally. Each second, scan the whole grid and collect every healthy cell that touches an infected one. Infect them all at once (so a cell infected this second can't spread further until the next second), and stop when a second infects nobody."),
          code(`
            from typing import List

            def matrix_infection_simulate(grid: List[List[int]]) -> int:
                grid = [row[:] for row in grid]
                rows, cols = len(grid), len(grid[0])
                seconds = 0
                while True:
                    newly = [(r, c) for r in range(rows) for c in range(cols)
                             if grid[r][c] == 1 and any(
                                 0 <= r + dr < rows and 0 <= c + dc < cols and grid[r + dr][c + dc] == 2
                                 for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
                    if not newly:
                        break
                    for r, c in newly:  # infect them all at the same moment
                        grid[r][c] = 2
                    seconds += 1
                return -1 if any(1 in row for row in grid) else seconds
            `, `
            function matrixInfectionSimulate(grid) {
              grid = grid.map(row => [...row]);
              const rows = grid.length, cols = grid[0].length;
              const infectedNeighbour = (r, c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) =>
                r + dr >= 0 && r + dr < rows && c + dc >= 0 && c + dc < cols && grid[r + dr][c + dc] === 2);
              let seconds = 0;
              while (true) {
                const newly = [];
                for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
                  if (grid[r][c] === 1 && infectedNeighbour(r, c)) newly.push([r, c]);
                }
                if (!newly.length) break;
                for (const [r, c] of newly) grid[r][c] = 2; // infect them all at the same moment
                seconds++;
              }
              return grid.some(row => row.includes(1)) ? -1 : seconds;
            }
            `, `
            public int matrixInfectionSimulate(int[][] original) {
                int rows = original.length, cols = original[0].length, seconds = 0;
                int[][] grid = new int[rows][];
                for (int r = 0; r < rows; r++) grid[r] = original[r].clone();
                int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
                while (true) {
                    List<int[]> newly = new ArrayList<>();
                    for (int r = 0; r < rows; r++) {
                        for (int c = 0; c < cols; c++) {
                            if (grid[r][c] != 1) continue;
                            for (int[] d : dirs) {
                                int nr = r + d[0], nc = c + d[1];
                                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 2) { newly.add(new int[]{r, c}); break; }
                            }
                        }
                    }
                    if (newly.isEmpty()) break;
                    for (int[] cell : newly) grid[cell[0]][cell[1]] = 2; // infect them all at the same moment
                    seconds++;
                }
                for (int[] row : grid) for (int v : row) if (v == 1) return -1;
                return seconds;
            }
            `),
          cost("$O((m·n)^2)$ in the worst case: up to $m·n$ seconds (a long winding path), each scanning the whole grid.", "$O(m·n)$ for the copy."),
          p("Each second rescans cells that can't possibly change. Only the cells infected **last second** can spread the infection further, which is exactly a BFS frontier."),
          ap(2, 'Multi-source breadth-first search (optimal)'),
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
          vs([
            ['1. Simulate second by second', '$O((m·n)^2)$', '$O(m·n)$', 'Mirrors the statement; too slow on big grids.'],
            ['2. Multi-source BFS', '$O(m·n)$', '$O(m·n)$', 'The expected answer.'],
          ]),
          tests([
            ['grid = [[2]]', '0', 'Nothing healthy to infect.'],
            ['grid = [[0]]', '0', 'No healthy cells at all.'],
            ['grid = [[1]]', '-1', 'A healthy cell with no infection source.'],
            ['grid = [[2, 1, 1, 1]]', '3', 'Infection travels along a row.'],
            ['grid = [[2, 1, 2]]', '1', 'Two sources reach the same cell in the same second.'],
            ['grid = [[1, 0, 2]]', '-1', 'Example 2: a healthy cell is cut off.'],
            ['grid = [[1, 1, 1, 0], [0, 0, 2, 1], [0, 1, 1, 0]]', '3', 'Example 1.'],
          ], { fn: ['matrix_infection_simulate', 'matrix_infection'] }),
          tips(
            "Put **all** sources in the queue before starting. Running a separate BFS from each source gives wrong times and costs much more.",
            "Count healthy cells up front, so the final check is a single comparison instead of another scan."
          ),
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
          p("Think of it as **two-colouring**: give each node one of two colours so that neighbours always differ. Start anywhere with colour A; then all of its neighbours are forced to be B, their neighbours A, and so on. A BFS or DFS propagates these forced choices."),
          p("If we ever find an edge whose two ends already have the **same** colour, no valid split exists. (This happens exactly when the graph has an **odd-length cycle**.) Because the graph may be disconnected, start a new traversal from every node that hasn't been coloured yet."),
          ap(1, 'Breadth-first two-colouring'),
          p("Colour a start node, then process the graph level by level: every neighbour of a node gets the opposite colour, and an edge between two equal colours means failure."),
          code(`
            from collections import deque
            from typing import List

            def bipartite_bfs(graph: List[List[int]]) -> bool:
                colour = [0] * len(graph)  # 0 = uncoloured, 1 / -1 = the two groups
                for start in range(len(graph)):
                    if colour[start]:
                        continue
                    colour[start] = 1
                    queue = deque([start])
                    while queue:
                        node = queue.popleft()
                        for nb in graph[node]:
                            if colour[nb] == colour[node]:
                                return False          # an edge inside one group
                            if colour[nb] == 0:
                                colour[nb] = -colour[node]
                                queue.append(nb)
                return True
            `, `
            function bipartiteBfs(graph) {
              const colour = new Array(graph.length).fill(0); // 0 = uncoloured, 1 / -1 = groups
              for (let start = 0; start < graph.length; start++) {
                if (colour[start]) continue;
                colour[start] = 1;
                const queue = [start];
                while (queue.length) {
                  const node = queue.shift();
                  for (const nb of graph[node]) {
                    if (colour[nb] === colour[node]) return false; // an edge inside one group
                    if (colour[nb] === 0) { colour[nb] = -colour[node]; queue.push(nb); }
                  }
                }
              }
              return true;
            }
            `, `
            public boolean bipartiteBfs(int[][] graph) {
                int[] colour = new int[graph.length]; // 0 = uncoloured, 1 / -1 = groups
                for (int start = 0; start < graph.length; start++) {
                    if (colour[start] != 0) continue;
                    colour[start] = 1;
                    Deque<Integer> queue = new ArrayDeque<>(List.of(start));
                    while (!queue.isEmpty()) {
                        int node = queue.poll();
                        for (int nb : graph[node]) {
                            if (colour[nb] == colour[node]) return false; // an edge inside one group
                            if (colour[nb] == 0) { colour[nb] = -colour[node]; queue.add(nb); }
                        }
                    }
                }
                return true;
            }
            `),
          cost("$O(V + E)$.", "$O(V)$ for the colours and the queue."),
          ap(2, 'Union-Find: every neighbour goes to the other side'),
          p("A different angle: all neighbours of a node must end up in the **same** group (the one opposite the node). So union all of `node`'s neighbours together, and fail if a node ever lands in the same set as one of its neighbours."),
          code(`
            from typing import List

            def bipartite_union_find(graph: List[List[int]]) -> bool:
                parent = list(range(len(graph)))

                def find(x: int) -> int:
                    while parent[x] != x:
                        parent[x] = parent[parent[x]]
                        x = parent[x]
                    return x

                for node, neighbours in enumerate(graph):
                    for nb in neighbours:
                        if find(node) == find(nb):
                            return False  # node and a neighbour forced into one group
                        parent[find(nb)] = find(neighbours[0])  # all neighbours: one group
                return True
            `, `
            function bipartiteUnionFind(graph) {
              const parent = graph.map((_, i) => i);
              const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
              for (let node = 0; node < graph.length; node++) {
                for (const nb of graph[node]) {
                  if (find(node) === find(nb)) return false; // node and a neighbour in one group
                  parent[find(nb)] = find(graph[node][0]);   // all neighbours: one group
                }
              }
              return true;
            }
            `, `
            public boolean bipartiteUnionFind(int[][] graph) {
                int[] parent = new int[graph.length];
                for (int i = 0; i < graph.length; i++) parent[i] = i;
                for (int node = 0; node < graph.length; node++) {
                    for (int nb : graph[node]) {
                        if (find(parent, node) == find(parent, nb)) return false; // forced into one group
                        parent[find(parent, nb)] = find(parent, graph[node][0]);   // all neighbours: one group
                    }
                }
                return true;
            }

            private int find(int[] parent, int x) {
                while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
                return x;
            }
            `),
          cost("$O((V + E) · α(V))$, effectively linear.", "$O(V)$ for the parent array."),
          ap(3, 'Depth-first two-colouring (optimal, most common)'),
          p("The DFS version propagates the same forced colours recursively: colour a node, then try to colour each neighbour with the opposite colour."),
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
          vs([
            ['1. BFS colouring', '$O(V + E)$', '$O(V)$', 'Iterative; no recursion limits.'],
            ['2. Union-Find', '$O((V + E)·α(V))$', '$O(V)$', 'When edges arrive one at a time.'],
            ['3. DFS colouring', '$O(V + E)$', '$O(V)$', 'The most common answer.'],
          ]),
          tests([
            ['graph = []', 'True', 'An empty graph.'],
            ['graph = [[]]', 'True', 'A single node.'],
            ['graph = [[1], [0]]', 'True', 'One edge.'],
            ['graph = [[1], [0, 2], [1, 3], [2, 4], [3, 5], [4]]', 'True', 'A path: colours simply alternate.'],
            ['graph = [[1, 4], [0, 2], [1, 3], [2, 4], [3, 0]]', 'False', 'A cycle of odd length (5).'],
            ['graph = [[1], [0], [3, 4], [2, 4], [2, 3]]', 'False', 'Disconnected: the second component is a triangle.'],
            ['graph = [[1, 3], [0, 2], [1, 3], [0, 2]]', 'True', 'Example 1.'],
            ['graph = [[1, 2], [0, 2], [0, 1]]', 'False', 'Example 2.'],
          ], { fn: ['bipartite_bfs', 'bipartite_union_find', 'bipartite_graph_validation'] }),
          tips(
            "Mention the equivalence: a graph is bipartite **if and only if** it has no odd-length cycle. It's a quick way to sanity-check examples.",
            "Don't forget disconnected graphs: start a traversal from every uncoloured node."
          ),
        ],
      },

      {
        id: 'prerequisites',
        title: 'Prerequisites',
        body: [
          p("There are `n` courses labelled `0` to `n - 1`. Each pair `[a, b]` in `prereqs` means **course `a` must be taken before course `b`**. Return whether it's possible to finish **all** courses."),
          ex('n = 3, prereqs = [[0, 1], [1, 2]]', 'True', 'take 0, then 1, then 2.'),
          ex('n = 3, prereqs = [[0, 1], [1, 2], [2, 1]]', 'False', '1 and 2 each require the other.'),
          K.row(
            graph({ nodes: { 0: [0, 0], 1: [1.4, 0], 2: [2.8, 0] }, edges: [[0, 1], [1, 2]], directed: true, cap: 'possible' }),
            graph({ nodes: { 0: [0, 0.5], 1: [1.4, 0], 2: [1.4, 1.2] }, edges: [[0, 1], [1, 2], [2, 1]], directed: true, hl: [1, 2], cap: 'cycle → impossible' })
          ),
          p("Model courses as nodes and prerequisites as **directed edges** `a → b`. All courses can be finished exactly when the graph has **no directed cycle**, which is the same as saying a **topological order** exists."),
          ap(1, 'Brute force: look for a path from each course back to itself'),
          p("A course is stuck exactly when it lies on a cycle, meaning it can reach itself. So run a separate search from every course and check whether it comes back."),
          code(`
            from typing import List

            def prerequisites_brute_force(n: int, prereqs: List[List[int]]) -> bool:
                graph = [[] for _ in range(n)]
                for a, b in prereqs:
                    graph[a].append(b)
                for course in range(n):
                    stack, seen = list(graph[course]), set()
                    while stack:  # can we walk from course back to course?
                        node = stack.pop()
                        if node == course:
                            return False
                        if node not in seen:
                            seen.add(node)
                            stack.extend(graph[node])
                return True
            `, `
            function prerequisitesBruteForce(n, prereqs) {
              const graph = Array.from({ length: n }, () => []);
              for (const [a, b] of prereqs) graph[a].push(b);
              for (let course = 0; course < n; course++) {
                const stack = [...graph[course]], seen = new Set();
                while (stack.length) { // can we walk from course back to course?
                  const node = stack.pop();
                  if (node === course) return false;
                  if (!seen.has(node)) { seen.add(node); stack.push(...graph[node]); }
                }
              }
              return true;
            }
            `, `
            public boolean prerequisitesBruteForce(int n, int[][] prereqs) {
                List<List<Integer>> graph = new ArrayList<>();
                for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
                for (int[] p : prereqs) graph.get(p[0]).add(p[1]);
                for (int course = 0; course < n; course++) {
                    Deque<Integer> stack = new ArrayDeque<>(graph.get(course));
                    Set<Integer> seen = new HashSet<>();
                    while (!stack.isEmpty()) { // can we walk from course back to course?
                        int node = stack.pop();
                        if (node == course) return false;
                        if (seen.add(node)) for (int next : graph.get(node)) stack.push(next);
                    }
                }
                return true;
            }
            `),
          cost("$O(n · (n + e))$: one full search per course.", "$O(n + e)$."),
          ap(2, 'Depth-first search with three states'),
          p("One DFS over the whole graph can detect a cycle by marking each node **unvisited**, **in progress** (on the current DFS path) or **done**. Reaching an in-progress node means we've walked around a cycle. Done nodes are never explored again, so each node and edge is processed once."),
          code(`
            from typing import List

            def prerequisites_dfs(n: int, prereqs: List[List[int]]) -> bool:
                graph = [[] for _ in range(n)]
                for a, b in prereqs:
                    graph[a].append(b)
                state = [0] * n  # 0 = unvisited, 1 = in progress, 2 = done

                def has_cycle(node: int) -> bool:
                    if state[node] == 1:
                        return True   # back to a node on the current path
                    if state[node] == 2:
                        return False  # already fully explored
                    state[node] = 1
                    if any(has_cycle(nxt) for nxt in graph[node]):
                        return True
                    state[node] = 2
                    return False

                return not any(has_cycle(c) for c in range(n))
            `, `
            function prerequisitesDfs(n, prereqs) {
              const graph = Array.from({ length: n }, () => []);
              for (const [a, b] of prereqs) graph[a].push(b);
              const state = new Array(n).fill(0); // 0 = unvisited, 1 = in progress, 2 = done
              const hasCycle = node => {
                if (state[node] === 1) return true;  // back to a node on the current path
                if (state[node] === 2) return false; // already fully explored
                state[node] = 1;
                if (graph[node].some(hasCycle)) return true;
                state[node] = 2;
                return false;
              };
              for (let c = 0; c < n; c++) if (hasCycle(c)) return false;
              return true;
            }
            `, `
            public boolean prerequisitesDfs(int n, int[][] prereqs) {
                List<List<Integer>> graph = new ArrayList<>();
                for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
                for (int[] p : prereqs) graph.get(p[0]).add(p[1]);
                int[] state = new int[n]; // 0 = unvisited, 1 = in progress, 2 = done
                for (int c = 0; c < n; c++) if (hasCycle(c, graph, state)) return false;
                return true;
            }

            private boolean hasCycle(int node, List<List<Integer>> graph, int[] state) {
                if (state[node] == 1) return true;  // back to a node on the current path
                if (state[node] == 2) return false; // already fully explored
                state[node] = 1;
                for (int next : graph.get(node)) if (hasCycle(next, graph, state)) return true;
                state[node] = 2;
                return false;
            }
            `),
          cost("$O(n + e)$.", "$O(n + e)$ for the graph, plus $O(n)$ recursion."),
          ap(3, "Kahn's algorithm: peel off courses with no remaining prerequisites (optimal)"),
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
          vs([
            ['1. Search from every course', '$O(n·(n + e))$', '$O(n + e)$', 'Baseline.'],
            ['2. DFS with three states', '$O(n + e)$', '$O(n + e)$', 'Optimal; recursion depth up to $n$.'],
            ['3. Kahn\'s algorithm', '$O(n + e)$', '$O(n + e)$', 'Optimal and iterative; also produces a valid course order.'],
          ]),
          tests([
            ['n = 1, prereqs = []', 'True', 'One course, no rules.'],
            ['n = 2, prereqs = [[0, 1]]', 'True', 'A single rule.'],
            ['n = 1, prereqs = [[0, 0]]', 'False', 'A course that requires itself.'],
            ['n = 2, prereqs = [[0, 1], [1, 0]]', 'False', 'Two courses requiring each other.'],
            ['n = 4, prereqs = [[0, 1], [0, 2], [1, 3], [2, 3]]', 'True', 'Two routes lead to the same course (no cycle).'],
            ['n = 5, prereqs = [[0, 1], [3, 4], [4, 3]]', 'False', 'The cycle sits in a separate part of the graph.'],
            ['n = 3, prereqs = [[0, 1], [1, 2]]', 'True', 'Example 1.'],
            ['n = 3, prereqs = [[0, 1], [1, 2], [2, 1]]', 'False', 'Example 2.'],
          ], { fn: ['prerequisites_brute_force', 'prerequisites_dfs', 'prerequisites'] }),
          tips(
            "The common follow-up asks for an actual course **order**. Kahn's algorithm already produces it: the order in which courses leave the queue.",
            "Clarify the edge direction (`a` before `b` or `b` before `a`) before coding. Getting it backwards still detects cycles but produces reversed orders."
          ),
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
          ap(1, 'A community label for every person'),
          p("Give every person a community label (initially their own number) and keep a count per label. `connect` relabels everyone in one community with the other's label, which means scanning all `n` people."),
          code(`
            class MergingCommunitiesLabels:
                def __init__(self, n: int):
                    self.label = list(range(n))
                    self.count = [1] * n  # people per label

                def connect(self, x: int, y: int) -> None:
                    a, b = self.label[x], self.label[y]
                    if a == b:
                        return
                    for person in range(len(self.label)):  # relabel community a as b
                        if self.label[person] == a:
                            self.label[person] = b
                    self.count[b] += self.count[a]

                def get_community_size(self, x: int) -> int:
                    return self.count[self.label[x]]
            `, `
            class MergingCommunitiesLabels {
              constructor(n) {
                this.label = Array.from({ length: n }, (_, i) => i);
                this.count = new Array(n).fill(1); // people per label
              }

              connect(x, y) {
                const a = this.label[x], b = this.label[y];
                if (a === b) return;
                for (let p = 0; p < this.label.length; p++) if (this.label[p] === a) this.label[p] = b; // relabel
                this.count[b] += this.count[a];
              }

              getCommunitySize(x) {
                return this.count[this.label[x]];
              }
            }
            `, `
            class MergingCommunitiesLabels {
                private final int[] label, count;

                public MergingCommunitiesLabels(int n) {
                    label = new int[n];
                    count = new int[n];
                    for (int i = 0; i < n; i++) { label[i] = i; count[i] = 1; }
                }

                public void connect(int x, int y) {
                    int a = label[x], b = label[y];
                    if (a == b) return;
                    for (int p = 0; p < label.length; p++) if (label[p] == a) label[p] = b; // relabel
                    count[b] += count[a];
                }

                public int getCommunitySize(int x) { return count[label[x]]; }
            }
            `),
          cost("`connect` $O(n)$; `get_community_size` $O(1)$.", "$O(n)$."),
          ap(2, 'Union-Find without optimisations'),
          p("Represent each community as a tree of parent pointers, where the root is the community's representative. `connect` just links one root under the other, with no relabelling. Without care, though, the trees can turn into long chains, so `find` can take $O(n)$ steps."),
          code(`
            class MergingCommunitiesPlain:
                def __init__(self, n: int):
                    self.parent = list(range(n))
                    self.size = [1] * n

                def find(self, x: int) -> int:
                    while self.parent[x] != x:  # may walk a long chain
                        x = self.parent[x]
                    return x

                def connect(self, x: int, y: int) -> None:
                    rx, ry = self.find(x), self.find(y)
                    if rx != ry:
                        self.parent[rx] = ry  # always hang x's tree under y's
                        self.size[ry] += self.size[rx]

                def get_community_size(self, x: int) -> int:
                    return self.size[self.find(x)]
            `, `
            class MergingCommunitiesPlain {
              constructor(n) {
                this.parent = Array.from({ length: n }, (_, i) => i);
                this.size = new Array(n).fill(1);
              }

              find(x) {
                while (this.parent[x] !== x) x = this.parent[x]; // may walk a long chain
                return x;
              }

              connect(x, y) {
                const rx = this.find(x), ry = this.find(y);
                if (rx !== ry) { this.parent[rx] = ry; this.size[ry] += this.size[rx]; }
              }

              getCommunitySize(x) {
                return this.size[this.find(x)];
              }
            }
            `, `
            class MergingCommunitiesPlain {
                private final int[] parent, size;

                public MergingCommunitiesPlain(int n) {
                    parent = new int[n];
                    size = new int[n];
                    for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
                }

                private int find(int x) {
                    while (parent[x] != x) x = parent[x]; // may walk a long chain
                    return x;
                }

                public void connect(int x, int y) {
                    int rx = find(x), ry = find(y);
                    if (rx != ry) { parent[rx] = ry; size[ry] += size[rx]; }
                }

                public int getCommunitySize(int x) { return size[find(x)]; }
            }
            `),
          cost("$O(n)$ per operation in the worst case (a chain-shaped tree).", "$O(n)$."),
          p("Two small changes fix the chains: always attach the **smaller** tree under the larger one, and **compress** paths during `find`."),
          ap(3, 'Union-Find with union by size and path compression (optimal)'),
          p("The **Union-Find** (disjoint set union) structure is built for exactly this: merging groups and asking which group something is in."),
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
          vs([
            ['1. Labels + counts', '$O(n)$ connect, $O(1)$ size', '$O(n)$', 'Few merges, many queries.'],
            ['2. Plain Union-Find', '$O(n)$ worst case', '$O(n)$', 'Shows why the optimisations matter.'],
            ['3. Union by size + path compression', 'amortised $O(α(n))$', '$O(n)$', 'The expected answer.'],
          ]),
          tests([
            ['MergingCommunities(1); get_community_size(0)', '[1]', 'One person.'],
            ['MergingCommunities(3); connect(0, 0); get_community_size(0)', '[1]', 'Connecting a person to themselves changes nothing.'],
            ['MergingCommunities(4); connect(0, 1); connect(1, 0); get_community_size(1)', '[2]', 'Connecting two people who are already together.'],
            ['MergingCommunities(6); connect(0, 1); connect(2, 3); connect(4, 5); connect(1, 3); get_community_size(2); get_community_size(5)', '[4, 2]', 'Merging two existing communities.'],
            ['MergingCommunities(5); connect(0, 1); connect(1, 2); get_community_size(2); get_community_size(4); connect(3, 4); connect(2, 4); get_community_size(0)', '[3, 1, 5]', 'Example 1.'],
          ], { ops: ['MergingCommunitiesLabels', 'MergingCommunitiesPlain', 'MergingCommunities'] }),
          note("Each test is a sequence of calls on a new structure; the expected output lists what `get_community_size` returned."),
          tips(
            "Union-Find shows up all over interviews: counting connected components, detecting a cycle in an undirected graph, Kruskal's minimum spanning tree, and grouping equivalent items (accounts, synonyms).",
            "If asked to *split* communities, Union-Find can't do it; that needs a different structure or rebuilding."
          ),
        ],
      },

      {
        id: 'shortest-path',
        title: 'Shortest Path',
        body: [
          p("Given `n` nodes and a list of **undirected weighted edges** `[u, v, w]` with **non-negative** weights, return the **shortest distance** from a `start` node to every node. Use `-1` for nodes that can't be reached."),
          ex('n = 5, edges = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], start = 0', '[0, 3, 1, 4, -1]'),
          graph({ nodes: { 0: [0, 0.6], 1: [1.6, 0], 2: [1.6, 1.3], 3: [3.2, 0.6], 4: [4.4, 0.6] }, edges: [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], hl: [0], hlE: ['0-2', '2-1', '1-3'] }),
          ap(1, 'Bellman-Ford: relax every edge, n - 1 times'),
          p("A shortest path never needs more than `n - 1` edges. If we **relax** every edge (check whether going through it gives a shorter distance) `n - 1` times, every shortest path is found one edge at a time. It's slow, but it also works with negative weights."),
          code(`
            from typing import List

            def shortest_path_bellman_ford(n: int, edges: List[List[int]], start: int) -> List[int]:
                INF = float('inf')
                dist = [INF] * n
                dist[start] = 0
                for _ in range(n - 1):
                    changed = False
                    for u, v, w in edges:  # undirected: relax both directions
                        if dist[u] + w < dist[v]:
                            dist[v], changed = dist[u] + w, True
                        if dist[v] + w < dist[u]:
                            dist[u], changed = dist[v] + w, True
                    if not changed:
                        break  # nothing improved: all distances are final
                return [d if d != INF else -1 for d in dist]
            `, `
            function shortestPathBellmanFord(n, edges, start) {
              const dist = new Array(n).fill(Infinity);
              dist[start] = 0;
              for (let round = 0; round < n - 1; round++) {
                let changed = false;
                for (const [u, v, w] of edges) { // undirected: relax both directions
                  if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; }
                  if (dist[v] + w < dist[u]) { dist[u] = dist[v] + w; changed = true; }
                }
                if (!changed) break; // all distances are final
              }
              return dist.map(d => (d === Infinity ? -1 : d));
            }
            `, `
            public int[] shortestPathBellmanFord(int n, int[][] edges, int start) {
                long INF = Long.MAX_VALUE / 4;
                long[] dist = new long[n];
                Arrays.fill(dist, INF);
                dist[start] = 0;
                for (int round = 0; round < n - 1; round++) {
                    boolean changed = false;
                    for (int[] e : edges) { // undirected: relax both directions
                        if (dist[e[0]] + e[2] < dist[e[1]]) { dist[e[1]] = dist[e[0]] + e[2]; changed = true; }
                        if (dist[e[1]] + e[2] < dist[e[0]]) { dist[e[0]] = dist[e[1]] + e[2]; changed = true; }
                    }
                    if (!changed) break; // all distances are final
                }
                int[] result = new int[n];
                for (int i = 0; i < n; i++) result[i] = dist[i] >= INF ? -1 : (int) dist[i];
                return result;
            }
            `),
          cost("$O(V · E)$.", "$O(V)$."),
          ap(2, "Dijkstra with an array (scan for the closest node)"),
          p("With non-negative weights we can finalise one node at a time: repeatedly pick the **unfinished node with the smallest distance**, mark it finished, and relax its edges. Finding that node by scanning an array costs $O(V)$ per step."),
          code(`
            from typing import List

            def shortest_path_dijkstra_array(n: int, edges: List[List[int]], start: int) -> List[int]:
                graph = [[] for _ in range(n)]
                for u, v, w in edges:
                    graph[u].append((v, w))
                    graph[v].append((u, w))
                INF = float('inf')
                dist = [INF] * n
                dist[start] = 0
                done = [False] * n
                for _ in range(n):
                    node = min((i for i in range(n) if not done[i]), key=lambda i: dist[i])
                    if dist[node] == INF:
                        break  # the rest is unreachable
                    done[node] = True
                    for nb, w in graph[node]:
                        dist[nb] = min(dist[nb], dist[node] + w)
                return [d if d != INF else -1 for d in dist]
            `, `
            function shortestPathDijkstraArray(n, edges, start) {
              const graph = Array.from({ length: n }, () => []);
              for (const [u, v, w] of edges) { graph[u].push([v, w]); graph[v].push([u, w]); }
              const dist = new Array(n).fill(Infinity), done = new Array(n).fill(false);
              dist[start] = 0;
              for (let step = 0; step < n; step++) {
                let node = -1;
                for (let i = 0; i < n; i++) if (!done[i] && (node === -1 || dist[i] < dist[node])) node = i;
                if (dist[node] === Infinity) break; // the rest is unreachable
                done[node] = true;
                for (const [nb, w] of graph[node]) dist[nb] = Math.min(dist[nb], dist[node] + w);
              }
              return dist.map(d => (d === Infinity ? -1 : d));
            }
            `, `
            public int[] shortestPathDijkstraArray(int n, int[][] edges, int start) {
                List<List<int[]>> graph = new ArrayList<>();
                for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
                for (int[] e : edges) { graph.get(e[0]).add(new int[]{e[1], e[2]}); graph.get(e[1]).add(new int[]{e[0], e[2]}); }
                long INF = Long.MAX_VALUE / 4;
                long[] dist = new long[n];
                Arrays.fill(dist, INF);
                dist[start] = 0;
                boolean[] done = new boolean[n];
                for (int step = 0; step < n; step++) {
                    int node = -1;
                    for (int i = 0; i < n; i++) if (!done[i] && (node == -1 || dist[i] < dist[node])) node = i;
                    if (dist[node] >= INF) break; // the rest is unreachable
                    done[node] = true;
                    for (int[] e : graph.get(node)) dist[e[0]] = Math.min(dist[e[0]], dist[node] + e[1]);
                }
                int[] result = new int[n];
                for (int i = 0; i < n; i++) result[i] = dist[i] >= INF ? -1 : (int) dist[i];
                return result;
            }
            `),
          cost("$O(V^2 + E)$: $V$ scans of $V$ nodes.", "$O(V + E)$."),
          p("That's actually the best choice for very **dense** graphs. For typical sparse graphs, a min-heap finds the closest node much faster."),
          ap(3, "Dijkstra with a min-heap (optimal for sparse graphs)"),
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
          vs([
            ['1. Bellman-Ford', '$O(V · E)$', '$O(V)$', 'Negative edge weights (and detecting negative cycles).'],
            ['2. Dijkstra, array scan', '$O(V^2 + E)$', '$O(V + E)$', 'Dense graphs ($E ≈ V^2$).'],
            ['3. Dijkstra, min-heap', '$O((V + E) log V)$', '$O(V + E)$', 'The expected answer for sparse graphs with non-negative weights.'],
          ]),
          tests([
            ['n = 1, edges = [], start = 0', '[0]', 'Only the start node.'],
            ['n = 2, edges = [], start = 0', '[0, -1]', 'An unreachable node.'],
            ['n = 2, edges = [[0, 1, 0]], start = 1', '[0, 0]', 'A zero-weight edge, starting from node 1.'],
            ['n = 3, edges = [[0, 1, 2], [0, 1, 1]], start = 0', '[0, 1, -1]', 'Parallel edges: the cheaper one counts.'],
            ['n = 3, edges = [[0, 1, 5], [1, 2, 5], [0, 2, 20]], start = 0', '[0, 5, 10]', 'Two cheap edges beat one expensive edge.'],
            ['n = 5, edges = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], start = 0', '[0, 3, 1, 4, -1]', 'Example 1.'],
          ], { fn: ['shortest_path_bellman_ford', 'shortest_path_dijkstra_array', 'shortest_path'] }),
          tips(
            "Name the precondition: Dijkstra requires **non-negative** weights. With negative weights, a finished node could later be improved.",
            "With all weights equal, plain BFS already gives shortest paths in $O(V + E)$. With weights of only 0 and 1, a deque-based *0-1 BFS* does too."
          ),
        ],
      },
    ],
  });
})();
