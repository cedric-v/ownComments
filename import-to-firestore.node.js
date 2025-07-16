const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Clé privée Firebase
const firestoreData = require('./firestore-comments.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

(async () => {
  for (const [pageUrl, comments] of Object.entries(firestoreData)) {
    const safePageUrl = encodeURIComponent(pageUrl); // encode les caractères spéciaux
    const pageRef = db.collection('comments').doc(safePageUrl).collection('messages');
    for (const comment of comments) {
      await pageRef.add({
        name: comment.name,
        text: comment.text,
        timestamp: admin.firestore.Timestamp.fromDate(new Date(comment.timestamp))
      });
    }
  }
  console.log('Importation terminée.');
})();