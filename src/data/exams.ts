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
      title: "2026 results published",
      detail:
        "NTA lists the result notice and scorecard. Check university admissions separately.",
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
    checkedOn: "2026-09-13",
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
      status: "unverified",
      label: "Official IISER admissions website",
      url: "https://www.iiseradmission.in/",
      note: "The live portal could not be reached during review. Confirm current admissions on the official website; no application link is marked open.",
    },
    notification: {
      title: "Live admissions status needs confirmation",
      detail:
        "Indexed official bulletin information was available; current portal notices could not be checked.",
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
    checkedOn: "2026-09-13",
    verification: "partial",
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
      title: "2026 scorecards for qualified candidates",
      detail:
        "The official site announces access until 30 September 2026; institutes handle admissions merit lists.",
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
    checkedOn: "2026-09-13",
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
      title: "Round 4 reporting deadline has passed",
      detail:
        "The published deadline was 8 September 2026. Check for later official instructions.",
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
    checkedOn: "2026-09-13",
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
export function reviewIsStale(checkedOn: string, now: Date) {
  return (
    now.getTime() - new Date(`${checkedOn}T00:00:00+05:30`).getTime() >
    7 * 24 * 60 * 60 * 1000
  );
}
