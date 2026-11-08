(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, code, state, pre } = K;

  K.chapters('system-design-interview', [
    {
      id: 'real-time-gaming-leaderboard',
      title: 'Real-time Gaming Leaderboard',
      body: [
        p("A mobile game shows a **leaderboard** of the top players for the current month, plus each player's own rank. Scores change constantly, and players expect their new rank instantly after winning a match."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("A player gets 1 point per match won; the leaderboard resets monthly.", "Show the top 10 and the current player's rank (and players around them).", "5 million DAU, 25 million MAU; each player plays ~10 matches a day."),
        state('score updates = 5M × 10 / 10^5 ≈ 500 / s  (peak ×5 ≈ 2,500 / s)\ntop-10 reads: on every game load, similar order of magnitude'),
        h('Step 2 - Propose high-level design and get buy-in'),
        table(['API', 'Purpose'], [['`POST /v1/scores` (internal, from game servers)', 'record a win'], ['`GET /v1/scores`', 'top 10'], ['`GET /v1/scores/{user_id}`', 'a player\'s rank and score']]),
        flow({ nodes: { c: [0, 0.6, 'Game client', 'client'], gs: [1.2, 0, 'Game service\nvalidates wins'], lb: [1.2, 1.2, 'Leaderboard\nservice'], redis: [2.4, 0.6, 'Redis\nsorted set', 'cache'], db: [3.6, 0.6, 'Durable store\nscores history', 'db'] },
          edges: [['c', 'gs', 'win'], ['gs', 'lb', 'update score'], ['c', 'lb', 'read board'], ['lb', 'redis', '', 'both'], ['lb', 'db', 'persist', 'dash']] }),
        note("Clients must never post their own scores: a cheater would just call the API. Only the **game server**, which decides who won, updates scores."),
        h('Why not a SQL `ORDER BY`?'),
        p("Computing a rank with `SELECT COUNT(*) FROM scores WHERE score > :mine` scans millions of rows on every request. Caching helps only briefly because scores change constantly."),
        h('Step 3 - Design deep dive: Redis sorted sets'),
        p("A **sorted set** keeps members ordered by score, implemented with a hash table plus a **skip list**, so insert, update and rank lookups take $O(\\log n)$."),
        code({ text: `
          ZINCRBY leaderboard_2026_11 1 "player_42"         # a win: O(log n)
          ZREVRANGE leaderboard_2026_11 0 9 WITHSCORES       # top 10
          ZREVRANK leaderboard_2026_11 "player_42"          # player's rank (0-based)
          ZREVRANGE leaderboard_2026_11 357 367 WITHSCORES   # players around rank 362
          ` }),
        ul("Use one sorted set per month (`leaderboard_YYYY_MM`); last month's set is archived.", "Store player profiles separately and cache those for the top 10.", "Persist scores in a database too (sorted sets live in memory; replicas and snapshots help, but the DB is the source of truth for recovery)."),
        h3('Ties'),
        p("Break ties by who reached the score first: encode `score × 10^{10} + (MAX_TS - timestamp)` as the sorted-set score, or keep a secondary ordering hash."),
        h3('Scaling to 500M users'),
        ul(
          "**Fixed partitions by score range** (e.g. shard 1 holds scores 1-100): the top 10 is in the highest shard; a rank is the user's rank within their shard plus the sizes of all higher shards. Moving users between shards when scores cross boundaries adds complexity.",
          "**Hash partitions**: spread users evenly, but top-10 requires scatter-gather across shards and exact rank is expensive; approximate ranks may be acceptable."
        ),
        h('Step 4 - Wrap up'),
        ul("Alternative store: a NoSQL table with a write-sharded index on score.", "Faster updates with in-game events streamed through a queue.", "Leaderboards per country or friends list as separate sets."),
      ],
    },

    {
      id: 'payment-system',
      title: 'Payment System',
      body: [
        p("An e-commerce payment system takes money from buyers (pay-in), records it correctly, and pays sellers (pay-out). Money demands **correctness** above everything: no double charges, no lost payments, and books that always balance."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("Pay-in from buyers via credit cards through a third-party **payment service provider (PSP)**; we never store raw card numbers.", "Pay-out to sellers on a schedule.", "1 million transactions a day (≈10 TPS, low throughput); reconciliation with PSPs; handle failures and retries safely."),
        h('Step 2 - Propose high-level design and get buy-in'),
        flow({ nodes: { buyer: [0, 0.6, 'Buyer checkout', 'client'], ps: [1.2, 0.6, 'Payment service'], ex: [2.4, 0, 'Payment executor'], psp: [3.6, 0, 'PSP\n(card networks)', 'ext'],
          ledger: [2.4, 1.2, 'Ledger\ndouble-entry', 'db'], wallet: [3.6, 1.2, 'Wallet\nseller balances', 'db'], pdb: [1.2, 1.8, 'Payment DB\norders, status', 'db'] },
          edges: [['buyer', 'ps', 'payment event'], ['ps', 'ex'], ['ex', 'psp', 'charge'], ['ps', 'ledger'], ['ps', 'wallet'], ['ps', 'pdb']] }),
        ol(
          "The buyer places an order; a **payment event** (possibly covering several orders from different sellers) is sent to the payment service and stored.",
          "The **payment executor** sends each payment order to the PSP.",
          "On success, the **wallet** credits the seller's balance and the **ledger** records the movement.",
          "Pay-out jobs later transfer seller balances to their bank accounts."
        ),
        h3('Hosted payment pages'),
        p("To stay out of the scope of strict card-data regulations, the checkout page embeds the PSP's hosted form (or redirects to it). We send the PSP a payment request with a **nonce/idempotency key** and receive a token; the card details never touch our servers. The PSP notifies us of the result through a **webhook**."),
        h('Step 3 - Design deep dive'),
        h3('Double-entry ledger'),
        p("Every transaction writes **two entries of equal amount**: a debit on one account and a credit on another. The sum of all entries is always zero, which makes errors detectable and the history auditable."),
        table(['Account', 'Debit', 'Credit'], [['buyer', '$10', ''], ['seller', '', '$10']]),
        h3('Exactly-once: retries + idempotency'),
        ul(
          "Network calls fail ambiguously (did the charge go through?), so we **retry** with exponential backoff, which gives at-least-once.",
          "The PSP and our own APIs accept an **idempotency key** (e.g. the payment order ID): a repeated request with the same key returns the original result instead of charging again. Together: exactly-once.",
          "Payments that keep failing go to a **dead-letter queue** for investigation."
        ),
        h3('Consistency across services'),
        ul("Internal services communicate asynchronously through a durable queue; each step records its state so a crash resumes rather than repeats.", "Long workflows (charge → credit wallet → update ledger) use a **saga** with compensating actions (refund) instead of distributed locks."),
        h3('Reconciliation'),
        p("Every night, compare our ledger with the PSP's settlement files. Mismatches are classified: fixable automatically, fixable manually by finance, or unknown and escalated. This is the final safety net against bugs and missed webhooks."),
        h3('Security and fraud'),
        ul("HTTPS everywhere, encrypted storage, strict access control and audit logs.", "Tokenised cards only; 3-D Secure for risky transactions.", "Fraud detection (rules + ML) before authorising payments."),
        h('Step 4 - Wrap up'),
        ul("Handle payment status polling when webhooks are delayed.", "Multiple currencies and PSPs (routing by cost and success rate).", "Monitoring: success rate per PSP, latency, reconciliation mismatches."),
      ],
    },

    {
      id: 'digital-wallet',
      title: 'Digital Wallet',
      body: [
        p("A **digital wallet** holds balances and supports transfers between users of the same platform (balance-to-balance transfers). The difficulty is moving money between accounts that live on **different database shards** at very high throughput while never losing or creating money."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("Transfer money between two wallets on the platform.", "**1,000,000 transfers per second**.", "Strict correctness (transactional guarantees), and the ability to reconstruct historical balances for audits."),
        state('each transfer = 2 balance updates (debit + credit) → 2M operations / s\nif one DB node handles ~1,000 TPS → ~2,000 nodes'),
        h('Step 2 - Propose high-level design and get buy-in'),
        p("Balances are sharded by account ID across many nodes. A transfer between accounts on different shards needs an **atomic distributed transaction**."),
        table(['Approach', 'How', 'Trade-off'], [
          ['Two-phase commit (2PC)', 'a coordinator asks all shards to prepare, then commit', 'locks held during the protocol; coordinator is a single point of failure'],
          ['Try-Confirm/Cancel (TC/C)', 'reserve funds (try), then confirm or cancel as separate local transactions', 'no long locks; must handle out-of-order and partial failures'],
          ['Saga', 'run steps in order; compensate on failure', 'simple, linear; intermediate states visible'],
          ['**Event sourcing**', 'store immutable commands/events; derive state by replaying', 'full audit history and reproducibility'],
        ]),
        h('Step 3 - Design deep dive: event sourcing'),
        flow({ nodes: { cmd: [0, 0.6, 'Command\n"transfer $1 A→C"', 'client'], val: [1.2, 0.6, 'Validate\n(state machine)'], ev: [2.4, 0.6, 'Event log\nappend-only', 'queue'], st: [3.6, 0, 'State\nbalances', 'db'], snap: [3.6, 1.2, 'Snapshots', 'store'] },
          edges: [['cmd', 'val'], ['val', 'ev', 'events'], ['ev', 'st', 'apply'], ['st', 'snap', 'periodic', 'dash']] }),
        ul(
          "**Commands** (requests) are validated against current state; valid commands produce **events** (facts): `A debited $1`, `C credited $1`.",
          "Events are appended to an immutable log; applying them in order produces the state. Replaying the same events always gives the same state, so balances at any time in the past can be reconstructed and audited.",
          "**Snapshots** of state avoid replaying from the beginning.",
          "For speed, keep the event log on local disk (memory-mapped files) and state in memory or an embedded store, partitioned by account."
        ),
        h3('Reliability'),
        p("A single node holding a partition is a single point of failure. Replicate the event log with a consensus protocol such as **Raft** across several nodes: a leader appends events, followers replicate, and a new leader is elected on failure. Because state is derived deterministically from events, every replica computes the same balances."),
        h3('Cross-partition transfers'),
        p("Combine event sourcing with a **saga** or TC/C coordinated by a separate transaction service: debit A's partition, then credit C's partition, with compensation on failure. Each step is itself an event, so the whole distributed transaction is auditable."),
        h('Step 4 - Wrap up'),
        ul("Read path via CQRS: build read-optimised views (balances, statements) from the event stream.", "Idempotency keys on every command.", "Throughput comes from many partitions processing in parallel, each a fast sequential log."),
      ],
    },

    {
      id: 'stock-exchange',
      title: 'Stock Exchange',
      body: [
        p("A stock exchange **matches buy and sell orders** for securities. It must be extremely fast (microseconds to milliseconds), perfectly fair (orders processed in strict sequence), and never lose an order."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("Order types: limit orders (buy/sell at a price or better); cancellation.", "Real-time market data: order book and trades.", "100 symbols, billions of orders per day; trading hours only; risk checks (e.g. max 1M shares per user per day)."),
        h('Step 2 - Propose high-level design and get buy-in'),
        flow({ nodes: { broker: [0, 0.6, 'Broker / client', 'client'], gw: [1.2, 0.6, 'Client gateway\nauth, rate limit'], om: [2.4, 0.6, 'Order manager\nrisk + wallet checks'], seq: [3.6, 0.6, 'Sequencer'],
          me: [4.8, 0.6, 'Matching engine\norder books'], md: [4.8, 1.8, 'Market data\npublisher'], rep: [3.6, 1.8, 'Reporter\n& settlement', 'db'] },
          edges: [['broker', 'gw', 'order'], ['gw', 'om'], ['om', 'seq'], ['seq', 'me'], ['me', 'md', 'trades, book'], ['me', 'rep', 'executions'], ['rep', 'broker', 'fills', 'dash']], ux: 150, bw: 124 }),
        ul(
          "**Critical path** (latency-sensitive): gateway → order manager → sequencer → matching engine. Everything else is off the critical path.",
          "**Sequencer** stamps every inbound order and outbound execution with a sequence number. This guarantees a single deterministic order, which makes the engine replayable and auditable.",
          "**Matching engine** keeps an **order book** per symbol and produces executions (fills)."
        ),
        h('Step 3 - Design deep dive'),
        h3('The order book'),
        p("Bids (buy orders) sorted by price **descending**, asks (sell orders) by price **ascending**; within a price level, **first come, first served** (price-time priority). A new order matches against the best opposite prices while they cross; the remainder rests in the book."),
        pre(`
          ASKS (sell)   101.20 × 300   101.10 × 200   101.05 × 100
          ------------------------------------------------------- spread
          BIDS (buy)    101.00 × 500   100.95 × 250   100.90 × 400

          new BUY 250 @ 101.10 → fills 100 @ 101.05, 150 @ 101.10; rests nothing
        `),
        code({ py: `
          import heapq
          from collections import deque

          class OrderBook:
              """Price-time priority limit order book for one symbol."""

              def __init__(self):
                  self.bids = []      # max-heap of (-price, seq, order)
                  self.asks = []      # min-heap of (price, seq, order)
                  self.seq = 0

              def submit(self, side: str, price: float, qty: int, order_id: str):
                  """Returns a list of fills (buy_id, sell_id, price, qty)."""
                  self.seq += 1
                  fills = []
                  book, crosses = (self.asks, lambda best: best <= price) if side == "buy" else \\
                                  (self.bids, lambda best: -best >= price)
                  while qty > 0 and book and crosses(book[0][0]):
                      key, s, resting = book[0]
                      traded = min(qty, resting["qty"])
                      buy_id, sell_id = (order_id, resting["id"]) if side == "buy" else (resting["id"], order_id)
                      fills.append((buy_id, sell_id, resting["price"], traded))  # trade at resting price
                      qty -= traded
                      resting["qty"] -= traded
                      if resting["qty"] == 0:
                          heapq.heappop(book)
                  if qty > 0:  # rest the remainder in the book
                      entry = {"id": order_id, "price": price, "qty": qty}
                      if side == "buy":
                          heapq.heappush(self.bids, (-price, self.seq, entry))
                      else:
                          heapq.heappush(self.asks, (price, self.seq, entry))
                  return fills
          `, java: `
          class OrderBook {
              record Fill(String buyId, String sellId, double price, int qty) {}

              static final class Order {
                  final String id; final double price; final long seq; int qty;
                  Order(String id, double price, int qty, long seq) { this.id = id; this.price = price; this.qty = qty; this.seq = seq; }
              }

              // Best bid = highest price first; best ask = lowest price first; ties by arrival order.
              private final PriorityQueue<Order> bids = new PriorityQueue<>(
                      (a, b) -> a.price != b.price ? Double.compare(b.price, a.price) : Long.compare(a.seq, b.seq));
              private final PriorityQueue<Order> asks = new PriorityQueue<>(
                      (a, b) -> a.price != b.price ? Double.compare(a.price, b.price) : Long.compare(a.seq, b.seq));
              private long seq = 0;

              List<Fill> submit(boolean isBuy, double price, int qty, String orderId) {
                  List<Fill> fills = new ArrayList<>();
                  PriorityQueue<Order> opposite = isBuy ? asks : bids;
                  while (qty > 0 && !opposite.isEmpty()
                          && (isBuy ? opposite.peek().price <= price : opposite.peek().price >= price)) {
                      Order resting = opposite.peek();
                      int traded = Math.min(qty, resting.qty);
                      fills.add(isBuy ? new Fill(orderId, resting.id, resting.price, traded)
                                      : new Fill(resting.id, orderId, resting.price, traded));
                      qty -= traded;
                      resting.qty -= traded;
                      if (resting.qty == 0) opposite.poll();
                  }
                  if (qty > 0) (isBuy ? bids : asks).add(new Order(orderId, price, qty, ++seq));
                  return fills;
              }
          }
          ` }),
        h3('Performance'),
        ul(
          "Put the whole critical path on **one server**, single-threaded per symbol, communicating through **memory-mapped files / ring buffers** instead of network hops. No locks, no garbage-collection pauses on the hot path.",
          "Use an event-sourced design: inbound orders and outbound executions are events in a sequenced log, so the engine can be rebuilt deterministically.",
          "Market data feeds are distributed via multicast; colocation services let brokers sit physically next to the exchange."
        ),
        h3('Fault tolerance'),
        p("Run a hot standby engine that consumes the same sequenced event log and stays in lockstep. If the primary fails, the standby takes over with the identical state. Leader election (e.g. Raft) avoids two primaries."),
        h('Step 4 - Wrap up'),
        ul("Fairness: identical latency for all clients through the gateway.", "Circuit breakers that halt trading on extreme price moves.", "Settlement and clearing happen after trading, outside the critical path."),
      ],
    },

    {
      id: 'the-learning-continues',
      title: 'Where to Go From Here',
      body: [
        p("You've worked through the framework, the core building blocks and a wide range of complete designs. Here's how to keep improving."),
        h('Practise the rhythm'),
        ol(
          "Pick a design you haven't seen (a ride-sharing service, a ticketing system for concerts, a collaborative document editor).",
          "Set a 45-minute timer and go through all four steps out loud, drawing on paper or a whiteboard.",
          "Afterwards, compare with this kit: which requirements did you miss? Which trade-offs didn't you mention?"
        ),
        h('Recurring ideas to master'),
        table(['Idea', 'Seen in'], [
          ['Caching and CDNs', 'scaling, URL shortener, news feed, YouTube'],
          ['Sharding and consistent hashing', 'key-value store, chat, proximity, metadata stores'],
          ['Queues and async processing', 'notifications, crawler, ad aggregation, email'],
          ['Idempotency and exactly-once', 'payments, wallets, ad clicks, message queues'],
          ['Geospatial indexing', 'proximity service, nearby friends, maps'],
          ['Event sourcing and logs', 'digital wallet, stock exchange, message queue'],
          ['Real-time delivery (WebSocket, push)', 'chat, nearby friends, notifications'],
        ]),
        h('Learn from real systems'),
        ul("Read engineering blogs of large tech companies; they describe real trade-offs and failures.", "Read classic papers on distributed systems (storage, consensus, stream processing).", "Build small versions yourself: a rate limiter, a URL shortener, a toy key-value store with replication."),
        h('Mock interviews'),
        p("Nothing replaces practising with another person who interrupts, asks follow-ups and pushes back. Swap mock interviews with friends, and review recordings for pacing and clarity."),
      ],
    },
  ]);
})();
