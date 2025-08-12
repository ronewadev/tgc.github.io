// server/injectConfig.js - Middleware to inject safe config into HTML responses

const { getPublicConfig } = require('../config');

/**
 * Express middleware that injects configuration variables into HTML responses
 */
function injectConfigMiddleware(req, res, next) {
  // Store the original send function
  const originalSend = res.send;
  
  // Replace the send function with our custom implementation
  res.send = function(body) {
    // Only process HTML responses
    if (typeof body === 'string' && res.get('Content-Type')?.includes('text/html')) {
      try {
        // Get the public configuration
        const safeConfig = getPublicConfig();
        
        // Create a script tag with the configuration
        const configScript = `
          <script>
            // Safely expose configuration to the client
            window.ENV_CONFIG = ${JSON.stringify(safeConfig)};
          </script>
        `;
        
        // Inject the script into the HTML before the closing </head> tag
        body = body.replace('</head>', `${configScript}\n</head>`);
      } catch (error) {
        console.error('Error injecting configuration:', error);
      }
    }
    
    // Call the original send function with the possibly modified body
    return originalSend.call(this, body);
  };
  
  next();
}

module.exports = injectConfigMiddleware;
