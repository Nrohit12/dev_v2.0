#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read algorithms.json
const algorithmsPath = path.join(__dirname, '../data/algorithms.json');
const algorithmsData = JSON.parse(fs.readFileSync(algorithmsPath, 'utf8'));

// Generate table rows
const tableRows = [];

algorithmsData.algorithms.forEach((algo, index) => {
  // Get algorithm name with short name
  const algorithmName = `**${algo.name}${algo.shortName ? ` (${algo.shortName})` : ''}**`;


  // Format link
  const link = `[\`${algo.link}\`](${algo.link})`;

  // Get languages (default or from algo data)
  const languages = algo.languages || 'JavaScript · Python · C++';

  // Add row
  tableRows.push({
    number: index + 1,
    algorithm: algorithmName,
    teaches: algo.description,
    link: link,
    languages: languages
  });
});

// Generate markdown table
let tableSection = '### 📚 Implemented / In Progress\n\n';
tableSection += '| # | Algorithm                          | What it teaches                                                                 | Demo Link             | Languages                     |\n';
tableSection += '|---|------------------------------------|---------------------------------------------------------------------------------|------------------------|-------------------------------|\n';

tableRows.forEach(row => {
  // Truncate "What it teaches" if too long (keep it readable)
  let teaches = row.teaches;
  if (teaches.length > 80) {
    teaches = teaches.substring(0, 77) + '...';
  }
  
  // Format the row (markdown tables don't need padding, just content)
  tableSection += `| ${row.number} | ${row.algorithm} | ${teaches} | ${row.link} | ${row.languages} |\n`;
});

tableSection += '\n';

// Read current README
const readmePath = path.join(__dirname, '../Readme.md');
let readme = fs.readFileSync(readmePath, 'utf8');

// Find and replace the table section
const tableRegex = /### 📚 Implemented \/ In Progress\n\n[\s\S]*?(?=\n---|\n### |$)/;
if (tableRegex.test(readme)) {
  readme = readme.replace(tableRegex, tableSection.trim());
} else {
  // If section doesn't exist, try to find where to insert it
  const indexRegex = /(## 2️⃣ Algorithm Index[\s\S]*?\n---\n\n)/;
  if (indexRegex.test(readme)) {
    readme = readme.replace(indexRegex, `$1${tableSection}`);
  } else {
    // Fallback: add before "For each new algorithm" section
    const forEachRegex = /(### 🧩 For each new algorithm)/;
    if (forEachRegex.test(readme)) {
      readme = readme.replace(forEachRegex, `${tableSection}$1`);
    }
  }
}

// Write updated README
fs.writeFileSync(readmePath, readme, 'utf8');
console.log('✅ README table updated successfully!');

