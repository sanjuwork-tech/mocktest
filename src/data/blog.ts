import type { ExamKey } from "./catalog";

// Editorial rule: every fact in a post must come from a source listed in `sources`
// (official bulletins first). No invented cutoffs, salaries, percentiles or outcomes.

export type BlogSource = { label: string; url: string };

export type BlogPost = {
  slug: string;
  title: string;
  /** Search-result title, 60 characters or fewer before the site name. */
  metaTitle: string;
  /** Meta description, 160 characters or fewer. */
  description: string;
  subtitle: string;
  examSlug: ExamKey;
  /** ISO dates (YYYY-MM-DD). */
  publishedDate: string;
  updatedDate: string;
  readTime: string;
  author: string;
  authorRole: string;
  category: string;
  badge: string;
  summary: string;
  keyTakeaways: string[];
  contentSections: {
    heading: string;
    body: string[];
    list?: string[];
    callout?: string;
  }[];
  faqs: { q: string; a: string }[];
  sources: BlogSource[];
  relatedExams: ExamKey[];
};

const AUTHOR = "OurMocks Editorial Team";
const AUTHOR_ROLE = "Checked against the official bulletins listed below";

const SRC = {
  cuetBulletin: {
    label: "CUET UG 2026 Information Bulletin (NTA)",
    url: "https://cdnbbsr.s3waas.gov.in/s3d1a21da7bca4abff8b0b61b87597de73/uploads/2026/01/202601031633478370.pdf",
  },
  cuetSite: { label: "CUET UG official website (NTA)", url: "https://cuet.nta.nic.in/" },
  cuetSyllabus: { label: "CUET UG official syllabus", url: "https://cuet.nta.nic.in/cuetug-2026-syllabus/" },
  iatBulletin: { label: "IAT 2026 Information Brochure", url: "https://www.iiseradmission.in/assets/pdfs/IB_IAT_2026_ENG.pdf" },
  iiserAdmission: { label: "IISER admissions website", url: "https://www.iiseradmission.in/" },
  nestBrochure: {
    label: "NEST 2026 Information Brochure & Syllabus",
    url: "https://www.nestexam.in/docs/26/NEST2026_Brochure_Syllabus_Updated_12Jan2026.pdf?v=1.1",
  },
  nestSite: { label: "NEST official website", url: "https://www.nestexam.in/" },
  comedk2026: { label: "COMEDK UGET 2026: about, eligibility, pattern, syllabus", url: "https://www.comedk.org/about-uget-and-notification-2026" },
  nirf2025: { label: "NIRF 2025 rankings (Ministry of Education)", url: "https://www.nirfindia.org/Rankings/2025/Ranking.html" },
};

export const blogPosts: BlogPost[] = [
  {
    slug: "cuet-ug-2027-pattern-changes-confirmed-vs-proposed",
    title: "CUET UG 2027 Changes: What Is Confirmed, What Is Only Proposed",
    metaTitle: "CUET UG 2027 Changes: Confirmed vs Proposed",
    description:
      "Shorter papers, a four-subject cap, one exam day: what NTA has confirmed for CUET UG 2027, what is only proposed, and how to prepare until the bulletin.",
    subtitle: "Separating NTA's official position from the headlines — and what to do while you wait for the bulletin.",
    examSlug: "cuet-ug",
    publishedDate: "2026-10-27",
    updatedDate: "2026-10-27",
    readTime: "6 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Exam updates",
    badge: "CUET UG 2027",
    summary:
      "Reports say NTA may shorten CUET UG papers and cap subjects at four for 2027. As of 27 October 2026, none of this is in an official notice. Here is the current official pattern, the reported proposals, and a preparation plan that works either way.",
    keyTakeaways: [
      "No official CUET UG 2027 notice exists yet; the 2026 bulletin is still the latest official pattern.",
      "2026 pattern: 50 compulsory questions per paper, 60 minutes, +5/−1, up to five of 37 papers.",
      "Reported proposals: 35–40 questions in 40–45 minutes, a four-subject cap and all papers on one day — unconfirmed.",
      "In 2026 registration ran 3–30 January, so the 2027 bulletin is likely around late December 2026 or January 2027.",
    ],
    contentSections: [
      {
        heading: "The official position today",
        body: [
          "The National Testing Agency (NTA) has not published the CUET UG 2027 information bulletin. Until it does, the official reference is the 2026 bulletin, and any 2027 change you read about is, at best, a proposal.",
          "Under the 2026 bulletin, CUET UG offered 37 papers — 13 languages, 23 domain subjects and the General Aptitude Test. You could choose up to five. Every paper had 50 compulsory questions, lasted 60 minutes, and was marked +5 for a correct answer and −1 for a wrong one.",
        ],
      },
      {
        heading: "What the reports say is being considered",
        body: [
          "Education news sites report that a meeting of NTA, UGC and the Ministry of Education on 13 October 2026 discussed simplifying CUET UG for 2027. The changes they describe are:",
        ],
        list: [
          "Shorter papers: around 35–40 questions in 40–45 minutes, instead of 50 questions in 60 minutes.",
          "A cap of four subjects instead of five.",
          "\"One student, one day\": all of a student's papers scheduled on a single day.",
        ],
        callout:
          "Treat these as unconfirmed. The only document that decides the 2027 pattern is the official bulletin on cuet.nta.nic.in.",
      },
      {
        heading: "Why the details matter for your preparation",
        body: [
          "If papers become shorter, each question carries more weight and there is less time to recover from a slow start. Speed and accuracy matter more than coverage of rare topics.",
          "If the subject cap drops to four, choosing papers becomes a real decision. Many students currently add a fifth paper as a safety net; under a four-paper cap, every paper has to be one your target courses actually accept.",
          "A one-day schedule would mean sitting several papers back to back. Stamina — not just knowledge — would decide the last paper of the day.",
        ],
      },
      {
        heading: "A plan that works under either pattern",
        body: [
          "You don't need to wait for the bulletin to start. Each of these steps holds whatever NTA decides:",
        ],
        list: [
          "Fix your course list first, then check each university's CUET subject mapping. Shortlist the four papers that unlock the most of your courses.",
          "Use the NCERT-based official syllabus for each domain subject as your checklist.",
          "Practise full 50-question, 60-minute papers now. If the paper shortens, your pacing will only get easier.",
          "Track accuracy, not just attempts: every wrong answer costs a mark, and confident mistakes add up quickly.",
          "Once a week, sit two papers back to back to build stamina for a possible one-day schedule.",
        ],
      },
    ],
    faqs: [
      { q: "Has NTA reduced CUET UG 2027 to 40 questions?", a: "Not officially. As of 27 October 2026, reduced papers are a reported proposal; the 2026 pattern of 50 questions in 60 minutes is the latest official one." },
      { q: "When will the CUET UG 2027 bulletin come out?", a: "NTA hasn't announced a date. The 2026 bulletin was released at the start of January, with registration from 3 to 30 January 2026." },
      { q: "Should I prepare five subjects or four?", a: "Prepare the four papers your target courses need most, and keep a fifth only if it opens courses you would actually take. Revisit this once the bulletin confirms the cap." },
    ],
    sources: [SRC.cuetBulletin, SRC.cuetSite, SRC.cuetSyllabus],
    relatedExams: ["cuet-ug"],
  },
  {
    slug: "how-to-prepare-for-cuet-ug-2027",
    title: "How to Prepare for CUET UG 2027: Choose Papers, Plan, Practise",
    metaTitle: "How to Prepare for CUET UG 2027",
    description:
      "A practical CUET UG 2027 plan: choosing papers from course mappings, using the NCERT-based syllabus, pacing 50 questions in 60 minutes and −1 marking.",
    subtitle: "Start from the courses you want, not from the subject list.",
    examSlug: "cuet-ug",
    publishedDate: "2026-10-14",
    updatedDate: "2026-10-27",
    readTime: "8 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Preparation",
    badge: "CUET UG 2027",
    summary:
      "CUET UG rewards students who pick the right papers and practise under real timing. This guide covers how to choose papers, how to use the official syllabus, how to pace a 60-minute paper and how negative marking should change the way you attempt.",
    keyTakeaways: [
      "Pick papers from your target courses' CUET subject mapping — the bulletin lets you choose papers irrespective of your Class 12 subjects, but courses can still require specific ones.",
      "Domain syllabi follow NCERT; use the official syllabus as your checklist.",
      "50 questions in 60 minutes leaves about 72 seconds per question, including review.",
      "With +5/−1, an educated guess pays on average; confident wrong answers are the real risk.",
    ],
    contentSections: [
      {
        heading: "1. Choose your papers backwards, from courses",
        body: [
          "Under the 2026 bulletin you could take up to five of 37 papers: 13 languages, 23 domain subjects and the General Aptitude Test. The bulletin lets you choose papers irrespective of the subjects you studied in Class 12, but each university decides which papers each course accepts.",
          "So start with a list of the courses and universities you would genuinely join. Open each university's CUET course mapping, note the required papers, and pick the combination that keeps the most of your list open.",
        ],
        callout:
          "A common mistake is adding papers you haven't studied for \"more options\". A weak score in an extra paper doesn't help, and it takes study time away from the papers that count.",
      },
      {
        heading: "2. Use the official syllabus as your checklist",
        body: [
          "NTA states that domain subjects follow the NCERT syllabus. Download the official subject-wise syllabus and turn it into a checklist. Every chapter you tick off should mean you have read it, made short notes and solved questions on it.",
          "For language papers, the bulletin tests reading comprehension (factual, literary and narrative passages), literary aptitude and vocabulary. The General Aptitude Test covers general knowledge, current affairs, mental ability, numerical ability and logical reasoning.",
        ],
      },
      {
        heading: "3. Pace: about 72 seconds a question",
        body: [
          "Each paper has 50 compulsory questions in 60 minutes — about 72 seconds per question, review included. In practice, that means a first pass at about one question a minute, leaving ten minutes for marked questions.",
          "Practise in full, timed papers on a computer, not just chapter quizzes. Pacing is a skill you build only by sitting complete papers.",
        ],
      },
      {
        heading: "4. Let the marking scheme shape how you attempt",
        body: [
          "A correct answer earns 5 marks and a wrong one costs 1. A blind guess among four options is right one time in four, so on average it is worth +0.5 marks (5 × ¼ − 1 × ¾). Eliminate one option and it rises to +1; eliminate two and it is +2.",
          "So in CUET, an educated guess almost always pays. The real danger is not guessing — it is confident wrong answers on questions you thought you knew. Review your mocks for those.",
        ],
      },
      {
        heading: "5. A six-month outline",
        body: ["Adjust the timing around your board exams; the order is what matters."],
        list: [
          "Months 1–3: finish the NCERT syllabus for your domain papers alongside board preparation; make one-page notes per chapter.",
          "Month 4: switch to objective practice — topic tests and previous papers, timed.",
          "Month 5: one full paper per subject per week, with a review of every mistake.",
          "Month 6: full papers at your likely exam time; revise only from your notes and error log.",
        ],
      },
    ],
    faqs: [
      { q: "Is the CUET UG domain syllabus only Class 12?", a: "NTA says domain subjects follow the NCERT syllabus. Check the official subject-wise syllabus for your paper; it lists the units that are tested." },
      { q: "Can I take a domain paper I didn't study in Class 12?", a: "The bulletin allows it, but a university can still require particular subjects for a course. Check the course eligibility first." },
      { q: "Should I guess in CUET?", a: "Usually yes. With +5/−1, even a blind guess among four options is worth +0.5 marks on average, and each eliminated option improves the odds. Avoid careless answers on questions you think you know." },
    ],
    sources: [SRC.cuetBulletin, SRC.cuetSyllabus, SRC.cuetSite],
    relatedExams: ["cuet-ug"],
  },
  {
    slug: "how-cuet-normalisation-works",
    title: "How CUET Scores Are Normalised Across Shifts, Explained Simply",
    metaTitle: "CUET Normalisation Explained (Percentile Method)",
    description:
      "How NTA turns CUET raw marks into percentile and normalised scores when a paper runs in several shifts, with a worked example based on the official bulletin.",
    subtitle: "Why your normalised score can differ from your raw marks, and what that means for you.",
    examSlug: "cuet-ug",
    publishedDate: "2026-10-27",
    updatedDate: "2026-10-27",
    readTime: "5 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Explainers",
    badge: "CUET UG",
    summary:
      "When a CUET paper is held in several shifts, one shift may get a slightly harder paper. NTA corrects for this by ranking you within your own shift and then mapping that rank back onto a common marks scale. Here is the method from the official bulletin.",
    keyTakeaways: [
      "Normalisation applies to papers held in more than one shift.",
      "Step 1: your percentile is calculated within your own shift.",
      "Steps 2–3: candidates with the same percentile across shifts get the same normalised score — the average of the raw marks at that percentile in each shift.",
      "You can't game normalisation: the best strategy is simply to maximise your raw score.",
    ],
    contentSections: [
      {
        heading: "Why normalisation exists",
        body: [
          "Large CUET papers run in several shifts, each with a different question set. Even careful paper-setters can't make every set exactly equal in difficulty. Normalisation stops a student from being penalised just for drawing the harder shift.",
        ],
      },
      {
        heading: "Step 1: your percentile within your shift",
        body: [
          "NTA counts the candidates in your shift (call it N) and the number of them whose raw score is less than or equal to yours (m). Your percentile is m × 100 ÷ N.",
          "So a percentile says what share of your own shift you matched or beat. A percentile of 90 means 90% of candidates in your shift scored the same as you or lower.",
        ],
      },
      {
        heading: "Steps 2 and 3: back to a marks scale",
        body: [
          "NTA then puts all shifts in one table, sorted by percentile. For each percentile value, it looks up the raw marks that correspond to it in every shift, and averages them. That average is the normalised score for everyone at that percentile.",
          "In the bulletin's worked example, candidates at the same top percentile in four shifts had raw scores of 200, 194, 188 and 200; each received the same normalised score of 195.5.",
        ],
        callout:
          "In plain terms: if your shift was harder and everyone scored lower, your rank within the shift protects you. Your normalised score reflects where you stood, not which shift you sat.",
      },
      {
        heading: "What this means for you",
        body: [
          "You can't predict your shift's difficulty or influence the method, so there's no strategy beyond scoring as high as you can. Don't panic if a paper feels hard — it may have felt hard to your whole shift, and normalisation accounts for that.",
          "Universities use the NTA score in their own merit lists, so check each university's admission rules for how it combines scores across papers.",
        ],
      },
    ],
    faqs: [
      { q: "Is a CUET percentile the same as a percentage?", a: "No. A percentage is your marks out of the maximum. A percentile is the share of candidates in your shift who scored the same as you or lower." },
      { q: "Does every CUET paper get normalised?", a: "The bulletin's normalisation procedure applies to papers held in multiple shifts." },
      { q: "Can normalisation reduce my score?", a: "Your normalised score can be lower or higher than your raw marks, depending on how your shift compared with others. It reflects your standing within your shift." },
    ],
    sources: [SRC.cuetBulletin, SRC.cuetSite],
    relatedExams: ["cuet-ug"],
  },
  {
    slug: "iiser-iat-2027-pcmb-strategy-research-admissions",
    title: "IISER IAT 2027: Pattern, Eligibility and a PCMB Preparation Plan",
    metaTitle: "IISER IAT 2027: Pattern, Eligibility & Prep Plan",
    description:
      "IAT 2027: the official 60-question, 3-hour, +4/−1 pattern, who is eligible, which institutes use IAT (IISERs, IISc, IIT Madras) and how to prepare.",
    subtitle: "Four subjects, one paper, seven IISERs — and more doors than most students realise.",
    examSlug: "iiser-iat",
    publishedDate: "2026-10-14",
    updatedDate: "2026-10-27",
    readTime: "7 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Preparation",
    badge: "IISER IAT 2027",
    summary:
      "IAT is a single 3-hour paper of 60 questions — 15 each in Biology, Chemistry, Mathematics and Physics — marked +4/−1. Beyond the seven IISERs, the 2026 brochure lists IISc Bengaluru, IIT Madras, IIT Guwahati, IACS Kolkata and IIEST Shibpur among the institutions using it.",
    keyTakeaways: [
      "60 questions, 15 per subject, 3 hours, +4/−1, maximum 240 (2026 brochure).",
      "2,343 tentative seats in 2026: 2,043 BS-MS and 300 BS/B.Tech.",
      "IAT 2026 was also used by IISc (BS Research), IIT Madras (4-year BS), IIT Guwahati, IACS Kolkata and IIEST Shibpur.",
      "BS-MS needs any three of Biology, Chemistry, Mathematics and Physics in Class 12 — but you answer all four sections in the test.",
    ],
    contentSections: [
      {
        heading: "The official pattern",
        body: [
          "IAT 2026 was a computer-based test lasting three hours, with 60 multiple-choice questions split equally across Biology, Chemistry, Mathematics and Physics. A correct answer earns 4 marks, a wrong one costs 1, and unanswered questions score 0, for a maximum of 240.",
          "Because every subject has the same weight, your weakest subject matters as much as your strongest.",
        ],
      },
      {
        heading: "Where IAT can take you",
        body: [
          "The 2026 brochure lists 2,043 BS-MS seats across IISER Berhampur, Bhopal, Kolkata, Mohali, Pune, Thiruvananthapuram and Tirupati, plus 300 seats in BS and B.Tech programmes at IISER Bhopal and IISER Tirupati.",
          "Section 25 of the same brochure lists other institutions using IAT 2026:",
        ],
        list: [
          "Indian Institute of Science, Bengaluru — 4-year BS (Research).",
          "IIT Madras — 4-year BS programme.",
          "IIT Guwahati — 4-year BS in Biomedical Science and Engineering.",
          "IACS Kolkata — integrated BS-MS.",
          "IIEST Shibpur — 5-year BS-MS in Chemistry, Physics and Applied Geology.",
        ],
        callout:
          "These institutions run their own applications. A good IAT score alone does not enrol you — follow each institute's admission process.",
      },
      {
        heading: "Who is eligible",
        body: [
          "For 2026, candidates needed to have passed Class 12 (or a three-year diploma) in 2024, 2025 or 2026, or be appearing in 2026. BS-MS applicants needed three of Biology, Chemistry, Mathematics and Physics, with a 60% aggregate (55% for SC/ST/PwD). Some programmes, such as B.Tech and the economics and data-science degrees, have extra subject requirements.",
          "The 2027 rules will be in the 2027 brochure. If the pattern repeats, 2025, 2026 and 2027 passouts would be eligible — confirm before you apply.",
        ],
      },
      {
        heading: "Preparing all four subjects",
        body: [
          "Most IAT candidates have one subject they didn't take in Class 12 or haven't studied seriously — Biology for PCM students, Mathematics for PCB students. With 15 questions and 60 marks per subject, ignoring it is expensive.",
        ],
        list: [
          "Start with your weakest subject's NCERT Class 11–12 textbooks, aiming for confident basics rather than advanced problems.",
          "Practise mixed papers: 60 questions across four subjects, timed at three hours, so switching subjects becomes natural.",
          "With +4/−1, a blind guess is worth only +0.25 marks on average, but eliminating even one option makes guessing clearly worthwhile (about +0.67).",
          "Use the official mock test on the IISER admissions portal before the exam to learn the interface.",
        ],
      },
    ],
    faqs: [
      { q: "Can a PCB student get into an IISER?", a: "Yes. BS-MS needs any three of Biology, Chemistry, Mathematics and Physics in Class 12. You still answer all four IAT sections, so prepare basic Mathematics." },
      { q: "Is IISc admission through IAT?", a: "The IAT 2026 brochure lists IISc's 4-year BS (Research) among the programmes using IAT. IISc runs its own application alongside." },
      { q: "How many seats do the IISERs have?", a: "For 2026, 2,343 tentative seats: 2,043 in BS-MS and 300 in BS/B.Tech programmes." },
    ],
    sources: [SRC.iatBulletin, SRC.iiserAdmission],
    relatedExams: ["iiser-iat", "niser-nest"],
  },
  {
    slug: "niser-nest-2027-sectional-cutoffs-mastery",
    title: "NEST 2027: How the Best-Three-Sections Scoring and Cut-offs Work",
    metaTitle: "NEST 2027: Scoring, Section Cut-offs & Strategy",
    description:
      "NEST 2027 explained: four 20-question sections, +3/−1, best three sections counted, the section minimum score rule and the DISHA scholarship.",
    subtitle: "NEST's scoring rewards three strong sections — here's how to use that.",
    examSlug: "niser-nest",
    publishedDate: "2026-10-14",
    updatedDate: "2026-10-27",
    readTime: "6 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Preparation",
    badge: "NEST 2027",
    summary:
      "NEST is a 3-hour test with four 20-question sections, marked +3/−1. Only your best three sections count, and each counted section must clear a minimum score set from the top 100 performances. Admitted students at NISER and CEBS are eligible for the ₹60,000-a-year DISHA scholarship.",
    keyTakeaways: [
      "Four sections (Biology, Chemistry, Mathematics, Physics), 20 single-correct questions each, 60 marks per section.",
      "Your total is the sum of your best three section scores, maximum 180.",
      "Each counted section must reach its Section-wise Minimum Admissible Score: 20% of the average of the top 100 scores in that section (lower for reserved categories).",
      "Admitted students are eligible for DISHA: ₹60,000 a year plus ₹20,000 a year for summer internships.",
    ],
    contentSections: [
      {
        heading: "The official pattern",
        body: [
          "NEST 2026 was a 3-hour computer-based test in English and Hindi. Each of its four sections has 20 multiple-choice questions with only one correct answer. A correct answer earns 3 marks and a wrong one costs 1, so each section is worth 60 marks. Calculators and log tables are not allowed.",
        ],
      },
      {
        heading: "Best three sections, with a minimum in each",
        body: [
          "You must attempt at least three sections. Your total is the sum of your best three section scores — so the maximum is 180, not 240.",
          "There's a catch: each counted section must clear its Section-wise Minimum Admissible Score (SMAS), defined as 20% of the average of the best 100 scores in that section. The brochure's example: if the top-100 average in Chemistry is 48 out of 60, the Chemistry minimum is 9.6. For OBC candidates it is 90% of that, for SC/ST candidates 50%, with further relaxation for Divyangjan candidates.",
        ],
        callout:
          "Strategy in one line: build three strong sections and make sure none of them is weak enough to fall below the minimum. The fourth section is a bonus, not a requirement.",
      },
      {
        heading: "The opportunity: NISER and CEBS",
        body: [
          "NEST admits to the 5-year Integrated M.Sc at NISER Bhubaneswar and UM-DAE CEBS Mumbai, both set up by the Department of Atomic Energy in 2007 for research-oriented science teaching.",
          "The brochure states that admitted students are eligible for the DAE's DISHA scholarship of ₹60,000 a year, plus ₹20,000 a year for summer internships, and that NISER and CEBS endorse students selected for DST's INSPIRE-SHE programme. There is no age limit for NEST or for admission.",
        ],
      },
      {
        heading: "A preparation plan built on the scoring rule",
        body: [],
        list: [
          "Pick your three core sections early, based on your Class 11–12 strengths.",
          "Use the official syllabus in the brochure and previous NEST papers from nestexam.in.",
          "Practise full 3-hour papers without a calculator; NEST arithmetic must be done by hand.",
          "Keep the fourth section warm with easy questions only — it can replace a section that goes badly on the day.",
          "At +3/−1, a blind guess among four options is worth exactly zero on average. Guess only after eliminating at least one option (then it's worth about +0.33).",
        ],
      },
    ],
    faqs: [
      { q: "Does every NISER and CEBS student get the DISHA scholarship?", a: "The brochure says students admitted to the Integrated M.Sc at NISER and CEBS are eligible for it. Continued support is subject to the scheme's conditions, so check them after admission." },
      { q: "Can I skip a section in NEST?", a: "You must attempt at least three sections. Only your best three count, and each counted section must clear its minimum score." },
      { q: "Does IAT give the DISHA scholarship?", a: "No. DISHA is a Department of Atomic Energy scholarship for students at NISER and UM-DAE CEBS, which admit through NEST." },
    ],
    sources: [SRC.nestBrochure, SRC.nestSite],
    relatedExams: ["niser-nest", "iiser-iat"],
  },
  {
    slug: "bs-ms-vs-bs-vs-integrated-msc-iiser-iisc-niser",
    title: "BS-MS, BS or Integrated M.Sc? Science Degrees at IISER, IISc, IIT Madras and NISER",
    metaTitle: "BS-MS vs BS vs Integrated M.Sc: Which Science Degree?",
    description:
      "IISER BS-MS (5 years), IISc BS Research and IIT Madras BS (4 years), NISER and CEBS Integrated M.Sc (5 years): how they differ and which exam leads to each.",
    subtitle: "If you love science but don't want an engineering or medical degree, these are your main options.",
    examSlug: "iiser-iat",
    publishedDate: "2026-10-27",
    updatedDate: "2026-10-27",
    readTime: "6 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Opportunities",
    badge: "Beyond JEE & NEET",
    summary:
      "India's research-focused science degrees come in two shapes: five-year programmes that end in a master's (IISER BS-MS, NISER/CEBS Integrated M.Sc) and four-year bachelor's degrees (IISc BS Research, IIT Madras BS). Two exams — IAT and NEST — lead to almost all of them.",
    keyTakeaways: [
      "IISER BS-MS: 5 years, dual degree, through IAT; 2,043 seats across seven IISERs in 2026.",
      "IISc BS (Research) and IIT Madras BS: 4-year bachelor's degrees that used IAT in 2026, with separate applications.",
      "NISER and UM-DAE CEBS Integrated M.Sc: 5 years, through NEST, with DISHA scholarship eligibility.",
      "Taking both IAT and NEST is common — the syllabi overlap (Class 11–12 science), but the patterns differ.",
    ],
    contentSections: [
      {
        heading: "Five-year programmes that end in a master's",
        body: [
          "IISER BS-MS (dual degree) is offered at all seven IISERs — Berhampur, Bhopal, Kolkata, Mohali, Pune, Thiruvananthapuram and Tirupati — and admits through IAT. In 2026 there were 2,043 BS-MS seats.",
          "The Integrated M.Sc at NISER Bhubaneswar and UM-DAE CEBS Mumbai admits through NEST. Both were set up by the Department of Atomic Energy, and admitted students are eligible for the DISHA scholarship of ₹60,000 a year.",
        ],
      },
      {
        heading: "Four-year bachelor's degrees",
        body: [
          "IISc Bengaluru's Bachelor of Science (Research) is a four-year programme; IISc was ranked first among universities in NIRF 2025. IIT Madras offers a four-year BS programme; it was first overall in NIRF 2025. Both appeared in the IAT 2026 brochure as institutions using IAT scores, with their own applications.",
          "A four-year degree gets you a bachelor's a year sooner; you'd then choose a master's or PhD route separately.",
        ],
      },
      {
        heading: "How to decide",
        body: ["Ask yourself these questions, in order:"],
        list: [
          "Do I want a master's built in (5 years) or a bachelor's I can build on later (4 years)?",
          "Which subjects did I take in Class 12? BS-MS needs any three of Biology, Chemistry, Mathematics and Physics; specific programmes may need Mathematics.",
          "Am I preparing for one exam or two? IAT and NEST cover Class 11–12 science, so most students prepare for both.",
          "Where would I be happy living for 4–5 years? Campus location and size differ a lot across these institutes.",
        ],
        callout:
          "Read each institute's own admission page before deciding. Programme lists and subject requirements can change from year to year.",
      },
    ],
    faqs: [
      { q: "Is IISc's BS a 5-year BS-MS?", a: "No. IISc's Bachelor of Science (Research) is a four-year programme." },
      { q: "Which exam do I need for NISER?", a: "NEST. It admits to the 5-year Integrated M.Sc at NISER Bhubaneswar and UM-DAE CEBS Mumbai." },
      { q: "Can I apply to both IISER and NISER?", a: "Yes. IAT (for IISERs) and NEST (for NISER and CEBS) are separate exams, and many students take both." },
    ],
    sources: [SRC.iatBulletin, SRC.nestBrochure, SRC.nirf2025],
    relatedExams: ["iiser-iat", "niser-nest"],
  },
  {
    slug: "comedk-2027-speed-hacks-rvce-bmsce-admissions",
    title: "COMEDK UGET 2027: Pattern, Syllabus Split and a No-Negative-Marking Strategy",
    metaTitle: "COMEDK UGET 2027: Pattern, Syllabus & Strategy",
    description:
      "COMEDK UGET 2027: 180 questions in 3 hours, no negative marking, a 33/67 Class 11–12 syllabus split, about 150 colleges and 20,000 seats.",
    subtitle: "180 questions, 180 minutes, no penalty for wrong answers — the strategy is different.",
    examSlug: "comedk",
    publishedDate: "2026-10-14",
    updatedDate: "2026-10-27",
    readTime: "6 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Preparation",
    badge: "COMEDK 2027",
    summary:
      "COMEDK UGET is a 3-hour, English-only test of 180 questions — 60 each in Physics, Chemistry and Mathematics — with one mark per correct answer and no negative marking. It admits to around 150 private engineering colleges in Karnataka offering about 20,000 seats.",
    keyTakeaways: [
      "180 questions in 3 hours: one minute per question on average.",
      "No negative marking — never leave a question blank.",
      "Syllabus is CBSE-based: about 33% Class 11 and 67% Class 12.",
      "Around 150 colleges and 20,000 seats; admission through COMEDK's centralised online counselling.",
    ],
    contentSections: [
      {
        heading: "The official pattern",
        body: [
          "COMEDK UGET 2026 had 180 multiple-choice questions — 60 each in Physics, Chemistry and Mathematics — in English only, with one mark per correct answer and no negative marking, for a maximum of 180.",
          "COMEDK says it serves around 150 engineering colleges, members of the Karnataka Unaided Private Engineering Colleges Association, offering about 20,000 seats.",
        ],
      },
      {
        heading: "What \"no negative marking\" changes",
        body: [
          "In most entrance exams you skip questions you can't solve. In COMEDK, a blank answer and a wrong answer score the same — zero — so every question should be answered before time runs out.",
        ],
        list: [
          "Do a first pass answering everything you can solve quickly.",
          "Make a second pass on the harder ones you marked.",
          "Keep the last five minutes to fill every remaining blank with your best guess.",
        ],
        callout: "Practise this routine in timed mocks; under exam pressure it's easy to forget the final fill-in.",
      },
      {
        heading: "Use the syllabus split",
        body: [
          "COMEDK's syllabus follows CBSE, weighted about one-third Class 11 and two-thirds Class 12. Students who leave Class 11 topics until last can still prioritise Class 12 — but a third of the paper is too much to give away.",
          "If you are also preparing for JEE Main or KCET, the content overlaps heavily. COMEDK's challenge is mostly speed: one minute per question on average.",
        ],
      },
      {
        heading: "After the exam",
        body: [
          "Seats are allotted through COMEDK's centralised online counselling, with its own registration, choice filling, fee payment and reporting deadlines. Rankings such as NIRF help compare colleges: among member colleges, M. S. Ramaiah Institute of Technology was ranked #75 in NIRF 2025 Engineering, with R. V. College of Engineering and Siddaganga Institute of Technology in the 101–150 band and B.M.S. College of Engineering in 151–200.",
        ],
      },
    ],
    faqs: [
      { q: "Is there negative marking in COMEDK?", a: "No. Each correct answer earns 1 mark and wrong answers cost nothing, so answer every question." },
      { q: "Is COMEDK only for Karnataka students?", a: "No, it is open to candidates across India. Karnataka SC/ST/OBC candidates get a lower qualifying aggregate (40% instead of 45%)." },
      { q: "How many colleges accept COMEDK?", a: "About 150 private engineering colleges in Karnataka, with around 20,000 seats, according to COMEDK." },
    ],
    sources: [SRC.comedk2026, SRC.nirf2025],
    relatedExams: ["comedk"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
