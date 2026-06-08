import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CareerSlideData } from '@/types/career';
import confetti from 'canvas-confetti';
import * as Icons from 'lucide-react';

interface IntroVisualizationProps {
    data: CareerSlideData;
}

export function IntroVisualization({ data }: IntroVisualizationProps) {
    useEffect(() => {
        // Trigger confetti on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const recommendation = data.content[0];

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-center px-4 py-8">
            {/* Animated Trophy Icon */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.2 
                }}
                className="mb-8"
            >
                <motion.div
                    animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 ring-4 ring-white/20 relative overflow-hidden"
                >
                    {/* Shimmer effect */}
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                    <Icons.Trophy className="w-14 h-14 md:w-20 md:h-20 text-white relative z-10" />
                </motion.div>
            </motion.div>

            {/* Main Title with staggered animation */}
            <motion.h3
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
            >
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
                >
                    {recommendation.title}
                </motion.span>
            </motion.h3>

            {/* Subtitle with fade-in */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-xl md:text-2xl lg:text-3xl text-sky-100/90 font-semibold max-w-3xl leading-relaxed"
            >
                {recommendation.subtitle}
            </motion.p>

            {/* Decorative elements */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-8 flex gap-2"
            >
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            y: [0, -8, 0],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1
                        }}
                        className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"
                    />
                ))}
            </motion.div>
        </div>
    );
}
