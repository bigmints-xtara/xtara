'use client';

import { ReactNode } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

interface Props {
  children: ReactNode;
  isLoading?: boolean;
}

export default function HomeLayout({ children, isLoading }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header isLoading={isLoading} />
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
