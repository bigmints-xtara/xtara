import Container from "@/components/Container";
import MarketingLayout from "@/components/MarketingLayout";
import { defaultMessages, getMessages } from "@/i18n/messages";
import { getLocaleFromCookie } from "@/i18n/server";
import { translate } from "@/i18n/translate";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookie();
  const messages = getMessages(locale);
  const title = translate(messages, "privacy.metadata.title", undefined, defaultMessages);
  const description = translate(messages, "privacy.metadata.description", undefined, defaultMessages);
  const keywords = translate(messages, "privacy.metadata.keywords", undefined, defaultMessages);
  const ogImage = translate(messages, "privacy.metadata.ogImage", undefined, defaultMessages);
  const canonicalUrl = translate(messages, "privacy.metadata.canonicalUrl", undefined, defaultMessages);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [ogImage],
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

const PrivacyPolicyPage = async () => {
  const locale = await getLocaleFromCookie();
  const messages = getMessages(locale);
  const contentHtml = translate(messages, "privacy.contentHtml", undefined, defaultMessages);

  return (
    <MarketingLayout>
      <Container>
        <div className="py-4 px-6 md:py-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>
        </div>
      </Container>
    </MarketingLayout>
  );
};

export default PrivacyPolicyPage;
