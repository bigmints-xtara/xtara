import { motion } from 'framer-motion';
import { CareerSlideData } from '@/types/career';
import * as Icons from 'lucide-react';

interface BentoVisualizationProps {
    data: CareerSlideData;
}

const cardColors = [
    { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', icon: 'text-blue-400', glow: 'group-hover:shadow-blue-500/20' },
    { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', glow: 'group-hover:shadow-emerald-500/20' },
    { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', icon: 'text-amber-400', glow: 'group-hover:shadow-amber-500/20' },
    { bg: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/30', icon: 'text-rose-400', glow: 'group-hover:shadow-rose-500/20' },
];

export function BentoVisualization({ data }: BentoVisualizationProps) {
    const renderIcon = (iconName: string, className: string) => {
        const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
        return <IconComponent className={className} />;
    };

    return (
        <div className="w-full flex flex-row gap-4 px-4 max-w-6xl mx-auto justify-center">
            {data.content.map((item, index) => {
                const colors = cardColors[index % cardColors.length];

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                            delay: index * 0.15,
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                        }}
                        whileHover={{ 
                            scale: 1.05,
                            y: -5,
                            transition: { duration: 0.2 }
                        }}
                        className={`group relative flex-1 bg-gradient-to-br ${colors.bg} backdrop-blur-md border ${colors.border} rounded-2xl p-6 shadow-xl ${colors.glow} transition-all duration-300 overflow-hidden min-w-0`}
                    >
                        {/* Animated background shimmer */}
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Animated Icon */}
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                                className={`flex-shrink-0 w-14 h-14 rounded-xl bg-white/5 border ${colors.border} flex items-center justify-center mb-4`}
                            >
                                {renderIcon(item.icon, `w-7 h-7 ${colors.icon}`)}
                            </motion.div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm md:text-base text-sky-100/70 leading-relaxed">
                                    {item.subtitle}
                                </p>
                            </div>

                            {/* Decorative corner accent */}
                            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors.bg} opacity-50 blur-2xl`} />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
