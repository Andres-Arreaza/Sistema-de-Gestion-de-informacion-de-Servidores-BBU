"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, current_app 
from api.models import db, UserProfile, MedicalProfile, TokenBlockedList
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

appointments = []

@api.route('/appointments', methods=['GET', 'POST'])
def manage_appointments():
    if request.method == 'POST':
        data = request.json
        # Validate request data
        if 'name' not in data or 'date' not in data:
            return jsonify({"message": "Missing name or date in request"}), 400
        
        existing_appointment = appointment.query.filter_by(date=data['date']).first()  # Assuming you have an Appointment model
        if existing_appointment:
            return jsonify({"message": "Time slot is not available!"}), 400
        
        new_appointment = appointment(name=data['name'], date=data['date'])  # Assuming you have an Appointment model
        db.session.add(new_appointment)
        db.session.commit()
        return jsonify({"message": "Appointment added!", "appointment": data}), 201

    appointments = appointment.query.all() 
    return jsonify([appointment.serialize() for appointment in appointments]), 200

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

#Registro UserProfile y MedicalProfile

@api.route('/signup', methods=['POST'])
def signup_user():
    try:
        body = request.get_json()
        exist_user=UserProfile.query.filter_by(email=body["email"]).first()
        if exist_user:
            return jsonify({"msg": "User exists already"}), 404
        pw_hash=current_app.bcrypt.generate_password_hash(body["password"]).decode("utf-8")
        new_user=UserProfile(
            email=body["email"],
            # password=pw_hash,
            password=pw_hash,
            first_name=body["first_name"],
            last_name=body["last_name"],
            city=body["city"],
            country=body["country"],
            address=body["address"],
            photo=body["photo"],
            birthday=body["birthday"],
            is_active=True
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "User created"}), 201
    except Exception as e:
        return jsonify({"msg": "Error al crear el usuario", "error": str(e)}), 500


@api.route('/signup/medical', methods=['POST'])
@jwt_required()
def signup_medical():
    try:
        body = request.get_json()
        user_id=get_jwt_identity()
        exist_user=UserProfile.query.get(user_id)
        if not exist_user:
            return jsonify({"msg": "User not found"}), 404
        new_medical=MedicalProfile(
            user_id=user_id,
            # password=pw_hash,
            specialty= body["specialty"],
            university= body["university"],
            time_availability=body["time_availability"],
            medical_consultation_price=body["medical_consultation_price"]
        )
        db.session.add(new_medical)
        db.session.commit()
        return jsonify({"msg": "Medical created"}), 201
    except Exception as e:
        return jsonify({"msg": "Error creating Medical Profile", "error": str(e)}), 500

#Inicio de sesión userProfile y medicalProfile

@api.route('/login', methods=['POST'])
def login_user():
    
    try:
        body = request.get_json()
        if body['email'] is None:
         return jsonify({"msg":"Por favor ingrese su usuario"}),400
        if body['password'] is None:
            return jsonify({"msg":"Por favor ingrese su contraseña correctamente"}), 400
        user=UserProfile.query.filter_by(email=body["email"]).first()
        validate_password=current_app.bcrypt.check_password_hash(user.password, body["password"])
        if not validate_password:
         return jsonify({"msg":"credenciales incorrectas"}), 401
        token=create_access_token(identity=user.id)
        response_body={
            "token":token,
            "user":user.serialize()
        }
        return jsonify(response_body), 200
    except Exception as e:
        return jsonify({"msg": "Error al iniciar sesión", "error": str(e)}), 500

#Cierre de sesión userProfile y medicalProfile
@api.route("/logout", methods=["POST"])
@jwt_required()
def user_logout():
    try:
        token_data=get_jwt_identity()
        token_blocked=TokenBlockedList(jti=token_data["jti"])
        db.session.add(token_blocked)
        db.session.commit()
        return jsonify({"msg":"Session cerrada"}), 200
    except Exception as e:
        return jsonify({"msg": "Error al cierre de sesión", "error": str(e)}), 500