(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, code, state, pre } = K;

  K.chapters('system-design-interview', [
    {
      id: 'design-a-key-value-store',
      title: 'Design A Key-Value Store',
      body: [
        p("A **key-value store** is a non-relational database where each unique key maps to a value: `put(key, value)` and `get(key)`. Values are opaque blobs (strings, serialized objects). Examples include Redis, DynamoDB and Memcached. Designing one is a tour of the core ideas of distributed storage."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul(
          "Small key-value pairs (under 10 KB).",
          "Ability to store **big data**, beyond one machine.",
          "**High availability**: keep responding even during failures.",
          "**High scalability**: grow by adding servers; automatic scaling.",
          "**Tunable consistency** and **low latency**."
        ),
        h('Single-server store'),
        p("A hash table in memory is the easy start. Two tricks stretch it further: compress data, and keep only hot data in memory with the rest on disk. Still, one server runs out of room quickly, so we need a **distributed** store."),
        h('Step 2 - High-level design: the CAP theorem'),
        p("In a distributed system you can guarantee at most two of these three properties at once:"),
        ul(
          "**Consistency**: every client sees the same data at the same time, whichever node it talks to.",
          "**Availability**: every request gets a response, even when some nodes are down.",
          "**Partition tolerance**: the system keeps working despite network partitions between nodes."
        ),
        p("Network partitions are unavoidable in practice, so the real choice is **CP vs. AP** *during* a partition. A bank balance store picks CP (reject writes rather than show stale balances). A shopping cart or social feed picks AP (stay up, reconcile later)."),
        h3('Core components'),
        table(['Concern', 'Technique'], [
          ['Data partitioning', 'consistent hashing with virtual nodes'],
          ['Data replication', 'store each key on the next N distinct servers clockwise on the ring'],
          ['Consistency', 'quorum reads and writes (N, W, R)'],
          ['Inconsistency resolution', 'versioning with vector clocks'],
          ['Temporary failures', 'sloppy quorum and hinted handoff'],
          ['Permanent failures', 'anti-entropy with Merkle trees'],
          ['Failure detection', 'gossip protocol'],
          ['Data-centre outage', 'cross-data-centre replication'],
        ]),
        h3('Quorum consensus'),
        p("With replication factor **N**, a write is acknowledged once **W** replicas confirm it, and a read waits for **R** replicas. A coordinator node handles the request."),
        flow({ nodes: { cl: [1, 0, 'Client', 'client'], co: [1, 1, 'Coordinator'], a: [0, 2.2, 'Replica A', 'db'], b: [1, 2.2, 'Replica B', 'db'], c: [2, 2.2, 'Replica C', 'db'] },
          edges: [['cl', 'co', 'put(k, v)'], ['co', 'a', 'write', 'both'], ['co', 'b', 'write', 'both'], ['co', 'c', 'write', 'both']] }),
        table(['Setting', 'Effect'], [
          ['W + R > N', 'every read overlaps with the latest write → strong consistency (usually N = 3, W = R = 2)'],
          ['R = 1, W = N', 'fast reads'],
          ['W = 1, R = N', 'fast writes'],
          ['W + R ≤ N', 'faster, but reads may be stale (eventual consistency)'],
        ]),
        h3('Vector clocks'),
        p("With AP replication, two clients may update the same key on different replicas concurrently. A **vector clock** is a list of `[server, counter]` pairs attached to each version. Comparing two clocks tells us whether one version descends from the other (safe to overwrite) or whether they **conflict** (siblings), in which case the client or a merge rule reconciles them."),
        pre(`
          D1 [(Sx,1)]           written via server Sx
          D2 [(Sx,2)]           updated via Sx         → D2 descends from D1
          D3 [(Sx,2),(Sy,1)]    updated via Sy         ┐ concurrent: neither
          D4 [(Sx,2),(Sz,1)]    updated via Sz         ┘ descends from the other → conflict
          D5 [(Sx,3),(Sy,1),(Sz,1)]  client merges D3 + D4, writes via Sx
        `),
        h('Step 3 - Deep dive: handling failures'),
        ul(
          "**Gossip protocol**: each node keeps a membership list with heartbeat counters and periodically sends it to random peers. If a node's heartbeat hasn't increased for a while, others mark it as down.",
          "**Sloppy quorum + hinted handoff**: when a replica is down, the write goes to the next healthy node on the ring, along with a hint. When the original node comes back, the data is handed back.",
          "**Merkle trees**: to repair replicas that drifted apart, each replica builds a hash tree over key ranges. Comparing roots, then only the differing subtrees, finds inconsistent keys while transferring very little data.",
          "**Multiple data centres**: replicate across regions so an entire outage doesn't lose data."
        ),
        h3('Write and read paths (LSM-tree style)'),
        ol(
          "A write is appended to a **commit log** on disk (durability).",
          "It is then stored in an in-memory **memtable**.",
          "When the memtable is full, it is flushed to an immutable sorted file on disk, an **SSTable**.",
          "A read checks the memtable first, then SSTables. A **Bloom filter** per SSTable quickly rules out files that can't contain the key."
        ),
        flow({ nodes: { w: [0, 0, 'Write request', 'client'], log: [1, 0, 'Commit log', 'store'], mem: [2, 0, 'Memtable\n(memory)', 'cache'], sst: [2, 1.3, 'SSTables\n(disk)', 'db'], bf: [1, 1.3, 'Bloom filters'] },
          edges: [['w', 'log', '1'], ['log', 'mem', '2'], ['mem', 'sst', '3 flush'], ['bf', 'sst', 'skip files', 'dash']] }),
        h('Step 4 - Wrap up'),
        table(['Goal', 'Technique'], [
          ['store big data', 'consistent hashing to spread load'],
          ['high-availability reads/writes', 'replication, multiple data centres, sloppy quorum'],
          ['tunable consistency', 'N / W / R quorum settings'],
          ['handle conflicts', 'vector clocks'],
          ['incremental scalability', 'virtual nodes'],
          ['fast reads on disk', 'SSTables + Bloom filters'],
        ]),
      ],
    },

    {
      id: 'design-a-unique-id-generator',
      title: 'Design A Unique ID Generator In Distributed Systems',
      body: [
        p("A single database can hand out IDs with `AUTO_INCREMENT`, but that doesn't work across many database servers: it's a bottleneck and a single point of failure, and coordinating counters adds latency. We need a way for many machines to generate unique IDs independently."),
        h('Step 1 - Understand the problem and establish design scope'),
        talk(['Candidate', 'What properties should the IDs have?'], ['Interviewer', 'Unique and sortable by time.'],
          ['Candidate', 'Does every new record get an ID that increments by exactly 1?'], ['Interviewer', 'No. Later IDs should be larger, but they don\'t need to be consecutive.'],
          ['Candidate', 'Do IDs contain only numbers? How long can they be?'], ['Interviewer', 'Numeric, fitting in 64 bits.'],
          ['Candidate', 'What scale?'], ['Interviewer', 'At least 10,000 IDs per second.']),
        h('Step 2 - Options'),
        table(['Approach', 'How', 'Pros', 'Cons'], [
          ['Multi-master auto-increment', 'each of k DB servers increments by k', 'uses existing databases', 'not time-sortable across servers; hard to add servers'],
          ['UUID', '128-bit random value generated anywhere', 'no coordination at all', '128 bits; not numeric; not time-ordered'],
          ['Ticket server', 'one central DB issues IDs', 'simple, numeric', 'single point of failure'],
          ['**Snowflake-style**', 'pack timestamp + machine + sequence into 64 bits', 'sortable, 64-bit, no coordination', 'needs clock discipline'],
        ]),
        h('Step 3 - Deep dive: the 64-bit layout'),
        pre(`
          | 1 bit | 41 bits                 | 5 bits        | 5 bits     | 12 bits         |
          | sign  | timestamp (ms)          | data centre   | machine    | sequence number |
        `),
        ul(
          "**Sign bit** is always 0, so IDs are positive.",
          "**Timestamp**: milliseconds since a custom epoch. 41 bits cover about 69 years. Putting it first makes IDs sort by creation time.",
          "**Data centre ID / machine ID**: 32 data centres × 32 machines, assigned at startup (e.g. from configuration or ZooKeeper).",
          "**Sequence**: incremented for IDs generated in the same millisecond on the same machine, reset every millisecond: up to 4,096 IDs per ms per machine."
        ),
        code({ py: `
          import threading
          import time

          class IdGenerator:
              EPOCH_MS = 1_700_000_000_000          # custom epoch

              def __init__(self, datacenter_id: int, machine_id: int):
                  assert 0 <= datacenter_id < 32 and 0 <= machine_id < 32
                  self.dc, self.machine = datacenter_id, machine_id
                  self.last_ms, self.seq = -1, 0
                  self.lock = threading.Lock()

              def next_id(self) -> int:
                  with self.lock:
                      now = int(time.time() * 1000)
                      if now < self.last_ms:
                          raise RuntimeError("clock moved backwards")
                      if now == self.last_ms:
                          self.seq = (self.seq + 1) & 0xFFF    # 12 bits
                          if self.seq == 0:                    # exhausted this millisecond
                              while now <= self.last_ms:
                                  now = int(time.time() * 1000)
                      else:
                          self.seq = 0
                      self.last_ms = now
                      return ((now - self.EPOCH_MS) << 22) | (self.dc << 17) | (self.machine << 12) | self.seq
          `, java: `
          class IdGenerator {
              private static final long EPOCH_MS = 1_700_000_000_000L; // custom epoch
              private final long dc, machine;
              private long lastMs = -1, seq = 0;

              IdGenerator(long datacenterId, long machineId) {
                  this.dc = datacenterId;
                  this.machine = machineId;
              }

              synchronized long nextId() {
                  long now = System.currentTimeMillis();
                  if (now < lastMs) throw new IllegalStateException("clock moved backwards");
                  if (now == lastMs) {
                      seq = (seq + 1) & 0xFFF;             // 12 bits
                      if (seq == 0) {                      // exhausted this millisecond
                          while (now <= lastMs) now = System.currentTimeMillis();
                      }
                  } else {
                      seq = 0;
                  }
                  lastMs = now;
                  return ((now - EPOCH_MS) << 22) | (dc << 17) | (machine << 12) | seq;
              }
          }
          ` }),
        h('Step 4 - Wrap up'),
        ul(
          "**Clock synchronisation**: machines' clocks drift; use NTP and refuse to generate IDs if the clock moves backwards.",
          "**Tuning bit lengths**: fewer sequence bits and more timestamp bits suit low-concurrency, long-lived systems.",
          "**High availability**: ID generation is on the critical path of every write, so run it inside each service or as a replicated service."
        ),
      ],
    },

    {
      id: 'design-a-url-shortener',
      title: 'Design A URL Shortener',
      body: [
        p("A URL shortener turns a long link like `https://example.com/articles/2024/how-to-design-systems?ref=newsletter` into a short alias such as `https://sho.rt/zn9edcu`. Visiting the short link redirects to the original."),
        h('Step 1 - Understand the problem and establish design scope'),
        talk(['Candidate', 'What is the traffic volume?'], ['Interviewer', '100 million URLs generated per day.'],
          ['Candidate', 'How short should the short URL be?'], ['Interviewer', 'As short as possible.'],
          ['Candidate', 'Which characters are allowed?'], ['Interviewer', 'Digits and letters: 0-9, a-z, A-Z.'],
          ['Candidate', 'Can links be deleted or updated?'], ['Interviewer', 'Assume not, for simplicity.']),
        h3('Estimates'),
        state('writes: 100M / day ≈ 1,160 / s\nreads (10:1): ≈ 11,600 / s\nrecords over 10 years: 100M × 365 × 10 = 365 billion\nstorage (100 bytes each): ≈ 36.5 TB'),
        p("How long must the short code be? With 62 possible characters, length 7 gives $62^7$ ≈ 3.5 trillion codes, comfortably more than 365 billion. So we need **7 characters**."),
        h('Step 2 - Propose high-level design and get buy-in'),
        h3('API'),
        table(['Endpoint', 'Purpose'], [
          ['`POST /api/v1/data/shorten` body `{ longUrl }`', 'returns the short URL'],
          ['`GET /{shortCode}`', 'returns an HTTP redirect to the long URL'],
        ]),
        h3('301 or 302?'),
        ul(
          "**301 Moved Permanently**: browsers cache the redirect, so later visits skip our servers. Less load.",
          "**302 Found** (temporary): every visit hits our servers, which allows **click analytics**."
        ),
        flow({ nodes: { b: [0, 0, 'Browser', 'client'], lb: [1, 0, 'Load balancer'], ws: [2, 0, 'Web servers'], cache: [2, 1.3, 'Cache\nshort → long', 'cache'], db: [3.2, 0, 'Database\nshort ↔ long', 'db'] },
          edges: [['b', 'lb', 'GET /zn9edcu'], ['lb', 'ws'], ['ws', 'cache', 'lookup', 'both'], ['ws', 'db', 'on miss', 'both']], ux: 175 }),
        h('Step 3 - Design deep dive'),
        h3('Data model'),
        p("A single table is enough: `id (PK) | short_url | long_url`, with an index on `long_url` if we want to return an existing code for a repeated URL."),
        h3('Option A: hash + collision resolution'),
        p("Hash the long URL (e.g. CRC32, MD5, SHA-1) and take the first 7 characters. Collisions are possible, so check the database and, on a collision, append a predefined string and hash again. A Bloom filter can make the \"does this code exist?\" check cheap."),
        h3('Option B: base-62 conversion of a unique ID'),
        p("Generate a unique numeric ID (see [Unique ID Generator](#/system-design-interview/design-a-unique-id-generator)), then write that number in **base 62**. No collisions are possible, though codes are guessable and their length grows with the ID."),
        code({ py: `
          ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

          def to_base62(n: int) -> str:
              if n == 0:
                  return ALPHABET[0]
              digits = []
              while n > 0:
                  n, r = divmod(n, 62)
                  digits.append(ALPHABET[r])
              return ''.join(reversed(digits))

          def from_base62(s: str) -> int:
              n = 0
              for c in s:
                  n = n * 62 + ALPHABET.index(c)
              return n
          `, java: `
          class Base62 {
              static final String ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

              static String encode(long n) {
                  if (n == 0) return "0";
                  StringBuilder sb = new StringBuilder();
                  while (n > 0) {
                      sb.append(ALPHABET.charAt((int) (n % 62)));
                      n /= 62;
                  }
                  return sb.reverse().toString();
              }

              static long decode(String s) {
                  long n = 0;
                  for (char c : s.toCharArray()) n = n * 62 + ALPHABET.indexOf(c);
                  return n;
              }
          }
          ` }),
        table(['', 'Hash + collision resolution', 'Base-62 of unique ID'], [
          ['Length', 'fixed (7)', 'grows with the ID'],
          ['Needs an ID generator', 'no', 'yes'],
          ['Collisions', 'possible, must check', 'impossible'],
          ['Predictable next code', 'no', 'yes (security concern)'],
        ]),
        h3('Shortening flow'),
        ol(
          "If the long URL is already in the database, return its existing short code.",
          "Otherwise generate a new ID, convert it to base 62, and store `(id, short, long)`."
        ),
        h3('Redirect flow'),
        p("Reads dominate, so put a cache (short → long) in front of the database. On a request: check the cache; on a miss, read the database and fill the cache; return a 301/302."),
        h('Step 4 - Wrap up'),
        ul(
          "Rate-limit the shorten endpoint to stop abuse.",
          "Stateless web tier scales horizontally; replicate and shard the database by ID.",
          "Analytics: log clicks to a queue for an analytics pipeline (requires 302).",
          "Custom aliases and expiry dates are easy extensions."
        ),
      ],
    },

    {
      id: 'design-a-web-crawler',
      title: 'Design A Web Crawler',
      body: [
        p("A **web crawler** starts from some seed URLs, downloads the pages, extracts the links they contain, and repeats. Crawlers power search engine indexing, web archiving, data mining and copyright monitoring."),
        h('Step 1 - Understand the problem and establish design scope'),
        talk(['Candidate', 'What is the crawler for?'], ['Interviewer', 'Search engine indexing.'],
          ['Candidate', 'How many pages per month?'], ['Interviewer', '1 billion.'],
          ['Candidate', 'HTML only?'], ['Interviewer', 'Yes.'],
          ['Candidate', 'Should we handle pages that change, and duplicate content?'], ['Interviewer', 'Recrawl updated pages over time; ignore duplicate content.']),
        h3('Requirements and estimates'),
        ul(
          "**Scalability**: billions of pages, so crawl in parallel.",
          "**Robustness**: survive bad HTML, unresponsive servers, crashes and spider traps.",
          "**Politeness**: don't flood any single website.",
          "**Extensibility**: easy to add new content types later."
        ),
        state('1B pages / month ≈ 400 pages / s (peak ≈ 800)\naverage page 500 KB → 500 TB / month → 30 PB over 5 years'),
        h('Step 2 - Propose high-level design and get buy-in'),
        flow({ nodes: {
          seed: [0, 0, 'Seed URLs', 'note'], fr: [1, 0, 'URL frontier', 'queue'], dl: [2, 0, 'HTML downloader'], dns: [2, 1.2, 'DNS resolver', 'ext'],
          parse: [3, 0, 'Content parser'], seen: [3, 1.2, 'Content seen?', 'cache'], store: [4, 1.2, 'Content storage', 'db'],
          ext: [4, 0, 'Link extractor'], filt: [4, 2.4, 'URL filter'], useen: [2.6, 2.4, 'URL seen?', 'cache'], ustore: [1, 2.4, 'URL storage', 'db'] },
          edges: [['seed', 'fr'], ['fr', 'dl'], ['dl', 'dns', '', 'both'], ['dl', 'parse'], ['parse', 'seen'], ['seen', 'store'], ['parse', 'ext'], ['ext', 'filt'], ['filt', 'useen'], ['useen', 'ustore'], ['useen', 'fr', 'new URLs']],
          ux: 160, bw: 128 }),
        ul(
          "**URL frontier**: the queue of URLs still to download.",
          "**HTML downloader**: fetches pages, consulting a DNS resolver (with its own cache, since DNS lookups are slow).",
          "**Content parser**: validates and parses pages; malformed pages are discarded.",
          "**Content seen?**: detects duplicate pages by hashing their content (about 30% of the web is duplicated).",
          "**Link extractor** + **URL filter**: pull out links, normalise relative URLs, and drop excluded types and blacklisted sites.",
          "**URL seen?**: a Bloom filter or hash set so the same URL isn't queued twice."
        ),
        h('Step 3 - Design deep dive'),
        h3('BFS, not DFS'),
        p("The web is a graph. DFS can go infinitely deep, so crawlers use BFS through the frontier. Plain BFS has problems, though: most links on a page point to the **same host**, so a naive crawler would hammer one site (impolite), and BFS treats all pages equally even though some matter more."),
        h3('The URL frontier'),
        ul(
          "**Politeness**: map each host to its own FIFO queue, and assign each queue to one worker thread that waits between requests to that host.",
          "**Priority**: a prioritiser scores URLs (PageRank, traffic, update frequency) and places them into priority queues; a selector picks higher-priority queues more often.",
          "**Freshness**: recrawl pages based on how often they change; important pages more often.",
          "**Storage**: the frontier holds hundreds of millions of URLs, so keep most of it on disk with in-memory buffers for enqueue/dequeue."
        ),
        h3('Downloader details'),
        ul(
          "Respect **robots.txt**, which lists the paths a site allows crawlers to fetch; cache it per host.",
          "Distribute crawl jobs across many servers, each running many threads; place crawlers close to the hosts they crawl.",
          "Use short timeouts so slow servers don't stall workers."
        ),
        h3('Robustness'),
        ul(
          "Consistent hashing to spread hosts across downloaders.",
          "Save crawl state so a crash doesn't restart everything.",
          "Avoid **spider traps** (e.g. infinitely deep calendars) by capping URL length and depth per site."
        ),
        h('Step 4 - Wrap up'),
        ul(
          "Server-side rendering for JavaScript-heavy pages.",
          "Filtering spam and low-quality pages.",
          "Replicating and sharding the storage layer; monitoring crawl rates and error rates."
        ),
      ],
    },

    {
      id: 'design-a-notification-system',
      title: 'Design A Notification System',
      body: [
        p("A notification system sends alerts to users through **push notifications** (iOS, Android), **SMS** and **email**: breaking news, payment receipts, reminders, product updates."),
        h('Step 1 - Understand the problem and establish design scope'),
        talk(['Candidate', 'Which notification types?'], ['Interviewer', 'Push, SMS and email.'],
          ['Candidate', 'Real time?'], ['Interviewer', 'Soft real time: as soon as possible, slight delays are fine under load.'],
          ['Candidate', 'Who triggers notifications?'], ['Interviewer', 'Client apps and scheduled jobs on the server side.'],
          ['Candidate', 'Can users opt out?'], ['Interviewer', 'Yes.'],
          ['Candidate', 'Volume?'], ['Interviewer', '10M push, 1M SMS and 5M emails per day.']),
        h('Step 2 - Propose high-level design and get buy-in'),
        h3('Third-party providers'),
        p("We don't deliver to devices directly. Each channel goes through a provider: **APNs** for iOS, **FCM** for Android, an SMS provider, and an email provider. Each device registers a **device token** with our backend so we know where to send pushes."),
        h3('Contact info'),
        p("At signup or app install, store each user's email, phone number and device tokens. One user can have many devices: `user(id, email, phone)` and `device(id, user_id, token, last_logged_in)`."),
        h3('Improved design'),
        p("A naive single notification server is a single point of failure and hard to scale. A better design splits it up:"),
        flow({ nodes: {
          svc: [0, 1, 'Services\n(billing, shipping…)', 'client'], ns: [1, 1, 'Notification\nservers'], db: [1, 2.3, 'Users, devices,\nsettings', 'db'], cache: [1, -0.3, 'Cache', 'cache'],
          q1: [2, 0, 'iOS queue', 'queue'], q2: [2, 1, 'SMS queue', 'queue'], q3: [2, 2, 'Email queue', 'queue'],
          w1: [3, 0, 'Workers'], w2: [3, 1, 'Workers'], w3: [3, 2, 'Workers'],
          p1: [4, 0, 'APNs', 'ext'], p2: [4, 1, 'SMS provider', 'ext'], p3: [4, 2, 'Email provider', 'ext'] },
          edges: [['svc', 'ns', 'send API'], ['ns', 'db', '', 'both'], ['ns', 'cache', '', 'both'], ['ns', 'q1'], ['ns', 'q2'], ['ns', 'q3'], ['q1', 'w1'], ['q2', 'w2'], ['q3', 'w3'], ['w1', 'p1'], ['w2', 'p2'], ['w3', 'p3']],
          ux: 160, bw: 124 }),
        ul(
          "**Notification servers** expose an internal API, validate requests, fetch user data and settings (cached), and put messages on queues.",
          "**One queue per channel**, so an outage at one provider doesn't block the others.",
          "**Workers** pull messages and call the providers, retrying on failure."
        ),
        h('Step 3 - Design deep dive'),
        h3('Reliability'),
        ul(
          "**Never lose a notification**: persist each one in a notification log before sending; workers retry from the log.",
          "**Exactly once is impossible in general**. Deliver at least once and **deduplicate** by event ID: if the ID was seen recently, drop it."
        ),
        h3('More components'),
        ul(
          "**Templates** keep formats consistent and reduce mistakes: \"Your order {orderId} has shipped\".",
          "**Notification settings** per user and channel; check opt-in before sending.",
          "**Rate limiting** per user, so people don't get flooded and turn notifications off.",
          "**Retry** with backoff when a provider fails; alert engineers if failures persist.",
          "**Security**: only authenticated clients (app key + secret) may call the send API.",
          "**Monitoring**: queue depth is the key metric; large backlogs mean you need more workers.",
          "**Event tracking**: record opens and clicks for analytics."
        ),
        h('Step 4 - Wrap up'),
        p("The design is decoupled by message queues, scales each channel independently, and adds reliability (logs, retries, dedup), user control (settings, rate limits) and observability around the core send path."),
      ],
    },
  ]);
})();
