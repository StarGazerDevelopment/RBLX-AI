from flask import Flask, request, jsonify
import groq
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Set up Groq client
groq_client = groq.Groq(api_key=os.environ.get('GROQ_API_KEY'))

@app.route('/ai', methods=['GET'])
def ai_response():
    try:
        # Get message from Roblox
        message = request.args.get('msg', '')
        player_name = request.args.get('player', 'Unknown')
        
        if not message:
            return jsonify({'response': 'No message received'})
        
        # Create context for the AI
        system_prompt = f"You are a friendly AI assistant in a Roblox game. A player named {player_name} is talking to you. Keep responses short, friendly, and appropriate for a Roblox game. Don't mention that you're an AI or external service. Keep responses under 100 characters."
        
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            model="llama3-8b-8192",  # You can change this to other Groq models
            max_tokens=100,
            temperature=0.7
        )
        
        ai_response = chat_completion.choices[0].message.content
        
        return jsonify({'response': ai_response})
        
    except Exception as e:
        return jsonify({'response': f'Sorry, I had an error: {str(e)}'})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'roblox-ai-proxy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080))) 