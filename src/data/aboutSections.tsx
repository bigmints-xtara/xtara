import { FiTarget, FiUsers, FiHeart, FiAward } from "react-icons/fi";
import { IBenefit } from "@/types";

export const aboutSections: IBenefit[] = [
  {
    title: "Our Mission",
    description: "At Xtara, we believe every student deserves access to personalized career guidance that helps them discover their true potential. Our AI-powered platform combines cutting-edge technology with deep educational insights to provide students with the tools they need to make informed decisions about their future.",
    bullets: [
      {
        title: "Personalized Guidance",
        description: "AI-powered assessments that understand each student's unique profile.",
        icon: <FiTarget size={26} />
      },
      {
        title: "Data-Driven Insights",
        description: "Evidence-based recommendations backed by comprehensive career data.",
        icon: <FiAward size={26} />
      },
      {
        title: "Accessible to All",
        description: "Democratizing career guidance for every student across India.",
        icon: <FiHeart size={26} />
      }
    ],
    imageSrc: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=600&fit=crop&crop=center"
  },
  {
    title: "Our Story",
    description: "Founded in 2024, Xtara emerged from a simple observation: too many students were making career decisions without adequate guidance or understanding of their options. Our team of educators, technologists, and career counselors came together with a shared vision.",
    bullets: [
      {
        title: "The Problem",
        description: "Students making career decisions without proper guidance or understanding.",
        icon: <FiTarget size={26} />
      },
      {
        title: "The Solution",
        description: "AI-powered platform that makes career guidance accessible to every student.",
        icon: <FiAward size={26} />
      },
      {
        title: "The Team",
        description: "Educators, technologists, and career counselors united by a shared vision.",
        icon: <FiUsers size={26} />
      }
    ],
    imageSrc: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=600&fit=crop&crop=center"
  }
]; 