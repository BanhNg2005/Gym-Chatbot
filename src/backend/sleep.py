from flask import Flask, request, jsonify
from firebase_admin import firestore
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def get_user_id():
    # Extract the user's ID token from the Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise Exception("Authorization header is missing")
    id_token = auth_header.split('Bearer ')[-1]
    decoded_token = firebase_auth.verify_id_token(id_token)
    user_id = decoded_token['uid']
    return user_id

@app.route('/')
def index():
    return "Welcome to the Sleep API"

# Create a new sleep record
@app.route('/sleep', methods=['POST'])
def create_sleep():
    try:
        user_id = get_user_id()
        data = request.json
        sleep_collection = db.collection('users').document(user_id).collection('sleepHistory')
        doc_ref = sleep_collection.add(data)
        return jsonify({"id": doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
# Get all sleep records for the current user
@app.route('/sleep', methods=['GET'])
def get_sleep():
    try:
        user_id = get_user_id()
        sleep_collection = db.collection('users').document(user_id).collection('sleepHistory')
        sleep_records = [doc.to_dict() for doc in sleep_collection.stream()]
        return jsonify(sleep_records), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
# Update a sleep record
@app.route('/sleep/<id>', methods=['PUT'])
def update_sleep(id):
    try:
        user_id = get_user_id()
        data = request.json
        sleep_ref = db.collection('users').document(user_id).collection('sleepHistory').document(id)
        sleep_ref.update(data)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
# Delete a sleep record
@app.route('/sleep/<id>', methods=['DELETE'])
def delete_sleep(id):
    try:
        user_id = get_user_id()
        sleep_ref = db.collection('users').document(user_id).collection('sleepHistory').document(id)
        sleep_ref.delete()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400