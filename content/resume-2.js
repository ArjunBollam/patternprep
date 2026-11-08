/* More Resume chapters: the hiring pipeline, basics, standing out, exercises, beyond the resume,
   templates, before/after examples, advice for hiring managers and a closing plan. */
(function () {
  const { p, h, h3, ul, ol, note, table, pre, flow } = K;

  K.chapters('resume', [
    {
      id: 'the-hiring-pipeline',
      title: 'The Hiring Pipeline',
      body: [
        p("Your resume isn't read once. It travels through a pipeline, and at every stage a different person reads it with a different question in mind. Knowing those questions tells you what each part of the resume has to do."),
        flow({ nodes: {
          apply: [0, 0, 'Application\nor referral', 'client'], ats: [1, 0, 'Applicant tracking\nsystem', 'ext'], rec: [2, 0, 'Recruiter\nscreen'],
          hm: [3, 0, 'Hiring manager\nreview'], phone: [3, 1.3, 'Phone / technical\nscreen'], onsite: [2, 1.3, 'Interview loop'], debrief: [1, 1.3, 'Debrief /\nhiring committee'], offer: [0, 1.3, 'Offer', 'ml'] },
          edges: [['apply', 'ats'], ['ats', 'rec', 'search + filter'], ['rec', 'hm', 'shortlist'], ['hm', 'phone', 'yes'], ['phone', 'onsite'], ['onsite', 'debrief'], ['debrief', 'offer']], ux: 170 }),
        h('Who reads your resume, and what they look for'),
        table(['Stage', 'Reader', 'Time spent', 'The question in their head', 'What helps'], [
          ['Applicant tracking system', 'software', 'instant', 'Does this match the search?', 'standard headings, plain layout, the role\'s keywords used naturally'],
          ['Recruiter screen', 'recruiter (often not an engineer)', '30-90 seconds', 'Does this person meet the basics for the role and level?', 'clear titles, dates, company names, a skills line that mirrors the job post'],
          ['Hiring manager review', 'engineering manager', '2-5 minutes', 'Could this person do the job on my team?', 'scope, ownership, relevant systems, concrete results'],
          ['Interviews', 'each interviewer', 'a few minutes before the call', 'What should I ask about?', 'projects that invite good questions, honest descriptions'],
          ['Debrief / committee', 'panel or committee', 'part of a packet', 'Is the evidence consistent with the level?', 'claims that your interviews confirmed'],
        ]),
        h('Ways in'),
        ul(
          "**Referrals** usually skip the queue: the resume goes straight to a recruiter with a note attached. They're the highest-yield way in, but a referral doesn't replace a strong resume; it only guarantees it gets read.",
          "**Recruiter outreach** (you were contacted first) means your profile already matched; the resume now has to confirm the match.",
          "**Cold applications** depend most on the tracking system and the recruiter skim, so clarity and keywords matter most here.",
          "**Internal moves** often skip early stages, but the hiring manager still reads your history for scope and impact."
        ),
        h('Timelines'),
        p("From application to offer typically takes 3-8 weeks at larger companies, faster at small ones. Recruiters review applications in batches, so applying early in a posting's life helps. If you hear nothing within two weeks, a short, polite follow-up to the recruiter (or your referrer) is normal."),
        h('What this means for your resume'),
        ol(
          "Make the **top third** of the page work for the 30-second skim: recent title, company, and your strongest bullet.",
          "Write bullets that a **non-engineer** can tell are impressive (numbers, scale, outcomes) and that an **engineer** can tell are real (specific systems, technologies, trade-offs).",
          "Treat every line as an interview question you're inviting. If you can't talk about it for five minutes, cut it."
        ),
        note("The same resume is read by a keyword search, a recruiter and senior engineers. Good resumes serve all three: plain structure, outcome-first bullets, and enough technical specifics to start a real conversation."),
      ],
    },

    {
      id: 'tech-resume-basics',
      title: 'Tech Resume Basics',
      body: [
        p("Before polishing words, get the fundamentals right. These rules are boring, and that's the point: a resume that breaks them gets filtered out before anyone reads your accomplishments."),
        h('Format and file'),
        table(['Topic', 'Do', 'Avoid'], [
          ['File type', 'PDF exported from a document editor (unless the posting asks for .docx)', 'images, scanned pages, password-protected files'],
          ['File name', '`Firstname-Lastname-Resume.pdf`', '`resume_final_v7.pdf`'],
          ['Length', '1 page (2 if you have a long, relevant career)', 'tiny fonts or margins to squeeze a third page into two'],
          ['Layout', 'one column, standard section headings', 'multi-column grids, text in tables, text boxes, icons for contact details'],
          ['Font', 'one common sans-serif or serif font, 10-12 pt body', 'decorative fonts, more than two typefaces'],
          ['Margins', '0.5-1 inch', 'margins so thin the printout clips'],
          ['Colour', 'black text, at most one muted accent', 'coloured backgrounds, skill bars, charts'],
        ]),
        h('The header'),
        ul(
          "Name, email, phone, city and country (or *Remote*), plus LinkedIn and GitHub if they're active and current.",
          "Leave out photo, date of birth, marital status, nationality and full street address: they invite bias and add nothing.",
          "If you need visa sponsorship (or don't), many candidates add one short line, such as *Authorised to work in the US*. It answers the recruiter's first logistics question."
        ),
        h('Dates, titles and tense'),
        ul(
          "Use one date format everywhere (`Mar 2023 – Present`) and align dates on the right so the timeline is easy to scan.",
          "Use your real title. If it's unusual (*Member of Technical Staff III*), you may add a common equivalent in parentheses.",
          "Current role in present tense, past roles in past tense. Never mix tenses within a role.",
          "Promotions: list the company once and show each title with its own date range."
        ),
        h('ATS-friendly writing'),
        p("Applicant tracking systems parse your file into fields and let recruiters search them. Help them parse correctly:"),
        ul(
          "Use conventional headings: *Experience*, *Education*, *Skills*, *Projects*.",
          "Spell out a term once with its abbreviation if both are common: *Amazon Web Services (AWS)*.",
          "Use the role's own vocabulary where it's true for you. If the posting says *PostgreSQL* and you used it, write *PostgreSQL*, not just *SQL databases*.",
          "Check the result: copy all text from your PDF into a plain-text editor. If the order is scrambled or text is missing, a parser will struggle too."
        ),
        h('What to leave out'),
        ul("*References available upon request* (assumed).", "An *Objective* statement about what you want (replace with a summary of what you offer, or nothing).", "Hobbies, unless they're relevant or a genuinely good conversation starter.", "Every technology you've ever touched: list what you'd be happy to be interviewed on.", "Salary history and reasons for leaving."),
      ],
    },

    {
      id: 'standing-out',
      title: 'Standing Out',
      body: [
        p("Most resumes for the same role look alike: the same languages, the same frameworks, similar job titles. What makes a hiring manager stop skimming is **evidence**: proof of impact, of scope, and of judgement that's specific to you."),
        h('Signals that make readers slow down'),
        table(['Signal', 'What it looks like on the page'], [
          ['Measurable impact', '*Cut checkout p99 latency from 1.8 s to 420 ms*; *saved $40k/month in compute*'],
          ['Scale', '*… for 12M monthly users*, *… processing 3 TB/day*'],
          ['Ownership', '*Led*, *designed*, *owned on-call for*, *drove adoption across 6 teams*'],
          ['Technical depth', 'a named hard problem and how you solved it: *idempotent retries*, *zero-downtime schema migration*'],
          ['Growth over time', 'promotions, increasing scope from role to role'],
          ['Leadership', 'mentoring, leading projects, hiring, writing standards others adopted'],
          ['Rare or relevant experience', 'domain knowledge the team needs (payments, compilers, video, ML infrastructure)'],
          ['Public work', 'maintained open-source projects, talks, articles, competition results'],
        ]),
        h('Lead with your strongest material'),
        ul(
          "The first bullet of each role gets the most attention. Put the biggest, clearest result there, not the oldest task.",
          "For senior roles, open with scope: what you owned and how big it was. For junior roles, open with what you built and shipped.",
          "If your best work was a side project, a strong **Projects** section near the top can outshine an unrelated job."
        ),
        h('Quantify, even without perfect metrics'),
        p("You rarely have exact numbers, but you almost always have an honest estimate or a comparison:"),
        ul(
          "**Before / after**: *from about 2 hours per release to 15 minutes*.",
          "**Relative change**: *roughly halved the error rate*.",
          "**Scale of use**: *used by every team in the 80-person org*, *runs 400 times a day*.",
          "**Frequency or count**: *fixed 30+ production incidents*, *reviewed ~15 PRs a week*.",
          "**Business result**: *unblocked the launch of the EU region*."
        ),
        note("Only use numbers you could defend in an interview. *Approximately* and *about* are fine; invented precision is not."),
        h('Specific beats impressive-sounding'),
        table(['Generic', 'Specific'], [
          ['Worked on backend microservices', 'Built the refund service (Go, PostgreSQL) that processes 20k refunds/day'],
          ['Improved performance', 'Added a Redis read-through cache; product page p95 dropped from 900 ms to 180 ms'],
          ['Team player with strong communication skills', 'Wrote the migration guide 9 teams used to move off the legacy queue'],
          ['Passionate about clean code', 'Introduced contract tests that caught 12 breaking API changes before release'],
        ]),
        h('Things that don\'t help'),
        ul("Buzzword clouds (*synergy*, *rockstar*, *results-driven*) and self-ratings (*expert in Java*).", "Long lists of duties copied from a job description.", "Every course you took. Pick the 2-3 that matter for the role.", "Design flourishes that make the page harder to read."),
      ],
    },

    {
      id: 'exercises-to-polish-your-resume',
      title: 'Exercises to Polish Your Resume',
      body: [
        p("Reading your own resume is hard, because you know what you meant. These short exercises force you to see it the way a stranger does. Do them in order, with a printed copy and a pen."),
        h('1. The 30-second test'),
        p("Give your resume to a friend (ideally an engineer) for 30 seconds, then take it away. Ask: *What's my current role? What's the most impressive thing I've done? What kind of job am I looking for?* If their answers don't match yours, the top third of the page needs work."),
        h('2. The "so what?" test'),
        p("For every bullet, ask *so what?* If the bullet doesn't already answer it, add the result. *Wrote unit tests* → so what? → *Raised payment-module test coverage from 40% to 85%, ending a run of weekly regressions.*"),
        h('3. The verb audit'),
        p("Circle the first word of every bullet. Replace weak openers (*Responsible for*, *Helped with*, *Worked on*, *Participated in*) with what you actually did: *built, designed, led, migrated, reduced, automated, launched, mentored*. Also check for repetition: five bullets starting with *Developed* blur together."),
        h('4. The number audit'),
        p("Count the bullets that contain a number or a concrete comparison. Aim for at least half. For the rest, ask what changed because of your work, and how you would know."),
        h('5. The interview test'),
        p("Point at a random line and talk about it for two minutes: the problem, your role, the design, what went wrong, what you'd do differently. If you can't, either refresh your memory or remove the line. Interviewers will do exactly this."),
        h('6. The keyword match'),
        p("Highlight the skills and responsibilities in a job posting you want. Then highlight where your resume shows each one. Gaps you can honestly fill (you used the skill but didn't mention it) should be filled; gaps you can't are useful information about fit."),
        h('7. The plain-text test'),
        p("Copy everything from your PDF and paste it into a plain-text editor. Headings, dates and bullets should come out readable and in order. If not, simplify the layout."),
        h('8. The cut challenge'),
        p("Remove one line from each role, then reread. If the resume feels just as strong, keep the cut. Shorter resumes are easier to skim, and the remaining lines get more attention."),
        h('9. The consistency pass'),
        ul("Same date format everywhere; dates aligned.", "Consistent punctuation at the ends of bullets.", "Consistent tense (present for the current role).", "No typos: read it backwards, word by word, to stop your brain auto-correcting."),
        h('10. The fresh-eyes review'),
        p("Put the resume away for a day, then reread it, or trade resumes with a friend and review each other's using these same exercises. Specific feedback (*this bullet doesn't say what you built*) beats general praise."),
        table(['Exercise', 'Time', 'Catches'], [
          ['30-second test', '5 min', 'unclear focus, weak top third'],
          ['"So what?" test', '15 min', 'duty-style bullets without results'],
          ['Verb + number audit', '15 min', 'weak openers, missing impact'],
          ['Interview test', '20 min', 'lines you can\'t defend'],
          ['Keyword match', '10 min per job', 'missing relevant skills'],
          ['Plain-text test', '2 min', 'layouts that parse badly'],
          ['Cut challenge + consistency', '15 min', 'padding, sloppy details'],
        ]),
      ],
    },

    {
      id: 'beyond-the-resume',
      title: 'Beyond the Resume',
      body: [
        p("A resume rarely works alone. Recruiters look you up, referrals open doors, and a short message can get your resume read by the right person. This chapter covers the pieces around the resume."),
        h('LinkedIn'),
        ul(
          "Use the same titles and dates as your resume; mismatches raise questions.",
          "Write a headline that says what you do, not just your title: *Backend engineer · payments and distributed systems*.",
          "Turn on *open to work* visible only to recruiters if you don't want your employer to see it.",
          "Add 2-3 bullets of highlights per role; the full detail can stay on the resume."
        ),
        h('GitHub and portfolio'),
        ul(
          "Pin 2-4 repositories you'd be happy to discuss, each with a README that explains what it does, how to run it and the interesting design choices.",
          "Quality beats quantity: one well-documented project is worth more than twenty abandoned tutorials.",
          "For frontend, mobile or design-heavy roles, a live demo or short video makes the work tangible.",
          "Don't link to a profile that's empty or mostly forks; it's better to leave the link out."
        ),
        h('Referrals'),
        p("Referrals are the most effective way to get your resume read. Ask people who know your work, and make it easy for them:"),
        pre(`
          Hi Priya, hope the new team is going well! I'm applying for the Senior Backend
          Engineer role on the Payments team (job ID 4821). I've spent the last three years
          building reconciliation and ledger services at Brightpay, which looks like a close
          match. Would you be comfortable referring me? I've attached my resume and a
          two-line summary you can paste into the form. Thanks either way!
        `),
        h('Reaching out to recruiters and hiring managers'),
        ul("Keep it under 120 words: who you are, the role, two specific reasons you're a fit, and a link to your resume.", "Personalise one sentence (a product, a talk, a blog post from their team).", "Follow up once after a week; then move on."),
        h('Cover letters'),
        p("Most engineering applications don't require one, and many aren't read. Write one when it's requested, when you're changing careers, or when your fit isn't obvious from the resume. Three short paragraphs: why this role, the most relevant evidence, and a clear close."),
        h('Run your search like a project'),
        table(['Column', 'Why'], [
          ['Company and role', 'what you applied for'],
          ['How (referral, cold, recruiter)', 'learn which channels work'],
          ['Date applied / last contact', 'know when to follow up'],
          ['Stage and next step', 'nothing slips through'],
          ['Resume version used', 'remember which tailoring you sent'],
          ['Notes', 'names, interview feedback, questions to prepare'],
        ]),
        note("Prepare your **references** before you need them: two or three people (ideally a former manager) who've agreed to speak for you, and know which roles you're applying for."),
      ],
    },

    {
      id: 'template-principles',
      title: 'Good Resume Template Principles',
      body: [
        p("A template should make your content easy to read and impossible to misread. It isn't a place for creativity: the best templates are almost invisible. Judge any template against these principles."),
        h('The principles'),
        ol(
          "**One column.** Readers and parsers both go top to bottom. Side columns get skipped or scrambled.",
          "**Clear hierarchy.** Name largest; section headings next; company and title bold; body text regular. Three or four levels at most.",
          "**Scannable left edge.** Titles and company names start at the left margin; dates sit at the right margin, aligned.",
          "**Consistent spacing.** The same space above every heading and between every role. Irregular gaps look careless.",
          "**Readable size.** 10-12 pt body text, 0.5-1 inch margins, line spacing around 1.0-1.15.",
          "**Real text only.** No text inside images, icons, tables or text boxes; no skill bars or star ratings.",
          "**Restrained styling.** Bold for structure, italics rarely, at most one muted accent colour.",
          "**Flexible sections.** You should be able to move *Projects* above *Experience*, or drop *Summary*, without breaking the layout."
        ),
        h('Anatomy of a good layout'),
        pre(`
          NAME (largest)
          contact line · city · links (small)
          ─────────────────────────────────────────────────────────────
          SECTION HEADING (bold, small caps or upper case)
          Title, Company (bold)                              Dates (right)
          • Bullet: verb + what + how + result
          • Bullet …
          Title, Company (bold)                              Dates (right)
          • …
          ─────────────────────────────────────────────────────────────
          SKILLS  Languages: … · Frameworks: … · Cloud & tools: …
          EDUCATION  Degree, School                          Year (right)
        `),
        h('Checklist for choosing a template'),
        table(['Question', 'Good sign'], [
          ['Does it survive the plain-text test?', 'text copies out in reading order'],
          ['Can a recruiter find your current title in 3 seconds?', 'title and company are bold at the left edge'],
          ['Does it fit your content without shrinking the font?', 'at least 10 pt with room to spare'],
          ['Can you edit it easily?', 'built with styles, not manual spacing'],
          ['Does it print well in black and white?', 'no meaning carried only by colour'],
        ]),
        note("Tools such as word processors, LaTeX classes and online builders all work. Pick one you can edit quickly: you'll tailor the resume for many applications."),
      ],
    },

    {
      id: 'resume-templates',
      title: 'Resume Templates',
      body: [
        p("Below are four plain-text templates for common situations. Every name, company and number is fictional; replace them with your own facts. Keep the structure, adapt the section order to whatever is strongest for you."),
        h('Template 1: student or new graduate'),
        pre(`
          ALEX MORGAN
          alex.morgan@email.com · (555) 010-4455 · Austin, TX · github.com/amorgan

          EDUCATION
          B.S. Computer Science, State University                         May 2026
          Relevant courses: Operating Systems, Databases, Distributed Systems

          EXPERIENCE
          Software Engineering Intern, Tallyhub (B2B analytics)         Jun – Aug 2025
          • Built a CSV import service (Python, FastAPI) that validates and loads up to
            1M rows; replaced a manual process customers used weekly
          • Added integration tests for the billing API, catching 3 regressions pre-release

          PROJECTS
          Trailmap, route-planning web app (React, Node, PostGIS)            2025
          • Shortest-path search over 400k trail segments in under 200 ms; 1,200 users
          Raft key-value store (Go) — course project                         2024
          • Leader election, log replication and snapshotting; passed all 60 test cases

          SKILLS
          Languages: Python, Go, TypeScript, Java · Tools: Git, Docker, PostgreSQL, AWS
        `),
        h('Template 2: mid-level engineer'),
        pre(`
          SAM RIVERA
          sam.rivera@email.com · (555) 010-7788 · Remote (US) · linkedin.com/in/srivera

          EXPERIENCE
          Software Engineer II, Parcelwise                           Mar 2023 – Present
          • Led the move of shipment tracking to an event-driven pipeline (Kafka, Go);
            status updates now arrive in 6 s instead of 4 min for 2M daily shipments
          • Designed idempotent webhook delivery with retries and a dead-letter queue;
            missing-event tickets fell 85%
          • Mentored 2 new engineers; wrote the on-call runbook used in 40+ incidents

          Software Engineer, Brightpay                              Jul 2021 – Feb 2023
          • Built nightly reconciliation jobs (Java, Spring) matching 1.5M transactions,
            replacing a 6-hour manual process
          • Cut card-authorization p99 latency 35% by batching fraud-score lookups

          SKILLS
          Go, Java, Python · Kafka, PostgreSQL, Redis · AWS, Kubernetes, Terraform

          EDUCATION
          B.Eng. Software Engineering, Northfield University                   2021
        `),
        h('Template 3: senior or staff engineer'),
        pre(`
          JORDAN PATEL
          jordan.patel@email.com · (555) 010-3321 · Seattle, WA · github.com/jpatel

          SUMMARY
          Staff engineer with 11 years in payments infrastructure; led ledger and
          settlement platforms handling $9B/year across 14 countries.

          EXPERIENCE
          Staff Software Engineer, Coinlane                          Jan 2021 – Present
          • Set the technical direction for the ledger platform (5 teams, 28 engineers);
            moved to double-entry event sourcing with zero reconciliation breaks in 2 yrs
          • Designed multi-region active-active settlement, raising availability from
            99.9% to 99.99% and enabling the EU launch
          • Created the design-review process now used org-wide; reviewed 60+ designs
          • Grew 4 engineers to senior; on the hiring committee for 3 years

          Senior Software Engineer, Brightpay                        2016 – 2020
          • Owned payouts end to end; scaled from 50k to 2M payouts/day
        `),
        h('Template 4: career changer'),
        pre(`
          CASEY LIN
          casey.lin@email.com · (555) 010-9090 · Chicago, IL · casey-lin.dev

          SUMMARY
          Software engineer and former logistics analyst; 2 years building internal
          tools in Python, plus 5 years of supply-chain domain experience.

          PROJECTS
          Freightwise, carrier-rate comparison tool (Django, PostgreSQL, React)   2025
          • Used weekly by 30 dispatchers at my former employer; saves ~6 hours/week

          EXPERIENCE
          Software Developer (internal tools), Meridian Logistics        2024 – Present
          • Automated invoice matching for 8k invoices/month (Python, Airflow)
          Logistics Analyst, Meridian Logistics                         2019 – 2024
          • Built SQL dashboards that cut late-shipment rates 12% in one region
        `),
        note("Notice what the templates have in common: one column, outcome-first bullets, a short skills line, and the strongest material in the top third."),
      ],
    },

    {
      id: 'before-and-after-examples',
      title: 'Resume Improvement Examples',
      body: [
        p("The fastest way to learn resume writing is to watch weak lines become strong ones. Each example below shows the original, the improved version, and what changed. (All details are fictional.)"),
        h('Example 1: a duty becomes an achievement'),
        table(['Before', 'After'], [
          ['Responsible for maintaining the CI pipeline.', 'Cut CI time from 38 to 11 minutes by parallelising tests and caching Docker layers, letting the team ship 3× more PRs per day.'],
        ]),
        p("**What changed:** the bullet now says what you did (*parallelised, cached*) and why it mattered (*3× more PRs*), instead of naming a responsibility."),
        h('Example 2: vague becomes specific'),
        table(['Before', 'After'], [
          ['Worked on improving the performance of our web app.', 'Reduced dashboard load time from 4.2 s to 1.1 s by moving aggregation into materialised views (PostgreSQL) and lazy-loading charts.'],
        ]),
        p("**What changed:** a number, a mechanism and a technology. An interviewer now knows exactly what to ask about."),
        h('Example 3: a team result becomes your contribution'),
        table(['Before', 'After'], [
          ['Our team launched the new mobile checkout.', 'Built the payment-sheet module and offline retry queue for the new mobile checkout (Kotlin), which launched to 1.2M users with a 0.3% failure rate.'],
        ]),
        p("**What changed:** it's clear which part was yours, and the outcome is still there."),
        h('Example 4: too long becomes focused'),
        table(['Before', 'After'], [
          ['Designed, developed, tested and deployed a new microservice in Java using Spring Boot that handles notifications for users via email, SMS and push, integrating with several third-party providers and including retry logic, templates and user preferences, which improved reliability.', 'Built a notification service (Java, Spring Boot) for email, SMS and push across 3 providers; retries and per-user preferences cut undelivered messages by 70%.'],
        ]),
        p("**What changed:** one idea per bullet, the list of verbs replaced by one strong verb, and a concrete result instead of *improved reliability*."),
        h('Example 5: a summary that says something'),
        table(['Before', 'After'], [
          ['Results-driven, passionate software engineer with excellent communication skills seeking a challenging role.', 'Backend engineer (6 years) specialising in high-throughput data pipelines; led migrations of 3 batch systems to streaming at fintech scale.'],
        ]),
        h('Example 6: a skills section that helps'),
        table(['Before', 'After'], [
          ['Java (expert), Python (advanced), C++ (intermediate), HTML, CSS, MS Office, Teamwork, Leadership, Agile, Jira, Git, Linux, Windows', 'Languages: Java, Python, C++ · Backend: Spring Boot, gRPC, Kafka · Data: PostgreSQL, Redis · Cloud: AWS (ECS, Lambda), Terraform'],
        ]),
        p("**What changed:** grouped by category, no self-ratings, no soft skills (show those in bullets instead), and no tools every engineer is assumed to know."),
        h('Example 7: a whole role, rewritten'),
        pre(`
          BEFORE
          Software Engineer, Acme Corp                               2022 – 2024
          • Worked on backend services
          • Fixed bugs and wrote tests
          • Participated in code reviews and agile ceremonies
          • Helped with database migration

          AFTER
          Software Engineer, Acme Corp                               2022 – 2024
          • Built the order-history API (Go, gRPC) serving 3k requests/s at 40 ms p99
          • Led the zero-downtime migration of 400 GB of orders from MySQL to PostgreSQL
            using dual writes and a backfill job; no customer-facing incidents
          • Fixed the root cause of a weekly data race in inventory updates (row-level
            locking), ending 2 years of manual corrections
        `),
      ],
    },

    {
      id: 'advice-for-hiring-managers',
      title: 'Advice for Hiring Managers on Running a Good Screening Process',
      body: [
        p("This chapter is for the other side of the table. A good screening process finds strong candidates that others miss, treats everyone fairly, and wastes less of your team's interview time. It also helps candidates understand what a good resume looks like from the reader's side."),
        h('Before you open a single resume'),
        ol(
          "**Write down what the role needs**: 3-5 must-have capabilities (for example *has operated a production service*, *can design a data model*) and a few nice-to-haves.",
          "**Agree on level expectations** with the interview panel, so you're screening for the same thing.",
          "**Write a job description that matches reality.** Long wish-lists of technologies discourage good candidates, especially those who only apply when they meet every bullet."
        ),
        h('Reading resumes'),
        ul(
          "**Look for evidence of the capabilities**, not proxies. A famous company or school says little about what a person actually built.",
          "**Judge trajectory and scope**: growing responsibility, ownership, impact. Someone who quickly grew from intern to project lead at a small company may be stronger than a long tenure at a big one.",
          "**Read for transferable work.** Different tools often hide the same skills: someone who scaled a Rails app can learn your Django stack.",
          "**Use a short rubric** (strong / maybe / no for each must-have) and write one sentence explaining the decision. It reduces snap judgements and makes calibration possible."
        ),
        h('Common false red flags'),
        table(['Looks like', 'Often actually'], [
          ['Employment gap', 'caregiving, health, study, layoffs, visa timing; ask, don\'t assume'],
          ['Several short tenures', 'startups that folded, contract roles, reorganisations'],
          ['Non-traditional education', 'bootcamp or self-taught engineers with strong practical skills'],
          ['Unfamiliar companies', 'small teams where one engineer owned a lot more than at a big company'],
          ['Plain, unpolished resume', 'a strong engineer who isn\'t good at marketing themselves'],
        ]),
        h('Running the process'),
        ul(
          "**Calibrate**: periodically have two people screen the same batch and compare decisions.",
          "**Move fast**: strong candidates have several processes running; reply within days, not weeks.",
          "**Close the loop**: a short, respectful rejection is better than silence, and protects your company's reputation.",
          "**Track outcomes**: how many screened-in candidates pass interviews? Which sources produce hires? Adjust the criteria if your screen and your interviews disagree."
        ),
        note("Bias creeps in through shortcuts (school names, company logos, writing polish). Defining the evidence you need before reading, and writing down why you decided, is the simplest defence."),
      ],
    },

    {
      id: 'putting-it-all-together',
      title: 'Putting It All Together',
      body: [
        p("You now have everything needed to write a resume that gets read, understood and remembered. Here is the whole kit condensed into a plan you can finish in about a week of evenings."),
        h('A one-week plan'),
        table(['Day', 'Do this', 'Chapters'], [
          ['1', 'List every project and role from the last 5-7 years, with any numbers you remember', 'Why Your Resume Matters, Standing Out'],
          ['2', 'Pick a template; write the header, education and skills', 'Tech Resume Basics, Template Principles, Resume Templates'],
          ['3', 'Write 3-6 bullets per role with verb + what + how + result', 'Writing Impactful Bullet Points, Before-and-After Examples'],
          ['4', 'Run the exercises: 30-second test, "so what?", verb and number audits', 'Exercises to Polish Your Resume'],
          ['5', 'Fix layout and consistency; do the plain-text test', 'Structure and Layout, Common Mistakes'],
          ['6', 'Tailor a version for your top 3 target roles; update LinkedIn', 'Tailoring for Each Role, Beyond the Resume'],
          ['7', 'Get feedback from 2 people; ask for referrals; start applying', 'The Hiring Pipeline, Beyond the Resume'],
        ]),
        h('The checklist that matters most'),
        ul(
          "Can a stranger tell your role, level and best achievement in 30 seconds?",
          "Does every bullet show a result, not just a duty?",
          "Is every line something you can discuss for five minutes?",
          "Does it parse cleanly and fit on one page (or two, if you've earned them)?",
          "Is it tailored to the role you're applying for?"
        ),
        note("A resume is never finished. Keep a **master version** with everything, update it every few months while the details are fresh, and tailor a copy for each application. Then move on to the interview kits, which are where the offer is won."),
      ],
    },
  ]);

  K.orderChapters('resume', [
    'why-your-resume-matters', 'the-hiring-pipeline', 'tech-resume-basics', 'structure-and-layout',
    'writing-impactful-bullet-points', 'skills-and-projects', 'standing-out', 'tailoring-for-each-role',
    'common-mistakes-and-checklist', 'resumes-for-different-career-stages', 'exercises-to-polish-your-resume',
    'beyond-the-resume', 'template-principles', 'resume-templates', 'before-and-after-examples',
    'advice-for-hiring-managers', 'putting-it-all-together',
  ]);
})();
