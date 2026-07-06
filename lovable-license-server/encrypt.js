const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// The secret password only the server knows
const SECRET_PASSWORD = process.env.PAYLOAD_SECRET || "SUPER_SECRET_LOVABLE_PASSWORD_123!";

// The paths
const originalFilePath = path.join(__dirname, '..', 'content.js');
const backupFilePath = path.join(__dirname, '..', 'content.original.js');
const encryptedFilePath = path.join(__dirname, '..', 'content.encrypted.txt');

// 1. Create a safe backup
if (!fs.existsSync(backupFilePath)) {
    fs.copyFileSync(originalFilePath, backupFilePath);
    console.log("✅ Backup created at content.original.js");
}

// 2. Read the original code
const code = fs.readFileSync(backupFilePath, 'utf8');

// 3. Encrypt it using AES-256
const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(SECRET_PASSWORD, 'salt', 32), Buffer.alloc(16, 0));
let encrypted = cipher.update(code, 'utf8', 'hex');
encrypted += cipher.final('hex');

// 4. Save the encrypted payload
fs.writeFileSync(encryptedFilePath, encrypted);
console.log("✅ Encrypted payload generated!");
console.log("Next step: Paste the encrypted string into your content.js loader.");
