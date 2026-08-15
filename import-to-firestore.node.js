const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Clé privée Firebase (ne jamais committer)
const firestoreData = require('./firestore-comments.json');
const crypto = require('crypto');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper to generate a unique ID for a comment (hash of name+text+timestamp)
function commentId(comment) {
  return crypto.createHash('sha256')
    .update(comment.name + '|' + comment.text + '|' + comment.timestamp)
    .digest('hex');
}

// Firestore batch limit (max 500 writes per commit)
const BATCH_SIZE = 500;

(async () => {
  let imported = 0;

  for (const [pageUrl, comments] of Object.entries(firestoreData)) {
    const pageId = encodeURIComponent(pageUrl);

    for (let i = 0; i < comments.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const slice = comments.slice(i, i + BATCH_SIZE);

      for (const comment of slice) {
        const id = commentId(comment);
        batch.set(
          db.collection('comments').doc(pageId).collection('messages').doc(id),
          comment
        );
      }

      try {
        await batch.commit();
        imported += slice.length;
        console.log(`Imported ${imported} comments so far (page: ${pageUrl})`);
      } catch (err) {
        console.error(`Failed to import a batch for page ${pageUrl}:`, err.message);
        process.exitCode = 1;
        return;
      }
    }
  }

  console.log(`Importation terminée : ${imported} commentaires.`);
})();
