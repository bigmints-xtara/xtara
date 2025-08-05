import React from 'react';
import Image from 'next/image';

import AppStoreButton from './AppStoreButton';
import PlayStoreButton from './PlayStoreButton';

import { homeData } from '@/data/homeData';

const Hero: React.FC = () => {
    return (
        <section
            id="hero"
            className="relative flex items-center justify-center pb-0 pt-28 px-5 bg-ocean-navy">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl md:leading-tight font-bold text-white max-w-lg md:max-w-2xl mx-auto">{homeData.content['Hero Section']['Heading']}</h1>
                    <p className="mt-4 text-gray-200 max-w-lg mx-auto">{homeData.content['Hero Section']['Subheading']}</p>
                                               <div className="mt-6 flex flex-col sm:flex-row items-center sm:gap-4 w-fit mx-auto">
                               <AppStoreButton url={homeData.content['CTA Section']['App Store URL']} />
                               <PlayStoreButton url={homeData.content['CTA Section']['Google Play URL']} />
                           </div>
                    <Image
                        src={homeData.content['Hero Section']['Center Image']}
                        width={384}
                        height={340}
                        quality={100}
                        sizes="(max-width: 768px) 100vw, 384px"
                        priority={true}
                        unoptimized={true}
                        alt="app mockup"
                        className='relative mt-12 md:mt-16 mx-auto z-10'
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
