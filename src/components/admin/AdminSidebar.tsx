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

const navigationItems = [
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
        name: 'Dream Careers',
        href: '/admin/dream-careers',
        icon: Star,
    },
    {
        name: 'Content Resources',
        href: '/admin/resources',
        icon: Library,
    },
    {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
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
