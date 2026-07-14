const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

console.log("Starting advanced obfuscation on content.js...");

// Read the original file
const originalCode = fs.readFileSync('content.original.js', 'utf8');

// Obfuscate it with extreme settings
const obfuscationResult = JavaScriptObfuscator.obfuscate(originalCode, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.5,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
});

// Write it back to content.js (overwriting the cleartext one)
fs.writeFileSync('content.js', obfuscationResult.getObfuscatedCode());

console.log("SUCCESS! content.js is now fully locked and unreadable.");
