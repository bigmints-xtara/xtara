import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/Container";
import { getAllNews } from "@/data/news";

export const metadata: Metadata = {
    title: "News - Xtara",
    description: "Latest updates and news from Xtara.",
};

const NewsPage: React.FC = () => {
    const newsItems = getAllNews();

    return (
        <Container>
            <div className="max-w-5xl mx-auto py-12">
                <h1 className="text-4xl font-bold text-ocean-navy mb-8">News</h1>
                <ul className="space-y-8">
                    {newsItems.map(item => (
                        <li key={item.slug}>
                            <Link
                                href={`/news/${item.slug}`}
                                className="block rounded-lg overflow-hidden bg-cream-sand hover:bg-cream-sand/80 transition-colors"
                            >
                                <div className="md:flex">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        width={400}
                                        height={250}
                                        className="w-full md:w-64 h-48 object-cover"
                                    />
                                    <div className="p-6">
                                        <p className="text-sm text-gray-600 mb-2">
                                            {new Date(item.date).toLocaleDateString()}
                                        </p>
                                        <h2 className="text-2xl font-semibold text-ocean-navy">
                                            {item.title}
                                        </h2>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </Container>
    );
};

export default NewsPage;


