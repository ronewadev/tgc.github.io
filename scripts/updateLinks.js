// updateLinks.js - This script updates all HTML links to use clean URLs without .html extensions
// Run it with: node updateLinks.js

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname);
const pagesDir = path.join(rootDir, 'pages');

// Get all HTML files
function getAllHtmlFiles() {
    const htmlFiles = [];
    
    // Add root index.html
    htmlFiles.push(path.join(rootDir, 'index.html'));
    
    // Add all HTML files in pages directory
    const files = fs.readdirSync(pagesDir);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            htmlFiles.push(path.join(pagesDir, file));
        }
    });
    
    return htmlFiles;
}

// Replace all links in the HTML files
function updateHtmlFiles() {
    const htmlFiles = getAllHtmlFiles();
    let updateCount = 0;
    
    htmlFiles.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Mapping of patterns to replace
        const replacements = [
            // Links to pages from index.html
            { from: /href="pages\/([^"]+)\.html"/g, to: 'href="/$1"' },
            
            // Links to pages from other pages - relative paths
            { from: /href="\.\/([^"]+)\.html"/g, to: 'href="/$1"' },
            { from: /href="([^"./][^"]+)\.html"/g, to: 'href="/$1"' },
            
            // Links to index from pages
            { from: /href="\.\.\/index\.html"/g, to: 'href="/"' },
        ];
        
        // Apply all replacements
        replacements.forEach(replacement => {
            content = content.replace(replacement.from, replacement.to);
        });
        
        // Only write back if content changed
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated links in: ${path.relative(rootDir, filePath)}`);
            updateCount++;
        }
    });
    
    console.log(`\nUpdated ${updateCount} of ${htmlFiles.length} HTML files to use clean URLs.`);
}

// Run the script
updateHtmlFiles();
console.log('Link update complete!');
