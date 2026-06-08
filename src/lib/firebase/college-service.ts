import { db } from "./firebase";
import { collection, query, where, limit, getDocs, getDoc, doc } from "firebase/firestore";

export interface CollegeCourse {
    course: string;
    level?: string;
    duration?: string;
    fees?: string;
    examMode?: string;
    degreeType?: string;
    streams?: any[];
}

export interface CollegeInfo {
    id: string;
    name: string;
    shortName?: string;
    state: string;
    city: string;
    type?: string;
    university?: string;
    website?: string;
    address?: string;
    phone?: string;
    yearFounded?: string;
    majorStream?: string;
    courses: CollegeCourse[];
}

const STOP_WORDS = new Set([
    'of', 'in', 'and', 'or', 'the', 'a', 'an', 'to', 'for', 'with', 'by',
    'bachelor', 'master', 'diploma', 'certificate', 'degree', 'program',
    'course', 'study', 'studies', 'management', 'administration', 'technology',
    'technician', 'assistant', 'care', 'health', 'medical', 'science', 'sciences'
]);

export class CollegeService {
    /**
     * Search for colleges by course name with keyword matching
     * Replicates Flutter: searchCollegesByCourse
     */
    static async searchCollegesByCourse(
        courseName: string,
        filters?: { state?: string; city?: string },
        limitCount: number = 20
    ): Promise<CollegeInfo[]> {
        try {
            console.log(`🔍 [CollegeService] Searching for colleges with course: ${courseName}`);

            const keywords = this._extractKeywords(courseName);
            console.log(`🔍 [CollegeService] Extracted keywords:`, keywords);

            let q = collection(db, 'colleges');
            let queryRef = query(q);

            // Apply filters
            if (filters?.state) {
                queryRef = query(queryRef, where('basic_info.state', '==', filters.state));
            }
            if (filters?.city) {
                queryRef = query(queryRef, where('basic_info.city', '==', filters.city));
            }

            // Limit
            // If no location filters, Flutter uses a very small limit (5) or mock data.
            // On web, we'll implement a safe limit.
            const safeLimit = (!filters?.state && !filters?.city) ? 50 : Math.min(Math.max(limitCount, 1), 50);
            queryRef = query(queryRef, limit(safeLimit));

            const snapshot = await getDocs(queryRef);
            const colleges: CollegeInfo[] = [];

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const basicInfo = data['basic_info'];

                if (!basicInfo) continue;

                const courses = data['courses'] || [];
                const hasMatchingCourse = this._hasMatchingCourse(courses, keywords);

                if (hasMatchingCourse) {
                    colleges.push(this._mapFirestoreDataToCollege(doc.id, data));
                }
            }

            return colleges;

        } catch (error) {
            console.error('Error searching colleges:', error);
            return [];
        }
    }

    static async getCollegeById(id: string): Promise<CollegeInfo | null> {
        try {
            const docRef = doc(db, 'colleges', id);
            const snap = await getDoc(docRef);
            if (!snap.exists()) return null;
            return this._mapFirestoreDataToCollege(snap.id, snap.data());
        } catch (error) {
            console.error('Error fetching college by ID:', error);
            return null;
        }
    }

    /**
     * Search colleges by course and group by location hierarchy
     * Replicates Flutter: getCollegesByLocationHierarchy
     */
    static async searchCollegesByLocationHierarchy(
        courseName: string,
        userCity: string,
        userState: string
    ): Promise<{
        all: CollegeInfo[];
        city: CollegeInfo[];
        state: CollegeInfo[];
        outside: CollegeInfo[];
    }> {
        try {
            console.log(`🔍 [LocationHierarchy] Searching for: "${courseName}"`);
            console.log(`🔍 [LocationHierarchy] User location: ${userCity}, ${userState}`);

            // Fetch all colleges matching the course
            const allColleges = await this.searchCollegesByCourse(courseName, {}, 100);

            console.log(`🔍 [LocationHierarchy] Found ${allColleges.length} total colleges`);

            // Group by location
            const cityColleges: CollegeInfo[] = [];
            const stateColleges: CollegeInfo[] = [];
            const outsideColleges: CollegeInfo[] = [];

            for (const college of allColleges) {
                const collegeState = college.state.toLowerCase().trim();
                const collegeCity = college.city.toLowerCase().trim();
                const targetState = userState.toLowerCase().trim();
                const targetCity = userCity.toLowerCase().trim();

                // City colleges: matches both city AND state
                if (collegeCity === targetCity && collegeState === targetState) {
                    cityColleges.push(college);
                }
                // State colleges: matches state but NOT city
                else if (collegeState === targetState && collegeCity !== targetCity) {
                    stateColleges.push(college);
                }
                // Outside colleges: does NOT match state
                else if (collegeState !== targetState) {
                    outsideColleges.push(college);
                }
            }

            console.log(`🔍 [LocationHierarchy] City: ${cityColleges.length}, State: ${stateColleges.length}, Outside: ${outsideColleges.length}`);

            return {
                all: allColleges,
                city: cityColleges,
                state: stateColleges,
                outside: outsideColleges
            };
        } catch (error) {
            console.error('Error in searchCollegesByLocationHierarchy:', error);
            return { all: [], city: [], state: [], outside: [] };
        }
    }

    /**
     * Extract relevant keywords from course name
     * Replicates Flutter: _extractKeywords
     */
    private static _extractKeywords(courseName: string): string[] {
        // Clean and split
        const words = courseName
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);

        const keywords: string[] = [];

        // Filter and add meaningful words
        words.forEach(word => {
            if (!STOP_WORDS.has(word) && word.length > 2) {
                keywords.push(word);
            }
        });

        // Add full course name for exact match
        const fullCourseName = courseName.toLowerCase().trim();
        if (fullCourseName) {
            keywords.push(fullCourseName);
        }

        // Add 2-word combinations
        const wordCount = keywords.length;
        if (wordCount > 1) {
            for (let i = 0; i < wordCount - 1; i++) {
                keywords.push(`${keywords[i]} ${keywords[i + 1]}`);
            }
        }

        return keywords;
    }

    /**
     * Check if college offers courses matching the keywords
     * Replicates Flutter: _hasMatchingCourse
     */
    private static _hasMatchingCourse(courses: any[], keywords: string[]): boolean {
        if (keywords.length === 0) return false;

        // Limit courses to check (Flutter uses take(20))
        const coursesToCheck = courses.slice(0, 20);

        for (const course of coursesToCheck) {
            // Check 'name' as well as 'course' (raw data uses 'name')
            const courseName = (course['name'] || course['course'] || '').toString().toLowerCase();
            const courseLevel = (course['level'] || '').toString().toLowerCase();

            // Check main course fields
            for (const keyword of keywords) {
                if (courseName.includes(keyword) || courseLevel.includes(keyword)) {
                    return true;
                }
            }

            // Check streams - Flutter strictly checks 'stream'
            const streams = course['stream'] || [];
            const streamsToCheck = streams.slice(0, 10); // Flutter limits to 10

            for (const stream of streamsToCheck) {
                const displayCourseName = (stream['display_course_name'] || '').toString().toLowerCase();
                const courseNameInStream = (stream['course_name'] || '').toString().toLowerCase();
                const streamName = (stream['name'] || '').toString().toLowerCase();

                for (const keyword of keywords) {
                    if (displayCourseName.includes(keyword) ||
                        courseNameInStream.includes(keyword) ||
                        streamName.includes(keyword)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private static _mapFirestoreDataToCollege(docId: string, data: any): CollegeInfo {
        const basicInfo = data['basic_info'] || {};
        const contact = (data['contacts'] || {});

        // Helper to extract phone
        const extractPhone = (phoneData: any) => {
            if (Array.isArray(phoneData) && phoneData.length > 0) {
                return phoneData[0]?.value?.toString();
            }
            return phoneData?.toString();
        };

        return {
            id: docId,
            name: basicInfo['short_form']?.toString() || basicInfo['name']?.toString() || 'Unknown College',
            shortName: basicInfo['short_form']?.toString(),
            state: basicInfo['state']?.toString() || 'Unknown State',
            city: basicInfo['city']?.toString() || 'Unknown City',
            type: basicInfo['type_of_college']?.toString() || basicInfo['type']?.toString() || 'Unknown',
            university: basicInfo['affiliated_to']?.name?.toString(),
            website: contact['website']?.toString() || basicInfo['website']?.toString(),
            address: basicInfo['address']?.address?.toString(),
            phone: extractPhone(basicInfo['phone_no']),
            yearFounded: basicInfo['year_founded']?.toString(),
            majorStream: basicInfo['major_stream_name']?.toString(),
            courses: (data['courses'] || []).slice(0, 10).map((c: any) => ({
                course: c['name'] || c['course'], // Map 'name' to 'course' field in our interface
                level: c['level'],
                duration: c['duration'],
                fees: c['totalFees'] || c['fees'], // Map totalFees too
                examMode: c['examMode'],
                degreeType: c['degreeType'] || c['degree_type'],
                // Flutter CollegeCourse model checks 'streams' THEN 'stream'
                streams: c['streams'] || c['stream']
            }))
        };
    }
}
