import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/Container";
import { getAllNews } from "@/data/news";

export const metadata: Metadata = {
    title: "News - Xtara",
    description: "Latest updates and news from Xtara.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const NewsPage = ({ searchParams }: { searchParams?: { page?: string } }) => {
    const newsItems = getAllNews();
    const page = parseInt(searchParams?.page || "1", 10);
    const start = (page - 1) * PAGE_SIZE;
    const paginated = newsItems.slice(start, start + PAGE_SIZE);
    const totalPages = Math.ceil(newsItems.length / PAGE_SIZE);

    return (
        <Container>
            <div className="max-w-5xl mx-auto py-12">
                <h1 className="text-4xl font-bold text-ocean-navy mb-8">News</h1>
                <ul className="space-y-8">
                    {paginated.map(item => (
                        <li key={item.slug}>
                            <Link
                                href={`/news/${item.slug}`}
                                className="block rounded-lg overflow-hidden bg-cream-sand hover:bg-cream-sand/80 transition-colors"
                            >
                                <div className={item.image ? "md:flex" : ""}>
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            width={400}
                                            height={250}
                                            className="w-full md:w-64 h-48 object-cover md:mr-6 mb-4 md:mb-0"
                                        />
                                    )}
                                    <div className="p-6">
                                        <p className="text-sm text-gray-600 mb-2">
                                            {new Date(item.date).toLocaleDateString()}
                                        </p>
                                        <h2 className="text-2xl font-semibold text-ocean-navy">
                                            {item.title}
                                        </h2>
                                        <p className="text-gray-700 mt-2">{item.description}</p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
                {totalPages > 1 && (
                    <div className="flex justify-between mt-8">
                        {page > 1 ? (
                            <Link href={`/news?page=${page - 1}`} className="text-ocean-navy font-semibold">
                                Previous
                            </Link>
                        ) : (
                            <span />
                        )}
                        {page < totalPages && (
                            <Link href={`/news?page=${page + 1}`} className="ml-auto text-ocean-navy font-semibold">
                                Next
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </Container>
    );
};

export default NewsPage;

