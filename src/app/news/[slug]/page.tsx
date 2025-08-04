import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/Container";
import { getAllNews, getNewsBySlug, markdownToHtml } from "@/data/news";

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
        description: article.title,
    };
}

const NewsDetailPage = ({ params }: Params) => {
    const article = getNewsBySlug(params.slug);
    const html = markdownToHtml(article.content);

    return (
        <Container>
            <article className="max-w-3xl mx-auto py-12">
                <Image
                    src={article.image}
                    alt={article.title}
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <h1 className="text-4xl font-bold text-ocean-navy mb-4">{article.title}</h1>
                <p className="text-sm text-gray-600 mb-8">
                    {new Date(article.date).toLocaleDateString()}
                </p>
                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </article>
        </Container>
    );
};

export default NewsDetailPage;


