"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Doctor, RoleEnum
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200



@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    exist=User.query.filter_by(email=data.get("email")).first()
    if exist:
        return jsonify({"msg": "email already exists"}), 400

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    country = data.get('country')
    city = data.get('city')
    role = data.get('role')

    if role not in [RoleEnum.PATIENT.value, RoleEnum.DOCTOR.value]:
        print(RoleEnum.PATIENT.value)
        return jsonify({"error": "Invalid role"}), 400
   
    # Crea el usuario
    hashed_password = generate_password_hash(password)
    print(hashed_password)
    user = User(
        email=email,
        password=hashed_password,
        first_name=first_name,
        last_name=last_name,
        country=country,
        city=city,
        role=role
    )

    db.session.add(user)
    db.session.commit()


    # Si el rol es 'doctor', crea la entrada correspondiente en la tabla Doctor
    if role == RoleEnum.DOCTOR.value:
        speciality = data.get('speciality')
        time_availability = data.get('time_availability')
        medical_consultant_price = data.get('medical_consultant_price')

        # Verificar si el doctor ya existe para evitar duplicados
        if Doctor.query.filter_by(user_id=user.id).first():
            return jsonify({"error": "Doctor already exists for this user"}), 400

        doctor = Doctor(
            user_id=user.id,
            speciality=speciality,
            time_availability=time_availability,
            medical_consultant_price=medical_consultant_price
        )
        db.session.add(doctor)
        db.session.commit()

        return jsonify(doctor.serialize()), 201
    
    return jsonify(user.serialize()), 201



@api.route('/doctors', methods=['GET'])
def get_doctors():
    doctors=Doctor.query.all() 
    if doctors==[]:
        return jsonify({"msg": "doctors don't exist"}), 400
    results=list(map(lambda item:item.serialize(), doctors))
    return jsonify (results), 200

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email=data.get("email", None)
    password=data.get("password", None)
    user=User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "user not found"}), 404
    valid_password=  check_password_hash(user.password, password)
    if not valid_password:
        return jsonify({"msg": "invalid email or password"}), 400
    access_token=create_access_token(identity={"id": user.id, "role": user.role.value})
    result={}
    result["access_token"]=access_token
    if user.role.value == RoleEnum.DOCTOR.value:
        doctor=Doctor.query.filter_by(user_id=user.id).first()
        if not doctor:
            return jsonify({"msg": "doctor not found"}), 404
        result["doctor"]=doctor.serialize()
        return jsonify(result), 200
    result["user"]=user.serialize()
    return jsonify(result), 200



