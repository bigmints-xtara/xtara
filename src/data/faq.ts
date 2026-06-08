import { IFAQ } from "@/types";
import { siteDetails } from "./siteDetails";

export const faqs: IFAQ[] = [
  {
    question: `Is ${siteDetails.siteName} free to use?`,
    answer: 'Yes. Xtara is completely free for students. You can take assessments, explore career paths, and view course suggestions without any cost.',
  },
  {
    question: `How accurate are the recommendations?`,
    answer: 'Our platform uses your strengths, interests, and goals to suggest well-matched careers. It’s designed to guide—not decide—for you.',
  },
  {
    question: 'Will I get college or course suggestions too?',
    answer: `Absolutely! ${siteDetails.siteName} also suggests real courses, entrance exams, and colleges to help you plan your next step.`,
  },
  {
    question: 'Can I use this if I’m unsure about my stream or marks?',
    answer: 'Yes! Xtara is built exactly for students who are confused or unsure. Our assessment helps you figure it out step by step.',
  },
  {
    question: 'Do parents or teachers get access?',
    answer: 'We are working on parent/mentor dashboards to help them support you better — coming soon!',
  }
];
