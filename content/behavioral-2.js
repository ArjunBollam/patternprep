/* More Behavioral chapters: what companies look for, the essential questions, delivery, innovation,
   developing others, strategic leadership and thinking big, and nailing the interview. */
(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow } = K;

  // A worked STAR answer, rendered as a labelled table.
  const star = (s, t, a, r) => table(['', 'Example answer'], [['**Situation**', s], ['**Task**', t], ['**Action**', a], ['**Result**', r]]);

  K.chapters('behavioral-interview', [
    {
      id: 'what-companies-look-for',
      title: 'What Companies Are Looking For',
      body: [
        p("Behind every behavioral question is a short list of **signals** the interviewer must report on. Knowing them lets you pick stories that provide evidence for each one, instead of hoping your stories happen to fit."),
        h('The core signals'),
        table(['Signal', 'In plain words', 'Evidence that convinces'], [
          ['Ownership', 'You treat outcomes as yours', 'you noticed a problem nobody owned and fixed it; you followed through after launch'],
          ['Delivery', 'You get important things done', 'shipped under constraints; cut scope wisely; unblocked yourself and others'],
          ['Judgement', 'You make good decisions with imperfect information', 'trade-offs you weighed, data you gathered, a decision you\'d still defend'],
          ['Collaboration', 'People want to work with you', 'resolved disagreements, helped others succeed, credited the team accurately'],
          ['Communication', 'You make complex things clear', 'concise, structured answers; you adapted the message to the audience'],
          ['Growth', 'You get better over time', 'feedback you acted on; mistakes you learned from; new skills you picked up'],
          ['Customer focus', 'You build for real users', 'you used user data, talked to customers, changed plans because of them'],
          ['Leadership', 'You raise the people and direction around you', 'mentoring, setting standards, aligning teams, driving long-term strategy'],
        ]),
        h('How expectations grow with level'),
        p("The same question is graded differently depending on the level you're interviewing for. What changes is mostly **scope**, **ambiguity** and **influence**:"),
        table(['Level', 'Typical scope', 'Ambiguity', 'Influence', 'A strong story sounds like'], [
          ['Entry / junior', 'a task or feature', 'problem is defined for you', 'yourself, a mentor', '"I learned X quickly and shipped Y with guidance"'],
          ['Mid-level', 'a feature or small project', 'some unknowns', 'your team', '"I owned the project end to end and handled the surprises"'],
          ['Senior', 'a multi-person project or system', 'unclear requirements', 'your team and neighbours', '"I shaped the solution, aligned two teams and de-risked the launch"'],
          ['Staff / principal', 'several teams or an org-wide problem', 'the problem itself is fuzzy', 'an organisation', '"I identified the problem, set direction and changed how many teams work"'],
          ['Manager', 'a team and its people', 'people and priorities', 'team and partners', '"I grew people, fixed team health and delivered through others"'],
        ]),
        note("A story that is excellent for a mid-level role can sound junior for a staff role. Pick stories whose **scope matches the level** you want, and say the scope explicitly (team size, users, cost, number of teams)."),
        h('How interviewers decide'),
        ul(
          "Most companies use a **rubric**: for each signal, the interviewer records evidence and a rating (from *strong no* to *strong yes*).",
          "They write down **what you said**, so vague answers leave them with nothing to write. Specific actions and numbers give them evidence.",
          "A debrief or hiring committee compares notes across interviewers. Consistent evidence across stories is what wins offers.",
          "Many companies publish their values or leadership principles. They're the clearest hint of which signals they weigh most."
        ),
        h('Turning this into preparation'),
        ol(
          "List the signals above (plus the company's own values).",
          "Map each story in your bank to the 2-3 signals it shows best.",
          "Check coverage: every signal should have at least two stories, and some stories should match your target level's scope."
        ),
      ],
    },

    {
      id: 'essential-questions',
      title: 'The Essential Questions',
      body: [
        p("A handful of questions come up in almost every behavioral interview. You should never be surprised by them, and you should never improvise an answer to them. Prepare each one in advance and practise it out loud."),
        table(['Question', 'What they\'re really asking', 'How to answer', 'Pitfalls'], [
          ['Tell me about yourself.', 'Can you summarise your career and why you fit, in 90 seconds?', 'present → past → future, ending with why this role ([full chapter](#/behavioral-interview/tell-me-about-yourself))', 'reciting your resume; a 5-minute life story'],
          ['Why this company?', 'Did you do your homework, and will you stay?', 'two specific reasons tied to their product, technology or mission, plus how your experience fits', 'generic praise; salary or perks first'],
          ['Why are you leaving your current role?', 'Are you running from something you\'ll bring here?', 'focus on what you\'re moving **towards** (scope, domain, growth)', 'criticising your employer or manager'],
          ['What is the most challenging project you\'ve worked on?', 'How deep is your technical and project experience?', 'a project at your target level; the hard part, your role, the trade-offs, the result', 'a project where your role is unclear'],
          ['What are you most proud of?', 'What do you value, and what impact have you had?', 'a result that mattered to users or the business, with your specific contribution', 'something tiny or purely personal'],
          ['Tell me about a conflict.', 'Can you disagree productively?', 'see [Conflict and Disagreement](#/behavioral-interview/conflict)', 'villains and winners'],
          ['Tell me about a failure.', 'Do you own mistakes and learn?', 'see [Failure and Mistakes](#/behavioral-interview/failure-and-mistakes)', 'fake failures ("I work too hard")'],
          ['What feedback have you received?', 'Are you self-aware and coachable?', 'real feedback, what you changed, evidence it worked', 'feedback you dismissed'],
          ['Where do you see yourself in a few years?', 'Do your goals fit this role?', 'growth in skills and scope that this role plausibly offers', '"in your job" or plans to leave soon'],
          ['Do you have any questions for us?', 'Are you curious and evaluating fit?', 'thoughtful questions ([Questions to Ask](#/behavioral-interview/questions-to-ask))', '"No, I think you covered everything"'],
        ]),
        h('Preparing "Why this company?"'),
        ul(
          "Use the product. Note one thing you like and one thing you'd be curious to improve.",
          "Read their engineering blog, recent launches and job description; find a technical challenge that connects to your experience.",
          "Connect it to you: *\"You're moving your billing to event sourcing; I spent two years building an event-sourced ledger, and I'd love to work on that at your scale.\"*"
        ),
        h('Preparing "the most challenging project"'),
        p("This is often a 10-15 minute deep dive, with follow-ups. Prepare a one-page outline:"),
        ol(
          "The goal and why it mattered (users, revenue, risk).",
          "Constraints: deadline, team size, legacy systems, scale.",
          "The hard part: the technical or organisational problem that made it challenging.",
          "Options you considered and why you chose one.",
          "Your exact role versus the team's.",
          "Results with numbers, and what you'd do differently now."
        ),
        note("Keep a written answer for every question in this table, in your own words, as bullet points rather than a script. Rehearse until you can say each one naturally in about two minutes."),
      ],
    },

    {
      id: 'delivery',
      title: 'Delivery: Getting Results',
      body: [
        p("Delivery questions check that you can turn plans into shipped outcomes, especially when time is short, requirements change or things break. Interviewers listen for **bias for action**, smart **prioritisation**, and **follow-through**."),
        h('Typical questions'),
        ul(
          "Tell me about a time you delivered a project under a tight deadline.",
          "Describe a time you had to cut scope. How did you decide what to cut?",
          "Tell me about a time a project was at risk. What did you do?",
          "Give an example of a time you had to balance quality and speed."
        ),
        h('What a strong answer shows'),
        ul(
          "You understood **what mattered most** (the real deadline, the must-have features) before acting.",
          "You **broke the work down**, found the critical path and removed blockers early.",
          "You made explicit **trade-offs** and communicated them to stakeholders before the deadline, not after.",
          "You **finished**: shipped, measured, cleaned up, and handed over."
        ),
        h('Example'),
        star(
          'Our team had six weeks to launch tax invoices in a new country, a legal requirement for a market opening on a fixed date. Two weeks in, we learned the local tax authority required real-time invoice registration through an API we hadn\'t planned for.',
          'As the project lead, I had to make sure we launched on time and legally compliant, with a team of four.',
          'I split the work into must-haves for launch (real-time registration, the legally required invoice fields) and things that could follow (custom templates, bulk export). I built the registration client first, since it was the riskiest piece, and set up a sandbox test with the authority in week three. I wrote a short weekly status note for the business with risks in red, and when bulk export slipped I proposed a manual workaround for the first month, which finance accepted.',
          'We launched on the legal date with zero compliance issues, and shipped templates and bulk export three weeks later. The risk-first ordering became the default planning approach for later country launches.'
        ),
        h('Useful phrases (only if they\'re true)'),
        ul("*\"The riskiest part was X, so I did that first.\"*", "*\"We agreed to drop Y from the first release because…\"*", "*\"I flagged the slip two weeks early, with options.\"*"),
        h('Avoid'),
        ul("Heroics as the main message (*\"I worked every weekend\"*). Sustainable delivery is the signal.", "Stories where quality was silently sacrificed.", "Blaming other teams for delays without showing what you did about it."),
      ],
    },

    {
      id: 'innovation',
      title: 'Innovation',
      body: [
        p("Innovation questions look for people who improve things: who question how work is done, propose better ways, and, crucially, **make those ideas real**. An idea that never shipped is a weak story; an idea you tested, refined and got adopted is a strong one."),
        h('Typical questions'),
        ul(
          "Tell me about a time you came up with a new approach to a problem.",
          "Describe a time you improved a process or tool your team used every day.",
          "Tell me about a time you challenged the way things had always been done.",
          "Give an example of a risk you took that didn't work out."
        ),
        h('What a strong answer shows'),
        ul(
          "**Curiosity**: you noticed a problem others had accepted as normal.",
          "**Evidence**: you measured the pain before proposing a fix.",
          "**Small experiments**: you tested the idea cheaply before asking for a big investment.",
          "**Adoption**: you brought people along; the improvement outlived your involvement."
        ),
        h('Example'),
        star(
          'Our mobile releases needed a manual 2-day regression pass by QA every two weeks, and roughly one in four releases still shipped a visible bug.',
          'I wasn\'t asked to fix it, but as the engineer who handled most release blockers, I wanted to make releases faster and safer.',
          'I tracked the last 12 escaped bugs and found that 9 were in three flows: login, checkout and settings. I built screenshot tests for those flows in a week of spare time and ran them on every pull request for a month alongside the manual pass, recording what each caught. I then presented the comparison to QA and my manager and proposed shrinking the manual pass to the remaining flows.',
          'Within two months the manual pass took half a day, escaped bugs dropped from about one per release to one per quarter, and the QA team took over the test suite and extended it. I learned that a month of side-by-side data convinces people far better than a proposal.'
        ),
        h('Avoid'),
        ul("Ideas without outcomes.", "Innovation for its own sake (a rewrite in a trendy language with no user benefit).", "Taking sole credit for a team idea; say who did what."),
      ],
    },

    {
      id: 'developing-others',
      title: 'Developing Others',
      body: [
        p("From senior engineers upward, companies expect you to make the people around you better: mentoring, giving useful feedback, onboarding, delegating growth opportunities and raising the team's standards. For managers, it is a central part of the job."),
        h('Typical questions'),
        ul(
          "Tell me about someone you mentored. How did you help them grow?",
          "Describe a time you gave difficult feedback to a colleague.",
          "How have you helped a new team member become productive?",
          "Tell me about a time you delegated something important."
        ),
        h('What a strong answer shows'),
        ul(
          "You adapted to the person: their goals, strengths and gaps.",
          "You **taught** rather than did the work for them.",
          "Your feedback was specific, timely and kind, and you followed up.",
          "There's a visible outcome: the person took on more scope, got promoted, or the team became less dependent on you."
        ),
        h('Example'),
        star(
          'A junior engineer who joined my team was strong at coding but anxious about design work and avoided speaking in design reviews.',
          'As her onboarding buddy and tech lead, I wanted her to be able to own a small service end to end within six months.',
          'We agreed on that goal together. I gave her a small, real design (a rate limiter for our public API) and paired on the first draft without writing it for her. Before the review, we rehearsed the likely questions. After each review I gave her two pieces of specific feedback: one strength, one thing to try next time. I also handed her the on-call runbook rewrite, so she\'d learn the system\'s failure modes.',
          'Her third design review ran without my help, she owned the rate limiter in production, and she was promoted a year later. I now use the same pattern (shared goal, real scope, rehearsal, specific feedback) with everyone I mentor.'
        ),
        h('Giving difficult feedback, briefly'),
        ol("Make it private and timely.", "Describe the specific behaviour and its impact, not the person.", "Ask for their view; you may be missing context.", "Agree on a next step, then follow up."),
        h('Avoid'),
        ul("Mentoring stories with no visible outcome.", "Describing people as problems.", "Implying you made someone successful single-handedly."),
      ],
    },

    {
      id: 'strategic-leadership-and-thinking-big',
      title: 'Strategic Leadership and Thinking Big',
      body: [
        p("For staff-level engineers and managers, interviewers look for people who see **beyond the current project**: who spot the problems and opportunities that matter most, set a direction, align other teams behind it, and make bets that pay off over years."),
        h('Typical questions'),
        ul(
          "Tell me about a time you set the technical direction for a team or organisation.",
          "Describe a long-term problem you identified before others did.",
          "Tell me about a time you convinced several teams to adopt a change.",
          "Give an example of a big bet you made. How did you decide?"
        ),
        h('What a strong answer shows'),
        ul(
          "**Problem selection**: why *this* problem mattered more than others, ideally tied to business or user outcomes.",
          "**A clear vision** and a path to it: phases, milestones, what you'd stop doing.",
          "**Alignment**: you brought stakeholders along with documents, prototypes, data and listening, not authority.",
          "**Judgement under uncertainty**: what you didn't know, and how you reduced risk.",
          "**Scale of impact**: changes that affected many teams, customers or years."
        ),
        h('Example'),
        star(
          'Our company had grown to 40 services, each with its own way of handling authentication. Security reviews were slow, and two incidents in a year came from inconsistent token checks.',
          'As a staff engineer, nobody asked me to fix this, but I believed it was the biggest risk to our security posture and to the speed of new product launches.',
          'I quantified the cost: security review delays added about three weeks to each launch, and both incidents had cost over 200 engineer-hours. I wrote a two-page proposal for a shared auth gateway with a phased plan: first the five highest-traffic services, then a self-service migration kit. I reviewed it with each team lead one to one before the big meeting, adjusted the plan for two teams with special needs, and secured one engineer from the platform team for a quarter.',
          'Within a year, 34 of 40 services used the gateway, security reviews for new services dropped from three weeks to two days, and we had no auth-related incidents. The migration kit became the template for later platform changes.'
        ),
        h('Thinking big, with judgement'),
        ul("Show that you considered **not** doing it, or doing something smaller.", "Mention what you deliberately left out to make the plan achievable.", "Explain how you measured success."),
        h('Avoid'),
        ul("Grand visions that didn't move past a document.", "Stories where you forced a decision through without buy-in.", "Confusing *big* with *complicated*: the best strategies are often simple."),
      ],
    },

    {
      id: 'nailing-the-interview',
      title: 'Nailing the Interview',
      body: [
        p("Good stories are necessary but not sufficient. Delivery, timing and preparation decide how much of your evidence actually reaches the interviewer. This chapter covers the day itself, from the week before to the thank-you note."),
        h('The week before'),
        ul(
          "Review the company's values and map 1-2 stories to each.",
          "Rehearse your essential answers out loud; record yourself once and listen.",
          "Do at least one mock interview with someone who will interrupt and ask follow-ups.",
          "Prepare 3-5 questions for each interviewer type (engineer, manager, cross-functional partner)."
        ),
        h('During the interview'),
        table(['Do', 'Why'], [
          ['Pause and pick the best story before answering', 'a 5-second pause beats a weak story'],
          ['Give a one-sentence headline first', '"This was when I led the migration of our payments ledger." Interviewers can follow you'],
          ['Keep each story to about 2-3 minutes', 'leaves time for follow-ups, which is where the evidence is'],
          ['Say "I" for your actions, "we" for the team\'s', 'interviewers grade your contribution'],
          ['End with a measurable result and a lesson', 'gives them something concrete to write down'],
          ['Ask "Would you like more detail on any part?"', 'lets them steer to the signal they need'],
        ]),
        h('Handling the tricky moments'),
        ul(
          "**No perfect story?** Say so briefly, then offer the closest real example: *\"I haven't led a reorg, but I did lead a team-split decision. Can I share that?\"*",
          "**Interrupted?** That's usually a good sign: they want specific detail. Answer the question and continue.",
          "**Blank mind?** Ask for a moment, glance at your story list (if allowed on video), or ask a clarifying question.",
          "**A question you disagree with the premise of?** Answer respectfully and add your view in one sentence."
        ),
        h('Video interviews'),
        ul("Test camera, microphone and network the day before; use headphones.", "Put a one-page story cheat sheet next to your screen, but don't read from it.", "Look at the camera when making key points; keep the background quiet."),
        h('Afterwards'),
        ol(
          "Write down every question you were asked and how you answered, while you still remember. It improves your story bank for the next round.",
          "Send a short thank-you note to the recruiter (2-3 sentences; mention one thing you enjoyed discussing).",
          "If you haven't heard back by the date the recruiter gave, follow up once, politely."
        ),
        note("Treat each interview loop as practice for the next. Candidates who log questions and refine their stories after every round improve noticeably within two or three loops."),
      ],
    },
  ]);

  K.orderChapters('behavioral-interview', [
    'introduction', 'what-companies-look-for', 'the-star-method', 'building-your-story-bank', 'essential-questions',
    'tell-me-about-yourself', 'company-values', 'ownership-and-initiative', 'delivery', 'problem-solving', 'conflict',
    'teamwork', 'feedback-and-growth', 'failure-and-mistakes', 'user-focus', 'innovation', 'developing-others',
    'leadership', 'strategic-leadership-and-thinking-big', 'pressure-and-ambiguity', 'questions-to-ask',
    'nailing-the-interview', 'traps-and-pitfalls',
  ]);
})();
