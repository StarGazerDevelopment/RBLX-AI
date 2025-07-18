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
        
        const systemPrompt = `You are a friendly AI assistant in a Roblox game. A player named ${playerName} is talking to you. Keep responses short, friendly, and appropriate for a Roblox game. Don't mention that you're an AI or external service. Keep responses under 100 characters.`;
        
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama3-8b-8192", // You can change this to other Groq models
            max_tokens: 100,
            temperature: 0.7,
        });
        
        const aiResponse = completion.choices[0].message.content;
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