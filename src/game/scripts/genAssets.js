const fs = require('fs');
const { createCanvas } = require('canvas'); // need npm install canvas

// Node canvas script to generate base64 images for sprites
// To reduce dependencies and complexity in the current workspace, let's write a browser-friendly version
// that we can just inject into a temporary HTML page, or we can use small synthesized Base64 strings.
// Actually, Phaser has a built-in Graphics to Texture generator! We can use that instead of external images!
