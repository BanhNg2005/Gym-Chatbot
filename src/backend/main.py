import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get the API key from environment variables
api_key = os.getenv("API_KEY")
if not api_key:
    raise ValueError("No API key found. Please set the API_KEY environment variable.")

# Configure the API key for google.generativeai
genai.configure(api_key=api_key)

# Create a model instance
model = genai.GenerativeModel("gemini-1.5-flash")

# Define a list of gym-related keywords
GYM_KEYWORDS = [
    'gym', 'workout', 'exercise', 'fitness', 'nutrition', 'diet',
    'training', 'muscle', 'strength', 'cardio', 'weights', 'bodybuilding',
    'health', 'wellness', 'supplements', 'protein', 'calories', 'sleep',
    'rest', 'recovery', 'flexibility', 'endurance', 'aerobics', 'yoga',
    'pilates', 'HIIT', 'crossfit', 'stretching', 'mobility'
]

def is_gym_related(message):
    """Check if the message contains any gym-related keywords."""
    message_lower = message.lower()
    for keyword in GYM_KEYWORDS:
        if keyword in message_lower:
            return True
    return False

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Chatbot API"

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Check if the message is gym-related
        if not is_gym_related(user_message):
            return jsonify({
                "response": "The topic is irrelevant, I can only answer questions related to gym topics like nutrition and workout."
            }), 200

        # Generate content using the google.generativeai library
        response = model.generate_content(user_message)
        chatbot_response = response.text

        return jsonify({"response": chatbot_response})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)