# OwnComments

**OwnComments** is a simple, self-hosted solution to add a comment system to any web page, with storage on Google Firestore. It also allows you to import comments from Hyvor Talk.

---

## ✨ Main Features
- **Per-page comment threads** (distinct feed per URL)
- **Secure storage** on Firestore (Firebase)
- **Easy integration on any HTML page** (e.g., Ontraport)
- **Pagination**: Comments are displayed in pages (default: 20 per page) with navigation controls
- **Security**: User input is sanitized and escaped to prevent execution of malicious scripts in the browser
- Automated **import of Hyvor Talk comments**

---

## 📁 File Structure
- `comments.html`: Example frontend to embed on your web pages (browser only)
- `import-to-firestore.node.js`: Node.js script to import comments into Firestore
- `transform-hyvor-to-firestore.node.js`: Converts a Hyvor Talk export to Firestore format (Node.js)
- `delete-old-comments.node.js`: Node.js script to delete old comment threads from Firestore
- `firestore-comments.json`: Generated file containing comments to import
- `serviceAccountKey.json`: Firebase private key (generate from Firebase console, **do not share**)
- `FireStore.rules`: Example Firestore security rules for this project. **Review and adapt these rules before deploying to production.**

**Note:** All files with the `.node.js` extension are intended to be run with Node.js (backend/CLI only), not in the browser.

---

## ⚙️ Prerequisites
- Node.js (for import)
- A Firebase project with Firestore enabled
- A Firebase service account key (`serviceAccountKey.json`)

---

## 🚀 Installation & Comment Import

1. **Clone the repository**
2. Install the required dependencies:
   ```sh
   npm install firebase-admin firebase
   ```
3. Place your `serviceAccountKey.json` file at the project root (downloadable from Firebase Console > Project Settings > Service Accounts).
4. (Optional) Convert a Hyvor Talk export:
   ```sh
   node transform-hyvor-to-firestore.node.js
   ```
   This generates `firestore-comments.json`.
5. Import comments into Firestore:
   ```sh
   node import-to-firestore.node.js
   ```

---

## 🌐 Example Frontend Integration (HTML)

Paste this code on every page where you want a distinct comment thread:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>
<script>
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "...",
    appId: "..."
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
</script>
<div id="comments"></div>
<input id="name" placeholder="Your name">
<input id="text" placeholder="Your comment">
<button onclick="addComment()">Send</button>
<script>
  function loadComments() {
    db.collection('comments').doc(encodeURIComponent(window.location.pathname)).collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
        const commentsDiv = document.getElementById('comments');
        commentsDiv.innerHTML = '';
        snapshot.forEach(doc => {
          const data = doc.data();
          commentsDiv.innerHTML += `<p><b>${data.name}</b>: ${data.text}</p>`;
        });
      });
  }
  function addComment() {
    const name = document.getElementById('name').value;
    const text = document.getElementById('text').value;
    db.collection('comments').doc(encodeURIComponent(window.location.pathname)).collection('messages').add({
      name,
      text,
      timestamp: new Date()
    }).then(() => {
      document.getElementById('text').value = '';
    });
  }
  loadComments();
</script>
```

---

## 🔒 Security Tips
- **Never expose** the `serviceAccountKey.json` file on the client side or in a public repository.
- After import, restrict your Firestore rules to prevent abuse.
- The frontend API key is not secret, but always use appropriate Firestore rules.

---

## 🗒️ Special Notes: Hyvor Talk Format & Pagination

### 🔄 Hyvor Talk Format Handling
- When importing comments from Hyvor Talk, the comment text may be stored as a JSON object (Hyvor's rich text format) in Firestore.
- The frontend includes a function `extractPlainTextFromHyvorBody` that automatically converts this format to plain text for display.
- **New comments** added via the form are stored as simple strings, but the function ensures both formats are displayed correctly.
- If you are certain all comments are now plain text, you can remove this function and use the text directly.

### 📄 Pagination System
- The frontend displays comments in pages, with a default of **20 comments per page**.
- If there are more than 20 comments, navigation buttons ("Précédent"/"Suivant") appear below the list to switch pages without reloading.
- This is handled entirely client-side for a smooth user experience.

#### 🔧 How to configure the number of comments per page
- In the `comments.html` file, look for the line:
  ```js
  var COMMENTS_PER_PAGE = 20;
  ```
- Change the value (`20`) to your desired number of comments per page.

---

## 🛡️ Data Protection & Compliance (GDPR / nFADP)

OwnComments is designed to store only minimal user data (name, comment, timestamp) and does not collect emails or IP addresses by default.

However, compliance with the EU GDPR and Swiss nFADP depends on your configuration and usage:
- Ensure your Firestore database is hosted in a region compliant with your legal requirements (e.g., EU servers).
- Update your privacy policy to inform users about data storage and their rights.
- Provide a way for users to request deletion of their comments if needed.
- Do not collect more data than necessary.

**You are responsible for ensuring your use of OwnComments complies with applicable data protection laws.**

---

## ❓ Quick FAQ
- **Q: Is Node.js required to display comments?**
  - No, only for importing. Display is handled client-side with the Firebase SDK.
- **Q: Can I have a separate comment thread per page?**
  - Yes, this is automatic using the page URL.
- **Q: Can I import formats other than Hyvor Talk?**
  - You just need to adapt the conversion script.

---

## 📝 License
BSD-3-Clause