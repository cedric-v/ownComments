const fs = require('fs');

// Charger le fichier Hyvor Talk exporté
const hyvorTalkData = require('./2025-05-09-3126-export-hyvor-talks.json');

// Fonction pour extraire le texte brut du body Hyvor Talk, en gérant plusieurs paragraphes et types
function extractPlainTextFromHyvorBody(body) {
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return body; }
  }
  if (!body || !body.content) return '';
  return body.content
    .map(block => {
      if (block.type === 'paragraph' && block.content) {
        // On ne prend que les inlines de type 'text'
        return block.content
          .filter(inline => inline.type === 'text')
          .map(inline => inline.text || '')
          .join('');
      }
      // Si le block est directement de type 'text' (rare mais possible)
      if (block.type === 'text' && block.text) {
        return block.text;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n'); // Un paragraphe par ligne
}

// Transformer les données pour Firestore
const firestoreData = {};

// Parcourir les commentaires Hyvor Talk
hyvorTalkData.comments.forEach(comment => {
  // Utiliser l'URL comme identifiant unique de la page
  const pageUrl = comment.page.url || "home";

  // Initialiser la structure pour cette page si elle n'existe pas encore
  if (!firestoreData[pageUrl]) {
    firestoreData[pageUrl] = [];
  }

  // Ajouter le commentaire à la page correspondante
  firestoreData[pageUrl].push({
    name: comment.user.name || "Anonyme", // Nom de l'auteur
    text: extractPlainTextFromHyvorBody(comment.body), // Extraction du texte brut multi-paragraphes
    timestamp: new Date(comment.created_at * 1000).toISOString() // Date du commentaire en format ISO 8601
  });
});

// Sauvegarder les données transformées dans un fichier JSON
fs.writeFileSync('firestore-comments.json', JSON.stringify(firestoreData, null, 2));

console.log('Les données ont été transformées et sauvegardées dans firestore-comments.json');