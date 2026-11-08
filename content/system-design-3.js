(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, code, state, pre } = K;

  K.chapters('system-design-interview', [
    {
      id: 'design-a-news-feed-system',
      title: 'Design A News Feed System',
      body: [
        p("A **news feed** is the constantly updating list of posts from the people and pages you follow, the home screen of most social apps. Two flows matter: **publishing** a post and **retrieving** a feed."),
        h('Step 1 - Understand the problem and establish design scope'),
        talk(['Candidate', 'Mobile, web, or both?'], ['Interviewer', 'Both.'],
          ['Candidate', 'What are the key features?'], ['Interviewer', 'Users publish posts and see their friends\' posts in their feed.'],
          ['Candidate', 'Is the feed sorted by time or by ranking?'], ['Interviewer', 'Reverse chronological order, to keep it simple.'],
          ['Candidate', 'How many friends can a user have, and how much traffic?'], ['Interviewer', 'Up to 5,000 friends; 10 million DAU.'],
          ['Candidate', 'Can posts contain images and videos?'], ['Interviewer', 'Yes.']),
        h('Step 2 - Propose high-level design and get buy-in'),
        h3('APIs'),
        table(['Endpoint', 'Purpose'], [
          ['`POST /v1/me/feed` with `content`, `auth_token`', 'publish a post'],
          ['`GET /v1/me/feed` with `auth_token`, `cursor`', 'retrieve the feed, paginated'],
        ]),
        h3('Feed publishing'),
        flow({ nodes: { u: [0, 0.6, 'User', 'client'], lb: [1, 0.6, 'Load balancer'], ws: [2, 0.6, 'Web servers\nauth, rate limit'],
          post: [3, 0, 'Post service'], fan: [3, 1.2, 'Fanout service'], notif: [3, 2.4, 'Notification\nservice'],
          pdb: [4.2, 0, 'Post DB + cache', 'db'], fcache: [4.2, 1.2, 'News feed\ncache', 'cache'] },
          edges: [['u', 'lb'], ['lb', 'ws'], ['ws', 'post'], ['ws', 'fan'], ['ws', 'notif'], ['post', 'pdb'], ['fan', 'fcache', 'push post IDs']], ux: 165 }),
        h3('Feed building'),
        p("To read a feed, the web server asks a **news feed service**, which fetches post IDs from the news feed cache and then hydrates them with post content and author info from their caches."),
        h('Step 3 - Design deep dive'),
        h3('Fanout: push vs. pull'),
        table(['', 'Fanout on write (push)', 'Fanout on read (pull)'], [
          ['When the feed is built', 'when a post is published, it is written into every friend\'s feed cache', 'when a user opens the feed, recent posts of all their friends are fetched'],
          ['Read latency', 'very fast: the feed is pre-computed', 'slower: computed on demand'],
          ['Problem', '**hotkey**: a celebrity with millions of followers makes one post expensive; wasted work for inactive users', 'expensive reads'],
        ]),
        p("A **hybrid** is used in practice: push for most users, so reads are fast, and pull for celebrities, whose posts are fetched at read time and merged in. Consistent hashing spreads the requests for hot keys."),
        h3('Fanout service steps'),
        ol(
          "Fetch the poster's friend IDs from a graph database.",
          "Filter using user settings (muted friends, privacy rules).",
          "Put `(friend list, post ID)` on a message queue.",
          "Fanout workers append the **post ID** (not the whole post) to each friend's feed list in the cache: `user_id → [post_id, …]`. Keep only the latest few hundred IDs; older content is rarely viewed and can be fetched from the database."
        ),
        h3('Caching layers'),
        table(['Cache', 'Holds'], [
          ['News feed', 'post IDs per user'],
          ['Content', 'post data; popular posts in a hot cache'],
          ['Social graph', 'follower / following relationships'],
          ['Action', 'whether a user liked, replied to or shared a post'],
          ['Counters', 'like, reply and follower counts'],
        ]),
        h('Step 4 - Wrap up'),
        ul(
          "Scale the database with read replicas and sharding; keep web servers stateless.",
          "Cursor-based pagination so new posts don't shift pages.",
          "Ranking can be layered on later (a scoring service reorders candidate posts).",
          "Monitor QPS during peaks and feed-refresh latency."
        ),
      ],
    },

    {
      id: 'design-a-chat-system',
      title: 'Design A Chat System',
      body: [
        p("Chat apps deliver messages between people in real time. Requirements vary a lot (one-on-one vs. huge groups, text vs. calls), so pin down the scope early."),
        h('Step 1 - Understand the problem and establish design scope'),
        talk(['Candidate', 'One-on-one or group chat?'], ['Interviewer', 'Both. Groups of up to 100 people.'],
          ['Candidate', 'Mobile or web?'], ['Interviewer', 'Both, and one account can be logged in on several devices.'],
          ['Candidate', 'Scale?'], ['Interviewer', '50 million DAU.'],
          ['Candidate', 'Do we need online indicators and message history?'], ['Interviewer', 'Yes: online presence, and chat history stored forever.'],
          ['Candidate', 'Message size limit?'], ['Interviewer', 'Text only, under 100,000 characters.']),
        h('Step 2 - Propose high-level design and get buy-in'),
        h3('How clients talk to the server'),
        table(['Technique', 'How it works', 'Verdict'], [
          ['Polling', 'client asks "anything new?" every few seconds', 'wasteful; most answers are "no"'],
          ['Long polling', 'server holds the request open until a message arrives or a timeout', 'better, but reconnects constantly and the server can\'t easily tell who disconnected'],
          ['**WebSocket**', 'one persistent, bidirectional connection', 'ideal for sending and receiving in real time'],
        ]),
        p("Not everything needs to be real time. Signup, login and profile updates go through ordinary **stateless HTTP services**. Messaging goes through **stateful chat servers** that keep each client's WebSocket open."),
        flow({ nodes: { a: [0, 0.6, 'User A', 'client'], b: [0, 1.8, 'User B', 'client'], lb: [1, 0, 'Load balancer'], api: [2, 0, 'API servers\nlogin, profile'],
          chat: [1.6, 1.2, 'Chat servers\n(WebSocket)'], pres: [2.8, 1.2, 'Presence\nservers'], idg: [1.6, 2.4, 'ID generator'], q: [2.8, 2.4, 'Message sync\nqueue', 'queue'],
          kv: [4, 1.8, 'Key-value store\nchat history', 'db'], push: [4, 0.6, 'Push service', 'ext'] },
          edges: [['a', 'lb', 'HTTP'], ['lb', 'api'], ['a', 'chat', 'WebSocket', 'both'], ['b', 'chat', '', 'both'], ['chat', 'idg'], ['chat', 'q'], ['q', 'kv'], ['q', 'push', 'offline users'], ['chat', 'pres', 'heartbeat']], ux: 160, bw: 128 }),
        h3('Storage'),
        p("Chat history is enormous (billions of messages a day), mostly recent messages are read, and access is a simple lookup by conversation. That makes a horizontally scalable **key-value / wide-column store** a better fit than a relational database."),
        table(['Table', 'Key', 'Columns'], [
          ['message (1:1)', '`message_id`', 'from_user, to_user, content, created_at'],
          ['group_message', '`(channel_id, message_id)`', 'user_id, content, created_at'],
        ]),
        note("Message IDs must be unique **and sortable by time** within a conversation. A global Snowflake-style ID works; a cheaper option is a per-conversation sequence number."),
        h('Step 3 - Design deep dive'),
        h3('Service discovery'),
        p("When a client logs in, a discovery service (e.g. ZooKeeper) picks the best chat server for it based on region and load, and returns its address. The client opens its WebSocket there."),
        h3('One-on-one message flow'),
        ol(
          "User A sends a message over its WebSocket to chat server 1.",
          "Chat server 1 gets a message ID and puts the message on the sync queue.",
          "The message is stored in the key-value store.",
          "If B is online, the message is forwarded to the chat server holding B's connection, which pushes it to B. If B is offline, the push notification service alerts B's devices."
        ),
        h3('Syncing multiple devices'),
        p("Each device remembers `cur_max_message_id`, the latest message it has. On reconnect it asks for all messages with a larger ID for its conversations. Because IDs are time-ordered, that's an efficient range query."),
        h3('Small group chat'),
        p("For groups of up to ~100, copy each message into every member's **inbox** (message sync queue). Each member then reads only their own inbox. This is simple and works well for small groups; huge groups would use a pull model instead."),
        h3('Online presence'),
        ul(
          "Clients send a **heartbeat** every few seconds to presence servers. If no heartbeat arrives for, say, 30 seconds, mark the user offline. This avoids flicker when a phone briefly loses signal.",
          "Status changes are published to channels that friends subscribe to. For large groups, fetch presence only when the group is opened."
        ),
        h('Step 4 - Wrap up'),
        ul(
          "Media messages: upload to object storage, send a link; compress and generate thumbnails.",
          "End-to-end encryption.",
          "Client-side caching of recent messages for fast load.",
          "Retry and resend queues for reliable delivery; error handling when a chat server dies (clients reconnect via discovery)."
        ),
      ],
    },

    {
      id: 'design-a-search-autocomplete-system',
      title: 'Design A Search Autocomplete System',
      body: [
        p("As you type into a search box, the system suggests the most popular queries that start with what you've typed. We'll design a system that returns the **top 5** suggestions for a prefix."),
        h('Step 1 - Understand the problem and establish design scope'),
        talk(['Candidate', 'Is matching only at the beginning of the query?'], ['Interviewer', 'Yes, prefix matching.'],
          ['Candidate', 'How many suggestions and how are they ranked?'], ['Interviewer', 'Five, by historical query popularity.'],
          ['Candidate', 'Lowercase English only? Spell check?'], ['Interviewer', 'Lowercase letters only, no spell check.'],
          ['Candidate', 'Scale?'], ['Interviewer', '10 million DAU.']),
        state('10M users × 10 searches × 20 characters typed = 2B suggestion requests / day\n≈ 24,000 QPS (peak ≈ 48,000)\nnew query data ≈ 0.4 GB / day'),
        p("Latency must be very low: suggestions should appear within about **100 ms** of each keystroke."),
        h('Step 2 - Propose high-level design and get buy-in'),
        p("Split into two services:"),
        ul(
          "**Data gathering**: aggregates raw search queries into frequency counts (offline, periodically).",
          "**Query service**: given a prefix, returns the top 5 most frequent queries (online, latency-critical)."
        ),
        p("A naive query service could run `SELECT query FROM freq WHERE query LIKE 'prefix%' ORDER BY frequency DESC LIMIT 5`, but that's far too slow at this scale."),
        h('Step 3 - Design deep dive'),
        h3('The trie'),
        p("A **trie** (prefix tree) stores strings by shared prefixes (see [Introduction to Tries](#/coding-interview-patterns/tries/introduction)). Store each query's frequency at its final node. To answer a prefix: walk down to the prefix node (O(p)), then search its subtree for the top k (expensive for short prefixes)."),
        p("Two optimisations make lookups effectively O(1):"),
        ol(
          "**Limit the prefix length**: users rarely type more than ~50 characters before picking a suggestion.",
          "**Cache the top-k at every node**: each node stores its 5 best queries. A lookup is just \"walk to the prefix node, return its list\". This trades memory for speed."
        ),
        pre(`
          root
           └ b  top: [best: 35, bet: 29, bee: 20, be: 15, beer: 10]
              └ e  top: [best: 35, bet: 29, bee: 20, be: 15, beer: 10]
                 ├ s → t (best: 35)
                 ├ t (bet: 29)
                 └ e (bee: 20) → r (beer: 10)
        `),
        h3('Data gathering'),
        ul(
          "Updating the trie on every keystroke is wasteful. Instead, **analytics logs** record queries; **aggregators** count them weekly or daily (or near-real-time for trending topics).",
          "**Workers** build a new trie from the aggregated data and store it in a **trie DB**, then swap it into the trie cache.",
          "Trie storage: serialize snapshots to a document store, or map each prefix to its top-5 list in a key-value store."
        ),
        flow({ nodes: { logs: [0, 0, 'Analytics logs', 'store'], agg: [1, 0, 'Aggregators'], data: [2, 0, 'Aggregated\ncounts', 'db'], wk: [3, 0, 'Workers'], tdb: [3, 1.2, 'Trie DB', 'db'], tc: [2, 1.2, 'Trie cache', 'cache'], qs: [1, 1.2, 'Query service'], user: [0, 1.2, 'Browser', 'client'] },
          edges: [['logs', 'agg'], ['agg', 'data'], ['data', 'wk'], ['wk', 'tdb', 'build trie'], ['tdb', 'tc', 'weekly snapshot'], ['qs', 'tc', 'lookup', 'both'], ['user', 'qs', 'GET ?q=be', 'both']] }),
        h3('Query service optimisations'),
        ul(
          "AJAX requests so the page doesn't reload.",
          "**Browser caching**: suggestions for a prefix rarely change within an hour, so set `Cache-Control: max-age=3600`.",
          "**Data sampling**: log only 1 in N queries to reduce processing.",
          "**Filter layer**: remove hateful, violent or unsafe suggestions before returning results."
        ),
        h3('Scaling storage'),
        p("If the trie no longer fits on one server, shard by prefix. Sharding by first letter is uneven (far more words start with *s* than *x*), so use a **shard map manager** that groups ranges of prefixes by historical load."),
        h('Step 4 - Wrap up'),
        ul(
          "Multiple languages: store Unicode characters in trie nodes.",
          "Country-specific popularity: separate tries per region, cached in CDNs.",
          "Trending queries: stream processing (e.g. Kafka + Flink) and weighting recent queries more."
        ),
      ],
    },

    {
      id: 'design-youtube',
      title: 'Design YouTube',
      body: [
        p("A video-sharing platform lets creators upload videos and viewers stream them on any device. The design splits naturally into **upload/processing** and **streaming**."),
        h('Step 1 - Understand the problem and establish design scope'),
        talk(['Candidate', 'Most important features?'], ['Interviewer', 'Uploading videos and watching them.'],
          ['Candidate', 'Which clients?'], ['Interviewer', 'Mobile apps, web browsers and smart TVs.'],
          ['Candidate', 'Scale?'], ['Interviewer', '5 million DAU, watching 5 videos a day on average.'],
          ['Candidate', 'Do we support international users and many resolutions?'], ['Interviewer', 'Yes, both.'],
          ['Candidate', 'Max video size?'], ['Interviewer', '1 GB. Use cloud services where reasonable.']),
        state('10% of users upload 1 video / day, average 300 MB\nstorage per day = 5M × 10% × 300 MB = 150 TB\nCDN egress dominates cost: serve popular videos from CDN, long tail from origin'),
        h('Step 2 - Propose high-level design and get buy-in'),
        flow({ nodes: { c: [0, 1, 'Client', 'client'], cdn: [1.2, 0, 'CDN\nvideo streaming', 'ext'], api: [1.2, 2, 'API servers\nmetadata, auth'],
          orig: [2.4, 2, 'Original\nstorage', 'store'], tr: [3.6, 2, 'Transcoding\nservers'], tstore: [3.6, 0.8, 'Transcoded\nstorage', 'store'], md: [2.4, 3.2, 'Metadata DB\n+ cache', 'db'], cq: [4.8, 2, 'Completion\nqueue', 'queue'] },
          edges: [['c', 'cdn', 'stream'], ['c', 'api', 'everything else'], ['c', 'orig', 'upload (pre-signed URL)'], ['orig', 'tr'], ['tr', 'tstore'], ['tstore', 'cdn', 'distribute'], ['tr', 'cq'], ['cq', 'md', 'mark ready'], ['api', 'md']], ux: 158, bw: 126 }),
        h3('Upload flow'),
        ol(
          "The client asks the API for a **pre-signed URL** and uploads the video straight to original storage (object storage), bypassing our API servers.",
          "Transcoding servers convert the video into multiple formats and bitrates.",
          "Transcoded files go to transcoded storage and are pushed to the CDN.",
          "A completion event updates the metadata DB (title, size, URLs, status) and notifies the user.",
          "Metadata (title, description) is uploaded in parallel through the API."
        ),
        h3('Streaming'),
        p("Clients don't download whole files. They **stream** using adaptive protocols such as **HLS** or **MPEG-DASH**: the video is split into short segments at several bitrates, and the player switches bitrate based on current bandwidth. Videos stream from the nearest CDN edge."),
        h('Step 3 - Design deep dive'),
        h3('Video transcoding as a DAG'),
        p("Different creators need different processing (watermarks, thumbnails, resolutions). Model the pipeline as a **directed acyclic graph** of tasks: split into audio, video and metadata; then inspect, encode at each resolution, generate thumbnails, add watermark; finally merge. A scheduler runs independent tasks in parallel on worker pools, coordinated through queues."),
        h3('Optimisations'),
        ul(
          "**Speed**: split the upload into chunks (GOP-aligned) and upload them in parallel; resume failed uploads; place upload centres near users.",
          "**Parallelism**: queues between every pipeline stage so stages scale independently.",
          "**Safety**: pre-signed URLs so only authorised clients can upload; DRM, encryption and watermarking against piracy.",
          "**Cost**: serve only popular videos from the CDN, the long tail from our own servers; encode unpopular videos on demand at fewer resolutions; partner with ISPs."
        ),
        h3('Error handling'),
        table(['Failure', 'Handling'], [
          ['Upload error', 'retry a few times'], ['Transcoding error', 'retry; mark failed after limits'], ['Metadata DB primary down', 'promote a replica'],
          ['API server down', 'stateless: route to another'], ['Unrecoverable (bad format)', 'return a clear error to the client'],
        ]),
        h('Step 4 - Wrap up'),
        ul(
          "Scale the metadata tier with replication and sharding.",
          "Live streaming needs lower latency and different protocols.",
          "Content moderation and copyright detection on upload."
        ),
      ],
    },

    {
      id: 'design-google-drive',
      title: 'Design Google Drive',
      body: [
        p("A cloud file-storage service lets users store files, access them from any device, sync changes automatically, and share them with others."),
        h('Step 1 - Understand the problem and establish design scope'),
        ul(
          "Upload and download files; sync across devices; see revision history.",
          "Share files with friends and family; notifications when a shared file changes.",
          "Any file type; max 10 GB per file; files encrypted at rest.",
          "50 million signed-up users, 10 million DAU, 10 GB free space each."
        ),
        state('total space = 50M × 10 GB = 500 PB\n2 uploads / user / day, average 500 KB\nupload QPS = 10M × 2 / 86,400 ≈ 240 (peak ≈ 480)'),
        h3('Non-functional requirements'),
        ul(
          "**Reliability**: data loss is unacceptable.",
          "**Fast sync** and **bandwidth efficiency** (mobile data is expensive).",
          "**Scalability** and **high availability**."
        ),
        h('Step 2 - Propose high-level design and get buy-in'),
        p("Start from one server holding files on disk and metadata in a database, then scale: move files to **object storage** replicated across regions, add load balancers and stateless API servers, and replicate/shard the metadata database."),
        flow({ nodes: { c: [0, 1, 'Desktop / mobile\nclient', 'client'], bs: [1.3, 0, 'Block servers'], cs: [2.6, 0, 'Cloud storage\n(blocks)', 'store'], cold: [3.9, 0, 'Cold storage', 'store'],
          api: [1.3, 1, 'API servers\nauth, metadata'], mc: [2.6, 1, 'Metadata cache', 'cache'], mdb: [2.6, 2.1, 'Metadata DB', 'db'], ns: [1.3, 2.1, 'Notification\nservice'], oq: [0, 2.1, 'Offline backup\nqueue', 'queue'] },
          edges: [['c', 'bs', 'upload blocks'], ['bs', 'cs'], ['cs', 'cold', 'inactive data'], ['c', 'api', 'metadata'], ['api', 'mc'], ['api', 'mdb'], ['api', 'ns'], ['ns', 'c', 'long polling', 'dash'], ['ns', 'oq', 'offline clients']], ux: 162, bw: 130 }),
        h3('Sync conflicts'),
        p("If two users edit the same file at once, the **first version processed wins**. The other user gets a conflict: the system keeps both copies so the user can merge or choose."),
        h('Step 3 - Design deep dive'),
        h3('Block servers'),
        p("Large files are split into **blocks** (e.g. up to 4 MB). Each block is hashed, compressed and encrypted, then uploaded. Two big savings follow:"),
        ul(
          "**Delta sync**: when a file changes, only the modified blocks are uploaded.",
          "**Deduplication**: identical blocks (same hash) are stored once, across the account."
        ),
        h3('Metadata'),
        table(['Table', 'Purpose'], [
          ['user', 'profile and quota'], ['device', 'push IDs, so all devices can be notified'], ['workspace', 'root directory of a user'],
          ['file', 'latest file info'], ['file_version', 'read-only rows: version history'], ['block', 'block hashes per file version, in order'],
        ]),
        p("Metadata needs **strong consistency**: two devices must never see different file lists. A relational database with ACID transactions fits, with a cache that is invalidated on writes."),
        h3('Upload flow'),
        ol(
          "Client adds file metadata with status *pending*.",
          "Client uploads blocks to block servers, which store them in cloud storage.",
          "When all blocks are in, storage triggers a callback; API servers mark the file *uploaded*.",
          "The notification service tells other devices and collaborators that the file changed."
        ),
        h3('Notifications'),
        p("Clients must learn about remote changes quickly. **Long polling** fits better than WebSocket here: communication is mostly server → client and infrequent. Each client holds a long-poll connection; when it returns with a change, the client fetches the new metadata and downloads changed blocks."),
        h3('Saving storage'),
        ul(
          "Deduplicate blocks; cap the number of stored versions; keep only valuable versions for frequently edited files.",
          "Move rarely accessed data to **cold storage**, which is much cheaper."
        ),
        h('Step 4 - Wrap up'),
        ul(
          "Failure handling: block servers and API servers are stateless and replaceable; metadata DB fails over to replicas; storage is replicated across regions.",
          "Uploading directly to cloud storage from the client would be faster, but splitting, compression and encryption logic would then live on every platform, which is why block servers exist."
        ),
      ],
    },
  ]);
})();
