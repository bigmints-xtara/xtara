'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/Container";
import Breadcrumb from "@/components/Breadcrumb";
import { getAllNews } from "@/data/newsData";
import { newsPageData } from "@/data/newsPageData";

const PAGE_SIZE = 10;

const NewsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const newsItems = getAllNews();
    const start = (currentPage - 1) * PAGE_SIZE;
    const paginated = newsItems.slice(start, start + PAGE_SIZE);
    const totalPages = Math.ceil(newsItems.length / PAGE_SIZE);

    // Update page from URL on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        if (pageParam) {
            const page = parseInt(pageParam, 10);
            if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
            }
        }
    }, [totalPages]);

    // Update URL when page changes
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        const url = new URL(window.location.href);
        url.searchParams.set('page', newPage.toString());
        window.history.pushState({}, '', url.toString());
    };


    return (
        <Container>
            <div className="py-4 px-6 md:py-6 md:px-8">
                <div className="mb-8 mt-12 md:mt-12 mt-20">
                    <Breadcrumb 
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'News' }
                        ]} 
                    />
                </div>
                <h1 className="text-4xl font-bold text-ocean-navy mb-8">{newsPageData.content['Hero Section']['Heading']}</h1>
                
                {/* Latest Articles - Row Based Layout */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-ocean-navy mb-6">Latest Articles</h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                                {paginated.slice(0, 6).map(item => (
                            <article key={item.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <Link href={`/news/${item.slug}`} className="block">
                                    {item.image && (
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className={`${item.image ? 'p-6' : 'p-8'}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <time className="text-sm text-gray-500">
                                                {new Date(item.date).toLocaleDateString()}
                                            </time>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ocean-navy/10 text-ocean-navy">
                                                News
                                            </span>
                                        </div>
                                        <h3 className={`font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-ocean-navy transition-colors ${item.image ? 'text-lg' : 'text-xl'}`}>
                                            {item.title}
                                        </h3>
                                        <p className={`text-gray-600 line-clamp-3 leading-relaxed ${item.image ? 'text-sm' : 'text-base'}`}>
                                            {item.description}
                                        </p>
                                    </div>
                                </Link>
                            </article>
                        ))}

                    </div>
                </div>

                {/* List for Remaining Articles */}
                {paginated.length > 6 && (
                    <div>
                        <h2 className="text-2xl font-semibold text-ocean-navy mb-6">More Articles</h2>
                        <ul className="space-y-6">
                            {paginated.slice(6).map(item => (
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
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-between mt-8">
                        {currentPage > 1 ? (
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="text-ocean-navy font-semibold hover:underline"
                            >
                                Previous
                            </button>
                        ) : (
                            <span />
                        )}
                        {currentPage < totalPages && (
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="ml-auto text-ocean-navy font-semibold hover:underline"
                            >
                                Next
                            </button>
                        )}
                    </div>
                )}

            </div>
        </Container>
    );
};

export default NewsPage;

