import { db, functions } from "./firebase";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    serverTimestamp,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { Question } from "@/types/assessment";

const QUESTIONNAIRE_KEY = 'questionnaire_json';

export async function getQuestionnaire(): Promise<Question[]> {
    try {
        const docRef = doc(db, 'configurations', QUESTIONNAIRE_KEY);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            console.warn('Questionnaire document not found');
            return [];
        }

        const data = snapshot.data();
        let steps: any[] = [];

        if (data.value && typeof data.value === 'string') {
            try {
                const parsed = JSON.parse(data.value);
                steps = parsed.steps || [];
            } catch (e) {
                console.error("Failed to parse questionnaire JSON string", e);
                return [];
            }
        } else if (data.steps) {
            steps = data.steps;
        }

        // Map to our Question interface
        return steps.map(step => ({
            ...step,
            fieldType: step.fieldType || step.type // Handle both keys if present
        })) as Question[];

    } catch (error) {
        console.error("Error fetching questionnaire:", error);
        return [];
    }
}

export async function saveAssessment(userId: string, data: any, isRetake: boolean = false): Promise<string> {
    try {
        const assessmentRef = doc(db, 'assessments', userId);
        const userRef = doc(db, 'users', userId);

        let cleanData = { ...data };
        delete cleanData.skippedFields;
        delete cleanData.isRetake;

        // If retake, merge with existing (logic simplified for Web MVP, can assume overwrite/merge is handled by simple spread for now or strict merge if needed)
        // For MVP we just overwrite/set for simplicity, mirroring Flutter's set({ merge: true }) equivalent logic

        await setDoc(assessmentRef, {
            userId,
            results: cleanData,
            timestamp: serverTimestamp(),
            isAnonymous: false, // Web users usually logged in, or anonymous auth handled
            isRetake
        }, { merge: true });

        // Update user profile
        // Filter sensitive fields if necessary
        const userUpdateData = { ...cleanData, lastAssessmentUpdate: serverTimestamp(), assessmentCompleted: true };
        await setDoc(userRef, userUpdateData, { merge: true });

        return userId;
    } catch (error) {
        console.error("Error saving assessment:", error);
        throw error;
    }
}

// Helper to format data like Flutter's _formatAssessmentData
function formatAssessmentData(data: any): any {
    // Extract results if nested
    let results = data;
    while (results && results.results) {
        results = results.results;
    }

    const currentGrade = results.currentGrade;
    const isGrade12 = currentGrade === 'grade12';

    return {
        fullName: results.fullName,
        age: results.age || 18,
        currentGrade: currentGrade,
        interests: results.interests || [],
        personalityTraits: results.personalityTraits || [],
        careerGoals: results.careerGoals || [],
        financialBackground: results.financialBackground,
        parentalInfluence: results.parentalInfluence,
        exciters: results.exciters || [],
        grade12Streams: isGrade12 ? (results.grade12Streams || []) : [],
        grade12ScienceStrengths: isGrade12 ? (results.grade12ScienceStrengths || []) : [],
        grade12ScienceWeaknesses: isGrade12 ? (results.grade12ScienceWeaknesses || []) : [],
        grade10Strengths: !isGrade12 ? (results.grade10Strengths || []) : [],
        grade10Weaknesses: !isGrade12 ? (results.grade10Weaknesses || []) : [],
    };
}

// Helper to convert timestamps (simplified for JS/JSON)
function convertTimestamps(data: any): any {
    if (data && typeof data === 'object') {
        // If it's a Firestore Timestamp object (seconds/nanoseconds), we might want to convert or keep as is.
        // Flutter converts to {seconds, nanoseconds} map if it's a Timestamp object.
        // JSON.stringify will handle plain objects.
        // If we have Date objects, convert to ISO string.
        if (data instanceof Date) {
            return data.toISOString();
        }

        if (Array.isArray(data)) {
            return data.map(item => convertTimestamps(item));
        }

        const newObj: any = {};
        for (const key in data) {
            newObj[key] = convertTimestamps(data[key]);
        }
        return newObj;
    }
    return data;
}

export async function generateRecommendations(assessmentId: string, assessmentData: any) {
    try {
        const generateFunc = httpsCallable(functions, 'generateCareerPathRAG');

        const formattedData = formatAssessmentData(assessmentData);
        const serializedData = convertTimestamps(formattedData);

        // Parameters matching Flutter's AIRecommendationService
        const params = {
            assessmentId,
            assessmentData: serializedData,
            useVectorSearch: false, // Default to Firestore mode
            // customWeights can be added here if needed, Flutter adds default weights if searchMode is false
            customWeights: {
                interests: 0.3,
                personalityTraits: 0.25,
                careerGoals: 0.25,
                financialBackground: 0.1,
                parentalInfluence: 0.1,
            }
        };

        console.log("Calling generateCareerPathRAG with:", params);

        const response = await generateFunc(params);
        return response.data;
    } catch (error) {
        console.error("Error generating recommendations:", error);
        throw error;
    }
}

export async function getCareerPath(documentId: string): Promise<any> {
    try {
        const docRef = doc(db, 'career_paths', documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching career path:", error);
        throw error;
    }
}

export async function waitForCareerPath(assessmentId: string, maxAttempts = 15): Promise<string | null> {
    let attempts = 0;
    let delay = 2000;

    while (attempts < maxAttempts) {
        try {
            const q = query(
                collection(db, 'career_paths'),
                where('assessmentId', '==', assessmentId),
                orderBy('createdAt', 'desc'),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const careerPathId = snapshot.docs[0].id;

                // Store pendingCareerPathId AND pursuingCareer in user document
                try {
                    const userRef = doc(db, 'users', assessmentId);
                    await updateDoc(userRef, {
                        pendingCareerPathId: careerPathId,
                        pursuingCareer: careerPathId, // Set as pursuing career
                        updatedAt: serverTimestamp()
                    });
                    console.log("📌 Stored pendingCareerPathId and pursuingCareer in user document:", careerPathId);
                } catch (updateError) {
                    console.warn("⚠️ Failed to update user document with career path:", updateError);
                    // Continue even if update fails
                }

                return careerPathId;
            }

            console.log(`Polling for career path (attempt ${attempts + 1}/${maxAttempts}), next retry in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Exponential backoff: 2s -> 4s -> 8s -> 16s (max)
            attempts++;
            if (delay < 16000) {
                delay *= 2;
            }
        } catch (error) {
            console.error("Error polling for career path:", error);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempts++;
            if (delay < 16000) {
                delay *= 2;
            }
        }
    }

    return null;
}

/**
 * Get the most recent career path for a user
 * First checks pendingCareerPathId, then pursuingCareer, then queries career_paths collection
 * @param userId - The user's ID
 * @returns Career path data or null
 */
export async function getUserCareerPath(userId: string): Promise<any | null> {
    try {
        // First, check user document for pendingCareerPathId or pursuingCareer
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const careerPathId = userData.pendingCareerPathId || userData.pursuingCareer;

            if (careerPathId) {
                console.log("📌 Found career path ID in user profile:", careerPathId);
                return await getCareerPathById(careerPathId);
            }
        }

        // Fallback: Query career_paths collection by userId
        console.log("🔍 No career path ID in profile, querying career_paths collection...");
        const q = query(
            collection(db, 'career_paths'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const careerPathData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            console.log("✅ Found career path via query:", careerPathData.id);
            return careerPathData;
        }

        console.log("⚠️ No career path found for user:", userId);
        return null;
    } catch (error) {
        console.error("Error fetching user career path:", error);
        return null;
    }
}

/**
 * Get career path by ID
 * @param careerPathId - The career path document ID
 * @returns Career path data or null
 */
export async function getCareerPathById(careerPathId: string): Promise<any | null> {
    try {
        const docRef = doc(db, 'career_paths', careerPathId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching career path by ID:", error);
        return null;
    }
}

/**
 * Get all career paths for a user
 * @param userId - The user ID
 * @returns Array of career paths
 */
export async function getUserCareerPaths(userId: string): Promise<any[]> {
    try {
        const q = query(
            collection(db, 'career_paths'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching user career paths:", error);
        return [];
    }
}

