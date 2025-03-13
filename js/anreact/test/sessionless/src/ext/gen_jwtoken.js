// Thansk to Grok

const jwt = require('jsonwebtoken');
const payload = {
    "document": {
        "fileType": "doc",
        "key": "unique-key-" + new Date().getTime(), // Unique key for each session
        "title": "Sample Document",
        "url": "http://ieee802.org:80/secmail/docIZSEwEqHFr.doc"
    },
    "documentType": "word", // Can be "word", "cell" (spreadsheet), or "slide" (presentation)
    "editorConfig": {
        "mode": "view", // "view" for read-only, "edit" for editing
        // "callbackUrl": "http://localhost:3000/save" // Where changes are sent (optional)
    },
    "height": "100%",
    "width": "100%",
};

const secret = 'mysecretkey'; // Replace with your ONLYOFFICE or custom secret
const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
console.log('Your JWT:', token);