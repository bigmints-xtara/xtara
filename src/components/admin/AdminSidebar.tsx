'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BookOpen,
    Trophy,
    FileText,
    Sparkles,
    Star,
    Library,
    LayoutDashboard,
    BarChart3,
    Settings,
    Gamepad2,
} from 'lucide-react';
import { useTenant } from '@/lib/hooks/useTenant';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatSnakeCaseToTitleCase } from '@/lib/utils';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ size?: number }>;
    comingSoon?: boolean;
}

const navigationItems: NavItem[] = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        name: 'Stories',
        href: '/admin/stories',
        icon: BookOpen,
    },
    {
        name: 'Challenges',
        href: '/admin/challenges',
        icon: Trophy,
        comingSoon: false,
    },
    {
        name: 'Good Reads',
        href: '/admin/good-reads',
        icon: FileText,
    },
    {
        name: 'Sparks',
        href: '/admin/sparks',
        icon: Sparkles,
    },
    {
        name: 'Games',
        href: '/admin/games',
        icon: Gamepad2,
    },
    {
        name: 'Dream Careers',
        href: '/admin/dream-careers',
        icon: Star,
        comingSoon: false,
    },
    {
        name: 'Content Resources',
        href: '/admin/resources',
        icon: Library,
        comingSoon: true,
    },
    {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        comingSoon: true,
    },
    {
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        comingSoon: true,
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { tenant, loading } = useTenant();

    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const isActive = (href: string) => {
        if (!isClient) return false;
        return pathname === href;
    };

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">xTara CGP</h2>
                <p className="text-sm text-gray-400 mt-1">Career Guidance Platform</p>
            </div>

            <nav className="space-y-2 flex-1">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const isComingSoon = item.comingSoon ?? false;

                    if (isComingSoon) {
                        return (
                            <button
                                key={item.href}
                                type="button"
                                onClick={() => {
                                    console.log(`[Sidebar] "${item.name}" — Coming Soon`);
                                }}
                                title={`${item.name} — Coming Soon`}
                                aria-label={`${item.name} (Coming Soon)`}
                                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all text-gray-500 opacity-50 cursor-not-allowed group w-full"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                <Badge variant="secondary" className="bg-gray-800 text-gray-400 border-gray-700 text-[10px] px-1.5 py-0 leading-none h-4">Soon</Badge>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {isClient && tenant && (
                <div className="mt-4">
                    <Separator className="bg-gray-800 my-4" />
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={tenant.avatarUrl} alt={tenant.displayName} />
                            <AvatarFallback className="bg-blue-600 text-white font-bold">
                                {tenant.displayName?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" title={tenant.displayName}>{tenant.displayName}</p>
                            <p className="text-xs text-gray-500 truncate">
                                {formatSnakeCaseToTitleCase(tenant.category || tenant.type)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
