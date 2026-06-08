import { CareerSlideData } from "@/types/career";

export const generateSlidesFromCareer = (career: any): CareerSlideData[] => {
    // Helper to safely get list
    const getList = (path: string, obj: any = career) => {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return [];
            }
        }
        return Array.isArray(current) ? current : [];
    };

    const getString = (path: string, def: string = "", obj: any = career) => {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return def;
            }
        }
        return typeof current === 'string' ? current : def;
    };

    const getInt = (path: string, def: number = 85, obj: any = career) => {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return def;
            }
        }
        if (typeof current === 'number') {
            if (current <= 1 && current > 0) return Math.round(current * 100);
            return Math.round(current);
        }
        return def;
    };

    const careerTitle = career.title || "Selected Professional";
    const matchScore = getInt('matchScore');
    const matchReasoning = getString('matchReasoning', "This career fits your unique skills and interests.");
    const traits = getList('primaryCareer.traits');
    const archetypeTags = getList('primaryCareer.archetypeTags');
    const whatYouDo = getString('whatYouDo', "You will work on important projects that grow your skills and help society.");
    const expectedSalaryRange = getString('expectedSalaryRange', "A competitive salary with high growth potential.");
    const financialNote = getString('primaryCareer.financialFeasibility.note', "Financial aid and scholarships are often available for this path.");
    const courses = getList('primaryCareer.courses');
    const relatedCareers = getList('relatedCareers');
    const notablePeople = getList('notablePeople');

    const slides: CareerSlideData[] = [
        // 0. Key Recommendation (Intro + Confetti)
        {
            type: 'whyCareerFits',
            title: 'Your Future Career',
            subtitle: `Based on your profile, you should aim at becoming a ${careerTitle}.`,
            slideIcon: 'Trophy',
            buttonLabel: 'Learn Why',
            visualization: 'intro',
            content: [
                {
                    title: `Aim to be a ${careerTitle}`,
                    subtitle: `You have shown exceptional potential for this path with a ${matchScore}% match.`,
                    icon: 'Trophy'
                }
            ]
        },
        // 1. Why this career? (Bento)
        {
            type: 'whyCareerFits',
            title: 'Why this career?',
            subtitle: `You achieved a ${matchScore}% match score for this path.`,
            slideIcon: 'Target',
            buttonLabel: 'Learn More',
            visualization: 'bento',
            content: [
                {
                    title: `${matchScore}% Perfect Match`,
                    subtitle: matchReasoning,
                    icon: 'Target'
                },
                ...(traits.length > 0 ? [{
                    title: `${traits.length} Key Skills Aligned`,
                    subtitle: `Your strengths in ${traits.slice(0, 3).join(', ')}${traits.length > 3 ? ` and ${traits.length - 3} more` : ''} make you ideal for this role.`,
                    icon: 'Sparkles'
                }] : []),
                ...(archetypeTags.length > 0 ? [{
                    title: 'Your Work Style',
                    subtitle: `As ${archetypeTags.slice(0,2).map((tag: string) => `a ${tag}`).join(' and ')}, you'll naturally excel in this environment.`,
                    icon: 'Users'
                }] : [])
            ]
        },
        // 2. What will you do? (Bento)
        {
            type: 'meetDreamCareer',
            title: 'What will you do?',
            subtitle: `A simple overview of your work as a ${careerTitle}.`,
            slideIcon: 'Briefcase',
            buttonLabel: 'See Path',
            visualization: 'bento',
            content: [
                {
                    title: 'Your Mission',
                    subtitle: whatYouDo,
                    icon: 'ClipboardList'
                },
                ...(notablePeople.length > 0 ? [{
                    title: 'People who inspire',
                    subtitle: `Leaders like ${notablePeople[0].name} already do similar work.`,
                    icon: 'Star'
                }] : [])
            ]
        },
        // 3. Earnings & Cost (Bento)
        {
            type: 'whyItMatters',
            title: 'Earnings & Cost',
            subtitle: 'Understanding the financial side of your career.',
            slideIcon: 'CircleDollarSign',
            buttonLabel: 'Learn What to Study',
            visualization: 'bento',
            content: [
                {
                    title: 'Expected Income Range',
                    subtitle: `${expectedSalaryRange} per year (depending on experience and sector).`,
                    icon: 'TrendingUp'
                },
                {
                    title: 'Career Stability',
                    subtitle: 'High demand projected for the next 10+ years with strong job security and growth opportunities.',
                    icon: 'ShieldCheck'
                },
                {
                    title: 'Education Investment',
                    subtitle: financialNote,
                    icon: 'GraduationCap'
                }
            ]
        },
        // 4. What to study? (Grid) - Focused on Degrees with specializations
        {
            type: 'careerPath',
            title: 'What to study?',
            subtitle: 'The educational degrees and specializations required.',
            slideIcon: 'GraduationCap',
            buttonLabel: 'Find Colleges',
            visualization: 'bento',
            content: courses.length > 0 ? courses.flatMap((c: any) => {
                const streams = c.stream;
                const results: any[] = [];
                
                if (streams && Array.isArray(streams) && streams.length > 0) {
                    // If course has streams, create entry for each stream with specialization
                    streams.forEach((stream: any) => {
                        const streamName = stream.name || stream.display_course_name || stream.course_name;
                        const courseName = c.course || c.name || c.title || 'Degree Program';
                        
                        // Use streamName as specialization if available
                        const specialization = streamName;
                        const degreeWithSpec = specialization ? `${courseName} (${specialization})` : courseName;
                        
                        results.push({
                            title: degreeWithSpec,
                            subtitle: `${c.level} level • ${c.duration_year} years`,
                            icon: 'BookOpen'
                        });
                    });
                } else {
                    // No streams, just show the course
                    results.push({
                        title: c.course || 'Degree Program',
                        subtitle: `${c.level} level • ${c.duration_year} years`,
                        icon: 'BookOpen'
                    });
                }
                
                return results;
            }).slice(0, 4) : [
                { title: 'Bachelor\'s Degree', subtitle: 'Undergraduate • 4 years', icon: 'BookOpen' },
                { title: 'Master\'s Degree', subtitle: 'Postgraduate • 2 years', icon: 'GraduationCap' },
                { title: 'Specialized Training', subtitle: 'Professional • 1-2 years', icon: 'Award' }
            ]
        },
        // 5. Other careers (Bento Grid)
        {
            type: 'whyItMatters',
            title: 'Other careers to consider',
            subtitle: 'You might also be interested in these similar paths.',
            slideIcon: 'Compass',
            buttonLabel: 'Next',
            visualization: 'bento',
            content: relatedCareers.length > 0 ? relatedCareers.slice(0, 3).map((rc: any) => {
                const matchScore = rc.matchScore ? getInt('matchScore', 75, rc) : null;
                const description = rc.description || rc.summary || rc.why || 'A related career path that aligns with your skills and interests.';
                
                return {
                    title: rc.title || 'Related Career',
                    subtitle: matchScore 
                        ? `${matchScore}% match • ${description.substring(0, 80)}${description.length > 80 ? '...' : ''}` 
                        : description.substring(0, 100) + (description.length > 100 ? '...' : ''),
                    icon: 'Briefcase'
                };
            }) : [
                { title: 'Policy Analyst', subtitle: '72% match • Research and analyze policy issues to inform decision-making', icon: 'Briefcase' },
                { title: 'Data Scientist', subtitle: '68% match • Extract insights from complex data to drive strategic decisions', icon: 'Briefcase' },
                { title: 'Management Consultant', subtitle: '65% match • Advise organizations on strategic and operational improvements', icon: 'Briefcase' }
            ]
        },
        // 6. How xTara helps you (Bento)
        {
            type: 'xtaraHelps',
            title: "How xTara helps you",
            subtitle: 'Building a bridge between you and your dream career.',
            slideIcon: 'Share2',
            buttonLabel: 'Start Your Journey',
            visualization: 'bento',
            content: [
                { title: 'College Search', subtitle: 'Personalized matching with the best institutions.', icon: 'Search' },
                { title: 'Upskilling', subtitle: 'Micro-courses to build industry-ready skills.', icon: 'Zap' },
                { title: 'Mentor Network', subtitle: 'Direct access to professionals in your field.', icon: 'Users' },
                { title: 'Job Placement', subtitle: 'Career support and job board integration.', icon: 'Trophy' }
            ]
        }
    ];

    return slides;
};
