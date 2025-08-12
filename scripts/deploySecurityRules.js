// scripts/deploySecurityRules.js
// This script deploys the security rules to Firebase
const { exec } = require('child_process');

console.log('Deploying Firebase security rules...');

// Deploy Firestore security rules
exec('firebase deploy --only firestore:rules', (error, stdout, stderr) => {
  if (error) {
    console.error('Error deploying Firestore rules:', error);
    return;
  }
  console.log('Firestore security rules deployed successfully!');
  console.log(stdout);
});

// Deploy Storage security rules
exec('firebase deploy --only storage:rules', (error, stdout, stderr) => {
  if (error) {
    console.error('Error deploying Storage rules:', error);
    return;
  }
  console.log('Storage security rules deployed successfully!');
  console.log(stdout);
});
