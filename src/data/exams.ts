import type { ExamKey } from "./catalog";
export type OfficialLink = { label: string; url: string };
export type ExamGuide = {
  slug: ExamKey;
  name: string;
  fullName: string;
  category: "University admissions" | "Science & research" | "Engineering";
  summary: string;
  opportunity: string;
  programmes: string;
  eligibility: string[];
  format: string;
  syllabus: string;
  fee: string;
  admission: string;
  dates: { label: string; value: string }[];
  application: OfficialLink & { status: "closed" | "unverified"; note: string };
  notification: { title: string; detail: string; source: OfficialLink };
  sources: OfficialLink[];
  checkedOn: string;
  verification: "reviewed" | "partial";
  /** A direct 40–70 word answer to "what is this exam?", shown first on the page. */
  quickAnswer: string;
  /** The official pattern of the latest cycle, as label/value rows. */
  pattern: { label: string; value: string }[];
  /** What is known about the next cycle; never presented as confirmed unless it is. */
  nextCycle: { title: string; points: string[] };
  /** Institutes and programmes that admit through this exam. */
  acceptedBy: { name: string; detail: string }[];
  seats?: string;
  faqs: { q: string; a: string }[];
};
export const exams: ExamGuide[] = [
  {
    slug: "cuet-ug",
    name: "CUET UG",
    fullName: "Common University Entrance Test — Undergraduate",
    category: "University admissions",
    summary:
      "Explore undergraduate study across participating central, state, deemed and private universities through a common entrance test.",
    opportunity:
      "Start with the degree you want, then check which universities accept CUET and which papers they require.",
    programmes:
      "Undergraduate courses vary by participating university. Check its programme list and subject combinations.",
    eligibility: [
      "Class 12/equivalent passed, or appearing in 2026; CUET has no age limit.",
      "Universities set additional age, marks and subject requirements. Taking CUET does not establish eligibility for every course.",
    ],
    format:
      "Computer-based; 50 questions and 60 minutes per paper. +5 correct, −1 incorrect. Choose up to five papers.",
    syllabus:
      "Languages, domain subjects and General Aptitude Test. Match your papers to the university’s course requirements.",
    fee: "2026, up to 3 papers: General ₹1,000; OBC-NCL/EWS ₹900; SC/ST/PwD/PwBD/third gender ₹800. Additional papers and overseas centres cost extra.",
    admission:
      "Apply through each university’s admission process after receiving your score; a scorecard is not a seat offer.",
    dates: [
      { label: "2026 examination commenced", value: "11 May 2026" },
      {
        label: "2026 result",
        value: "Declared — official scorecard available",
      },
    ],
    application: {
      status: "closed",
      label: "Official 2026 scorecard login",
      url: "https://examinationservices.nic.in/ResultoService26/CUET2026/Login",
      note: "2026 is at the results stage. This is not a new application form; a next-cycle application link has not been verified.",
    },
    notification: {
      title: "2027 bulletin awaited",
      detail:
        "The 2026 cycle is complete. NTA has not announced CUET UG 2027 dates or changes; the bulletin is expected around late December 2026 to January 2027.",
      source: {
        label: "NTA notices and candidate activity",
        url: "https://cuet.nta.nic.in/",
      },
    },
    sources: [
      {
        label: "2026 information bulletin (PDF)",
        url: "https://cdnbbsr.s3waas.gov.in/s3d1a21da7bca4abff8b0b61b87597de73/uploads/2026/01/202601031633478370.pdf",
      },
      {
        label: "Official subject syllabus",
        url: "https://cuet.nta.nic.in/cuetug-2026-syllabus/",
      },
      { label: "Official CUET website", url: "https://cuet.nta.nic.in/" },
    ],
    quickAnswer:
      "CUET UG is the National Testing Agency's computer-based entrance test for undergraduate admission to all 48 Central Universities and many state, deemed and private universities. In 2026, each paper had 50 compulsory questions in 60 minutes, marked +5 for a correct answer and −1 for a wrong one, and candidates could choose up to five of 37 papers.",
    pattern: [
      { label: "Conducted by", value: "National Testing Agency (NTA)" },
      { label: "Mode", value: "Computer-based test (CBT)" },
      { label: "Papers offered", value: "37: 13 languages, 23 domain subjects and the General Aptitude Test" },
      { label: "Papers you can take", value: "Up to 5, including languages and the General Aptitude Test" },
      { label: "Questions per paper", value: "50, all compulsory" },
      { label: "Duration", value: "60 minutes per paper" },
      { label: "Marking", value: "+5 correct, −1 incorrect, 0 unanswered" },
      { label: "Medium", value: "13 languages" },
      { label: "Scores", value: "Multi-shift papers are normalised into NTA percentile-based scores" },
    ],
    nextCycle: {
      title: "CUET UG 2027: what is known",
      points: [
        "NTA has not released the 2027 information bulletin yet. In 2026, registration ran from 3 to 30 January and the exam was held from 11 to 31 May.",
        "News reports after a 13 October 2026 meeting describe proposals for shorter papers (35–40 questions in 40–45 minutes), a four-subject cap and all papers on one day. None of these is confirmed by NTA.",
        "Until the bulletin is out, prepare for the 2026 pattern above and track cuet.nta.nic.in.",
      ],
    },
    acceptedBy: [
      { name: "48 Central Universities", detail: "Including University of Delhi, Banaras Hindu University, Jawaharlal Nehru University, Jamia Millia Islamia, University of Hyderabad, Aligarh Muslim University and Pondicherry University (2026 bulletin, Appendix I)." },
      { name: "State, deemed and private universities", detail: "Participating institutions are listed on the CUET portal; each sets its own course eligibility and admission process." },
    ],
    faqs: [
      { q: "How many subjects can I take in CUET UG?", a: "Up to five papers in 2026, counting languages and the General Aptitude Test. Choose the papers your target courses require; each university publishes its own course-wise mapping." },
      { q: "Can I take a CUET domain subject I did not study in Class 12?", a: "The 2026 bulletin lets you choose papers irrespective of your Class 12 subjects, but a university can still require specific subjects for a course. Check the course eligibility before choosing." },
      { q: "Is there negative marking in CUET UG?", a: "Yes. A wrong answer costs 1 mark and a correct answer earns 5; unanswered questions score 0." },
      { q: "Is there an age limit for CUET UG?", a: "CUET itself has no age limit. Universities may apply their own age rules for particular programmes." },
      { q: "How are CUET scores compared across shifts?", a: "For papers held in several shifts, NTA converts raw marks into percentiles within each shift and then into normalised scores, as described in Appendix VI of the bulletin." },
      { q: "When will CUET UG 2027 registration open?", a: "Not announced yet. In 2026 it opened on 3 January, so watch for the 2027 bulletin from late December 2026." },
    ],
    checkedOn: "2026-10-27",
    verification: "reviewed",
  },
  {
    slug: "iiser-iat",
    name: "IISER IAT",
    fullName: "IISER Aptitude Test",
    category: "Science & research",
    summary:
      "Explore science-focused study at the Indian Institutes of Science Education and Research.",
    opportunity:
      "Consider this route if you enjoy scientific ideas and want to explore research-oriented study.",
    programmes:
      "BS-MS dual degrees and institute-specific programmes. Consult the bulletin for the full list and subject prerequisites.",
    eligibility: [
      "The 2026 bulletin covers eligible Class 12/equivalent or three-year diploma qualifications from 2024, 2025 or 2026, including candidates appearing in 2026.",
      "Science BS-MS applicants need three of Biology, Chemistry, Mathematics and Physics. Aggregate: 60% across all qualifying subjects, or 55% for SC/ST/PwD. Check programme-specific Mathematics requirements and the bulletin’s JK-BOSE exception.",
    ],
    format:
      "Three-hour computer-based test: 60 questions, 15 each in Biology, Chemistry, Mathematics and Physics. +4 correct, −1 incorrect, 0 unanswered.",
    syllabus:
      "Biology, Chemistry, Mathematics and Physics. Use the official IAT syllabus when planning preparation.",
    fee: "2026: ₹2,000 for General/EWS/OBC/OBC-NCL; ₹1,000 for the listed SC/ST, PwD and eligible Kashmiri categories. Read the complete conditions.",
    admission:
      "Follow IISER seat allotment after IAT. Other institutions accepting IAT may require separate applications.",
    dates: [
      { label: "2026 registration opened (bulletin)", value: "5 March 2026" },
      { label: "2026 deadline (bulletin)", value: "13 April 2026" },
      { label: "2026 examination (bulletin)", value: "7 June 2026" },
    ],
    application: {
      status: "closed",
      label: "Official IISER admissions website",
      url: "https://www.iiseradmission.in/",
      note: "IAT 2026 applications are closed. The 2027 application will open on the official IISER admissions website.",
    },
    notification: {
      title: "IAT 2027 bulletin awaited",
      detail:
        "The 2026 admission cycle is complete. The 2027 bulletin is usually published in early spring; watch the official IISER admissions website.",
      source: {
        label: "Official IISER admissions",
        url: "https://www.iiseradmission.in/",
      },
    },
    sources: [
      {
        label: "2026 information bulletin (PDF)",
        url: "https://www.iiseradmission.in/assets/pdfs/IB_IAT_2026_ENG.pdf",
      },
      {
        label: "IISER Kolkata admissions information",
        url: "https://www.iiserkol.ac.in/",
      },
    ],
    quickAnswer:
      "IAT (IISER Aptitude Test) is the entrance test for the 5-year BS-MS programmes at the seven IISERs. IISc Bengaluru, IIT Madras, IIT Guwahati, IACS Kolkata and IIEST Shibpur also use it for some science programmes. In 2026 it was a 3-hour computer-based test of 60 questions — 15 each in Biology, Chemistry, Mathematics and Physics — marked +4/−1.",
    pattern: [
      { label: "Conducted by", value: "The IISERs (joint admission)" },
      { label: "Mode", value: "Computer-based test" },
      { label: "Questions", value: "60: 15 each in Biology, Chemistry, Mathematics and Physics" },
      { label: "Duration", value: "3 hours" },
      { label: "Marking", value: "+4 correct, −1 incorrect, 0 unanswered" },
      { label: "Maximum marks", value: "240" },
    ],
    seats: "2,343 tentative seats for 2026: 2,043 in BS-MS across seven IISERs and 300 in BS/B.Tech programmes.",
    nextCycle: {
      title: "IAT 2027: what is known",
      points: [
        "The 2027 bulletin has not been released. In 2026 the portal opened on 5 March, closed on 13 April, and the test was held on 7 June.",
        "In 2026, Class 12 candidates from 2024, 2025 and 2026 were eligible. If the rule is repeated, 2025, 2026 and 2027 passouts would be eligible in 2027 — confirm in the bulletin.",
      ],
    },
    acceptedBy: [
      { name: "IISER Berhampur, Bhopal, Kolkata, Mohali, Pune, Thiruvananthapuram and Tirupati", detail: "5-year BS-MS (dual degree). IISER Kolkata also offers BS-MS in Computational and Data Sciences." },
      { name: "IISER Bhopal and IISER Tirupati", detail: "4-year BS (Economic Sciences; Economic and Statistical Sciences) and B.Tech programmes at IISER Bhopal." },
      { name: "Indian Institute of Science, Bengaluru", detail: "4-year BS (Research), with its own application." },
      { name: "IIT Madras", detail: "4-year BS programme, with its own application." },
      { name: "IIT Guwahati, IACS Kolkata, IIEST Shibpur", detail: "BS in Biomedical Science and Engineering (IIT Guwahati); integrated BS-MS (IACS); 5-year BS-MS in Chemistry, Physics and Applied Geology (IIEST)." },
    ],
    faqs: [
      { q: "Can PCB students apply for IISER BS-MS?", a: "Yes. BS-MS needs any three of Biology, Chemistry, Mathematics and Physics in Class 12. Some programmes, such as B.Tech, economics and data-science courses, have extra subject requirements, so check the bulletin for each programme." },
      { q: "Does IISc admit students through IAT?", a: "Yes. The 2026 IAT bulletin lists IISc Bengaluru's 4-year BS (Research) programme among the institutions using IAT scores. IISc runs its own application alongside." },
      { q: "Is there negative marking in IAT?", a: "Yes: +4 for a correct answer and −1 for a wrong one; unanswered questions score 0." },
      { q: "How many seats are there in the IISERs?", a: "For 2026, 2,343 tentative seats: 2,043 in BS-MS and 300 in BS/B.Tech programmes." },
      { q: "Who is eligible for IAT 2027?", a: "The 2027 rules are not out. In 2026, Class 12 (or a 3-year diploma) passed in 2024, 2025 or 2026 qualified, with a 60% aggregate (55% for SC/ST/PwD)." },
    ],
    checkedOn: "2026-10-27",
    verification: "reviewed",
  },
  {
    slug: "niser-nest",
    name: "NEST",
    fullName: "National Entrance Screening Test",
    category: "Science & research",
    summary:
      "A route to five-year integrated MSc programmes at NISER Bhubaneswar and UM-DAE CEBS Mumbai.",
    opportunity:
      "Explore research-oriented science study with pathways into doctoral research and scientific careers.",
    programmes:
      "Integrated MSc in biological, chemical, mathematical and physical sciences. Eligible students may receive DISHA scholarship support.",
    eligibility: [
      "Three of Biology, Chemistry, Mathematics and Physics in Classes 11–12; Class 12 passed in 2024/2025 or appearing in 2026.",
      "60% aggregate, or 55% for SC/ST/Divyangjan. A NEST merit-list rank is required. No upper age limit for 2026.",
    ],
    format:
      "Three-hour computer-based test; four sections, 20 questions each. +3 correct, −1 incorrect. Ranking uses section cutoffs and qualifying best-three-section rules.",
    syllabus:
      "Class 11–12 Biology, Chemistry, Mathematics and Physics, primarily CBSE/NCERT. Detailed topics and scoring rules are in the brochure.",
    fee: "2026: ₹700 for female, SC/ST/Divyangjan and UR-EWS applicants; ₹1,400 for male/other UR/OBC applicants.",
    admission:
      "NISER and CEBS handle admission using NEST merit; follow institute instructions for seat offers and document checks.",
    dates: [
      {
        label: "2026 deadline (extended)",
        value: "8 April 2026, 11:30 pm IST",
      },
      { label: "2026 examination", value: "6 June 2026" },
      { label: "2026 results", value: "24 June 2026" },
      { label: "Scorecard access announced until", value: "30 September 2026" },
    ],
    application: {
      status: "closed",
      label: "Official 2026 candidate login",
      url: "https://cdn3.digialm.com/EForms/configuredHtml/1834/97119/login.html",
      note: "New applications are closed. Existing candidates can use the organiser-linked login for results and scorecards.",
    },
    notification: {
      title: "NEST 2027 brochure awaited",
      detail:
        "The 2026 cycle is complete. The 2027 brochure, dates and fees will be published on the official NEST website.",
      source: {
        label: "NEST official updates",
        url: "https://www.nestexam.in/",
      },
    },
    sources: [
      {
        label: "2026 brochure and syllabus (PDF)",
        url: "https://www.nestexam.in/docs/26/NEST2026_Brochure_Syllabus_Updated_12Jan2026.pdf?v=1.1",
      },
      { label: "NISER", url: "https://www.niser.ac.in/" },
      { label: "UM-DAE CEBS", url: "https://www.cbs.ac.in/" },
      {
        label: "NEST dates, fees and helpdesk",
        url: "https://www.nestexam.in/",
      },
    ],
    quickAnswer:
      "NEST is the entrance test for the 5-year Integrated MSc at NISER Bhubaneswar and UM-DAE CEBS Mumbai, both set up by the Department of Atomic Energy. It is a 3-hour computer-based test with four 20-question sections (Biology, Chemistry, Mathematics, Physics) marked +3/−1. Your total is the sum of your best three section scores, out of 180.",
    pattern: [
      { label: "Mode", value: "Computer-based test, in English and Hindi" },
      { label: "Sections", value: "Biology, Chemistry, Mathematics, Physics — 20 single-correct questions each" },
      { label: "Duration", value: "3 hours (calculators and log tables not allowed)" },
      { label: "Marking", value: "+3 correct, −1 incorrect, 0 unanswered; 60 marks per section" },
      { label: "Total score", value: "Sum of your best three section scores (maximum 180)" },
      { label: "Section cut-off", value: "Each counted section must reach its minimum admissible score: 20% of the average of the top 100 scores in that section" },
    ],
    nextCycle: {
      title: "NEST 2027: what is known",
      points: [
        "The 2027 brochure has not been released. In 2026, applications closed on 8 April (extended) and the exam was held on 6 June.",
        "In 2026, Class 12 passouts of 2024 and 2025 and students appearing in 2026 were eligible. Confirm the 2027 rule in the brochure.",
      ],
    },
    acceptedBy: [
      { name: "NISER Bhubaneswar", detail: "5-year Integrated MSc in Biology, Chemistry, Mathematics and Physics." },
      { name: "UM-DAE CEBS, Mumbai", detail: "5-year Integrated MSc in Biology, Chemistry, Mathematics and Physics." },
    ],
    faqs: [
      { q: "Do I have to attempt all four NEST sections?", a: "You must attempt at least three. Only your best three section scores count, and each counted section must clear its section-wise minimum admissible score." },
      { q: "Is there a scholarship for NISER and CEBS students?", a: "Yes. Students admitted to the Integrated MSc are eligible for the Department of Atomic Energy's DISHA scholarship of ₹60,000 a year plus ₹20,000 a year for summer internships." },
      { q: "Is there negative marking in NEST?", a: "Yes: +3 for a correct answer and −1 for a wrong one. Unanswered questions score 0." },
      { q: "Is there an age limit for NEST?", a: "No. The 2026 brochure states there is no age limit for appearing in NEST or for admission." },
      { q: "Where can I find NEST previous year papers?", a: "The official NEST website (nestexam.in) publishes question papers from recent years." },
    ],
    checkedOn: "2026-10-27",
    verification: "reviewed",
  },
  {
    slug: "comedk",
    name: "COMEDK UGET",
    fullName: "Undergraduate Entrance Test",
    category: "Engineering",
    summary:
      "Explore engineering admission at participating private colleges in Karnataka through COMEDK UGET.",
    opportunity:
      "Compare colleges and branches by location, course fees and your engineering interests.",
    programmes:
      "B.E./B.Tech at participating institutions. Architecture has a separate counselling route.",
    eligibility: [
      "Recognised 10+2/second PUC with Physics, Mathematics, English and an accepted optional science subject. Prescribed aggregate: 45% General Merit; 40% for eligible Karnataka SC/ST/OBC applicants.",
      "Pass required individual subjects from one board. Diploma holders are ineligible. Read the official subject and nationality conditions.",
    ],
    format:
      "180 questions: 60 each in Physics, Chemistry and Mathematics. English medium; +1 correct, no negative marking.",
    syllabus:
      "Physics, Chemistry and Mathematics. See the official exam page for the full syllabus and instructions.",
    fee: "2026: COMEDK-only ₹1,950; combined COMEDK and Uni-GAUGE ₹3,200, plus applicable transaction/handling charges.",
    admission:
      "Centralised online counselling has separate registration, choice filling, payment and college-reporting deadlines.",
    dates: [
      { label: "2026 deadline (extended)", value: "23 March 2026, 4 pm IST" },
      { label: "2026 examination", value: "9 May 2026" },
      { label: "2026 rank cards", value: "29 May 2026, 6 pm IST" },
      {
        label: "Round 4 reporting deadline",
        value: "8 September 2026, 3 pm IST",
      },
    ],
    application: {
      status: "closed",
      label: "Official 2026 engineering login",
      url: "https://cdn.digialm.com/EForms/configuredHtml/1022/97617/login.html",
      note: "2026 exam registration is closed. This is the organiser-linked engineering login; check COMEDK for current counselling instructions.",
    },
    notification: {
      title: "COMEDK UGET 2027 notification awaited",
      detail:
        "2026 counselling has concluded. In 2026 the exam date was announced on 8 January; expect the 2027 notification around the same time.",
      source: {
        label: "COMEDK official counselling updates",
        url: "https://www.comedk.org/",
      },
    },
    sources: [
      {
        label: "2026 eligibility, fees, dates and syllabus",
        url: "https://www.comedk.org/about-uget-and-notification-2026",
      },
      { label: "Institutions and counselling", url: "https://www.comedk.org/" },
    ],
    quickAnswer:
      "COMEDK UGET is the entrance test for B.E./B.Tech admission to around 150 private engineering colleges in Karnataka, with about 20,000 seats. In 2026 it was a 3-hour, English-only computer-based test of 180 questions — 60 each in Physics, Chemistry and Mathematics — with one mark per correct answer and no negative marking.",
    pattern: [
      { label: "Conducted by", value: "COMEDK, for member colleges of KUPECA" },
      { label: "Mode", value: "Computer-based test, English only" },
      { label: "Questions", value: "180: 60 each in Physics, Chemistry and Mathematics" },
      { label: "Duration", value: "3 hours" },
      { label: "Marking", value: "+1 correct, no negative marking; maximum 180" },
      { label: "Syllabus", value: "CBSE-based: about one-third Class 11 and two-thirds Class 12" },
    ],
    seats: "Around 20,000 engineering seats across about 150 colleges (COMEDK, 2026).",
    nextCycle: {
      title: "COMEDK UGET 2027: what is known",
      points: [
        "The 2027 notification has not been released. In 2026 the exam date was announced on 8 January and the test was held on 9 May.",
        "Seats are allotted through COMEDK's centralised online counselling after the rank list.",
      ],
    },
    acceptedBy: [
      { name: "About 150 private engineering colleges in Karnataka", detail: "Members of the Karnataka Unaided Private Engineering Colleges Association (KUPECA), including M. S. Ramaiah Institute of Technology, R. V. College of Engineering, B.M.S. College of Engineering and Siddaganga Institute of Technology." },
      { name: "Uni-GAUGE member universities", detail: "A separate, optional score-based route: apply to each university with your Uni-GAUGE scorecard." },
    ],
    faqs: [
      { q: "Is there negative marking in COMEDK UGET?", a: "No. Each correct answer earns 1 mark and wrong answers cost nothing, so attempt every question." },
      { q: "How many colleges accept COMEDK?", a: "About 150 private engineering colleges in Karnataka, offering around 20,000 seats, according to COMEDK." },
      { q: "Can students from outside Karnataka take COMEDK?", a: "Yes, it is an all-India exam. Karnataka SC/ST/OBC candidates get a lower qualifying aggregate (40% instead of 45%)." },
      { q: "Is there an age limit for COMEDK?", a: "COMEDK says eligibility for B.E./B.Tech follows AICTE and VTU norms; it does not state a separate age limit." },
      { q: "What is the COMEDK syllabus based on?", a: "The CBSE syllabus: roughly 33% from Class 11 and 67% from Class 12 for Physics, Chemistry and Mathematics." },
    ],
    checkedOn: "2026-10-27",
    verification: "reviewed",
  },
];

export function filterExams(query: string, category: string = "All pathways") {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return exams.filter(
    (exam) =>
      (category === "All pathways" || exam.category === category) &&
      words.every((word) =>
        `${exam.name} ${exam.fullName} ${exam.category} ${exam.summary} ${exam.programmes} ${exam.opportunity}`
          .toLowerCase()
          .includes(word),
      ),
  );
}
/** Exam facts change at most a few times a cycle; flag a review older than 45 days. */
export function reviewIsStale(checkedOn: string, now: Date) {
  return (
    now.getTime() - new Date(`${checkedOn}T00:00:00+05:30`).getTime() >
    45 * 24 * 60 * 60 * 1000
  );
}

export function formatReviewDate(checkedOn: string) {
  return new Date(`${checkedOn}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
