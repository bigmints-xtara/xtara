import { db } from './firebase';
import { collection, query, where, orderBy, getDocs, Timestamp, limit, doc, getDoc } from 'firebase/firestore';

// --- Interfaces matching Flutter Models ---

export interface StorySlide {
    title: string;
    description: string;
    image?: string;
    hyperlink?: string;
    hyperlinkText?: string;
    date?: string;
}

export interface Story {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string; // derived from career_clusters[0] for display
    publishedAt?: Date;
    publishedUntil?: Date;
    career_clusters: string[];
    slides: StorySlide[];
}

export interface GoodRead {
    id: string;
    title: string;
    image: string;
    publishedAt?: Date;
    publishUntil?: Date;
    summary?: string;
    hyperlink?: string;
    content?: string;
}

export interface ChallengeQuestion {
    id: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
}

export interface Challenge {
    id: string;
    title: string;
    image: string;
    publishedAt?: Date;
    publishUntil?: Date;
    content?: string;
    points?: number;
    questions?: ChallengeQuestion[];
}

export interface GameInstance {
    id: string;
    title: string;
    mode: string; // 'quiz', 'puzzle', 'memory'
    isPublished: boolean;
    schedule: {
        startDateTime: Date;
        endDateTime: Date;
    };
}

export interface SparkSlide {
    title?: string;
    content?: string;
    image?: string;
}

export interface SparkQuestion {
    id: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
}

export interface Spark {
    id: string;
    title: string;
    type: string;
    published?: boolean;
    hook?: SparkSlide;
    context?: SparkSlide;
    concept?: SparkSlide;
    example?: SparkSlide;
    takeaway?: SparkSlide;
    questions?: SparkQuestion[];
    rewardPerQuestion?: number;
    medalPoints?: number;
}

// --- Service Class ---

export const FirestoreService = {

    // STORIES
    async getStoriesForHome(limitCount = 5): Promise<Story[]> {
        try {
            const now = new Date();
            // Calculate next 12 hours for time window logic (matching Flutter's next12Hours)
            const next12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);

            const q = query(
                collection(db, 'stories'),
                where('published', '==', true),
                orderBy('publishedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const stories: Story[] = [];

            for (const doc of snapshot.docs) {
                if (stories.length >= limitCount) break;

                const data = doc.data();
                const publishedAt = data.publishedAt?.toDate();
                const publishUntil = data.publishedUntil?.toDate();

                // 1. Must implement Flutter's Date Logic
                let isValid = false;

                if (publishedAt) {
                    // Case A: Has publishUntil
                    if (publishUntil) {
                        if (now >= publishedAt && now <= publishUntil) {
                            // "Display stories for next 12 hours max" logic from Flutter
                            if (publishedAt < next12Hours) {
                                isValid = true;
                            }
                        }
                    }
                    // Case B: No publishUntil
                    else {
                        if (now >= publishedAt && publishedAt < next12Hours) {
                            isValid = true;
                        }
                    }
                }

                if (isValid) {
                    stories.push({
                        id: doc.id,
                        title: data.title || '',
                        description: data.description || '',
                        image: data.image || '',
                        category: (data.career_clusters && data.career_clusters.length > 0)
                            ? data.career_clusters[0]
                            : 'General',
                        publishedAt,
                        publishedUntil: publishUntil,
                        career_clusters: data.career_clusters || [],
                        slides: (data.slides || []).map((slide: any) => ({
                            title: slide.title || '',
                            description: slide.description || '',
                            image: slide.image,
                            hyperlink: slide.hyperlink,
                            hyperlinkText: slide.hyperlinkText,
                            date: slide.date
                        }))
                    });
                }
            }
            return stories;
        } catch (e) {
            console.error("Error fetching stories:", e);
            return [];
        }
    },

    // GOOD READS
    async getGoodReadsForHome(limitCount = 5): Promise<GoodRead[]> {
        try {
            const now = new Date();
            const q = query(
                collection(db, 'good_reads'),
                where('published', '==', true),
                orderBy('publishedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const items: GoodRead[] = [];

            for (const doc of snapshot.docs) {
                if (items.length >= limitCount) break;
                const data = doc.data();
                const publishedAt = data.publishedAt?.toDate();
                const publishUntil = data.publishedUntil?.toDate();

                let isValid = false;
                if (publishedAt) {
                    if (publishUntil) {
                        if (now >= publishedAt && now <= publishUntil) isValid = true;
                    } else {
                        if (now >= publishedAt) isValid = true;
                    }
                } else {
                    // "If no publishedAt, assume it's published" (Flutter logic line 215)
                    isValid = true;
                }

                if (isValid) {
                    items.push({
                        id: doc.id,
                        title: data.title || '',
                        image: data.image || '',
                        publishedAt,
                        publishUntil
                    });
                }
            }
            return items;
        } catch (e) {
            console.error("Error fetching good reads:", e);
            return [];
        }
    },

    async getGoodReadById(id: string): Promise<GoodRead | null> {
        try {
            const docRef = doc(db, 'good_reads', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    title: data.title || '',
                    image: data.image || '',
                    summary: data.summary || data.content || '',
                    hyperlink: data.hyperlink || '',
                    content: data.content || '',
                    publishedAt: data.publishedAt?.toDate(),
                    publishUntil: data.publishUntil?.toDate()
                } as GoodRead;
            }
            return null;
        } catch (e) {
            console.error("Error fetching good read by id:", e);
            return null;
        }
    },

    // CHALLENGES
    async getChallengesForHome(limitCount = 5): Promise<Challenge[]> {
        try {
            const now = new Date();
            const next12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);

            const q = query(
                collection(db, 'challenges'),
                where('published', '==', true),
                orderBy('publishedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const items: Challenge[] = [];

            for (const doc of snapshot.docs) {
                if (items.length >= limitCount) break;
                const data = doc.data();
                const publishedAt = data.publishedAt?.toDate();

                let publishUntil: Date | undefined;
                if (data.publishUntil) {
                    // Flutter handles this sometimes as string, sometimes as timestamp
                    if (data.publishUntil instanceof Timestamp) {
                        publishUntil = data.publishUntil.toDate();
                    } else if (typeof data.publishUntil === 'string') {
                        publishUntil = new Date(data.publishUntil);
                    }
                }

                // Logic from challenge_service.dart
                let isValid = false;
                if (publishedAt) {
                    if (publishUntil) {
                        if (now >= publishedAt && now <= publishUntil) {
                            if (publishedAt < next12Hours) isValid = true; // 12-hour window logic
                        }
                    } else {
                        if (now >= publishedAt && publishedAt < next12Hours) isValid = true;
                    }
                } else {
                    // "If no publishedAt, include it" (Flutter logic line 207)
                    isValid = true;
                }

                if (isValid) {
                    items.push({
                        id: doc.id,
                        title: data.title || '',
                        image: data.image || '',
                        publishedAt,
                        publishUntil
                    });
                }
            }
            return items;
        } catch (e) {
            console.error("Error fetching challenges:", e);
            return [];
        }
    },

    async getChallengeById(id: string): Promise<Challenge | null> {
        try {
            const docRef = doc(db, 'challenges', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    title: data.title || '',
                    image: data.image || '',
                    content: data.content || '',
                    points: data.points || 10,
                    questions: data.questions || [],
                    publishedAt: data.publishedAt?.toDate(),
                    publishUntil: data.publishUntil?.toDate()
                } as Challenge;
            }
            return null;
        } catch (e) {
            console.error("Error fetching challenge by id:", e);
            return null;
        }
    },

    // GAMES
    async getPlayableGames(limitCount = 5): Promise<GameInstance[]> {
        try {
            const now = new Date();
            const q = query(
                collection(db, 'game_instances'),
                where('isPublished', '==', true)
            );

            const snapshot = await getDocs(q);
            const games: GameInstance[] = [];

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const startDateTime = data.schedule?.startDateTime?.toDate();
                const endDateTime = data.schedule?.endDateTime?.toDate();

                if (startDateTime && endDateTime) {
                    // Check if active (Flutter logic line 40 of GameSchedule)
                    if (now >= startDateTime && now <= endDateTime) {
                        games.push({
                            id: doc.id,
                            title: data.title || '',
                            mode: data.mode || 'quiz',
                            isPublished: data.isPublished,
                            schedule: { startDateTime, endDateTime }
                        });
                    }
                }
            }
            return games.slice(0, limitCount);
        } catch (e) {
            console.error("Error fetching games:", e);
            return [];
        }
    },

    // SPARKS
    async getSparksForHome(limitCount = 5): Promise<Spark[]> {
        try {
            const q = query(
                collection(db, 'sparks'),
                where('published', '==', true),
                where('draft', '==', false),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title || '',
                type: doc.data().type || 'sparks',
                published: doc.data().published
            }));
        } catch (e) {
            console.error("Error fetching sparks:", e);
            return [];
        }
    },

    // Get full story by ID with all slides
    async getStoryById(storyId: string): Promise<Story | null> {
        try {
            const { doc, getDoc } = await import('firebase/firestore');
            const storyRef = doc(db, 'stories', storyId);
            const snapshot = await getDoc(storyRef);
            
            if (!snapshot.exists()) {
                return null;
            }

            const data = snapshot.data();
            const publishedAt = data.publishedAt?.toDate();
            const publishUntil = data.publishedUntil?.toDate();

            return {
                id: snapshot.id,
                title: data.title || '',
                description: data.description || '',
                image: data.image || '',
                category: (data.career_clusters && data.career_clusters.length > 0)
                    ? data.career_clusters[0]
                    : 'General',
                publishedAt,
                publishedUntil: publishUntil,
                career_clusters: data.career_clusters || [],
                slides: (data.slides || []).map((slide: any) => ({
                    title: slide.title || '',
                    description: slide.description || '',
                    image: slide.image,
                    hyperlink: slide.hyperlink,
                    hyperlinkText: slide.hyperlinkText,
                    date: slide.date
                }))
            };
        } catch (e) {
            console.error("Error fetching story:", e);
            return null;
        }
    },

    // Mark story as watched for a user
    async markStoryWatched(userId: string, storyId: string): Promise<void> {
        try {
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
            const progressRef = doc(db, 'users', userId, 'story_progress', storyId);
            await setDoc(progressRef, {
                storyId,
                watchedAt: serverTimestamp(),
                completed: true
            });
        } catch (e) {
            console.error("Error marking story as watched:", e);
        }
    },

    // Check if story has been watched by user
    async isStoryWatched(userId: string, storyId: string): Promise<boolean> {
        try {
            const { doc, getDoc } = await import('firebase/firestore');
            const progressRef = doc(db, 'users', userId, 'story_progress', storyId);
            const snapshot = await getDoc(progressRef);
            return snapshot.exists() && snapshot.data()?.completed === true;
        } catch (e) {
            console.error("Error checking story watch status:", e);
            return false;
        }
    },

    async getSparkById(id: string): Promise<Spark | null> {
        try {
            const docRef = doc(db, 'sparks', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    title: data.title || '',
                    type: data.type || '',
                    hook: data.hook,
                    context: data.context,
                    concept: data.concept,
                    example: data.example,
                    takeaway: data.takeaway,
                    questions: data.questions || [],
                    rewardPerQuestion: data.rewardPerQuestion || 2,
                    medalPoints: data.medalPoints || 0,
                    published: data.published
                } as Spark;
            }
            return null;
        } catch (e) {
            console.error("Error fetching spark by id:", e);
            return null;
        }
    }
};
