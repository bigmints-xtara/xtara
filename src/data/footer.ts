import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
    subheading: string;
    quickLinks: IMenuItem[];
    email: string;
    telephone: string;
    socials: ISocials;
} = {
    subheading: "AI-powered career guidance platform helping students discover their perfect career path.",
    quickLinks: [
        {
            text: "Features",
            url: "#features"
        }
    ],
    email: 'help@xtara.ai',
    telephone: '+91 98765 43210',
    socials: {
        // github: 'https://github.com',
        // x: 'https://twitter.com/x',
        twitter: 'https://twitter.com/xtara_ai',
        facebook: 'https://facebook.com/xtara.ai',
        // youtube: 'https://youtube.com',
        linkedin: 'https://www.linkedin.com/company/xtara-ai',
        // threads: 'https://www.threads.net',
        instagram: 'https://www.instagram.com/xtara.ai',
    }
}