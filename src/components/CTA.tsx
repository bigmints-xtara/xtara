import { homeData } from "@/data/homeData"

import AppStoreButton from "./AppStoreButton"
import PlayStoreButton from "./PlayStoreButton"

const CTA: React.FC = () => {
    return (
        <section id="cta" className="mt-10 mb-5 lg:my-20">
            <div className="relative h-full w-full z-10 mx-auto py-12 sm:py-20">
                <div className="h-full w-full">
                    <div className="rounded-3xl opacity-95 absolute inset-0 -z-10 h-full w-full bg-ocean-navy">
                    </div>

                    <div className="h-full flex flex-col items-center justify-center text-white text-center px-5">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl md:leading-tight font-semibold mb-4 max-w-2xl">{homeData.content['CTA Section']['Heading']}</h2>

                        <p className="mx-auto max-w-xl md:px-5">{homeData.content['CTA Section']['Subheading']}</p>

                                                 <div className="mt-4 flex flex-col sm:flex-row items-center sm:gap-4">
                         <AppStoreButton url={homeData.content['CTA Section']['App Store URL']} />
                         <PlayStoreButton url={homeData.content['CTA Section']['Google Play URL']} />
                         </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CTA