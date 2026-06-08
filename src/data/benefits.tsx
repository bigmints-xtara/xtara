import { BookOpen, Compass, Globe, Layers, Shield, Target, UserCheck } from "lucide-react";
import { IBenefit } from "@/types";
import { getImagePath } from '../utils';

export const benefits: IBenefit[] = [
  {
    title: "Help Students Find Their True Fit",
    description: "Xtara guides students through career confusion with structured assessments, interest-based suggestions, and real college or course options—all in one app.",
    bullets: [
      {
        title: "Career Fit Assessment",
        description: "Discover careers based on interests, personality, and subject strengths.",
        icon: <Compass size={26} />
      },
      {
        title: "Step-by-Step Learning Plans",
        description: "Know what to study, where to go, and how long it takes to get job-ready.",
        icon: <Layers size={26} />
      },
      {
        title: "College & Course Match",
        description: "Get matched with the right study paths and institutions based on your goals.",
        icon: <BookOpen size={26} />
      }
    ],
    imageSrc: getImagePath("/images/001.png")
  },
  {
    title: "Support Parents to Guide with Confidence",
    description: "Give parents the clarity they need to support their child's future—without pressure or outdated advice.",
    bullets: [
      {
        title: "Understand Career Trends",
        description: "Get insights on job markets, growth sectors, and salary ranges.",
        icon: <Globe size={26} />
      },
      {
        title: "Monitor Student Progress",
        description: "Know how your child is progressing with career exploration.",
        icon: <Target size={26} />
      },
      {
        title: "No Jargon, Just Guidance",
        description: "We keep things simple so everyone understands what matters.",
        icon: <UserCheck size={26} />
      }
    ],
    imageSrc: getImagePath("/images/002.png")
  },
  {
    title: "Empower Schools with Scalable Career Guidance",
    description: "Xtara acts as a digital career counselor—reaching every student with personalized pathways, interest grouping, and decision support.",
    bullets: [
      {
        title: "Career Reports for Every Student",
        description: "Auto-generate smart reports to support stream and subject choices.",
        icon: <Shield size={26} />
      },
      {
        title: "Manage & Track School Progress",
        description: "View insights by class, grade, or school level.",
        icon: <Target size={26} />
      },
      {
        title: "Aligned to Indian Curriculums",
        description: "Built for CBSE, ICSE, and state boards.",
        icon: <BookOpen size={26} />
      }
    ],
    imageSrc: getImagePath("/images/003.png")
  },
  {
    title: "Upskill Your Workforce with Smart L&D",
    description: "Enterprises use Xtara to help employees explore growth paths, discover relevant skills, and align with internal opportunities.",
    bullets: [
      {
        title: "AI-Powered Career Mapping",
        description: "Employees discover growth opportunities based on skills and goals.",
        icon: <Compass size={26} />
      },
      {
        title: "Integrated Learning Pathways",
        description: "Map learning journeys to roles, departments, or goals.",
        icon: <Layers size={26} />
      },
      {
        title: "Boost Retention & Engagement",
        description: "Give employees purpose-driven career development support.",
        icon: <UserCheck size={26} />
      }
    ],
    imageSrc: getImagePath("/images/004.png")
  }
];
