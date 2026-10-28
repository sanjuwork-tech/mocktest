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
  pibNirf2025: {
    label: "India Rankings 2025 press release (PIB, Ministry of Education, 4 September 2025)",
    url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2163711",
  },
  nirfOverall2025: { label: "NIRF 2025: Overall", url: "https://www.nirfindia.org/Rankings/2025/OverallRanking.html" },
  nirfUniversity2025: { label: "NIRF 2025: Universities", url: "https://www.nirfindia.org/Rankings/2025/UniversityRanking.html" },
  nirfCollege2025: { label: "NIRF 2025: Colleges", url: "https://www.nirfindia.org/Rankings/2025/CollegeRanking.html" },
  nirfResearch2025: { label: "NIRF 2025: Research Institutions", url: "https://www.nirfindia.org/Rankings/2025/ResearchRanking.html" },
  nirfEngineering2025: { label: "NIRF 2025: Engineering", url: "https://www.nirfindia.org/Rankings/2025/EngineeringRanking.html" },
  nirfStatePublic2025: { label: "NIRF 2025: State Public Universities", url: "https://www.nirfindia.org/Rankings/2025/STATEPUBLICUNIVERSITYRanking.html" },
  clat2027Eligibility: { label: "CLAT 2027 UG eligibility (Consortium of NLUs)", url: "https://consortiumofnlus.ac.in/clat-2027/ug-eligibility.html" },
  clat2027Press: { label: "CLAT 2027 press release (Consortium of NLUs)", url: "https://consortiumofnlus.ac.in/clat-2027/notifications/Press_Release_CLAT_2027.pdf" },
  bitsat2026: { label: "BITSAT-2026 brochure (BITS Pilani)", url: "https://admissions.bits-pilani.ac.in/FD/downloads/BITSAT-2026_brochure.pdf" },
  bitsatEligibility: { label: "BITSAT eligibility criteria (BITS Pilani)", url: "https://admissions.bits-pilani.ac.in/FD/BITSAT_eligibility.html" },
  ndaNotice2026: { label: "UPSC NDA & NA Examination (II) 2026 notice", url: "https://www.upsc.gov.in/sites/default/files/Notif-NDA-II-2026-Engl-200526.pdf" },
  nchm2026: { label: "NCHM JEE 2026 Information Brochure (NCHMCT)", url: "https://nchm.gov.in/sites/default/files/2025-12/NCHM-JEE%202026%20Brochure.pdf" },
  uceed2027: { label: "UCEED 2027 announcements (IIT Bombay)", url: "https://www.uceed.iitb.ac.in/2027/announcements.html" },
  uceed2027Dates: { label: "UCEED 2027 important dates (IIT Bombay)", url: "https://www.uceed.iitb.ac.in/2027/important-dates.html" },
  nata2026: { label: "NATA 2026 brochure (Council of Architecture)", url: "https://www.nata.in/assets/pdf/Final-NATA-BROCHURE-2026.pdf" },
  nift2027: {
    label: "NIFT Entrance Exam 2027 Information Bulletin",
    url: "https://www.nift.ac.in/sites/default/files/2026-10/Information%20Bulletin%20-NIFTEE%202027%20-16.10.2026.pdf",
  },
  nidBdes2027: { label: "NID B.Des Admissions Handbook 2027–28", url: "https://admissions.nid.edu/NIDA2027/download/BDES_IntegratedPathway_AdmissionsHandbook2027_28.pdf" },
  ipm2026: {
    label: "IIM Indore IPM 2026–31 admission procedure",
    url: "https://iimidr.ac.in/wp-content/uploads/2026/01/AdmissionProcedure_IPM-2026-31_-Domestic-Applicants.pdf",
  },
  isiAdmission: { label: "ISI admissions (Indian Statistical Institute)", url: "https://admission.isical.ac.in/" },
  isiUndergraduate: { label: "ISI undergraduate programmes", url: "https://isru.isical.ac.in/static/academics/academic_programmes/undergraduate" },
  icaiFaq: { label: "ICAI FAQs on the CA course (New Scheme)", url: "https://icai-call-sahayata.icai.org/assets/pdf/FAQs_on_CA_Course.pdf" },
  icarCuet2026: { label: "CUET (ICAR-UG) 2026 Information Bulletin (ICAR/NTA)", url: "https://icar.org.in/sites/default/files/Circulars/CUET%20(ICAR-UG)%202026_IB_20260114.pdf" },
  inspireSheFaq: { label: "INSPIRE Scholarship for Higher Education (SHE) FAQs (DST)", url: "https://www.online-inspire.gov.in/Content/SHEFAQs.pdf" },
  inspireSheGuidelines: { label: "INSPIRE-SHE post-offer guidelines (DST)", url: "https://www.online-inspire.gov.in/Content/SHEPostofferImplementationGuidelines.pdf" },
  pmUsp: {
    label: "PM-USP Central Sector Scheme of Scholarship guidelines (Ministry of Education)",
    url: "https://scholarships.gov.in/public/schemeGuidelines/CSSS_GUIDLINES_07022024_updated.pdf",
  },
  nsp: { label: "National Scholarship Portal", url: "https://scholarships.gov.in/" },
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
  {
    slug: "entrance-exams-after-12th-other-than-jee-neet",
    title: "Entrance Exams After 12th Other Than JEE and NEET: A Stream-by-Stream Guide",
    metaTitle: "Entrance Exams After 12th Other Than JEE and NEET",
    description:
      "Entrance exams after 12th other than JEE and NEET, by stream: CUET UG, IAT, NEST, BITSAT, COMEDK, CLAT, UCEED, NIFT, NATA, IPMAT and NDA, with official links.",
    subtitle: "JEE and NEET are two doors. Here are the others, grouped by what you studied in Class 12.",
    examSlug: "cuet-ug",
    publishedDate: "2026-10-28",
    updatedDate: "2026-10-28",
    readTime: "9 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Opportunities",
    badge: "Beyond JEE & NEET",
    summary:
      "Most Class 12 students hear about only JEE and NEET, but central universities, research institutes, private engineering colleges, law schools, design schools, hotel management institutes and the defence services all run or use their own entrance tests. This guide lists the main ones by stream, with what each leads to and where to check the official rules.",
    keyTakeaways: [
      "CUET UG is open to every stream and is the entry route to all 48 Central Universities, plus many state, deemed and private universities.",
      "Science students can add IAT (IISERs, IISc BS, IIT Madras BS), NEST (NISER, CEBS), BITSAT and COMEDK UGET to their list.",
      "Any-stream exams include CLAT (law), UCEED and NIFT (design), NCHM JEE (hotel management), IPMAT (management) and the NDA Army wing.",
      "Dates and eligibility change every cycle: treat 2026 details as a guide and confirm 2027 rules in each official bulletin.",
    ],
    contentSections: [
      {
        heading: "Start with the degree, then find the exam",
        body: [
          "An entrance exam is only useful if it leads to a course you would actually join. So before you compare exams, write down two or three kinds of degree you are curious about: a B.Sc or BS in science, B.Com or BBA, a B.A. in a subject you enjoy, law, design, architecture, hotel management, or a defence career. Then work backwards to the exams that lead there.",
          "Most students end up preparing for two to four exams whose syllabi overlap. That spreads your risk without doubling your workload. The OurMocks Compare page puts CUET UG, IAT, NEST and COMEDK side by side if you want to see the patterns together.",
        ],
      },
      {
        heading: "Open to every stream",
        body: [
          "These exams accept students from Science, Commerce and Humanities, although individual courses may still ask for particular subjects.",
        ],
        list: [
          "CUET UG (National Testing Agency): undergraduate admission to all 48 Central Universities, including the University of Delhi, BHU, JNU, Jamia Millia Islamia and the University of Hyderabad, and to many state, deemed and private universities. In 2026 you could take up to five of 37 papers, each with 50 questions in 60 minutes, marked +5/−1.",
          "CLAT (Consortium of National Law Universities): five-year integrated law degrees at the National Law Universities. CLAT 2027 is scheduled for Sunday, 6 December 2026, and the application deadline is 31 October 2026 (11:59 pm). UG candidates need 45% in Class 12 (40% for SC/ST/PwD), there is no upper age limit, and students appearing in March/April 2027 may apply.",
          "UCEED (IIT Bombay): Bachelor of Design at IIT Bombay, IIT Delhi, IIT Guwahati, IIT Hyderabad, IIT Indore, IIT Roorkee and IIITDM Jabalpur. UCEED 2027 is on 17 January 2027; registration runs 1–31 October 2026, with a late-fee window to 6 November 2026. Students who passed Class 12 in 2026 or are appearing in 2027, from any stream, can apply.",
          "NIFT Entrance Exam: B.Des and other programmes at the National Institute of Fashion Technology campuses. The 2027 bulletin sets an upper age limit of under 24 on 1 August of the admission year, with relaxation for SC/ST/PwD.",
          "NID DAT: B.Des at the National Institutes of Design. A common DAT Prelims shortlists candidates for DAT Mains; each NID admits using the Mains score.",
          "NCHM JEE (conducted by NTA): B.Sc in Hospitality and Hotel Administration at institutes under the National Council for Hotel Management. The 2026 brochure required a Class 12 pass with English as a subject and set no age bar.",
          "IPMAT (IIM Indore): a five-year Integrated Programme in Management, selected through an aptitude test and personal interview. For the 2026–31 batch, Class 12 passouts of 2024 and 2025 and students appearing in 2026 were eligible, with an age limit set by date of birth.",
          "NDA & NA Examination (UPSC): the Army wing of the National Defence Academy needs a Class 12 pass in any stream; the Air Force and Naval wings need Physics, Chemistry and Mathematics. Students appearing in Class 12 can apply.",
        ],
      },
      {
        heading: "For Science students (PCM, PCB or PCMB)",
        body: [
          "If you enjoy science but don't want to pin everything on JEE or NEET, these exams are worth a close look. Their syllabi are built on Class 11–12 science, so your board preparation does most of the work.",
        ],
        list: [
          "IISER Aptitude Test (IAT): five-year BS-MS at the seven IISERs, plus the 2026 brochure lists IISc Bengaluru's BS (Research), IIT Madras's BS, IIT Guwahati, IACS Kolkata and IIEST Shibpur. One 3-hour paper of 60 questions across Biology, Chemistry, Mathematics and Physics, marked +4/−1.",
          "NEST: five-year Integrated M.Sc at NISER Bhubaneswar and UM-DAE CEBS Mumbai. Four 20-question sections, +3/−1, best three sections counted. Admitted students are eligible for the DISHA scholarship.",
          "BITSAT (BITS Pilani): integrated first degrees at BITS campuses. BITSAT-2026 needed 75% aggregate in Physics, Chemistry and Mathematics with at least 60% in each; B.Pharm and a few other programmes accept Biology in place of Mathematics.",
          "COMEDK UGET: B.E./B.Tech at around 150 private engineering colleges in Karnataka with about 20,000 seats. 180 questions in 3 hours, no negative marking.",
          "CUET (ICAR-UG): agriculture and allied degrees (excluding veterinary) on 20% of seats at agricultural universities, allotted through ICAR's online counselling.",
          "ISI Admission Test: B.Stat (Hons) and B.Math (Hons) at the Indian Statistical Institute, for students with Mathematics and English in Class 12.",
          "NATA (Council of Architecture): the aptitude test for B.Arch. The 2026 brochure required Physics and Mathematics in Class 12 with 45% aggregate (or a 10+3 diploma with Mathematics).",
          "Your state's engineering, pharmacy or agriculture CET: most states run one for their government and private colleges. Check your state's CET cell for the official rules.",
        ],
        callout:
          "Science students can also take CUET UG with Physics, Chemistry, Mathematics or Biology papers for B.Sc courses at central universities. It is one of the simplest ways to keep a strong backup in place.",
      },
      {
        heading: "For Commerce and Humanities students",
        body: [
          "For Commerce and Humanities students, CUET UG is usually the main exam. Its domain papers include Accountancy/Book-Keeping, Business Studies, Economics/Business Economics, History, Political Science, Geography/Geology, Sociology, Psychology, Mass Media/Mass Communication and more, so you can test in the subjects you studied.",
          "Alongside CUET, many students add CLAT for law, IPMAT for management, NIFT, NID DAT or UCEED for design, and NCHM JEE for hospitality. Commerce students thinking about chartered accountancy can register for the ICAI Foundation course; ICAI allows the first Foundation attempt after you have appeared in Class 12.",
        ],
      },
      {
        heading: "How to build a sensible exam list",
        body: ["A short, overlapping list is easier to prepare for than a long, scattered one."],
        list: [
          "Pick one main exam that leads to the courses you want most.",
          "Add one or two exams with overlapping syllabi: IAT and NEST with CUET science papers; COMEDK with BITSAT or your state CET; CLAT with CUET Humanities papers.",
          "Keep CUET UG as a backup almost regardless of stream; it opens a large number of public universities.",
          "Put every registration deadline in one calendar. Several 2027 deadlines fall between October 2026 and March 2027.",
          "Use the OurMocks Eligibility checker and each exam's official bulletin to confirm you qualify before paying any fee.",
        ],
        callout:
          "2027 dates are official only when the conducting body publishes them. CLAT 2027 and UCEED 2027 dates above are official; for CUET UG, IAT, NEST and COMEDK, the 2027 bulletins are still awaited, so OurMocks shows the 2026 pattern on each exam page.",
      },
    ],
    faqs: [
      { q: "Which entrance exam after 12th is open to all streams?", a: "CUET UG is open to Science, Commerce and Humanities students and leads to all 48 Central Universities and many other universities. CLAT, UCEED, NIFT, NCHM JEE and the NDA Army wing are also open to all streams." },
      { q: "What can I do after 12th science if I don't want to take JEE?", a: "You can take IAT and NEST for research-focused science degrees, BITSAT or COMEDK UGET for engineering, CUET UG for B.Sc at central universities, the ISI test for statistics and mathematics, or NATA for architecture." },
      { q: "Is CLAT 2027 registration still open?", a: "The Consortium of NLUs set 31 October 2026 (11:59 pm) as the CLAT 2027 application deadline, with the exam on 6 December 2026. Check consortiumofnlus.ac.in for any change." },
      { q: "Do I need to prepare separately for each exam?", a: "Not entirely. IAT, NEST, COMEDK and CUET science papers all build on Class 11–12 science, so one strong base covers most of them. What changes is the pattern, timing and marking." },
    ],
    sources: [
      SRC.cuetBulletin,
      SRC.iatBulletin,
      SRC.nestBrochure,
      SRC.comedk2026,
      SRC.bitsatEligibility,
      SRC.clat2027Press,
      SRC.clat2027Eligibility,
      SRC.uceed2027,
      SRC.uceed2027Dates,
      SRC.nift2027,
      SRC.nidBdes2027,
      SRC.nchm2026,
      SRC.ipm2026,
      SRC.ndaNotice2026,
      SRC.icarCuet2026,
      SRC.isiUndergraduate,
      SRC.nata2026,
      SRC.icaiFaq,
    ],
    relatedExams: ["cuet-ug", "iiser-iat", "niser-nest", "comedk"],
  },
  {
    slug: "best-colleges-other-than-iit-nit-nirf-2025",
    title: "Top Colleges and Universities Other Than IITs and NITs: What NIRF 2025 Shows",
    metaTitle: "Best Colleges Other Than IITs and NITs (NIRF 2025)",
    description:
      "Best colleges other than IITs and NITs, using official NIRF 2025 ranks: top universities, colleges, research institutes, state universities and how to get in.",
    subtitle: "India's official rankings are full of institutions that admit without JEE Advanced. Here is how to read them.",
    examSlug: "cuet-ug",
    publishedDate: "2026-10-28",
    updatedDate: "2026-10-28",
    readTime: "9 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Colleges",
    badge: "NIRF 2025",
    summary:
      "The National Institutional Ranking Framework (NIRF), run by the Ministry of Education, publishes rankings in 17 categories. Its 2025 edition, released on 4 September 2025, is the latest. Many of the institutions near the top of the University, College, Research and subject lists are not IITs or NITs, and most admit through CUET UG, IAT, NEST or their own tests.",
    keyTakeaways: [
      "NIRF 2025 University ranks: IISc Bengaluru 1, JNU 2, Manipal Academy of Higher Education 3, Jamia Millia Islamia 4, University of Delhi 5, BHU 6.",
      "NIRF 2025 College ranks: Hindu College 1, Miranda House 2, Hans Raj College 3, Kirori Mal College 4, St. Stephen's College 5 — all in Delhi.",
      "IISc Bengaluru is first in the NIRF 2025 Research Institutions category and second Overall.",
      "Rankings compare institutions, not courses: always check the specific programme, its entrance route and its fees on the official site.",
    ],
    contentSections: [
      {
        heading: "First, what NIRF is and how to read it",
        body: [
          "NIRF is the Ministry of Education's official ranking framework. The 2025 edition, released on 4 September 2025, ranks institutions in 17 categories, including Overall, Universities, Colleges, Research Institutions, State Public Universities, Engineering, Management, Pharmacy, Medical, Law, Architecture and Planning, and Agriculture. A new Sustainable Development Goals category was added in 2025.",
          "Each category ranks a different kind of institution. A university and a college are measured separately, so \"#5 University\" and \"#5 College\" are not the same thing. Below we quote ranks exactly as NIRF 2025 lists them, labelled by category.",
        ],
        callout: "NIRF ranks institutions, not individual courses. A highly ranked university can still be the wrong fit if the course you want is not offered there, or is offered only through a different exam.",
      },
      {
        heading: "Universities (NIRF 2025)",
        body: [
          "The NIRF 2025 University top ten contains no IIT or NIT, because those are ranked under Engineering and Overall. Six of the ten are public universities that admit undergraduates mainly through CUET UG or their own tests.",
        ],
        list: [
          "1 — Indian Institute of Science, Bengaluru (BS Research; IAT was one of the routes in 2026).",
          "2 — Jawaharlal Nehru University, New Delhi (CUET UG for its undergraduate programmes).",
          "3 — Manipal Academy of Higher Education, Manipal (check its admission page).",
          "4 — Jamia Millia Islamia, New Delhi (CUET UG for mapped programmes; its own test for some).",
          "5 — University of Delhi (CUET UG, then DU's CSAS portal).",
          "6 — Banaras Hindu University, Varanasi (CUET UG).",
          "7 — BITS Pilani (BITSAT).",
          "8 — Amrita Vishwa Vidyapeetham (check its admission page).",
          "9 — Jadavpur University, Kolkata (check its admission page).",
          "10 — Aligarh Muslim University (check AMU's admission notice for each course).",
        ],
      },
      {
        heading: "Colleges (NIRF 2025)",
        body: [
          "The College category ranks colleges affiliated to universities. In NIRF 2025, Hindu College was first for the second year running, ahead of Miranda House, which had been first from 2017 to 2023. The top five are all University of Delhi colleges, which admit undergraduates through CUET UG and DU's CSAS portal.",
        ],
        list: [
          "1 — Hindu College, Delhi.",
          "2 — Miranda House, Delhi.",
          "3 — Hans Raj College, Delhi.",
          "4 — Kirori Mal College, Delhi.",
          "5 — St. Stephen's College, Delhi.",
        ],
      },
      {
        heading: "Research institutions and Overall (NIRF 2025)",
        body: [
          "IISc Bengaluru is first in the NIRF 2025 Research Institutions category (its fifth year) and second Overall. In the Overall list, which includes IITs, AIIMS New Delhi is 8, JNU is 9 and BHU is 10. The University of Delhi is 15 Overall, HBNI (the university under which NISER awards degrees) is 20, and the University of Hyderabad is 26.",
          "For a science student, this is a useful reminder: IISc, the IISERs and NISER do research at the highest level and admit through IAT or NEST, not JEE Advanced. IISER Pune (55), IISER Kolkata (67), IISER Mohali (70) and IISER Bhopal (75) also appear in the NIRF 2025 Overall list.",
        ],
      },
      {
        heading: "State public universities and subject categories (NIRF 2025)",
        body: [
          "NIRF also ranks State Public Universities separately. Jadavpur University, Kolkata is first and Anna University, Chennai is second in NIRF 2025. State universities usually admit through state-level exams or their own processes, so check the university's admission page.",
          "Subject categories show non-IIT leaders too:",
        ],
        list: [
          "Law: National Law School of India University, Bengaluru — 1 (eighth year running). Admission is through CLAT.",
          "Pharmacy: Jamia Hamdard, New Delhi — 1 (second year running).",
          "Agriculture and Allied Sectors: ICAR–Indian Agricultural Research Institute, New Delhi — 1 (third year running).",
          "Management: IIM Ahmedabad — 1. Straight after Class 12, IIM Indore's five-year Integrated Programme in Management admits through IPMAT.",
          "Medical: AIIMS New Delhi — 1. Medical admission is through NEET.",
          "Engineering: NIT Tiruchirappalli at 9 is the only non-IIT in the top ten. Beyond the IITs and NITs, M. S. Ramaiah Institute of Technology, a COMEDK college, is 75 in Engineering.",
        ],
      },
      {
        heading: "Turning a ranking into a shortlist",
        body: ["A rank tells you where to look, not where to apply. Use it like this:"],
        list: [
          "Start with the course. List the institutions in the relevant NIRF category that offer it.",
          "Note each one's entrance route: CUET UG, IAT, NEST, COMEDK, CLAT or its own test. This decides which exams you prepare for.",
          "Read the eligibility and fees on the institution's official site; they vary widely.",
          "Think about city, campus type (residential or not) and course length.",
          "Use the OurMocks Colleges page, which shows each college's NIRF 2025 positions and admission route, and the Compare page to see the exams side by side.",
        ],
        callout: "NIRF 2026 had not been published when this was checked on 28 October 2026. When it is, ranks may move; recheck before you finalise your list.",
      },
      {
        heading: "A quick map: ranked institutions and the exams that lead to them",
        body: [
          "The most useful way to read the lists above is to group them by entrance route, because that tells you what to prepare for. Every institution below appears in an NIRF 2025 category quoted in this article.",
        ],
        list: [
          "CUET UG: JNU, Jamia Millia Islamia, the University of Delhi and its colleges (including Hindu College, Miranda House, Hans Raj College, Kirori Mal College and St. Stephen's College), BHU and the University of Hyderabad.",
          "IAT: the IISERs, and in 2026 IISc Bengaluru's BS (Research) with a separate application.",
          "NEST: NISER Bhubaneswar (degrees through HBNI) and UM-DAE CEBS Mumbai.",
          "BITSAT: BITS Pilani.",
          "COMEDK UGET: Karnataka private engineering colleges, including M. S. Ramaiah Institute of Technology.",
          "CLAT: National Law School of India University, Bengaluru and the other National Law Universities.",
          "CUET (ICAR-UG): seats at agricultural universities on ICAR's all-India quota.",
        ],
        callout: "If two institutions on your list use the same exam, one round of preparation serves both. That is often the simplest way to aim high and stay safe at the same time.",
      },
    ],
    faqs: [
      { q: "Which is the top university in India other than the IITs?", a: "In NIRF 2025 the University category is led by IISc Bengaluru, followed by JNU, Manipal Academy of Higher Education, Jamia Millia Islamia and the University of Delhi. IITs are ranked in the Overall and Engineering categories, not in the University list." },
      { q: "Which colleges top NIRF 2025?", a: "Hindu College, Miranda House, Hans Raj College, Kirori Mal College and St. Stephen's College, all in Delhi, are ranked 1 to 5 in the NIRF 2025 College category." },
      { q: "Can I get into a top-ranked university without JEE?", a: "Yes. JNU, Jamia, the University of Delhi and BHU admit undergraduates mainly through CUET UG; IISc's BS and the IISERs used IAT in 2026; NISER uses NEST." },
      { q: "Is NIRF 2026 out?", a: "Not as of 28 October 2026. NIRF 2025, released on 4 September 2025, is the latest official edition." },
    ],
    sources: [
      SRC.nirf2025,
      SRC.pibNirf2025,
      SRC.nirfUniversity2025,
      SRC.nirfCollege2025,
      SRC.nirfResearch2025,
      SRC.nirfOverall2025,
      SRC.nirfEngineering2025,
      SRC.nirfStatePublic2025,
      SRC.cuetBulletin,
      SRC.iatBulletin,
    ],
    relatedExams: ["cuet-ug", "iiser-iat", "niser-nest", "comedk"],
  },
  {
    slug: "time-per-question-analysis-mock-tests",
    title: "Time-Per-Question Analysis: How to Read Your Mock Test Timing and Improve",
    metaTitle: "Time-Per-Question Analysis: Use Your Mock Test Timing",
    description:
      "Time-per-question analysis of mock tests explained: fast vs slow answers, time-sink questions, pacing vs the ideal time, answer changes and what to do next.",
    subtitle: "Your score tells you what happened. Your timing tells you why.",
    examSlug: "cuet-ug",
    publishedDate: "2026-10-28",
    updatedDate: "2026-10-28",
    readTime: "8 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Preparation",
    badge: "Mock test analysis",
    summary:
      "Two students can score the same marks for very different reasons: one ran out of time, the other rushed and made careless mistakes. Time-per-question analysis records how long you spent on each question and combines it with whether you got it right, so you can see which problem you actually have. OurMocks is adding this to its results dashboard; here is what each view shows and how to act on it.",
    keyTakeaways: [
      "Ideal time per question comes from the official pattern: about 72 seconds in CUET UG, 3 minutes in IAT, 1 minute in COMEDK UGET.",
      "Sort answers into four groups: fast-correct, slow-correct, fast-wrong and slow-wrong. Each group needs a different fix.",
      "Time-sink questions — the few that eat far more than the ideal time — usually cost more marks than any weak chapter.",
      "Track answer changes: they show whether your second thoughts help or hurt you.",
    ],
    contentSections: [
      {
        heading: "Why marks alone don't tell the full story",
        body: [
          "After a mock, most students look at the score and the list of wrong answers. That's useful, but it hides an important question: where did the time go? A paper you couldn't finish and a paper you finished with mistakes need very different fixes.",
          "Time-per-question analysis records the time you spend on each question, including when you return to it later, and places it next to the result. Once you see it, patterns jump out: a chapter where you are accurate but slow, a type of question you always rush, or two questions that ate ten minutes between them.",
        ],
      },
      {
        heading: "Your ideal time per question",
        body: [
          "The starting point is the average time the official pattern allows. These figures come from the 2026 bulletins, the latest official ones:",
        ],
        list: [
          "CUET UG: 50 questions in 60 minutes — about 72 seconds per question, review included.",
          "IISER IAT: 60 questions in 3 hours — 3 minutes per question.",
          "NISER NEST: 3 hours for four 20-question sections, of which your best three count. If you attempt all 80, that is 2 minutes 15 seconds per question; if you focus on three sections, 3 minutes.",
          "COMEDK UGET: 180 questions in 3 hours — 1 minute per question.",
        ],
        callout:
          "The ideal time is an average, not a rule for each question. Easy questions should take less, so that hard ones can take more. What matters is the pattern across the whole paper.",
      },
      {
        heading: "The four groups: fast or slow, right or wrong",
        body: [
          "Compare each question's time with the ideal time and its result, and every answer falls into one of four groups:",
        ],
        list: [
          "Fast and correct: your strengths. Keep these warm with light revision; don't spend extra study time here.",
          "Slow and correct: you know the concept but it costs too much time. Practise more questions of this type under a timer until the method becomes automatic.",
          "Fast and wrong: usually careless errors or misreading — the most fixable group. Slow down slightly on these question types and underline what is being asked.",
          "Slow and wrong: a real gap in understanding. Go back to the concept (NCERT for most of these exams) before doing more questions.",
        ],
      },
      {
        heading: "Time-sink questions",
        body: [
          "A time-sink is a question on which you spent far more than the ideal time — often two or three times as much — whether or not you got it right. In a 60-minute CUET paper, a single question that takes four minutes uses the time of three others.",
          "Look at your time-sinks after every mock and ask two things. Was it hard, or did I get stuck on one step? And should I have skipped it on the first pass? Most students find their time-sinks cluster in one or two topics, which tells you exactly what to practise next.",
        ],
        callout:
          "A simple rule for your next mock: if a question has taken twice the ideal time and you can't see the last step, mark it and move on. Come back only after your first pass is complete.",
      },
      {
        heading: "Pacing across the paper",
        body: [
          "Pacing compares how far you had got with how far you should have got at each point in the paper. If you are well behind the ideal pace by the halfway mark, you will either rush the end or leave questions unanswered.",
          "Common patterns are a slow start (spending too long on the first few questions while settling in), a mid-paper slump on a hard section, and a rushed last ten minutes with several fast-wrong answers. Each one shows up clearly on a pacing view, and each has a different fix: a warm-up routine, a skip rule, or a reserved review window.",
        ],
      },
      {
        heading: "Answer changes",
        body: [
          "Answer-change tracking shows which questions you changed and whether the change went from wrong to right, right to wrong, or wrong to wrong. Over several mocks this answers a question every student wonders about: should I trust my first answer?",
          "There is no single correct answer to that; it depends on you. If most of your changes go from right to wrong, change an answer only when you find a definite error in your working. If most go from wrong to right, your review time is valuable — protect it.",
        ],
      },
      {
        heading: "A weekly routine using your timing data",
        body: ["Use the analysis to choose what to do next, not just to look back."],
        list: [
          "After each full mock, list your five slowest questions and your fast-wrong answers.",
          "Fix fast-wrong errors first; they are the quickest marks to recover.",
          "Pick one slow-correct topic per week and drill it under a timer at the ideal time.",
          "Set a personal skip rule based on your time-sinks and try it in the next mock.",
          "Compare pacing across three mocks, not one; a single paper can be unusually hard.",
        ],
        callout:
          "Start with a timed paper: the OurMocks free diagnostic gives you a full-length timed test and a results dashboard. Pair it with the score calculator to see how your attempts translate into marks under each exam's marking scheme.",
      },
      {
        heading: "A worked example (illustrative)",
        body: [
          "Imagine a student who scores 31 correct, 9 wrong and 10 unanswered in a CUET-style paper of 50 questions. Under +5/−1 marking that is 155 − 9 = 146 marks. The score alone suggests \"work on accuracy\". The timing view tells a more specific story.",
          "Suppose the analysis shows six of the nine wrong answers were fast-wrong (under 40 seconds), two questions took over four minutes each, and the student was about eight questions behind the ideal pace at the 30-minute mark. The unanswered questions are mostly at the end of the paper.",
          "Now the plan is clear. The six fast-wrong answers are probably careless — reading the question more carefully could recover up to 36 marks (each one changes from −1 to +5). The two time-sinks used the time of roughly six or seven other questions. A skip rule would likely have let the student reach most of the ten unanswered questions. None of this needs new chapters to be studied; it needs a different way of sitting the paper.",
        ],
        callout: "These numbers are an example to show the method, not a typical or expected result.",
      },
    ],
    faqs: [
      { q: "What is time-per-question analysis in a mock test?", a: "It records how long you spent on each question and combines that with whether you answered correctly, so you can see where time was lost and why." },
      { q: "How much time should I spend per question in CUET UG?", a: "On average about 72 seconds, since each paper has 50 questions in 60 minutes. Easy questions should take less so harder ones can take more." },
      { q: "What is a time-sink question?", a: "A question that takes far more than the ideal time — often two or three times as long. A few time-sinks can cost more marks than a weak chapter." },
      { q: "Should I change my answers during review?", a: "Check your answer-change history across several mocks. If changes usually go from right to wrong, change only when you find a definite error." },
    ],
    sources: [SRC.cuetBulletin, SRC.iatBulletin, SRC.nestBrochure, SRC.comedk2026],
    relatedExams: ["cuet-ug", "iiser-iat", "niser-nest", "comedk"],
  },
  {
    slug: "courses-after-12th-science-pcm-without-jee",
    title: "Courses After 12th Science (PCM) Without JEE: Engineering, Research and More",
    metaTitle: "Courses After 12th Science (PCM) Without JEE",
    description:
      "Courses after 12th science (PCM) without JEE: research BS-MS via IAT and NEST, engineering via BITSAT and COMEDK, B.Sc via CUET, statistics, architecture, NDA.",
    subtitle: "Physics, Chemistry and Mathematics open far more doors than one exam.",
    examSlug: "iiser-iat",
    publishedDate: "2026-10-28",
    updatedDate: "2026-10-28",
    readTime: "8 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Opportunities",
    badge: "Science (PCM)",
    summary:
      "If you studied Physics, Chemistry and Mathematics, JEE is only one of several routes. Research degrees through IAT and NEST, engineering through BITSAT, COMEDK UGET and state CETs, B.Sc courses through CUET UG, statistics and mathematics at ISI, architecture through NATA, design through UCEED, and the NDA are all open to PCM students. Here is what each leads to and how to combine them.",
    keyTakeaways: [
      "Research science: IAT (IISERs, IISc BS, IIT Madras BS) and NEST (NISER, CEBS) need no JEE score.",
      "Engineering without JEE: BITSAT for BITS campuses, COMEDK UGET for about 150 Karnataka private colleges, and your state CET.",
      "CUET UG with Physics, Chemistry and Mathematics papers opens B.Sc courses at central universities.",
      "Other PCM routes: ISI (B.Stat, B.Math), NATA (B.Arch), UCEED (B.Des) and the NDA Air Force and Naval wings.",
    ],
    contentSections: [
      {
        heading: "First, decide what kind of PCM student you are",
        body: [
          "PCM students tend to fall into three groups: those who want to build things (engineering), those who want to understand things (pure science and mathematics), and those who are still deciding. Each group has good options outside JEE, and many of the exams overlap in syllabus, so you can keep two directions open at once.",
          "Being honest about this early saves effort. A student who loves proofs and puzzles may find ISI or an IISER more satisfying than a branch of engineering they chose by rank.",
        ],
      },
      {
        heading: "Research science: IAT and NEST",
        body: [
          "The IISER Aptitude Test (IAT) admits to the five-year BS-MS at all seven IISERs — Berhampur, Bhopal, Kolkata, Mohali, Pune, Thiruvananthapuram and Tirupati. The 2026 brochure listed 2,043 BS-MS seats, plus BS and B.Tech seats at IISER Bhopal and IISER Tirupati. It also listed IISc Bengaluru's BS (Research), IIT Madras's four-year BS, IIT Guwahati, IACS Kolkata and IIEST Shibpur among the programmes using IAT.",
          "NEST admits to the five-year Integrated M.Sc at NISER Bhubaneswar and UM-DAE CEBS Mumbai. Students admitted there are eligible for the Department of Atomic Energy's DISHA scholarship of ₹60,000 a year plus ₹20,000 a year for summer internships.",
          "Both exams test Biology too. IAT has 15 questions in each of Biology, Chemistry, Mathematics and Physics, so PCM students should prepare basic NCERT Biology. In NEST only your best three of four sections count, so a PCM student can focus on Physics, Chemistry and Mathematics.",
        ],
        callout: "See the OurMocks IAT and NEST syllabus and previous-year paper pages to compare what each exam expects.",
      },
      {
        heading: "Engineering without JEE",
        body: ["Several respected engineering routes use their own tests:"],
        list: [
          "BITSAT: integrated first degrees at BITS Pilani's campuses. BITSAT-2026 required 75% aggregate in Physics, Chemistry and Mathematics in Class 12, with at least 60% in each; BITS states that 74.9% does not round up.",
          "COMEDK UGET: B.E./B.Tech at around 150 private engineering colleges in Karnataka with about 20,000 seats, including M. S. Ramaiah Institute of Technology, R. V. College of Engineering and B.M.S. College of Engineering. 180 questions in 3 hours with no negative marking.",
          "State CETs: most states run their own engineering entrance test for government and private colleges in the state. Check your state's CET cell for the official notice.",
          "Private universities: many run their own entrance tests; read their admission pages carefully and compare them using NIRF where they are ranked.",
        ],
      },
      {
        heading: "B.Sc and BS through CUET UG",
        body: [
          "CUET UG is not only for Commerce and Humanities. Its domain papers include Physics, Chemistry, Mathematics/Applied Mathematics and Computer Science/Information Practices. Central universities such as the University of Delhi, BHU and the University of Hyderabad use CUET for B.Sc and integrated science programmes.",
          "Each CUET paper had 50 questions in 60 minutes in 2026, marked +5/−1. That is a very different rhythm from IAT's 3 minutes per question, so practise both formats if you take both. The University of Hyderabad, for example, admits to five-year integrated M.Sc programmes through CUET.",
        ],
      },
      {
        heading: "Mathematics, statistics, architecture, design and defence",
        list: [
          "ISI Admission Test: B.Stat (Hons) and B.Math (Hons) at the Indian Statistical Institute, for students with Mathematics and English in Class 12. B.Stat and B.Math have no interview stage under ISI's selection policy.",
          "NATA: the Council of Architecture's aptitude test for B.Arch. The 2026 brochure required Physics and Mathematics in Class 12 and 45% aggregate; it combines a drawing test with an online MCQ section.",
          "UCEED: B.Des at IIT Bombay, IIT Delhi, IIT Guwahati, IIT Hyderabad, IIT Indore, IIT Roorkee and IIITDM Jabalpur. UCEED 2027 is on 17 January 2027.",
          "NDA & NA Examination (UPSC): the Air Force and Naval wings, and the 10+2 Cadet Entry Scheme at the Indian Naval Academy, need Physics, Chemistry and Mathematics in Class 12.",
        ],
        body: ["PCM also keeps these doors open:"],
      },
      {
        heading: "Putting together a realistic plan",
        body: [
          "A common, workable combination for a PCM student is one engineering exam (COMEDK or BITSAT or your state CET), one research exam (IAT or NEST) and CUET UG as a broad backup. The syllabus overlap is large: all of them build on Class 11–12 NCERT science and mathematics.",
          "What differs is speed and marking. COMEDK gives one minute per question with no negative marking; IAT gives three minutes with +4/−1; CUET gives about 72 seconds with +5/−1. Full-length timed mocks are the only way to get used to each one.",
        ],
        list: [
          "Use the OurMocks Eligibility checker to confirm which exams you qualify for.",
          "Use the Compare page to see the four exam patterns together.",
          "Take the free diagnostic to see where you stand before choosing.",
        ],
        callout:
          "For 2027, only exams whose bulletins are out (such as UCEED 2027) have confirmed dates. For IAT, NEST, COMEDK, BITSAT and CUET, use 2026 patterns as a guide and watch the official websites.",
      },
      {
        heading: "Common worries, answered calmly",
        body: [
          "\"If I don't take JEE, am I giving up on good institutions?\" No. The NIRF 2025 University list is led by IISc Bengaluru, which admitted to its BS (Research) through IAT in 2026, and BITS Pilani is 7 in the same list. NIT Tiruchirappalli is the only non-IIT in the NIRF 2025 Engineering top ten, but many other ranked engineering colleges admit through BITSAT, COMEDK UGET or state CETs.",
          "\"Can I take JEE and these exams together?\" Yes, and many students do. The syllabi overlap heavily; what you need to add is practice in each exam's timing and marking.",
          "\"Is a research degree only for toppers?\" Research programmes look for curiosity and steady work as much as raw speed. IAT gives 3 minutes per question, which rewards careful thinking. Try a full IAT-style paper before deciding it isn't for you.",
        ],
      },
    ],
    faqs: [
      { q: "Can I do engineering without JEE?", a: "Yes. BITSAT, COMEDK UGET and state CETs admit to engineering without a JEE score. Each has its own eligibility and pattern, so check the official notice." },
      { q: "Which research institutes can a PCM student join without JEE?", a: "The IISERs through IAT, NISER and CEBS through NEST, and, in 2026, IISc's BS (Research) and IIT Madras's BS through IAT with separate applications." },
      { q: "Do I need Biology for IAT?", a: "IAT has 15 Biology questions out of 60, so prepare basic NCERT Biology. BS-MS eligibility needs any three of Biology, Chemistry, Mathematics and Physics in Class 12." },
    ],
    sources: [
      SRC.iatBulletin,
      SRC.nestBrochure,
      SRC.bitsat2026,
      SRC.bitsatEligibility,
      SRC.comedk2026,
      SRC.cuetBulletin,
      SRC.cuetSyllabus,
      SRC.isiUndergraduate,
      SRC.isiAdmission,
      SRC.nata2026,
      SRC.uceed2027,
      SRC.ndaNotice2026,
    ],
    relatedExams: ["iiser-iat", "niser-nest", "comedk", "cuet-ug"],
  },
  {
    slug: "options-after-12th-pcb-without-neet",
    title: "Options After 12th PCB Without NEET: Science, Research, Agriculture and More",
    metaTitle: "Options After 12th PCB Without NEET: Courses & Exams",
    description:
      "Options after 12th PCB without NEET: BS-MS via IAT and NEST, B.Sc via CUET, agriculture via CUET (ICAR-UG), B.Pharm, and all-stream routes like law and design.",
    subtitle: "Biology students have strong choices beyond MBBS — many of them in research.",
    examSlug: "iiser-iat",
    publishedDate: "2026-10-28",
    updatedDate: "2026-10-28",
    readTime: "8 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Opportunities",
    badge: "Science (PCB)",
    summary:
      "If you studied Physics, Chemistry and Biology and either don't want to take NEET or want a solid plan alongside it, you have real options: research-focused science degrees through IAT and NEST, B.Sc programmes at central universities through CUET UG, agriculture through CUET (ICAR-UG), pharmacy, and all-stream routes such as law, design and hotel management.",
    keyTakeaways: [
      "PCB students are eligible for IISER BS-MS: it needs any three of Biology, Chemistry, Mathematics and Physics in Class 12.",
      "NEST counts your best three of four sections, so a PCB student can build on Biology, Chemistry and Physics.",
      "CUET UG's Biology/Biological Science/Biotechnology/Biochemistry paper opens B.Sc life-science courses at central universities.",
      "ICAR fills 20% of seats at agricultural universities through CUET (ICAR-UG) and its own counselling.",
    ],
    contentSections: [
      {
        heading: "NEET is one route, not the whole map",
        body: [
          "Biology opens doors into life sciences, biotechnology, agriculture, pharmacy, psychology and research, and many of these don't need NEET at all. Even if you are preparing for NEET, it is sensible to have one or two other exams in your plan: your preparation overlaps, and it takes pressure off a single exam day.",
          "The options below are grouped by what they lead to. For each, the official bulletin is the final word on eligibility.",
        ],
      },
      {
        heading: "Research science: IISER, IISc and NISER",
        body: [
          "The IISER BS-MS is a five-year dual degree at seven IISERs, and its Class 12 requirement is any three of Biology, Chemistry, Mathematics and Physics — so PCB qualifies. In 2026 there were 2,043 BS-MS seats. Some IISER programmes, such as B.Tech, economics and data-science courses, need Mathematics, so check each programme in the brochure.",
          "IAT has 15 questions in each of the four subjects, so you will meet some Mathematics. You don't need to master it; aim for confident NCERT basics so the section isn't a loss.",
          "NEST works differently: only your best three of four sections count, and each counted section must clear a minimum score. A PCB student can make Biology, Chemistry and Physics the three counted sections. NEST leads to the Integrated M.Sc at NISER and UM-DAE CEBS, where admitted students are eligible for the DISHA scholarship of ₹60,000 a year.",
        ],
        callout: "Read the OurMocks guide to BS-MS, BS and Integrated M.Sc degrees to compare these programmes in detail.",
      },
      {
        heading: "B.Sc and life sciences through CUET UG",
        body: [
          "CUET UG offers a Biology/Biological Science/Biotechnology/Biochemistry paper alongside Chemistry and Physics. Central universities including the University of Delhi, BHU and the University of Hyderabad admit to B.Sc and integrated science programmes through CUET UG. Each university publishes which papers each course needs.",
          "In 2026 each CUET paper had 50 questions in 60 minutes, marked +5/−1. NEET aspirants will find the Biology content familiar, since both build on NCERT; the difference is the timing and the shorter paper.",
        ],
      },
      {
        heading: "Agriculture and allied sciences",
        body: [
          "The Indian Council of Agricultural Research (ICAR) fills 20% of seats in agriculture and allied programmes (excluding veterinary) at agricultural universities through CUET (ICAR-UG), conducted by NTA. Candidates don't choose a university on the CUET form; seats are allotted through ICAR's online counselling based on merit rank.",
          "In NIRF 2025, ICAR–Indian Agricultural Research Institute, New Delhi is first in the Agriculture and Allied Sectors category for the third year running. Many state agricultural universities also admit through their own state processes.",
        ],
      },
      {
        heading: "Pharmacy and other PCB-friendly routes",
        list: [
          "Pharmacy: BITSAT-2026 accepted Physics, Chemistry and Biology (75% aggregate, 60% in each) for B.Pharm at BITS. Most states also admit to B.Pharm through their CETs. In NIRF 2025, Jamia Hamdard, New Delhi is first in Pharmacy.",
          "Psychology and other social sciences: CUET UG has Psychology and other domain papers if you want to move towards behavioural science.",
          "Law, design and hospitality: CLAT, UCEED, NIFT, NID DAT and NCHM JEE are open to all streams.",
          "Defence: the NDA Army wing accepts a Class 12 pass in any stream; the Air Force and Naval wings need Physics, Chemistry and Mathematics.",
        ],
        body: ["Biology students can also consider:"],
      },
      {
        heading: "A plan that keeps NEET and the alternatives together",
        list: [
          "Keep NCERT Biology and Chemistry as your base; it serves NEET, IAT, NEST and CUET at once.",
          "Add one research exam (IAT or NEST) and CUET UG with Biology, Chemistry and Physics papers.",
          "If you choose IAT, give Mathematics a small, steady slot each week from now on.",
          "Practise each exam's timing: IAT allows 3 minutes a question, CUET about 72 seconds.",
          "Use the OurMocks Eligibility checker and Compare page, and try the free diagnostic to see your starting point.",
        ],
        body: ["You don't have to choose between NEET and everything else. A combined plan looks like this:"],
        callout: "IAT, NEST and CUET UG 2027 dates are not yet announced. In 2026, CUET registration opened on 3 January, IAT registration on 5 March and NEST applications closed on 8 April (extended). Expect similar windows, and confirm on the official sites.",
      },
      {
        heading: "Questions to ask yourself before you decide",
        body: [
          "PCB students often feel that the only respectable outcome is a medical seat. It helps to step back and ask what you actually enjoy about Biology, because different routes reward different interests.",
        ],
        list: [
          "Do I enjoy how living things work — cells, genes, physiology? Research BS-MS and Integrated M.Sc programmes, or a B.Sc in life sciences, go deep into exactly this.",
          "Am I drawn to medicines and how they act? Pharmacy is a professional route with its own entrance tests.",
          "Do I care about food, farming and the environment? Agriculture and allied sciences, through CUET (ICAR-UG) and state admissions, are worth a look.",
          "Am I more interested in people and behaviour than in lab work? Psychology through CUET UG may suit you.",
          "Do I want to keep NEET as my main goal this year? That is fine — just add one or two exams above so your year has more than one outcome.",
        ],
        callout: "There is no wrong answer here. What matters is that your exam list matches what you would genuinely enjoy studying for the next four or five years.",
      },
    ],
    faqs: [
      { q: "Can a PCB student get into an IISER?", a: "Yes. IISER BS-MS needs any three of Biology, Chemistry, Mathematics and Physics in Class 12. You still answer all four IAT sections, so prepare basic Mathematics." },
      { q: "Can I study agriculture without NEET?", a: "Yes. ICAR fills 20% of agricultural university seats (excluding veterinary) through CUET (ICAR-UG) and its own counselling; many states also run their own admissions." },
      { q: "Is NEST a good option for PCB students?", a: "It can be. Only your best three of four sections count, so you can build on Biology, Chemistry and Physics, as long as each counted section clears its minimum score." },
    ],
    sources: [
      SRC.iatBulletin,
      SRC.nestBrochure,
      SRC.cuetBulletin,
      SRC.cuetSyllabus,
      SRC.icarCuet2026,
      SRC.bitsatEligibility,
      SRC.pibNirf2025,
      SRC.ndaNotice2026,
    ],
    relatedExams: ["iiser-iat", "niser-nest", "cuet-ug"],
  },
  {
    slug: "options-after-12th-commerce",
    title: "Options After 12th Commerce: Courses, Entrance Exams and How to Choose",
    metaTitle: "Options After 12th Commerce: Courses and Entrance Exams",
    description:
      "Options after 12th commerce: B.Com, B.A. Economics and BBA via CUET UG, five-year management via IPMAT, law via CLAT, CA Foundation with ICAI, and more.",
    subtitle: "Commerce leads well beyond B.Com — here is how to see the whole picture.",
    examSlug: "cuet-ug",
    publishedDate: "2026-10-28",
    updatedDate: "2026-10-28",
    readTime: "7 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Opportunities",
    badge: "Commerce",
    summary:
      "Commerce students can go into accounting, finance, economics, management, law, design or hospitality. Most public-university degrees come through CUET UG; integrated management programmes, law schools and professional courses have their own routes. This guide explains each and how to combine them.",
    keyTakeaways: [
      "CUET UG has Accountancy/Book-Keeping, Business Studies, Economics/Business Economics and Mathematics/Applied Mathematics papers.",
      "B.Com and economics at central universities such as the University of Delhi and BHU are admitted through CUET UG.",
      "IIM Indore's five-year IPM admits through IPMAT and an interview; CLAT leads to five-year law degrees.",
      "ICAI lets you register for CA Foundation after Class 10 and take the first Foundation exam after appearing in Class 12.",
    ],
    contentSections: [
      {
        heading: "Three broad directions",
        body: [
          "Most commerce options fit into three groups: university degrees (B.Com, B.A. Economics, BBA/BMS and similar), integrated professional programmes (five-year management or law), and professional qualifications (such as chartered accountancy) that you can pursue alongside a degree. Many students combine one from each group.",
          "Before choosing, think about how you like to learn. Some students enjoy numbers and rules and do well in accounting; others prefer ideas and debate and find economics or law more satisfying; others want a structured programme with a clear end point, such as an integrated management course. Your Class 12 subjects matter less than this, because CUET lets you choose papers irrespective of them, within each course's requirements.",
        ],
      },
      {
        heading: "University degrees through CUET UG",
        body: [
          "CUET UG is the main entrance route for commerce degrees at all 48 Central Universities, and many state, deemed and private universities use it too. In 2026 its domain papers included Accountancy/Book-Keeping, Business Studies, Economics/Business Economics and Mathematics/Applied Mathematics, plus 13 language papers and the General Aptitude Test. You could take up to five papers, each with 50 questions in 60 minutes, marked +5/−1.",
          "The University of Delhi offers B.Com (Hons) and B.Com through CUET UG and its CSAS portal, and BHU offers B.Com (Hons) through CUET UG. Each university publishes a course-wise list of required papers, so check it before you choose yours.",
        ],
        callout:
          "In NIRF 2025, the College category's top five — Hindu College, Miranda House, Hans Raj College, Kirori Mal College and St. Stephen's College — are all University of Delhi colleges that admit through CUET UG.",
      },
      {
        heading: "Integrated management and law",
        list: [
          "IPMAT (IIM Indore): a five-year Integrated Programme in Management. For the 2026–31 batch, selection was by an aptitude test and personal interview; Class 12 passouts of 2024 and 2025 and students appearing in 2026 were eligible, subject to a date-of-birth limit. Check IIM Indore's site for the 2027 notice.",
          "CLAT: five-year integrated law degrees at the National Law Universities. CLAT 2027 is on 6 December 2026; applications close on 31 October 2026 (11:59 pm). UG eligibility is 45% in Class 12 (40% for SC/ST/PwD) with no upper age limit. In NIRF 2025, NLSIU Bengaluru is first in Law.",
        ],
        body: ["If you want a longer, focused programme straight after school:"],
      },
      {
        heading: "Chartered accountancy and other professional routes",
        body: [
          "Under ICAI's New Scheme of Education and Training, you can register for the CA Foundation course after Class 10, and take your first Foundation exam after appearing in Class 12. To pass, ICAI requires at least 40% in each paper and 50% in aggregate in one sitting. After Foundation you move to the Intermediate level; graduates can also use a direct-entry route with the marks ICAI specifies.",
          "Many students pursue CA alongside a B.Com or another degree. If you plan to, choose a college and timetable that leave room for it, and read ICAI's current registration deadlines before each exam cycle.",
        ],
      },
      {
        heading: "Other all-stream options",
        list: [
          "Design: UCEED (B.Des at IITs and IIITDM Jabalpur), NIFT and NID DAT accept students from any stream.",
          "Hotel management: NCHM JEE for the B.Sc in Hospitality and Hotel Administration; the 2026 brochure required English in Class 12.",
          "Defence: the NDA Army wing accepts a Class 12 pass in any stream.",
          "Humanities subjects: CUET UG lets you take domain papers irrespective of your Class 12 subjects, though a university may still require particular subjects for a course.",
        ],
        body: ["Commerce students are eligible for these too:"],
      },
      {
        heading: "How to choose your CUET papers as a commerce student",
        list: [
          "List the courses you would join and open each university's CUET course mapping.",
          "Pick the four or five papers that keep the most of that list open; usually a language, Accountancy, Business Studies and Economics, plus Mathematics if your economics choices need it.",
          "Use the OurMocks CUET UG syllabus page as a checklist; domain papers follow NCERT.",
          "Practise full 50-question, 60-minute papers. The free diagnostic gives you a timed start, and the score calculator shows how +5/−1 marking adds up.",
        ],
        body: ["Choosing papers is the most important CUET decision you will make:"],
        callout: "The CUET UG 2027 bulletin is not out yet. In 2026, registration ran 3–30 January and the exam began on 11 May. Reported proposals to shorten papers for 2027 are unconfirmed.",
      },
      {
        heading: "Comparing the main commerce paths",
        body: [
          "It can help to see the main options side by side. The descriptions below are about structure, not outcomes; how a path turns out depends far more on what you do during it than on which one you pick.",
        ],
        list: [
          "B.Com or B.Com (Hons) through CUET UG: a three- or four-year degree with a broad grounding in accounting, finance, business law and economics. Pairs well with CA, CS or CMA studies.",
          "B.A. Economics through CUET UG: more theory and quantitative work. Check whether your target courses need the Mathematics paper.",
          "Five-year integrated management (IPMAT at IIM Indore): a single long programme that combines undergraduate and management study; selection includes an interview.",
          "Five-year law (CLAT): a professional degree; commerce students often choose B.B.A. LL.B or B.Com LL.B options where NLUs offer them.",
          "Chartered accountancy (ICAI): a professional qualification with Foundation, Intermediate and Final levels plus practical training, usually pursued alongside a degree.",
        ],
        callout: "A practical test: read one week's timetable or syllabus for each option on the official site. The one you would happily study for years is usually the right one.",
      },
    ],
    faqs: [
      { q: "Which entrance exam should a commerce student take after 12th?", a: "CUET UG for B.Com, economics and other degrees at central and many other universities. Add IPMAT for integrated management or CLAT for law if those interest you." },
      { q: "Can I do CA and a degree together?", a: "Yes, many students do. ICAI allows the first CA Foundation attempt after you have appeared in Class 12, and you can study for a degree alongside." },
      { q: "Can commerce students take CUET science or humanities papers?", a: "The CUET bulletin lets you choose papers irrespective of your Class 12 subjects, but a university can require specific subjects for a course. Check the course eligibility." },
    ],
    sources: [
      SRC.cuetBulletin,
      SRC.cuetSyllabus,
      SRC.ipm2026,
      SRC.clat2027Press,
      SRC.clat2027Eligibility,
      SRC.icaiFaq,
      SRC.pibNirf2025,
      SRC.uceed2027,
      SRC.nchm2026,
      SRC.ndaNotice2026,
    ],
    relatedExams: ["cuet-ug"],
  },
  {
    slug: "options-after-12th-arts-humanities",
    title: "Options After 12th Arts and Humanities: Degrees, Exams and Where They Lead",
    metaTitle: "Options After 12th Arts/Humanities: Courses and Exams",
    description:
      "Options after 12th arts and humanities: B.A. courses at central universities via CUET UG, law via CLAT, design via NIFT, NID and UCEED, hotel management, NDA.",
    subtitle: "Humanities is a strong starting point — the entrance routes are clearer than many think.",
    examSlug: "cuet-ug",
    publishedDate: "2026-10-28",
    updatedDate: "2026-10-28",
    readTime: "7 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Opportunities",
    badge: "Arts & Humanities",
    summary:
      "Humanities students can study history, political science, economics, psychology, sociology, languages, journalism, law, design and more at some of India's most highly ranked universities. CUET UG is the main route to B.A. programmes at central universities; CLAT, NIFT, NID DAT, UCEED, NCHM JEE and the NDA are open to you as well.",
    keyTakeaways: [
      "CUET UG has humanities domain papers including History, Political Science, Geography/Geology, Sociology, Psychology, Economics and Mass Media/Mass Communication.",
      "JNU (#2), Jamia (#4), the University of Delhi (#5) and BHU (#6) in the NIRF 2025 University list admit undergraduates through CUET UG.",
      "CLAT 2027 is on 6 December 2026; UG eligibility is 45% in Class 12 (40% for SC/ST/PwD).",
      "UCEED 2027 (17 January 2027) and NIFT accept students from any stream for design.",
    ],
    contentSections: [
      {
        heading: "Why the humanities route is worth taking seriously",
        body: [
          "Humanities subjects train you to read closely, argue clearly and understand people and societies. Those skills lead into law, public policy, journalism, design, teaching, research, civil services preparation and many other fields. The entrance routes are also fairly clear: one main exam (CUET UG) and a handful of specialised ones.",
          "If people around you suggest humanities is a fallback, it may help to look at the official rankings. Several of the universities that lead the NIRF 2025 University list are best known for their humanities and social science departments, and they admit undergraduates through the same CUET UG you would take anyway. What you need is a clear list of courses and a steady plan for the papers they require.",
        ],
      },
      {
        heading: "B.A. programmes through CUET UG",
        body: [
          "CUET UG is used by all 48 Central Universities and many state, deemed and private universities. Its 23 domain papers include History, Political Science, Geography/Geology, Sociology, Psychology, Economics/Business Economics, Anthropology, Mass Media/Mass Communication, Fine Arts/Visual Arts/Commercial Arts, Performing Arts, Knowledge Tradition-Practices in India and Sanskrit, along with 13 language papers and the General Aptitude Test.",
          "Several of the highest-ranked universities in NIRF 2025 admit humanities students this way: Jawaharlal Nehru University (#2 University) for its undergraduate programmes, mainly in foreign languages; Jamia Millia Islamia (#4) for the programmes it maps to CUET; the University of Delhi (#5) for B.A. (Hons) and B.A. programmes through CSAS; and Banaras Hindu University (#6) for B.A. (Hons). The University of Hyderabad (#18 University) offers integrated M.A. programmes through CUET.",
        ],
        callout: "Each university publishes the CUET papers each course needs. Look this up before choosing your papers — not after.",
      },
      {
        heading: "Law through CLAT",
        body: [
          "CLAT admits to five-year integrated law degrees at the National Law Universities. For CLAT 2027, the Consortium of NLUs has fixed the exam for Sunday, 6 December 2026, with applications closing on 31 October 2026 at 11:59 pm. UG candidates need 45% in Class 12 (40% for SC/ST/PwD); there is no upper age limit, and students appearing in March/April 2027 can apply. Some NLUs set their own higher thresholds, so read each one's brochure.",
          "In NIRF 2025, National Law School of India University, Bengaluru is first in the Law category for the eighth year running.",
        ],
      },
      {
        heading: "Design, media and hospitality",
        list: [
          "UCEED (IIT Bombay): B.Des at seven institutes including IIT Bombay, IIT Delhi and IIT Guwahati. UCEED 2027 is on 17 January 2027; students who passed Class 12 in 2026 or are appearing in 2027 can apply, from any stream.",
          "NIFT Entrance Exam: B.Des at NIFT campuses through a General Ability Test, Creative Ability Test and Situation Test; the 2027 bulletin sets an age limit of under 24 on 1 August of the admission year, with relaxation for SC/ST/PwD.",
          "NID DAT: B.Des at the National Institutes of Design, through DAT Prelims and DAT Mains.",
          "NCHM JEE: B.Sc in Hospitality and Hotel Administration; the 2026 brochure required English in Class 12 and set no age bar.",
          "Mass communication: CUET UG has a Mass Media/Mass Communication paper for universities that map it.",
        ],
        body: ["If you enjoy visual, creative or people-facing work:"],
      },
      {
        heading: "Defence and integrated management",
        list: [
          "NDA & NA Examination (UPSC): the Army wing accepts a Class 12 pass in any stream. Students appearing in Class 12 can apply.",
          "IPMAT (IIM Indore): a five-year management programme through an aptitude test and interview, open to Class 12 students subject to its date-of-birth and passing-year rules.",
        ],
        body: ["Two more routes open to humanities students:"],
      },
      {
        heading: "Preparing well",
        list: [
          "Choose two or three domain papers you enjoy and score well in; humanities papers reward NCERT-level depth and clear reading.",
          "Don't neglect the language paper: it tests reading comprehension, literary aptitude and vocabulary.",
          "If you take CLAT, read editorials and practise passage-based questions regularly.",
          "Practise timed CUET papers: 50 questions in 60 minutes, about 72 seconds each. The OurMocks free diagnostic is a good first benchmark.",
        ],
        body: ["A few habits make a large difference:"],
        callout: "CUET UG 2027 dates are not announced yet. The 2026 cycle's registration ran 3–30 January 2026, with the exam from 11 May 2026.",
      },
      {
        heading: "Which subjects lead where",
        body: [
          "Humanities subjects connect to many fields. These are common directions, not fixed routes — most of them stay open whichever B.A. subject you choose.",
        ],
        list: [
          "History, Political Science and Sociology: law, public policy, journalism, teaching, research and civil services preparation.",
          "Economics: economic research, policy work and further study in economics, management or law. Some economics courses need the CUET Mathematics paper.",
          "Psychology: further study in psychology and counselling, and work in education and research.",
          "Languages and literature: translation, publishing, content and media work, teaching and foreign-language careers. JNU's undergraduate intake is mainly in foreign languages.",
          "Geography: environmental and urban studies, and mapping and planning-related fields.",
          "Fine Arts and Performing Arts: CUET has papers in both, and BHU has performing and visual arts faculties.",
        ],
        callout: "Choose the subject you enjoy reading about in your free time. Interest keeps you going through a three- or four-year degree far better than a guess about the job market.",
      },
    ],
    faqs: [
      { q: "Which exam should I take for B.A. at Delhi University?", a: "CUET UG. DU admits through CUET scores and its Common Seat Allocation System (CSAS), where you choose courses and colleges." },
      { q: "Can a humanities student apply for design at an IIT?", a: "Yes. UCEED, which admits to B.Des at IIT Bombay, IIT Delhi, IIT Guwahati, IIT Hyderabad, IIT Indore, IIT Roorkee and IIITDM Jabalpur, is open to all streams." },
      { q: "Is there an age limit for CLAT UG?", a: "No. The Consortium of NLUs states there is no upper age limit for the CLAT 2027 UG programme." },
    ],
    sources: [
      SRC.cuetBulletin,
      SRC.cuetSyllabus,
      SRC.clat2027Press,
      SRC.clat2027Eligibility,
      SRC.uceed2027,
      SRC.uceed2027Dates,
      SRC.nift2027,
      SRC.nidBdes2027,
      SRC.nchm2026,
      SRC.ndaNotice2026,
      SRC.ipm2026,
      SRC.nirfUniversity2025,
      SRC.pibNirf2025,
    ],
    relatedExams: ["cuet-ug"],
  },
  {
    slug: "scholarships-after-12th-science",
    title: "Scholarships After 12th Science: INSPIRE-SHE, DISHA and PM-USP Explained",
    metaTitle: "Scholarships After 12th Science: INSPIRE, DISHA, PM-USP",
    description:
      "Scholarships after 12th science, from official sources: INSPIRE-SHE (₹80,000 a year), DISHA at NISER and CEBS, and the PM-USP scholarship, with eligibility.",
    subtitle: "Three government schemes every science student should know about — and how your course choice affects them.",
    examSlug: "niser-nest",
    publishedDate: "2026-10-28",
    updatedDate: "2026-10-28",
    readTime: "7 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Scholarships",
    badge: "Funding your degree",
    summary:
      "Three government schemes matter most for students choosing a science degree after Class 12: DST's INSPIRE Scholarship for Higher Education (SHE), the Department of Atomic Energy's DISHA scholarship for NISER and CEBS students, and the Ministry of Education's PM-USP Central Sector Scheme. Each has different eligibility, and your choice of course can decide whether you qualify.",
    keyTakeaways: [
      "INSPIRE-SHE: ₹80,000 a year for students in the top 1% of their Class 12 board who study natural and basic sciences at B.Sc, BS or Integrated M.Sc/MS level.",
      "DISHA: students admitted to the Integrated M.Sc at NISER and UM-DAE CEBS (through NEST) are eligible for ₹60,000 a year plus ₹20,000 a year for summer internships.",
      "PM-USP: ₹12,000 a year at graduation level for students above the 80th percentile of their board, with family income up to ₹4.5 lakh a year.",
      "Courses such as engineering, medicine, agriculture, psychology, economics and computer science are not supported by INSPIRE-SHE.",
    ],
    contentSections: [
      {
        heading: "Why your course choice matters for scholarships",
        body: [
          "Scholarships are often decided by two things you control in Class 12: your board marks and the course you choose. The same student might qualify for INSPIRE-SHE in a B.Sc Physics programme but not in a B.Tech. Knowing the rules before you choose a course can make a real difference to how your degree is funded.",
          "All amounts and rules below come from the schemes' official documents. Schemes are revised from time to time, so check the official portal in the year you apply.",
          "Scholarships are also worth discussing with your parents early. Knowing that a five-year science programme can come with support such as DISHA or INSPIRE-SHE can change how a family weighs a research degree against other options, and it helps you prepare documents such as income certificates well before the application window.",
        ],
      },
      {
        heading: "INSPIRE Scholarship for Higher Education (SHE)",
        body: [
          "INSPIRE-SHE is run by the Department of Science and Technology (DST). Its official FAQ states that the scholarship is worth ₹80,000 a year, and it is meant to attract talented students into natural and basic sciences.",
          "Eligibility on merit: students in the top 1% of Class 12 aggregate marks of their State or Central board who are studying natural or basic sciences at B.Sc, B.S. or Integrated M.Sc/M.S. level. This includes integrated M.Sc/M.S programmes such as those at the IISERs and NISER. The NEST brochure notes that NISER and CEBS endorse students selected for INSPIRE-SHE.",
        ],
        list: [
          "Not supported: professional courses (such as engineering and medicine), and subjects including agriculture, psychology, home science, economics and computer science. Distance-education courses are also excluded.",
          "To keep the scholarship, DST's post-offer guidelines require passing every subject at the first attempt with at least 60% marks or a CGPA of 7.0 on a 10-point scale.",
          "Support lasts up to five years or until the M.Sc is completed.",
        ],
        callout: "The top 1% cut-off is decided board by board. Your board or the INSPIRE portal publishes the relevant information; don't rely on unofficial estimates.",
      },
      {
        heading: "DISHA scholarship at NISER and CEBS",
        body: [
          "NISER Bhubaneswar and UM-DAE CEBS Mumbai admit to their five-year Integrated M.Sc through NEST. The NEST 2026 brochure states that admitted students are eligible for the Department of Atomic Energy's DISHA scholarship of ₹60,000 a year, plus ₹20,000 a year for summer internships.",
          "Continued support is subject to the scheme's academic conditions, which you should read after admission. DISHA is specific to NISER and CEBS; IAT and the IISERs do not lead to it.",
        ],
      },
      {
        heading: "PM-USP Central Sector Scheme of Scholarship",
        body: [
          "The Ministry of Education's Central Sector Scheme of Scholarship for College and University Students, part of PM-USP, is open to students across streams, not only science. Applications are made on the National Scholarship Portal.",
        ],
        list: [
          "Merit: above the 80th percentile of successful candidates in your stream from your Class 12 board.",
          "Income: gross family income up to ₹4.5 lakh a year.",
          "Course: a regular degree course at a recognised college or university; distance or correspondence courses are not eligible.",
          "Amount: ₹12,000 a year at graduation level for the first three years, and ₹20,000 a year at post-graduation level; the guidelines also set ₹20,000 for the later years of five-year integrated and professional courses.",
          "You cannot hold this alongside other scholarships or fee-waiver schemes listed in the guidelines.",
        ],
      },
      {
        heading: "Planning ahead in Class 12",
        list: [
          "Your board marks matter for INSPIRE-SHE and PM-USP, not just your entrance score. Don't let entrance preparation crowd out board preparation.",
          "If you are aiming at pure science, compare routes: NEST (NISER/CEBS, with DISHA), IAT (IISERs) and CUET UG (B.Sc at central universities) can all lead to INSPIRE-eligible courses.",
          "Keep your documents ready: Class 12 marksheet, income certificate, category certificate and bank details in your own name.",
          "Bookmark the official portals — online-inspire.gov.in and scholarships.gov.in — and avoid paying anyone to apply on your behalf.",
        ],
        body: ["A few steps now save stress later:"],
        callout:
          "Use the OurMocks guide to BS-MS, BS and Integrated M.Sc degrees and the NEST and IAT exam pages to see which programmes fit these scholarships.",
      },
      {
        heading: "How the three schemes compare",
        list: [
          "Who runs it: INSPIRE-SHE — Department of Science and Technology; DISHA — Department of Atomic Energy; PM-USP — Ministry of Education.",
          "Main condition: INSPIRE-SHE — top 1% of your Class 12 board plus a natural or basic science course; DISHA — admission to NISER or CEBS through NEST; PM-USP — above the 80th percentile of your board plus family income up to ₹4.5 lakh.",
          "Amount: INSPIRE-SHE — ₹80,000 a year; DISHA — ₹60,000 a year plus ₹20,000 a year for summer internships; PM-USP — ₹12,000 a year at graduation level.",
          "Streams: INSPIRE-SHE and DISHA are for science; PM-USP is open to all streams.",
        ],
        body: ["A quick comparison, from the official documents:"],
      },
      {
        heading: "Mistakes to avoid",
        list: [
          "Assuming you qualify without checking the course list: INSPIRE-SHE excludes several popular subjects, including computer science and economics.",
          "Missing the board-marks step: both INSPIRE-SHE and PM-USP depend on your Class 12 result, not your entrance score.",
          "Trusting unofficial \"scholarship agents\": government schemes are applied for on official portals, and you should never pay anyone to apply.",
          "Forgetting renewal: scholarships usually require you to meet academic conditions each year — INSPIRE-SHE, for instance, asks for at least 60% or a CGPA of 7.0 at the first attempt.",
        ],
        body: ["Students lose scholarships for avoidable reasons:"],
      },
    ],
    faqs: [
      { q: "How much is the INSPIRE scholarship?", a: "₹80,000 a year, according to DST's official INSPIRE-SHE FAQ, for eligible students in natural and basic science courses." },
      { q: "Can B.Tech students get INSPIRE-SHE?", a: "No. INSPIRE-SHE does not support professional courses such as engineering and medicine; it is for natural and basic sciences at B.Sc, BS or Integrated M.Sc/MS level." },
      { q: "Who gets the DISHA scholarship?", a: "Students admitted to the Integrated M.Sc at NISER Bhubaneswar and UM-DAE CEBS Mumbai, which admit through NEST, are eligible for ₹60,000 a year plus ₹20,000 a year for summer internships." },
      { q: "What is the income limit for the central sector scholarship?", a: "Gross family income up to ₹4.5 lakh a year, along with marks above the 80th percentile of your Class 12 board in your stream." },
    ],
    sources: [SRC.inspireSheFaq, SRC.inspireSheGuidelines, SRC.nestBrochure, SRC.pmUsp, SRC.nsp],
    relatedExams: ["niser-nest", "iiser-iat", "cuet-ug"],
  },
  {
    slug: "gap-year-after-12th-which-exams-can-you-take",
    title: "Taking a Gap Year After 12th: Which Entrance Exams Can You Still Take?",
    metaTitle: "Gap Year After 12th: Which Entrance Exams Can You Take?",
    description:
      "Gap year after 12th? Which entrance exams accept droppers: CUET UG and CLAT (no age limit), plus IAT, NEST, BITSAT, UCEED, NIFT and IPMAT passing-year rules.",
    subtitle: "A drop year can work well — if you know which exams still accept you.",
    examSlug: "cuet-ug",
    publishedDate: "2026-10-28",
    updatedDate: "2026-10-28",
    readTime: "7 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Planning",
    badge: "Gap year",
    summary:
      "Taking a year after Class 12 to prepare again is common, but every exam has its own rule about when you passed Class 12 and how old you are. Some, like CUET UG and CLAT, have no upper age limit; others allow only one or two passing years. This guide collects the rules from the latest official bulletins.",
    keyTakeaways: [
      "No upper age limit: CUET UG, CLAT 2027 UG and NEST 2026 (universities and institutes may still set their own rules).",
      "Passing-year windows: IAT 2026 accepted 2024, 2025 and 2026 passouts; NEST 2026 accepted 2024 and 2025 passouts and 2026 appearers.",
      "Narrow windows: BITSAT-2026 accepted 2025 passouts and 2026 appearers; UCEED 2027 accepts 2026 passouts and 2027 appearers.",
      "Age limits apply to NIFT (under 24 on 1 August) and IIM Indore's IPM (date-of-birth cut-off).",
    ],
    contentSections: [
      {
        heading: "Is a gap year a good idea?",
        body: [
          "A gap year can give you time to cover topics properly, build exam stamina and apply to more exams with better preparation. It can also add pressure if the plan is vague. The most useful first step is factual: check which exams will still accept you next year, so your plan isn't built on an exam you can no longer take.",
          "The rules below come from the latest official bulletins. Where a 2027 bulletin is out, we say so; otherwise the 2026 rule is shown as a guide, and you should confirm the 2027 rule when it is published.",
          "It also helps to talk openly at home about why you are taking the year and what a good outcome looks like. A plan that names the exams, the months you will prepare and how you will check progress is much easier for parents to support than a general promise to \"study harder\". Many students find that writing this down also makes the year less stressful for themselves.",
        ],
      },
      {
        heading: "Exams with no upper age limit",
        list: [
          "CUET UG: the 2026 bulletin sets no age limit, and Class 12 passouts and appearers can apply. Universities may apply their own age rules for particular programmes.",
          "CLAT 2027 (official): no upper age limit for the UG programme; 45% in Class 12 (40% for SC/ST/PwD).",
          "NEST 2026: the brochure states there is no age limit for appearing or for admission — but it also has a passing-year rule (below).",
          "NCHM JEE 2026: the brochure set no age bar for the B.Sc in Hospitality and Hotel Administration.",
        ],
        body: ["These exams are the most dropper-friendly:"],
      },
      {
        heading: "Exams with a passing-year window",
        list: [
          "IISER IAT 2026: Class 12 (or a three-year diploma) passed in 2024, 2025 or 2026. If the rule repeats, 2025, 2026 and 2027 passouts would be eligible for IAT 2027 — confirm in the 2027 brochure.",
          "NEST 2026: Class 12 passed in 2024 or 2025, or appearing in 2026.",
          "BITSAT-2026: Class 12 passed in 2025 or appearing in 2026. BITS also states that if you repeat Class 12 to improve marks, you should do so in all subjects.",
          "UCEED 2027 (official): Class 12 passed in 2026 or appearing in 2027 — so a 2026 passout taking a gap year can still apply for UCEED 2027.",
          "IIM Indore IPM 2026–31: Class 12 passed in 2024 or 2025, or appearing in 2026, plus a date-of-birth limit.",
        ],
        body: ["These exams accept you for a fixed number of years after Class 12:"],
        callout: "A 2026 Class 12 passout planning a gap year should check each 2027 bulletin as soon as it is released. A rule that held in 2026 may change.",
      },
      {
        heading: "Exams with an age limit",
        list: [
          "NIFT 2027 (official bulletin): under 24 years on 1 August of the admission year for its undergraduate programmes, with five years' relaxation for SC/ST/PwD.",
          "NID DAT: the B.Des handbook sets birth-date cut-offs by category; check the 2027–28 handbook.",
          "NDA & NA (UPSC): each notice sets a date-of-birth window for that course; check the notice for the cycle you apply to.",
        ],
        body: ["Some exams use age rather than passing year:"],
      },
      {
        heading: "Making the gap year count",
        list: [
          "Write down every exam you are eligible for next year, with its official link and expected registration month.",
          "Add at least one broad-access exam (usually CUET UG) to your plan as a backup.",
          "Study on a weekly timetable with a full-length mock every week or two; track your pacing and accuracy, not just your score.",
          "Revisit your plan after your first three mocks; adjust exam choices if your strengths point another way.",
          "Look after your health and stay connected with friends and family — consistency over a year matters more than intensity in one month.",
        ],
        body: ["Structure is what turns a gap year into progress:"],
        callout: "The OurMocks Eligibility checker summarises the rules for CUET UG, IAT, NEST and COMEDK. The free diagnostic and the time-per-question view on the results dashboard help you see where to focus first.",
      },
      {
        heading: "A sample outline for the year",
        body: ["Every gap year is different, but a simple structure keeps you on track. Adjust the months to the exams you choose."],
        list: [
          "Months 1–2: confirm eligibility, set your exam list, and take one full diagnostic test to find your starting point.",
          "Months 3–6: rebuild concepts chapter by chapter from NCERT, with short timed topic tests each week.",
          "Months 7–9: switch to full-length mocks every week or two, review every mistake and track your timing per question.",
          "Months 10–12: exam-specific practice at the real timing and marking — 72 seconds a question for CUET UG, 3 minutes for IAT, 1 minute for COMEDK — plus revision from your own notes and error log.",
        ],
        callout: "Registration windows often open months before the exam. In 2026, CUET UG registration opened on 3 January and IAT registration on 5 March, so set reminders early.",
      },
    ],
    faqs: [
      { q: "Can I take CUET UG after a gap year?", a: "Yes. The CUET UG 2026 bulletin sets no age limit, though a university may apply its own age rules for particular programmes." },
      { q: "Can 2026 Class 12 passouts take IAT 2027?", a: "Very likely, but not yet confirmed. IAT 2026 accepted 2024, 2025 and 2026 passouts; if the rule repeats, 2026 passouts will be eligible in 2027. Check the 2027 brochure." },
      { q: "Is a gap year allowed for UCEED?", a: "Yes, one year. UCEED 2027 accepts candidates who passed Class 12 in 2026 or are appearing in 2027." },
    ],
    sources: [
      SRC.cuetBulletin,
      SRC.clat2027Eligibility,
      SRC.nestBrochure,
      SRC.nchm2026,
      SRC.iatBulletin,
      SRC.bitsat2026,
      SRC.bitsatEligibility,
      SRC.uceed2027,
      SRC.ipm2026,
      SRC.nift2027,
      SRC.nidBdes2027,
      SRC.ndaNotice2026,
    ],
    relatedExams: ["cuet-ug", "iiser-iat", "niser-nest", "comedk"],
  },
  {
    slug: "government-universities-through-cuet-ug",
    title: "Government Universities Through CUET UG: Central Universities and How Admission Works",
    metaTitle: "Government Colleges Through CUET UG: Central Universities",
    description:
      "Government colleges through CUET UG: all 48 Central Universities including DU, BHU, JNU and Jamia, their NIRF 2025 ranks, and how admission works.",
    subtitle: "One exam, 48 central universities — and a separate admission step for each.",
    examSlug: "cuet-ug",
    publishedDate: "2026-10-28",
    updatedDate: "2026-10-28",
    readTime: "7 min read",
    author: AUTHOR,
    authorRole: AUTHOR_ROLE,
    category: "Colleges",
    badge: "CUET UG",
    summary:
      "CUET UG is the entrance route to all 48 Central Universities, and to many state, deemed and private universities. Several are among the highest-ranked universities in NIRF 2025. But a CUET score is not an admission offer: each university runs its own process afterwards.",
    keyTakeaways: [
      "All 48 Central Universities use CUET UG, including DU, BHU, JNU, Jamia, the University of Hyderabad, AMU and Pondicherry University (2026 bulletin).",
      "NIRF 2025 University ranks: JNU 2, Jamia 4, DU 5, BHU 6, University of Hyderabad 18.",
      "After the result you must apply to each university separately; DU uses its CSAS portal.",
      "Choose papers from each course's mapping; the bulletin lets you take papers irrespective of your Class 12 subjects, but courses can still require specific ones.",
    ],
    contentSections: [
      {
        heading: "What \"government college through CUET\" really means",
        body: [
          "Students often search for government colleges they can join through CUET. The clearest group is the Central Universities. The CUET UG 2026 bulletin lists all 48 Central Universities as participants, along with many state, deemed and private universities.",
          "Central universities admit either to their own departments or, in some cases such as the University of Delhi, to affiliated colleges. Many state universities also use CUET; check the participating-university list on the CUET portal.",
        ],
      },
      {
        heading: "Central Universities with NIRF 2025 ranks",
        body: ["Several central universities rank highly in NIRF 2025. These ranks are quoted exactly as NIRF lists them:"],
        list: [
          "Jawaharlal Nehru University, New Delhi — #2 University, #9 Overall. Undergraduate intake is mainly in foreign languages.",
          "Jamia Millia Islamia, New Delhi — #4 University. Uses CUET for mapped programmes and its own test for some others.",
          "University of Delhi — #5 University, #15 Overall. B.A., B.Com and B.Sc courses across many colleges, through CUET and CSAS.",
          "Banaras Hindu University, Varanasi — #6 University, #10 Overall. A large residential campus with arts, science, commerce, agriculture and performing arts.",
          "Aligarh Muslim University — #10 University. Check AMU's admission notice for which courses use CUET.",
          "University of Hyderabad — #18 University, #26 Overall. Mainly five-year integrated M.Sc and M.A. programmes.",
        ],
        callout: "In the NIRF 2025 College category, the top five — Hindu College, Miranda House, Hans Raj College, Kirori Mal College and St. Stephen's College — are all University of Delhi colleges.",
      },
      {
        heading: "How admission works after CUET",
        body: [
          "NTA conducts the exam and publishes scores; it does not allot seats. After the result, you apply to each university through its own portal, and the university prepares merit lists using your CUET scores in the papers that course requires.",
          "This means the weeks after the result matter as much as the exam. Universities open their portals at different times, ask for different documents and run several rounds. Keep a simple table with each university's portal link, registration deadline, required papers and your status, and check it every few days until classes begin.",
        ],
        list: [
          "University of Delhi: CUET UG score, then the Common Seat Allocation System (CSAS), where you rank course and college combinations.",
          "Banaras Hindu University: CUET UG score, then BHU's own UG registration and course-wise merit lists.",
          "JNU, University of Hyderabad and others: CUET UG score, then applications through each university's admission portal.",
        ],
      },
      {
        heading: "Choosing CUET papers for central universities",
        body: [
          "In 2026 you could take up to five of 37 papers: 13 languages, 23 domain subjects and the General Aptitude Test. Each paper had 50 compulsory questions in 60 minutes, marked +5/−1. For papers held in several shifts, NTA normalises scores using percentiles within each shift.",
          "The bulletin lets you choose papers irrespective of your Class 12 subjects, but each university decides which papers count for each course and may require particular Class 12 subjects. So start from courses, not subjects:",
        ],
        list: [
          "List 8–10 course and university combinations you would genuinely join.",
          "Open each one's CUET course mapping and note the required papers.",
          "Pick the combination of papers that keeps most of the list open.",
          "Use the official syllabus as a checklist; domain papers follow NCERT.",
        ],
      },
      {
        heading: "2026 facts and 2027 expectations",
        body: [
          "Official (2026): registration ran 3–30 January 2026, and the exam began on 11 May 2026. Results have been declared.",
          "Not yet official (2027): NTA has not published the 2027 bulletin. News reports describe proposals for shorter papers and a four-subject cap; none is confirmed. Prepare for the 2026 pattern and watch cuet.nta.nic.in, likely from late December 2026.",
        ],
        callout:
          "Practise on OurMocks: the free diagnostic is a full-length CUET-style paper, the score calculator applies +5/−1 marking, and the CUET UG previous-year papers and syllabus pages help you plan.",
      },
      {
        heading: "Common mistakes after the CUET result",
        list: [
          "Waiting for a university to contact you: no university admits you automatically. Watch each university's admission portal and apply on time.",
          "Ignoring course mappings: a strong score in a paper your course doesn't count won't help for that course.",
          "Listing too few preferences on portals such as DU's CSAS: include enough course and college combinations that you would genuinely join.",
          "Missing document checks and fee deadlines: each round has its own dates, and missing one can cost you a seat.",
        ],
        body: ["Many students lose options at the admission stage, not in the exam:"],
      },
      {
        heading: "Beyond central universities",
        body: [
          "Central universities are only part of the CUET picture. Many state, deemed and private universities also use CUET UG scores, each with its own admission process and fees. The CUET portal lists participating institutions; check each one's admission page for which courses use CUET.",
          "CUET (ICAR-UG) is a separate route for agriculture and allied degrees: ICAR fills 20% of seats at agricultural universities through it, with its own online counselling. If you are a science student, IAT and NEST lead to the IISERs, NISER and CEBS — public institutions that use their own exams rather than CUET.",
        ],
        callout: "Use the OurMocks Colleges page to see each college's NIRF 2025 positions and admission route, and the Compare page to see CUET UG next to IAT, NEST and COMEDK.",
      },
    ],
    faqs: [
      { q: "How many central universities accept CUET UG?", a: "All 48 Central Universities, according to the CUET UG 2026 bulletin, along with many state, deemed and private universities." },
      { q: "Does a good CUET score give me a seat automatically?", a: "No. You must apply to each university separately after the result. Each university prepares its own merit lists from CUET scores." },
      { q: "Which CUET universities rank highest in NIRF 2025?", a: "In the University category: JNU is 2, Jamia Millia Islamia 4, the University of Delhi 5 and BHU 6." },
    ],
    sources: [SRC.cuetBulletin, SRC.cuetSite, SRC.cuetSyllabus, SRC.nirf2025, SRC.nirfUniversity2025, SRC.nirfCollege2025, SRC.pibNirf2025],
    relatedExams: ["cuet-ug"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
