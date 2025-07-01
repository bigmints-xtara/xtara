import { FiCompass, FiBookOpen, FiGlobe, FiTarget, FiLayers, FiUserCheck, FiShield } from "react-icons/fi";
import { IBenefit } from "@/types";
import { getImagePath } from '../utils';

export const benefits: IBenefit[] = [
  {
    title: "Personalized Career Discovery",
    description: "Xtara helps students find the right career path based on their strengths, interests, and personality—without pressure or guesswork.",
    bullets: [
      {
        title: "Guided Assessments",
        description: "Smart questions that understand who you are and what fits you best.",
        icon: <FiCompass size={26} />
      },
      {
        title: "AI-Powered Matching",
        description: "Get matched to careers and study options with real-world potential.",
        icon: <FiCompass size={26} />
      },
      {
        title: "Interest-Based Recommendations",
        description: "We suggest only what aligns with your skills and passion.",
        icon: <FiTarget size={26} />
      }
    ],
    imageSrc: getImagePath("/images/mockup-career.webp")
  },
  {
    title: "Learning Paths You Can Follow",
    description: "Know what to study, where to study, and how it pays off—before making a decision.",
    bullets: [
      {
        title: "Courses & Colleges",
        description: "View recommended degrees, certifications, and real colleges in India.",
        icon: <FiBookOpen size={26} />
      },
      {
        title: "Step-by-Step Roadmaps",
        description: "Clear timelines for getting job-ready in your chosen path.",
        icon: <FiLayers size={26} />
      },
      {
        title: "Global & Local Options",
        description: "Explore both Indian and international opportunities—side by side.",
        icon: <FiGlobe size={26} />
      }
    ],
    imageSrc: getImagePath("/images/mockup-learning.webp")
  },
  {
    title: "Safe. Inclusive. Built for You.",
    description: "Whether you're exploring quietly or building boldly, Xtara is a private, trustworthy space built to empower students.",
    bullets: [
      {
        title: "Private by Default",
        description: "No forced sign-ups. Assessments and insights can be used anonymously.",
        icon: <FiShield size={26} />
      },
      {
        title: "Student-First Design",
        description: "Clear language. Friendly UI. No ads. No pressure.",
        icon: <FiUserCheck size={26} />
      },
      {
        title: "Accessible for All",
        description: "Works on mobile, low bandwidth, and available in multiple languages (coming soon).",
        icon: <FiTarget size={26} />
      }
    ],
    imageSrc: getImagePath("/images/mockup-safe.webp")
  }
];