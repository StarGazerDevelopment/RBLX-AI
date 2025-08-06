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
        
        // Check if this is actually a jump request (not just mentioning the word "jump")
        const lowerMsg = message.toLowerCase();
        
        // Check for stop following commands FIRST (before follow commands)
        if ((lowerMsg.includes('stop') || lowerMsg.includes('dont') || lowerMsg.includes("don't")) && lowerMsg.includes('follow')) {
            const response = `Okay I Won't Follow You Anymore!`;
            console.log(`Player: ${playerName}, Message: ${message}, AI Response: ${response}`);
            return res.json({ response: response });
        }
        
        // Check for follow commands (but not stop following)
        if (lowerMsg.includes('follow') && (lowerMsg.includes('me') || lowerMsg.includes('you')) && !lowerMsg.includes('stop') && !lowerMsg.includes('dont') && !lowerMsg.includes("don't")) {
            const response = `Okay, Following You Now!`;
            console.log(`Player: ${playerName}, Message: ${message}, AI Response: ${response}`);
            return res.json({ response: response });
        }
        
        // Check for "jump X times" patterns FIRST (before single jump)
        const jumpTimesMatch = lowerMsg.match(/jump\s+(\d+)\s+times?/i);
        if (jumpTimesMatch) {
            const jumpCount = parseInt(jumpTimesMatch[1]);
            if (jumpCount > 0 && jumpCount <= 10) { // Limit to reasonable number
                const response = `Ok, Jumping ${jumpCount} Times`;
                console.log(`Player: ${playerName}, Message: ${message}, AI Response: ${response}`);
                return res.json({ response: response });
            }
        }
        
        // Check for "jump three times", "jump five times", etc.
        const numberWords = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        };
        
        for (let word in numberWords) {
            const pattern = new RegExp(`jump\\s+${word}\\s+times?`, 'i');
            if (pattern.test(lowerMsg)) {
                const jumpCount = numberWords[word];
                const response = `Ok, Jumping ${jumpCount} Times`;
                console.log(`Player: ${playerName}, Message: ${message}, AI Response: ${response}`);
                return res.json({ response: response });
            }
        }
        
        // Check for "jump jump jump" patterns (multiple jumps in one message)
        const jumpMatches = lowerMsg.match(/jump/g);
        if (jumpMatches && jumpMatches.length > 1) {
            const jumpCount = jumpMatches.length;
            if (jumpCount <= 10) { // Limit to reasonable number
                const response = `Ok, Jumping ${jumpCount} Times`;
                console.log(`Player: ${playerName}, Message: ${message}, AI Response: ${response}`);
                return res.json({ response: response });
            }
        }
        
        // Patterns that indicate actual jump requests (single jump only)
        const jumpRequestPatterns = [
            /^jump\s*$/i,                    // "jump" alone
            /can\s+you\s+jump/i,             // "can you jump"
            /please\s+jump/i,                // "please jump"
            /make\s+(?:the\s+)?(?:noob\s+)?jump/i, // "make jump" or "make the noob jump"
            /(?:i\s+want\s+you\s+to\s+)?jump\s+(?:now|please)?/i, // "jump now" or "jump please"
        ];
        
        // Check if it's a single jump request
        let isJumpRequest = false;
        
        for (let pattern of jumpRequestPatterns) {
            if (pattern.test(lowerMsg)) {
                isJumpRequest = true;
                break;
            }
        }
        
        // If it's a single jump request, respond with single jump
        if (isJumpRequest) {
            const response = `Ok, Jumping Now!`;
            console.log(`Player: ${playerName}, Message: ${message}, AI Response: ${response}`);
            return res.json({ response: response });
        }
        
        const systemPrompt = `You are a friendly AI assistant in a Roblox game. A player named ${playerName} is talking to you. 



IMPORTANT INSTRUCTIONS:
- If the player asks you to jump, make someone jump, or any variation of jumping, you MUST respond with exactly: "Ok, Jumping Now!"
- If the player asks you to follow them, you MUST respond with exactly: "Okay, Following You Now!"
- If the player asks you to stop following them, you MUST respond with exactly: "Okay I Won't Follow You Anymore!"
- Do NOT say "hi" or greet the player repeatedly
- Do NOT mention that you're an AI or external service
- Keep responses short and friendly
- Use ONLY the exact phrases above for these commands

Examples:
- Player: "jump" → You: "Ok, Jumping Now!"
- Player: "can you jump?" → You: "Ok, Jumping Now!"
- Player: "can you jump x times" (x is a number) → You: "Ok, Jumping x Times!" (x is the same number)
- Player: "walk forward x studs" (x is a number) → You: "Ok, Walking Forward x Studs!" (x is the same number)
- Player: "walk backward x studs" (x is a number) → You: "Ok, Walking Backward x Studs!" (x is the same number)
- Player: "walk left x studs" (x is a number) → You: "Ok, Walking Left x Studs!" (x is the same number)
- Player: "walk right x studs" (x is a number) → You: "Ok, Walking Right x Studs!" (x is the same number)
- Player: "make the noob jump" → You: "Ok, Jumping Now!"
- Player: "follow me" → You: "Okay, Following You Now!"
- Player: "stop following me" → You: "Okay I Won't Follow You Anymore!"
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




