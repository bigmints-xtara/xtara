import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CareerSlideData } from '@/types/career';
import * as Icons from 'lucide-react';

interface CarouselVisualizationProps {
    data: CareerSlideData;
}

export function CarouselVisualization({ data }: CarouselVisualizationProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Safety check for empty content
    if (!data.content || data.content.length === 0) {
        return (
            <div className="w-full h-[55vh] flex items-center justify-center">
                <p className="text-white/60 text-lg">No data available</p>
            </div>
        );
    }

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % data.content.length);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + data.content.length) % data.content.length);
    };

    const renderIcon = (iconName: string, className: string) => {
        const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
        return <IconComponent className={className} />;
    };

    return (
        <div className="relative w-full h-[55vh] flex items-center justify-center px-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                    className="w-full max-w-3xl perspective-1000"
                >
                    <div className="relative bg-gradient-to-br from-[#1A2342]/80 to-[#0F1729]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden group hover:border-white/20 transition-all">
                        {/* Animated background gradient */}
                        <motion.div
                            animate={{ 
                                background: [
                                    'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                                    'radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                                    'radial-gradient(circle at 0% 100%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                                    'radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                                ]
                            }}
                            transition={{ duration: 8, repeat: Infinity }}
                            className="absolute inset-0"
                        />

                        {/* Shimmer effect */}
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Icon with pulse animation */}
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20"
                            >
                                {renderIcon(data.content[currentIndex].icon, "w-10 h-10 md:w-12 md:h-12 text-blue-400")}
                            </motion.div>

                            {/* Title with gradient */}
                            <h3 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white mb-4">
                                {data.content[currentIndex].title}
                            </h3>

                            {/* Subtitle */}
                            <p className="text-lg md:text-xl text-sky-100/80 leading-relaxed max-w-xl">
                                {data.content[currentIndex].subtitle}
                            </p>

                            {/* Card counter badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 font-medium"
                            >
                                {currentIndex + 1} of {data.content.length}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            {data.content.length > 1 && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.1, x: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={prev}
                        className="absolute left-0 md:left-4 p-3 md:p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-sm shadow-lg"
                    >
                        <Icons.ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1, x: 2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={next}
                        className="absolute right-0 md:right-4 p-3 md:p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-sm shadow-lg"
                    >
                        <Icons.ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                    </motion.button>

                    {/* Progress dots */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                        {data.content.map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ 
                                    width: i === currentIndex ? 32 : 8,
                                    backgroundColor: i === currentIndex ? 'rgba(59, 130, 246, 1)' : 'rgba(255, 255, 255, 0.2)'
                                }}
                                className="h-2 rounded-full transition-all cursor-pointer"
                                onClick={() => setCurrentIndex(i)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
