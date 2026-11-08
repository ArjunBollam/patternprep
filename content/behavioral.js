(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow } = K;

  // A worked STAR answer, rendered as a labelled table.
  const star = (s, t, a, r) => table(['', 'Example answer'], [['**Situation**', s], ['**Task**', t], ['**Action**', a], ['**Result**', r]]);

  K.chapters('behavioral-interview', [
    {
      id: 'introduction',
      title: 'Introduction to Behavioral Interviews',
      body: [
        p("Behavioral interviews ask about **what you have actually done** in the past, on the theory that past behaviour is the best predictor of future behaviour. Questions usually start with *\"Tell me about a time when…\"*. They often decide hiring outcomes and, for experienced candidates, the **level** you're offered."),
        h('What interviewers are assessing'),
        table(['Signal', 'What they listen for'], [
          ['Ownership', 'you take responsibility for outcomes, not just tasks'],
          ['Impact', 'your work changed something measurable'],
          ['Collaboration', 'you work well with others, including people you disagree with'],
          ['Communication', 'clear, structured, concise stories'],
          ['Growth', 'you learn from mistakes and seek feedback'],
          ['Leadership', 'you influence people and direction, with or without authority'],
          ['Handling ambiguity', 'you make progress when requirements are unclear'],
        ]),
        h('How expectations change with level'),
        flow({ nodes: { a: [0, 0, 'Junior\nown tasks well'], b: [1, 0, 'Mid-level\nown features'], c: [2, 0, 'Senior\nown projects\n& influence team', 'ml'], d: [3, 0, 'Staff+\nown direction\nacross teams', 'ml'] },
          edges: [['a', 'b'], ['b', 'c'], ['c', 'd']], bh: 64, uy: 90 }),
        table(['Level', 'Scope of your stories'], [
          ['Entry / junior', 'well-executed tasks, learning quickly, asking for help at the right time'],
          ['Mid-level', 'features end to end, working across functions, mentoring interns'],
          ['Senior', 'projects with ambiguity, technical decisions with trade-offs, raising the team\'s bar'],
          ['Staff and above', 'multi-team impact, setting direction, resolving organisational conflict'],
        ]),
        note("Pick stories whose **scope matches the level** you're targeting. A senior candidate who only tells task-level stories will often be down-levelled."),
        h('How to use this kit'),
        ol("Learn the STAR structure.", "Build a **story bank** of 8-10 strong experiences.", "Map each common question type to 1-2 stories and practise out loud.", "Prepare questions to ask, and learn the common traps."),
      ],
    },

    {
      id: 'the-star-method',
      title: 'The STAR Method',
      body: [
        p("**STAR** is a simple structure that keeps answers focused and complete:"),
        table(['Part', 'What to say', 'Share of time'], [
          ['**S**ituation', 'brief context: team, project, why it mattered', '~10%'],
          ['**T**ask', 'your specific responsibility or goal', '~10%'],
          ['**A**ction', 'what **you** did, step by step, and why', '~60%'],
          ['**R**esult', 'the outcome, ideally measured, and what you learned', '~20%'],
        ]),
        h('Common mistakes'),
        ul(
          "**Too much situation**: two minutes of background before anything happens. Keep context to two or three sentences.",
          "**\"We\" instead of \"I\"**: interviewers can't hire your team. Say what *you* did, while crediting others fairly.",
          "**No result**, or a vague one (\"it went well\"). Quantify where possible: latency, revenue, time saved, incidents reduced.",
          "**No reflection**: add one sentence on what you learned or would do differently."
        ),
        h('Example: "Tell me about a time you improved a process"'),
        star(
          'Our team deployed a mobile backend twice a week, and each release took about four hours of manual steps. Releases slipped often.',
          'As the engineer on the release rotation that quarter, I wanted to make releases safe enough to do daily.',
          'I mapped every manual step and found that two-thirds were checks a script could do. I wrote a pipeline that ran the checks, built and deployed to a canary, and paused for one approval. I demoed it to the team, ran it alongside the manual process for two weeks to build trust, and wrote a runbook for failures.',
          'Release time dropped from four hours to 25 minutes, we moved to daily releases, and rollback incidents fell from three a month to zero over the next quarter. I learned that running old and new processes side by side is what wins people over.'
        ),
        h('Variations'),
        ul("**STARL**: adds an explicit *Learning*.", "**CAR** (Challenge, Action, Result): a shorter form for quick follow-ups."),
        note("Aim for **2-3 minutes** per story. Stop after the result and let the interviewer dig in with follow-ups; that's where much of the evaluation happens."),
      ],
    },

    {
      id: 'building-your-story-bank',
      title: 'Building Your Story Bank',
      body: [
        p("You can't prepare for every question, but you can prepare **8-10 rich stories** that each answer several question types. Interviewers ask many variations; a good story bank lets you adapt instead of improvising."),
        h('Step 1: brainstorm'),
        p("List projects and moments from the last 2-4 years, including:"),
        ul("Projects you're proud of, and ones that failed.", "Disagreements with a manager, peer or another team.", "Times you took on something no one asked you to.", "Tight deadlines, production incidents, ambiguous requirements.", "Feedback that changed how you work.", "Times you helped or mentored someone."),
        h('Step 2: map stories to themes'),
        table(['Story', 'Conflict', 'Failure', 'Leadership', 'Ownership', 'Ambiguity', 'Teamwork'], [
          ['Payment migration', '✓', '', '✓', '✓', '✓', ''],
          ['Missed launch date', '', '✓', '', '✓', '', '✓'],
          ['On-call incident', '', '', '✓', '✓', '', '✓'],
          ['Mentoring a new hire', '', '', '✓', '', '', '✓'],
          ['Pushback on product spec', '✓', '', '', '', '✓', ''],
        ]),
        p("Aim to cover every theme at least twice, so you have a backup if a story was already used."),
        h('Step 3: write bullet outlines, not scripts'),
        p("For each story, note the STAR points, two or three numbers, and the hardest decision you made. Memorised scripts sound robotic; bullet points keep you natural."),
        h('Step 4: prepare for follow-ups'),
        ul("*What would you do differently?*", "*What did your manager think?*", "*What was the hardest part?*", "*How did you measure success?*", "*What was the other person's perspective?*"),
        h('Step 5: practise out loud'),
        p("Record yourself or practise with a friend. Check timing (2-3 minutes), the use of \"I\", and whether the result is clear."),
      ],
    },

    {
      id: 'tell-me-about-yourself',
      title: 'Tell Me About Yourself',
      body: [
        p("This opener sets the tone for the whole interview. It's not a request for your life story. It's a **90-second pitch** explaining who you are professionally and why you're a good fit."),
        h('A simple structure: present → past → future'),
        table(['Part', 'Content', 'Length'], [
          ['Present', 'your current role, scope and one highlight', '~30 s'],
          ['Past', 'the 1-2 experiences that shaped your skills for this role', '~30 s'],
          ['Future', 'why this role and company is the logical next step', '~20 s'],
        ]),
        h('Example (backend engineer)'),
        p("*\"I'm a backend engineer at a logistics startup, where I own our shipment-tracking service. Most recently I led its move to an event-driven design, which cut tracking delays from minutes to seconds. Before that I spent two years on a payments team, which is where I got deep into reliability and on-call. I'm excited about this role because your platform team works on exactly that combination, high-scale event processing with strict reliability, and I'd like to grow into leading projects of that kind.\"*"),
        h('Tips'),
        ul("Tailor it to the job description: highlight matching skills.", "End with a hook the interviewer can ask about.", "Skip personal details unless they relate to the role.", "Practise until it sounds natural, not memorised."),
      ],
    },

    {
      id: 'company-values',
      title: 'Company Values and Culture Fit',
      body: [
        p("Many companies publish values or leadership principles and map interview questions to them. Using the same language, backed by real stories, shows you understand how they work."),
        h('How to prepare'),
        ol(
          "Find the company's published values (careers page, engineering blog, annual letters).",
          "For each value, write down what behaviour it implies in day-to-day engineering.",
          "Map 1-2 stories from your bank to each value.",
          "Prepare a genuine answer to *\"Why this company?\"* that connects their mission and products to your experience."
        ),
        h('Common value themes and matching questions'),
        table(['Value theme', 'Typical question'], [
          ['Customer focus', 'Tell me about a time you went beyond requirements for a user.'],
          ['Bias for action', 'Tell me about a decision you made with incomplete information.'],
          ['High standards', 'Tell me about a time you refused to compromise on quality.'],
          ['Frugality', 'Tell me about doing more with fewer resources.'],
          ['Learning', 'Tell me about something you taught yourself recently.'],
          ['Disagree and commit', 'Tell me about committing to a decision you disagreed with.'],
        ]),
        note("Don't just recite the value (\"I'm very customer-obsessed\"). Show it through a specific story with a result."),
      ],
    },

    {
      id: 'conflict',
      title: 'Conflict and Disagreement',
      body: [
        p("Conflict questions test whether you can disagree **productively**: stay respectful, focus on the shared goal, use data, and reach a decision, even if it isn't yours."),
        h('Typical questions'),
        ul("Tell me about a time you disagreed with your manager.", "Describe a conflict with a teammate and how you resolved it.", "Tell me about a time you had to work with a difficult stakeholder."),
        h('What a strong answer shows'),
        ul("You understood the other person's perspective (state it fairly).", "You moved the discussion from opinions to **data or experiments**.", "You escalated only when appropriate, and constructively.", "The relationship stayed healthy or improved."),
        h('Example'),
        star(
          'Our product manager wanted to launch a feature by a conference date. I believed the data model would need a costly migration within months if we shipped it as designed.',
          'I needed to raise the risk without blocking the launch, and help us agree on a plan.',
          'I first asked what mattered most about the date: a demo for three key customers. I then wrote a one-page comparison of shipping as designed vs. a two-week alternative, with estimated migration cost. I proposed shipping a limited version for those three customers on time while building the better model behind a flag. We reviewed it together with our manager.',
          'We hit the conference with the limited launch, shipped the full version three weeks later without a migration, and the PM started looping me into specs earlier. I learned to dig for the real constraint before arguing about solutions.'
        ),
        h('Avoid'),
        ul("Making the other person the villain.", "Stories where you \"won\" by being right with no collaboration.", "Conflicts that were never resolved, unless you show what you learned."),
      ],
    },

    {
      id: 'failure-and-mistakes',
      title: 'Failure and Mistakes',
      body: [
        p("Everyone fails. Interviewers want to see **ownership** (no blaming), a clear understanding of what went wrong, and concrete changes you made afterwards."),
        h('Typical questions'),
        ul("Tell me about a time you failed.", "Describe a mistake you made and how you handled it.", "Tell me about a project that didn't go as planned."),
        h('Choosing the story'),
        ul("Pick a **real** failure with real consequences, not a disguised strength (\"I work too hard\").", "It should be in the past, with lessons you have since applied.", "Avoid failures that suggest a core skill gap for the role, or ethical issues."),
        h('Structure'),
        ol("What happened and what was at stake.", "What you did wrong (own it plainly).", "How you contained the damage.", "What you changed permanently, and evidence it worked."),
        h('Example'),
        star(
          'I shipped a database index change on a Friday afternoon. It locked a large table and caused 20 minutes of checkout errors.',
          'As the author, I was responsible for both the fix and preventing a repeat.',
          'I rolled back immediately and posted updates in the incident channel. On Monday I wrote a blameless post-mortem that named my own mistakes: skipping the migration checklist and deploying late on a Friday. I proposed two changes: a CI check that flags locking migrations, and a rule that schema changes ship early in the week with a reviewer from the database team.',
          'Both changes were adopted. In the following year we had no lock-related incidents, and the CI check caught four risky migrations. Personally, I now treat checklists as tools rather than overhead.'
        ),
      ],
    },

    {
      id: 'leadership',
      title: 'Leadership and Influence',
      body: [
        p("Leadership in behavioral interviews doesn't require a manager title. It means **getting others aligned and moving** toward an outcome: driving decisions, unblocking people, mentoring, setting standards."),
        h('Typical questions'),
        ul("Tell me about a time you led a project.", "Tell me about influencing people without authority.", "Describe how you mentored someone."),
        h('Signals to show'),
        ul("You set a clear goal and plan, and communicated it.", "You adapted to people: different motivations, skills and concerns.", "You delegated and developed others instead of doing everything yourself.", "You were accountable for the outcome, good or bad."),
        h('Example: influence without authority'),
        star(
          'Five teams each ran their own logging library, which made debugging across services slow during incidents.',
          'I wasn\'t a lead, but I wanted us to converge on one structured logging standard.',
          'I gathered data from the last ten incidents showing time lost correlating logs. I built a small shared library and migrated my own team first to prove it worked. I then met each team lead individually to understand their objections; two needed custom fields, so I added an extension point. I wrote a migration guide and paired with one engineer from each team on their first service.',
          'Within two quarters, four of five teams had migrated; average incident diagnosis time dropped by about 30%. The fifth team adopted it the following quarter. I learned that a working example and listening to objections persuade better than a proposal document.'
        ),
      ],
    },

    {
      id: 'teamwork',
      title: 'Teamwork and Collaboration',
      body: [
        p("Teamwork questions check that you make the people around you more effective: sharing knowledge, helping others, communicating across functions, and putting team goals first."),
        h('Typical questions'),
        ul("Tell me about a successful project with a cross-functional team.", "Describe a time you helped a struggling teammate.", "How do you work with designers, PMs or data scientists?"),
        h('What to highlight'),
        ul("How you **communicated**: syncs, docs, written decisions.", "How you handled **dependencies** and different priorities.", "Credit to others **and** your specific contribution."),
        h('Example'),
        star(
          'Our team of four engineers, a designer and a PM had six weeks to rebuild onboarding, a flow that was losing 40% of new users.',
          'I owned the client implementation and the experiment setup.',
          'I suggested a short kickoff where the designer walked through user research, so engineering understood the "why". I built a prototype in the first week so we could test with five users before polishing. When the backend engineer fell behind on an API, I wrote mock endpoints so the client work wasn\'t blocked, and paired with him on the trickiest part.',
          'We launched on time; completion of onboarding rose from 60% to 74% in the A/B test. The designer later reused the prototype-first approach on two other projects.'
        ),
      ],
    },

    {
      id: 'ownership-and-initiative',
      title: 'Ownership and Initiative',
      body: [
        p("Ownership means acting like the outcome is yours: noticing problems nobody assigned, following through after launch, and not saying \"that's not my job\"."),
        h('Typical questions'),
        ul("Tell me about a time you went beyond your responsibilities.", "Describe a problem you noticed and fixed without being asked.", "Tell me about a long-term project you drove to completion."),
        h('Example'),
        star(
          'Our weekly analytics report took a data analyst a full day to assemble by hand from three dashboards.',
          'It wasn\'t my area, but I knew the data pipelines and thought it could be automated.',
          'I asked the analyst to walk me through the process, then built a scheduled job that pulled the numbers and produced the report in the same format. I validated it against her manual reports for three weeks before switching over, and documented it so her team could change it without me.',
          'The analyst got a day a week back, which she used for a churn analysis that led to a pricing change. The job has run for over a year with only minor edits by her team.'
        ),
        note("Show **follow-through**: ownership stories are strongest when you stayed with the problem after the first fix, measured the result, and handed it over cleanly."),
      ],
    },

    {
      id: 'pressure-and-ambiguity',
      title: 'Deadlines, Pressure and Ambiguity',
      body: [
        p("These questions test how you prioritise and make progress when time is short or requirements are unclear."),
        h('Typical questions'),
        ul("Tell me about a time you had to meet a tight deadline.", "Describe a project where requirements were unclear.", "Tell me about a decision you made without all the information."),
        h('A useful pattern'),
        ol("Clarify the **goal** and the true constraints (what must be true on the date?).", "Cut scope: separate must-haves from nice-to-haves.", "Make reversible decisions quickly; spend time only on irreversible ones.", "Communicate early and often, especially bad news.", "Reflect: what would you do the same or differently?"),
        h('Example'),
        star(
          'A partner announced they would turn off an API we depended on in three weeks, much earlier than planned.',
          'I was asked to lead the migration to their new API without breaking checkout.',
          'I listed every call site and grouped them by risk. With my manager, we agreed that checkout and refunds were must-haves for the deadline; reporting could use a temporary export. I built an adapter so most code didn\'t change, added comparison logging in production to check both APIs agreed, and sent short daily status notes to stakeholders.',
          'We switched checkout and refunds two days before the cut-off with no customer-facing errors; reporting followed a week later. I learned to negotiate scope on day one rather than hoping to fit everything in.'
        ),
      ],
    },

    {
      id: 'feedback-and-growth',
      title: 'Feedback and Growth',
      body: [
        p("Interviewers want people who seek feedback, take it well, and act on it, and who can give honest, kind feedback to others."),
        h('Typical questions'),
        ul("Tell me about a time you received critical feedback.", "Describe a time you gave difficult feedback to a peer.", "What is something you're working to improve?"),
        h('Receiving feedback: example'),
        star(
          'In a mid-year review, my manager told me my design docs were thorough but too long; reviewers skipped them and decisions stalled.',
          'I wanted reviews to move faster without losing rigour.',
          'I asked two senior engineers for examples of docs they liked, then rewrote my template: a one-paragraph summary, the decision needed, options with trade-offs, and details in an appendix. I asked reviewers to rate clarity for my next three docs.',
          'Average review time dropped from about two weeks to four days, and my template was adopted by the team. I still ask for feedback on clarity after major docs.'
        ),
        h('Giving feedback'),
        ul("Be timely and private; focus on specific behaviour and its impact, not personality.", "Ask for their perspective first; agree on next steps.", "Follow up and acknowledge improvement."),
      ],
    },

    {
      id: 'questions-to-ask',
      title: 'Questions to Ask the Interviewer',
      body: [
        p("The last five minutes are usually yours. Thoughtful questions show genuine interest and help you decide whether you actually want the job."),
        h('Good questions'),
        table(['Topic', 'Example'], [
          ['The work', 'What would a successful first six months look like in this role?'],
          ['The team', 'How does the team decide what to build next?'],
          ['Engineering practices', 'How do you balance new features with reliability and tech debt?'],
          ['Growth', 'How do engineers here grow into senior or lead roles?'],
          ['Challenges', 'What\'s the hardest problem the team is facing right now?'],
          ['The interviewer', 'What do you enjoy most about working here?'],
        ]),
        h('Questions to avoid'),
        ul("Anything answered on the first page of the company website.", "Salary and perks in early rounds, unless the interviewer brings them up (save for the recruiter).", "\"Did I pass?\""),
        note("Prepare different questions for each interviewer (engineer, manager, director). Asking the same thing in every round looks unprepared."),
      ],
    },

    {
      id: 'traps-and-pitfalls',
      title: 'Traps and Pitfalls',
      body: [
        p("Even strong candidates lose behavioral rounds through avoidable habits. Here are the most common, and how to avoid them."),
        table(['Pitfall', 'Why it hurts', 'Fix'], [
          ['Rambling', 'the interviewer loses the thread and runs out of time', 'STAR, 2-3 minutes, stop after the result'],
          ['Only "we"', 'your contribution is invisible', 'say "I" for your actions, credit others explicitly'],
          ['Hypothetical answers ("I would…")', 'they asked what you did', 'tell a real story; if you have none, say so and give the closest one'],
          ['Badmouthing others', 'signals poor collaboration', 'describe the other side fairly'],
          ['No numbers', 'impact sounds small or vague', 'add metrics: time, money, users, incidents'],
          ['Same story for everything', 'looks like a thin track record', 'use a story bank with 8-10 experiences'],
          ['Fake weaknesses', 'sounds rehearsed and evasive', 'name a real one and what you\'re doing about it'],
          ['Out-of-date stories', 'suggests you haven\'t grown recently', 'prefer the last 2-3 years'],
        ]),
        h('Final checklist'),
        ul("8-10 stories mapped to themes, with numbers.", "A 90-second \"tell me about yourself\".", "A real answer to \"why this company?\".", "2-3 questions per interviewer.", "Practised out loud at least twice."),
      ],
    },
  ]);
})();
