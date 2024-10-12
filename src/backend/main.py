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

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Chatbot API"

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Generate content using the google.generativeai library
        response = model.generate_content(user_message)
        chatbot_response = response.text

        return jsonify({"response": chatbot_response})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)