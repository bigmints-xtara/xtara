export default function TopCollegesCard() {
    const colleges = [
        { name: "IIT Bombay", location: "Mumbai", rating: "9.2/10" },
        { name: "IIT Delhi", location: "Delhi", rating: "9.1/10" },
        { name: "AIIMS Delhi", location: "Delhi", rating: "9.5/10" },
        { name: "CMC Vellore", location: "Vellore", rating: "9.0/10" },
    ];

    return (
        <div className="bg-white rounded-xl p-6  border border-gray-200 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎓</span>
                <h3 className="text-lg font-bold text-gray-900">Top Colleges</h3>
            </div>
            <div className="space-y-3">
                {colleges.map((college, idx) => (
                    <div key={idx} className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                        <div className="font-semibold text-gray-900 text-sm">{college.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{college.location}</div>
                        <div className="text-xs text-blue-600 font-semibold mt-1">★ {college.rating}</div>
                    </div>
                ))}
                <a href="/colleges" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1 mt-4">
                    View all colleges →
                </a>
            </div>
        </div>
    );
}
