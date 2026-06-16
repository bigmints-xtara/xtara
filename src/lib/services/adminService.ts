import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    onSnapshot,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import type { AdminEntity, AdminConfig } from '@/types/admin';

export class AdminService<T extends AdminEntity> {
    private config: AdminConfig<T>;

    constructor(config: AdminConfig<T>) {
        this.config = config;
    }

    /**
     * Get all entities from Firestore
     */
    async getAll(): Promise<T[]> {
        try {
            const collectionRef = collection(db, this.config.collectionName);
            let q;
            if (this.config.orderByField) {
                q = query(collectionRef, orderBy(this.config.orderByField, this.config.orderByDirection || 'desc'));
            } else if (this.config.orderByField === null) {
                q = query(collectionRef);
            } else {
                q = query(collectionRef, orderBy('createdAt', 'desc'));
            }
            const snapshot = await getDocs(q);

            return snapshot.docs.map((doc) => {
                const data = doc.data();
                return this.config.fromFirestore(data, doc.id);
            });
        } catch (error) {
            console.error(`Error loading ${this.config.entityNamePlural}:`, error);
            throw error;
        }
    }

    /**
     * Stream entities in real-time using Firestore onSnapshot.
     *
     * Note: The returned callback is invoked once per snapshot. In React Strict Mode
     * (development), the component's useEffect may mount/unmount/mount, creating
     * two concurrent listeners. Both will fire the callback for the same snapshot,
     * so the consumer should deduplicate entities by ID before rendering.
     */
    streamAll(callback: (entities: T[]) => void): Unsubscribe {
        const collectionRef = collection(db, this.config.collectionName);
        let q;
        if (this.config.orderByField) {
            q = query(collectionRef, orderBy(this.config.orderByField, this.config.orderByDirection || 'desc'));
        } else if (this.config.orderByField === null) {
            q = query(collectionRef);
        } else {
            q = query(collectionRef, orderBy('createdAt', 'desc'));
        }

        return onSnapshot(
            q,
            (snapshot) => {
                const entities = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return this.config.fromFirestore(data, doc.id);
                });
                callback(entities);
            },
            (error) => {
                console.error(`Error streaming ${this.config.entityNamePlural}:`, error);
            }
        );
    }

    /**
     * Get a single entity by ID
     */
    async getById(id: string): Promise<T | null> {
        try {
            const docRef = doc(db, this.config.collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return this.config.fromFirestore(docSnap.data(), docSnap.id);
            }
            return null;
        } catch (error) {
            console.error(`Error loading ${this.config.entityName}:`, error);
            throw error;
        }
    }

    /**
     * Create a new entity
     */
    async create(data: Partial<T>): Promise<string> {
        try {
            // Validate
            if (this.config.validateEntity) {
                const error = this.config.validateEntity(data);
                if (error) {
                    throw new Error(error);
                }
            }

            const firestoreData = this.config.toFirestore(data);
            firestoreData.createdAt = Timestamp.now();
            firestoreData.updatedAt = Timestamp.now();

            const collectionRef = collection(db, this.config.collectionName);
            const docRef = await addDoc(collectionRef, firestoreData);

            console.log(`✅ Created ${this.config.entityName} with ID:`, docRef.id);
            return docRef.id;
        } catch (error) {
            console.error(`Error creating ${this.config.entityName}:`, error);
            throw error;
        }
    }

    /**
     * Update an existing entity
     */
    async update(id: string, data: Partial<T>): Promise<void> {
        try {
            // Validate
            if (this.config.validateEntity) {
                const error = this.config.validateEntity(data);
                if (error) {
                    throw new Error(error);
                }
            }

            const firestoreData = this.config.toFirestore(data);
            firestoreData.updatedAt = Timestamp.now();

            const docRef = doc(db, this.config.collectionName, id);
            await updateDoc(docRef, firestoreData);

            console.log(`✅ Updated ${this.config.entityName} with ID:`, id);
        } catch (error) {
            console.error(`Error updating ${this.config.entityName}:`, error);
            throw error;
        }
    }

    /**
     * Delete an entity
     */
    async delete(id: string): Promise<void> {
        try {
            const docRef = doc(db, this.config.collectionName, id);
            await deleteDoc(docRef);

            console.log(`✅ Deleted ${this.config.entityName} with ID:`, id);
        } catch (error) {
            console.error(`Error deleting ${this.config.entityName}:`, error);
            throw error;
        }
    }

    /**
     * Publish an entity
     */
    async publish(id: string): Promise<void> {
        await this.update(id, {
            published: true,
            draft: false,
            inReview: false,
            publishedAt: new Date(),
        } as unknown as Partial<T>);
    }

    /**
     * Unpublish an entity
     */
    async unpublish(id: string): Promise<void> {
        await this.update(id, {
            published: false,
            draft: true,
            inReview: false,
        } as unknown as Partial<T>);
    }

    /**
     * Duplicate an entity
     */
    async duplicate(id: string): Promise<string> {
        try {
            const original = await this.getById(id);
            if (!original) {
                throw new Error(`${this.config.entityName} not found`);
            }

            // Create a copy
            const duplicate = { ...original } as Record<string, unknown>;
            delete duplicate.id;
            delete duplicate.createdAt;
            delete duplicate.updatedAt;

            // Modify title to indicate it's a copy
            if ('title' in duplicate) {
                duplicate.title = `${duplicate.title as string} (Copy)`;
            }

            // Set as draft
            if ('published' in duplicate) {
                duplicate.published = false;
                duplicate.draft = true;
                duplicate.inReview = false;
            }

            return await this.create(duplicate as Partial<T>);
        } catch (error) {
            console.error(`Error duplicating ${this.config.entityName}:`, error);
            throw error;
        }
    }
}
