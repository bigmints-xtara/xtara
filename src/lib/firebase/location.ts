import { db } from "./firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

export interface LocationState {
    name: string;
    districts: string[];
    majorCities: string[];
}

export async function getStates(): Promise<string[]> {
    try {
        const q = query(collection(db, 'location_data'), orderBy('name'));
        const snapshot = await getDocs(q);

        return snapshot.docs
            .map(doc => doc.data().name as string)
            .filter(name => name !== 'metadata');
    } catch (error) {
        console.error("Error fetching states:", error);
        return [];
    }
}

export async function getStateDetails(stateName: string): Promise<{ districts: string[], cities: string[] }> {
    try {
        console.log(`🔍 LocationService: Loading details for state: ${stateName}`);

        const q = query(
            collection(db, 'location_data'),
            where('name', '==', stateName),
            limit(1)
        );
        const snapshot = await getDocs(q);

        console.log(`🔍 LocationService: Found ${snapshot.docs.length} documents for state: ${stateName}`);

        if (snapshot.empty) {
            console.log(`❌ LocationService: No document found for state: ${stateName}`);
            return { districts: [], cities: [] };
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        console.log(`🔍 LocationService: Document ID: ${doc.id}`);
        console.log(`🔍 LocationService: Document data keys: ${Object.keys(data)}`);
        console.log(`🔍 LocationService: Districts field:`, data.districts);
        console.log(`🔍 LocationService: MajorCities field:`, data.majorCities);

        const districts = data.districts || [];
        const cities = data.majorCities || [];

        console.log(`🔍 LocationService: Found ${districts.length} districts: ${districts}`);
        console.log(`🔍 LocationService: Found ${cities.length} cities: ${cities}`);

        return {
            districts: districts,
            cities: cities
        };
    } catch (error) {
        console.error(`❌ LocationService: Error fetching details for ${stateName}:`, error);
        return { districts: [], cities: [] };
    }
}
