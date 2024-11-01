from flask import Flask, request, jsonify
from firebase_admin import firestore
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

# Initialize Firestore DB
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
    return "Welcome to the Workout API"

# Create a new workout plan
@app.route('/workout', methods=['POST'])
def create_workout():
    try:
        user_id = get_user_id()
        data = request.json
        workout_collection = db.collection('users').document(user_id).collection('workoutHistory')
        doc_ref = workout_collection.add(data)
        return jsonify({"id": doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Get all workout plans for the current user
@app.route('/workouts', methods=['GET'])
def get_workouts():
    try:
        user_id = get_user_id()
        workout_collection = db.collection('users').document(user_id).collection('workoutHistory')
        workouts = [doc.to_dict() for doc in workout_collection.stream()]
        return jsonify(workouts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Update a workout plan
@app.route('/workout/<id>', methods=['PUT'])
def update_workout(id):
    try:
        user_id = get_user_id()
        data = request.json
        workout_ref = db.collection('users').document(user_id).collection('workoutHistory').document(id)
        workout_ref.update(data)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Delete a workout plan
@app.route('/workout/<id>', methods=['DELETE'])
def delete_workout(id):
    try:
        user_id = get_user_id()
        workout_ref = db.collection('users').document(user_id).collection('workoutHistory').document(id)
        workout_ref.delete()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)