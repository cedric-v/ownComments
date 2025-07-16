const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Clé privée Firebase
const firestoreData = require('./firestore-comments.json');
const crypto = require('crypto');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper to generate a unique ID for a comment (hash of name+text+timestamp)
function commentId(comment) {
  return crypto.createHash('sha1')
    .update(comment.name + '|' + comment.text + '|' + comment.timestamp)
    .digest('hex');
}

(async () => {
  for (const [pageUrl, comments] of Object.entries(firestoreData)) {
    const pageId = encodeURIComponent(pageUrl);
    for (const comment of comments) {
      const id = commentId(comment);
      await db.collection('comments').doc(pageId).collection('messages').doc(id).set(comment);
      console.log(`Imported comment for page ${pageUrl} with id ${id}`);
    }
  }
  console.log('Importation terminée.');
})();