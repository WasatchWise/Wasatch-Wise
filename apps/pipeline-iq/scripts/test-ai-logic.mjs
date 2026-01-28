import fs from 'fs';
import path from 'path';

// Load .env.local manually to avoid dotenv dependency issues
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...parts] = line.split('=');
    if (key && parts.length > 0) {
        env[key.trim()] = parts.join('=').trim().replace(/"/g, ''); // Simple cleanup
    }
});

const OPENAI_API_KEY = env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env.local');
    process.exit(1);
}

console.log('🚀 Testing OpenAI Integration (Standalone)');

async function testOpenAI() {
    const projectData = {
        project_name: "Test Hotel Project",
        project_type: ["Hotel", "New Construction"],
        city: "Salt Lake City",
        state: "UT",
        project_value: 15000000,
        description: "A new 150-room luxury hotel in downtown Salt Lake City."
    };

    const systemPrompt = 'You are an expert construction technology sales strategist. Always respond with valid JSON.';
    const userPrompt = `Analyze this project: ${JSON.stringify(projectData)}. 
    Extract: 
    1. Key decision factors
    2. Technology needs
    3. Potential objections
    
    Format as JSON with keys: decision_factors, technology_needs, objections`;

    console.log('\n📝 Sending request to OpenAI...');

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI API Error: ${response.status} ${err}`);
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        console.log('\n✅ OpenAI Response Received:');
        console.log(JSON.stringify(content, null, 2));
        console.log('\n✅ AI Integration Verified!');

    } catch (error) {
        console.error('❌ AI Test Failed:', error);
    }
}

testOpenAI();
