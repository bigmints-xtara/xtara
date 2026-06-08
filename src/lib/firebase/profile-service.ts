import { auth, db } from './firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export async function updatePersonalInfo(userId: string, displayName: string, fullName: string) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            displayName: displayName.trim(),
            fullName: fullName.trim(),
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error updating personal info:', error);
        throw error;
    }
}

export async function updateAcademicProfile(userId: string, academicData: {
    currentGrade?: string;
    educationBoard?: string;
    currentStream?: string;
    grade12Streams?: string[];
}) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...academicData,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error updating academic profile:', error);
        throw error;
    }
}

export async function updateSubjects(userId: string, subjects: string[]) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            subjectsLearning: subjects,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error updating subjects:', error);
        throw error;
    }
}

export async function updateExamMarks(userId: string, examMarks: Record<string, number>) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            exam_performance: {
                marks: examMarks,
                timestamp: new Date()
            },
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error updating exam marks:', error);
        throw error;
    }
}

export async function updatePursuingCareer(userId: string, careerId: string) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            pursuingCareer: careerId,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error updating pursuing career:', error);
        throw error;
    }
}

export async function updateLocation(userId: string, city: string, state: string, country: string) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            city: city.trim(),
            state: state.trim(),
            country: country.trim(),
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error updating location:', error);
        throw error;
    }
}

export async function getAssessmentData(userId: string) {
    try {
        // Fetch data from the 'assessments' collection using userId as document ID
        // This matches the Flutter implementation in assessment_controller.dart
        const assessmentRef = doc(db, 'assessments', userId);
        const assessmentDoc = await getDoc(assessmentRef);

        if (!assessmentDoc.exists()) {
            return null;
        }

        const data = assessmentDoc.data();

        // The assessment data is stored in a 'results' field
        // Return the results object which contains all assessment fields
        return data.results || data;
    } catch (error) {
        console.error('Error fetching assessment data:', error);
        throw error;
    }
}
