(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, state, pre, code } = K;

  K.chapters('machine-learning-system-design-interview', [
    {
      id: 'introduction-and-overview',
      title: 'Introduction and Overview',
      body: [
        p("An ML system design interview asks you to design an end-to-end machine learning system, such as a recommender, a search ranker or a fraud detector, that would work in production. Interviewers care less about exotic model architectures and more about whether you can turn a vague product goal into a well-posed ML problem, get the right data, choose sensible models and metrics, and ship and monitor the result."),
        h('A 7-step framework'),
        flow({ nodes: { a: [0, 0, '1. Clarify\nrequirements'], b: [1, 0, '2. Frame as\nML task', 'ml'], c: [2, 0, '3. Data\npreparation'], d: [3, 0, '4. Model\ndevelopment', 'ml'],
          e: [3, 1.2, '5. Evaluation'], f: [2, 1.2, '6. Deployment\n& serving'], g: [1, 1.2, '7. Monitoring\n& iteration'] },
          edges: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f'], ['f', 'g'], ['g', 'c', 'retrain', 'dash']], ux: 165 }),
        h('1. Clarify requirements'),
        ul(
          "**Business objective**: what are we trying to improve? (engagement, revenue, safety)",
          "**Features the system must support**: can users like/dislike? Is there a text query?",
          "**Data**: what exists? Is it labelled? How big is it?",
          "**Constraints**: latency, compute budget, on-device or server, privacy.",
          "**Scale**: number of users and items, growth rate."
        ),
        h('2. Frame the problem as an ML task'),
        ol(
          "Turn the business objective into an **ML objective**. \"Increase watch time\" might become \"predict the probability a user watches a video for at least half its length\".",
          "Define the **inputs and outputs** of the system.",
          "Choose the **ML category**: classification (binary / multi-class / multi-label), regression, ranking (learning to rank), retrieval / embedding similarity, generation."
        ),
        h('3. Data preparation'),
        ul(
          "**Data engineering**: sources, storage (data lake, warehouse), ETL pipelines.",
          "**Feature engineering**: one-hot or embedding categorical features; normalise numerical ones; bucketise; text via tokenization and embeddings; images via pretrained encoders.",
          "**Labels**: hand-labelled vs. *natural* labels from user behaviour (clicks, purchases). Watch for bias in natural labels.",
          "Handle **missing values**, **class imbalance** (resampling, weighted loss) and **privacy**."
        ),
        h('4. Model development'),
        ul(
          "Start with a **simple baseline** (popularity, logistic regression) before deep models.",
          "Typical progressions: logistic regression → gradient-boosted trees → deep networks (two-tower, transformers).",
          "Discuss **training**: dataset construction, loss function, train/validation/test splits that respect time, regularisation, distributed training if data is large."
        ),
        h('5. Evaluation'),
        table(['Offline metrics', 'Online metrics'], [
          ['classification: precision, recall, F1, ROC-AUC, PR-AUC', 'click-through rate, conversion rate'],
          ['ranking: precision@k, recall@k, MRR, mAP, nDCG', 'watch time, session length, revenue'],
          ['regression: MSE, MAE', 'user reports, retention'],
        ]),
        p("Offline metrics guide model choice; **online A/B tests** decide whether to launch."),
        h('6. Deployment and serving'),
        ul(
          "Cloud vs. on-device; batch (pre-computed) vs. online (real-time) prediction.",
          "**Model compression**: quantisation, distillation, pruning.",
          "Test in production: shadow deployment, canary releases, A/B tests, bandits.",
          "Typical serving architecture: **candidate generation** (fast, recall-oriented) → **ranking** (heavier model) → **re-ranking** (business rules, diversity, freshness)."
        ),
        h('7. Monitoring'),
        ul(
          "Operational metrics: latency, throughput, errors, resource use.",
          "ML metrics: input feature distributions, prediction distribution, accuracy on fresh labels.",
          "**Data distribution shift** is the most common cause of silent failure. Retrain regularly."
        ),
      ],
    },

    {
      id: 'visual-search-system',
      title: 'Visual Search System',
      body: [
        p("A visual search system lets users select an image (or a region of one) and returns **visually similar images**, like finding similar products from a photo of a chair."),
        h('Clarifying Requirements'),
        talk(['Candidate', 'Should results be ranked from most to least similar?'], ['Interviewer', 'Yes.'],
          ['Candidate', 'Can users crop part of an image to search?'], ['Interviewer', 'Yes.'],
          ['Candidate', 'Are images only, or videos too? Do we personalise?'], ['Interviewer', 'Images only, no personalisation.'],
          ['Candidate', 'How many images and what latency?'], ['Interviewer', 'About 100 billion images; results within a fraction of a second.'],
          ['Candidate', 'What training data is available?'], ['Interviewer', 'User interactions: which results people click.']),
        h('Frame the Problem as an ML Task'),
        p("**ML objective**: retrieve images visually similar to the query image. **Input**: a query image. **Output**: a ranked list of similar images."),
        p("This is a **representation learning** problem: train a model that maps every image to an **embedding vector** so that similar images are close together. Search then becomes **nearest-neighbour search** in embedding space, ranking by similarity (e.g. cosine similarity)."),
        h('Data Preparation'),
        ul(
          "Images: resize to a fixed size, normalise pixel values, keep a consistent colour mode.",
          "Interaction data (impressions and clicks) can supply training pairs."
        ),
        h('Model Development'),
        h3('Architecture'),
        p("A convolutional network or vision transformer encodes an image into, say, a 512-dimensional embedding."),
        h3('Contrastive training'),
        p("Each training example has a query image, one **positive** image (similar) and several **negatives** (dissimilar). The loss pulls the positive's embedding toward the query and pushes negatives away (a contrastive or softmax-over-similarities loss). Ways to get positives:"),
        table(['Positive source', 'Pros', 'Cons'], [
          ['human labels', 'accurate', 'slow and expensive'],
          ['clicks on search results', 'free, plentiful', 'noisy; clicks aren\'t always similarity'],
          ['augmented copy of the query (self-supervision)', 'no labelling at all', 'learns invariances, not "similar but different" items'],
        ]),
        p("A common approach is self-supervised pretraining with augmentations, then fine-tuning on click data."),
        h('Evaluation'),
        ul(
          "**Offline**: MRR, recall@k, precision@k, **mAP**, and **nDCG** when graded relevance labels exist.",
          "**Online**: click-through rate on results, time spent on suggested images."
        ),
        h('Serving'),
        flow({ nodes: { q: [0, 0, 'Query image', 'client'], pre: [1, 0, 'Preprocess'], enc: [2, 0, 'Embedding\nmodel', 'ml'], nn: [3, 0, 'Nearest-neighbour\nservice'], rr: [4, 0, 'Re-ranking\nfilters, dedup'],
          idx: [3, 1.2, 'Embedding index\n(ANN)', 'db'], ip: [2, 1.2, 'Indexing pipeline'], store: [1, 1.2, 'Image store', 'store'] },
          edges: [['q', 'pre'], ['pre', 'enc'], ['enc', 'nn'], ['nn', 'rr'], ['nn', 'idx', '', 'both'], ['store', 'ip', 'new images'], ['ip', 'idx']], ux: 160, bw: 128 }),
        p("Exhaustive comparison with 100 billion embeddings is impossible at query time, so we use **approximate nearest neighbour (ANN)** search:"),
        ul(
          "**Tree-based** partitioning of the space.",
          "**Locality-sensitive hashing**: similar vectors land in the same buckets.",
          "**Clustering / inverted file + product quantisation**: search only the nearest clusters and compress vectors.",
          "**Graph-based** indexes (HNSW) with excellent speed/recall trade-offs."
        ),
        p("An **indexing pipeline** embeds every new image and adds it to the index offline. Re-ranking removes near-duplicates, private or unsafe images."),
        h('Other Talking Points'),
        ul("Text queries (\"red chair\") via joint text-image embeddings (CLIP-style).", "Object detection to crop the most relevant object automatically.", "Personalised results and moderation of returned images."),
      ],
    },

    {
      id: 'video-search',
      title: 'Video Search System',
      body: [
        p("Users type a text query and expect a ranked list of relevant videos. Unlike visual search, the query is **text** and the results are **videos**, which carry both visual content and text metadata (title, description, tags, transcript)."),
        h('Clarifying Requirements'),
        ul("Text queries only; results ranked by relevance.", "1 billion videos; each has a title, description and tags.", "Training data: 10 million annotated (query, relevant video) pairs.", "No personalisation required; latency within a few hundred milliseconds."),
        h('Frame the Problem as an ML Task'),
        p("Combine two signals:"),
        ul(
          "**Visual search**: a text encoder and a video encoder map queries and videos into the **same embedding space**; relevance = similarity.",
          "**Text search**: classic keyword search over titles, descriptions and tags with an **inverted index** (e.g. BM25 in Elasticsearch)."
        ),
        p("A fusion layer merges both result lists into one ranking."),
        flow({ nodes: { q: [0, 0.6, 'Text query', 'client'], te: [1, 0, 'Text encoder', 'ml'], vs: [2, 0, 'Visual ANN\nsearch'], ts: [1.5, 1.2, 'Text search\n(inverted index)'], fu: [3, 0.6, 'Fusion +\nre-ranking'], out: [4, 0.6, 'Ranked videos', 'client'] },
          edges: [['q', 'te'], ['te', 'vs'], ['q', 'ts'], ['vs', 'fu'], ['ts', 'fu'], ['fu', 'out']] }),
        h('Data Preparation'),
        ul(
          "**Text**: normalise (lowercase, strip punctuation), tokenize (subword tokens), map to IDs, then embed.",
          "**Video**: decode, sample frames (e.g. 1 per second), resize and normalise; optionally use audio and transcripts."
        ),
        h('Model Development'),
        ul(
          "**Text encoder**: a pretrained transformer (BERT-like) produces a query embedding.",
          "**Video encoder**: frame-level image encoder + temporal pooling, or a video transformer.",
          "**Training**: contrastive learning on (query, relevant video) pairs, using other videos in the batch as negatives."
        ),
        h('Evaluation'),
        ul("Offline: **MRR** (one known relevant video per query in the annotated data), recall@k, nDCG.", "Online: click-through rate, video completion rate, total watch time from search."),
        h('Serving'),
        ul(
          "Pre-compute embeddings for every video (an indexing pipeline), store them in an ANN index.",
          "At query time: embed the query (fast), run ANN search and keyword search in parallel, fuse, then re-rank with business rules (freshness, region restrictions, safety)."
        ),
        h('Other Talking Points'),
        ul("Spelling correction and query expansion.", "Multi-lingual queries.", "Using engagement signals as a ranking feature.", "Handling very long videos by indexing segments."),
      ],
    },

    {
      id: 'harmful-content-detection',
      title: 'Harmful Content Detection',
      body: [
        p("Social platforms must find and act on harmful posts: violence, hate speech, harassment, nudity, misinformation, scams. We'll design a system that flags posts (text + images + metadata) for removal or demotion."),
        h('Clarifying Requirements'),
        ul(
          "Posts can contain text, images and video, in many languages.",
          "Several harm categories; the system should say **why** a post was removed (which category).",
          "Both proactive detection (at upload time) and user reports.",
          "Scale: hundreds of millions of posts per day; human reviewers can check only a small fraction."
        ),
        h('Frame the Problem as an ML Task'),
        p("Predict, for each post, the probability that it violates each policy category. That's **multi-label classification** (a post can be both violent and hateful)."),
        table(['Option', 'Description', 'Verdict'], [
          ['one binary classifier', 'harmful vs. not', 'can\'t explain the category'],
          ['one classifier per category', 'separate models', 'expensive to train and maintain'],
          ['multi-label classifier', 'one model, one output per category', 'shared features, but categories compete'],
          ['**multi-task classifier**', 'shared trunk + one head per category', '**chosen**: shared learning, per-category tuning'],
        ]),
        h3('Fusing modalities'),
        ul(
          "**Early fusion**: combine text, image and metadata features into one vector, then classify. Captures interactions (a harmless image + harmless caption can be harmful together). Needs lots of data.",
          "**Late fusion**: classify each modality separately and combine predictions. Simpler but misses cross-modal meaning."
        ),
        h('Data Preparation'),
        ul(
          "**Text**: a multilingual transformer encoder.",
          "**Images/video**: pretrained vision encoders; sample video frames.",
          "**User features**: account age, past violations, report history.",
          "**Context**: number of reports, reactions, share velocity.",
          "**Labels**: human review decisions (accurate, slow) and user reports (fast, noisy)."
        ),
        h('Model Development'),
        flow({ nodes: { t: [0, 0, 'Text', 'note'], i: [0, 1, 'Image / video', 'note'], u: [0, 2, 'Author + context', 'note'],
          f: [1.3, 1, 'Fusion layer\n(early)', 'ml'], s: [2.5, 1, 'Shared layers', 'ml'],
          h1: [3.8, 0, 'Violence head', 'ml'], h2: [3.8, 1, 'Hate head', 'ml'], h3: [3.8, 2, 'Nudity head …', 'ml'] },
          edges: [['t', 'f'], ['i', 'f'], ['u', 'f'], ['f', 's'], ['s', 'h1'], ['s', 'h2'], ['s', 'h3']], ux: 150, bw: 124 }),
        p("Each head outputs a probability with binary cross-entropy loss; the total loss is the sum. Class imbalance is severe (harmful posts are rare), so use weighted losses or resampling."),
        h('Evaluation'),
        ul(
          "Offline: **PR-AUC** per category (better than ROC-AUC for rare positives), precision at a fixed recall.",
          "Online: **prevalence** (share of harmful views that got through), valid appeals and reversals, proactive rate (found before users reported it), user reports per view."
        ),
        h('Serving'),
        ul(
          "Run the model at upload. High-confidence violations are removed automatically; medium-confidence ones are **demoted** and queued for human review.",
          "Prioritise the review queue by predicted harm × expected reach.",
          "Reviewer decisions become new labels; retrain often because adversaries adapt."
        ),
        h('Other Talking Points'),
        ul("Hash matching for known bad images (perceptual hashes).", "Bias and fairness across languages and dialects.", "Explainability for appeals.", "Adversarial attacks such as text inside images or deliberate misspellings."),
      ],
    },

    {
      id: 'video-recommendation-system',
      title: 'Video Recommendation System',
      body: [
        p("A video platform's home page shows personalised recommendations. The goal is to help users find videos they'll enjoy, which increases engagement."),
        h('Clarifying Requirements'),
        ul("Business goal: increase engagement.", "Homepage recommendations (not \"up next\").", "~1 billion users, 10 billion videos; results within ~200 ms.", "Signals: impressions, clicks, watch time, likes, shares; videos have titles, tags, category and language."),
        h('Frame the Problem as an ML Task'),
        p("Several possible objectives: maximise clicks (rewards clickbait), maximise completed videos (favours short videos), maximise watch time, or maximise **relevance** defined from a mix of explicit and implicit signals. A common choice: label a video *relevant* if the user liked or shared it, or watched at least half of it."),
        h3('Recommendation approaches'),
        table(['Approach', 'Idea', 'Strengths', 'Weaknesses'], [
          ['Content-based filtering', 'recommend videos similar to ones the user liked, using video features', 'works for new videos; explainable', 'doesn\'t discover new interests'],
          ['Collaborative filtering', 'users with similar histories like similar videos (matrix factorisation)', 'no video features needed; finds new interests', 'cold start for new users and videos'],
          ['**Hybrid**', 'combine both, usually in a multi-stage pipeline', 'best of both', 'more complex'],
        ]),
        h('Model Development'),
        h3('Matrix factorisation'),
        p("Factor the user-video feedback matrix into user embeddings and video embeddings whose dot product predicts relevance. Train with weighted matrix factorisation (observed and unobserved entries) using SGD or alternating least squares. It's simple and fast, but only uses interaction data."),
        h3('Two-tower neural network'),
        p("One tower encodes **user features** (ID, demographics, watch history, search history, context such as time and device), the other encodes **video features** (ID, title, tags, language, duration). Relevance = similarity of the two embeddings. It handles cold start (features, not just IDs) and supports fast retrieval via ANN."),
        flow({ nodes: { uf: [0, 0, 'User features', 'note'], vf: [2, 0, 'Video features', 'note'], ut: [0, 1, 'User tower', 'ml'], vt: [2, 1, 'Video tower', 'ml'], dot: [1, 2, 'similarity\n(dot product)'] },
          edges: [['uf', 'ut'], ['vf', 'vt'], ['ut', 'dot', 'user emb'], ['vt', 'dot', 'video emb']] }),
        h('Serving: a multi-stage pipeline'),
        flow({ nodes: { all: [0, 0, '10B videos', 'db'], cg: [1, 0, 'Candidate\ngeneration', 'ml'], sc: [2, 0, 'Scoring\n(heavier model)', 'ml'], rr: [3, 0, 'Re-ranking'], out: [4, 0, 'Home feed', 'client'] },
          edges: [['all', 'cg', ''], ['cg', 'sc', '~1,000'], ['sc', 'rr', 'scored'], ['rr', 'out', 'top 20']] }),
        ul(
          "**Candidate generation**: several fast generators (two-tower ANN, trending, popular in region) narrow billions of videos to thousands.",
          "**Scoring**: a heavier model with many features (including cross features) scores each candidate precisely.",
          "**Re-ranking**: apply region restrictions, freshness, diversity, removal of watched or misinformation videos."
        ),
        h('Evaluation'),
        ul("Offline: precision@k, mAP, diversity.", "Online: CTR, completed videos, total watch time, explicit feedback (likes, \"not interested\")."),
        h('Other Talking Points'),
        ul("Cold start for new users (popular/onboarding) and new videos (content features, exploration).", "Exploration vs. exploitation.", "Feedback loops and popularity bias.", "Positional bias in training data."),
      ],
    },

    {
      id: 'event-recommendation-system',
      title: 'Event Recommendation System',
      body: [
        p("An event platform (concerts, meetups, workshops) recommends upcoming events a user might attend. Events are short-lived and location-bound, which changes the design compared with video recommendations."),
        h('Clarifying Requirements'),
        ul("Goal: increase ticket sales / registrations.", "Events are created continuously and expire after they happen, so there is almost always a cold-start problem.", "Users can be friends, follow hosts, and register for events.", "1 million events per month; 1 million DAU."),
        h('Frame the Problem as an ML Task'),
        p("Use **pointwise learning to rank**: predict the probability that a user registers for an event, `P(register | user, event)`, then sort by it. Binary classification with registrations as positive labels."),
        h('Feature Engineering'),
        p("Because events are new, rely on **features** rather than IDs:"),
        table(['Group', 'Examples'], [
          ['Location', 'distance between user and event, walk/transit score, same city or country'],
          ['Time', 'time until the event, day of week and hour vs. the user\'s usual habits'],
          ['Social', 'number of friends registered, invited by a friend, host followed by user'],
          ['User', 'age, interests, past categories attended'],
          ['Event', 'category, price vs. the user\'s typical spend, host\'s past popularity, text embedding of the description'],
        ]),
        h('Model Development'),
        ul(
          "Baseline: logistic regression on engineered features.",
          "**Gradient-boosted decision trees** handle heterogeneous features well with little preprocessing.",
          "**Neural networks** shine with lots of data and embeddings; continuous fine-tuning keeps up with new events."
        ),
        p("Class imbalance is strong (most impressions don't lead to registration): use focal loss or class-balanced weighting."),
        h('Evaluation'),
        ul("Offline: **mAP** (relevance is binary), recall@k.", "Online: CTR, conversion rate (registrations / impressions), revenue, bookmark rate."),
        h('Serving'),
        flow({ nodes: { req: [0, 0.6, 'User request', 'client'], ef: [1, 0, 'Event filtering\nlocation, date'], fp: [2, 0.6, 'Feature\npreparation'], fs: [2, 1.8, 'Feature store\n(static + streaming)', 'db'], rk: [3, 0.6, 'Ranking model', 'ml'], out: [4, 0.6, 'Ranked events', 'client'] },
          edges: [['req', 'ef'], ['ef', 'fp', 'candidates'], ['fp', 'fs', '', 'both'], ['fp', 'rk'], ['rk', 'out']] }),
        p("Batch features (user profile, host stats) are pre-computed; **streaming features** (friends who just registered, remaining tickets) are updated in near real time."),
        h('Other Talking Points'),
        ul("Bias toward popular hosts.", "Using friends\' signals while respecting privacy.", "Dynamic pricing interactions.", "Very fresh events: exploration strategies."),
      ],
    },

    {
      id: 'ad-click-prediction',
      title: 'Ad Click Prediction on Social Platforms',
      body: [
        p("Online advertising revenue depends on showing each user the ads they're most likely to engage with. The core model predicts the **click-through probability** (pCTR) of an ad for a user in a context; the ad auction then combines pCTR with bids."),
        h('Clarifying Requirements'),
        ul("Ads appear in a feed; the business goal is revenue.", "Positive label: click. Negatives: impressions without clicks (plus hide/report signals).", "Billions of impressions per day; the model must keep up with new ads and trends; very low latency.", "Highly imbalanced: CTR is typically around 1%."),
        h('Frame the Problem as an ML Task'),
        p("**Binary classification**: predict `P(click | user, ad, context)` and rank ads by expected value (pCTR × bid in the auction)."),
        h('Data Preparation'),
        ul(
          "**Ad features**: ad ID, advertiser ID, campaign, category, image and text embeddings, historical engagement.",
          "**User features**: demographics, interests, past clicks by category.",
          "**Context**: time, device, placement position.",
          "Very high-cardinality IDs are handled with **hashing** or learned embeddings.",
          "**Feature crosses** (e.g. user country × ad language) matter a lot."
        ),
        h('Model Development'),
        table(['Model', 'Notes'], [
          ['Logistic regression', 'fast, interpretable; can\'t learn interactions unless you hand-craft crosses'],
          ['Factorization machines (FM / FFM)', 'learn pairwise feature interactions automatically'],
          ['GBDT + LR', 'trees create features, LR predicts; hard to train continuously'],
          ['**Deep & Cross Network / DeepFM**', 'learn both low- and high-order interactions; standard in industry'],
        ]),
        p("**Continual learning** matters: the ad inventory and user interests shift daily, so fine-tune on fresh data every few hours."),
        h('Evaluation'),
        ul(
          "Offline: **normalised cross-entropy** (log loss relative to a baseline) and **calibration**, because predicted probabilities feed directly into auction pricing. ROC-AUC is common but insensitive to calibration.",
          "Online: CTR, conversion rate, revenue lift, hide rate."
        ),
        h('Serving'),
        flow({ nodes: { req: [0, 0.6, 'Feed request', 'client'], cand: [1, 0.6, 'Candidate ads\ntargeting rules'], rank: [2, 0.6, 'pCTR model', 'ml'], auc: [3, 0.6, 'Auction\npCTR × bid'], out: [4, 0.6, 'Ads in feed', 'client'],
          logs: [2, 1.8, 'Impression &\nclick logs', 'queue'], train: [3, 1.8, 'Continual\ntraining', 'ml'] },
          edges: [['req', 'cand'], ['cand', 'rank'], ['rank', 'auc'], ['auc', 'out'], ['out', 'logs', 'events', 'dash'], ['logs', 'train'], ['train', 'rank', 'new model', 'dash']] }),
        h('Other Talking Points'),
        ul("Delayed feedback (conversions arrive hours later).", "Negative downsampling and recalibration.", "Privacy-preserving signals as third-party cookies disappear.", "Exploration for new ads."),
      ],
    },

    {
      id: 'similar-listings',
      title: 'Similar Listings on Vacation Rental Platforms',
      body: [
        p("While browsing a rental listing, users see a carousel of **similar listings**. Good suggestions help users compare options and book faster."),
        h('Clarifying Requirements'),
        ul("Similar listings should be in the same area and suit the user\'s trip.", "Recommendations are the same for everyone viewing the same listing (no personalisation required), but should react to the current browsing session.", "5 million listings; 100 million users."),
        h('Frame the Problem as an ML Task'),
        p("Learn a **listing embedding** such that listings users tend to view in the **same session** are close together. Similar listings = nearest neighbours of the current listing's embedding. This is the word2vec idea applied to browsing sessions: listings are \"words\", sessions are \"sentences\"."),
        pre(`
          session 1:  L12 → L7 → L33 → L7 → L91 (booked)
          session 2:  L5  → L12 → L44
          skip-gram: listings appearing within a window of each other become positives
        `),
        h('Data Preparation'),
        ul("Build browsing sessions from click logs: sequences of listing views, split when the user is inactive for more than 30 minutes.", "Drop very short sessions and accidental clicks (dwell time under a few seconds)."),
        h('Model Development'),
        ul(
          "Skip-gram with negative sampling: positive pairs are listings within a sliding window; random listings are negatives.",
          "Add the **eventually booked** listing as a global positive for every listing in the session, so embeddings capture booking intent, not just clicks.",
          "Add **hard negatives from the same region**: random negatives are usually in other cities and too easy to tell apart."
        ),
        h('Evaluation'),
        ul("Offline: how highly the eventually booked listing ranks among the similar listings of earlier clicks (average rank / MRR).", "Online: carousel CTR, session booking rate."),
        h('Serving'),
        ul("Pre-compute embeddings daily; new listings without sessions get the average embedding of nearby listings with similar attributes (cold start).", "At request time: ANN search around the current listing's embedding, filtered by location, dates and availability, then re-ranked by price range and guest count."),
      ],
    },

    {
      id: 'personalized-news-feed',
      title: 'Personalized News Feed',
      body: [
        p("A social feed ranks posts from friends, groups and pages so that the most engaging, relevant content appears first, rather than in purely chronological order."),
        h('Clarifying Requirements'),
        ul("Goal: increase user engagement (and long-term satisfaction).", "Post types: text, images, video, shares.", "Engagement types: click, like, comment, share, hide, report, dwell time.", "Latency budget ~200 ms; 3 billion users; feeds must include fresh posts."),
        h('Frame the Problem as an ML Task'),
        p("Engagement has many forms with different value. Predict the probability of each, then combine:"),
        state('score = Σ  weight(reaction) × P(reaction | user, post)\nweights: like 1, comment 5, share 10, hide −20, report −50 …'),
        p("This is a **multi-task** model: a shared trunk with one head per reaction. Negative reactions get negative weights so the feed avoids content people dislike. Add **dwell time** (regression) and \"skip\" signals to capture passive users who rarely click."),
        h('Data Preparation'),
        table(['Group', 'Examples'], [
          ['Post', 'text and image embeddings, age of post, hashtags, author, number of reactions so far'],
          ['User', 'demographics, interests, devices'],
          ['User-author affinity', 'past interactions with this author, close-friend signal, being tagged'],
          ['Context', 'time of day, connection quality'],
        ]),
        h('Model Development'),
        flow({ nodes: { f: [0, 1, 'Features', 'note'], s: [1, 1, 'Shared layers', 'ml'],
          a: [2.2, 0, 'P(like)', 'ml'], b: [2.2, 0.75, 'P(comment)', 'ml'], c: [2.2, 1.5, 'P(share)', 'ml'], d: [2.2, 2.25, 'P(hide)', 'ml'], w: [3.4, 1.1, 'Weighted\nscore'] },
          edges: [['f', 's'], ['s', 'a'], ['s', 'b'], ['s', 'c'], ['s', 'd'], ['a', 'w'], ['b', 'w'], ['c', 'w'], ['d', 'w']], uy: 80, bh: 42 }),
        h('Evaluation'),
        ul("Offline: ROC-AUC / PR-AUC per reaction head.", "Online: daily active users, time spent, number of reactions, user satisfaction surveys, hides and reports."),
        h('Serving'),
        ul("**Retrieval**: collect fresh, unseen posts from connections, groups and pages.", "**Ranking**: score candidates with the multi-task model.", "**Re-ranking**: diversity (don't show five posts from the same author), integrity filters, boosting fresh content.", "Pre-compute features where possible; a feature store serves the rest."),
        h('Other Talking Points'),
        ul("Viral posts and cold-start authors.", "Long-term vs. short-term engagement (avoid clickbait).", "Positional bias in logged data."),
      ],
    },

    {
      id: 'people-you-may-know',
      title: 'People You May Know',
      body: [
        p("\"People You May Know\" (PYMK) suggests new connections. More connections make a social network more valuable, so this feature drives growth."),
        h('Clarifying Requirements'),
        ul("Goal: increase the number of meaningful connections formed.", "Signals: existing connections, shared schools and employers, location, profile views.", "1 billion users, average 1,000 connections; connections are mutual (undirected)."),
        h('Frame the Problem as an ML Task'),
        p("Model the social network as a **graph** and frame PYMK as **link prediction**: predict the probability that an edge (connection) will form between two users. Rank candidate users by that probability."),
        h('Candidate Generation'),
        p("Scoring all 1 billion users is impossible. Most new connections are **friends of friends** (2 hops away), which typically narrows candidates to a few hundred thousand, then further by simple filters (same region, shared school)."),
        flow({ nodes: { u: [1, 0, 'You', 'client'], a: [0, 1, 'Ana'], b: [2, 1, 'Ben'], c: [0, 2, 'Chen\n(2 mutual)', 'ml'], d: [1, 2, 'Dee'], e: [2, 2, 'Eli'] },
          edges: [['u', 'a', '', 'both'], ['u', 'b', '', 'both'], ['a', 'c', '', 'both'], ['b', 'c', '', 'both'], ['a', 'd', '', 'both'], ['b', 'e', '', 'both']], ux: 150, bw: 110 }),
        h('Features'),
        table(['Group', 'Examples'], [
          ['Graph', 'number of mutual connections, Jaccard / Adamic-Adar similarity, time since mutuals connected'],
          ['Profile overlap', 'same school or company with overlapping years, same city, shared skills'],
          ['Activity', 'profile views between the two users, recent searches'],
        ]),
        h('Model Development'),
        ul("Baseline: GBDT on hand-crafted pairwise features.", "**Graph neural networks** learn node embeddings by aggregating neighbourhood information, capturing structure beyond hand-made features; predict link probability from the two embeddings."),
        h('Evaluation'),
        ul("Offline: ROC-AUC / mAP on held-out edges formed after a cut-off date.", "Online: connection requests sent, **requests accepted** (the better metric: it captures mutual interest)."),
        h('Serving'),
        ul("The graph changes slowly, so compute PYMK suggestions in **batch** (e.g. daily) and store them per user; serve from a cache.", "Refresh more often for new users, whose graph grows fastest."),
        h('Other Talking Points'),
        ul("Privacy: avoid revealing sensitive relationships.", "Fairness: don't only recommend already-popular people.", "Handling time: recent connections are more predictive."),
      ],
    },
  ]);
})();
