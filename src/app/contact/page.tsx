import Container from "@/components/Container";
import Breadcrumb from "@/components/Breadcrumb";
import ContactForm from "@/components/ContactForm";
import MarketingLayout from "@/components/MarketingLayout";
import { getLocaleFromCookie } from "@/i18n/server";
import { getMessages } from "@/i18n/messages";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookie();
  const messages = getMessages(locale);
  return {
    title: messages.contact.metadata.title,
    description: messages.contact.metadata.description,
    keywords: messages.contact.metadata.keywords,
    openGraph: {
      title: messages.contact.metadata.title,
      description: messages.contact.metadata.description,
      images: [messages.contact.metadata.ogImage],
    },
  };
}

const ContactPage = async () => {
  const locale = await getLocaleFromCookie();
  const messages = getMessages(locale);

  return (
    <MarketingLayout>
      <Container>
        <div className="py-4 px-6 md:py-6 md:px-8">
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: messages.common.breadcrumb.home, href: "/" },
                { label: messages.common.breadcrumb.contact },
              ]}
            />
          </div>

          <div className="relative isolate overflow-hidden bg-gradient-to-br from-primary via-primary to-sky-500 py-24 sm:py-32 rounded-3xl">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  {messages.contact.hero.title}
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-200">
                  {messages.contact.hero.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-4xl py-24 sm:py-32">
            <div className="mx-auto max-w-2xl">
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </MarketingLayout>
  );
};

export default ContactPage;
