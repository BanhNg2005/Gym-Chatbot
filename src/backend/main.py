import os
import google.generativeai as genai
from dotenv import load_dotenv
import requests
import json

def configure() -> None:
    load_dotenv()

# Call the configure function to load the environment variables
configure()

# Get the API key from environment variables
api_key = os.getenv("API_KEY")
api_url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}'

# Define the headers and data for the POST request
headers = {
    'Content-Type': 'application/json'
}
data = {
    "contents": [
        {
            "parts": [
                {
                    "text": "Explain how AI works"
                }
            ]
        }
    ]
}

# Send the POST request
response = requests.post(api_url, headers=headers, data=json.dumps(data))

# Print the response status code and content
print(f'Status Code: {response.status_code}')
print(f'Response Content: {response.content.decode()}')