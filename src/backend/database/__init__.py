from .db import Database
import app_config

database = Database(app_config.SERVICE_ACCOUNT_KEY_PATH)
database.connect()