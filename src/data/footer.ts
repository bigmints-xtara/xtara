import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
    subheading: string;
    quickLinks: IMenuItem[];
    email: string;
    telephone: string;
    socials: ISocials;
} = {
    subheading: "Personalized career guidance platform helping students discover their perfect career path.",
    quickLinks: [
        {
            text: "Features",
            url: "#features"
        },
        {
            text: "Privacy Policy",
            url: "/privacy-policy"
        },
        {
            text: "Terms of Use",
            url: "/terms-of-use"
        },
        {
            text: "Delete Account",
            url: "/privacy-policy/delete-account"
        }
    ],
    email: 'xtara.connect@gmail.com',
    telephone: '+91 99477 93728',
    socials: {
        // github: 'https://github.com',
        // x: 'https://twitter.com/x',
        twitter: 'https://twitter.com/xtara_ai',
        facebook: 'https://facebook.com/xtara.ai',
        // youtube: 'https://youtube.com',
        linkedin: 'https://www.linkedin.com/company/xtara',
        // threads: 'https://www.threads.net',
        instagram: 'https://www.instagram.com/xtara.ai',
    }
}