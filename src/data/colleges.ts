import type { ExamKey } from "./catalog";

export type College = {
  id: string;
  examSlug: ExamKey;
  name: string;
  shortName: string;
  location: string;
  state: string;
  nirfRank?: string;
  badge: string;
  imageUrl: string;
  overview: string;
  popularCourses: string[];
  keyHighlights: string[];
  officialUrl: string;
  intakeSeats?: string;
};

export const collegesData: College[] = [
  // ── CUET UG Colleges & Universities ──────────────────────────────────
  {
    id: "du-north-campus",
    examSlug: "cuet-ug",
    name: "University of Delhi (North Campus)",
    shortName: "Delhi University (DU)",
    location: "New Delhi",
    state: "Delhi",
    nirfRank: "Rank #6 (Universities)",
    badge: "India's Premier Central University",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80",
    overview:
      "Home to legendary institutions like St. Stephen's, SRCC, Hindu College, and Miranda House. Delhi University attracts over 300,000 CUET applicants annually for prestigious arts, commerce, and natural science degrees.",
    popularCourses: [
      "B.Com (Hons)",
      "B.A. (Hons) Economics",
      "B.A. (Hons) Political Science",
      "B.Sc (Hons) Computer Science",
      "B.Sc (Hons) Physics / Mathematics",
    ],
    keyHighlights: [
      "Top corporate campus recruitment across BCG, McKinsey, Bain, and Big 4",
      "Active debating societies, student politics, and vibrant cultural fest circuit",
      "Central library access with over 1.5 million academic publications",
    ],
    officialUrl: "https://www.du.ac.in",
    intakeSeats: "70,000+ across all constituent colleges",
  },
  {
    id: "bhu-varanasi",
    examSlug: "cuet-ug",
    name: "Banaras Hindu University",
    shortName: "BHU Varanasi",
    location: "Varanasi",
    state: "Uttar Pradesh",
    nirfRank: "Rank #5 (Universities)",
    badge: "1,300-Acre Heritage Campus",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80",
    overview:
      "One of Asia's largest residential universities, founded by Mahamana Pandit Madan Mohan Malaviya. BHU offers premier education in Agriculture, Sciences, Social Sciences, Performing Arts, and Commerce through CUET.",
    popularCourses: [
      "B.Sc (Hons) Agriculture",
      "B.Sc (Hons) Mathematics / Bio Group",
      "B.Com (Hons) / Financial Markets",
      "B.A. (Hons) Social Sciences",
    ],
    keyHighlights: [
      "Sir Sunderlal Hospital on-campus providing clinical research exposure",
      "Renowned Institute of Agricultural Sciences with dedicated research farms",
      "Highly affordable academic and hostel accommodations",
    ],
    officialUrl: "https://www.bhu.ac.in",
    intakeSeats: "12,000+ UG Seats",
  },
  {
    id: "jnu-delhi",
    examSlug: "cuet-ug",
    name: "Jawaharlal Nehru University",
    shortName: "JNU New Delhi",
    location: "New Delhi",
    state: "Delhi",
    nirfRank: "Rank #2 (Universities)",
    badge: "Research & Foreign Languages Hub",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
    overview:
      "Globally acclaimed for linguistics, international studies, and computational sciences. JNU admits UG students via CUET into its School of Language, Literature & Culture Studies and COP programs.",
    popularCourses: [
      "B.A. (Hons) Foreign Languages (Japanese, Korean, German, French, Arabic)",
      "B.Sc - M.Sc Integrated Ayurveda Biology",
      "Certificate of Proficiency (COP) Programmes",
    ],
    keyHighlights: [
      "High diplomatic and embassy placement for language specialists",
      "Vibrant intellectual discourse and seminar culture",
      "Heavily subsidised tuition and campus hostel facilities",
    ],
    officialUrl: "https://www.jnu.ac.in",
    intakeSeats: "1,200+ UG Seats",
  },
  {
    id: "uoh-hyderabad",
    examSlug: "cuet-ug",
    name: "University of Hyderabad",
    shortName: "Hyderabad Central University (HCU)",
    location: "Hyderabad",
    state: "Telangana",
    nirfRank: "Rank #10 (Universities)",
    badge: "Premier Integrated Master's",
    imageUrl: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1000&q=80",
    overview:
      "A serene 2,300-acre biodiversity campus in Gachibowli, Hyderabad's IT hub. UoH offers highly sought-after 5-year Integrated M.Sc and Integrated M.A. programs via CUET UG.",
    popularCourses: [
      "5-Year Integrated M.Sc (Mathematical Sciences, Physics, Chemical Sciences)",
      "5-Year Integrated M.Sc Systems Biology",
      "5-Year Integrated M.A. (Economics, History, Political Science)",
    ],
    keyHighlights: [
      "Immediate proximity to Hyderabad's genome valley and tech corridor",
      "Strong research output with high publication metrics per faculty",
      "Advanced computational and laser spectroscopy facilities",
    ],
    officialUrl: "https://uohyd.ac.in",
    intakeSeats: "850+ Integrated UG/PG Seats",
  },

  // ── IISER IAT Colleges & Institutes ──────────────────────────────────
  {
    id: "iisc-bangalore",
    examSlug: "iiser-iat",
    name: "Indian Institute of Science (IISc)",
    shortName: "IISc Bangalore",
    location: "Bengaluru",
    state: "Karnataka",
    nirfRank: "Rank #1 (Universities & Overall)",
    badge: "India's Apex Research Institution",
    imageUrl: "https://images.unsplash.com/photo-1568792923760-d70635a89fa7?auto=format&fit=crop&w=1000&q=80",
    overview:
      "Founded in 1909 with support from Jamsetji Tata and Swami Vivekananda. IISc accepts IAT scores for its flagship 4-year Bachelor of Science (Research) program across Physics, Chemistry, Mathematics, Biology, Materials, and Earth Science.",
    popularCourses: [
      "4-Year Bachelor of Science (Research)",
      "Interdisciplinary Science & Engineering Minor",
      "Computational Biology & AI Minor",
    ],
    keyHighlights: [
      "World top-150 global research ranking with peerless citation density",
      "KVPY / INSPIRE / Institute scholarship for admitted students",
      "Direct pathway to premier PhD programs at Princeton, MIT, Caltech, Cambridge",
    ],
    officialUrl: "https://iisc.ac.in",
    intakeSeats: "130 BS (Research) Seats",
  },
  {
    id: "iiser-pune",
    examSlug: "iiser-iat",
    name: "IISER Pune",
    shortName: "IISER Pune",
    location: "Pune",
    state: "Maharashtra",
    nirfRank: "Rank #27 (Overall)",
    badge: "Flagship IISER Campus",
    imageUrl: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?auto=format&fit=crop&w=1000&q=80",
    overview:
      "An autonomous institution established by the Ministry of Education to integrate scientific research into undergraduate education. Features world-class NMR facilities, clean rooms, and computational clusters.",
    popularCourses: [
      "5-Year BS-MS Dual Degree (Natural Sciences)",
      "Integrated PhD in Bio, Chem, Phys, Math",
      "Data Science & Scientific Computing",
    ],
    keyHighlights: [
      "Undergraduate students publish peer-reviewed research papers in international journals",
      "Collaborative research projects with NCL Pune, IUCAA, and CERN",
      "Centrally air-conditioned campus with modern student housing",
    ],
    officialUrl: "https://www.iiserpune.ac.in",
    intakeSeats: "288 BS-MS Seats",
  },
  {
    id: "iiser-kolkata",
    examSlug: "iiser-iat",
    name: "IISER Kolkata",
    shortName: "IISER Kolkata",
    location: "Mohanpur, Nadia",
    state: "West Bengal",
    nirfRank: "Top Research Institute",
    badge: "Astrophysics & Chemical Science Excellence",
    imageUrl: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1000&q=80",
    overview:
      "Home to the Center of Excellence in Space Sciences India (CESSI), which contributes to ISRO solar missions including Aditya-L1. Excellent foundation in chemical and earth sciences.",
    popularCourses: [
      "5-Year BS-MS (Physical, Chemical, Biological, Earth & Mathematical Sciences)",
      "Space Physics & Computational Astrophysics",
    ],
    keyHighlights: [
      "Lead institute for space weather monitoring and astronomical instrumentation",
      "High proportion of graduates receiving DAAD, Charpak, and Rhodes scholarships",
      "Expansive 200-acre residential campus with state-of-the-art laboratories",
    ],
    officialUrl: "https://www.iiserkol.ac.in",
    intakeSeats: "250 BS-MS Seats",
  },
  {
    id: "iit-madras-science",
    examSlug: "iiser-iat",
    name: "Indian Institute of Technology Madras",
    shortName: "IIT Madras (via IAT)",
    location: "Chennai",
    state: "Tamil Nadu",
    nirfRank: "Rank #1 (Engineering & Overall)",
    badge: "Medical Sciences & Engineering",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80",
    overview:
      "IIT Madras accepts IISER IAT scores for admission to its groundbreaking 4-year BS in Medical Sciences & Engineering, combining engineering design with clinical and biomedical technology.",
    popularCourses: [
      "4-Year BS in Medical Sciences & Engineering",
      "Biomedical Device Innovation",
    ],
    keyHighlights: [
      "Collaborative training with leading hospital chains and medical device incubators",
      "World-class IIT Madras Research Park ecosystem",
      "High industry demand in healthcare robotics, AI diagnostics, and biomedical implants",
    ],
    officialUrl: "https://www.iitm.ac.in",
    intakeSeats: "30 BS Seats via IAT",
  },

  // ── NISER NEST Colleges & Institutes ─────────────────────────────────
  {
    id: "niser-bhubaneswar",
    examSlug: "niser-nest",
    name: "National Institute of Science Education and Research",
    shortName: "NISER Bhubaneswar",
    location: "Jatni, Khurda",
    state: "Odisha",
    nirfRank: "DAE Centre of Excellence",
    badge: "Department of Atomic Energy (DAE)",
    imageUrl: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1000&q=80",
    overview:
      "Directly funded by the Department of Atomic Energy, Government of India. NISER prepares elite scientists for India's nuclear, space, and fundamental science initiatives. Every admitted student receives the ₹60,000/yr DISHA scholarship.",
    popularCourses: [
      "5-Year Integrated M.Sc (Physics)",
      "5-Year Integrated M.Sc (Chemistry)",
      "5-Year Integrated M.Sc (Biology)",
      "5-Year Integrated M.Sc (Mathematics)",
      "5-Year Integrated M.Sc (Computer Sciences)",
    ],
    keyHighlights: [
      "Guaranteed DISHA scholarship of ₹5,000/month plus ₹20,000 summer internship grant",
      "Direct interview eligibility for BARC Training School scientific officer positions",
      "Picturesque 300-acre residential campus with cutting-edge national laboratories",
    ],
    officialUrl: "https://www.niser.ac.in",
    intakeSeats: "200 Integrated MSc Seats",
  },
  {
    id: "um-dae-cebs",
    examSlug: "niser-nest",
    name: "UM-DAE Centre for Excellence in Basic Sciences",
    shortName: "CEBS Mumbai",
    location: "Kalina, Mumbai",
    state: "Maharashtra",
    nirfRank: "DAE Joint Institute",
    badge: "Mumbai University & DAE Center",
    imageUrl: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1000&q=80",
    overview:
      "A joint initiative of the Department of Atomic Energy and the University of Mumbai, situated on the lush Kalina campus. Features high faculty-to-student ratios with mentors from TIFR, BARC, and IIT Bombay.",
    popularCourses: [
      "5-Year Integrated M.Sc in Physical Sciences",
      "5-Year Integrated M.Sc in Chemical Sciences",
      "5-Year Integrated M.Sc in Mathematical Sciences",
      "5-Year Integrated M.Sc in Life Sciences",
    ],
    keyHighlights: [
      "₹60,000 annual DISHA scholarship + ₹20,000 contingency for all admitted candidates",
      "Summer research training at TIFR Colaba and Bhabha Atomic Research Centre",
      "Small cohort size ensuring personalized mentorship from leading research scientists",
    ],
    officialUrl: "https://www.cbs.ac.in",
    intakeSeats: "57 Integrated MSc Seats",
  },

  // ── COMEDK UGET Engineering Colleges ────────────────────────────────
  {
    id: "rvce-bangalore",
    examSlug: "comedk",
    name: "R.V. College of Engineering",
    shortName: "RVCE Bengaluru",
    location: "Mysuru Road, Bengaluru",
    state: "Karnataka",
    nirfRank: "Rank #89 (Engineering)",
    badge: "Karnataka's #1 Private Engineering College",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80",
    overview:
      "Widely regarded as the top choice under COMEDK UGET. RVCE boasts staggering placement records in software engineering, semiconductor design, and automotive tech, rivaling top NITs and IIITs.",
    popularCourses: [
      "B.E. Computer Science & Engineering",
      "B.E. Information Science & Engineering",
      "B.E. Electronics & Communication",
      "B.E. Artificial Intelligence & Machine Learning",
      "B.E. Mechanical Engineering",
    ],
    keyHighlights: [
      "Average package over ₹15–20 LPA for CSE / ISE branches with 200+ recruiters",
      "Top recruiters include Google, Microsoft, Apple, Amazon, Texas Instruments, NVIDIA",
      "Active formula student racing, robotics, and satellite development clubs",
    ],
    officialUrl: "https://rvce.edu.in",
    intakeSeats: "1,200+ Engineering Seats",
  },
  {
    id: "bmsce-bangalore",
    examSlug: "comedk",
    name: "B.M.S. College of Engineering",
    shortName: "BMSCE Bengaluru",
    location: "Basavanagudi, Bengaluru",
    state: "Karnataka",
    nirfRank: "Rank #73 (Engineering)",
    badge: "First Private Engineering College in India (Est. 1946)",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80",
    overview:
      "Founded by philanthropist Bhusanayana Mukundadas Sreenivasaiah. Located in the cultural heart of Basavanagudi, BMSCE is celebrated for technical excellence, strong industry alumni, and stellar placement records.",
    popularCourses: [
      "B.E. Computer Science & Engineering",
      "B.E. Electronics & Communication",
      "B.E. Electrical & Electronics",
      "B.E. Biotechnology",
      "B.E. Civil & Structural Engineering",
    ],
    keyHighlights: [
      "Heritage 15-acre green campus in central Bengaluru with modern research blocks",
      "Over 350 multinational companies visit for campus placements annually",
      "Strong incubator center supporting student deep-tech startups",
    ],
    officialUrl: "https://bmsce.ac.in",
    intakeSeats: "1,350+ Engineering Seats",
  },
  {
    id: "msrit-bangalore",
    examSlug: "comedk",
    name: "Ramaiah Institute of Technology",
    shortName: "MSRIT Bengaluru",
    location: "M S R Nagar, Bengaluru",
    state: "Karnataka",
    nirfRank: "Rank #67 (Engineering)",
    badge: "Premier Technical Institution",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
    overview:
      "Part of the Gokula Education Foundation. MSRIT has consistently ranked among India's top 100 engineering institutions with world-class faculty, modern laboratories, and an impressive alumni footprint across Silicon Valley.",
    popularCourses: [
      "B.E. Computer Science & Engineering",
      "B.E. Information Science",
      "B.E. Cyber Security / Data Science",
      "B.E. Electronics & Telecommunication",
    ],
    keyHighlights: [
      "High tech placement density with Cisco, Morgan Stanley, Goldman Sachs, Adobe",
      "State-of-the-art Centers of Excellence in AI, VLSI, and Industrial IoT",
      "Central Bengaluru location with thriving student amenities and coding clubs",
    ],
    officialUrl: "https://www.msrit.edu",
    intakeSeats: "1,400+ Engineering Seats",
  },
  {
    id: "sit-tumkur",
    examSlug: "comedk",
    name: "Siddaganga Institute of Technology",
    shortName: "SIT Tumakuru",
    location: "Tumakuru",
    state: "Karnataka",
    nirfRank: "Rank #100 (Engineering)",
    badge: "Renowned Residential Engineering Campus",
    imageUrl: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1000&q=80",
    overview:
      "Established in 1963 by the Siddaganga Math. A sprawling 65-acre residential campus with disciplined academic culture, excellent placement training, and top mechanical and electrical faculties.",
    popularCourses: [
      "B.E. Computer Science & Engineering",
      "B.E. Artificial Intelligence & Data Science",
      "B.E. Mechanical Engineering",
      "B.E. Chemical Engineering",
    ],
    keyHighlights: [
      "Very high return on investment with disciplined hostel and academic environment",
      "Campus placements across core engineering giants and IT consulting firms",
      "Extensive laboratory infrastructure and sports facilities",
    ],
    officialUrl: "https://sit.ac.in",
    intakeSeats: "1,100+ Engineering Seats",
  },
];

export function getCollegesByExam(examSlug: ExamKey): College[] {
  return collegesData.filter((c) => c.examSlug === examSlug);
}
