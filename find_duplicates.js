const fs = require('fs');

try {
  // Read the .env file
  const envFile = fs.readFileSync('.env', 'utf8');
  
  // Split by lines and filter out comments and empty lines
  const lines = envFile.split('\n')
    .filter(line => line.trim() !== '' && !line.trim().startsWith('#'));
  
  // Extract keys
  const keys = lines.map(line => {
    const parts = line.split('=');
    return parts[0].trim();
  });
  
  // Find duplicates
  const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
  const uniqueDuplicates = [...new Set(duplicates)];
  
  if (uniqueDuplicates.length > 0) {
    console.log('Duplicate variables found:');
    uniqueDuplicates.forEach(key => {
      console.log(`- "${key}" appears multiple times`);
    });
  } else {
    console.log('No duplicate variables found.');
  }
  
  // Show all variables for reference
  console.log('\nAll environment variables:');
  keys.forEach((key, index) => {
    console.log(`${index + 1}. ${key}`);
  });
  
} catch (error) {
  console.error('Error reading .env file:', error.message);
} 