import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/Container";
import Breadcrumb from "@/components/Breadcrumb";
import { getAllNews, getNewsBySlug, markdownToHtml } from "@/data/newsData";

interface Params {
    params: { slug: string };
}

export async function generateStaticParams() {
    const news = getAllNews();
    return news.map(item => ({ slug: item.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
    const article = getNewsBySlug(params.slug);
    return {
        title: `${article.title} - Xtara`,
        description: article.description,
        keywords: "career guidance, educational news, career insights, Xtara",
        openGraph: {
            title: `${article.title} - Xtara`,
            description: article.description,
            images: article.image ? [article.image] : ["/images/og-news.jpg"],
            url: `https://xtara.com/news/${params.slug}`,
            type: 'article',
            publishedTime: article.date,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${article.title} - Xtara`,
            description: article.description,
            images: article.image ? [article.image] : ["/images/og-news.jpg"],
        },
        alternates: {
            canonical: `https://xtara.com/news/${params.slug}`,
        },
    };
}

const NewsDetailPage = ({ params }: Params) => {
    const article = getNewsBySlug(params.slug);
    const html = markdownToHtml(article.content);

    return (
        <Container>
            <div className="py-4 px-6 md:py-6 md:px-8">
                <div className="mb-8 mt-24 md:mt-24 mt-24">
                    <Breadcrumb 
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'News', href: '/news' },
                            { label: article.title }
                        ]} 
                    />
                </div>

                {article.image && (
                    <div className="mb-8">
                        <Image
                            src={article.image}
                            alt={article.title}
                            width={800}
                            height={400}
                            className="w-full h-64 object-cover rounded-lg"
                        />
                    </div>
                )}

                <article className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-ocean-navy mb-4">{article.title}</h1>
                    <p className="text-sm text-gray-600 mb-8">
                        {new Date(article.date).toLocaleDateString()}
                    </p>
                    <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </article>
            </div>
        </Container>
    );
};

export default NewsDetailPage;


