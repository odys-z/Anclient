// Thansk to Grok

// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';

/**
 * e.g.
 export const only_payload = {
    "document": {
        "fileType": "doc",
        "key": "unique-key-" + new Date().getTime(), // Unique key for each session
        "title": "Sample Document",
        // "url": "http://ieee802.org:80/secmail/docIZSEwEqHFr.doc"
        "url": "doc-res.docx"
    },
    "documentType": "word", // Can be "word", "cell" (spreadsheet), or "slide" (presentation)
    "editorConfig": {
        "mode": "view", // "view" for read-only, "edit" for editing
        // "callbackUrl": "http://localhost:3000/save" // Where changes are sent (optional)
    },
    "height": "100%",
    "width": "100%",
  };
 */

import { config_docx } from './doc-res-config.mjs';

const secret = 'mysecretkey'; // Replace with your ONLYOFFICE or custom secret
const onlyoffice_token = jwt.sign(config_docx, secret, { algorithm: 'HS256' });

console.log(config_docx.document.key);
console.log(onlyoffice_token);