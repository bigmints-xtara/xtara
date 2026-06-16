import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { QuestionModel } from '../types';

const CONFIG_COLLECTION = 'configurations';
const QUESTIONNAIRE_KEY = 'questionnaire_json';
const ASSESSMENTS_COLLECTION = 'assessments';
const USERS_COLLECTION = 'users';

export const AssessmentService = {
  async getQuestionnaire(): Promise<QuestionModel[]> {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, QUESTIONNAIRE_KEY);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const steps = data.steps || [];
        return steps as QuestionModel[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      return [];
    }
  },

  async saveAssessmentResults(userId: string, results: Record<string, any>, isRetake: boolean = false): Promise<void> {
    try {
      const cleanData = { ...results };
      delete cleanData.skippedFields;

      // 1. Save to assessments collection
      const assessmentRef = doc(db, ASSESSMENTS_COLLECTION, userId);
      await setDoc(assessmentRef, {
        userId,
        results: cleanData,
        timestamp: serverTimestamp(),
        isRetake,
      }, { merge: true });

      // 2. Update user profile
      const userRef = doc(db, USERS_COLLECTION, userId);
      await setDoc(userRef, {
        ...cleanData,
        lastAssessmentUpdate: serverTimestamp(),
        assessmentCompleted: true,
        isRetakeAssessment: isRetake,
        updatedAt: serverTimestamp(),
      }, { merge: true });

    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    }
  },

  async hasCompletedAssessment(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return !!data.assessmentCompleted;
      }
      return false;
    } catch (error) {
      console.error('Error checking assessment status:', error);
      return false;
    }
  }
};
