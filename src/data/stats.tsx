import { BsFillStarFill } from "react-icons/bs";
import { PiGlobeFill } from "react-icons/pi";
import { FaUserGraduate } from "react-icons/fa6";

import { IStats } from "@/types";

export const stats: IStats[] = [
  {
    title: "1M+",
    icon: <FaUserGraduate size={34} className="text-indigo-600" />,
    description: "Students across India guided toward meaningful career paths."
  },
  {
    title: "95%",
    icon: <BsFillStarFill size={34} className="text-yellow-500" />,
    description: "Positive feedback for personalized assessments and clarity."
  },
  {
    title: "250+",
    icon: <PiGlobeFill size={34} className="text-green-600" />,
    description: "Career domains and specializations covered with local context."
  }
];
