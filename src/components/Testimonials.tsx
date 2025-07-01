import { ITestimonial } from "@/types";
import { siteDetails } from "@/data/siteDetails";
import { getImagePath } from '../utils';

export const testimonials: ITestimonial[] = [
  {
    name: 'Anjali R.',
    role: '12th Grade Student',
    message: `${siteDetails.siteName} helped me understand what careers match my personality. Now I have a clear goal and a plan.`,
    avatar: getImagePath('/images/testimonial-1.webp'),
  },
  {
    name: 'Rakesh M.',
    role: 'Parent from Pune',
    message: `Thanks to ${siteDetails.siteName}, we were able to make an informed decision for my son. It's like having a career counselor at home.`,
    avatar: getImagePath('/images/testimonial-2.webp'),
  },
  {
    name: 'Ayesha S.',
    role: 'BA Student, Delhi',
    message: `I loved how simple and relatable everything was. It’s the first time I felt confident about choosing my career path.`,
    avatar: getImagePath('/images/testimonial-3.webp'),
  }
];
