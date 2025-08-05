'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { Transition } from '@headlessui/react';
import { HiOutlineXMark, HiBars3 } from 'react-icons/hi2';
import Image from 'next/image';

import Container from './Container';
// import { siteDetails } from '@/data/siteDetails';
import { menuItems } from '@/data/menuItems';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

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
        <header className="fixed top-0 left-0 right-0 md:absolute z-50 mx-auto w-full bg-ocean-navy">
            <Container className="!px-0">
                <nav className="mx-auto flex justify-between items-center py-4 px-6 md:py-6 md:px-8 mb-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                    <Image 
                            src="/images/logo-color.svg" 
                            alt="Xtara Logo" 
                            width={80}
                            height={0}
                           
                            
                        />
                       
                    </Link>

                    {/* Desktop Menu */}
                    <ul className="hidden md:flex space-x-6">
                        {menuItems.map(item => {
                            const active = isActive(item.url);
                            return (
                                <li key={item.text}>
                                    <Link 
                                        href={item.url} 
                                        className={`transition-colors pb-1 border-b-2 ${
                                            active 
                                                ? 'text-sun-gold border-sun-gold font-medium' 
                                                : 'text-white hover:text-sky-blue border-transparent hover:border-sky-blue'
                                        }`}
                                    >
                                        {item.text}
                                    </Link>
                                </li>
                            );
                        })}
                        <li>
                            <Link href="/download" className="text-black bg-sun-gold hover:bg-sun-gold/80 px-8 py-3 rounded-full transition-colors">
                                Download
                            </Link>
                        </li>
                    </ul>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="bg-sun-gold text-black focus:outline-none rounded-full w-10 h-10 flex items-center justify-center border-2 border-white"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? (
                                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <HiBars3 className="h-6 w-6" aria-hidden="true" />
                            )}
                            <span className="sr-only">Toggle navigation</span>
                        </button>
                    </div>
                </nav>
            </Container>

            {/* Mobile Menu with Transition */}
            <Transition
                show={isOpen}
                enter="transition ease-out duration-200 transform"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75 transform"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div id="mobile-menu" className="md:hidden bg-white mx-4 mt-2">
                    <ul className="flex flex-col space-y-4 pt-4 pb-6 px-6">
                        {menuItems.map(item => {
                            const active = isActive(item.url);
                            return (
                                <li key={item.text}>
                                    <Link 
                                        href={item.url} 
                                        className={`block transition-colors ${
                                            active 
                                                ? 'text-ocean-navy font-medium border-l-4 border-ocean-navy pl-2' 
                                                : 'text-gray-900 hover:text-ocean-navy'
                                        }`}
                                        onClick={toggleMenu}
                                    >
                                        {item.text}
                                    </Link>
                                </li>
                            );
                        })}
                        <li>
                            <Link href="/download" className="text-black bg-sun-gold hover:bg-sun-gold/80 px-5 py-2 rounded-full block w-fit" onClick={toggleMenu}>
                                Download
                            </Link>
                        </li>
                    </ul>
                </div>
            </Transition>
        </header>
    );
};

export default Header;
