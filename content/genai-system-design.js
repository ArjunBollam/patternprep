(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, state, pre, code } = K;

  K.chapters('generative-ai-system-design-interview', [
    {
      id: 'introduction-and-overview',
      title: 'Introduction and Overview',
      body: [
        p("Generative AI (GenAI) systems **create** content, such as text, code, images, audio or video, instead of only classifying or ranking existing content. A GenAI system design interview asks you to design a product such as a chatbot over company documents, a coding assistant or an image generator, and to reason about models, data, evaluation, cost and safety."),
        h('How GenAI interviews differ'),
        table(['Traditional ML design', 'GenAI design'], [
          ['train a model from scratch on your own labels', 'usually start from a **pretrained foundation model**, then prompt, retrieve or fine-tune'],
          ['outputs are scores or classes', 'outputs are open-ended and harder to evaluate'],
          ['inference is cheap', 'inference is expensive: tokens, GPUs and latency dominate cost'],
          ['risks: bias, drift', 'additional risks: hallucination, prompt injection, unsafe or copyrighted output'],
        ]),
        h('A framework'),
        flow({ nodes: { a: [0, 0, '1. Clarify\nrequirements'], b: [1, 0, '2. Frame as\nGenAI task', 'ml'], c: [2, 0, '3. Data'], d: [3, 0, '4. Model\nchoice & training', 'ml'],
          e: [3, 1.2, '5. Evaluation'], f: [2, 1.2, '6. System design\n& serving'], g: [1, 1.2, '7. Safety &\nmonitoring'] },
          edges: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f'], ['f', 'g']], ux: 165 }),
        h('LLM essentials'),
        ul(
          "**Tokens**: models read and write sub-word tokens (roughly 3-4 characters of English each). Cost and latency scale with tokens in and out; context windows are measured in tokens.",
          "**Transformer decoder**: predicts the next token given previous tokens, using self-attention over the context.",
          "**Training stages**: *pretraining* on huge text corpora (next-token prediction) → *supervised fine-tuning* on instruction/response examples → *preference tuning* (RLHF, DPO) so answers are helpful and safe.",
          "**Decoding**: greedy, beam search, or sampling with **temperature** and **top-p**. Lower temperature = more deterministic, higher = more varied.",
          "**Adapting a model**: prompt engineering (cheapest) → retrieval-augmented generation (adds fresh/private knowledge) → parameter-efficient fine-tuning such as LoRA (changes style/behaviour) → full fine-tuning (most expensive)."
        ),
        h('Image generation essentials'),
        ul(
          "**Diffusion models** learn to remove noise step by step; generation starts from pure noise and denoises toward an image, guided by a text embedding.",
          "**Latent diffusion** runs this in a compressed latent space for efficiency; a decoder turns latents into pixels.",
          "**Classifier-free guidance** strengthens how closely the image follows the prompt."
        ),
        h('Serving concerns'),
        ul(
          "**Latency**: stream tokens as they're generated; use KV caching, batching and smaller distilled models.",
          "**Cost**: route easy requests to small models; cache frequent answers; cap output length.",
          "**Safety**: input and output filters, refusal behaviour, rate limits, red-teaming."
        ),
      ],
    },

    {
      id: 'retrieval-augmented-chatbot',
      title: 'Company Knowledge Chatbot (RAG)',
      body: [
        p("Employees want to ask questions in plain language (\"How many vacation days carry over?\") and get accurate answers drawn from internal documents: wikis, PDFs, policy pages, tickets. A general LLM doesn't know private or recent information, and may confidently invent answers. **Retrieval-augmented generation (RAG)** fixes this by fetching relevant passages and giving them to the model as context."),
        h('Clarifying Requirements'),
        talk(['Candidate', 'What sources and how much data?'], ['Interviewer', 'About 5 million pages: wiki, PDFs, Slack exports. They change daily.'],
          ['Candidate', 'Should answers cite sources?'], ['Interviewer', 'Yes, with links.'],
          ['Candidate', 'Do access permissions matter?'], ['Interviewer', 'Yes. Users must only see content they\'re allowed to read.'],
          ['Candidate', 'Latency and scale?'], ['Interviewer', 'First tokens within ~2 seconds; 20,000 employees.']),
        h('Frame the Problem'),
        p("Given a question and a conversation history, produce a grounded answer with citations. Split into **retrieval** (find the best passages the user may access) and **generation** (answer using only those passages)."),
        h('System Design'),
        flow({ nodes: {
          docs: [0, 0, 'Document sources', 'store'], ing: [1, 0, 'Ingestion\nparse, chunk'], emb: [2, 0, 'Embedding\nmodel', 'ml'], vdb: [3, 0, 'Vector index\n+ keyword index', 'db'],
          user: [0, 1.4, 'Employee', 'client'], qr: [1, 1.4, 'Query rewrite'], ret: [2, 1.4, 'Hybrid retrieval\n+ ACL filter'], rr: [3, 1.4, 'Re-ranker', 'ml'], llm: [4, 1.4, 'LLM\nanswer + cite', 'ml'] },
          edges: [['docs', 'ing'], ['ing', 'emb'], ['emb', 'vdb'], ['user', 'qr'], ['qr', 'ret'], ['ret', 'vdb', '', 'both'], ['ret', 'rr', 'top 50'], ['rr', 'llm', 'top 5'], ['llm', 'user', 'streamed answer', 'dash']], ux: 160, bw: 128 }),
        h3('Indexing pipeline'),
        ul(
          "**Parse** documents into text (OCR for scans, table extraction for PDFs).",
          "**Chunk** into passages of a few hundred tokens with some overlap, keeping headings as context.",
          "**Embed** each chunk; store vector + text + metadata (source URL, permissions, updated time).",
          "Also keep a **keyword (BM25) index**: embeddings miss exact terms like error codes and product names.",
          "Re-index incrementally as documents change."
        ),
        h3('Query pipeline'),
        ol(
          "**Rewrite** the question using chat history (\"what about part-time staff?\" → a standalone question).",
          "**Hybrid retrieval**: vector search + keyword search, **filtered by the user's access rights**.",
          "**Re-rank** candidates with a cross-encoder for precision.",
          "**Prompt** the LLM with instructions, the top passages (with IDs), and the question. Instruct it to answer only from the passages and to cite them, or to say it doesn't know.",
          "**Stream** the answer; render citations as links."
        ),
        h('Evaluation'),
        table(['Component', 'Metrics'], [
          ['Retrieval', 'recall@k and MRR on a labelled set of question → relevant passage'],
          ['Generation', '**faithfulness** (claims supported by context), answer relevance, citation accuracy; LLM-as-judge plus human review'],
          ['Product', 'thumbs up/down, resolution rate, escalations to humans, latency'],
        ]),
        h('Other Talking Points'),
        ul("Prompt injection hidden inside documents: treat retrieved text as data, not instructions.", "Freshness: show document dates and prefer newer versions.", "Cost: cache embeddings and frequent answers; use smaller models for query rewriting.", "Fine-tuning vs. RAG: fine-tune for tone and format, RAG for knowledge."),
      ],
    },

    {
      id: 'code-completion-assistant',
      title: 'Code Completion Assistant',
      body: [
        p("An IDE assistant suggests the next lines of code as the developer types, and can answer questions about the codebase. The hard constraint is **latency**: inline suggestions must appear in a few hundred milliseconds or they get in the way."),
        h('Clarifying Requirements'),
        ul("Inline completions (single line and multi-line) plus a chat panel.", "Popular languages; must use context from the current file and related files in the repo.", "p50 latency under ~300 ms for inline suggestions.", "Code must not leave the company's environment for some customers."),
        h('Frame the Problem'),
        p("Inline completion is **fill-in-the-middle (FIM)** generation: given the code **before** and **after** the cursor, generate the missing middle. Train or fine-tune a code LLM with FIM examples: split files at random points and teach the model to produce the middle from prefix + suffix."),
        pre(`
          <PRE> def area(r):\\n    return <SUF>\\n\\nprint(area(2)) <MID>  → "math.pi * r ** 2"
        `),
        h('Context construction'),
        ul(
          "Prefix and suffix around the cursor (most important).",
          "Imports and definitions of symbols used near the cursor (via the language server).",
          "Snippets from **recently opened / similar files** (retrieved by similarity).",
          "Budget the context window: the most relevant context goes closest to the cursor."
        ),
        h('Model choice'),
        table(['Use', 'Model'], [
          ['inline completion', 'small, fast code model (1-7B parameters), quantised, possibly on-device or at the edge'],
          ['chat / multi-file edits', 'larger model; latency is less critical'],
        ]),
        h('Serving'),
        flow({ nodes: { ide: [0, 0, 'IDE plugin', 'client'], ctx: [1, 0, 'Context builder\n(local)'], gw: [2, 0, 'Gateway\nauth, rate limit'], inf: [3, 0, 'Inference servers\nbatching, KV cache', 'ml'], post: [3, 1.2, 'Post-processing\ntruncate, filter'] },
          edges: [['ide', 'ctx', 'keystroke'], ['ctx', 'gw', 'prompt'], ['gw', 'inf'], ['inf', 'post'], ['post', 'ide', 'suggestion', 'dash']] }),
        ul(
          "**Debounce** keystrokes and cancel in-flight requests when the user keeps typing.",
          "Stop generation at natural boundaries (end of block, matching indentation).",
          "Filter suggestions that don't parse, duplicate existing code, or contain secrets or licensed code."
        ),
        h('Evaluation'),
        ul(
          "Offline: **pass@k** on unit-test benchmarks (does generated code pass tests?), exact match and edit similarity on held-out repositories.",
          "Online: **acceptance rate**, characters accepted per user, retention of accepted code after N minutes, latency."
        ),
        h('Other Talking Points'),
        ul("Privacy: on-prem deployment, no training on customer code without consent.", "Personalisation via repository-specific fine-tuning or retrieval.", "Security: avoid suggesting vulnerable patterns."),
      ],
    },

    {
      id: 'text-to-image-generation',
      title: 'Text-to-Image Generation',
      body: [
        p("Users type a description (\"a watercolor fox reading a book under a lamp\") and receive several high-quality images in a few seconds."),
        h('Clarifying Requirements'),
        ul("Generate 4 images per prompt at 1024×1024.", "Support styles and negative prompts; allow image variations.", "Latency target ~5-10 s; millions of requests per day.", "Strong safety requirements: no explicit, violent or infringing content; no realistic images of real people."),
        h('Frame the Problem'),
        p("Conditional generation: produce an image from a text prompt. Modern systems use **latent diffusion**."),
        h('Model'),
        flow({ nodes: { t: [0, 0, 'Prompt', 'client'], te: [1, 0, 'Text encoder', 'ml'], n: [1, 1.2, 'Random noise\n(latent)', 'note'], un: [2.2, 0.6, 'Denoising network\n× N steps', 'ml'], dec: [3.4, 0.6, 'Image decoder', 'ml'], img: [4.5, 0.6, 'Image', 'client'] },
          edges: [['t', 'te'], ['te', 'un', 'condition'], ['n', 'un'], ['un', 'dec', 'clean latent'], ['dec', 'img']], ux: 150, bw: 130 }),
        ul(
          "**Training**: take an image, encode it to a latent, add a random amount of noise, and train the network to predict that noise given the noisy latent, the noise level and the caption embedding.",
          "**Inference**: start from noise and repeatedly subtract predicted noise over N steps (fewer steps with better samplers or distilled models).",
          "**Classifier-free guidance**: during training, sometimes drop the caption; at inference, push the prediction away from the unconditioned one to follow the prompt more closely."
        ),
        h('Data'),
        ul("Billions of image-caption pairs, filtered for quality, safety, watermarks and duplicates.", "Re-caption images with a captioning model so captions are detailed and accurate.", "Respect opt-outs and licensing."),
        h('Evaluation'),
        ul("**FID** (realism vs. real-image distribution) and **CLIP score** (image-text alignment) offline.", "Human preference ratings for aesthetics and prompt adherence.", "Online: downloads, regenerations (a sign of dissatisfaction), user ratings."),
        h('Serving'),
        ul(
          "GPU inference with batching; fewer denoising steps via distillation; FP16/INT8.",
          "**Prompt safety filter** before generation and **image safety classifier** after.",
          "Super-resolution model to upscale cheaply; queue requests during spikes.",
          "Invisible watermarking / provenance metadata on outputs."
        ),
      ],
    },

    {
      id: 'personalized-headshot-generation',
      title: 'Personalized Headshot Generation',
      body: [
        p("Users upload 10-20 casual selfies and receive professional-looking headshots of themselves in different outfits and settings. The model must preserve the person's **identity** while changing everything else."),
        h('Clarifying Requirements'),
        ul("Input: 10-20 photos of one person. Output: ~40 headshots in a few styles.", "Results within ~30 minutes are acceptable (not real time).", "Photos are sensitive: delete them after a retention period; get consent; prevent generating images of someone else."),
        h('Frame the Problem'),
        p("Personalise a pretrained text-to-image diffusion model to a new subject, then generate with style prompts. Approaches:"),
        table(['Technique', 'Idea', 'Trade-off'], [
          ['Textual inversion', 'learn a new token embedding representing the person', 'cheap, weaker identity'],
          ['**DreamBooth + LoRA**', 'fine-tune low-rank adapters on the user\'s photos, bound to a rare token ("photo of sks person")', 'strong identity; minutes of GPU time per user'],
          ['Encoder-based (identity embedding)', 'a face encoder conditions the model; no per-user training', 'instant, slightly less faithful'],
        ]),
        h('Pipeline'),
        flow({ nodes: { up: [0, 0, 'Upload photos', 'client'], qc: [1, 0, 'Quality checks\nface detect, crop'], ft: [2, 0, 'LoRA fine-tune\n(per user)', 'ml'], gen: [3, 0, 'Generate with\nstyle prompts', 'ml'], flt: [3, 1.2, 'Identity + safety\nfilters'], out: [2, 1.2, 'Gallery', 'client'] },
          edges: [['up', 'qc'], ['qc', 'ft'], ['ft', 'gen'], ['gen', 'flt'], ['flt', 'out']] }),
        ul(
          "Check inputs: one consistent face, enough variety of angles and lighting, no group photos.",
          "Use **prior preservation** (also train on generic \"person\" images) so the model doesn't forget what people look like in general.",
          "Generate more images than needed and filter by **face similarity** to the uploads plus a quality/aesthetics score."
        ),
        h('Evaluation'),
        ul("Identity similarity (face-embedding cosine similarity).", "Prompt adherence and aesthetics via human ratings.", "Online: images downloaded, refund requests."),
        h('Other Talking Points'),
        ul("Privacy and consent: verify the uploader is the subject; delete data and adapters.", "Bias: ensure quality across skin tones, ages and genders.", "Cost: batch fine-tuning jobs on spot GPUs."),
      ],
    },

    {
      id: 'llm-powered-agent',
      title: 'LLM-Powered Agent',
      body: [
        p("An **agent** uses an LLM to plan and take actions with tools (search, calendars, databases, APIs) to accomplish a goal, e.g. \"find a 30-minute slot with Priya next week and send an invite\"."),
        h('Clarifying Requirements'),
        ul("Tools: calendar read/write, email send, company directory, web search.", "Actions with side effects (sending, booking) must be confirmed by the user.", "Tasks typically take 2-10 tool calls; latency of tens of seconds is acceptable."),
        h('The agent loop'),
        flow({ nodes: { goal: [0, 0.6, 'User goal', 'client'], llm: [1.2, 0.6, 'LLM: plan /\nchoose next step', 'ml'], tool: [2.4, 0, 'Tool call\n(validated)'], obs: [2.4, 1.2, 'Observation\n(tool result)'], ans: [3.6, 0.6, 'Final answer /\nconfirmation', 'client'] },
          edges: [['goal', 'llm'], ['llm', 'tool', 'action'], ['tool', 'obs'], ['obs', 'llm', 'append to context'], ['llm', 'ans', 'done']] }),
        ul(
          "Each tool is described with a name, purpose and JSON schema; the model returns a structured call that our code validates and executes.",
          "Results are appended to the context and the model decides the next step, until it produces a final answer.",
          "**Memory**: short-term (this task's context) and long-term (user preferences, past tasks) stored in a database and retrieved when relevant."
        ),
        h('Reliability and safety'),
        ul(
          "**Least privilege**: give each tool only the permissions the task needs.",
          "**Human in the loop** for irreversible actions (send, pay, delete).",
          "**Prompt injection**: tool outputs (web pages, emails) may contain instructions. Treat them as untrusted data and never let them trigger privileged actions without confirmation.",
          "Step limits, timeouts and budget caps to stop runaway loops; retries with error messages fed back to the model."
        ),
        h('Evaluation'),
        ul("Task success rate on a suite of scripted scenarios with mocked tools.", "Number of steps and cost per task; rate of unsafe or unconfirmed actions (should be zero).", "User satisfaction and how often users have to intervene."),
      ],
    },

    {
      id: 'email-smart-compose',
      title: 'Email Smart Compose',
      body: [
        p("As a user writes an email, the system suggests how to finish the current sentence in grey text; pressing Tab accepts it. Suggestions must be fast, relevant and never embarrassing."),
        h('Clarifying Requirements'),
        ul("Suggest completions of the current sentence only.", "Latency under ~100 ms per keystroke; billions of emails per day.", "Personalise lightly (greeting style, sign-off) without leaking one user's data to another.", "Never suggest offensive, biased or sensitive content."),
        h('Frame the Problem'),
        p("Conditional text generation: given the subject, the email so far and context (recipient, previous email in the thread), predict the next few tokens. Only show a suggestion when the model is **confident**."),
        h('Model'),
        ul(
          "A small transformer decoder trained on email text (with strict privacy handling) or distilled from a large model.",
          "Inputs: subject + previous email + current prefix, truncated to a short window for speed.",
          "Decoding: beam search with a short maximum length; show the result only if its probability exceeds a threshold."
        ),
        h('Serving'),
        ul("Run on accelerators near the user; cache encoder states for the subject and previous email.", "Debounce keystrokes; drop stale responses.", "Post-filter: block suggestions with sensitive terms, gendered assumptions (\"he\"/\"she\" for unknown recipients) or personal data."),
        h('Evaluation'),
        ul("Offline: exact-match rate and perplexity on held-out emails.", "Online: **acceptance rate**, characters saved per email, latency, opt-out rate."),
        h('Other Talking Points'),
        ul("Federated or differential-privacy training to protect user data.", "Multilingual support.", "Avoiding memorisation of rare, private strings from training data."),
      ],
    },

    {
      id: 'evaluation-and-safety',
      title: 'Evaluating and Securing GenAI Systems',
      body: [
        p("For GenAI products, evaluation and safety are not afterthoughts. They are often the deep-dive topic interviewers pick. Open-ended outputs make \"is this good?\" hard to measure, and powerful models can be misused."),
        h('Evaluation toolbox'),
        table(['Method', 'Good for', 'Watch out for'], [
          ['Reference metrics (BLEU, ROUGE, exact match)', 'translation, summarisation with references', 'penalise valid paraphrases'],
          ['Task metrics (pass@k, accuracy on QA sets)', 'code, factual QA', 'benchmark contamination'],
          ['**LLM-as-judge**', 'scaling quality ratings: helpfulness, faithfulness, tone', 'judge bias (length, position, self-preference); calibrate against humans'],
          ['Human evaluation', 'ground truth for subjective quality', 'slow and costly; need clear rubrics'],
          ['Online signals', 'real usefulness: thumbs, retention, task completion', 'noisy, delayed'],
        ]),
        p("Build a **golden dataset** of representative and adversarial cases, run it on every model or prompt change (regression testing), and track results over time."),
        h('Hallucination'),
        ul("Ground answers in retrieved sources and require citations.", "Ask the model to say \"I don't know\" when context is missing.", "Verify claims with a second pass or tools (calculators, search).", "Measure faithfulness explicitly."),
        h('Safety layers'),
        flow({ nodes: { in: [0, 0, 'User input', 'client'], ifl: [1, 0, 'Input filter\nabuse, PII, injection'], m: [2, 0, 'Model with\nsafety tuning', 'ml'], ofl: [3, 0, 'Output filter\nunsafe, PII, copyright'], out: [4, 0, 'Response', 'client'], log: [2, 1.2, 'Logging + review\n+ red teaming', 'store'] },
          edges: [['in', 'ifl'], ['ifl', 'm'], ['m', 'ofl'], ['ofl', 'out'], ['m', 'log', '', 'dash']] }),
        h('Threats to plan for'),
        table(['Threat', 'Mitigation'], [
          ['Jailbreaks', 'safety tuning, output classifiers, continuous red-teaming'],
          ['Prompt injection (via documents, web pages, emails)', 'separate instructions from data, restrict tool permissions, confirm side effects'],
          ['Data leakage / PII', 'redact inputs, don\'t train on private data without consent, output PII detection'],
          ['Copyright / memorisation', 'dedupe training data, filters for verbatim reproduction, provenance'],
          ['Abuse at scale (spam, fraud)', 'rate limits, account reputation, usage monitoring'],
        ]),
        h('Monitoring in production'),
        ul("Latency (time to first token, tokens per second), cost per request, error and refusal rates.", "Quality sampling with LLM-as-judge on live traffic.", "Drift in topics users ask about, signalling gaps in retrieval data or prompts."),
      ],
    },
  ]);
})();
