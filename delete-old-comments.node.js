const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

(async () => {
  const commentsSnap = await db.collection('comments').get();
  let count = 0;
  for (const doc of commentsSnap.docs) {
    await db.collection('comments').doc(doc.id).delete();
    console.log(`Deleted: ${doc.id}`);
    count++;
  }
  console.log(`Done. Deleted ${count} comment threads.`);
})(); 