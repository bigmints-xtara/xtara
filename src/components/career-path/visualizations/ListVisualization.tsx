import { motion } from 'framer-motion';
import { CareerSlideData } from '@/types/career';
import * as Icons from 'lucide-react';

interface ListVisualizationProps {
    data: CareerSlideData;
}

export function ListVisualization({ data }: ListVisualizationProps) {
    const isCompact = data.content.some(item => item.titlesOnly);

    const renderIcon = (iconName: string, className: string) => {
        const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
        return <IconComponent className={className} />;
    };

    if (isCompact) {
        return (
            <div className="flex flex-wrap justify-center gap-3 w-full px-4 py-4 max-w-4xl mx-auto">
                {data.content.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                            delay: index * 0.08,
                            type: "spring",
                            stiffness: 150,
                            damping: 12
                        }}
                        whileHover={{ 
                            scale: 1.05,
                            y: -2,
                            transition: { duration: 0.2 }
                        }}
                        className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-full px-5 py-3 backdrop-blur-sm shadow-lg hover:shadow-blue-500/30 hover:border-blue-500/40 transition-all flex items-center gap-2.5 group"
                    >
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            {renderIcon(item.icon, "w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors")}
                        </motion.div>
                        <span className="text-white font-semibold text-base whitespace-nowrap group-hover:text-blue-100 transition-colors">
                            {item.title}
                        </span>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 px-4 py-2 max-w-4xl mx-auto">
            {data.content.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                        delay: index * 0.12,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }}
                    whileHover={{ 
                        scale: 1.02,
                        x: 5,
                        transition: { duration: 0.2 }
                    }}
                    className="bg-[#1A2342]/60 backdrop-blur border border-white/10 rounded-2xl p-5 shadow-lg group hover:border-white/20 hover:shadow-blue-500/10 transition-all relative overflow-hidden"
                >
                    {/* Shimmer effect */}
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    />

                    <div className="relative z-10 flex items-start gap-4">
                        <motion.div
                            whileHover={{ 
                                rotate: [0, -10, 10, 0],
                                transition: { duration: 0.5 }
                            }}
                            className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors"
                        >
                            {renderIcon(item.icon, "w-6 h-6 text-blue-400")}
                        </motion.div>
                        <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-bold text-white/90 mb-1.5 group-hover:text-white transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm md:text-base text-sky-100/70 leading-relaxed">
                                {item.subtitle}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
