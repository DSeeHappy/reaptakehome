const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Form Builder...\n');

try {
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env.local file...');
    const envContent = `# OpenAI API Key for AI form generation
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('⚠️  Please add your OpenAI API key to .env.local\n');
  } else {
    console.log('✅ .env.local file exists');
  }

  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated');
  } catch (error) {
    console.log('⚠️  Prisma client generation had issues, but continuing...');
  }

  // Push database schema
  console.log('🗄️  Setting up database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema created');

  console.log('\n🎉 Setup complete! You can now run:');
  console.log('   npm run dev');
  console.log('\n📝 Don\'t forget to add your OpenAI API key to .env.local');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
