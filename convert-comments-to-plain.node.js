// Usage: node convert-comments-to-plain.node.js <input-file.json>
const fs = require('fs');
const path = require('path');

function extractPlainTextFromHyvor(jsonStr) {
  try {
    const obj = JSON.parse(jsonStr);
    if (!obj || typeof obj !== 'object' || !obj.content) return jsonStr;
    // Recursively extract all text nodes
    function extract(node) {
      if (!node) return '';
      if (Array.isArray(node)) return node.map(extract).join('\n');
      if (node.type === 'text' && typeof node.text === 'string') return node.text;
      if (node.content) return extract(node.content);
      return '';
    }
    return extract(obj.content).replace(/\n+/g, '\n').trim();
  } catch (e) {
    // Not JSON, return as is
    return jsonStr;
  }
}

if (process.argv.length < 3) {
  console.error('Usage: node convert-comments-to-plain.node.js <input-file.json>');
  process.exit(1);
}

const inputFile = process.argv[2];
const parsed = path.parse(inputFile);
const outputFile = path.join(
  parsed.dir,
  parsed.name + '-plain' + parsed.ext
);

let comments;
try {
  comments = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
} catch (e) {
  console.error('Failed to read or parse input file:', e.message);
  process.exit(1);
}

let converted = 0;
for (const c of comments) {
  if (typeof c.text === 'string' && c.text.trim().startsWith('{"type":"doc"')) {
    const plain = extractPlainTextFromHyvor(c.text);
    if (plain !== c.text) {
      c.text = plain;
      converted++;
    }
  }
}

fs.writeFileSync(outputFile, JSON.stringify(comments, null, 2), 'utf8');
console.log(`Converted ${converted} comments to plain text.`);
console.log(`Output written to: ${outputFile}`); 