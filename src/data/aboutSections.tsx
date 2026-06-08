import { Award, Heart, Target, Users } from "lucide-react";
import { IBenefit } from "@/types";

export const aboutSections: IBenefit[] = [
  {
    title: "Our Mission",
    description: "At Xtara, we believe every student deserves access to personalized career guidance that helps them discover their true potential. Our AI-powered platform combines cutting-edge technology with deep educational insights to provide students with the tools they need to make informed decisions about their future.",
    bullets: [
      {
        title: "Personalized Guidance",
        description: "AI-powered assessments that understand each student's unique profile.",
        icon: <Target size={26} />
      },
      {
        title: "Data-Driven Insights",
        description: "Evidence-based recommendations backed by comprehensive career data.",
        icon: <Award size={26} />
      },
      {
        title: "Accessible to All",
        description: "Democratizing career guidance for every student across India.",
        icon: <Heart size={26} />
      }
    ],
    imageSrc: "/images/001.png"
  },
  {
    title: "Our Story",
    description: "Founded in 2024, Xtara emerged from a simple observation: too many students were making career decisions without adequate guidance or understanding of their options. Our team of educators, technologists, and career counselors came together with a shared vision.",
    bullets: [
      {
        title: "The Problem",
        description: "Students making career decisions without proper guidance or understanding.",
        icon: <Target size={26} />
      },
      {
        title: "The Solution",
        description: "AI-powered platform that makes career guidance accessible to every student.",
        icon: <Award size={26} />
      },
      {
        title: "The Team",
        description: "Educators, technologists, and career counselors united by a shared vision.",
        icon: <Users size={26} />
      }
    ],
    imageSrc: "/images/002.png"
  }
]; 
