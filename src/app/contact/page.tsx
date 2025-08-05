import type { Metadata } from "next";
import Container from "@/components/Container";
import Breadcrumb from "@/components/Breadcrumb";
import ContactForm from "@/components/ContactForm";
import { contactData } from "@/data/contactData";

export const metadata: Metadata = {
  title: contactData.metadata.title,
  description: contactData.metadata.description,
  keywords: contactData.metadata.keywords,
  openGraph: {
    title: contactData.metadata.title,
    description: contactData.metadata.description,
    images: [contactData.metadata.ogImage],
  },
};

const ContactPage = () => {
  return (
    <Container>
      <div className="py-4 px-6 md:py-6 md:px-8">
        <div className="mb-8 mt-24 md:mt-24 mt-24">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Contact' }
            ]} 
          />
        </div>

        {/* Hero Section */}
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-ocean-navy via-ocean-navy to-sky-blue py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                {contactData.content['Hero Section']['Heading']}
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-200">
                {contactData.content['Hero Section']['Subheading']}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mx-auto max-w-4xl py-24 sm:py-32">
          <div className="mx-auto max-w-2xl">
            <ContactForm />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ContactPage; 