(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, code, state, pre } = K;

  K.chapters('system-design-interview', [
    {
      id: 'proximity-service',
      title: 'Proximity Service',
      body: [
        p("A **proximity service** finds nearby places, such as restaurants, petrol stations or hotels, around a user's location. It powers \"near me\" searches in review and map apps."),
        h('Step 1 - Understand the problem and establish design scope'),
        talk(['Candidate', 'Can users choose the search radius?'], ['Interviewer', 'Yes: 0.5, 1, 2, 5 or 20 km.'],
          ['Candidate', 'Can business owners add or update listings? Do changes need to show up immediately?'], ['Interviewer', 'Yes, but changes may appear the next day.'],
          ['Candidate', 'Should results update as the user moves?'], ['Interviewer', 'No need: users search from a location.'],
          ['Candidate', 'Scale?'], ['Interviewer', '100 million DAU and 200 million businesses.']),
        state('search QPS = 100M users × 5 searches / 10^5 s ≈ 5,000 QPS\nbusiness data: 200M × ~1 KB ≈ 200 GB (+ index)'),
        p("The workload is **read-heavy** with rare writes, which points to caching and read replicas."),
        h('Step 2 - Propose high-level design and get buy-in'),
        table(['API', 'Purpose'], [
          ['`GET /v1/search/nearby?lat=&lng=&radius=`', 'list of nearby businesses (paginated)'],
          ['`GET/POST/PUT/DELETE /v1/businesses/{id}`', 'business details and owner updates'],
        ]),
        flow({ nodes: { c: [0, 0.6, 'Mobile / web', 'client'], lb: [1, 0.6, 'Load balancer'], lbs: [2, 0, 'Location-based\nservice (LBS)'], bs: [2, 1.2, 'Business service'],
          rep: [3.2, 0, 'Read replicas\n+ geo index', 'db'], pri: [3.2, 1.2, 'Primary DB', 'db'], cache: [1.6, 2.2, 'Cache\ngeohash → IDs', 'cache'] },
          edges: [['c', 'lb'], ['lb', 'lbs', '/search/nearby'], ['lb', 'bs', '/businesses'], ['lbs', 'rep'], ['bs', 'pri', 'writes'], ['pri', 'rep', 'replicate', 'dash'], ['lbs', 'cache', '', 'both']], ux: 165 }),
        p("The **location-based service** is stateless and read-only, so it scales by adding servers. The **business service** handles writes and detail reads."),
        h('Step 3 - Design deep dive: finding nearby businesses'),
        p("A naive SQL query `WHERE lat BETWEEN … AND lng BETWEEN …` can use only one index efficiently, so it scans a big strip of the map. Geospatial indexes divide the map into cells so a search touches only a few small cells."),
        table(['Index', 'How it works', 'Notes'], [
          ['**Even grid**', 'fixed-size cells', 'uneven: a cell in a city has thousands of businesses, one in the ocean has none'],
          ['**Geohash**', 'recursively split the world into quadrants, encode as a base-32 string; longer string = smaller cell', 'shared prefix ≈ nearby; easy to store in any DB; boundary issues'],
          ['**Quadtree**', 'in-memory tree; split a cell into 4 when it holds more than k businesses', 'adapts to density; must be rebuilt / updated on each server'],
          ['**Google S2 / H3**', 'map the sphere onto a Hilbert curve / hexagons', 'precise, good for geofencing'],
        ]),
        h3('Geohash'),
        p("Each additional character narrows the cell. Pick the precision whose cell size matches the radius: about 6 characters (≈1.2 km × 0.6 km) for a 1 km search."),
        table(['Geohash length', 'Cell size (approx.)', 'Radius it suits'], [['4', '39 km × 20 km', '20 km'], ['5', '4.9 km × 4.9 km', '2-5 km'], ['6', '1.2 km × 0.6 km', '0.5-1 km']]),
        code({ py: `
          BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"

          def geohash(lat: float, lng: float, precision: int = 6) -> str:
              lat_range, lng_range = [-90.0, 90.0], [-180.0, 180.0]
              bits, bit_count, even, out = 0, 0, True, []
              while len(out) < precision:
                  rng, val = (lng_range, lng) if even else (lat_range, lat)
                  mid = (rng[0] + rng[1]) / 2
                  if val >= mid:
                      bits = (bits << 1) | 1
                      rng[0] = mid
                  else:
                      bits <<= 1
                      rng[1] = mid
                  even = not even
                  bit_count += 1
                  if bit_count == 5:          # 5 bits per base-32 character
                      out.append(BASE32[bits])
                      bits, bit_count = 0, 0
              return "".join(out)
          `, java: `
          class Geohash {
              static final String BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

              static String encode(double lat, double lng, int precision) {
                  double[] latR = {-90, 90}, lngR = {-180, 180};
                  StringBuilder out = new StringBuilder();
                  int bits = 0, count = 0;
                  boolean even = true;
                  while (out.length() < precision) {
                      double[] r = even ? lngR : latR;
                      double v = even ? lng : lat, mid = (r[0] + r[1]) / 2;
                      if (v >= mid) { bits = (bits << 1) | 1; r[0] = mid; }
                      else { bits <<= 1; r[1] = mid; }
                      even = !even;
                      if (++count == 5) { out.append(BASE32.charAt(bits)); bits = 0; count = 0; }
                  }
                  return out.toString();
              }
          }
          ` }),
        note("**Boundary issue**: two places right next to each other can sit on opposite sides of a cell edge and share no prefix. Always search the user's cell **plus its 8 neighbours**, then filter by real distance and sort."),
        h3('Storage'),
        p("Store a table `geohash_index(geohash, business_id)` with each business at the precisions you support, or keep the index in Redis: `geohash → list of business IDs`. The whole index is only a few GB, so it fits in memory and replicates easily. Business details are cached separately by ID."),
        h('Step 4 - Wrap up'),
        ul("Increase the radius automatically when too few results are found.", "Filters (open now, price) applied after the geo lookup.", "Multi-region deployment close to users; daily batch rebuild of the index for business updates."),
      ],
    },

    {
      id: 'nearby-friends',
      title: 'Nearby Friends',
      body: [
        p("**Nearby friends** shows which of your friends are close to you **right now**, with distances that update as everyone moves. Unlike a proximity service, locations change constantly, so this is a real-time, write-heavy problem."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("Show friends within 5 miles, with distance and last-updated time; refresh every ~30 seconds.", "Only friends who opted in are visible; inactive friends disappear after 10 minutes.", "100 million DAU, 10% online at once; each user has up to 400 friends.", "Location history is stored for analytics/ML."),
        state('10M concurrent users, update every 30 s\nlocation updates = 10M / 30 ≈ 334,000 per second\neach update fans out to online friends (≈10% of 400 = 40)\n→ ~14M forwarded updates per second'),
        h('Step 2 - Propose high-level design and get buy-in'),
        p("Peer-to-peer is impractical on mobile. Instead, clients keep a **WebSocket** to the backend; the server receives updates and pushes them to each subscribed friend."),
        flow({ nodes: { a: [0, 0.6, 'User A', 'client'], ws: [1.2, 0.6, 'WebSocket\nservers'], cache: [2.4, 0, 'Location cache\n(TTL 10 min)', 'cache'], hist: [2.4, 1.2, 'Location history\nDB', 'db'],
          ps: [3.6, 0.6, 'Redis pub/sub\nchannel per user', 'queue'], api: [1.2, 1.8, 'API servers\nfriends, profile'], b: [4.8, 0.6, 'Friends\' WS servers', 'client'] },
          edges: [['a', 'ws', 'location', 'both'], ['ws', 'cache'], ['ws', 'hist'], ['ws', 'ps', 'publish'], ['ps', 'b', 'subscribers'], ['a', 'api', 'HTTP']], ux: 160, bw: 128 }),
        ol(
          "A's client sends its location over the WebSocket.",
          "The WebSocket server stores it in the **location cache** (latest only, with TTL) and appends it to the history DB.",
          "It publishes the update to **A's channel** in the pub/sub system.",
          "Every online friend's WebSocket handler is subscribed to A's channel. Each handler computes the distance to its own user and forwards the update only if it's within range."
        ),
        h('Step 3 - Design deep dive'),
        ul(
          "**WebSocket servers** are stateful; drain connections gracefully before removing a server, and use a load balancer that supports long-lived connections.",
          "**Location cache**: the key is the user ID and the value is `(lat, lng, timestamp)`, with a TTL. It is sharded by user ID, and if it's lost, clients simply resend.",
          "**Pub/sub**: millions of channels are cheap in Redis (a channel with no subscribers costs little). Shard channels across a cluster using consistent hashing; manage membership with a service-discovery component. This tier is CPU-bound by message fan-out.",
          "**Adding/removing friends**: subscribe or unsubscribe the handler from that friend's channel.",
          "**Users with many friends**: cap friends at a few thousand; the load spreads across subscriber servers."
        ),
        h3('Alternative: nearby random people'),
        p("To show nearby strangers who opted in, use **geohash channels** instead of friend channels: users publish to the channel of their current geohash cell and subscribe to their cell and its neighbours."),
        h('Step 4 - Wrap up'),
        ul("Throttle updates when users are stationary.", "Privacy: easy opt-out, coarse location for long distances.", "Use Erlang/Elixir-style runtimes if millions of connections per server matter."),
      ],
    },

    {
      id: 'google-maps',
      title: 'Google Maps',
      body: [
        p("A maps product renders map tiles, finds routes between places and estimates arrival times, using live traffic. We'll design a simplified version focused on three features: **location updates**, **navigation (routing + ETA)** and **map rendering**."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("1 billion DAU; driving, walking and transit directions.", "Accurate ETAs that react to traffic; rerouting.", "Map rendering on mobile, data-efficient.", "Location data from users is used to estimate live traffic."),
        h3('Map 101'),
        ul(
          "**Tiles**: the world map is pre-rendered into 256×256-pixel images at ~21 zoom levels; each zoom level doubles the tiles in each direction. Clients download only the tiles they need.",
          "**Road graph**: intersections are nodes, roads are weighted edges. The full world graph is huge, so it's split into **routing tiles** (subgraphs per area) at several levels of detail (local streets, arterial roads, highways)."
        ),
        state('map tiles: zoom 21 ≈ 4.4 trillion tiles, but most are ocean or empty → compress heavily\nstorage ≈ a few PB for all levels, served from a CDN\nlocation updates: 1B DAU × 35 min navigation, batched every 15 s → ~millions of writes/s'),
        h('Step 2 - Propose high-level design and get buy-in'),
        flow({ nodes: { c: [0, 1, 'Mobile app', 'client'], cdn: [1.2, 0, 'CDN\nmap tiles', 'ext'], loc: [1.2, 1, 'Location service'], nav: [1.2, 2, 'Navigation service'],
          kafka: [2.4, 1, 'Location stream', 'queue'], traffic: [3.6, 0.4, 'Traffic update\nservice'], route: [2.4, 2, 'Route planner\nshortest path + ETA'], tiles: [3.6, 2, 'Routing tiles\n(object store)', 'store'], db: [3.6, 1.4, 'Traffic DB', 'db'] },
          edges: [['c', 'cdn', 'tiles'], ['c', 'loc', 'batched GPS'], ['c', 'nav', 'route request'], ['loc', 'kafka'], ['kafka', 'traffic'], ['traffic', 'db'], ['nav', 'route'], ['route', 'tiles'], ['route', 'db', 'live speeds']], ux: 160, bw: 128 }),
        ul(
          "**Location service**: clients batch GPS points (e.g. every 15 seconds) to save battery and bandwidth; points go to a stream (Kafka) consumed by traffic estimation, ML, and map-correction jobs.",
          "**Map tiles**: precomputed and served from a CDN; the client works out tile URLs from its viewport and zoom (`/tiles/{zoom}/{x}/{y}.png`) or uses vector tiles, which are smaller and scale smoothly.",
          "**Navigation**: geocode origin and destination, find candidate routes, rank them with ETA, return the top few."
        ),
        h('Step 3 - Design deep dive'),
        h3('Routing'),
        ul(
          "Run A* or Dijkstra variants on **routing tiles**, loading neighbouring tiles on demand. For long trips, climb to coarser tile levels (highways only) and drop back to detailed levels near the destination.",
          "Pre-computation techniques (contraction hierarchies) make continental routes fast.",
          "Return several routes; let the **ETA service** (ML on historical + live traffic) rank them."
        ),
        h3('Adaptive ETA and rerouting'),
        p("Track active navigation sessions by the routing tiles they pass through. When traffic changes in a tile, recompute ETAs and offer reroutes only for users whose routes use that tile, rather than for everyone."),
        h3('Delivery to clients'),
        p("Push ETA and reroute updates over a persistent connection (WebSocket or push) during navigation; fall back to polling."),
        h('Step 4 - Wrap up'),
        ul("Offline maps: download tiles and routing data per region.", "Multi-stop routes, tolls and accessibility options as routing constraints.", "Privacy: anonymise and aggregate location data used for traffic."),
      ],
    },

    {
      id: 'distributed-message-queue',
      title: 'Distributed Message Queue',
      body: [
        p("Message queues decouple producers from consumers, absorb traffic spikes and enable asynchronous processing. We'll design a distributed, durable, high-throughput queue in the style of Kafka (an append-only log with consumer groups)."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("Producers send messages to **topics**; consumers read them; messages can be **re-read** and are kept for a configurable retention (e.g. 2 weeks).", "Messages up to ~1 KB; order preserved within a partition.", "Delivery semantics configurable: at-most-once, at-least-once, exactly-once.", "High throughput (GB/s), low latency, persistent and highly available."),
        h('Step 2 - Propose high-level design and get buy-in'),
        p("A topic is split into **partitions**, each an ordered, append-only log stored on a **broker**. Messages with the same key go to the same partition (keeping their order). Consumers in a **consumer group** split partitions among themselves, so each partition is read by one consumer of the group."),
        flow({ nodes: { p1: [0, 0, 'Producer', 'client'], p2: [0, 1.2, 'Producer', 'client'], b1: [1.3, 0, 'Broker 1\npartitions 0, 2', 'store'], b2: [1.3, 1.2, 'Broker 2\npartitions 1, 3', 'store'],
          zk: [1.3, 2.4, 'Coordination\nmetadata, leaders', 'ext'], c1: [2.6, 0, 'Consumer A\n(group X)', 'client'], c2: [2.6, 1.2, 'Consumer B\n(group X)', 'client'] },
          edges: [['p1', 'b1'], ['p2', 'b2'], ['p1', 'b2', '', 'dash'], ['b1', 'c1', 'pull'], ['b2', 'c2', 'pull'], ['b1', 'zk', '', 'dash'], ['b2', 'zk', '', 'dash']], ux: 175 }),
        h('Step 3 - Design deep dive'),
        h3('Storage: an append-only log'),
        ul(
          "Each partition is a sequence of **segment files**; new messages are appended to the active segment. Sequential disk writes are very fast, and the OS page cache makes recent reads cheap.",
          "Each message has an **offset** (its position in the partition). Consumers track the offset they've processed.",
          "Old segments are deleted after the retention period (or compacted, keeping only the latest value per key)."
        ),
        h3('Producer flow'),
        ul("A routing layer (in the producer client) maps the key to a partition and sends it to that partition's **leader** broker.", "Batch messages to increase throughput (at a small latency cost).", "`acks` setting: 0 (fire and forget), 1 (leader wrote it), all (all in-sync replicas wrote it: most durable)."),
        h3('Consumer flow'),
        ul("**Pull** model: consumers fetch at their own pace and can rewind.", "Committed offsets are stored (e.g. in an internal topic) so a restarted consumer resumes where it left off.", "**Rebalancing**: when consumers join or leave, a coordinator reassigns partitions in the group."),
        h3('Replication'),
        p("Each partition has replicas on different brokers: one leader and several followers that copy its log. The **in-sync replica (ISR)** set contains followers that are caught up. If the leader fails, a member of the ISR becomes leader, so acknowledged messages aren't lost."),
        h3('Delivery semantics'),
        table(['Semantics', 'How', 'Use when'], [
          ['At-most-once', 'commit offset before processing; producer doesn\'t retry', 'losing some data is fine (metrics)'],
          ['At-least-once', 'commit after processing; producer retries', 'most systems; consumers must be idempotent'],
          ['Exactly-once', 'idempotent producers + transactions across write and offset commit', 'payments, financial ledgers'],
        ]),
        h('Step 4 - Wrap up'),
        ul("Scale by adding brokers and partitions (partitions limit consumer parallelism).", "Message filtering with tags, delayed/scheduled messages, and dead-letter topics.", "Monitoring: consumer lag is the key health metric."),
      ],
    },

    {
      id: 'metrics-monitoring-and-alerting-system',
      title: 'Metrics Monitoring and Alerting System',
      body: [
        p("A metrics system collects numbers like CPU usage, request rates and error counts from thousands of servers, stores them as time series, shows dashboards, and alerts engineers when something goes wrong."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("Internal system for a large company: 1,000 server pools × 100 machines × 100 metrics ≈ **10 million time series**.", "Keep data for 1 year: full resolution for 7 days, then downsample (1-minute for 30 days, 1-hour after).", "Alerting via email, chat and paging; dashboards with low query latency.", "Out of scope: log monitoring and distributed tracing."),
        h('Data model'),
        p("A **time series** is identified by a metric name plus labels, and holds `(timestamp, value)` points:"),
        pre(`
          cpu.load{host="i631", env="prod"}   1700000000  0.29
                                              1700000010  0.33
        `),
        p("The workload is **write-heavy** and constant; reads are bursty (dashboards and alert queries) and mostly touch recent data."),
        h('Step 2 - Propose high-level design and get buy-in'),
        flow({ nodes: { src: [0, 0.6, 'Metrics sources\nservers, apps', 'client'], col: [1.2, 0.6, 'Collectors'], q: [2.4, 0.6, 'Kafka', 'queue'], cons: [3.6, 0.6, 'Stream\nprocessors'],
          tsdb: [4.8, 0.6, 'Time-series DB', 'db'], qs: [3.6, 1.8, 'Query service', 'service'], dash: [2.4, 2.4, 'Dashboards', 'client'], alert: [4.8, 1.8, 'Alerting system'], ch: [4.8, 3, 'Email / chat /\npager', 'ext'] },
          edges: [['src', 'col', 'push / pull'], ['col', 'q'], ['q', 'cons'], ['cons', 'tsdb'], ['qs', 'tsdb'], ['dash', 'qs'], ['alert', 'qs', 'rules'], ['alert', 'ch']], ux: 150, bw: 124 }),
        h('Step 3 - Design deep dive'),
        h3('Pull vs. push collection'),
        table(['', 'Pull (collector scrapes /metrics)', 'Push (agents send)'], [
          ['Health check', 'easy: a failed scrape means the target is down', 'harder: silence might mean no data'],
          ['Short-lived jobs', 'may finish before being scraped', 'push works naturally'],
          ['Network', 'collectors need to reach every target', 'works behind firewalls'],
        ]),
        p("Both are used in practice. Put **Kafka** between collection and storage so storage outages don't lose data and consumers can scale independently."),
        h3('Storage'),
        p("General-purpose databases struggle with this write rate. **Time-series databases** (Prometheus-style, InfluxDB, etc.) store each series compactly: delta-of-delta encoding for timestamps and XOR-compression for values often shrink a point to a couple of bytes."),
        ul("**Downsampling** reduces old data volume.", "**Cold storage** for rarely accessed old data.", "Index labels so queries like `sum by (host) of cpu.load{env=\"prod\"}` are fast."),
        h3('Alerting'),
        ol("Load alert rules (e.g. `error_rate > 5% for 5 minutes`).", "Evaluate them on an interval against the query service.", "Deduplicate and group alerts, apply silences, and retry delivery.", "Store alert state so restarts don't re-fire everything."),
        h('Step 4 - Wrap up'),
        ul("Use off-the-shelf visualisation (e.g. Grafana-style dashboards) rather than building your own.", "Cache query results for popular dashboards.", "Monitor the monitoring system from outside it."),
      ],
    },
  ]);
})();
