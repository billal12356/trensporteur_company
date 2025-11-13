#!/usr/bin/env node

/**
 * Fix trailing commas in JSON file to make it valid JSON
 * Removes trailing commas before closing braces and brackets
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../uploads/json/1762948932000.json');

try {
  console.log('📖 Reading JSON file...');
  let content = fs.readFileSync(filePath, 'utf-8');

  console.log('🔧 Fixing trailing commas...');
  
  // Fix trailing commas before closing braces
  // Pattern: ,\n  } or ,\n}
  content = content.replace(/,(\s*[\}\]])/g, '$1');

  console.log('💾 Writing fixed JSON...');
  fs.writeFileSync(filePath, content, 'utf-8');

  // Verify it's valid JSON
  console.log('✓ Validating JSON...');
  JSON.parse(content);

  console.log(`\n✨ Success! Fixed all trailing commas in 1762948932000.json`);
} catch (error) {
  console.error(`\n❌ Error: ${error.message}`);
  process.exit(1);
}
