'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from "@/context/AuthContext";

import Container from './Container';
import WaitlistButton from "./WaitlistButton";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trackEvent } from "@/lib/analytics";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "@/i18n/language-provider";

const Header = () => {
    const { user } = useAuth();
    const { t } = useTranslations();
    const pathname = usePathname();
    const logoHref = user ? "/dashboard" : "/";
    const isLoggedIn = Boolean(user);
    const navItems = isLoggedIn
        ? [
            { key: "dashboard", url: "/dashboard" },
            { key: "profile", url: "/profile" },
            { key: "achievements", url: "/achievements" },
        ]
        : [
            { key: "about", url: "/about" },
            { key: "news", url: "/news" },
            { key: "contact", url: "/contact" },
        ];

    const isActive = (url: string) => {
        // Normalize pathname by removing trailing slash
        const normalizedPathname = pathname.endsWith('/') && pathname !== '/'
            ? pathname.slice(0, -1)
            : pathname;

        if (url === '/') {
            return normalizedPathname === '/';
        }
        // For exact matches like /news, /about, /contact
        if (normalizedPathname === url) {
            return true;
        }
        // For nested routes like /news/[slug]
        if (url !== '/' && normalizedPathname.startsWith(url)) {
            return true;
        }
        return false;
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
            <Container className="!px-0">
                <nav className="mx-auto flex items-center justify-between py-2.5 px-4 md:py-3 md:px-6">
                    {/* Logo */}
                    <Link href={logoHref} className="flex items-center gap-2">
                        <Image
                            src="/images/logo-color.svg"
                            alt={t("header.logoAlt")}
                            width={64}
                            height={20}


                        />

                    </Link>

                    {/* Desktop Menu */}
                    <ul className="hidden md:flex items-center space-x-6">
                        {navItems.map(item => {
                            const active = isActive(item.url);
                            return (
                                <li key={item.key}>
                                    <Link
                                        href={item.url}
                                        className={`text-sm font-medium transition-colors pb-1 border-b-2 ${active
                                            ? 'text-primary border-primary font-medium'
                                            : 'text-muted-foreground hover:text-primary border-transparent hover:border-primary/50'
                                            }`}
                                        onClick={() =>
                                            trackEvent({
                                                action: "nav_click",
                                                category: "navigation",
                                                label: `header_${item.key}`,
                                            })
                                        }
                                    >
                                        {t(`header.nav.${item.key}`)}
                                    </Link>
                                </li>
                            );
                        })}
                        {!isLoggedIn && (
                            <li>
                                <WaitlistButton className="h-8 px-4 text-sm" />
                            </li>
                        )}
                        <li>
                            <LanguageSwitcher />
                        </li>
                    </ul>

                    {/* Mobile Menu */}
                    <div className="md:hidden flex items-center gap-2">
                        <LanguageSwitcher />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">{t("header.menu.open")}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {navItems.map(item => (
                                    <DropdownMenuItem key={item.key} asChild>
                                        <Link
                                            href={item.url}
                                            onClick={() =>
                                                trackEvent({
                                                    action: "nav_click",
                                                    category: "navigation",
                                                    label: `header_mobile_${item.key}`,
                                                })
                                            }
                                        >
                                            {t(`header.nav.${item.key}`)}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                                {!isLoggedIn && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/#waitlist"
                                                onClick={() =>
                                                    trackEvent({
                                                        action: "cta_click",
                                                        category: "engagement",
                                                        label: "header_join_waitlist",
                                                    })
                                                }
                                            >
                                                {t("header.cta.joinWaitlist")}
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </nav>
            </Container>
        </header>
    );
};

export default Header;
