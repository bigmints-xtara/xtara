"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAnonymousUser } from "@/lib/firebase/auth-helpers";
import Navbar from "@/components/layout/Navbar";
import LocationStep from "@/components/assessment/LocationStep";
import AssessmentEngine from "@/components/assessment/AssessmentEngine";
import { getQuestionnaire, saveAssessment, generateRecommendations, waitForCareerPath } from "@/lib/firebase/assessment";
import { useAuth } from "@/context/AuthContext";
import { Question, LocationData, AssessmentAnswers } from "@/types/assessment";

export default function AssessmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState<'loading' | 'location' | 'questions' | 'processing' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  useEffect(() => {
    // Prevent re-initialization if already loading questions or processing
    if (questions.length > 0 || step === 'processing' || step === 'error') return;

    async function init() {
      // Load Questions
      const qs = await getQuestionnaire();
      if (qs.length > 0) {
        setQuestions(qs);
        setStep('location');
      } else {
        setErrorMsg("Failed to load assessment. Please try again.");
        setStep('error');
      }
    }
    init();
  }, []); // Remove user/authLoading dependencies to prevent reset on anonymous auth creation


  const handleLocationComplete = (data: LocationData) => {
    setLocationData(data);
    setStep('questions');
  };

  const handleAssessmentComplete = async (answers: AssessmentAnswers) => {
    // Immediately show processing state for smooth UX
    setStep('processing');

    let currentUser = user;

    try {
      if (!currentUser) {
        console.log("No user logged in, creating anonymous user...");
        const fullName = answers['fullName'] || 'Guest';
        const cred = await createAnonymousUser(fullName);
        currentUser = cred.user as any;
      }

      if (!currentUser) {
        throw new Error("Authentication failed");
      }



      const userId = currentUser.uid;

      const fullData = {
        ...locationData,
        ...answers,
        fullName: answers['fullName'] || currentUser.displayName || 'Guest',
        completedAt: new Date().toISOString()
      };

      // 1. Save
      await saveAssessment(userId, fullData);

      // 2. Generate (with aligned payload)
      await generateRecommendations(userId, fullData);

      // 3. Poll for Career Path
      const careerPathId = await waitForCareerPath(userId);

      if (careerPathId) {
        router.push(`/assessment/results/${careerPathId}`);
      } else {
        throw new Error("Taking longer than expected. Please check your dashboard later.");
      }

    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Something went wrong.");
      setStep('error');
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500 mb-6"></div>
        <h2 className="text-xl font-semibold mb-2">Preparing your results</h2>
        <p className="text-sm text-gray-500 max-w-md">
          We’re matching your answers to the best paths. This may take a moment.
        </p>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-sky-500 text-white rounded-lg font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-6 pb-28">

        {step === 'location' && (
          <LocationStep onComplete={handleLocationComplete} />
        )}

        {step === 'questions' && (
          <AssessmentEngine
            questions={questions}
            onComplete={handleAssessmentComplete}
          />
        )}

      </div>
    </div>
  );
}
