import { X } from "lucide-react";
import { useState } from "react";

// List of Indian states
const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

interface EditLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCity?: string;
    currentState?: string;
    currentCountry?: string;
    onSave: (city: string, state: string, country: string) => Promise<void>;
}

export default function EditLocationModal({
    isOpen,
    onClose,
    currentCity = "",
    currentState = "",
    currentCountry = "India",
    onSave,
}: EditLocationModalProps) {
    const [city, setCity] = useState(currentCity);
    const [state, setState] = useState(currentState);
    const [country, setCountry] = useState(currentCountry);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!city.trim() || !state.trim() || !country.trim()) {
            setError("All fields are required");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await onSave(city.trim(), state.trim(), country.trim());
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl p-6 ">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Edit Location</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isSaving}
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-600 mb-2 block font-medium">
                            City <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                            placeholder="Enter your city"
                            disabled={isSaving}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-2 block font-medium">
                            State <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                            disabled={isSaving}
                        >
                            <option value="">Select a state</option>
                            {INDIAN_STATES.map((stateName) => (
                                <option key={stateName} value={stateName}>
                                    {stateName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-2 block font-medium">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                            placeholder="Country"
                            disabled={isSaving}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-semibold"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors  shadow-blue-500/20"
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
