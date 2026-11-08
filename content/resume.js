(function () {
  const { p, h, h3, ul, ol, note, table, pre, flow } = K;

  K.chapters('resume', [
    {
      id: 'why-your-resume-matters',
      title: 'Why Your Resume Matters',
      body: [
        p("Your resume is the **gate** to every interview loop in this site. Strong engineers get filtered out every day because their resume doesn't show what they can do quickly enough. The good news: a resume is a short document you control completely, and small changes make a big difference."),
        h('How resumes are actually read'),
        flow({ nodes: { a: [0, 0, 'Applicant tracking\nsystem (ATS)', 'ext'], b: [1, 0, 'Recruiter skim\n~30 seconds'], c: [2, 0, 'Hiring manager\nreview'], d: [3, 0, 'Interview', 'ml'] },
          edges: [['a', 'b', 'parsed + searchable'], ['b', 'c', 'shortlist'], ['c', 'd', 'invite']] }),
        ul(
          "**ATS**: software parses your resume into fields and lets recruiters search by keywords. Unusual layouts (text in images, complex columns) can parse badly.",
          "**Recruiter skim**: often under a minute. They look at titles, companies, dates, the top bullet of each role and key skills.",
          "**Hiring manager review**: a closer read for scope, impact and relevant technologies, and ideas for interview questions."
        ),
        h('What a great resume does'),
        table(['Goal', 'How'], [
          ['Easy to skim', 'clean layout, consistent formatting, clear section headings'],
          ['Shows impact, not duties', 'bullets start with strong verbs and end with results and numbers'],
          ['Matches the role', 'relevant skills and keywords from the job description, most relevant work first'],
          ['Proves level', 'scope of projects, ownership, leadership signals that fit the target level'],
          ['Gives conversation starters', 'interesting projects interviewers want to ask about'],
        ]),
        note("Everything on your resume is fair game in interviews. Only include work you can explain in depth: the design, the trade-offs and your exact role."),
      ],
    },

    {
      id: 'structure-and-layout',
      title: 'Structure and Layout',
      body: [
        h('Length'),
        ul("**One page** for most people with under ~10 years of experience.", "Two pages are fine for long, relevant careers. Never pad to fill space."),
        h('Recommended sections (in order)'),
        table(['Section', 'Contents'], [
          ['Header', 'name, email, phone, city / country, LinkedIn and GitHub (if active). No photo, age or full address.'],
          ['Summary (optional)', '1-2 lines for experienced or career-changing candidates; skip it for new grads'],
          ['Experience', 'reverse chronological; title, company, location, dates, 3-6 bullets per role'],
          ['Projects', 'especially for students and career changers: what you built, the tech, the result'],
          ['Skills', 'languages, frameworks, tools, cloud; grouped, no rating bars'],
          ['Education', 'degree, school, graduation year; GPA only if strong and recent'],
        ]),
        h('An example layout'),
        pre(`
          JORDAN LEE
          jordan.lee@email.com · (555) 010-2030 · Seattle, WA · github.com/jlee · linkedin.com/in/jlee

          EXPERIENCE
          Software Engineer II, Parcelwise (logistics SaaS)                       Mar 2023 – Present
          • Led migration of shipment tracking to an event-driven pipeline (Kafka, Go), cutting
            status-update delay from 4 min to 6 s for 2M daily shipments
          • Designed an idempotent webhook delivery service with retries and dead-lettering;
            customer-reported missing events fell 85%
          • Mentored 2 new engineers; wrote the team's on-call runbook used in 40+ incidents

          Software Engineer, Brightpay (fintech)                                  Jul 2021 – Feb 2023
          • Built reconciliation jobs in Java/Spring that matched 1.5M transactions nightly, replacing
            a 6-hour manual process
          • Reduced p99 latency of the payment API from 900 ms to 220 ms by adding caching and
            fixing N+1 queries

          SKILLS
          Languages: Java, Go, Python, SQL · Infra: AWS, Kafka, PostgreSQL, Redis, Docker, Kubernetes

          EDUCATION
          B.S. Computer Science, State University                                              2021
        `),
        h('Formatting rules'),
        ul(
          "Single column, standard fonts (10.5-12 pt), consistent date alignment.",
          "Save as **PDF** unless asked otherwise; name the file `Firstname-Lastname-Resume.pdf`.",
          "Avoid tables, text boxes, icons and headers/footers for important information: ATS parsers often skip them.",
          "Use the same tense rules everywhere: past tense for past roles, present tense for current work."
        ),
      ],
    },

    {
      id: 'writing-impactful-bullet-points',
      title: 'Writing Impactful Bullet Points',
      body: [
        p("Bullet points are where resumes are won or lost. Most weak bullets describe **responsibilities** (\"responsible for maintaining APIs\"). Strong bullets describe **accomplishments**: what you did, how, and what changed because of it."),
        h('A simple formula'),
        pre(`
          Accomplished [X] as measured by [Y] by doing [Z]

          → "Cut checkout errors 40% (X, Y) by adding idempotency keys and retry budgets
             to the payment client (Z)"
        `),
        h('Before and after'),
        table(['Weak', 'Strong'], [
          ['Worked on the search feature.', 'Rebuilt product search ranking with BM25 + click signals, raising search-to-purchase conversion 12%.'],
          ['Responsible for CI/CD pipelines.', 'Cut build times from 25 to 7 minutes by caching dependencies and parallelising tests across 8 runners.'],
          ['Helped improve app performance.', 'Reduced Android cold-start time 35% (2.3 s → 1.5 s) by lazy-loading modules and moving disk I/O off the main thread.'],
          ['Wrote unit tests.', 'Raised test coverage of the billing service from 45% to 85%, catching 3 pricing bugs before release.'],
          ['Participated in code reviews.', 'Introduced a review checklist adopted by 3 teams; post-release defects dropped 20% over two quarters.'],
        ]),
        h('Tips'),
        ul(
          "**Start with a strong verb**: built, designed, led, reduced, launched, automated, migrated, optimised.",
          "**Quantify**: latency, throughput, cost, revenue, users, time saved, error rates, adoption. Estimates are fine if they're honest and you can explain them.",
          "**Show scope**: users affected, data volume, team size, number of services.",
          "**Name the technology** where it matters, but don't let it crowd out the result.",
          "**Lead with your best bullet** in each role; recruiters may read only the first one.",
          "Keep each bullet to one or two lines."
        ),
        note("No numbers available? Describe scale or before/after qualitatively: \"replaced a manual weekly process with a self-serve dashboard used by all 6 regional teams\"."),
      ],
    },

    {
      id: 'skills-and-projects',
      title: 'Skills and Projects Sections',
      body: [
        h('Skills'),
        ul(
          "Group by category: *Languages*, *Frameworks*, *Data*, *Cloud & DevOps*, *Tools*.",
          "List only what you'd be comfortable being interviewed on. If you used something once in a tutorial, leave it out.",
          "Skip skill bars, percentages and soft skills (\"team player\"); show those through bullets instead.",
          "Mirror the job description's naming (\"PostgreSQL\" vs. \"Postgres\") to help keyword search."
        ),
        h('Projects'),
        p("Projects matter most for students, bootcamp graduates and career changers, and for anyone whose day job doesn't show the skills a role needs. Treat each project like a job entry:"),
        table(['Element', 'Example'], [
          ['Name + one-line description', '**TrailMate**: offline-first hiking app with route sharing'],
          ['Tech', 'Kotlin, Jetpack Compose, Room, Firebase'],
          ['What you built', 'offline map tiles, sync conflict resolution, background location tracking'],
          ['Result / proof', '1,200 downloads, 4.7★ rating; source on GitHub'],
        ]),
        h('What makes a project stand out'),
        ul("It solves a real problem or has real users.", "It goes beyond a tutorial: deployment, tests, performance work, documentation.", "It's relevant to the roles you're applying for.", "There's a link (live demo, store page, repository with a clear README)."),
      ],
    },

    {
      id: 'tailoring-for-each-role',
      title: 'Tailoring for Each Role',
      body: [
        p("One generic resume sent everywhere underperforms. You don't need a new resume for every application, but you should **tailor** it for each type of role, and adjust key details for roles you really want."),
        h('How to tailor in 15 minutes'),
        ol(
          "Read the job description and highlight the **must-have skills**, responsibilities and repeated keywords.",
          "Reorder bullets so the most relevant accomplishments come first in each role.",
          "Adjust wording to use the same terms (if they say \"distributed systems\", say it where it's true).",
          "Move the most relevant skills to the front of each skills group.",
          "Remove or shorten content that doesn't help this application."
        ),
        h('Keep a master resume'),
        p("Maintain a longer **master document** with every accomplishment and its numbers. Tailored versions are then quick selections from it, and you never lose the details of older projects."),
        h('Example: same experience, two targets'),
        table(['Target role', 'Lead bullet'], [
          ['Backend engineer', 'Designed an event-driven tracking pipeline (Kafka, Go) processing 2M shipments/day with 6 s update latency.'],
          ['Mobile engineer', 'Built the shipment-tracking screen in the customer Android app with real-time updates and offline caching, used by 300K monthly users.'],
        ]),
        note("Tailoring means emphasising true things differently. Never add skills or results you don't have; interviews will expose them."),
      ],
    },

    {
      id: 'resumes-for-different-career-stages',
      title: 'Resumes for Different Career Stages',
      body: [
        h('Students and new graduates'),
        ul(
          "Education can go first; include relevant coursework only if it's specific (e.g. distributed systems, compilers).",
          "Internships, research and **projects** carry most of the weight.",
          "Include hackathons, teaching assistant roles and open-source contributions.",
          "One page, always."
        ),
        h('Career changers and bootcamp graduates'),
        ul(
          "A 1-2 line summary connecting your past field to the new role (\"former logistics analyst building data tools for supply chains\").",
          "Projects first, then experience, with bullets that highlight transferable skills: data analysis, automation, stakeholder communication.",
          "Domain knowledge from your previous career is an advantage for companies in that domain."
        ),
        h('Experienced and senior engineers'),
        ul(
          "Focus on **scope and leadership**: systems you designed, decisions you drove, people you mentored, cross-team initiatives.",
          "Fewer bullets for older roles; the last 5-7 years matter most.",
          "Show business impact, not just technical tasks."
        ),
        h('Engineering managers'),
        ul("Team size, hiring, delivery, retention, process improvements.", "Keep some technical depth: architecture decisions and technical direction."),
        h('Gaps and short tenures'),
        p("Be honest and brief. A one-line note (\"career break: caregiving\", \"sabbatical: built X\") is enough. Prepare a short, positive explanation for interviews."),
      ],
    },

    {
      id: 'common-mistakes-and-checklist',
      title: 'Common Mistakes and Final Checklist',
      body: [
        h('Common mistakes'),
        table(['Mistake', 'Why it hurts', 'Fix'], [
          ['Typos and inconsistent formatting', 'signals carelessness', 'proofread aloud; ask someone else to read it'],
          ['Duties instead of results', 'reader can\'t tell whether you were effective', 'use the X-Y-Z formula'],
          ['Walls of text', 'skimmers miss the key points', '3-6 one- or two-line bullets per role'],
          ['Buzzword lists', 'unverifiable; looks padded', 'show skills inside accomplishments'],
          ['Unexplained acronyms and internal tool names', 'outsiders don\'t understand', 'describe what the tool does'],
          ['Fancy templates', 'ATS parsing errors', 'simple single-column layout'],
          ['Exaggeration', 'falls apart in interviews', 'claim only what you can discuss in depth'],
          ['Outdated contact info or dead links', 'missed opportunities', 'check every link before sending'],
        ]),
        h('Final checklist'),
        ul(
          "Name and contact details at the top; links work.",
          "Fits on one page (or two with a strong reason).",
          "Every role has dates, title and company; bullets start with action verbs.",
          "Most bullets include a measurable result or clear scope.",
          "Skills section matches the target role's keywords honestly.",
          "Consistent tense, punctuation, spacing and date formats.",
          "Saved as PDF with a clear filename; also tested by pasting into a plain-text box to check parsing.",
          "Read by at least one other person."
        ),
        note("After you send it: prepare to talk about **every** line. Pick 2-3 projects you'd love to be asked about and rehearse them using the STAR method from the [Behavioral Interview kit](#/behavioral-interview/the-star-method)."),
      ],
    },
  ]);
})();
