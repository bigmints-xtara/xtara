"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserDocument } from "@/lib/firebase/auth-helpers";
import { getUserCareerPath } from "@/lib/firebase/assessment";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const getFriendlyError = (err: any) => {
        const code = err?.code as string | undefined;
        switch (code) {
            case "auth/popup-closed-by-user":
                return "Sign-in was cancelled. Please try again.";
            case "auth/invalid-credential":
                return "Incorrect email or password. Please try again.";
            case "auth/user-not-found":
                return "We couldn't find an account with that email.";
            case "auth/wrong-password":
                return "Incorrect email or password. Please try again.";
            case "auth/too-many-requests":
                return "Too many attempts. Please wait a moment and try again.";
            case "auth/network-request-failed":
                return "Network issue. Check your connection and try again.";
            default:
                return err?.message || "Something went wrong. Please try again.";
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);

            // Check if user has career path
            const user = auth.currentUser;
            if (user) {
                const careerPath = await getUserCareerPath(user.uid);
                if (!careerPath) {
                    router.push("/assessment");
                } else {
                    router.push("/");
                }
            } else {
                router.push("/");
            }
        } catch (err: any) {
            setError(getFriendlyError(err));
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        setLoading(true);
        setError("");

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Create user document if it doesn't exist (new Google user)
            await createUserDocument(user);

            // Check if user has completed assessment and has a career path
            const careerPath = await getUserCareerPath(user.uid);

            if (!careerPath) {
                // No career path found, redirect to assessment
                console.log("No career path found for user, redirecting to assessment");
                router.push("/assessment");
            } else {
                // User has career path, go to home
                router.push("/");
            }
        } catch (err: any) {
            console.error("Google sign-in error:", err);
            setError(getFriendlyError(err));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-md p-6 md:p-8 md:bg-card md:rounded-lg md: md:border md:border-border">
                <h1 className="text-3xl font-bold mb-6 text-center">Welcome Back</h1>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded bg-input border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded bg-input border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        )}
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <div className="mt-4 flex items-center justify-between">
                    <hr className="w-full border-border" />
                    <span className="px-2 text-muted-foreground">OR</span>
                    <hr className="w-full border-border" />
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full mt-4 py-2 bg-secondary text-secondary-foreground rounded font-semibold hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {!loading && (
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                        >
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.806 32.657 29.337 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.955 3.045l5.657-5.657C34.051 6.053 29.29 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.027 12 24 12c3.059 0 5.842 1.154 7.955 3.045l5.657-5.657C34.051 6.053 29.29 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                            <path fill="#4CAF50" d="M24 44c5.214 0 9.939-1.993 13.515-5.243l-6.24-5.283C29.271 35.091 26.777 36 24 36c-5.315 0-9.77-3.317-11.297-7.946l-6.5 5.007C9.523 39.556 16.278 44 24 44z"/>
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-0.769 2.155-2.295 3.99-4.328 5.144l6.24 5.283C39.314 36.533 44 32 44 24c0-1.341-.138-2.651-.389-3.917z"/>
                        </svg>
                    )}
                    {loading && (
                        <div className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
                    )}
                    {loading ? "Signing in..." : "Sign in with Google"}
                </button>

                <p className="mt-6 text-center text-muted-foreground">
                    Get started —{" "}
                    <Link href="/assessment" className="text-primary hover:underline">
                        start assessment
                    </Link>
                </p>
            </div>
        </div>
    );
}
