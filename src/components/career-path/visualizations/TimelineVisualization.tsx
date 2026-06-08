import { motion } from 'framer-motion';
import { CareerSlideData } from '@/types/career';
import * as Icons from 'lucide-react';

interface TimelineVisualizationProps {
    data: CareerSlideData;
}

export function TimelineVisualization({ data }: TimelineVisualizationProps) {
    const renderIcon = (iconName: string, className: string) => {
        const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
        return <IconComponent className={className} />;
    };

    return (
        <div className="w-full px-4 overflow-y-auto max-h-[50vh] scrollbar-hide py-4 pl-8">
            {data.content.map((item, index) => {
                const isLast = index === data.content.length - 1;

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="relative flex gap-6 pb-12 last:pb-0"
                    >
                        {/* Timeline Line */}
                        {!isLast && (
                            <div
                                className="absolute left-[19px] top-[40px] bottom-0 w-[2px] bg-blue-500/30 rounded-full"
                            />
                        )}

                        {/* Icon Bubble */}
                        <div className="relative z-10 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] flex-none">
                            {renderIcon(item.icon, "w-5 h-5 text-white")}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-[#1A2342]/80 backdrop-blur border border-white/10 rounded-2xl p-6 relative -top-2 hover:bg-[#1A2342] transition-colors group">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-wide">{item.title}</h3>
                            <p className="text-sky-100/60 text-lg leading-relaxed">{item.subtitle}</p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
