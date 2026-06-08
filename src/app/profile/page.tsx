"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { User, BarChart2, GraduationCap, Settings, BarChart, RefreshCw, Info, AlertTriangle, LogOut, Trash2, BadgeCheck, BookOpen, MapPin } from "lucide-react";
import { auth } from "@/lib/firebase/firebase";
import { deleteUser, sendEmailVerification, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import EditProfileModal from "@/components/profile/EditProfileModal";
import EditAcademicProfileModal from "@/components/profile/EditAcademicProfileModal";
import ManageSubjectsModal from "@/components/profile/ManageSubjectsModal";
import UpdateExamMarksModal from "@/components/profile/UpdateExamMarksModal";
import EditLocationModal from "@/components/profile/EditLocationModal";
import { useEffect, useMemo, useState } from "react";
import { getUserProfile, UserProfile } from "@/lib/firebase/auth-helpers";
import { updatePersonalInfo, updateAcademicProfile, updateSubjects, updateExamMarks, updateLocation } from "@/lib/firebase/profile-service";

type MenuItem = 'profile' | 'academic' | 'assessment';

export default function ProfilePage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(userProfile);
    const [authUser, setAuthUser] = useState(user);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [verificationSending, setVerificationSending] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteEmail, setDeleteEmail] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<MenuItem>('profile');

    // Modal states
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [editAcademicOpen, setEditAcademicOpen] = useState(false);
    const [manageSubjectsOpen, setManageSubjectsOpen] = useState(false);
    const [updateMarksOpen, setUpdateMarksOpen] = useState(false);
    const [editLocationOpen, setEditLocationOpen] = useState(false);

    useEffect(() => {
        setProfile(userProfile);
    }, [userProfile]);

    useEffect(() => {
        setAuthUser(user);
    }, [user]);

    // Compute values before early returns (React Hooks rules)
    const displayName = profile?.fullName || profile?.displayName || authUser?.displayName || "User";
    const displayEmail = authUser?.email || profile?.email || "";
    const subjectsLearning = Array.isArray(profile?.subjectsLearning) ? profile?.subjectsLearning : [];
    const examPerformance = profile?.exam_performance;
    const educationBoard = profile?.educationBoard;
    const currentGrade = profile?.currentGrade;
    const stream = profile?.grade12Streams;
    const pursuingCareerId = profile?.pursuingCareer;

    const academicSubtitle = useMemo(() => {
        if (educationBoard && currentGrade) {
            const gradeText = currentGrade === "grade10" ? "Class 10" : "Class 12";
            const boardText = educationBoard.toUpperCase();
            const streamText = stream && currentGrade === "grade12" ? ` - ${String(stream).toUpperCase()}` : "";
            return `${boardText} - ${gradeText}${streamText}`;
        }
        return "Complete your assessment to see academic profile";
    }, [educationBoard, currentGrade, stream]);

    const formatLastUpdated = (value?: any) => {
        if (!value) return "Unknown";
        let date: Date | null = null;

        if (value instanceof Date) {
            date = value;
        } else if (typeof value?.toDate === "function") {
            date = value.toDate();
        } else if (typeof value === "string") {
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) {
                date = parsed;
            }
        } else if (typeof value?.seconds === "number") {
            date = new Date(value.seconds * 1000);
        }

        if (!date) return "Unknown";

        const now = new Date();
        const difference = now.getTime() - date.getTime();
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));

        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        if (days < 7) return `${days} days ago`;
        if (days < 30) {
            const weeks = Math.floor(days / 7);
            return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
        }
        if (days < 365) {
            const months = Math.floor(days / 30);
            return `${months} month${months > 1 ? "s" : ""} ago`;
        }
        const years = Math.floor(days / 365);
        return `${years} year${years > 1 ? "s" : ""} ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/40 text-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        router.push("/");
        return null;
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    const handleRefresh = async () => {
        if (!authUser) return;
        setIsRefreshing(true);
        setVerificationStatus(null);
        try {
            await authUser.reload();
            const refreshedUser = auth.currentUser;
            setAuthUser(refreshedUser);
            if (refreshedUser) {
                const latestProfile = await getUserProfile(refreshedUser.uid);
                setProfile(latestProfile);
            }
        } catch (error) {
            console.error("Error refreshing profile", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleResendVerification = async () => {
        if (!authUser) return;
        setVerificationSending(true);
        setVerificationStatus(null);
        try {
            await sendEmailVerification(authUser);
            setVerificationStatus("Verification email sent!");
        } catch (error) {
            console.error("Error sending verification email", error);
            setVerificationStatus("Failed to send verification email.");
        } finally {
            setVerificationSending(false);
        }
    };

    const handleDeleteProfile = async () => {
        if (!authUser) return;
        const normalizedEmail = deleteEmail.trim().toLowerCase();
        const currentEmail = authUser.email?.toLowerCase();
        if (!normalizedEmail || normalizedEmail !== currentEmail) {
            setDeleteError("Email address does not match your account.");
            return;
        }

        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deleteUser(authUser);
            await signOut(auth);
            router.push("/");
        } catch (error: any) {
            console.error("Error deleting profile", error);
            setDeleteError(error?.message || "Failed to delete profile. Please re-authenticate and try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSavePersonalInfo = async (fullName: string, displayName: string) => {
        if (!user) return;
        await updatePersonalInfo(user.uid, fullName, displayName);
        await handleRefresh();
    };

    const handleSaveAcademicProfile = async (board: string, grade: string, stream?: string) => {
        if (!user) return;
        await updateAcademicProfile(user.uid, {
            educationBoard: board,
            currentGrade: grade,
            ...(stream && { grade12Streams: [stream] })
        });
        await handleRefresh();
    };

    const handleSaveSubjects = async (subjects: string[]) => {
        if (!user) return;
        await updateSubjects(user.uid, subjects);
        await handleRefresh();
    };

    const handleSaveExamMarks = async (marks: Record<string, number>) => {
        if (!user) return;
        await updateExamMarks(user.uid, marks);
        await handleRefresh();
    };

    const handleSaveLocation = async (city: string, state: string, country: string) => {
        if (!user) return;
        await updateLocation(user.uid, city, state, country);
        await handleRefresh();
    };

    const menuItems = [
        { id: 'profile' as MenuItem, label: 'Profile', icon: User, color: 'sky' },
        { id: 'academic' as MenuItem, label: 'Academic', icon: GraduationCap, color: 'emerald' },
        { id: 'assessment' as MenuItem, label: 'Assessment', icon: BarChart2, color: 'purple' },
    ];


    return (
        <div className="min-h-screen bg-muted/40 text-foreground">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
                        <p className="text-muted-foreground">Manage your account settings and preferences</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-card hover:bg-muted/40 rounded-lg transition-colors text-sm font-semibold border border-border"
                    >
                        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                        Refresh Data
                    </button>
                </div>

                {/* 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* User Card */}
                        <div className="bg-card rounded-2xl border border-border p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-lg shadow-blue-500/20">
                                    {displayName ? displayName[0]?.toUpperCase() : "U"}
                                </div>
                                <h2 className="text-lg font-bold text-foreground mb-1">{displayName}</h2>
                                <p className="text-xs text-muted-foreground mb-4 truncate max-w-full">{displayEmail}</p>

                                {/* Verification Status */}
                                {authUser && !authUser.emailVerified ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full mb-4">
                                        <AlertTriangle size={12} className="text-orange-600" />
                                        <span className="text-xs font-bold text-orange-700">Not Verified</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full mb-4">
                                        <BadgeCheck size={12} className="text-green-600" />
                                        <span className="text-xs font-bold text-green-700">Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-card rounded-2xl border border-border p-3">
                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = selectedMenu === item.id;
                                    
                                    // Define explicit classes for each color
                                    const getActiveClasses = () => {
                                        switch (item.color) {
                                            case 'sky':
                                                return 'bg-sky-50 text-sky-700';
                                            case 'green':
                                                return 'bg-green-50 text-green-700';
                                            case 'emerald':
                                                return 'bg-emerald-50 text-emerald-700';
                                            case 'purple':
                                                return 'bg-purple-50 text-purple-700';
                                            case 'red':
                                                return 'bg-red-50 text-red-700';
                                            default:
                                                return 'bg-gray-50 text-gray-700';
                                        }
                                    };
                                    
                                    const getIconColor = () => {
                                        switch (item.color) {
                                            case 'sky':
                                                return 'text-sky-600';
                                            case 'green':
                                                return 'text-green-600';
                                            case 'emerald':
                                                return 'text-emerald-600';
                                            case 'purple':
                                                return 'text-purple-600';
                                            case 'red':
                                                return 'text-red-600';
                                            default:
                                                return 'text-gray-600';
                                        }
                                    };
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedMenu(item.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                                isActive
                                                    ? `${getActiveClasses()} font-semibold`
                                                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                                            }`}
                                        >
                                            <Icon size={18} className={isActive ? getIconColor() : ''} />
                                            <span className="text-sm">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Right Detail Panel */}
                    <div className="lg:col-span-9">
                        <div className="bg-card rounded-2xl border border-border p-6 min-h-[500px]">
                            {/* Profile - Combined Personal, Location, and Account */}
                            {selectedMenu === 'profile' && (
                                <div className="space-y-8">
                                    {/* Personal Information Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
                                                <p className="text-sm text-muted-foreground">Manage your personal details</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setEditProfileOpen(true)}
                                            className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-sm font-bold rounded-lg transition-colors border border-sky-100"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-muted/40 p-4 rounded-xl border border-border">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                                            <p className="text-lg font-semibold text-foreground mt-1">{profile?.fullName || "Not set"}</p>
                                        </div>
                                        <div className="bg-muted/40 p-4 rounded-xl border border-border">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Name</label>
                                            <p className="text-lg font-semibold text-foreground mt-1">{profile?.displayName || "Not set"}</p>
                                        </div>
                                        <div className="bg-muted/40 p-4 rounded-xl border border-border md:col-span-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                                            <p className="text-lg font-semibold text-foreground mt-1">{displayEmail}</p>
                                        </div>
                                    </div>

                                    {authUser && !authUser.emailVerified && (
                                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={18} />
                                                <div className="flex-1">
                                                    <p className="text-orange-900 text-sm font-bold mb-1">Email not verified</p>
                                                    <p className="text-orange-700 text-xs mb-3">Verify your email for account security.</p>
                                                    <button
                                                        onClick={handleResendVerification}
                                                        className="text-xs font-bold text-orange-600 hover:text-orange-800 underline disabled:opacity-50"
                                                        disabled={verificationSending}
                                                    >
                                                        {verificationSending ? "Sending link..." : "Resend Verification Link"}
                                                    </button>
                                                    {verificationStatus && (
                                                        <p className="text-xs text-blue-600 mt-2 font-medium">{verificationStatus}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-border"></div>

                                {/* Location Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground">Location Preferences</h3>
                                                <p className="text-sm text-muted-foreground">Set your location for personalized content</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setEditLocationOpen(true)}
                                            className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-bold rounded-lg transition-colors border border-green-100"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-muted/40 p-4 rounded-xl border border-border">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">City</label>
                                            <p className="text-lg font-semibold text-foreground mt-1">{profile?.city || "Not set"}</p>
                                        </div>
                                        <div className="bg-muted/40 p-4 rounded-xl border border-border">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">State</label>
                                            <p className="text-lg font-semibold text-foreground mt-1">{profile?.state || "Not set"}</p>
                                        </div>
                                        <div className="bg-muted/40 p-4 rounded-xl border border-border">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Country</label>
                                            <p className="text-lg font-semibold text-foreground mt-1">{profile?.country || "Not set"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border"></div>

                                {/* Account Settings Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                            <Settings size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">Account Settings</h3>
                                            <p className="text-sm text-muted-foreground">Manage your account and security</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-muted/40 p-6 rounded-xl border border-border">
                                            <h4 className="text-lg font-bold text-foreground mb-2">Sign Out</h4>
                                            <p className="text-sm text-muted-foreground mb-4">Sign out from your account on this device</p>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 px-6 py-3 bg-card hover:bg-muted/40 text-foreground font-bold rounded-xl transition-all border border-border"
                                            >
                                                <LogOut size={18} />
                                                Logout
                                            </button>
                                        </div>

                                        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                                            <div className="flex items-start gap-3 mb-4">
                                                <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                                                <div>
                                                    <h4 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h4>
                                                    <p className="text-sm text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setDeleteDialogOpen(true);
                                                    setDeleteError(null);
                                                    setDeleteEmail("");
                                                }}
                                                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20"
                                            >
                                                <Trash2 size={18} />
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )}



                            {/* Academic Profile */}
                            {selectedMenu === 'academic' && (
                                <div className="space-y-8">
                                    {/* Academic Profile Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                                    <GraduationCap size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-foreground">Academic Profile</h2>
                                                    <p className="text-sm text-muted-foreground">{academicSubtitle}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditAcademicOpen(true)}
                                                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-lg transition-colors border border-emerald-100"
                                            >
                                                Edit Profile
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-muted/40 p-4 rounded-xl border border-border">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Education Board</label>
                                                <p className="text-lg font-semibold text-foreground mt-1">{educationBoard?.toUpperCase() || "Not set"}</p>
                                            </div>
                                            <div className="bg-muted/40 p-4 rounded-xl border border-border">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Grade</label>
                                                <p className="text-lg font-semibold text-foreground mt-1">
                                                    {currentGrade === "grade10" ? "Class 10" : currentGrade === "grade12" ? "Class 12" : "Not set"}
                                                </p>
                                            </div>
                                            {currentGrade === "grade12" && (
                                                <div className="bg-muted/40 p-4 rounded-xl border border-border">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Stream</label>
                                                    <p className="text-lg font-semibold text-foreground mt-1">{stream ? String(stream).toUpperCase() : "Not set"}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-border"></div>

                                    {/* My Subjects Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                                                    <BookOpen size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground">My Subjects</h3>
                                                    <p className="text-sm text-muted-foreground">Manage subjects for your study plan</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setManageSubjectsOpen(true)}
                                                className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-bold rounded-lg transition-colors border border-teal-100"
                                            >
                                                Manage
                                            </button>
                                        </div>

                                        {subjectsLearning.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {subjectsLearning.map((subject: string) => (
                                                    <div key={subject} className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                                                        <p className="text-sm font-semibold text-foreground">{subject}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-muted/40 rounded-xl border border-dashed border-border">
                                                <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground text-sm mb-2 font-medium">No subjects selected yet</p>
                                                <button
                                                    onClick={() => setManageSubjectsOpen(true)}
                                                    className="text-teal-600 text-sm font-bold hover:underline"
                                                >
                                                    Add Subjects
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-border"></div>

                                    {/* Exam Performance Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                                    <BarChart size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground">Exam Performance</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {examPerformance ? `Last updated: ${formatLastUpdated(examPerformance?.timestamp)}` : "Track your progress"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setUpdateMarksOpen(true)}
                                                disabled={subjectsLearning.length === 0}
                                                className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-bold rounded-lg transition-colors border border-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Update Marks
                                            </button>
                                        </div>

                                        {subjectsLearning.length === 0 ? (
                                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                                <Info className="text-blue-600 flex-shrink-0" size={20} />
                                                <p className="text-blue-700 text-sm font-medium">Please select your subjects first to add exam marks.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {subjectsLearning.map((subject: string) => {
                                                    const mark = examPerformance?.marks?.[subject];
                                                    return (
                                                        <div key={subject} className="bg-muted/40 p-5 rounded-xl border border-border hover:border-orange-200 transition-colors">
                                                            <p className="text-xs text-muted-foreground mb-2 truncate font-bold uppercase tracking-wider" title={subject}>{subject}</p>
                                                            <div className="flex items-end gap-1">
                                                                <span className={`text-3xl font-bold ${mark ? 'text-foreground' : 'text-gray-300'}`}>
                                                                    {mark !== undefined ? mark : '-'}
                                                                </span>
                                                                <span className="text-sm text-gray-400 mb-1 font-bold">/100</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}


                            {/* Assessment */}
                            {selectedMenu === 'assessment' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                                <BarChart2 size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-foreground">Assessment Results</h2>
                                                <p className="text-sm text-muted-foreground">View your career analysis & detailed profile</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push('/assessment-data')}
                                            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-bold rounded-lg transition-colors border border-purple-100"
                                        >
                                            View Details
                                        </button>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-xl border border-purple-100">
                                        <div className="text-center">
                                            <BarChart2 size={64} className="mx-auto text-purple-600 mb-4" />
                                            <h3 className="text-xl font-bold text-foreground mb-2">Career Assessment</h3>
                                            <p className="text-muted-foreground mb-6">Discover your ideal career path based on your interests and skills</p>
                                            <button
                                                onClick={() => router.push('/assessment-data')}
                                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                                            >
                                                View Full Assessment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>
                </div>

                {deleteDialogOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 ">
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-red-600">
                                <AlertTriangle size={24} />
                                Delete Profile
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed font-medium">
                                This will permanently delete your account and all associated data. This action cannot be undone.
                            </p>

                            <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wider">
                                Confirm email address
                            </label>
                            <input
                                type="email"
                                value={deleteEmail}
                                onChange={(event) => setDeleteEmail(event.target.value)}
                                className="w-full rounded-xl bg-muted/40 border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all mb-2"
                                placeholder="Enter your email to confirm"
                            />
                            {deleteError && (
                                <p className="text-xs text-red-600 mb-4 bg-red-50 p-2 rounded-lg border border-red-100 font-bold">{deleteError}</p>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setDeleteDialogOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteProfile}
                                    className="px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg disabled:opacity-60 transition-all  shadow-red-500/20"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete Permanently"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modals */}
                <EditProfileModal
                    isOpen={editProfileOpen}
                    onClose={() => setEditProfileOpen(false)}
                    currentName={displayName}
                    currentDisplayName={profile?.displayName || undefined}
                    onSave={handleSavePersonalInfo}
                />

                <EditAcademicProfileModal
                    isOpen={editAcademicOpen}
                    onClose={() => setEditAcademicOpen(false)}
                    currentBoard={educationBoard}
                    currentGrade={currentGrade}
                    currentStream={stream || undefined}
                    onSave={handleSaveAcademicProfile}
                />

                <ManageSubjectsModal
                    isOpen={manageSubjectsOpen}
                    onClose={() => setManageSubjectsOpen(false)}
                    currentSubjects={subjectsLearning}
                    allSubjects={["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Computer Science", "Economics", "Business Studies", "Accountancy", "History", "Geography", "Political Science", "Psychology", "Sociology", "Physical Education"]}
                    onSave={handleSaveSubjects}
                />

                <UpdateExamMarksModal
                    isOpen={updateMarksOpen}
                    onClose={() => setUpdateMarksOpen(false)}
                    subjects={subjectsLearning}
                    currentMarks={examPerformance?.marks}
                    onSave={handleSaveExamMarks}
                />

                <EditLocationModal
                    isOpen={editLocationOpen}
                    onClose={() => setEditLocationOpen(false)}
                    currentCity={profile?.city}
                    currentState={profile?.state}
                    currentCountry={profile?.country}
                    onSave={handleSaveLocation}
                />
            </main>

            <Footer />
        </div>
    );
}
