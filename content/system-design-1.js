(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, fig, code, state, pre } = K;

  K.chapters('system-design-interview', [
    {
      id: 'how-to-use-this-kit',
      title: 'How to Approach System Design Interviews',
      body: [
        p("A system design interview asks you to sketch the architecture of a real product, such as a URL shortener, a chat app or a video platform, in about 45 minutes. There is no single correct answer. The interviewer is watching **how you think**: whether you clarify a vague problem, make sensible trade-offs, communicate clearly and go deep where it matters."),
        h('What interviewers look for'),
        table(['Signal', 'What it looks like in the room'], [
          ['Problem scoping', 'You ask about users, scale and features before drawing anything, and write down the agreed scope.'],
          ['Sound high-level design', 'Clients, load balancers, services, storage and queues fit together and serve the core use cases end to end.'],
          ['Trade-off reasoning', 'You say *why* you chose a NoSQL store, a push model or eventual consistency, and what you give up.'],
          ['Depth', 'You can drill into one or two components (sharding scheme, cache invalidation, ID generation) when asked.'],
          ['Communication', 'You think out loud, check in with the interviewer and adapt to hints instead of defending a fixed plan.'],
        ]),
        h('Red flags'),
        ul(
          "Jumping straight into a design without asking a single question.",
          "Over-engineering: adding Kafka, five caches and a service mesh to a system with a few thousand users.",
          "Going silent for minutes, or ignoring the interviewer's hints.",
          "Hand-waving (\"we'll just scale it\") without saying *what* scales and *how*."
        ),
        h('How this kit is organised'),
        ol(
          "**Foundations**: scaling a system step by step, quick capacity estimates, and a 4-step framework for every interview.",
          "**Building blocks**: rate limiting, consistent hashing, key-value storage and unique ID generation. These show up inside almost every bigger design.",
          "**Full designs**: URL shortener, web crawler, notifications, news feed, chat, autocomplete, video streaming and file sync. Each follows the same four steps so you can practise the rhythm."
        ),
        note("Read a chapter's requirements, then pause and sketch your own design for 10 minutes before reading on. Comparing your sketch with the chapter is where most of the learning happens."),
        h('A vocabulary refresher'),
        table(['Term', 'Meaning'], [
          ['Latency', 'time to serve one request (often discussed at p50 / p99)'],
          ['Throughput', 'requests or bytes handled per second (QPS)'],
          ['Availability', 'fraction of time the system works, e.g. 99.9% ≈ 8.8 hours of downtime a year'],
          ['Horizontal scaling', 'adding more machines, as opposed to vertical scaling (a bigger machine)'],
          ['Replication', 'keeping copies of data on several nodes for durability and read throughput'],
          ['Sharding', 'splitting data across nodes by a key so each node holds a part'],
          ['Consistency', 'whether every reader sees the latest write (strong) or eventually sees it (eventual)'],
        ]),
      ],
    },

    {
      id: 'scale-from-zero-to-millions-of-users',
      title: 'Scale From Zero To Millions Of Users',
      body: [
        p("Every large system started small. Walking through how a single-server web app evolves as traffic grows is the best way to learn the standard building blocks, and the reasons each one exists."),
        h('Stage 1: a single server'),
        p("At first, one machine runs the web app, the API and the database. A user's browser resolves the domain through DNS, then sends HTTP requests straight to that server."),
        flow({ nodes: { user: [0, 0, 'Web / mobile', 'client'], dns: [1, 0, 'DNS', 'ext'], srv: [1, 1, 'Single server\napp + database'] },
          edges: [['user', 'dns', 'resolve domain'], ['user', 'srv', 'HTTP requests']] }),
        h('Stage 2: separate the database'),
        p("As traffic grows, the web tier and the data tier compete for CPU and memory. Moving the database to its own server lets each tier scale independently."),
        h3('Which database?'),
        table(['', 'Relational (SQL)', 'Non-relational (NoSQL)'], [
          ['Data model', 'tables and rows, joins', 'key-value, document, wide-column, graph'],
          ['Strengths', 'transactions, strong consistency, ad-hoc queries', 'very large scale, flexible schema, low latency'],
          ['Pick it when', 'data is relational and fits a few machines', 'you need massive scale or simple key lookups'],
        ]),
        p("Relational databases are the safe default. Choose NoSQL when you have a concrete reason: very low latency, unstructured data, or a data volume that one relational cluster can't handle."),
        h('Stage 3: load balancer and multiple web servers'),
        p("One web server is a single point of failure and has a capacity ceiling. Put a **load balancer** in front of several identical web servers. Users connect to the load balancer's public IP; servers talk to it over a private network. If one server dies, traffic goes to the others, and adding capacity is just adding servers."),
        h('Stage 4: database replication'),
        p("Most applications read far more than they write. A **primary** database handles writes and replicates changes to several **replicas** that serve reads. This adds read throughput and survives the loss of a node: if a replica dies, reads move to others; if the primary dies, a replica is promoted."),
        flow({ nodes: { user: [1, 0, 'Users', 'client'], lb: [1, 1, 'Load balancer'], w1: [0, 2, 'Web server 1'], w2: [2, 2, 'Web server 2'],
          pri: [0, 3.3, 'Primary DB\nwrites', 'db'], rep: [2, 3.3, 'Replica DBs\nreads', 'db'] },
          edges: [['user', 'lb'], ['lb', 'w1'], ['lb', 'w2'], ['w1', 'pri', 'write'], ['w2', 'rep', 'read'], ['pri', 'rep', 'replicate', 'dash']] }),
        h('Stage 5: cache and CDN'),
        ul(
          "A **cache** (such as Redis or Memcached) keeps hot data in memory so repeated reads skip the database. The usual pattern is *cache-aside*: read from the cache; on a miss, read the database and populate the cache. Decide on an expiry (TTL), what happens on writes (invalidate or update), and an eviction policy such as LRU.",
          "A **CDN** serves static files (images, video, JavaScript, CSS) from servers geographically close to users, cutting latency and offloading the origin."
        ),
        h('Stage 6: stateless web tier'),
        p("To scale web servers freely, they must be **stateless**: session data (who is logged in, the shopping cart) lives in a shared store such as Redis or a database, not in a server's memory. Then any server can handle any request, and autoscaling can add or remove servers at will."),
        h('Stage 7: multiple data centres'),
        p("For global users and disaster recovery, run the stack in several regions. **GeoDNS** sends users to the nearest healthy region. The hard parts are replicating data across regions, keeping deployments consistent, and testing failover."),
        h('Stage 8: message queues'),
        p("Slow or bursty work, such as image resizing, sending emails or updating search indexes, is pushed to a **message queue**. Producers publish jobs and return immediately; a pool of workers consumes them at its own pace. Producers and consumers can scale and fail independently."),
        h('Stage 9: logging, metrics and automation'),
        p("At scale you need centralised logs, metrics (CPU, QPS, error rates, business KPIs) and automation (CI/CD, infrastructure as code). Without them you can't see problems or ship safely."),
        h('Stage 10: sharding the database'),
        p("Eventually even a replicated database can't hold all the data or absorb all the writes. **Sharding** splits rows across many databases by a **shard key**, e.g. `user_id % 4`. Choose a key that spreads data evenly. Be ready to discuss the challenges:"),
        ul(
          "**Resharding** when a shard fills up (consistent hashing helps; see [Design Consistent Hashing](#/system-design-interview/design-consistent-hashing)).",
          "**Hotspots**: a celebrity's data overwhelms one shard.",
          "**Joins across shards** become expensive, which often pushes designs toward denormalisation."
        ),
        flow({ nodes: { app: [1.5, 0, 'Web tier'], s0: [0, 1.4, 'Shard 0\nuser_id % 4 = 0', 'db'], s1: [1, 1.4, 'Shard 1', 'db'], s2: [2, 1.4, 'Shard 2', 'db'], s3: [3, 1.4, 'Shard 3', 'db'] },
          edges: [['app', 's0'], ['app', 's1'], ['app', 's2'], ['app', 's3']] }),
        h('Summary'),
        ul(
          "Keep the web tier stateless; put sessions in a shared store.",
          "Build redundancy into every tier (load balancers, replicas, multiple regions).",
          "Cache as much as you safely can; serve static assets from a CDN.",
          "Decouple slow work with queues; shard the data tier when one database is no longer enough.",
          "Monitor everything and automate deployments."
        ),
      ],
    },

    {
      id: 'back-of-the-envelope-estimation',
      title: 'Back-of-the-Envelope Estimation',
      body: [
        p("Interviewers often ask for a quick estimate of traffic, storage or bandwidth. The goal isn't precision. It's to show you can reason about orders of magnitude, which decide whether you need one database or a hundred, and whether data fits in memory."),
        h('Numbers worth knowing'),
        table(['Quantity', 'Approximate value'], [
          ['1 day', '≈ 86,400 s ≈ $10^5$ s (a convenient round number)'],
          ['1 million requests / day', '≈ 12 requests / s'],
          ['Main memory reference', '≈ 100 ns'],
          ['Read 1 MB sequentially from memory', '≈ 0.25 ms'],
          ['Round trip within a data centre', '≈ 0.5 ms'],
          ['Read 1 MB sequentially from SSD', '≈ 1 ms'],
          ['Disk seek (HDD)', '≈ 10 ms'],
          ['Round trip across continents', '≈ 150 ms'],
        ]),
        p("Takeaways: memory is fast and disk seeks are slow; avoid them. Compress data before sending it over the network. Cross-region round trips cost far more than anything inside one data centre."),
        h('Powers of two'),
        table(['Power', 'Approx.', 'Name'], [
          ['$2^{10}$', 'thousand', 'KB'], ['$2^{20}$', 'million', 'MB'], ['$2^{30}$', 'billion', 'GB'], ['$2^{40}$', 'trillion', 'TB'], ['$2^{50}$', 'quadrillion', 'PB'],
        ]),
        h('Availability numbers'),
        table(['Availability', 'Downtime per year'], [
          ['99% ("two nines")', '≈ 3.65 days'], ['99.9%', '≈ 8.8 hours'], ['99.99%', '≈ 53 minutes'], ['99.999%', '≈ 5.3 minutes'],
        ]),
        h('Worked example: a photo-sharing service'),
        p("Assumptions (say these out loud and write them down):"),
        ul(
          "100 million daily active users (DAU).",
          "Each user views 50 photos and uploads 0.2 photos per day.",
          "Average photo size after compression: 500 KB. Keep photos for 10 years."
        ),
        state('Read QPS   = 100M × 50 / 10^5 s   ≈ 50,000 / s   (peak ×2 ≈ 100,000 / s)\nWrite QPS  = 100M × 0.2 / 10^5 s  ≈ 200 / s\nNew storage per day  = 20M photos × 500 KB = 10 TB\n10-year storage      = 10 TB × 365 × 10 ≈ 36 PB'),
        p("Conclusions you can draw: the system is **read-heavy** (250:1), so caching and a CDN matter most; storage is in the tens of petabytes, so photos belong in an object store, not a database; write QPS is modest and one sharded metadata store can handle it."),
        h('Tips'),
        ul(
          "Round aggressively: 99,987 / 9.1 → 100,000 / 10. Precision wastes time.",
          "Label units at every step (KB vs. Kb, per second vs. per day).",
          "Typical asks: QPS and peak QPS, storage, cache size (often \"20% of daily reads\"), bandwidth, number of servers."
        ),
      ],
    },

    {
      id: 'a-framework-for-system-design-interviews',
      title: 'A Framework For System Design Interviews',
      body: [
        p("Forty-five minutes go quickly. A simple, repeatable structure keeps you from rambling and makes sure you cover what interviewers grade. Every design in this kit follows these four steps."),
        table(['Step', 'Time (45 min)', 'Goal'], [
          ['1. Understand the problem and establish scope', '3-10 min', 'agree on features, users, scale and constraints'],
          ['2. Propose a high-level design and get buy-in', '10-15 min', 'boxes and arrows covering the core flows, plus APIs and data model'],
          ['3. Design deep dive', '10-25 min', 'go deep on the most interesting or risky components'],
          ['4. Wrap up', '3-5 min', 'recap, bottlenecks, failure modes, future improvements'],
        ]),
        h('Step 1: understand the problem and establish scope'),
        p("Never start designing straight away. Ask questions until you know what you are building and for whom:"),
        ul(
          "What are the **core features**? Which ones are out of scope?",
          "How many **users**? How fast is that number growing?",
          "What are the expected **read/write patterns**? Is it read-heavy?",
          "What is the **existing tech stack** or infrastructure we can reuse?",
          "Non-functional needs: latency targets, availability, consistency, compliance."
        ),
        talk(['Candidate', 'Is this a mobile app, a web app, or both?'], ['Interviewer', 'Both.'],
          ['Candidate', 'What are the most important features?'], ['Interviewer', 'Posting updates and seeing friends\' updates in a feed.'],
          ['Candidate', 'How many daily active users should we plan for?'], ['Interviewer', 'About 10 million.']),
        p("Write the agreed requirements down where both of you can see them. If the interviewer doesn't know an answer, state a reasonable assumption and move on."),
        h('Step 2: propose a high-level design'),
        ul(
          "Draw the main components: clients, API servers, load balancer, cache, databases, queues, CDN.",
          "Walk through **one or two key flows** end to end (e.g. \"post an update\" and \"load the feed\").",
          "Sketch the **API** (endpoints with parameters) and the **data model** if relevant.",
          "Do quick estimates if they influence the design.",
          "Check in: *\"Does this look reasonable before I go deeper?\"*"
        ),
        h('Step 3: design deep dive'),
        p("By now you and the interviewer agree on the overall shape. Use the remaining time on the parts that matter most: those the interviewer steers you to, or the biggest scaling risks. Examples: the hashing scheme in a URL shortener, fan-out in a news feed, message ordering in chat. Discuss alternatives and trade-offs, not just one answer."),
        h('Step 4: wrap up'),
        ul(
          "Identify **bottlenecks** and how you'd address them.",
          "Talk about **failure scenarios**: a server dies, the network partitions, a data centre goes down.",
          "Mention **operational** concerns: monitoring, alerting, rollout.",
          "Explain how the design handles the **next 10× of scale**.",
          "Recap the design in a sentence or two."
        ),
        h("Dos and don'ts"),
        table(['Do', "Don't"], [
          ['ask clarifying questions', 'assume you know what is wanted'],
          ['communicate your thinking continuously', 'think silently for long stretches'],
          ['offer multiple approaches and compare them', 'present one idea as the only option'],
          ['design the most critical components first', 'get lost in details too early'],
          ['treat the interviewer as a teammate', 'ignore hints or argue defensively'],
        ]),
      ],
    },

    {
      id: 'design-a-rate-limiter',
      title: 'Design A Rate Limiter',
      body: [
        p("A **rate limiter** controls how many requests a client may send in a period of time. Requests beyond the limit are rejected (or delayed). Typical rules: a user may post at most 5 messages per second; an IP address may create at most 10 accounts per day; an API key gets 1,000 calls per minute."),
        p("Rate limiting protects services from abuse and accidental overload (including denial-of-service attacks), keeps costs down when calling paid third-party APIs, and shares capacity fairly between clients."),
        h('Step 1 - Understand the problem and establish design scope'),
        talk(['Candidate', 'Are we building a client-side limiter or a server-side API limiter?'], ['Interviewer', 'Server-side.'],
          ['Candidate', 'What do we throttle on: IP, user ID, or something else?'], ['Interviewer', 'It should be flexible enough to support different kinds of rules.'],
          ['Candidate', 'What scale are we talking about?'], ['Interviewer', 'A large number of requests across many servers.'],
          ['Candidate', 'Should users be told when they are throttled?'], ['Interviewer', 'Yes.']),
        h3('Requirements'),
        ul(
          "Accurately limit excessive requests according to configurable rules.",
          "Very low latency: the limiter must not noticeably slow down HTTP responses.",
          "Distributed: the limit is shared across many API servers.",
          "Clear feedback to throttled clients (HTTP 429).",
          "Fault tolerant: if the limiter has problems, the API should keep working."
        ),
        h('Step 2 - Propose high-level design and get buy-in'),
        h3('Where does it live?'),
        p("You could enforce limits in each API server, but most teams put the limiter in **middleware** in front of the APIs, or use the rate-limiting feature of an **API gateway**. A gateway is a good choice if one already exists; a custom middleware gives full control over the algorithm."),
        flow({ nodes: { c: [0, 0, 'Client', 'client'], rl: [1, 0, 'Rate limiter\nmiddleware'], api: [2.2, 0, 'API servers'], redis: [1, 1.3, 'Redis\ncounters', 'cache'] },
          edges: [['c', 'rl', 'request'], ['rl', 'api', 'allowed'], ['rl', 'redis', 'check + update', 'both'], ['rl', 'c', '429 if over limit', 'dash']], uy: 100 }),
        h3('Algorithms'),
        p("Five common algorithms trade accuracy, memory and burst behaviour differently:"),
        table(['Algorithm', 'How it works', 'Pros', 'Cons'], [
          ['**Token bucket**', 'a bucket holds up to *capacity* tokens and is refilled at a fixed rate; each request takes one token or is rejected', 'simple, memory-efficient, allows short bursts', 'two parameters to tune'],
          ['**Leaking bucket**', 'requests join a FIFO queue processed at a fixed rate; overflow is dropped', 'smooth, stable outflow', 'bursts fill the queue with old requests'],
          ['**Fixed window counter**', 'count requests per fixed window (e.g. per minute)', 'very simple', 'up to 2× the limit at window edges'],
          ['**Sliding window log**', 'keep a timestamp per request; drop those older than the window', 'exact', 'stores every timestamp (memory-heavy)'],
          ['**Sliding window counter**', 'blend the current and previous window counts by overlap', 'smooths edges, cheap', 'approximate'],
        ]),
        h3('Token bucket in detail'),
        p("Suppose capacity = 4 and the bucket refills 4 tokens per minute. A burst of 3 requests passes immediately (4 → 1 token). If the bucket is empty, further requests are rejected until the refill. Usually you keep **one bucket per rule and per client**, e.g. per user per endpoint."),
        pre(`
          time      tokens   request?   result
          1:00:00     4        yes        allowed   (3 left)
          1:00:05     3        3 more     allowed   (0 left)
          1:00:20     0        yes        dropped (429)
          1:01:00     4        refill
        `),
        p("Instead of a timer that adds tokens, compute them lazily: store `tokens` and `last_refill`, and on each request add `elapsed × rate` (capped at capacity)."),
        code({ py: `
          import time

          class TokenBucket:
              def __init__(self, capacity: int, refill_per_sec: float):
                  self.capacity = capacity
                  self.rate = refill_per_sec
                  self.tokens = capacity
                  self.last = time.monotonic()

              def allow(self) -> bool:
                  now = time.monotonic()
                  # Lazily add the tokens earned since the last call.
                  self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
                  self.last = now
                  if self.tokens >= 1:
                      self.tokens -= 1
                      return True
                  return False
          `, java: `
          class TokenBucket {
              private final int capacity;
              private final double ratePerNano;
              private double tokens;
              private long last = System.nanoTime();

              TokenBucket(int capacity, double refillPerSecond) {
                  this.capacity = capacity;
                  this.ratePerNano = refillPerSecond / 1e9;
                  this.tokens = capacity;
              }

              synchronized boolean allow() {
                  long now = System.nanoTime();
                  // Lazily add the tokens earned since the last call.
                  tokens = Math.min(capacity, tokens + (now - last) * ratePerNano);
                  last = now;
                  if (tokens >= 1) {
                      tokens -= 1;
                      return true;
                  }
                  return false;
              }
          }
          ` }),
        h3('Where are the counters stored?'),
        p("Counters must be shared by all API servers and updated on every request, so a database is too slow. An in-memory store like **Redis** is ideal: it's fast, supports expiry (`EXPIRE`) and atomic increments (`INCR`)."),
        h('Step 3 - Design deep dive'),
        h3('Rules'),
        p("Rules are written in configuration files (e.g. YAML) and cached by the limiter. Example: *domain `messaging`, key `user_id`, 5 requests per second*. Workers reload rules from storage periodically."),
        h3('Response to throttled clients'),
        p("Return **HTTP 429 Too Many Requests**, plus headers so clients can back off: `X-Ratelimit-Remaining`, `X-Ratelimit-Limit`, and `X-Ratelimit-Retry-After`. Some systems queue throttled requests (e.g. orders) to process later rather than dropping them."),
        h3('Distributed challenges'),
        ul(
          "**Race conditions**: two servers read `counter = 3`, both increment and write 4, so one request is lost. Fix with atomic operations: a Redis Lua script or a sorted-set operation that checks and updates in one step.",
          "**Synchronisation**: if each region has its own limiter, a client hopping between them sees separate limits. Use a centralised store, or accept eventual consistency with periodic syncing.",
          "**Performance**: deploy limiters at the edge, close to users, and keep the hot path to a single round trip to Redis.",
          "**Fail open vs. fail closed**: if Redis is down, letting traffic through keeps the product working; blocking protects the backend. Pick per use case."
        ),
        h('Step 4 - Wrap up'),
        ul(
          "Hard vs. soft limits (may short bursts briefly exceed the limit?).",
          "Rate limiting at other layers, e.g. by IP with iptables at the network layer.",
          "Client best practices: cache responses, back off exponentially with jitter, honour `Retry-After`.",
          "Monitoring to check that rules are neither too strict (dropping legit traffic) nor too loose."
        ),
      ],
    },

    {
      id: 'design-consistent-hashing',
      title: 'Design Consistent Hashing',
      body: [
        p("To scale horizontally we spread data across servers. The naive way is `server = hash(key) % N`. It distributes keys evenly, but when a server is added or removed **almost every key moves**, because `N` changed. For a cache cluster that means a storm of cache misses; for a database it means moving nearly all the data."),
        pre(`
          N = 4:  hash % 4 → key k1 on server 1, k2 on server 3 ...
          N = 3 (server 1 died): hash % 3 → most keys now map to a different server
        `),
        p("**Consistent hashing** fixes this: when a server is added or removed, only about `k / N` keys move (k = keys, N = servers)."),
        h('The hash ring'),
        p("Take the output space of a hash function (e.g. 0 … $2^{32} - 1$) and bend it into a ring. Hash each **server** (by name or IP) onto the ring. Hash each **key** onto the ring too, then walk **clockwise** until you hit a server: that server stores the key."),
        pre(`
                    s0
               k0 ·      · k1
             s3              s1
               k3 ·      · k2
                    s2

          k0 → walk clockwise → s0's successor ... each key goes to the next server clockwise
        `),
        ul(
          "**Adding** a server `s4` between `s3` and `s0`: only keys between `s3` and `s4` move (from `s0` to `s4`).",
          "**Removing** `s1`: only keys that lived on `s1` move to the next server clockwise."
        ),
        h('Problems with the basic approach'),
        ul(
          "Servers land at random points, so the arcs they own differ wildly in size: some servers get much more data than others.",
          "When a server leaves, its whole arc goes to **one** neighbour, which may then be overloaded."
        ),
        h('Virtual nodes'),
        p("Give each physical server many positions on the ring, called **virtual nodes** (e.g. `s0#0`, `s0#1`, … `s0#199`). Each server now owns many small arcs scattered around the ring, so load evens out (with a few hundred virtual nodes per server the standard deviation of load falls to a few percent), and when a server leaves, its arcs are spread across many neighbours. Servers with more capacity can simply get more virtual nodes."),
        h('Implementation'),
        p("Keep the ring as a **sorted list of hash positions** mapping to servers. A lookup hashes the key and binary-searches for the first position ≥ the key's hash, wrapping around to the start."),
        code({ py: `
          import bisect
          import hashlib

          class ConsistentHashRing:
              def __init__(self, vnodes: int = 100):
                  self.vnodes = vnodes
                  self.positions = []   # sorted hash positions
                  self.owner = {}       # position -> server

              def _hash(self, key: str) -> int:
                  return int(hashlib.md5(key.encode()).hexdigest(), 16) % (2 ** 32)

              def add_server(self, server: str) -> None:
                  for i in range(self.vnodes):
                      pos = self._hash(f"{server}#{i}")
                      bisect.insort(self.positions, pos)
                      self.owner[pos] = server

              def remove_server(self, server: str) -> None:
                  for i in range(self.vnodes):
                      pos = self._hash(f"{server}#{i}")
                      self.positions.remove(pos)
                      del self.owner[pos]

              def get_server(self, key: str) -> str:
                  h = self._hash(key)
                  i = bisect.bisect_left(self.positions, h) % len(self.positions)  # wrap around
                  return self.owner[self.positions[i]]
          `, java: `
          class ConsistentHashRing {
              private final TreeMap<Long, String> ring = new TreeMap<>();
              private final int vnodes;

              ConsistentHashRing(int vnodes) { this.vnodes = vnodes; }

              private long hash(String key) {
                  // FNV-1a, kept simple for illustration
                  long h = 0xcbf29ce484222325L;
                  for (char c : key.toCharArray()) { h ^= c; h *= 0x100000001b3L; }
                  return h & 0xffffffffL;
              }

              void addServer(String server) {
                  for (int i = 0; i < vnodes; i++) ring.put(hash(server + "#" + i), server);
              }

              void removeServer(String server) {
                  for (int i = 0; i < vnodes; i++) ring.remove(hash(server + "#" + i));
              }

              String getServer(String key) {
                  Map.Entry<Long, String> e = ring.ceilingEntry(hash(key));
                  return (e != null ? e : ring.firstEntry()).getValue(); // wrap around
              }
          }
          ` }),
        h('Where it is used'),
        ul(
          "Partitioning in distributed databases and key-value stores (Dynamo-style systems, Cassandra).",
          "Distributed caches and CDNs choosing which node holds an object.",
          "Load balancers that need **sticky** routing while servers come and go."
        ),
        h('Wrap up'),
        ul(
          "Minimal key movement when the cluster changes.",
          "Even distribution with virtual nodes; easy to weight bigger servers.",
          "Mitigates hotspots, though a single very hot key still needs replication or splitting."
        ),
      ],
    },
  ]);
})();
