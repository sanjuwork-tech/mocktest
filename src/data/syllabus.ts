import type { ExamKey } from "./catalog";
import type { OfficialLink } from "./exams";

// Unit lists are transcribed from the official 2026 syllabus documents linked on each entry.
// Unit names are kept as the exam body prints them; detailed sub-topics live in the official PDF.

export type SyllabusGroup = { title: string; units: string[] };
export type SyllabusSubject = {
  id: string;
  name: string;
  code?: string;
  note?: string;
  groups: SyllabusGroup[];
  source: OfficialLink;
};
export type ExamSyllabus = {
  exam: ExamKey;
  summary: string;
  notes: string[];
  subjects: SyllabusSubject[];
  sources: OfficialLink[];
  checkedOn: string;
};

const CUET = "https://cdnbbsr.s3waas.gov.in/s3d1a21da7bca4abff8b0b61b87597de73/uploads";
const cuetPdf = (name: string, path: string): OfficialLink => ({ label: `Official CUET UG 2026 ${name} syllabus (PDF)`, url: `${CUET}/${path}` });

const NCERT_CHEM_XI = [
  "Some Basic Concepts of Chemistry",
  "Structure of Atom",
  "Classification of Elements and Periodicity in Properties",
  "Chemical Bonding and Molecular Structure",
  "Chemical Thermodynamics",
  "Equilibrium",
  "Redox Reactions",
  "Organic Chemistry – Some Basic Principles and Techniques",
  "Hydrocarbons",
];
const NCERT_CHEM_XII = [
  "Solutions",
  "Electrochemistry",
  "Chemical Kinetics",
  "d and f Block Elements",
  "Coordination Compounds",
  "Haloalkanes and Haloarenes",
  "Alcohols, Phenols and Ethers",
  "Aldehydes, Ketones and Carboxylic Acids",
  "Amines",
  "Biomolecules",
];
const MATHS_XI = ["Sets and Functions", "Algebra", "Coordinate Geometry", "Calculus", "Statistics and Probability"];
const MATHS_XII = [
  "Relations and Functions",
  "Algebra",
  "Calculus",
  "Vectors and Three-Dimensional Geometry",
  "Linear Programming",
  "Probability",
];

export const syllabi: ExamSyllabus[] = [
  {
    exam: "cuet-ug",
    summary:
      "CUET UG domain papers follow the NCERT syllabus. NTA publishes a separate 2026 syllabus for every paper; the units for the 13 papers we offer mocks in are listed below, with the official PDF for each.",
    notes: [
      "Each paper has 50 compulsory questions in 60 minutes, marked +5/−1.",
      "Choose papers from your target universities' course mappings, not from this list alone.",
    ],
    checkedOn: "2026-10-28",
    sources: [{ label: "CUET UG 2026 syllabus page (NTA)", url: "https://cuet.nta.nic.in/cuetug-2026-syllabus/" }],
    subjects: [
      {
        id: "english",
        name: "English",
        code: "101",
        groups: [
          { title: "Reading comprehension", units: ["Factual passages (up to 300 words)", "Narrative passages", "Literary passages"] },
          { title: "Verbal ability", units: ["Rearranging the parts", "Match the following", "Choosing the correct word", "Synonyms and antonyms"] },
        ],
        source: cuetPdf("English", "2025/12/20251227980877010.pdf"),
      },
      {
        id: "general-test",
        name: "General Aptitude Test",
        code: "501",
        groups: [
          {
            title: "Topics",
            units: [
              "General knowledge and current affairs",
              "General mental ability and numerical ability",
              "Quantitative reasoning: arithmetic, algebra, geometry, mensuration, statistics",
              "Logical and analytical reasoning",
              "General science and environment literacy",
            ],
          },
        ],
        source: cuetPdf("General Aptitude Test", "2025/12/20251227140287889.pdf"),
      },
      {
        id: "physics",
        name: "Physics",
        code: "322",
        groups: [
          {
            title: "Units",
            units: [
              "Electrostatics",
              "Current Electricity",
              "Magnetic Effects of Current and Magnetism",
              "Electromagnetic Induction and Alternating Currents",
              "Electromagnetic Waves",
              "Optics",
              "Dual Nature of Matter and Radiation",
              "Atoms and Nuclei",
              "Electronic Devices",
            ],
          },
        ],
        source: cuetPdf("Physics", "2025/12/202512271334142557.pdf"),
      },
      {
        id: "chemistry",
        name: "Chemistry",
        code: "306",
        groups: [{ title: "Units", units: NCERT_CHEM_XII }],
        source: cuetPdf("Chemistry", "2025/12/20251227437950608.pdf"),
      },
      {
        id: "mathematics",
        name: "Mathematics / Applied Mathematics",
        code: "319",
        note: "Section A1 is common; then answer either Section B1 (Mathematics) or Section B2 (Applied Mathematics).",
        groups: [
          {
            title: "Section A1 (common)",
            units: ["Algebra", "Calculus", "Integration and its Applications", "Differential Equations", "Probability Distributions", "Linear Programming"],
          },
          { title: "Section B1: Mathematics", units: MATHS_XII },
          {
            title: "Section B2: Applied Mathematics",
            units: [
              "Numbers, Quantification and Numerical Applications",
              "Algebra",
              "Calculus",
              "Probability Distributions",
              "Time-Based Data",
              "Inferential Statistics",
              "Financial Mathematics",
              "Linear Programming",
            ],
          },
        ],
        source: cuetPdf("Mathematics", "2025/12/202512271521179041.pdf"),
      },
      {
        id: "biology",
        name: "Biology / Biological Science",
        code: "304",
        groups: [
          {
            title: "Units",
            units: ["Reproduction", "Genetics and Evolution", "Biology and Human Welfare", "Biotechnology and its Applications", "Ecology and Environment"],
          },
        ],
        source: cuetPdf("Biology", "2025/12/20251227553390532.pdf"),
      },
      {
        id: "accountancy",
        name: "Accountancy / Book Keeping",
        code: "301",
        groups: [
          {
            title: "Units",
            units: [
              "Accounting for Partnership",
              "Reconstitution of a Partnership Firm",
              "Dissolution of Partnership Firm",
              "Company Accounts: Accounting for Share and Debenture Capital",
              "Analysis of Financial Statements",
              "Computerised Accounting System",
            ],
          },
        ],
        source: cuetPdf("Accountancy", "2025/12/20251227522720880.pdf"),
      },
      {
        id: "computer-science",
        name: "Computer Science / Informatics Practices",
        code: "308",
        note: "Section A is common; then answer either Section B1 (Computer Science) or Section B2 (Informatics Practices).",
        groups: [
          { title: "Section A (common)", units: ["Database Concepts", "Structured Query Language – I", "Structured Query Language – II", "Computer Networks"] },
          {
            title: "Section B1: Computer Science",
            units: [
              "Exception and File Handling in Python",
              "Stack",
              "Queue",
              "Searching",
              "Sorting",
              "Understanding Data",
              "Database Concepts",
              "Structured Query Language",
              "Computer Networks",
              "Data Communication",
              "Security Aspects",
            ],
          },
          {
            title: "Section B2: Informatics Practices",
            units: [
              "Database Query using SQL",
              "Data Handling using Pandas – I",
              "Data Handling using Pandas – II",
              "Plotting Data using Matplotlib",
              "Introduction to Computer Networks",
              "Societal Impacts",
              "Project Based Learning",
            ],
          },
        ],
        source: cuetPdf("Computer Science", "2025/12/202512271589155179.pdf"),
      },
      {
        id: "economics",
        name: "Economics / Business Economics",
        code: "309",
        groups: [
          {
            title: "Introductory Microeconomics",
            units: ["Introduction and Theory of Consumer Behaviour", "Production and Costs", "Theory of the Firm under Perfect Competition", "Market Equilibrium and Simple Applications"],
          },
          {
            title: "Introductory Macroeconomics",
            units: ["National Income Accounting", "Money and Banking", "Determination of Income and Employment", "Government Budget and the Economy", "Open Economy Macroeconomics"],
          },
          {
            title: "Indian Economic Development",
            units: [
              "Development Policies and Experience (1947–90)",
              "Economic Reforms since 1991",
              "Current Challenges facing the Indian Economy",
              "Development Experiences of India: a comparison with neighbours",
            ],
          },
        ],
        source: cuetPdf("Economics", "2025/12/202512271366341541.pdf"),
      },
      {
        id: "geography",
        name: "Geography / Geology",
        code: "313",
        groups: [
          {
            title: "Fundamentals of Human Geography",
            units: ["Human Geography: Nature and Scope", "People", "Human Activities", "Transport, Communication and Trade"],
          },
          {
            title: "India: People and Economy",
            units: ["People", "Human Settlements", "Resources and Development", "Transport, Communication and International Trade", "Geographical Perspective on Selected Issues and Problems"],
          },
        ],
        source: cuetPdf("Geography", "2025/12/20251227925964065.pdf"),
      },
      {
        id: "history",
        name: "History",
        code: "314",
        groups: [
          {
            title: "Themes in Indian History, Part I",
            units: ["Harappan Civilisation and Archaeology", "Political and Economic Systems in Early States: Inscriptional Evidences", "Social Histories of Early Societies: Mahabharata", "History of Buddhism and Jainism: Cultural Developments"],
          },
          {
            title: "Themes in Indian History, Part II",
            units: ["Medieval Society through Travellers' Accounts", "Religious History: Bhakti-Sufi Traditions", "Vijayanagara Empire: Politics, Economy and Architecture", "The Mughal Empire and Agrarian Society"],
          },
          {
            title: "Themes in Indian History, Part III",
            units: ["Colonialism and Rural Society: Evidence from Official Reports", "Revolt of 1857: Patterns and Representations", "Mahatma Gandhi and National Movements", "The Making of the Constitution"],
          },
        ],
        source: cuetPdf("History", "2025/12/20251227167662981.pdf"),
      },
      {
        id: "mass-media",
        name: "Mass Media / Mass Communication",
        code: "318",
        groups: [
          { title: "Units", units: ["Communication", "Journalism", "Advertising and Public Relations", "TV Production Process and Programmes", "Radio", "Cinema", "Social Media", "New Media"] },
        ],
        source: cuetPdf("Mass Media", "2025/12/20251227328972301.pdf"),
      },
      {
        id: "political-science",
        name: "Political Science",
        code: "323",
        groups: [
          {
            title: "Politics in India since Independence",
            units: [
              "Era of One-Party Dominance",
              "Nation-Building and its Problems",
              "Politics of Planned Development",
              "India's External Relations",
              "Challenge to and Restoration of the Congress System",
              "Crises of the Constitutional Order",
              "Regional Aspirations and Conflicts",
              "Democratic Upsurge and Coalition Politics",
              "Recent Issues and Challenges",
            ],
          },
          {
            title: "Contemporary World Politics",
            units: [
              "Disintegration of the 'Second World' and the Collapse of Bipolarity",
              "Alternative Centres of Economic and Political Power",
              "South Asia in the Post-Cold War Era",
              "International Organisations in a Unipolar World",
              "Security in the Contemporary World",
              "Environment and Natural Resources in Global Politics",
              "Globalisation and its Critics",
            ],
          },
        ],
        source: cuetPdf("Political Science", "2025/12/20251227158639183.pdf"),
      },
    ],
  },
  {
    exam: "iiser-iat",
    summary:
      "The IAT 2026 brochure does not include a unit-wise syllabus. The test has 15 questions each in Biology, Chemistry, Mathematics and Physics, so most students prepare from the Class 11 and 12 NCERT textbooks in all four subjects.",
    notes: [
      "Because there is no official unit list, we don't publish one as if it were official. The NEST and COMEDK syllabi below are useful references for Class 11–12 science coverage.",
      "Check the 2027 brochure when it is released; a syllabus may be added.",
    ],
    checkedOn: "2026-10-28",
    sources: [{ label: "IAT 2026 Information Brochure", url: "https://www.iiseradmission.in/assets/pdfs/IB_IAT_2026_ENG.pdf" }],
    subjects: [],
  },
  {
    exam: "niser-nest",
    summary:
      "NEST publishes a detailed 2026 syllabus covering Class 11 and 12 Biology, Chemistry, Mathematics and Physics. You answer at least three sections, and your best three count.",
    notes: ["Calculators and log tables are not allowed, so practise arithmetic by hand.", "The official PDF lists every sub-topic under these units."],
    checkedOn: "2026-10-28",
    sources: [{ label: "NEST 2026 syllabus (PDF)", url: "https://www.nestexam.in/docs/26/NEST2026_Syllabus.pdf" }],
    subjects: [
      {
        id: "biology",
        name: "Biology",
        groups: [
          { title: "Class XI", units: ["Diversity of Living Organisms", "Structural Organization in Plants and Animals", "Cell: Structure and Function", "Plant Physiology", "Human Physiology"] },
          { title: "Class XII", units: ["Reproduction", "Genetics and Evolution", "Biology and Human Welfare", "Biotechnology and its Applications", "Ecology and Environment"] },
        ],
        source: { label: "NEST 2026 syllabus (PDF)", url: "https://www.nestexam.in/docs/26/NEST2026_Syllabus.pdf" },
      },
      {
        id: "chemistry",
        name: "Chemistry",
        groups: [
          { title: "Class XI", units: NCERT_CHEM_XI },
          { title: "Class XII", units: NCERT_CHEM_XII },
        ],
        source: { label: "NEST 2026 syllabus (PDF)", url: "https://www.nestexam.in/docs/26/NEST2026_Syllabus.pdf" },
      },
      {
        id: "mathematics",
        name: "Mathematics",
        groups: [
          { title: "Class XI", units: MATHS_XI },
          { title: "Class XII", units: MATHS_XII },
        ],
        source: { label: "NEST 2026 syllabus (PDF)", url: "https://www.nestexam.in/docs/26/NEST2026_Syllabus.pdf" },
      },
      {
        id: "physics",
        name: "Physics",
        groups: [
          {
            title: "Class XI",
            units: [
              "Units and Measurements",
              "Motion in a Straight Line",
              "Motion in a Plane",
              "Laws of Motion",
              "Work, Energy and Power",
              "System of Particles and Rotational Motion",
              "Gravitation",
              "Mechanical Properties of Solids",
              "Mechanical Properties of Fluids",
              "Thermal Properties of Matter",
              "Thermodynamics",
              "Kinetic Theory of Gases",
              "Oscillations",
              "Waves",
            ],
          },
          {
            title: "Class XII",
            units: [
              "Electric Charges and Fields",
              "Electrostatic Potential and Capacitance",
              "Current Electricity",
              "Moving Charges and Magnetism",
              "Magnetism and Matter",
              "Electromagnetic Induction",
              "Alternating Current",
              "Electromagnetic Waves",
              "Ray Optics",
              "Wave Optics",
              "Dual Nature of Radiation and Matter",
              "Atoms",
              "Nuclei",
              "Semiconductor Electronics: Materials, Devices and Simple Circuits",
            ],
          },
        ],
        source: { label: "NEST 2026 syllabus (PDF)", url: "https://www.nestexam.in/docs/26/NEST2026_Syllabus.pdf" },
      },
    ],
  },
  {
    exam: "comedk",
    summary:
      "COMEDK UGET follows the CBSE syllabus, weighted about one-third Class 11 and two-thirds Class 12, across Physics, Chemistry and Mathematics. COMEDK publishes a 2026 syllabus PDF for each subject.",
    notes: ["180 questions, 60 per subject, in 3 hours with no negative marking.", "The official PDFs list every sub-topic under these units."],
    checkedOn: "2026-10-28",
    sources: [{ label: "COMEDK UGET 2026 syllabus and pattern", url: "https://www.comedk.org/about-uget-and-notification-2026" }],
    subjects: [
      {
        id: "physics",
        name: "Physics",
        groups: [
          {
            title: "Class XI (about 33%)",
            units: [
              "Physical World and Measurement",
              "Kinematics",
              "Laws of Motion",
              "Work, Energy and Power",
              "Motion of System of Particles and Rigid Body",
              "Gravitation",
              "Properties of Bulk Matter",
              "Thermodynamics",
              "Behaviour of Perfect Gases and Kinetic Theory of Gases",
              "Oscillations and Waves",
            ],
          },
          {
            title: "Class XII (about 67%)",
            units: [
              "Electrostatics",
              "Current Electricity",
              "Magnetic Effects of Current and Magnetism",
              "Electromagnetic Induction and Alternating Currents",
              "Electromagnetic Waves",
              "Optics",
              "Dual Nature of Matter and Radiation",
              "Atoms and Nuclei",
              "Electronic Devices",
            ],
          },
        ],
        source: { label: "COMEDK 2026 Physics syllabus (PDF)", url: "https://www.comedk.org/uploads/Physics-syllabus-2026.pdf" },
      },
      {
        id: "chemistry",
        name: "Chemistry",
        groups: [
          { title: "Class XI (about 33%)", units: NCERT_CHEM_XI },
          { title: "Class XII (about 67%)", units: NCERT_CHEM_XII },
        ],
        source: { label: "COMEDK 2026 Chemistry syllabus (PDF)", url: "https://www.comedk.org/uploads/Chemistry-syllabus-2026.pdf" },
      },
      {
        id: "mathematics",
        name: "Mathematics",
        groups: [
          { title: "Class XI (about 33%)", units: MATHS_XI },
          { title: "Class XII (about 67%)", units: MATHS_XII },
        ],
        source: { label: "COMEDK 2026 Mathematics syllabus (PDF)", url: "https://www.comedk.org/uploads/Mathematics-syllabus-2026_final.pdf" },
      },
    ],
  },
];

export const syllabusFor = (exam: string) => syllabi.find((s) => s.exam === exam);
