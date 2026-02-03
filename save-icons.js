// save-icons.js
const fs = require('fs');

// All React Icon sets with their import prefixes
const sets = [
  'ai', 'bs', 'bi', 'ci', 'di', 'fi', 'fc', 'fa', 'fa6', 'gi',
  'go', 'gr', 'hi', 'hi2', 'im', 'io', 'io5', 'md', 'ri', 'si',
  'sl', 'tb', 'ti', 'typ', 'vsc', 'wi', 'cg'
];

let allIcons = [];

sets.forEach(set => {
  try {
    const icons = require(`react-icons/${set}`);
    const names = Object.keys(icons).map(name => `${set.toUpperCase()} - ${name}`);
    allIcons = allIcons.concat(names);
    console.log(`Loaded ${names.length} icons from ${set}`);
  } catch (e) {
    console.error(`Set ${set} not found or failed to load:`, e.message);
  }
});

const filename = 'react-icons-list.txt';
fs.writeFileSync(filename, allIcons.join('\n'));
console.log(`\nSaved ${allIcons.length} icons to ${filename}`);
