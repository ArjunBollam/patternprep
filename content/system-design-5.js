(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, code, state, pre } = K;

  K.chapters('system-design-interview', [
    {
      id: 'ad-click-event-aggregation',
      title: 'Ad Click Event Aggregation',
      body: [
        p("Advertisers pay per click, and they want near-real-time numbers: clicks per ad in the last minute, top ads in the last hour. The aggregation pipeline must be **accurate** (it drives billing), fast, and resilient to late or duplicated events."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("Input: a stream of click events `(ad_id, click_timestamp, user_id, ip, country)`.", "Queries: clicks for an ad in the last M minutes; top N most-clicked ads in the last M minutes; filter by country/IP/user.", "1 billion clicks per day (peak ~50,000 QPS), 2 million ads; results within a few minutes; correctness is critical."),
        h('Step 2 - Propose high-level design and get buy-in'),
        flow({ nodes: { log: [0, 0.6, 'Click logs', 'client'], q1: [1.2, 0.6, 'Kafka\nraw clicks', 'queue'], agg: [2.4, 0.6, 'Aggregation\nservice (stream)'], q2: [3.6, 0.6, 'Kafka\naggregated', 'queue'],
          db: [4.8, 0.6, 'Aggregation DB', 'db'], raw: [1.2, 1.8, 'Raw data store\n(for replay)', 'store'], qs: [4.8, 1.8, 'Query service'], recon: [2.4, 1.8, 'Reconciliation\n(batch)'] },
          edges: [['log', 'q1'], ['q1', 'agg'], ['agg', 'q2'], ['q2', 'db'], ['q1', 'raw'], ['qs', 'db'], ['raw', 'recon'], ['recon', 'db', 'fix', 'dash']], ux: 160, bw: 124 }),
        p("Keep **both** raw events (source of truth, used for replay and audits) and aggregated results (fast queries). Queues between stages decouple them and add durability; writing aggregated results to a queue first enables exactly-once handling into the database."),
        h('Step 3 - Design deep dive'),
        h3('Aggregation as a MapReduce-style DAG'),
        ul("**Map** nodes read events and route them by `ad_id` (e.g. `ad_id % n`).", "**Aggregate** nodes count clicks per ad per minute in memory.", "**Reduce** nodes merge partial results, e.g. into a top-N heap per minute."),
        h3('Event time vs. processing time'),
        p("Aggregate by **event time** (when the click happened), not by when it arrived, or delayed events land in the wrong minute. Use a **watermark**: keep each window open a little after it ends (say 15 seconds) to catch late events. Events later than the watermark are handled by end-of-day reconciliation."),
        table(['Window', 'Used for'], [['Tumbling (fixed, non-overlapping) 1-minute', 'clicks per ad per minute'], ['Sliding (overlapping)', 'top N ads in the last M minutes']]),
        h3('Exactly-once and fault tolerance'),
        ul(
          "Duplicates come from client retries and from consumers reprocessing after a crash.",
          "Store the **upstream offset** together with the aggregation results atomically (or commit offsets only after results are acknowledged downstream), so a restart neither loses nor double-counts.",
          "Snapshot in-memory aggregation state periodically so recovery replays only a short tail of events."
        ),
        h3('Hotspots'),
        p("A popular ad can overwhelm one aggregation node. Split its key across several nodes (`ad_id#1`, `ad_id#2`, …) and merge the partial counts."),
        h('Step 4 - Wrap up'),
        ul("Reconciliation: a daily batch job recomputes totals from raw data and compares with streaming results.", "Lambda vs. Kappa architecture: one streaming path that can also replay history keeps a single codebase.", "Monitoring: latency per stage, Kafka lag, fraction of late events."),
      ],
    },

    {
      id: 'hotel-reservation-system',
      title: 'Hotel Reservation System',
      body: [
        p("A hotel chain's reservation system shows hotels and rooms, lets guests book a room type for a date range, and lets staff manage inventory. The core challenges are **correct inventory** under concurrency and **no double booking**."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("5,000 hotels, 1 million rooms; guests reserve a **room type** (not a specific room) for a date range.", "Payment at booking; cancellations allowed.", "Allow **10% overbooking** (some guests cancel).", "Booking QPS is low (a few per second), but the search/view funnel is much larger (≈100× views)."),
        h('Step 2 - Propose high-level design and get buy-in'),
        table(['API', 'Purpose'], [
          ['`GET /v1/hotels/{id}`, `GET /v1/hotels/{id}/rooms`', 'hotel and room type details'],
          ['`POST /v1/reservations`', 'create a reservation (body includes `reservationID` as an idempotency key)'],
          ['`GET /v1/reservations`, `DELETE /v1/reservations/{id}`', 'list, cancel'],
        ]),
        h3('Data model'),
        pre(`
          room_type_inventory
          hotel_id | room_type_id | date       | total_inventory | total_reserved
          211      | 1001         | 2026-07-01 | 100             | 87
          211      | 1001         | 2026-07-02 | 100             | 93

          reservation(reservation_id PK, hotel_id, room_type_id, start_date, end_date, status, guest_id)
        `),
        p("A relational database fits: data is structured, volume is modest, and we need **ACID transactions** for inventory and payment status."),
        flow({ nodes: { u: [0, 0.6, 'Guest / staff', 'client'], gw: [1, 0.6, 'API gateway'], hs: [2, 0, 'Hotel service\n(cached)'], rs: [2, 1.2, 'Reservation\nservice'], ps: [3, 1.2, 'Payment\nservice'], db: [3, 0, 'Hotel & inventory\nDB', 'db'] },
          edges: [['u', 'gw'], ['gw', 'hs'], ['gw', 'rs'], ['hs', 'db'], ['rs', 'db', 'transaction'], ['rs', 'ps']] }),
        h('Step 3 - Design deep dive'),
        h3('Concurrency: preventing double booking'),
        p("Two problems: the **same user** clicking \"Book\" twice, and **two users** booking the last room at the same time."),
        ul(
          "**Same user**: the client gets a `reservationID` before submitting; the table has a unique constraint on it, so a duplicate submit fails harmlessly (idempotency).",
          "**Different users**: the check-and-update of `total_reserved` must be atomic."
        ),
        table(['Approach', 'How', 'Trade-off'], [
          ['Pessimistic locking', '`SELECT … FOR UPDATE` on the inventory rows', 'safe but can deadlock and hurts throughput'],
          ['**Optimistic locking**', 'version column; update fails if the version changed, then retry', 'fast when contention is low (true for hotels)'],
          ['**Database constraint**', '`CHECK (total_reserved <= total_inventory * 1.1)`', 'simple; the DB rejects overbooking'],
        ]),
        code({ sql: `
          -- Reserve one room of type 1001 for each night in the stay, atomically.
          UPDATE room_type_inventory
          SET total_reserved = total_reserved + 1, version = version + 1
          WHERE hotel_id = 211 AND room_type_id = 1001
            AND date >= '2026-07-01' AND date < '2026-07-03'
            AND total_reserved + 1 <= total_inventory * 1.1;
          -- If fewer rows were updated than nights in the stay, roll back: not available.
          ` }),
        h3('Scaling'),
        ul("Shard by `hotel_id`: all queries for a booking touch one hotel.", "Cache inventory in Redis for fast availability checks, but let the database remain the source of truth for the final decision.", "With microservices, avoid distributed transactions where possible: keep reservation and inventory in the same database, or use a **saga** with compensating actions (refund if inventory update fails)."),
        h('Step 4 - Wrap up'),
        ul("Archive old inventory rows.", "Pricing per date and room type in a separate rate service.", "Notifications and confirmation emails through a queue."),
      ],
    },

    {
      id: 'distributed-email-service',
      title: 'Distributed Email Service',
      body: [
        p("Design a large-scale email service like a web-mail provider: sending and receiving mail, organising it into folders, searching, and filtering spam, for a billion users."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("1 billion users; send/receive, fetch, filter by read/unread, search by subject/sender/body, spam and virus protection.", "Average 10 emails sent and 40 received per user per day; metadata ~50 KB per email; ~20% have attachments (~500 KB).", "High reliability (never lose mail), availability, low latency for fetching."),
        state('send QPS = 1B × 10 / 10^5 ≈ 100,000\nmetadata per year = 1B × 40 × 365 × 50 KB ≈ 730 PB\nattachments per year ≈ 1B × 40 × 365 × 20% × 500 KB ≈ 1,460 PB'),
        h('Email protocols 101'),
        table(['Protocol', 'Role'], [['SMTP', 'sending mail between servers'], ['IMAP / POP', 'traditional clients fetching mail'], ['HTTPS + WebSocket', 'web-mail clients (our main path)']]),
        h('Step 2 - Propose high-level design and get buy-in'),
        flow({ nodes: { c: [0, 1, 'Web-mail client', 'client'], ws: [1.2, 0.3, 'Real-time servers\n(WebSocket)'], web: [1.2, 1.5, 'Web servers\nsend, fetch, folders'],
          oq: [2.4, 1.5, 'Outgoing queue', 'queue'], smtpo: [3.6, 1.5, 'SMTP outgoing\n+ spam/virus check'], net: [4.8, 0.9, 'Internet', 'ext'], smtpi: [3.6, 0.3, 'SMTP incoming'],
          iq: [2.4, 0.3, 'Incoming queue', 'queue'], meta: [2.4, 2.6, 'Metadata DB', 'db'], att: [3.6, 2.6, 'Attachment\nobject store', 'store'], search: [1.2, 2.6, 'Search index', 'db'] },
          edges: [['c', 'ws', '', 'both'], ['c', 'web'], ['web', 'oq'], ['oq', 'smtpo'], ['smtpo', 'net'], ['net', 'smtpi'], ['smtpi', 'iq'], ['iq', 'ws', 'mail processing'], ['web', 'meta'], ['web', 'att'], ['web', 'search']], ux: 150, bw: 124 }),
        ul(
          "**Sending**: the web server validates (size limits, rate limits), stores the email in the sender's Sent folder, and enqueues it. SMTP workers check for spam/viruses and deliver; failures go to an error queue with retries.",
          "**Receiving**: SMTP servers accept mail, check it, store attachments in object storage and metadata in the database, then notify the recipient in real time over WebSocket if they're online."
        ),
        h('Step 3 - Design deep dive'),
        h3('Metadata database'),
        p("Access pattern: almost all queries are scoped to one user (\"my inbox, newest first\"), reads dominate, and recent mail is hot. A wide-column store partitioned by `user_id` works well:"),
        pre(`
          emails_by_folder   partition key: (user_id, folder_id)   clustering: email_id DESC (time-based ID)
          emails_by_user     partition key: user_id                 clustering: email_id
          unread_emails      partition key: (user_id, folder_id)   (denormalised: avoids filtering on is_read)
        `),
        p("Denormalising (separate tables for read and unread) makes common queries simple partition reads, at the cost of updating two tables when an email is read."),
        h3('Search'),
        p("Users search only their own mailbox, and new mail must be searchable quickly, so the index is write-heavy. Options: Elasticsearch-style clusters keyed by user, or a custom **LSM-based per-user index** colocated with the mail store for very large scale."),
        h3('Deliverability'),
        ul("Dedicated, warmed-up IP addresses for sending.", "SPF, DKIM and DMARC to authenticate outgoing mail.", "Quickly ban spamming accounts; handle bounces and complaints."),
        h('Step 4 - Wrap up'),
        ul("Multi-region replication for availability.", "Conversation threading via message headers.", "Retention, legal hold and encryption at rest."),
      ],
    },

    {
      id: 's3-like-object-storage',
      title: 'S3-like Object Storage',
      body: [
        p("Object storage stores immutable blobs (images, videos, backups) addressed by a bucket name and a key, accessed over HTTP. It's the backbone of most systems in this kit. We'll design one with buckets, PUT/GET, versioning and large uploads."),
        h('Storage types'),
        table(['', 'Block storage', 'File storage', 'Object storage'], [
          ['Unit', 'raw blocks', 'files in directories', 'objects in flat buckets'],
          ['Access', 'mounted disk', 'network file system', 'RESTful API'],
          ['Mutable?', 'yes', 'yes', 'no (replace whole object)'],
          ['Scale', 'medium', 'high', 'virtually unlimited, cheap'],
        ]),
        h('Step 1 - Understand the problem and establish design scope'),
        ul("Bucket create/delete, object upload/download, versioning, listing by prefix.", "Objects from KBs to GBs; 100 PB per year growth.", "**Durability 99.9999%** (six nines) and availability 99.99%; cost efficiency."),
        h('Step 2 - Propose high-level design and get buy-in'),
        p("Separate **metadata** (small, mutable: names, IDs, versions) from **data** (large, immutable bytes). This is the same idea as a UNIX file system's inodes vs. data blocks."),
        flow({ nodes: { c: [0, 0.6, 'Client', 'client'], lb: [1, 0.6, 'Load balancer'], api: [2, 0.6, 'API service\nstateless'], iam: [2, -0.6, 'Identity &\naccess mgmt', 'ext'],
          meta: [3.2, 0, 'Metadata store\nbucket, key → object ID', 'db'], data: [3.2, 1.2, 'Data store\nobject ID → bytes', 'store'] },
          edges: [['c', 'lb'], ['lb', 'api'], ['api', 'iam', 'authn/z'], ['api', 'meta'], ['api', 'data']], ux: 170, bw: 140 }),
        ol("**Upload**: authenticate → stream bytes to the data store, which returns an object UUID → write metadata `(bucket, key, version) → UUID`.", "**Download**: look up the UUID in metadata → read bytes from the data store."),
        h('Step 3 - Design deep dive'),
        h3('Data store'),
        ul(
          "A **data routing service** asks a **placement service** (which tracks data nodes and their health via heartbeats) where to store an object, then writes to a primary data node that replicates to others.",
          "Storing each tiny object as a separate file wastes disk blocks and inodes, so many small objects are **appended into large files** (e.g. several GB each); a local index maps `object UUID → (file, offset, size)`. Full files become read-only.",
          "**Durability**: 3 replicas across failure domains (racks, zones) gives roughly six nines. **Erasure coding** (e.g. 8 data + 4 parity chunks) gives similar durability with ~50% overhead instead of 200%, at the cost of slower reads and repairs.",
          "**Correctness**: store a checksum (e.g. MD5) per object and verify on read; reconstruct from replicas or parity if corrupted."
        ),
        h3('Metadata store'),
        p("Shard the object table by a hash of `(bucket_name, object_key)` for even distribution. **Listing by prefix** then has to query all shards and merge results, which is fine because listing is rare. A separate denormalised listing table, sharded by bucket, speeds it up."),
        h3('Versioning and multipart upload'),
        ul(
          "**Versioning**: never overwrite; insert a new metadata row with a new version ID (time-based UUID). Deleting adds a *delete marker*.",
          "**Multipart upload**: for large files, the client initiates an upload, sends parts in parallel (each with an ETag), then completes; the service stitches the parts. Failed parts are retried individually.",
          "**Garbage collection** reclaims space from deleted objects and orphaned parts by compacting data files."
        ),
        h('Step 4 - Wrap up'),
        ul("Lifecycle rules moving cold objects to cheaper tiers.", "Pre-signed URLs for direct client uploads/downloads.", "Strong read-after-write consistency for new objects."),
      ],
    },
  ]);
})();
