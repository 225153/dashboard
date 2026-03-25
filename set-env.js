const fs = require('fs');
const path = require('path');

// Load .env file locally if it exists
if (fs.existsSync('.env')) {
  require('dotenv').config();
}

const dir = './src/environments';
const file = 'environment.ts';
const content = `export const environment = {
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}',
};`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, file), content);
console.log('Environment configuration generated successfully.');
