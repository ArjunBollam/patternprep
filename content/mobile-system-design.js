(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, state, pre, code } = K;

  K.chapters('mobile-system-design-interview', [
    {
      id: 'introduction',
      title: 'Introduction',
      body: [
        p("A mobile system design interview asks you to design an app such as a news feed, a chat client or a photo-sharing app, with the focus on the **client**: architecture inside the app, how it talks to the backend, how it behaves offline, and how it stays fast on a constrained device. The backend matters too, but mostly through the **API contract** you design."),
        h('How it differs from backend system design'),
        table(['Backend design', 'Mobile design'], [
          ['scale to millions of requests', 'one device, but limited CPU, memory, battery and flaky networks'],
          ['deploy fixes in minutes', 'releases go through app stores; old versions live for years'],
          ['servers always online', 'the app is killed, backgrounded and offline regularly'],
          ['focus on data stores and services', 'focus on UI responsiveness, caching, sync and API design'],
        ]),
        h('A framework (45-60 minutes)'),
        ol(
          "**Requirements** (5-10 min): functional features, non-functional needs (offline? real time? low data usage?), platforms, and what's out of scope.",
          "**High-level client design** (10 min): main screens and components (UI, view models, repositories, data sources).",
          "**API and data model** (10 min): endpoints or real-time channels, payloads, pagination, local schema.",
          "**Deep dives** (15-20 min): offline support, caching, sync conflicts, image loading, performance, battery.",
          "**Wrap up**: monitoring, testing, rollout with feature flags, accessibility."
        ),
        h('What interviewers look for'),
        ul(
          "A clean, testable **client architecture** with clear responsibilities.",
          "A well-reasoned **API**: efficient payloads, pagination, versioning, error handling.",
          "Thoughtful handling of **real-world conditions**: offline, slow networks, process death, low memory.",
          "Awareness of **platform specifics** (iOS / Android lifecycle, background limits, push notifications) without getting lost in trivia."
        ),
      ],
    },

    {
      id: 'mobile-building-blocks',
      title: 'Mobile Building Blocks',
      body: [
        p("Most mobile designs reuse the same handful of building blocks. Knowing their trade-offs lets you assemble any app quickly in an interview."),
        h('Client architecture'),
        flow({ nodes: { ui: [0, 0, 'UI layer\nscreens, views', 'client'], vm: [1, 0, 'ViewModel /\nPresenter'], repo: [2, 0, 'Repository\nsingle source of truth'], api: [3, -0.6, 'Remote data source\nAPI client', 'ext'], db: [3, 0.6, 'Local data source\nSQLite / Room / Core Data', 'db'] },
          edges: [['ui', 'vm', 'user events'], ['vm', 'ui', 'UI state', 'dash'], ['vm', 'repo'], ['repo', 'api', '', 'both'], ['repo', 'db', '', 'both']], ux: 175, bw: 140 }),
        ul(
          "**Unidirectional data flow** (MVVM / MVI): the UI renders state and sends events; the view model owns state; the repository owns data.",
          "**Repository as single source of truth**: the UI observes the local database; network responses are written to the database, which then updates the UI. This gives offline support almost for free.",
          "**Dependency injection** keeps components testable and swappable."
        ),
        code({ kt: `
          class FeedRepository(
              private val api: FeedApi,
              private val dao: PostDao,
          ) {
              // UI observes the database: the single source of truth.
              fun posts(): Flow<List<Post>> = dao.observeAll()

              suspend fun refresh() {
                  val page = api.fetchFeed(cursor = null)
                  dao.replaceAll(page.posts)   // emits a new list to observers
              }
          }
          `, swift: `
          final class FeedRepository {
              private let api: FeedAPI
              private let store: PostStore

              init(api: FeedAPI, store: PostStore) {
                  self.api = api
                  self.store = store
              }

              // UI observes the local store: the single source of truth.
              var posts: AsyncStream<[Post]> { store.observeAll() }

              func refresh() async throws {
                  let page = try await api.fetchFeed(cursor: nil)
                  try store.replaceAll(page.posts)   // observers receive the new list
              }
          }
          ` }),
        h('Talking to the backend'),
        table(['Mechanism', 'Use it for', 'Notes'], [
          ['REST / HTTP', 'most CRUD requests', 'simple, cacheable; risk of over-fetching'],
          ['GraphQL', 'screens that combine many resources', 'client picks fields; harder to cache'],
          ['WebSocket', 'chat, live collaboration', 'persistent connection; reconnect logic; only while foregrounded'],
          ['Server-sent events / long polling', 'one-way live updates', 'simpler than WebSocket'],
          ['Push notifications (APNs / FCM)', 'waking the app, alerting users', 'not guaranteed or ordered; carry small payloads'],
        ]),
        h('Pagination'),
        table(['Style', 'How', 'Verdict'], [
          ['Offset', '`?offset=40&limit=20`', 'items shift when new ones arrive → duplicates or gaps'],
          ['**Cursor**', '`?cursor=opaque_token&limit=20`', 'stable under inserts; the default choice for feeds'],
        ]),
        h('Local storage'),
        ul(
          "**Key-value** (UserDefaults, DataStore/SharedPreferences): small settings.",
          "**Database** (SQLite via Room / Core Data / SwiftData): structured data, queries, observation.",
          "**Files**: images, videos, downloads; use the cache directory for data the OS may purge.",
          "**Keychain / Keystore**: tokens and secrets."
        ),
        h('Images'),
        ul("Request the right size from the server or CDN (don't download 4K for a thumbnail).", "Two-level cache: memory (LRU) + disk.", "Cancel requests for cells scrolled off screen; prefetch the next few.", "Decode off the main thread; use modern formats (WebP / AVIF / HEIC)."),
        h('Offline and sync'),
        ul(
          "Write locally first (optimistic UI), queue the change in an **outbox**, and send it when online.",
          "Give each change an idempotency key so retries don't create duplicates.",
          "Resolve conflicts: last-write-wins, server-authoritative merge, or per-field merges.",
          "Use the platform's background work schedulers (WorkManager, BGTaskScheduler) with network constraints."
        ),
        h('Performance and battery'),
        ul("Keep the main thread free: no disk or network work on it.", "Batch network calls; avoid frequent polling; respect low-power mode.", "Measure startup time, frame drops, memory and crash rate in production."),
      ],
    },

    {
      id: 'news-feed-app',
      title: 'News Feed App',
      body: [
        p("Design the client for a social news feed: an infinite scrolling list of posts with text, images and video, where users can like and comment."),
        h('Requirements'),
        talk(['Candidate', 'Which features are in scope?'], ['Interviewer', 'Browsing the feed, liking, and viewing comments. Posting is out of scope.'],
          ['Candidate', 'Should the feed work offline?'], ['Interviewer', 'Users should see the last loaded feed when offline.'],
          ['Candidate', 'Do new posts appear in real time?'], ['Interviewer', 'Show a "new posts" pill; don\'t jump the list.']),
        ul("Smooth scrolling (60 fps) with mixed media.", "Low data usage on cellular networks.", "Likes should feel instant even on slow networks."),
        h('API Design'),
        table(['Endpoint', 'Notes'], [
          ['`GET /v1/feed?cursor=…&limit=20`', 'returns posts + `next_cursor`; media as URLs with multiple sizes'],
          ['`POST /v1/posts/{id}/like`', 'idempotent; client sends an idempotency key'],
          ['`GET /v1/posts/{id}/comments?cursor=…`', 'paginated comments'],
          ['`GET /v1/feed/new_count?since=…`', 'cheap check for the "new posts" pill'],
        ]),
        pre(`
          {
            "posts": [{
              "id": "p_812", "author": {"id": "u_9", "name": "Sam", "avatar_url": "…"},
              "text": "…", "created_at": "2026-11-07T10:00:00Z",
              "media": [{"type": "image", "urls": {"small": "…", "large": "…"}, "w": 1080, "h": 720}],
              "like_count": 42, "liked_by_me": false
            }],
            "next_cursor": "eyJ0IjoxNzM…"
          }
        `),
        h('Client Architecture'),
        flow({ nodes: { list: [0, 0, 'Feed screen\n(lazy list)', 'client'], vm: [1, 0, 'FeedViewModel'], repo: [2, 0, 'FeedRepository'], api: [3, -0.6, 'Feed API', 'ext'], db: [3, 0.6, 'Local DB\nposts, cursors', 'db'], img: [1, 1.2, 'Image loader\nmemory + disk cache', 'cache'], q: [2, 1.2, 'Outbox\npending likes', 'queue'] },
          edges: [['list', 'vm'], ['vm', 'repo'], ['repo', 'api', '', 'both'], ['repo', 'db', '', 'both'], ['list', 'img'], ['repo', 'q'], ['q', 'api', 'retry', 'dash']], ux: 170 }),
        h('Deep Dives'),
        h3('Smooth scrolling'),
        ul("Use a recycling list (LazyColumn / RecyclerView / UICollectionView) and stable item IDs.", "Server sends media dimensions so cells have a fixed size before images load (no jumping).", "Prefetch the next page when the user is ~5 items from the end; prefetch images for upcoming cells.", "Autoplay videos muted only when mostly visible; release players for off-screen cells."),
        h3('Offline and caching'),
        ul("Persist the first pages of the feed in the local database; the UI always reads from the database.", "On launch, show cached posts immediately, then refresh in the background.", "Evict old posts and media by age and total size."),
        h3('Optimistic likes'),
        ol("Update the UI and local DB immediately (`liked_by_me = true`, count + 1).", "Add the action to an outbox with an idempotency key.", "Send when online; on permanent failure, roll back and show a subtle error."),
        h3('New posts without jumping'),
        p("Poll `new_count` when the app comes to the foreground (or receive a silent push). Show a pill; when tapped, scroll to top and prepend the new page."),
        h('Wrap Up'),
        ul("Metrics: time to first post, scroll frame drops, image cache hit rate, data used per session.", "Accessibility: alt text from the server, dynamic type support."),
      ],
    },

    {
      id: 'chat-app',
      title: 'Chat App',
      body: [
        p("Design the client for a messaging app with one-on-one and group conversations, real-time delivery, delivery/read receipts and offline sending."),
        h('Requirements'),
        ul("Conversation list and message screen; text and images.", "Messages arrive in real time when the app is open, via push when it isn't.", "Messages typed offline are sent automatically later.", "Message history is available offline; multiple devices per account."),
        h('Real-time Connection'),
        p("While the app is in the foreground, keep a **WebSocket** open for sending and receiving. When backgrounded, the OS will suspend it, so the server falls back to **push notifications**. On reconnect, the client **syncs** anything it missed."),
        flow({ nodes: { ui: [0, 0.6, 'Chat UI', 'client'], vm: [1, 0.6, 'ViewModel'], repo: [2, 0.6, 'MessageRepository'], ws: [3, 0, 'WebSocket\nconnection', 'ext'], db: [3, 1.2, 'Local DB\nmessages, outbox', 'db'], push: [2, -0.6, 'Push handler\n(APNs / FCM)', 'ext'] },
          edges: [['ui', 'vm'], ['vm', 'repo'], ['repo', 'ws', 'send / receive', 'both'], ['repo', 'db', '', 'both'], ['push', 'repo', 'wake + sync', 'dash']], ux: 170 }),
        h('Message Lifecycle'),
        ol(
          "User taps send: the client creates a message with a **client-generated ID** (UUID), status `sending`, and saves it locally. The UI shows it immediately.",
          "The message is sent over the WebSocket. The server stores it, assigns a **server sequence number**, and acks with both IDs.",
          "The client updates the local row: status `sent`, server sequence number.",
          "When recipients' devices receive it, delivery receipts flow back (`delivered`), then `read` when the conversation is opened."
        ),
        table(['Status', 'Shown as'], [['sending', 'clock icon'], ['sent', '✓'], ['delivered', '✓✓'], ['read', 'blue ✓✓'], ['failed', 'red ! with retry']]),
        h('Sync and Ordering'),
        ul(
          "Each conversation has a monotonically increasing server sequence. The client stores the highest sequence it has seen per conversation.",
          "On reconnect: `GET /sync?since=<cursor>` returns new messages and receipts across conversations.",
          "Order messages by server sequence; pending local messages appear at the bottom until acked.",
          "The client-generated ID makes resending idempotent: the server ignores duplicates."
        ),
        h('Offline Sending'),
        p("Unacked messages stay in an **outbox** in the local database. A background job retries with exponential backoff when connectivity returns, even if the app was killed in between."),
        h('Media'),
        ul("Upload images to object storage first (resumable, background-capable upload), then send a message with the media URL.", "Show a local thumbnail with an upload progress indicator.", "Download full-size images lazily; cache thumbnails aggressively."),
        h('Wrap Up'),
        ul("End-to-end encryption changes what the server can see (and search).", "Typing indicators: ephemeral, never persisted.", "Battery: no WebSocket in the background; rely on push."),
      ],
    },

    {
      id: 'photo-sharing-app',
      title: 'Photo Sharing App',
      body: [
        p("Design the client for an app where users take or pick photos, apply filters, add captions and share posts, plus browse a grid of their own photos."),
        h('Requirements'),
        ul("Capture or select up to 10 photos per post; basic filters and cropping.", "Uploads must survive poor networks and the app being backgrounded or killed.", "Users can keep using the app while an upload is in progress.", "Profile grid of the user's posts."),
        h('Upload Pipeline'),
        flow({ nodes: { pick: [0, 0, 'Camera / picker', 'client'], edit: [1, 0, 'Edit + filters\n(GPU)'], prep: [2, 0, 'Resize + compress\n(e.g. 2048px, HEIC/JPEG)'], q: [3, 0, 'Upload queue\n(persisted)', 'queue'], up: [3, 1.2, 'Background upload\nchunked, resumable', 'ext'], create: [2, 1.2, 'Create post API\nwith media IDs'] },
          edges: [['pick', 'edit'], ['edit', 'prep'], ['prep', 'q'], ['q', 'up'], ['up', 'create', 'all media uploaded']], ux: 175, bw: 140 }),
        ol(
          "Process images on device: apply filters, resize to the maximum size the server keeps, compress, and strip location metadata if the user opted out.",
          "Save a **post draft** in the local database with references to the processed files.",
          "Request upload URLs (`POST /v1/media/uploads` → pre-signed URLs) and upload each file using the platform's **background transfer** service, in chunks so it can resume.",
          "When all media IDs are confirmed, call `POST /v1/posts` with the caption and media IDs (with an idempotency key).",
          "Show the post immediately in the user's profile grid with a progress indicator; mark it posted on success."
        ),
        h('API'),
        table(['Endpoint', 'Purpose'], [
          ['`POST /v1/media/uploads`', 'returns pre-signed upload URL(s) and a media ID'],
          ['`PUT <pre-signed URL>`', 'uploads bytes directly to object storage'],
          ['`POST /v1/posts`', 'creates the post from media IDs + caption'],
          ['`GET /v1/users/{id}/posts?cursor=…`', 'profile grid, thumbnails only'],
        ]),
        h('Deep Dives'),
        ul(
          "**Memory**: full-resolution photos are huge (a 12 MP image is ~48 MB decoded). Decode downsampled versions for previews; never hold many full bitmaps at once.",
          "**Filters**: run on the GPU (Metal / OpenGL / RenderEffect) for real-time previews.",
          "**Retries**: failed uploads stay in the queue with backoff; the user can cancel.",
          "**Grid performance**: request small square thumbnails; cache them on disk; prefetch while scrolling."
        ),
        h('Wrap Up'),
        ul("Metrics: upload success rate, time to post, crashes from out-of-memory.", "Privacy: EXIF location stripping; permission prompts only when needed."),
      ],
    },

    {
      id: 'location-sharing-app',
      title: 'Live Location Sharing App',
      body: [
        p("Design an app where friends can share their live location with each other on a map for a chosen duration (e.g. 1 hour), like when meeting up."),
        h('Requirements'),
        ul("Start sharing with selected friends for 15 min / 1 h / 8 h; stop anytime.", "Viewers see friends' positions update every few seconds while the map is open.", "Battery use must be modest; works in the background on both iOS and Android.", "Strict privacy: sharing is explicit and time-limited."),
        h('Sender Side'),
        ul(
          "Request the right permission (\"while using\" vs. \"always\") and explain why.",
          "Use the OS location APIs with an **adaptive** strategy: high accuracy and frequent updates when moving fast; significant-location-change or geofencing when stationary.",
          "Batch updates: send at most every N seconds, or when the user has moved more than M metres.",
          "Run as a foreground service on Android (persistent notification); on iOS use background location updates."
        ),
        h('Transport'),
        flow({ nodes: { s: [0, 0.6, 'Sharer device', 'client'], api: [1.2, 0.6, 'Location ingest\nAPI'], store: [2.4, 0, 'Latest location\nstore (TTL)', 'cache'], pub: [2.4, 1.2, 'Pub/sub\nper sharer', 'queue'], v: [3.6, 0.6, 'Viewer devices\n(WebSocket)', 'client'] },
          edges: [['s', 'api', 'HTTPS batch'], ['api', 'store'], ['api', 'pub'], ['pub', 'v', 'live updates'], ['v', 'store', 'initial fetch', 'dash']], ux: 165 }),
        ul(
          "The sharer sends updates over HTTPS (works well in the background); viewers with the map open subscribe over a WebSocket.",
          "The server keeps only the **latest** location per user with a TTL equal to the sharing window, plus an access list of viewers.",
          "When the window ends, the server deletes the data and stops forwarding."
        ),
        h('Viewer Side'),
        ul("Animate markers smoothly between updates (interpolate).", "Show freshness (\"updated 2 min ago\") and accuracy radius.", "Unsubscribe when the map leaves the screen to save battery."),
        h('Wrap Up'),
        ul("Privacy: end-to-end encryption of coordinates; clear in-app indicator while sharing.", "Battery metrics per session; fall back to lower accuracy on low battery.", "Edge cases: permission revoked, device offline, time zones for expiry."),
      ],
    },

    {
      id: 'video-streaming-app',
      title: 'Video Streaming App',
      body: [
        p("Design the client for a video streaming app with a browse screen, a player, and offline downloads."),
        h('Requirements'),
        ul("Browse rows of titles; play with minimal start-up delay.", "Adapt quality to network conditions; resume where the user left off on any device.", "Download episodes for offline viewing; protected content (DRM)."),
        h('Playback'),
        ul(
          "Use **adaptive bitrate streaming** (HLS / DASH): the manifest lists renditions at several bitrates; the player (AVPlayer / ExoPlayer) switches between segments based on measured bandwidth and buffer level.",
          "Start fast: begin at a lower bitrate, prefetch the manifest and first segments when the user lands on a title page.",
          "Report the playback position to the server every ~10 seconds and on pause, for cross-device resume."
        ),
        flow({ nodes: { ui: [0, 0.6, 'Player UI', 'client'], pl: [1, 0.6, 'Player engine\nABR, buffer'], drm: [2, 0, 'DRM license\nserver', 'ext'], cdn: [2, 1.2, 'CDN\nmanifest + segments', 'ext'], prog: [1, 1.8, 'Progress sync'] , api: [2.2, 1.8, 'Playback API'] },
          edges: [['ui', 'pl'], ['pl', 'drm', 'license'], ['pl', 'cdn', 'segments'], ['ui', 'prog'], ['prog', 'api', 'position']], ux: 175 }),
        h('Downloads'),
        ol(
          "User picks quality; the app checks free storage and network type (Wi-Fi only by default).",
          "A **download manager** fetches segments with the platform's background download APIs, tracking progress per segment so it can resume.",
          "Obtain an **offline DRM license** with an expiry; store it securely.",
          "Store metadata (title, artwork, expiry) in the local DB so the Downloads screen works offline."
        ),
        h('Browse Screen'),
        ul("A single API returns the screen layout (rows of titles), so it can change without an app release.", "Cache artwork aggressively; lazy-load rows as the user scrolls.", "Show personalised rows from the server; cache the last response for instant start."),
        h('Wrap Up'),
        ul("Key metrics: time to first frame, rebuffering ratio, playback failures, download success.", "Edge cases: DRM license expiry offline, storage full, switching networks mid-play."),
      ],
    },
  ]);
})();
