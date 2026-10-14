export type BlogPost = {
  slug: string;
  title: string;
  subtitle: string;
  examSlug: "cuet-ug" | "iiser-iat" | "niser-nest" | "comedk";
  publishedDate: string;
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
    callout?: string;
  }[];
  relatedExams: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-prepare-for-cuet-ug-2027",
    title: "How to Prepare for CUET UG 2027: Complete Syllabus, Best Books & 6-Month Roadmap",
    subtitle: "A step-by-step master strategy for cracking North Campus DU, BHU, and Central Universities with 99+ percentile in domain subjects.",
    examSlug: "cuet-ug",
    publishedDate: "October 14, 2026",
    readTime: "8 min read",
    author: "Academic Advisory Team",
    authorRole: "CUET Exam Mentors, OurMocks",
    category: "Exam Strategy",
    badge: "2027 Preparation Guide",
    summary:
      "CUET UG has fundamentally shifted university admissions in India. Learn how to align your Class 12 board preparations with NTA’s domain test demands, master time management, and leverage full-length mock tests.",
    keyTakeaways: [
      "CUET questions strictly follow Class 12 NCERT textbooks; avoid straying into unnecessary Class 11 theory for domain papers.",
      "The 50 questions in 60 minutes timing requires an answering speed of approximately 70 seconds per question including review.",
      "Official NTA marking awards +5 for correct answers and −1 for incorrect answers (250 marks total per paper); unattempted questions earn 0.",
      "Practicing real full-length CBT tests is critical to prevent fatigue during multi-shift testing days.",
    ],
    contentSections: [
      {
        heading: "1. Understanding the CUET UG 2027 Pattern",
        body: [
          "The Common University Entrance Test (CUET UG) conducted by the National Testing Agency consists of three core sections: Section IA/IB (Languages), Section II (Domain-Specific Subjects), and Section III (General Test).",
          "For domain subjects like Mathematics, Physics, Chemistry, Accountancy, and Economics, candidates face 50 questions to be completed within 60 minutes. Under official NTA scoring, each correct answer earns +5 marks, incorrect answers attract a −1 mark penalty, yielding 250 maximum marks per subject.",
        ],
        callout:
          "Pro Tip: Top colleges like SRCC, St. Stephen's, and Hindu College require composite domain percentiles above 98.5%. Consistency in NCERT line-by-line reading is what separates toppers from average scorers.",
      },
      {
        heading: "2. The 6-Month Phased Study Plan",
        body: [
          "Months 1–3 (Board & Domain Synergy): Focus entirely on completing Class 12 NCERT chapters thoroughly. Solve back-of-chapter exemplar problems and highlight critical formulas, definitions, and chronological timelines in your notes.",
          "Months 4–5 (Speed Drills & Question Palette): Transition from subjective writing to objective multiple-choice practice. Practice eliminating wrong options and tracking your answering speed per question.",
          "Month 6 (Full-Length Mocks & Pacing Analysis): Dedicate this phase to writing full 50-question mock papers at the same time of day as your assigned exam shift.",
        ],
      },
      {
        heading: "3. Best Resources & Practice Guidelines",
        body: [
          "NCERT Textbooks & NCERT Exemplar: The absolute gold standard. Over 90% of direct questions in Science and Commerce domains are sourced straight from NCERT lines.",
          "Full-Length Online Test Simulator: Attempt our 100% free full-length CUET UG tests on OurMocks across all 13 domain subjects with authentic CBT countdowns and per-question timers.",
        ],
      },
    ],
    relatedExams: ["cuet-ug", "comedk"],
  },
  {
    slug: "iiser-iat-2027-pcmb-strategy-research-admissions",
    title: "IISER IAT 2027 Strategy: How to Score High Across PCMB for IISc & IISERs",
    subtitle: "Why non-medical students shouldn't fear Biology, why medical students shouldn't skip Maths, and how to conquer research-aptitude questions.",
    examSlug: "iiser-iat",
    publishedDate: "October 14, 2026",
    readTime: "9 min read",
    author: "Science Research Faculty",
    authorRole: "IISER Alumni & Research Mentors",
    category: "Science & Research",
    badge: "2027 Research Admissions",
    summary:
      "The IISER Aptitude Test (IAT) is India's gateway to cutting-edge science degrees at IISc Bangalore, 7 IISERs, and IIT Madras. Here is the definitive cross-subject preparation formula.",
    keyTakeaways: [
      "IAT tests 60 questions: exactly 15 each across Physics, Chemistry, Mathematics, and Biology.",
      "Attempting all 4 subjects is compulsory on paper, but strategic scoring in 3 strong subjects plus high-yield chapters in the 4th subject easily secures top IISER branches.",
      "Unlike JEE Main which prioritizes speed tricks, IAT questions reward deep conceptual clarity and experimental data interpretation.",
      "Admitted students are eligible for prestigious INSPIRE / DISHA government research scholarships.",
    ],
    contentSections: [
      {
        heading: "1. The Cross-Disciplinary Nature of IAT",
        body: [
          "Modern science is deeply interdisciplinary. Quantum computing needs physicists and mathematicians; drug discovery needs chemists and molecular biologists. This is why the Joint Admissions Committee tests all four foundational sciences.",
          "The test comprises 60 questions in 180 minutes (3 hours). With +4 for correct and −1 for incorrect, a total score above 135–150 out of 240 has historically secured admission to premier campuses like IISER Pune, IISER Kolkata, and IISER Mohali.",
        ],
        callout:
          "Strategic Insight: If you are a PCM student, preparing just Class 12 Genetics, Biotechnology, and Ecology in Biology can net you an extra 24–32 marks with minimal effort, rocketing your all-India rank.",
      },
      {
        heading: "2. Subject-by-Subject Strategy",
        body: [
          "Physics: Focus on conceptual mechanics, optics, thermodynamics, and electrodynamics. Questions frequently ask about graphical dependencies and physical constraints rather than brute calculations.",
          "Chemistry: Physical Chemistry and Organic mechanisms require thorough conceptual grounding. Inorganic Chemistry questions closely track NCERT tables and anomalous trends.",
          "Mathematics: High emphasis on Functions, Calculus, Vectors & 3D, Combinatorics, and Probability.",
          "Biology: For non-bio students, prioritize Genetics & Evolution, Molecular Basis of Inheritance, Biotechnology, and Cell Biology.",
        ],
      },
    ],
    relatedExams: ["iiser-iat", "niser-nest"],
  },
  {
    slug: "niser-nest-2027-sectional-cutoffs-mastery",
    title: "NISER NEST 2027 Strategy: Mastering Sectional Cutoffs & DAE Science Fellowships",
    subtitle: "Everything you need to know about cracking NISER Bhubaneswar and UM-DAE CEBS Mumbai with guaranteed ₹60,000/yr DISHA scholarships.",
    examSlug: "niser-nest",
    publishedDate: "October 14, 2026",
    readTime: "8 min read",
    author: "DAE Advisory Circle",
    authorRole: "NISER & CEBS Alumni",
    category: "Science & Research",
    badge: "2027 Nuclear & Basic Sciences",
    summary:
      "NEST is celebrated for testing rigorous, analytical problem-solving in science. Learn the mechanics of Section-wise Minimum Admissible Scores (SMAS) and how to secure admission to DAE institutes.",
    keyTakeaways: [
      "NEST comprises four 20-question sections (Biology, Chemistry, Mathematics, Physics), lasting 210 minutes.",
      "To be included in the merit list, candidates must clear both Section-wise Minimum Admissible Scores (SMAS) and the Minimum Admissible Score in aggregate (MAS).",
      "All admitted students receive the prestigious ₹60,000/yr DISHA scholarship + ₹20,000 summer project contingency grant.",
      "Graduates have direct interview privileges for Scientific Officer Grade C roles in Bhabha Atomic Research Centre (BARC).",
    ],
    contentSections: [
      {
        heading: "1. Demystifying the SMAS Scoring System",
        body: [
          "Unlike standard entrance exams where high marks in one subject can mask a zero in another, NEST mandates that candidates clear a qualifying cutoff in every individual section attempted.",
          "The best three section scores out of the four are considered for final percentile ranking, provided the section cutoff criteria are satisfied. This offers immense flexibility if one subject is exceptionally challenging for you.",
        ],
        callout:
          "Career Highlight: NISER and CEBS graduates represent India's scientific backbone. Many transition directly into CERN, Max Planck Institutes, or BARC without separate written entrance exams.",
      },
      {
        heading: "2. Key Preparation Recommendations",
        body: [
          "Do not rely solely on single-choice rote MCQs. Practice multi-concept questions where a physics principle leads into a mathematical differential equation.",
          "Time allocation: 210 minutes gives you over 2.5 minutes per question. Pace yourself deliberately; accuracy is vastly more critical than speed in NEST.",
        ],
      },
    ],
    relatedExams: ["niser-nest", "iiser-iat"],
  },
  {
    slug: "comedk-2027-speed-hacks-rvce-bmsce-admissions",
    title: "COMEDK UGET 2027: 1 Question Per Minute Speed Hacks for Top Bengaluru Engineering",
    subtitle: "How to score 130+ in COMEDK without negative marking to secure Computer Science at RVCE, BMSCE, or MSRIT.",
    examSlug: "comedk",
    publishedDate: "October 14, 2026",
    readTime: "7 min read",
    author: "Engineering Admissions Desk",
    authorRole: "Karnataka Engineering Mentors",
    category: "Engineering",
    badge: "2027 Tech Admissions",
    summary:
      "COMEDK UGET offers open, all-India entry to Karnataka's premier private tech universities without reservation quotas. Master the high-speed PCM tactics needed for Bengaluru's top tech campuses.",
    keyTakeaways: [
      "180 questions (60 Physics, 60 Chemistry, 60 Maths) in 180 minutes: exactly 60 seconds per question.",
      "ZERO negative marking: you must attempt every single question on the paper before the timer expires.",
      "A score of 125–140+ historically secures Computer Science & Engineering at RV College of Engineering (RVCE).",
      "Bengaluru’s tech ecosystem provides campus placement averages surpassing ₹15–20 LPA for top COMEDK branches.",
    ],
    contentSections: [
      {
        heading: "1. The 60-Second Execution Blueprint",
        body: [
          "The greatest mistake students make in COMEDK is treating it like JEE Advanced. There are no lengthy multi-page derivations. Most questions test formula substitution, dimensional analysis, and standard property recall.",
          "Round 1 (Minutes 0–90): Solve all direct questions across Chemistry and standard Physics/Maths. Aim to clear 100+ straightforward questions here.",
          "Round 2 (Minutes 90–160): Tackle multi-step calculation problems.",
          "Round 3 (Minutes 160–180): With no negative marking, eliminate extreme choices and guess on remaining questions.",
        ],
        callout:
          "Placement Reality: RVCE and BMSCE place hundreds of students annually in top tech companies like Google, Microsoft, Amazon, and Adobe with salary packages rivaling premier NITs.",
      },
      {
        heading: "2. High-Yield Chapter Priorities",
        body: [
          "Mathematics: Matrices & Determinants, Vectors & 3D Geometry, Definite Integrals, Differential Equations, and Coordinate Geometry.",
          "Physics: Current Electricity, Modern Physics, Semiconductor Devices, Ray Optics, and Work-Power-Energy.",
          "Chemistry: Solutions, Electrochemistry, Chemical Kinetics, Coordination Compounds, and Named Organic Reactions.",
        ],
      },
    ],
    relatedExams: ["comedk", "cuet-ug"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
