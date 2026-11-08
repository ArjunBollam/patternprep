/* More Mobile System Design chapters: a framework, stock trading, pagination library, hotel reservation,
   cloud file sync and a quick-reference cheat sheet. */
(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, state, pre, code } = K;

  K.chapters('mobile-system-design-interview', [
    {
      id: 'a-framework-for-mobile-system-design',
      title: 'A Framework for Mobile System Design Interviews',
      body: [
        p("Mobile system design interviews focus on the **client**: how the app is structured, how it talks to the backend, and how it stays fast, correct and frugal with battery and data on unreliable networks. A clear framework keeps a 45-60 minute discussion on track and makes sure you touch everything interviewers grade."),
        h('The steps'),
        table(['Step', 'What to produce', 'Time'], [
          ['1. Requirements and scope', 'core features, out-of-scope items, platforms, offline needs, scale (users, data sizes)', '5-8 min'],
          ['2. High-level client design', 'screens, layers (UI, state, domain, data) and the main data flows', '8-10 min'],
          ['3. API and data model', 'endpoints or real-time channels, payload shapes, the local schema', '8-10 min'],
          ['4. Deep dives', '2-3 topics the interviewer cares about: offline, sync, performance, real-time, security', '15-20 min'],
          ['5. Wrap up', 'metrics, testing, rollout, accessibility, what you\'d do next', '3-5 min'],
        ]),
        h('Step 1: requirements'),
        talk(
          ['Candidate', 'Which features must the first version have, and which can we skip?'],
          ['Interviewer', 'Browsing and searching are core; sharing can be skipped.'],
          ['Candidate', 'Should it work offline, and how fresh must the data be?'],
          ['Interviewer', 'Read-only offline is enough; data can be a few minutes stale.'],
          ['Candidate', 'Do we design the backend too, or assume an API?'],
          ['Interviewer', 'Assume an API, but you may propose changes to it.']
        ),
        p("Also ask about **non-functional** needs: supported OS versions, low-end devices, typical network conditions, privacy rules, and accessibility."),
        h('Step 2: client architecture'),
        flow({ nodes: { ui: [0, 0, 'UI layer\nscreens, components', 'client'], st: [1, 0, 'State holders\nview models'], dom: [2, 0, 'Domain\nuse cases'], repo: [3, 0, 'Repositories\nsingle source of truth'], net: [4, -0.6, 'Network\nAPI client', 'ext'], db: [4, 0.6, 'Local storage\nDB, files', 'db'] },
          edges: [['ui', 'st', 'events'], ['st', 'ui', 'state', 'dash'], ['st', 'dom'], ['dom', 'repo'], ['repo', 'net', '', 'both'], ['repo', 'db', '', 'both']], ux: 150 }),
        ul(
          "**Unidirectional data flow**: UI sends events, state holders produce immutable state, UI renders it.",
          "**Repository as the single source of truth**: the UI reads from local storage; the repository decides when to refresh from the network.",
          "**Dependency injection** keeps each layer testable."
        ),
        h('Step 3: API and data model'),
        ul(
          "Choose the transport per feature: REST or GraphQL for request/response; WebSocket, server-sent events or push notifications for real-time updates.",
          "Design for mobile: **cursor-based pagination**, small payloads, field selection, compressed responses, multiple image sizes, idempotency keys for writes.",
          "Sketch the local schema: tables, keys, and what is cached versus always fetched."
        ),
        h('Step 4: deep-dive menu'),
        table(['Topic', 'Questions to address'], [
          ['Offline and sync', 'what works offline, how pending writes are queued, how conflicts are resolved'],
          ['Performance', 'startup time, smooth lists, image loading and caching, memory'],
          ['Networking', 'retries with backoff, timeouts, request deduplication, low-bandwidth modes'],
          ['Real-time', 'connection lifecycle, reconnection, ordering and gaps'],
          ['Battery and data', 'batching, background work limits, prefetch only on Wi-Fi'],
          ['Security and privacy', 'token storage, certificate pinning, encryption at rest, permissions'],
          ['Reliability', 'crash reporting, feature flags, staged rollouts, kill switches'],
        ]),
        h('Step 5: wrap up'),
        ul("Name 3-4 **metrics**: crash-free sessions, time to first content, frame drops, data per session.", "Explain **testing**: unit tests for state and repositories, UI tests for flows, fake servers for network edge cases.", "Mention **rollout**: feature flags and staged releases, because shipped app versions can't be recalled."),
        note("The biggest difference from backend design: you can't fix a shipped client instantly. Design for old app versions still in use, remote configuration, and graceful degradation."),
      ],
    },

    {
      id: 'stock-trading-app',
      title: 'Stock Trading App',
      body: [
        p("Design the mobile client of a stock trading app: users watch live prices on a watchlist, view a stock's chart, place buy and sell orders, and see their portfolio and order status update in real time."),
        h('Requirements'),
        talk(['Candidate', 'Which order types?'], ['Interviewer', 'Market and limit orders. No options or margin.'],
          ['Candidate', 'How fresh must prices be?'], ['Interviewer', 'Live while the app is open; about one update per second per symbol is fine.'],
          ['Candidate', 'What happens if the connection drops during an order?'], ['Interviewer', 'That\'s for you to design. Users must never place an order twice by accident.']),
        ul("Watchlist with live prices and daily change.", "Stock detail with an intraday chart.", "Place, view and cancel orders; real-time order status.", "Portfolio with positions and value.", "Non-functional: correctness of orders above all, low latency for quotes, strong security, clear stale-data indicators."),
        h('High-level design'),
        flow({ nodes: { ui: [0, 0.6, 'Screens\nwatchlist, detail,\norder ticket', 'client'], vm: [1.2, 0.6, 'View models'], quotes: [2.4, 0, 'QuoteRepository\nsubscriptions'], orders: [2.4, 1.2, 'OrderRepository\noutbox + status'], ws: [3.7, 0, 'Market data\nWebSocket', 'ext'], api: [3.7, 1.2, 'Trading API\nREST', 'ext'], db: [2.4, 2.3, 'Encrypted local DB\nportfolio, orders', 'db'] },
          edges: [['ui', 'vm'], ['vm', 'quotes'], ['vm', 'orders'], ['quotes', 'ws', 'subscribe', 'both'], ['orders', 'api', 'place / cancel', 'both'], ['orders', 'db', '', 'both']], ux: 150 }),
        h('API'),
        table(['Interface', 'Notes'], [
          ['WebSocket `subscribe {symbols: [...]}`', 'server pushes `{symbol, price, change, ts, seq}`; client re-subscribes to the visible symbols only'],
          ['`POST /v1/orders` with `Idempotency-Key` header', '`{symbol, side, type, quantity, limit_price}`; returns `{order_id, status}`'],
          ['`GET /v1/orders?status=open`', 'open orders, used after reconnecting'],
          ['`DELETE /v1/orders/{id}`', 'cancel; may fail if already filled'],
          ['Push / WebSocket `order_update`', 'status changes: `accepted`, `partially_filled`, `filled`, `cancelled`, `rejected`'],
        ]),
        h('Deep dives'),
        h3('Placing an order exactly once'),
        ol(
          "When the user taps **Buy**, create an order record locally with a client-generated **idempotency key** and status `submitting`; disable the button.",
          "Send the request. If the network fails or times out, **retry with the same key**: the server returns the original result instead of creating a second order.",
          "If the app is killed mid-request, the outbox resends on next launch, or first queries order status by the key.",
          "Show the final status from the server; never assume success from a timeout."
        ),
        note("Idempotency keys are the core idea here. They turn *maybe sent* into *safe to retry*."),
        h3('Live quotes without draining the battery'),
        ul(
          "One WebSocket connection, multiplexing all subscriptions; subscribe only to **visible** symbols and unsubscribe as rows scroll away.",
          "Throttle UI updates (for example, at most 2 per second per row) and coalesce bursts: render only the latest price.",
          "Pause the stream when the app goes to the background; on return, resubscribe and fetch a snapshot to fill the gap.",
          "Show a **stale** indicator if the last update for a symbol is older than a few seconds."
        ),
        h3('Charts'),
        ul("Fetch historical candles once per range (1D, 1W, …) and cache them; append live ticks to the last candle locally.", "Downsample to about one point per pixel before drawing; large ranges don't need every tick."),
        h3('Security'),
        ul("Store tokens in the Keychain / Keystore; require biometrics or a PIN to open the app and to confirm orders.", "Certificate pinning and short-lived access tokens with refresh.", "Encrypt the local database; hide sensitive screens in the app switcher."),
        h('Wrap up'),
        ul("Metrics: order submission success rate, quote latency, reconnect frequency, crash-free sessions.", "Edge cases: market closed (queue or reject), insufficient funds, partial fills, price moved a lot between ticket and submit (show a confirmation)."),
      ],
    },

    {
      id: 'pagination-library',
      title: 'Pagination Library',
      body: [
        p("Design a reusable client-side **pagination library**: a component that loads a long list page by page as the user scrolls, caches pages, survives configuration changes, handles errors and retries, and supports refreshing. Feed, search and comment screens across the app would all use it."),
        h('Requirements'),
        ul(
          "Generic over item type and page key (cursor or page number).",
          "Loads the first page, then the next page when the user nears the end; optionally the previous page (bidirectional).",
          "Exposes a stream of **UI state**: items, loading/error states for the start and end of the list, and whether the end has been reached.",
          "Deduplicates concurrent loads; retries failed loads on request.",
          "Supports refresh (start over), and optional local caching (database-backed lists).",
          "Memory-bounded for very long lists."
        ),
        h('Key abstractions'),
        table(['Component', 'Role'], [
          ['`PageSource<K, T>`', 'provided by the app: `load(key, size) → Page(items, prevKey, nextKey)`'],
          ['`Pager<K, T>`', 'the engine: keeps pages, decides when to load, prevents duplicate loads, exposes state'],
          ['`PagingState<T>`', 'immutable snapshot: items, `appendState`, `prependState`, `refreshState` (idle / loading / error)'],
          ['`Prefetch distance`', 'how many items before the end to trigger the next load'],
          ['`Mediator` (optional)', 'writes network pages into a local DB; the UI then pages from the DB'],
        ]),
        flow({ nodes: { ui: [0, 0, 'List UI', 'client'], pager: [1.3, 0, 'Pager\npages, state machine'], src: [2.6, -0.6, 'PageSource\n(app code)', 'ext'], net: [3.9, -0.6, 'API', 'ext'], db: [2.6, 0.7, 'Local DB\n(optional mediator)', 'db'] },
          edges: [['ui', 'pager', 'item i visible'], ['pager', 'ui', 'PagingState', 'dash'], ['pager', 'src', 'load(key)'], ['src', 'net'], ['pager', 'db', '', 'both']], ux: 160 }),
        h('The core loop'),
        ol(
          "The UI reports which item index is visible (or simply when it's within `prefetchDistance` of the end).",
          "If no load is running and `nextKey` exists, the pager starts loading the next page and emits `appendState = loading`.",
          "On success, it appends the page, stores the new `nextKey`, and emits the new items. On failure, it emits `appendState = error`, and the UI shows a retry row that calls `retry()`.",
          "`refresh()` cancels in-flight loads, clears pages, and loads from the initial key."
        ),
        h('A minimal implementation'),
        code({ kt: `
          data class Page<K, T>(val items: List<T>, val nextKey: K?)

          fun interface PageSource<K, T> {
              suspend fun load(key: K, size: Int): Page<K, T>
          }

          sealed interface LoadState { object Idle : LoadState; object Loading : LoadState; data class Error(val e: Throwable) : LoadState }

          data class PagingState<T>(val items: List<T>, val append: LoadState, val endReached: Boolean)

          class Pager<K, T>(
              private val source: PageSource<K, T>,
              private val initialKey: K,
              private val pageSize: Int = 20,
              private val prefetchDistance: Int = 5,
          ) {
              private val _state = MutableStateFlow(PagingState<T>(emptyList(), LoadState.Idle, false))
              val state: StateFlow<PagingState<T>> = _state
              private var nextKey: K? = initialKey
              private var job: Job? = null

              fun onItemVisible(index: Int, scope: CoroutineScope) {
                  val s = _state.value
                  if (index >= s.items.size - prefetchDistance) loadNext(scope)
              }

              fun loadNext(scope: CoroutineScope) {
                  val key = nextKey ?: return              // end reached
                  if (job?.isActive == true) return        // a load is already running
                  _state.update { it.copy(append = LoadState.Loading) }
                  job = scope.launch {
                      try {
                          val page = source.load(key, pageSize)
                          nextKey = page.nextKey
                          _state.update { PagingState(it.items + page.items, LoadState.Idle, page.nextKey == null) }
                      } catch (e: Exception) {
                          _state.update { it.copy(append = LoadState.Error(e)) } // UI shows "retry"
                      }
                  }
              }

              fun refresh(scope: CoroutineScope) {
                  job?.cancel()
                  nextKey = initialKey
                  _state.value = PagingState(emptyList(), LoadState.Idle, false)
                  loadNext(scope)
              }
          }
          ` }),
        h('Deep dives'),
        h3('Cursors versus page numbers'),
        p("Offset pages (`page=3`) shift when items are inserted or deleted, causing duplicates or gaps. **Cursors** (an opaque token for *after item X*) are stable, so the library should treat keys as opaque values supplied by the `PageSource`."),
        h3('Memory limits'),
        p("For lists with thousands of items, keep only a window of pages in memory (`maxSize`) and drop pages far from the viewport, keeping their keys so they can be reloaded. Placeholders keep the scroll position stable."),
        h3('Database-backed paging'),
        p("For offline support, a mediator writes each network page into the local database, and the UI pages from the database. The database becomes the single source of truth, and refresh means *clear and re-fetch* inside one transaction."),
        h3('Testing'),
        ul("Fake `PageSource` with controllable delays and failures.", "Assert state sequences: idle → loading → idle, error then retry, end reached.", "Verify that rapid scroll events trigger only one load per page."),
      ],
    },

    {
      id: 'hotel-reservation-app',
      title: 'Hotel Reservation App',
      body: [
        p("Design the mobile client of a hotel booking app: users search hotels by destination and dates, browse results with photos and prices, view a hotel's rooms, book a room, and manage upcoming reservations, including offline access to booking confirmations."),
        h('Requirements'),
        ul(
          "Search by location, dates and guests, with filters (price, rating, amenities) and sorting.",
          "Hotel details: photo gallery, room types, prices for the chosen dates, cancellation policy.",
          "Booking flow: choose a room, enter guest details, pay, receive a confirmation.",
          "My trips: upcoming and past bookings, **available offline**.",
          "Non-functional: fast search, accurate prices at checkout, never double-book, smooth on low-end devices."
        ),
        h('High-level design'),
        flow({ nodes: { search: [0, 0, 'Search +\nresults', 'client'], detail: [0, 1.2, 'Hotel detail\n+ booking', 'client'], trips: [0, 2.4, 'My trips', 'client'], repo: [1.4, 1.2, 'Repositories'], api: [2.8, 0.6, 'Search / booking API', 'ext'], pay: [2.8, 1.8, 'Payment SDK', 'ext'], db: [1.4, 2.6, 'Local DB\ntrips, recent searches', 'db'] },
          edges: [['search', 'repo'], ['detail', 'repo'], ['trips', 'repo'], ['repo', 'api', '', 'both'], ['detail', 'pay', 'tokenise card'], ['repo', 'db', '', 'both']], ux: 150 }),
        h('API'),
        table(['Endpoint', 'Notes'], [
          ['`GET /v1/hotels/search?lat=&lng=&checkin=&checkout=&guests=&cursor=`', 'paginated results with a thumbnail URL, nightly price and rating'],
          ['`GET /v1/hotels/{id}?checkin=&checkout=`', 'details plus available room types and prices for the dates'],
          ['`POST /v1/holds` → `{hold_id, expires_at, total_price}`', 'temporarily reserves the room while the user pays'],
          ['`POST /v1/bookings` with `Idempotency-Key`', '`{hold_id, guest, payment_token}` → confirmation'],
          ['`GET /v1/bookings?cursor=`', 'the user\'s trips'],
        ]),
        h('Deep dives'),
        h3('Prices that stay honest'),
        p("Search results are cached and may be stale, so the detail screen always re-fetches prices for the chosen dates. At checkout, a **hold** locks the room and the exact total for a few minutes; the booking screen shows a countdown and re-quotes if the hold expires. This avoids the classic *price changed at the last step* surprise."),
        h3('Booking exactly once'),
        ol("Create the hold, then send the booking with an idempotency key.", "On timeout, retry with the same key, or query the booking by key.", "Store the confirmation locally as soon as it arrives."),
        h3('Search performance'),
        ul(
          "Debounce typing in the destination field (about 300 ms) and cancel outdated requests.",
          "Request a thumbnail size that matches the cell; load the full gallery only on the detail screen.",
          "Cache the last search results so going back is instant; refresh in the background."
        ),
        h3('Offline trips'),
        ul("Save each booking (address, dates, confirmation number, check-in instructions, a static map image) in the local database.", "Refresh trips on app start and after push notifications about changes.", "Add the reservation to the device calendar with the user's permission."),
        h3('Maps'),
        p("Show results on a map with **marker clustering**, and fetch results for the visible region as the user pans (debounced), reusing the same paginated search endpoint with a bounding box."),
        h('Wrap up'),
        ul("Metrics: search latency, search-to-booking conversion, hold expiry rate, booking failure rate.", "Edge cases: time zones for check-in dates, currency display, sold-out rooms between detail and checkout."),
      ],
    },

    {
      id: 'cloud-drive-app',
      title: 'Cloud File Sync App',
      body: [
        p("Design the mobile client of a cloud file storage service (in the style of Google Drive or Dropbox): users browse folders, upload photos and documents, download files for offline use, and see changes made on other devices."),
        h('Requirements'),
        ul(
          "Browse a folder tree; preview common file types.",
          "Upload files (including large videos) reliably on flaky networks, in the background.",
          "Mark files **available offline**; keep them updated when they change elsewhere.",
          "See changes from other devices quickly; resolve conflicting edits.",
          "Non-functional: never lose user data, resumable transfers, respect battery and metered data."
        ),
        h('High-level design'),
        flow({ nodes: { ui: [0, 0.6, 'Browser, preview,\nsettings', 'client'], repo: [1.3, 0.6, 'FileRepository'], meta: [2.6, 0, 'Metadata DB\ntree, versions, sync state', 'db'], cache: [2.6, 1.2, 'File cache\non disk', 'store'], tm: [1.3, 1.9, 'Transfer manager\nqueue, chunks, retries', 'queue'], api: [3.9, 0.6, 'Sync API', 'ext'], blob: [3.9, 1.9, 'Blob storage\n(signed URLs)', 'ext'] },
          edges: [['ui', 'repo'], ['repo', 'meta', '', 'both'], ['repo', 'cache'], ['repo', 'tm'], ['repo', 'api', 'changes', 'both'], ['tm', 'blob', 'chunks', 'both']], ux: 150 }),
        h('API'),
        table(['Endpoint', 'Notes'], [
          ['`GET /v1/changes?cursor=`', 'a change feed: created, updated, moved, deleted entries since the cursor'],
          ['`POST /v1/uploads` → `{upload_id, chunk_size}`', 'starts a resumable upload session'],
          ['`PUT {signed_url}?part=n`', 'uploads chunk `n`; can be retried independently'],
          ['`POST /v1/uploads/{id}/complete`', '`{parent_id, name, sha256, base_version}` creates or updates the file'],
          ['`GET {signed_url}` with `Range` header', 'downloads, resumable from any byte offset'],
        ]),
        h('Deep dives'),
        h3('Resumable chunked uploads'),
        ol(
          "Split the file into chunks (for example 8 MB) and record each chunk's status in the local DB.",
          "Upload chunks with retries and exponential backoff; on restart, ask the server which parts it already has.",
          "Run uploads in a background task that survives app restarts (WorkManager on Android, background URLSession on iOS), with constraints such as *Wi-Fi only* for large files.",
          "Complete the session with a checksum so the server can verify integrity."
        ),
        h3('Keeping in sync'),
        ul(
          "Pull the **change feed** with a cursor: on app start, on a push notification, and periodically while in the foreground.",
          "Apply changes to the metadata DB in a transaction; the UI observes the DB and updates automatically.",
          "For files marked offline, queue downloads of new versions; for other files, only update metadata."
        ),
        h3('Conflicts'),
        p("Every file has a **version**. An upload says which version it was based on. If the server's current version is newer, the edit conflicts: the safest resolution is to keep both, saving the local edit as *name (conflicted copy from Phone)*, and tell the user. Never silently overwrite."),
        h3('Local storage management'),
        ul("Cap the cache size; evict least-recently-used files that aren't marked offline.", "Store files in app-private storage; generate thumbnails for the browser.", "Show per-file sync state: synced, uploading, waiting for Wi-Fi, conflict, error."),
        h('Wrap up'),
        ul("Metrics: upload success rate, time to sync a change across devices, bytes transferred, cache hit rate.", "Edge cases: renaming a folder while its files upload, deleting a file that's open offline, running out of device storage."),
      ],
    },

    {
      id: 'quick-reference-cheat-sheet',
      title: 'Quick Reference Cheat Sheet',
      body: [
        p("A one-page summary of the ideas that come up in almost every mobile system design interview. Use it for a final review before the interview."),
        h('Architecture'),
        table(['Topic', 'Default answer'], [
          ['Layers', 'UI → state holder (view model) → domain → repository → network + local storage'],
          ['Data flow', 'unidirectional: events up, immutable state down'],
          ['Source of truth', 'the local database; the network refreshes it'],
          ['Dependency injection', 'constructor injection; fakes in tests'],
          ['Modularisation', 'feature modules plus shared core modules for build speed and ownership'],
        ]),
        h('Networking'),
        table(['Need', 'Use'], [
          ['Request / response', 'REST or GraphQL over HTTPS, gzip, HTTP/2'],
          ['Server pushes while the app is open', 'WebSocket or server-sent events'],
          ['Wake the app or notify the user', 'push notifications (APNs / FCM)'],
          ['Long lists', 'cursor-based pagination'],
          ['Safe retries of writes', 'idempotency keys'],
          ['Failures', 'timeouts, exponential backoff with jitter, circuit breaking for broken endpoints'],
        ]),
        h('Offline and sync'),
        ul(
          "Read path: show cached data immediately, refresh in the background (stale-while-revalidate).",
          "Write path: optimistic UI + an **outbox** of pending operations with idempotency keys, replayed when online.",
          "Sync: a change feed with a cursor; apply changes transactionally.",
          "Conflicts: version numbers; last-writer-wins only for low-value data; otherwise keep both or merge per field."
        ),
        h('Performance'),
        table(['Area', 'Techniques'], [
          ['Startup', 'lazy initialisation, defer non-critical work, cached first screen'],
          ['Lists', 'recycling lists, stable IDs, fixed cell sizes from server dimensions, prefetching'],
          ['Images', 'right-sized URLs, memory + disk cache, downsampling, placeholders'],
          ['Memory', 'release off-screen resources, bounded caches, watch for leaks'],
          ['Battery and data', 'batch requests, background work with constraints, prefetch on Wi-Fi only'],
        ]),
        h('Security and privacy'),
        ul("Tokens in Keychain / Keystore; short-lived access tokens with refresh.", "TLS everywhere, certificate pinning for sensitive apps.", "Encrypt sensitive local data; minimise data collected; ask for permissions in context."),
        h('Reliability and delivery'),
        ul("Crash and performance monitoring with release tags.", "Feature flags and remote config to turn features off without a release.", "Staged rollouts; support older app versions with backward-compatible APIs.", "Forced-upgrade path for critical issues."),
        h('Numbers worth knowing'),
        state('frame budget at 60 fps: ~16 ms (8 ms at 120 Hz)\ntypical 4G round trip: 50-100 ms; 3G: 200-500 ms\nphoto 1080p JPEG: ~200-500 KB; thumbnail: ~10-30 KB\nchunk size for uploads: 4-16 MB'),
        h('Interview checklist'),
        ol("Clarify features, offline needs, real-time needs and scale.", "Draw the layers and the main data flow.", "Define the API and the local data model.", "Deep dive on 2-3 topics the interviewer cares about.", "Close with metrics, testing and rollout."),
      ],
    },
  ]);

  K.orderChapters('mobile-system-design-interview', [
    'introduction', 'a-framework-for-mobile-system-design', 'mobile-building-blocks', 'news-feed-app', 'chat-app',
    'stock-trading-app', 'pagination-library', 'hotel-reservation-app', 'cloud-drive-app', 'video-streaming-app',
    'photo-sharing-app', 'location-sharing-app', 'ride-hailing-app', 'mobile-payments-app', 'quick-reference-cheat-sheet',
  ]);
})();
