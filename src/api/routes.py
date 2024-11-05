"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

appointments = []

@api.route('/appointments', methods=['GET', 'POST'])
def manage_appointments():
    if request.method == 'POST':
        data = request.json
        # Check if the appointment time is available
        for appointment in appointments:
            if appointment['date'] == data['date']:
                return jsonify({"message": "Time slot is not available!"}), 400
        
        appointments.append(data)
        return jsonify({"message": "Appointment added!", "appointment": data}), 201
    return jsonify(appointments)

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200
