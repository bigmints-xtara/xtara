import { db } from "./firebase";
import { collection, query, where, getDocs, doc, getDoc, DocumentData, limit } from "firebase/firestore";

export interface CareerPath {
    id: string;
    title: string;
    description: string;
    whatYouDo?: string;
    whyItMatters?: string;
    salary?: string;
    education?: string;
    technicalSkills?: string[];
    softSkills?: string[];
    courses?: any[];
    careerPathway?: string[];
    relatedCareers?: any[];
    archetypes?: string[];
    matchScore?: number;
    quote?: string;
    dreamTitle?: string;
    notablePeople?: any[];
    ragOutput?: any;
    topInstitutions?: any[];
    onlineTrainings?: any[];
    toolsAndSoftware?: any[];
    governmentExams?: any[];
    primaryCareer?: {
        courses?: any[];
        careerCluster?: string;
        [key: string]: any;
    };
    grow?: {
        careerPathway?: any[];
        expectedSalaryRange?: string;
        [key: string]: any;
    };
    expectedSalaryRange?: string;
    [key: string]: any;
}

export const getUserCareerPaths = async (userId: string): Promise<CareerPath[]> => {
    try {
        const q = query(collection(db, "career_paths"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as CareerPath));
    } catch (error) {
        console.error("Error fetching career paths", error);
        return [];
    }
};

export const getCareerPathById = async (pathId: string): Promise<CareerPath | null> => {
    try {
        const docRef = doc(db, "career_paths", pathId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { ...docSnap.data(), id: docSnap.id } as CareerPath;
        } else {
            // Try searching by 'id' field if document ID doesn't match
            const q = query(collection(db, "career_paths"), where("id", "==", pathId), limit(1));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id } as CareerPath;
            }
            return null;
        }
    } catch (error) {
        console.error("Error fetching career path", error);
        return null;
    }
};

export const getCareerTools = async (careerCluster?: string): Promise<any[]> => {
    try {
        const toolsRef = collection(db, "career_tools");
        // FIX: User screenshot shows 'isActive' boolean, not 'status' string
        const q = query(toolsRef, where("isActive", "==", true));
        const snapshot = await getDocs(q);

        const tools = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (!careerCluster) return tools;

        // Normalization function that handles emojis and special chars properly
        const normalize = (str: string) => {
            return str.toLowerCase()
                .replace(/&/g, 'and')       // Replace & with 'and' FIRST
                .replace(/[^\w\s]/g, '')    // Remove emojis and special chars
                .trim()                     // Remove leading/trailing spaces
                .replace(/\s+/g, '_')       // Spaces to underscore
                .replace(/-/g, '_')         // Dashes to underscore
                .replace(/^_+|_+$/g, '');   // Remove leading/trailing underscores
        };

        const targetCluster = normalize(careerCluster);

        return tools.filter((tool: any) => {
            if (!tool.clusters) return false;
            const clusters = Array.isArray(tool.clusters) ? tool.clusters : [tool.clusters];
            return clusters.some((c: any) => normalize(c.toString()) === targetCluster);
        });
    } catch (error) {
        console.error("Error fetching career tools:", error);
        return [];
    }
};
