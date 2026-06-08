import { X } from "lucide-react";
import { useState } from "react";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentDisplayName?: string;
    onSave: (fullName: string, displayName: string) => Promise<void>;
}

export default function EditProfileModal({
    isOpen,
    onClose,
    currentName,
    currentDisplayName,
    onSave,
}: EditProfileModalProps) {
    const [fullName, setFullName] = useState(currentName);
    const [displayName, setDisplayName] = useState(currentDisplayName || "");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!fullName.trim()) {
            setError("Full name is required");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await onSave(fullName.trim(), displayName.trim());
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-[#0f172c] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Edit Personal Information</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                        disabled={isSaving}
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-lg bg-[#12192E] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-blue-400"
                            placeholder="Enter your full name"
                            disabled={isSaving}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Display Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full rounded-lg bg-[#12192E] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-blue-400"
                            placeholder="How you'd like to be called"
                            disabled={isSaving}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-60"
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
