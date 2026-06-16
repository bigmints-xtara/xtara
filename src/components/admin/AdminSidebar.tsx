'use client';

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
} from 'lucide-react';
import { useTenant } from '@/lib/hooks/useTenant';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

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
        comingSoon: true,
    },
    {
        name: 'Sparks',
        href: '/admin/sparks',
        icon: Sparkles,
        comingSoon: true,
    },
    {
        name: 'Dream Careers',
        href: '/admin/dream-careers',
        icon: Star,
        comingSoon: true,
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
    const { tenant } = useTenant();

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">xTara CGP</h2>
                <p className="text-sm text-gray-400 mt-1">Career Guidance Platform</p>
            </div>

            <nav className="space-y-2 flex-1">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
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
                                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-500 opacity-50 cursor-default hover:opacity-70 hover:text-gray-400"
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full font-medium">Soon</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
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

            {tenant && (
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
                            <p className="text-xs text-gray-500 truncate capitalize">
                                {tenant.category?.replace(/_/g, ' ') || tenant.type}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
