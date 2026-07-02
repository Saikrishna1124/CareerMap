const { execSync } = require('child_process');
try {
  const output = execSync('python3 --version').toString();
  console.log('Python is available:', output);
} catch (e) {
  console.error('Python is NOT available:', e.message);
}
