import { db } from "./firebase";
import { collection, query, where, getDocs, doc, getDoc, limit } from "firebase/firestore";
import { CareerPath } from '@/types/career';

export { CareerPath };

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

interface ToolRecord {
    id: string;
    name?: string;
    description?: string;
    clusters?: string | string[];
    isActive?: boolean;
    [key: string]: unknown;
}

const normalizeCluster = (str: string): string => {
    return str.toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^\w\s]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/-/g, '_')
        .replace(/^_+|_+$/g, '');
};

export const getCareerTools = async (careerCluster?: string): Promise<ToolRecord[]> => {
    try {
        const toolsRef = collection(db, "career_tools");
        const q = query(toolsRef, where("isActive", "==", true));
        const snapshot = await getDocs(q);

        const tools: ToolRecord[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }) as ToolRecord);

        if (!careerCluster) return tools;

        const targetCluster = normalizeCluster(careerCluster);

        return tools.filter((tool: ToolRecord) => {
            if (!tool.clusters) return false;
            const clusters = Array.isArray(tool.clusters) ? tool.clusters : [tool.clusters];
            return clusters.some((c) => normalizeCluster(String(c)) === targetCluster);
        });
    } catch (error) {
        console.error("Error fetching career tools:", error);
        return [];
    }
};
