# Roblox AI Proxy with Groq

A proxy server that connects your Roblox game to Groq's AI API, allowing NPCs to have intelligent conversations with players.

## Features

- 🤖 Real AI conversations using Groq's fast LLM models
- 🎮 Easy integration with Roblox games
- 🔒 Secure API key management
- 🚀 Ready to deploy on Render
- 📝 Support for both Python and Node.js

## Setup Instructions

### 1. Get Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you'll need it for deployment)

### 2. Choose Your Platform

#### Option A: Python (Flask) - Recommended
- Uses `app.py`, `requirements.txt`, and `Dockerfile`
- Simpler setup and more stable

#### Option B: Node.js (Express)
- Uses `server.js` and `package.json`
- Faster startup times

### 3. Deploy to Render

1. **Create a GitHub repository** and upload these files
2. **Go to [render.com](https://render.com)** and create an account
3. **Click "New +"** → **"Web Service"**
4. **Connect your GitHub repository**
5. **Configure the service:**

   **For Python:**
   - **Name**: `roblox-ai-proxy`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`

   **For Node.js:**
   - **Name**: `roblox-ai-proxy`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

6. **Add Environment Variable:**
   - **Key**: `GROQ_API_KEY`
   - **Value**: Your Groq API key from step 1

7. **Click "Create Web Service"**

### 4. Test Your Deployment

Once deployed, test your service:
- Health check: `https://your-service-name.onrender.com/health`
- Should return: `{"status": "healthy", "service": "roblox-ai-proxy"}`

### 5. Roblox Integration

Add this script to your Roblox game in `ServerScriptService`:

```lua
local HttpService = game:GetService("HttpService")
local ChatService = game:GetService("Chat")
local Players = game:GetService("Players")

-- Replace with your Render service URL
local AI_SERVER_URL = "https://your-service-name.onrender.com/ai"

-- Create NPC
local function createNPC()
    local npc = Instance.new("Part")
    npc.Name = "AI_NPC"
    npc.Size = Vector3.new(2, 4, 2)
    npc.Position = Vector3.new(0, 2, 0)
    npc.Anchored = true
    npc.BrickColor = BrickColor.new("Bright blue")
    npc.Parent = workspace
    
    local head = Instance.new("Part")
    head.Name = "Head"
    head.Size = Vector3.new(2, 2, 2)
    head.Position = Vector3.new(0, 5, 0)
    head.Anchored = true
    head.BrickColor = BrickColor.new("Bright blue")
    head.Shape = Enum.PartType.Ball
    head.Parent = npc
    
    return npc
end

local npc = workspace:FindFirstChild("AI_NPC") or createNPC()

-- Get AI response
local function getAIResponse(player, message)
    local success, response = pcall(function()
        local url = AI_SERVER_URL .. "?msg=" .. HttpService:UrlEncode(message) .. "&player=" .. HttpService:UrlEncode(player.Name)
        return HttpService:GetAsync(url)
    end)
    
    if success then
        local data = HttpService:JSONDecode(response)
        return data.response or "Sorry, I didn't understand that."
    else
        return "Sorry, I'm having technical difficulties."
    end
end

-- Handle player chat
Players.PlayerChatted:Connect(function(player, message)
    if string.find(message:lower(), "ai") or string.find(message:lower(), "bot") or string.find(message:lower(), "hello") then
        local aiResponse = getAIResponse(player, message)
        
        if npc and npc:FindFirstChild("Head") then
            ChatService:Chat(npc.Head, aiResponse, Enum.ChatColor.Blue)
        end
    end
end)

print("AI NPC is ready! Players can chat with it.")
```

## Available Groq Models

You can change the model in your server code:

- `llama3-8b-8192` (default) - Fast and efficient
- `llama3-70b-8192` - More capable but slower
- `mixtral-8x7b-32768` - Good balance of speed and capability
- `gemma2-9b-it` - Google's Gemma model

## Customization

### Change AI Personality

Modify the `system_prompt` in your server code:

```python
system_prompt = f"You are a wise wizard in a Roblox game. A player named {player_name} is talking to you. Respond as a magical character with wisdom and humor."
```

### Add Rate Limiting

To prevent spam, add rate limiting to your server.

### Add Memory

Store conversation history to make the AI remember previous interactions.

## Troubleshooting

### Common Issues

1. **"Service not found" error in Roblox**
   - Check your Render service URL
   - Ensure the service is running (check Render dashboard)

2. **"API key error"**
   - Verify your `GROQ_API_KEY` environment variable in Render
   - Check that your Groq API key is valid

3. **Slow responses**
   - Groq is generally fast, but network latency can cause delays
   - Consider using a closer server location

### Testing Locally

1. Install dependencies: `pip install -r requirements.txt` (Python) or `npm install` (Node)
2. Set environment variable: `export GROQ_API_KEY=your_key_here`
3. Run: `python app.py` or `npm start`
4. Test: `curl "http://localhost:8080/health"`

## Cost Considerations

- **Render**: Free tier available (may sleep after inactivity)
- **Groq**: Pay-per-use pricing, very affordable
- **Typical cost**: ~$0.01-0.05 per 1000 messages

## Security Notes

- Never expose your API key in client-side code
- Consider adding authentication to your proxy
- Monitor usage to prevent abuse

## Support

If you encounter issues:
1. Check the Render logs
2. Test the health endpoint
3. Verify your API key
4. Check Roblox's HTTP request limits

---

**Happy coding! 🎮🤖** 