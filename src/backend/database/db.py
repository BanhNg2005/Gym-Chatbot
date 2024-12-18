import firebase_admin
from firebase_admin import credentials, firestore

class Database:
    def __init__(self, service_account_path=None):
        if service_account_path is None:
            raise Exception("Firestore requires the service account path!")
        
        self.__service_account_path = service_account_path
        self.__db = None

    @property
    def database(self):
        return self.__db

    def connect(self):
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(self.__service_account_path)
                firebase_admin.initialize_app(cred)
                print("Firebase app initialized.")
            else:
                print("Firebase app already initialized.")

            self.__db = firestore.client()
            print("Connected to Firebase Firestore.")
        except FileNotFoundError:
            print(f"Service account key not found at {self.__service_account_path}")
            # raise
        except Exception:
            print(f"Firebase connection error")
            # raise