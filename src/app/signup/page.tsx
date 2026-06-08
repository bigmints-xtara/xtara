"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createUserDocument, convertAnonymousUser } from "@/lib/firebase/auth-helpers";
import { Suspense } from "react";

function SignupContent() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const careerPathId = searchParams.get('careerPathId');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (auth.currentUser && auth.currentUser.isAnonymous) {
                // Anonymous user -> Link credential to keep data
                await convertAnonymousUser(auth.currentUser, email, password, name);

                // Navigate to career path if available, otherwise home
                if (careerPathId) {
                    router.push(`/assessment/results/${careerPathId}`);
                } else {
                    router.push("/");
                }
            } else {
                // New user
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                await createUserDocument(userCredential.user, { displayName: name });
                router.push("/");
            }
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err.message || "Failed to create account. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <div className="w-full max-w-md p-8 bg-card rounded-lg  border border-border">
                <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>

                {error && <p className="text-destructive mb-4">{error}</p>}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 rounded bg-input border border-input focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
                            required
                        />
                    </div>
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
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <p className="mt-6 text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <SignupContent />
        </Suspense>
    );
}
