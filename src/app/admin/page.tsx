"use client";

import Link from 'next/link';
import {
    BookOpen,
    Trophy,
    FileText,
    Sparkles,
    Star,
    Library,
    Settings,
    BarChart3,
    Loader2
} from 'lucide-react';
import { useTenant } from '@/lib/hooks/useTenant';
import { SchoolDashboard } from '@/components/admin/SchoolDashboard';
import { MentorDashboard } from '@/components/admin/MentorDashboard';

const adminCards = [
    {
        title: 'Stories',
        subtitle: 'Manage career stories and content',
        icon: BookOpen,
        color: 'bg-blue-500',
        href: '/admin/stories',
    },
    {
        title: 'Challenges',
        subtitle: 'Manage career challenges and quizzes',
        icon: Trophy,
        color: 'bg-green-500',
        href: '/admin/challenges',
        comingSoon: true,
    },
    {
        title: 'Good Reads',
        subtitle: 'Manage educational articles and resources',
        icon: FileText,
        color: 'bg-teal-500',
        href: '/admin/good-reads',
        comingSoon: true,
    },
    {
        title: 'Sparks',
        subtitle: 'Manage motivational sparks and insights',
        icon: Sparkles,
        color: 'bg-pink-500',
        href: '/admin/sparks',
        comingSoon: true,
    },
    {
        title: 'Dream Careers',
        subtitle: 'Manage and vote on dream career entries',
        icon: Star,
        color: 'bg-orange-500',
        href: '/admin/dream-careers',
        comingSoon: true,
    },
    {
        title: 'Content Resources',
        subtitle: 'Manage career cluster resources and links',
        icon: Library,
        color: 'bg-purple-500',
        href: '/admin/resources',
        comingSoon: true,
    },
    {
        title: 'Analytics',
        subtitle: 'View usage statistics and insights',
        icon: BarChart3,
        color: 'bg-red-500',
        href: '/admin/analytics',
        comingSoon: true,
    },
    {
        title: 'Settings',
        subtitle: 'App configuration and preferences',
        icon: Settings,
        color: 'bg-gray-500',
        href: '/admin/settings',
        comingSoon: true,
    },
];

export default function AdminDashboard() {
    const { tenant, loading } = useTenant();

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Role-based rendering
    if (tenant?.type === 'institution' && tenant?.category === 'school') {
        return (
            <div className="h-full overflow-y-auto bg-gray-50">
                 <div className="p-8">
                    <SchoolDashboard tenant={tenant} />
                </div>
            </div>
        );
    }

    if (tenant?.category === 'mentor') {
        return (
             <div className="h-full overflow-y-auto bg-gray-50">
                 <div className="p-8">
                    <MentorDashboard tenant={tenant} />
                </div>
            </div>
        );
    }

    // Default Admin View (Super Admin or Content Admin)
    return (
        <div className="h-full overflow-y-auto bg-gray-50">
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Content Management System</p>
                    {tenant && (
                        <p className="text-xs text-gray-400 mt-1">
                            Logged in as: {tenant.displayName} ({tenant.category})
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {adminCards.map((card) => {
                        const Icon = card.icon;
                        const CardContent = (
                            <div
                                className={`p-6 bg-white border-2 rounded-xl hover: transition-all ${card.comingSoon
                                        ? 'opacity-60 cursor-not-allowed'
                                        : 'cursor-pointer hover:border-blue-500'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div
                                        className={`${card.color} w-16 h-16 rounded-full flex items-center justify-center mb-4`}
                                    >
                                        <Icon className="text-white" size={28} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                                    <p className="text-sm text-gray-600">{card.subtitle}</p>
                                    {card.comingSoon && (
                                        <span className="mt-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                            Coming Soon
                                        </span>
                                    )}
                                </div>
                            </div>
                        );

                        if (card.comingSoon) {
                            return <div key={card.title}>{CardContent}</div>;
                        }

                        return (
                            <Link key={card.title} href={card.href}>
                                {CardContent}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

