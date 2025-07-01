export interface IWhoItHelps {
  title: string;
  description: string;
  highlights: string[];
}

export const whoItHelps: IWhoItHelps[] = [
  {
    title: "For Students",
    description: "Xtara empowers students to discover careers that truly fit them—not just what they're told to pursue. Through guided assessments, smart recommendations, and clear learning paths, students gain confidence, clarity, and control over their future.",
    highlights: [
      "No more confusion about what to study or become",
      "Explore modern careers beyond engineering and medicine",
      "Make informed decisions backed by data and insights"
    ]
  },
  {
    title: "For Parents & Guardians",
    description: "Xtara gives parents peace of mind by helping them support their child's future with data-backed career insights. Understand strengths, explore real options, and make choices that are practical and aligned with potential.",
    highlights: [
      "Understand your child's strengths and aptitudes",
      "See real career pathways and education ROI",
      "Support without pressure or guesswork"
    ]
  },
  {
    title: "For Educators & Schools",
    description: "Xtara complements school counseling by providing scalable, personalized guidance. With dashboards and insights, educators can better guide students toward suitable streams and future-ready skills.",
    highlights: [
      "Automated student profiling and reports",
      "Career exploration across 25+ domains",
      "Empowers teachers to be better guides"
    ]
  },
  {
    title: "For Enterprises & Skill Providers",
    description: "Xtara connects student potential with industry readiness. Partner organizations can align content, internships, or learning programs with motivated talent.",
    highlights: [
      "Reach pre-qualified, interest-aligned learners",
      "Showcase internships, scholarships, and tools",
      "Contribute to the future of India's talent ecosystem"
    ]
  }
]; 