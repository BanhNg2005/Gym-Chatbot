from flask import request
import jwt
import app_config 

def validate_jwt():
    token = None
    user_information = None

    if 'x-access-token' in request.headers:
        token = request.headers['x-access-token']

    if not token:
        return 400
    try: 
        user_information = jwt.decode(token, app_config.TOKEN_SECRET, algorithms = ['HS256'])
    except:
        return 401 # it means something wrong happened when trying to decode the token
    
    return user_information