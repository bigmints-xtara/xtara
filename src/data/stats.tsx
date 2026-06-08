import { Globe, GraduationCap, Star } from "lucide-react";

import { IStats } from "@/types";

export const stats: IStats[] = [
  {
    title: "1M+",
    icon: <GraduationCap size={34} className="text-indigo-600" />,
    description: "Students across India guided toward meaningful career paths."
  },
  {
    title: "95%",
    icon: <Star size={34} className="text-yellow-500" />,
    description: "Positive feedback for personalized assessments and clarity."
  },
  {
    title: "250+",
    icon: <Globe size={34} className="text-green-600" />,
    description: "Career domains and specializations covered with local context."
  }
];
