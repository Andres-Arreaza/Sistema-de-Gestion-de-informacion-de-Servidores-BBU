"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, current_app 
from api.models import db, UserProfile, MedicalProfile, TokenBlockedList, Especialidades, Doctors
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required


api = Blueprint('api', __name__)


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

# Devuelve una lista de todas las especialidades
@api.route('/especialidades', methods=['GET'])
def get_especialidades():
    especialidades = Especialidades.query.all()
    return jsonify([{
        'id': especialidad.id,
        'nombre': especialidad.nombre,
        'descripcion': especialidad.descripcion
    } for especialidad in especialidades])

# Crea una nueva especialidad
@api.route('/especialidades', methods=['POST'])
def crear_especialidades():
    data = request.get_json()

    if not data or 'nombre' not in data:
        return jsonify({'message':'Falta el nombre'}), 400
    
    especialidad_existe = Especialidades.query.filter_by(nombre=data['nombre']).first()
    if especialidad_existe:
        return jsonify({'message':'Esta especialidad ya existe'}), 409
    
    descripcion = data.get('descripcion', None)

    nueva_especialidad = Especialidades(
        nombre=data['nombre'],
        descripcion=data['descripcion']
    )
    db.session.add(nueva_especialidad)
    db.session.commit()
    return jsonify({'message': 'Especialidad created'}), 201

#Actualizar una especialidad existente
@api.route('/especialidades/<int:id>', methods=['PUT'])
def update_especialidades(id):
    especialidades = Especialidades.query.get(id)
    if not especialidades:
        return jsonify({'message':'La especialidad no existe'}), 404
    
    data = request.get_json()
    if 'nombre' in data:
        especialidades.nombre = data['nombre']
    if 'descripcion' in data:
        especialidades.descripcion = data.get('descripcion', None)

    db.session.commit()
    return jsonify({'message':'Especialidad actualizada'}), 200

#Elimina una especialidad 
@api.route('/especialidades/<int:id>', methods=['DELETE'])
def delete_especialidades(id):
    especialidades = Especialidades.query.get(id)
    if not especialidades:
        return jsonify({'message':'Especidalidad no existe'}), 404
    
    db.session.delete(especialidades)
    db.session.commit()
    return jsonify({'message':'Especialidad eliminada'}), 204

#Obtener el doctor por especialidad
@api.route('/doctors', methods=['GET'])
def get_doctors_by_speciality():
        speciality_id = request.args.get('speciality')
        if speciality_id: 
            doctors = Doctors.query.filter_by(speciality=speciality_id).all()
        else:
            doctors = Doctors.query.all()
        return jsonify(doctor.serialize() for doctor in doctors), 200
