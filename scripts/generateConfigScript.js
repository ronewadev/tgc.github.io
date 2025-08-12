// scripts/generateConfigScript.js
// This script generates a config script that can be included in the HTML
const fs = require('fs');
const path = require('path');
const { public: publicConfig } = require('../config');

// Create the script content
const scriptContent = `
<!-- Auto-generated configuration script - Do not edit directly -->
<script>
  // Safely expose configuration to the client
  window.ENV_CONFIG = ${JSON.stringify(publicConfig, null, 2)};
</script>
`;

// Save to file
const outputPath = path.join(__dirname, '../public/config-script.html');
fs.writeFileSync(outputPath, scriptContent);

console.log(`Configuration script generated at: ${outputPath}`);
