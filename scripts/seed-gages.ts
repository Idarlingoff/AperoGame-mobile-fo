import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';
import gagesData from './gages-data.json';

const app = initializeApp({
  credential: cert('./service-account.json'),
});

const db = getFirestore(app);

async function seed() {
  const batch = db.batch();

  for (const gage of gagesData) {
    const id = randomUUID();
    const ref = db.collection('gages').doc(id);
    batch.set(ref, {
      id,
      ...gage,
      active: true,
      createdAt: Date.now(),
    });
  }

  await batch.commit();
  console.log(`✓ ${gagesData.length} gages ajoutés`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
