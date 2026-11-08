/* Additional chapters inserted into the ML, Behavioral, GenAI and Mobile kits. */
(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, state, pre, code } = K;
  const star = (s, t, a, r) => table(['', 'Example answer'], [['**Situation**', s], ['**Task**', t], ['**Action**', a], ['**Result**', r]]);

  // ------------------------------------------------------------------ ML
  K.chapters('machine-learning-system-design-interview', [{
    id: 'street-view-blurring-system',
    title: 'Street View Blurring System',
    body: [
      p("Street-level imagery must protect privacy: every **face** and **licence plate** in billions of panoramic photos should be blurred before publication. We'll design the detection system that finds them."),
      h('Clarifying Requirements'),
      ul("Objects to blur: human faces and licence plates.", "Billions of existing images plus millions of new ones per day; batch processing is fine (no real-time requirement).", "Missing an object (false negative) is worse than blurring something unnecessary (false positive).", "Users can report missed objects; reports become training data."),
      h('Frame the Problem as an ML Task'),
      p("This is **object detection**: given an image, output bounding boxes with a class (face, plate) and a confidence score. Every box above a threshold gets blurred."),
      table(['Detector family', 'Idea', 'Trade-off'], [
        ['Two-stage (region proposals, then classify)', 'propose candidate regions, then classify and refine each', 'accurate, slower'],
        ['One-stage', 'predict boxes and classes in one pass over a grid', 'fast; accuracy has caught up'],
        ['Transformer-based', 'set prediction with attention', 'strong, needs more compute'],
      ]),
      p("Because processing is offline and recall matters most, an accurate two-stage or large one-stage detector is reasonable."),
      h('Data Preparation'),
      ul("Labelled images with boxes for faces and plates (annotation is costly; use model-assisted labelling).", "Augment with blur, brightness, occlusion, scale and perspective changes, since objects appear tiny or skewed in panoramas.", "Balance: most image regions contain no objects."),
      h('Model Development'),
      ul(
        "Backbone (CNN or vision transformer) extracts features; a **feature pyramid** handles both large and tiny objects.",
        "Losses: classification loss for the object class plus regression loss for box coordinates.",
        "**Non-maximum suppression (NMS)** removes overlapping duplicate boxes: keep the highest-scoring box and drop others with high overlap (IoU)."
      ),
      h('Evaluation'),
      ul("**IoU** (intersection over union) decides whether a predicted box matches a ground-truth box.", "**mAP** (mean average precision across IoU thresholds and classes) is the standard offline metric; also track **recall at the chosen threshold**.", "Online: user reports of unblurred faces/plates per million images."),
      h('Serving'),
      flow({ nodes: { up: [0, 0.6, 'New imagery', 'store'], pre: [1.2, 0.6, 'Preprocess\ntile panoramas'], det: [2.4, 0.6, 'Detector\n(batch, GPUs)', 'ml'], blur: [3.6, 0.6, 'Blur boxes'], pub: [4.8, 0.6, 'Publish', 'client'], rep: [3.6, 1.8, 'User reports →\nlabelling → retrain', 'ml'] },
        edges: [['up', 'pre'], ['pre', 'det'], ['det', 'blur', 'boxes + NMS'], ['blur', 'pub'], ['pub', 'rep', '', 'dash'], ['rep', 'det', 'new model', 'dash']], ux: 160, bw: 124 }),
      ul("Split large panoramas into overlapping tiles so small objects aren't lost when resizing; merge boxes across tiles.", "Run as a distributed batch pipeline; keep the original unblurred images in restricted storage only as long as policy allows."),
    ],
  }], { after: 'visual-search-system' });

  // ------------------------------------------------------------------ Behavioral
  K.chapters('behavioral-interview', [{
    id: 'user-focus',
    title: 'User and Customer Focus',
    body: [
      p("Strong engineers keep the **people who use the product** in mind: they question requirements that don't serve users, measure real impact, and make trade-offs with user experience in view."),
      h('Typical questions'),
      ul("Tell me about a time you advocated for the user.", "Describe a decision where user needs conflicted with business or technical goals.", "Tell me about a time you used customer feedback to change what you built."),
      h('What a strong answer shows'),
      ul("You sought out real user evidence: support tickets, analytics, user research, talking to customers.", "You balanced user needs with constraints rather than ignoring either.", "The outcome is measured in user terms: adoption, satisfaction, fewer complaints."),
      h('Example'),
      star(
        'Our team planned to add a mandatory phone-number field to signup to reduce fraud. Support tickets showed many users in our largest market didn\'t want to share phone numbers.',
        'I owned the signup flow and wanted to reduce fraud without losing legitimate users.',
        'I analysed fraud cases with the trust team and found most came from a small set of risky signals. I proposed asking for a phone number only when those signals appeared, and set up an A/B test against the mandatory version.',
        'Fraud dropped by the same amount in both variants, but signup completion was 9 points higher with the conditional check, so we shipped it. Since then I check support data before finalising any change to a core flow.'
      ),
    ],
  }], { after: 'company-values' });

  K.chapters('behavioral-interview', [{
    id: 'problem-solving',
    title: 'Problem Solving',
    body: [
      p("Problem-solving questions look for how you break down a hard, unfamiliar problem: gathering information, forming hypotheses, testing them, and choosing a solution with clear trade-offs."),
      h('Typical questions'),
      ul("Tell me about the hardest technical problem you've solved.", "Describe a time you debugged something with very little information.", "Tell me about a creative solution you came up with."),
      h('Structure your Action section around your reasoning'),
      ol("How you **framed** the problem and measured it.", "Hypotheses you considered and how you **ruled them out**.", "The options you weighed and **why** you chose one.", "How you **verified** the fix and prevented recurrence."),
      h('Example'),
      star(
        'Our API\'s p99 latency doubled every day around 2 p.m., with no deploys or traffic spikes at that time.',
        'I was on call and responsible for finding the cause.',
        'I graphed latency alongside every system metric and saw garbage-collection pauses spiking at the same time. Heap dumps showed a cache growing all morning. I traced it to a report job that started at 1:30 p.m. and populated the cache with millions of one-off keys. I considered a bigger heap (only delays the problem) and switching cache libraries (a large change), then chose to give the report job its own short-lived cache and cap the shared cache\'s size.',
        'The afternoon spikes disappeared and p99 returned to 180 ms. I added an alert on cache size and wrote up the investigation, which the team now uses as an example for performance debugging.'
      ),
      note("Interviewers value the **process** as much as the answer. Narrate the dead ends you ruled out; they show judgment."),
    ],
  }], { after: 'ownership-and-initiative' });

  // ------------------------------------------------------------------ GenAI
  K.chapters('generative-ai-system-design-interview', [{
    id: 'general-purpose-chatbot',
    title: 'General-Purpose Chatbot',
    body: [
      p("Design a general-purpose AI assistant that holds multi-turn conversations, answers questions, writes and explains code, and follows instructions safely. The core is a large language model; the system around it handles training, serving and safety."),
      h('Clarifying Requirements'),
      ul("Text-only chat in many languages; multi-turn context.", "Millions of daily users; responses start streaming within ~1 second.", "Must refuse harmful requests and avoid making up facts where possible."),
      h('Training pipeline'),
      flow({ nodes: { pt: [0, 0, 'Pretraining\nweb text, code, books', 'ml'], sft: [1.3, 0, 'Supervised\nfine-tuning', 'ml'], pref: [2.6, 0, 'Preference tuning\n(RLHF / DPO)', 'ml'], ev: [3.9, 0, 'Evaluation\n& red teaming'] },
        edges: [['pt', 'sft', 'base model'], ['sft', 'pref', 'instruction model'], ['pref', 'ev']], ux: 165, bw: 140 }),
      ul(
        "**Pretraining**: next-token prediction on trillions of tokens of filtered, deduplicated data. Produces broad knowledge but not helpful chat behaviour.",
        "**Supervised fine-tuning (SFT)**: train on high-quality (prompt, ideal response) conversations written or reviewed by people.",
        "**Preference tuning**: people (or models) compare pairs of responses; the model is optimised to prefer the better one, improving helpfulness and safety."
      ),
      h('Serving'),
      ul(
        "Conversation history is sent with each request (truncated or summarised to fit the context window).",
        "**Streaming** tokens over server-sent events for perceived speed.",
        "Inference optimisations: batching many requests per GPU, KV-cache reuse, quantisation, speculative decoding.",
        "Input/output safety classifiers and rate limiting around the model."
      ),
      h('Evaluation'),
      ul("Benchmarks for knowledge, reasoning and coding; human preference comparisons between model versions.", "Safety evals: refusal of harmful requests without over-refusing benign ones.", "Online: thumbs up/down, conversation length, regenerations."),
    ],
  }], { after: 'introduction-and-overview' });

  K.chapters('generative-ai-system-design-interview', [
    {
      id: 'language-translation',
      title: 'Language Translation Service',
      body: [
        p("Translate text between many language pairs, for a product used by millions of people on the web and in apps."),
        h('Clarifying Requirements'),
        ul("100+ languages; text up to a few thousand characters; automatic source-language detection.", "Latency under a second for short texts; quality comparable to professional translation for common pairs."),
        h('Frame the Problem'),
        p("**Sequence-to-sequence generation**: an encoder reads the source sentence; a decoder generates the target sentence token by token, attending to the encoder output. A single **multilingual** model, told the target language with a special token, shares knowledge across languages and helps low-resource pairs."),
        h('Data'),
        ul("Parallel corpora (sentence pairs), filtered for alignment quality.", "**Back-translation**: translate monolingual target-language text into the source language with an existing model to create extra synthetic pairs.", "A shared subword tokenizer across all languages."),
        h('Evaluation'),
        ul("Automatic: BLEU / chrF and learned metrics (e.g. COMET-style) against reference translations.", "Human evaluation of adequacy and fluency for key language pairs.", "Online: user edits and \"suggest an edit\" feedback."),
        h('Serving'),
        ul("Language detection → segment text into sentences → batch translate → reassemble with formatting preserved.", "Beam search for quality; cache frequent sentences.", "Smaller distilled models for on-device offline translation."),
      ],
    },
    {
      id: 'image-captioning',
      title: 'Image Captioning',
      body: [
        p("Generate a short, accurate description of an image, e.g. for accessibility alt text or for search indexing."),
        h('Frame the Problem'),
        p("A **vision encoder** turns the image into a sequence of feature vectors; a **text decoder** (a language model) generates the caption while attending to those features. Modern systems connect a pretrained image encoder to a pretrained LLM with a small trainable adapter."),
        flow({ nodes: { img: [0, 0, 'Image', 'client'], enc: [1.2, 0, 'Vision encoder', 'ml'], ad: [2.4, 0, 'Adapter', 'ml'], llm: [3.6, 0, 'Language model\ndecoder', 'ml'], cap: [4.8, 0, '"A dog catching\na frisbee"', 'note'] },
          edges: [['img', 'enc'], ['enc', 'ad', 'patch features'], ['ad', 'llm'], ['llm', 'cap']], ux: 155, bw: 124 }),
        h('Data and Training'),
        ul("Large image-text datasets (filtered for quality and safety), then fine-tuning on human-written captions.", "Train with next-token prediction on captions conditioned on the image."),
        h('Evaluation'),
        ul("Automatic: CIDEr, BLEU, and image-text similarity (CLIP score).", "Human ratings for accuracy (no hallucinated objects) and usefulness.", "For accessibility: screen-reader user feedback."),
        h('Other Talking Points'),
        ul("Hallucinated objects: penalise with grounding checks or object detectors.", "Sensitive content and people: avoid guessing identities or sensitive attributes.", "Latency: small encoders and cached image features."),
      ],
    },
    {
      id: 'text-to-video-generation',
      title: 'Text-to-Video Generation',
      body: [
        p("Generate short video clips (a few seconds) from a text prompt. Video adds the **time** dimension: frames must be individually realistic and temporally consistent."),
        h('Frame the Problem'),
        p("Extend latent diffusion to video: compress the video into a spatio-temporal **latent** with a video autoencoder, then train a **diffusion transformer** that denoises sequences of latent patches conditioned on the text prompt."),
        ul("**Spatio-temporal patches**: treat the latent video as a sequence of 3-D patches so a transformer can attend across space and time.", "**Cascades**: generate a low-resolution, low-frame-rate video first, then upsample spatially and temporally with separate models."),
        h('Data'),
        ul("Large video-text datasets; re-caption videos with a captioning model for detailed descriptions.", "Filter for quality, motion, watermarks and unsafe content; respect licensing.", "Train jointly on images (as single-frame videos) to improve visual quality."),
        h('Evaluation'),
        ul("FVD (Fréchet Video Distance) for realism; CLIP-based text alignment.", "Human ratings for motion quality, consistency and prompt adherence."),
        h('Serving'),
        ul("Very expensive inference: queue requests, show progress, and return results asynchronously.", "Distillation to fewer denoising steps; lower default resolution with optional upscaling.", "Strong prompt and output safety filters; provenance watermarking."),
      ],
    },
  ], { after: 'personalized-headshot-generation' });

  // ------------------------------------------------------------------ Mobile
  K.chapters('mobile-system-design-interview', [
    {
      id: 'ride-hailing-app',
      title: 'Ride-Hailing App (Rider Side)',
      body: [
        p("Design the rider app for a ride-hailing service: set pickup and destination, see a price, request a ride, watch the driver approach on a map, and pay automatically."),
        h('Requirements'),
        ul("Map with nearby cars, pickup pin, destination search.", "Fare estimate before requesting; live driver location and ETA after matching.", "Trip state survives app restarts and poor networks.", "Push notifications for driver arrival when the app is in the background."),
        h('Trip state machine'),
        p("The client mirrors a **server-authoritative** trip state; the UI is a function of that state."),
        flow({ nodes: { a: [0, 0, 'Idle'], b: [1, 0, 'Requesting'], c: [2, 0, 'Driver\nassigned'], d: [3, 0, 'Driver\narrived'], e: [3, 1.2, 'On trip'], f: [2, 1.2, 'Completed\n+ receipt'] },
          edges: [['a', 'b', 'request'], ['b', 'c', 'matched'], ['c', 'd'], ['d', 'e', 'pickup'], ['e', 'f', 'drop-off'], ['b', 'a', 'cancel / no drivers', 'dash']], ux: 160, bw: 120 }),
        h('Networking'),
        ul("REST for requesting, fare estimates, cancelling and receipts.", "A **WebSocket** (foreground) for live driver location and trip-state events; push notifications when backgrounded.", "On reconnect or app launch: `GET /v1/trips/current` restores the true state from the server."),
        h('Map and location'),
        ul("Smoothly animate the driver marker between updates (interpolate position and heading).", "Throttle the rider's own location updates; high accuracy only while choosing pickup.", "Cache map tiles and recent places for fast startup."),
        h('Reliability'),
        ul("Request ride with an **idempotency key** so a retry on a flaky network doesn't create two trips.", "Show clear states for \"reconnecting\" rather than stale data.", "Metrics: request-to-match time shown to users, crash rate during trips, location update latency."),
      ],
    },
    {
      id: 'mobile-payments-app',
      title: 'Mobile Payments App',
      body: [
        p("Design a peer-to-peer payments app: link a bank card, send money to friends, see balance and transaction history, and get notified about incoming payments."),
        h('Requirements'),
        ul("Send money to a contact; request money; transaction history with search.", "Strong security: biometric unlock, no sensitive data in plain storage.", "Payments must never be duplicated, even on flaky networks."),
        h('Security'),
        ul("Card details go straight to the payment provider's SDK and are replaced by a **token**; the app never stores card numbers.", "Auth tokens in the Keychain / Keystore; biometric prompt before sending money.", "Certificate pinning to resist man-in-the-middle attacks; detect rooted/jailbroken devices for high-risk actions.", "Hide sensitive screens in the app switcher; auto-lock after inactivity."),
        h('Sending money'),
        ol("User enters amount and recipient; the app shows a confirmation screen.", "The app creates a **client-generated payment ID** (idempotency key) and calls `POST /v1/payments`.", "The UI shows *pending* until the server confirms; retries reuse the same ID.", "On success, history updates and the recipient gets a push notification."),
        h('History and offline'),
        ul("Cache the latest transactions locally for instant display; paginate with cursors.", "Never perform payments offline; queueing payments for later is confusing and risky. Instead, clearly show that the device is offline."),
        h('Wrap Up'),
        ul("Fraud signals from the device (new device, unusual location) sent with payment requests.", "Accessibility and clear error messages for declined payments.", "Metrics: payment success rate, time to confirmation, duplicate-payment incidents (should be zero)."),
      ],
    },
  ]);
})();
