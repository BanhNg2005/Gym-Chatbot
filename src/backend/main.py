import os
from flask import Flask, request, jsonify, send_from_directory

def configure():
    from dotenv import load_dotenv
    load_dotenv()

configure()

# get the API key from environment variables
api_key = os.getenv("API_KEY")
api_url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}'

# define the headers for the POST request
headers = {
    'Content-Type': 'application/json'
}

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Chatbot API"

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": user_message
                    }
                ]
            }
        ]
    }
    return jsonify({"reply": "This is a placeholder response"})

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

if __name__ == '__main__':
    app.run(debug=True)