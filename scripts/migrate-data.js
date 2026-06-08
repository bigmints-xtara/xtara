const admin = require('firebase-admin');
const path = require('path');

// Absolute paths to credentials
const CREDENTIALS_DIR = '/Users/pretheesh/Projects/project-xtara/credentials';
const DEV_KEY = path.join(CREDENTIALS_DIR, 'serviceAccountKey_Dev.json');
const PROD_KEY = path.join(CREDENTIALS_DIR, 'serviceAccountKey_Prod.json');

// Initialize Dev App
const devApp = admin.initializeApp({
    credential: admin.credential.cert(require(DEV_KEY))
}, 'dev');

// Initialize Prod App
const prodApp = admin.initializeApp({
    credential: admin.credential.cert(require(PROD_KEY))
}, 'prod');

const dbDev = devApp.firestore();
const dbProd = prodApp.firestore();

// Target Date: March 1, 2026
const EXPIRY_DATE = new Date('2026-03-01T00:00:00Z');
const EXPIRY_TIMESTAMP = admin.firestore.Timestamp.fromDate(EXPIRY_DATE);

const COLLECTIONS = [
    'stories',
    'sparks',
    'game_templates',
    'game_instances',
    'challenges',
    'good_reads'
];

async function migrateCollection(collectionName) {
    console.log(`\nStarting migration for: ${collectionName}`);

    try {
        const snapshot = await dbDev.collection(collectionName).get();
        if (snapshot.empty) {
            console.log(`No documents found in ${collectionName} (Dev).`);
            return;
        }

        console.log(`Found ${snapshot.size} documents in ${collectionName}. Migrating...`);

        const batchSize = 500;
        let batch = dbProd.batch();
        let count = 0;
        let totalMigrated = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();

            // Transformation Logic
            const transformedData = { ...data };

            // 1. Set publishUntil/expiry
            // For game_instances, we might want to update schedule.endDateTime too ??
            // But user specifically asked for publishUntil. We will add/overwrite it.
            transformedData.publishUntil = EXPIRY_TIMESTAMP;
            transformedData.publishedUntil = EXPIRY_TIMESTAMP; // Supporting both naming conventions just in case (stories uses publishedUntil in interface)

            // 2. Ensure it is published
            if (data.hasOwnProperty('published')) {
                transformedData.published = true;
            }
            if (data.hasOwnProperty('isPublished')) {
                transformedData.isPublished = true;
            }

            // 3. Special handling for game_instances schedule
            if (collectionName === 'game_instances' && transformedData.schedule) {
                // Extend endDateTime if it exists
                if (transformedData.schedule.endDateTime) {
                    transformedData.schedule.endDateTime = EXPIRY_TIMESTAMP;
                }
                // Ensure startDateTime is valid (if it's in future, keep it. If past, maybe keep it?)
                // We leave startDateTime alone mostly, unless it's way in the past? 
                // User only asked to set expiry.
            }

            const docRef = dbProd.collection(collectionName).doc(doc.id);
            batch.set(docRef, transformedData);

            count++;
            if (count >= batchSize) {
                await batch.commit();
                totalMigrated += count;
                console.log(`  Committed batch of ${count} documents.`);
                batch = dbProd.batch();
                count = 0;
            }
        }

        if (count > 0) {
            await batch.commit();
            totalMigrated += count;
            console.log(`  Committed final batch of ${count} documents.`);
        }

        console.log(`Successfully migrated ${totalMigrated} documents for ${collectionName}.`);

    } catch (error) {
        console.error(`Error migrating ${collectionName}:`, error);
    }
}

async function runMigration() {
    console.log('Starting Migration Process...');
    console.log(`Target Expiry Date: ${EXPIRY_DATE.toISOString()}`);

    for (const col of COLLECTIONS) {
        await migrateCollection(col);
    }

    console.log('\nMigration Complete!');
    process.exit(0);
}

runMigration();
