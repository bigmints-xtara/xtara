// Add to existing file
import { db, auth } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { User, EmailAuthProvider, linkWithCredential, updateProfile, updateEmail, signInAnonymously, UserCredential } from "firebase/auth";

export interface UserRole {
    isAdmin: boolean;
    isEditor: boolean;
    isViewer: boolean;
    isStudent: boolean;
    isParent: boolean;
    isEducator: boolean;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    isAnonymous: boolean;
    isEmailVerified: boolean;
    roles: UserRole;
    city?: string;
    state?: string;
    country?: string;
    createdAt?: any;
    updatedAt?: any;
    assessmentResults?: any;
    [key: string]: any;
}

const DEFAULT_ROLES: UserRole = {
    isAdmin: false,
    isEditor: false,
    isViewer: false,
    isStudent: true,
    isParent: false,
    isEducator: false,
};

/**
 * Create an anonymous user with Firestore document
 * Matches Flutter's signInAnonymously implementation
 */
export const createAnonymousUser = async (fullName?: string): Promise<UserCredential> => {
    try {
        // Check if user is already signed in
        const currentUser = auth.currentUser;
        if (currentUser) {
            console.log("User already signed in:", currentUser.uid);
            // Return a mock credential with the existing user
            return { user: currentUser } as UserCredential;
        }

        // Sign in anonymously
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;

        console.log("✅ Anonymous user created:", user.uid);

        // Create user document in Firestore
        try {
            const userRef = doc(db, "users", user.uid);
            const userData: any = {
                uid: user.uid,
                createdAt: serverTimestamp(),
                isAnonymous: true,
                lastLogin: serverTimestamp(),
                ...DEFAULT_ROLES,
            };

            if (fullName) {
                userData.fullName = fullName;
                userData.displayName = fullName;
            }

            await setDoc(userRef, userData);
            console.log("✅ User document created in Firestore");
        } catch (firestoreError) {
            console.error("⚠️ Failed to create user document, but continuing:", firestoreError);
            // Continue even if document creation fails
        }

        return userCredential;
    } catch (error) {
        console.error("❌ Failed to create anonymous user:", error);
        throw new Error(`Failed to sign in anonymously: ${error}`);
    }
};


export const createUserDocument = async (user: User, additionalData: any = {}) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const { email, displayName, isAnonymous, emailVerified } = user;
        const createdAt = serverTimestamp();

        try {
            await setDoc(userRef, {
                uid: user.uid,
                email,
                displayName,
                isAnonymous,
                isEmailVerified: emailVerified,
                createdAt,
                updatedAt: createdAt,
                ...DEFAULT_ROLES,
                ...additionalData,
            });
        } catch (error) {
            console.error("Error creating user document", error);
        }
    }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    if (!uid) return null;
    try {
        const userRef = doc(db, "users", uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
            return snapshot.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile", error);
        return null;
    }
};

export const convertAnonymousUser = async (user: User, email: string, pass: string, name: string) => {
    try {
        // Get the old user document to preserve pendingCareerPathId
        const oldUserId = user.uid;
        const oldUserRef = doc(db, "users", oldUserId);
        const oldUserDoc = await getDoc(oldUserRef);
        const pendingCareerPathId = oldUserDoc.data()?.pendingCareerPathId;

        console.log("🔄 Converting anonymous user:", oldUserId);
        if (pendingCareerPathId) {
            console.log("📌 Preserving pendingCareerPathId:", pendingCareerPathId);
        }

        // Refresh the user's token to prevent expiration errors
        try {
            await user.reload();
            await user.getIdToken(true); // Force token refresh
            console.log("✅ Token refreshed successfully");
        } catch (tokenError) {
            console.warn("⚠️ Token refresh failed, continuing anyway:", tokenError);
        }

        // Mark conversion in progress
        await updateDoc(oldUserRef, {
            oldUserId: oldUserId,
            conversionInProgress: true,
        });

        const credential = EmailAuthProvider.credential(email, pass);
        const userCred = await linkWithCredential(user, credential);
        const newUser = userCred.user;

        await updateProfile(newUser, { displayName: name });

        // Update Firestore with preserved data
        const userRef = doc(db, "users", newUser.uid);
        const updateData: any = {
            email: email,
            displayName: name,
            fullName: name,
            isAnonymous: false,
            convertedAt: serverTimestamp(),
            oldUserId: oldUserId,
            conversionInProgress: false, // Mark as complete
            updatedAt: serverTimestamp()
        };

        // Preserve pendingCareerPathId if it exists
        if (pendingCareerPathId) {
            updateData.pendingCareerPathId = pendingCareerPathId;
        }

        await updateDoc(userRef, updateData);

        console.log("✅ Anonymous user converted successfully");
        return newUser;
    } catch (error: any) {
        console.error("❌ Error converting anonymous user:", error);

        // Provide more helpful error messages
        if (error.code === 'auth/user-token-expired') {
            throw new Error("Your session has expired. Please refresh the page and try again.");
        } else if (error.code === 'auth/email-already-in-use') {
            throw new Error("This email is already registered. Please log in instead.");
        } else if (error.code === 'permission-denied' || error.message?.includes('permission')) {
            throw new Error("Unable to update your account. Please refresh the page and try again.");
        }

        // Cleanup on error
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await updateDoc(doc(db, "users", currentUser.uid), {
                    conversionInProgress: false,
                });
            }
        } catch (cleanupError) {
            console.error("⚠️ Cleanup error:", cleanupError);
        }

        throw error;
    }
};
