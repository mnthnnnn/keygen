const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

console.log("Starting advanced obfuscation on content.js...");

// Read the original file
const originalCode = fs.readFileSync('content.js', 'utf8');

// Obfuscate it with extreme settings
const obfuscationResult = JavaScriptObfuscator.obfuscate(originalCode, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: 4000,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 5,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 1,
    stringArrayEncoding: ['rc4'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 5,
    stringArrayWrappersChainedCalls: true,    
    stringArrayWrappersParametersMaxCount: 5,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 1,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
});

// Write it back to content.js (overwriting the cleartext one)
fs.writeFileSync('content.js', obfuscationResult.getObfuscatedCode());

console.log("SUCCESS! content.js is now fully locked and unreadable.");
