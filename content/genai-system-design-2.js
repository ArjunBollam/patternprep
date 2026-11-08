/* More GenAI chapters: realistic face generation (GANs) and high-resolution image synthesis. */
(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, state, pre, code } = K;

  K.chapters('generative-ai-system-design-interview', [
    {
      id: 'realistic-face-generation',
      title: 'Realistic Face Generation',
      body: [
        p("Design a system that generates photorealistic faces of **people who don't exist**, for uses such as game characters, privacy-preserving stock photos and synthetic training data. Users may also adjust attributes such as age, expression or hairstyle."),
        h('Clarifying Requirements'),
        talk(
          ['Candidate', 'What resolution and how many images per request?'],
          ['Interviewer', '1024×1024; one to four images per request.'],
          ['Candidate', 'Do users control attributes, or is it random?'],
          ['Interviewer', 'Random by default, with sliders for a few attributes.'],
          ['Candidate', 'Any constraints on likeness to real people?'],
          ['Interviewer', 'Generated faces must not reproduce identifiable people from the training data.']
        ),
        ul("Latency of about one second per image.", "Diversity across age, gender presentation, skin tone and ethnicity.", "Strong safeguards: no likenesses of real people, provenance labelling on outputs."),
        h('Frame the Problem'),
        p("This is **unconditional** (or lightly conditioned) image generation from a single domain. Two model families fit:"),
        table(['Approach', 'How it works', 'Strengths', 'Weaknesses'], [
          ['Generative adversarial network (GAN)', 'a generator turns random noise into an image; a discriminator learns to tell real from fake; they train against each other', 'one forward pass (very fast); a smooth, controllable latent space', 'unstable training; can miss parts of the data distribution (mode collapse)'],
          ['Diffusion model', 'learns to remove noise step by step', 'stable training, very high diversity and quality', 'many steps per image, so slower without distillation'],
        ]),
        p("For a single domain with tight latency and attribute control, a **style-based GAN** is a strong choice; a distilled diffusion model is the main alternative."),
        h('Model'),
        flow({ nodes: { z: [0, 0, 'Random vector z', 'note'], map: [1.1, 0, 'Mapping network\nz → w', 'ml'], gen: [2.4, 0, 'Synthesis network\ncoarse → fine', 'ml'], img: [3.6, 0, 'Generated face', 'client'], real: [3.6, 1.3, 'Real faces', 'store'], disc: [2.4, 1.3, 'Discriminator\nreal or fake?', 'ml'] },
          edges: [['z', 'map'], ['map', 'gen', 'style at each scale'], ['gen', 'img'], ['img', 'disc'], ['real', 'disc'], ['disc', 'gen', 'gradient', 'dash']], ux: 150 }),
        ul(
          "**Mapping network**: turns a random vector `z` into an intermediate latent `w` whose directions tend to correspond to meaningful attributes (age, pose, lighting).",
          "**Synthesis network**: starts from a small learned tensor and upsamples to 1024×1024; `w` controls the *style* at each resolution: coarse layers set pose and face shape, fine layers set hair texture and skin detail.",
          "**Discriminator**: a classifier trained on real and generated images. The generator's loss rewards fooling it.",
          "**Stabilisers**: progressive or multi-resolution training, gradient penalties on the discriminator, and adding noise to break symmetry."
        ),
        h3('Attribute control'),
        ul(
          "Find **directions** in `w` space that change one attribute: train a small classifier (for example *smiling / not smiling*) on generated images and use its decision boundary.",
          "Moving `w` along that direction changes the attribute while keeping identity mostly fixed. Sliders in the UI map to step sizes along these directions.",
          "The **truncation trick** pulls `w` towards the average latent, trading diversity for quality; expose it as a quality / variety setting."
        ),
        h('Data'),
        ul(
          "Tens of thousands to millions of high-quality, consented face photos, aligned (eyes and mouth at fixed positions) and cropped.",
          "Balance the dataset across demographics, ages, lighting and accessories; measure the balance of generated outputs too.",
          "Remove duplicates and low-quality images; respect licences and opt-outs."
        ),
        h('Evaluation'),
        table(['Metric', 'Measures'], [
          ['Fréchet Inception Distance (FID)', 'how close the distribution of generated images is to real ones (lower is better)'],
          ['Precision and recall for generative models', 'quality (precision) and coverage of the data distribution (recall); recall exposes mode collapse'],
          ['Attribute-edit accuracy and identity preservation', 'whether a slider changes only its attribute; identity measured with a face-embedding model'],
          ['Memorisation checks', 'nearest-neighbour search of outputs against training faces; flag near-copies'],
          ['Human evaluation', 'realism ratings and side-by-side preference tests'],
        ]),
        h('Serving'),
        ul(
          "GPU inference: a GAN produces an image in tens of milliseconds, so batching and a modest GPU pool cover high traffic.",
          "Cache nothing personal; random seeds can be stored to reproduce an image.",
          "Post-generation checks: a **memorisation filter** (embedding distance to training faces) and a safety classifier.",
          "Add **provenance**: invisible watermarks and content credentials metadata stating the image is AI-generated."
        ),
        h('Other Talking Points'),
        ul(
          "**Misuse**: synthetic faces can power fake profiles. Mitigations include watermarking, rate limits, terms of use and sharing detection signals with platforms.",
          "**Bias**: check that every demographic is generated with equal quality, not just equal frequency.",
          "**GAN versus diffusion trade-off**: if the interviewer prioritises diversity over latency, propose a distilled diffusion model instead."
        ),
      ],
    },

    {
      id: 'high-resolution-image-synthesis',
      title: 'High-Resolution Image Synthesis',
      body: [
        p("Design a system that produces **very high-resolution images** (4K and beyond) for print, wallpapers and professional design tools, either by generating them directly from a prompt or by upscaling lower-resolution images while adding realistic detail."),
        h('Clarifying Requirements'),
        talk(
          ['Candidate', 'Do we generate from text, upscale existing images, or both?'],
          ['Interviewer', 'Both: text-to-image at high resolution, and a 4× upscaler for user uploads.'],
          ['Candidate', 'What output sizes and latency?'],
          ['Interviewer', 'Up to 4096×4096. Under 30 seconds is acceptable; users see a preview first.'],
          ['Candidate', 'How important is faithfulness for uploads?'],
          ['Interviewer', 'Very: upscaled photos must not change faces or text.']
        ),
        h('Frame the Problem'),
        p("Generating pixels directly at 4K is extremely expensive: attention and convolution costs grow with the number of pixels, and few training images exist at that size. The standard answer is to **work in a compressed space and add resolution in stages**."),
        table(['Technique', 'Idea'], [
          ['Latent diffusion', 'run diffusion in a compressed latent (for example 8× smaller per side), then decode with an autoencoder'],
          ['Cascaded generation', 'a base model makes a small image; one or more super-resolution models add detail at 2-4× per stage'],
          ['Tiled generation', 'process the image in overlapping tiles so memory stays bounded; blend the overlaps'],
          ['Super-resolution (SR)', 'a model conditioned on the low-resolution image predicts a sharper, larger one'],
        ]),
        h('Model'),
        flow({ nodes: { prompt: [0, 0, 'Prompt', 'client'], base: [1.2, 0, 'Base latent diffusion\n1024 × 1024', 'ml'], sr1: [2.4, 0, 'SR stage\n→ 2048', 'ml'], sr2: [3.6, 0, 'Tiled SR stage\n→ 4096', 'ml'], out: [4.8, 0, '4K image', 'client'], up: [2.4, 1.3, 'User upload\n(low resolution)', 'client'] },
          edges: [['prompt', 'base'], ['base', 'sr1', 'image'], ['sr1', 'sr2'], ['sr2', 'out'], ['up', 'sr1', 'same SR path', 'dash']], ux: 150, bw: 135 }),
        h3('The autoencoder'),
        ul(
          "Compresses images into a latent grid (for example 4 channels at one-eighth the width and height) and decodes back with minimal loss.",
          "Trained with reconstruction, perceptual and adversarial losses, so decoded images stay sharp rather than blurry."
        ),
        h3('Super-resolution models'),
        ul(
          "**Diffusion-based SR**: condition the denoiser on the upsampled low-res image; it adds plausible high-frequency detail. Training adds noise or blur to the low-res input (*noise conditioning augmentation*) so the model is robust to imperfect inputs.",
          "**GAN-based SR**: one fast forward pass with perceptual and adversarial losses; good for interactive previews.",
          "Train on pairs created by **realistic degradation**: downscale, blur, add noise and compression artefacts to high-resolution images."
        ),
        h3('Tiling without seams'),
        p("For 4K outputs, process overlapping tiles (for example 512 px with 64 px overlap) and blend the overlaps with weighted averaging, so memory stays constant regardless of output size. Sharing the same noise and conditioning across tiles keeps the style consistent."),
        h('Data'),
        ul("High-resolution images (2K-8K) with captions, filtered for quality, sharpness, watermarks and safety.", "Paired low/high-resolution crops made with a randomised degradation pipeline.", "Domain mix matters: photos, illustrations and text-heavy images all appear in user uploads."),
        h('Evaluation'),
        table(['Metric', 'Use'], [
          ['FID / CLIP score on downsampled outputs', 'overall quality and prompt alignment'],
          ['PSNR and SSIM', 'faithfulness of upscaling against ground truth (they favour smooth results)'],
          ['LPIPS (perceptual distance)', 'how natural the detail looks to people'],
          ['Face-identity and OCR consistency', 'upscaling must not change who is in a photo or what text says'],
          ['Human preference at 100% zoom', 'the final judge for detail and artefacts'],
        ]),
        h('Serving'),
        ul(
          "Return a fast **preview** from the base stage first, then stream the upscaled result; let users pick which preview to upscale.",
          "Run stages on different GPU pools sized to their cost; queue the expensive tiled stage with priorities for paying users.",
          "Use FP16 and memory-efficient attention; reuse tiles for identical requests.",
          "Apply safety classifiers before upscaling (cheaper) and watermark the final output."
        ),
        h('Other Talking Points'),
        ul(
          "**Hallucinated detail**: generative SR invents texture. For documents, medical or forensic images, prefer faithful (non-generative) upscaling or label results clearly.",
          "**Cost control**: most users never look at full resolution; upscale on demand.",
          "**Evaluation at scale**: downsample outputs to compare with the base model fairly."
        ),
      ],
    },
  ]);

  K.orderChapters('generative-ai-system-design-interview', [
    'introduction-and-overview', 'email-smart-compose', 'language-translation', 'general-purpose-chatbot',
    'image-captioning', 'retrieval-augmented-chatbot', 'realistic-face-generation', 'high-resolution-image-synthesis',
    'text-to-image-generation', 'personalized-headshot-generation', 'text-to-video-generation',
    'code-completion-assistant', 'llm-powered-agent', 'evaluation-and-safety',
  ]);
})();
