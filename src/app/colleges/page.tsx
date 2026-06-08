"use client";

import { useState, useEffect } from "react";
import { algoliaClient, collegesIndex } from "@/lib/algolia/algolia";
import CollegeCard, { College } from "@/components/colleges/CollegeCard";
import Navbar from "@/components/layout/Navbar";
import { Search } from "lucide-react";

export default function CollegesPage() {
    const [query, setQuery] = useState("");
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const searchColleges = async () => {
            setLoading(true);
            try {
                const response = await algoliaClient.search<College>([
                    {
                        indexName: collegesIndex.name,
                        params: {
                            query,
                            hitsPerPage: 20,
                        },
                    },
                ]);

                if (response.results && response.results.length > 0) {
                    const hits = (response.results[0] as any).hits as College[];
                    setColleges(hits);
                }
            } catch (error) {
                console.error("Error searching colleges", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce
        const timer = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await algoliaClient.search([
                {
                    indexName: collegesIndex.name,
                    params: {
                        query,
                        hitsPerPage: 20,
                    },
                },
            ]);

            if (response.results && response.results.length > 0) {
                const hits = (response.results[0] as any).hits as College[];
                setColleges(hits);
            }
        } catch (error) {
            console.error("Error searching colleges", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#12192E] text-white">
            <Navbar />

            <main className="container mx-auto p-4">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">Explore Colleges</h1>

                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, city, or state..."
                            className="w-full p-4 pl-12 rounded-lg bg-[#1A2342] border border-gray-700 focus:border-blue-500 outline-none text-white placeholder-gray-500 "
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {colleges.map((college) => (
                            <CollegeCard key={college.objectID} college={college} />
                        ))}

                        {colleges.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-10">
                                No colleges found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
