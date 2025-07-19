const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

app.get('/ai', async (req, res) => {
    try {
        const message = req.query.msg;
        const playerName = req.query.player || 'Unknown';
        
        if (!message) {
            return res.json({ response: 'No message received' });
        }
        
        // Count how many times "jump" appears in the message
        const lowerMsg = message.toLowerCase();
        const jumpMatches = lowerMsg.match(/jump/g);
        const jumpCount = jumpMatches ? jumpMatches.length : 0;
        
        // If there are multiple jumps in one message, respond with the count
        if (jumpCount > 1) {
            const response = `Ok, Jumping ${jumpCount} Times Now!`;
            console.log(`Player: ${playerName}, Message: ${message}, AI Response: ${response}`);
            return res.json({ response: response });
        }
        
        const systemPrompt = `You are a friendly AI assistant in a Roblox game. A player named ${playerName} is talking to you. 

IMPORTANT INSTRUCTIONS:
- If the player asks you to jump, make someone jump, or any variation of jumping, you MUST respond with exactly: "Ok, Jumping Now!"
- Do NOT say "hi" or greet the player repeatedly
- Do NOT mention that you're an AI or external service
- Keep responses short and friendly
- If the player asks about jumping, ONLY say "Ok, Jumping Now!" and nothing else

Examples:
- Player: "jump" → You: "Ok, Jumping Now!"
- Player: "can you jump?" → You: "Ok, Jumping Now!"
- Player: "make the noob jump" → You: "Ok, Jumping Now!"
- Player: "hello" → You: "Hello! How can I help you today?"`;
        
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama3-8b-8192",
            max_tokens: 100,
            temperature: 0.7,
        });
        
        const aiResponse = completion.choices[0].message.content;
        console.log(`Player: ${playerName}, Message: ${message}, AI Response: ${aiResponse}`);
        res.json({ response: aiResponse });
        
    } catch (error) {
        console.error('Error:', error);
        res.json({ response: `Sorry, I had an error: ${error.message}` });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'roblox-ai-proxy' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
});
