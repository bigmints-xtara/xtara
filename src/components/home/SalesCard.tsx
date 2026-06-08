import { Rocket, Trophy, Target, Sparkles, Brain, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface SalesCardProps {
    careerPathId?: string;
}

export default function SalesCard({ careerPathId }: SalesCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 border border-white/10 p-6 md:p-8">
            <div className="relative z-10">
                <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Unlock Your Full Potential
                    </h2>
                    <p className="text-indigo-200">
                        Join Xtara to access premium features designed for your success.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <BenefitItem
                        icon={<Target className="w-5 h-5 text-pink-400" />}
                        title="Personalized Career Paths"
                        description="AI-driven recommendations tailored to you"
                    />
                    <BenefitItem
                        icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        title="Progress Tracking"
                        description="Monitor your learning journey milestones"
                    />
                    <BenefitItem
                        icon={<Trophy className="w-5 h-5 text-yellow-400" />}
                        title="Learn with Games"
                        description="Improve skills with fun challenges"
                    />
                    <BenefitItem
                        icon={<Sparkles className="w-5 h-5 text-blue-400" />}
                        title="Micro-learning"
                        description="Bite-sized lessons for busy schedules"
                    />
                </div>

                <div className="mt-8">
                    <Link
                        href={careerPathId ? `/signup?careerPathId=${careerPathId}` : "/signup"}
                        className="block w-full text-center py-4 bg-white text-indigo-900 font-bold rounded-xl  hover:bg-indigo-50 transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Get Started. It's free
                    </Link>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
    );
}

function BenefitItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="p-2 rounded-lg bg-white/5">
                {icon}
            </div>
            <div>
                <h3 className="font-semibold text-white text-sm md:text-base">{title}</h3>
                <p className="text-indigo-200/80 text-xs md:text-sm mt-0.5">{description}</p>
            </div>
        </div>
    );
}
