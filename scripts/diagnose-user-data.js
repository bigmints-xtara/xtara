// Diagnostic Script to Check User Profile and Career Path Data
// Run this in the browser console while logged in

async function diagnoseUserData() {
    const { auth, db } = window;
    const { getDoc, doc, collection, query, where, getDocs } = window.firebase.firestore;

    const user = auth.currentUser;
    if (!user) {
        console.error("❌ No user logged in");
        return;
    }

    console.log("🔍 Diagnosing user data for:", user.uid);
    console.log("📧 Email:", user.email);
    console.log("👤 Display Name:", user.displayName);
    console.log("🔐 Is Anonymous:", user.isAnonymous);

    // Check user profile document
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("\n✅ User Profile Document:");
        console.log("  - fullName:", userData.fullName);
        console.log("  - displayName:", userData.displayName);
        console.log("  - pursuingCareer:", userData.pursuingCareer);
        console.log("  - pendingCareerPathId:", userData.pendingCareerPathId);
        console.log("  - assessmentCompleted:", userData.assessmentCompleted);
        console.log("  - Full data:", userData);
    } else {
        console.error("❌ User profile document not found!");
    }

    // Check for career paths
    const careerPathsQuery = query(
        collection(db, 'career_paths'),
        where('userId', '==', user.uid)
    );

    const careerPathsSnapshot = await getDocs(careerPathsQuery);
    console.log(`\n📊 Found ${careerPathsSnapshot.size} career path(s)`);

    careerPathsSnapshot.forEach((doc) => {
        console.log(`  - Career Path ID: ${doc.id}`);
        console.log(`    Title: ${doc.data().title}`);
        console.log(`    Assessment ID: ${doc.data().assessmentId}`);
    });

    // Check assessment document
    const assessmentRef = doc(db, 'assessments', user.uid);
    const assessmentDoc = await getDoc(assessmentRef);

    if (assessmentDoc.exists()) {
        console.log("\n✅ Assessment Document exists");
        console.log("  - Timestamp:", assessmentDoc.data().timestamp);
    } else {
        console.log("\n⚠️ No assessment document found");
    }
}

// Run diagnosis
diagnoseUserData().catch(console.error);
