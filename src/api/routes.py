from flask import Flask, request, jsonify, url_for, Blueprint, current_app
from api.models import db, Servicio, Capa, Ambiente, Dominio, SistemaOperativo, Estatus, Servidor
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, get_jwt, jwt_required 
import json
import os

api = Blueprint('api', __name__)
CORS(api, resources={
    r"/api/*": {
        "origins": "*",  # En producción, especifica los dominios permitidos
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range"],
        "supports_credentials": True
    }
})

### **Servicios**
@api.route('/servicios', methods=['GET'])
def get_servicios():
    servicios = Servicio.query.all()
    return jsonify([servicio.serialize() for servicio in servicios]), 200

@api.route('/servicios', methods=['POST'])
def create_servicio():
    data = request.get_json()
    nuevo_servicio = Servicio(nombre=data['nombre'], descripcion=data.get('descripcion'))
    db.session.add(nuevo_servicio)
    db.session.commit()
    return jsonify(nuevo_servicio.serialize()), 201

### **Servidores**
@api.route('/servidores', methods=['GET'])
def get_servidores():
    servidores = Servidor.query.all()
    return jsonify([servidor.serialize() for servidor in servidores]), 200

@api.route('/servidores', methods=['POST'])
def create_servidor():
    data = request.get_json()

    nuevo_servidor = Servidor(
        nombre=data['nombre'],
        tipo=data['tipo'],
        ip=data.get('ip'),
        balanceador=data.get('balanceador'),
        vlan=data.get('vlan'),
        descripcion=data.get('descripcion'),
        link=data.get('link'),
        servicio_id=data['servicio_id'],
        capa_id=data['capa_id'],
        ambiente_id=data['ambiente_id'],
        dominio_id=data['dominio_id'],
        sistema_operativo_id=data['sistema_operativo_id'],
        estatus_id=data['estatus_id']
    )

    db.session.add(nuevo_servidor)
    db.session.commit()
    return jsonify(nuevo_servidor.serialize()), 201

### **Capas, Ambientes, Dominios, Sistemas Operativos y Estatus**
@api.route('/capas', methods=['GET'])
def get_capas():
    capas = Capa.query.all()
    return jsonify([capa.serialize() for capa in capas]), 200

@api.route('/capas', methods=['POST'])
def create_capa():
    data = request.get_json()
    nueva_capa = Capa(nombre=data['nombre'], descripcion=data.get('descripcion'))
    db.session.add(nueva_capa)
    db.session.commit()
    return jsonify(nueva_capa.serialize()), 201

@api.route('/ambientes', methods=['GET'])
def get_ambientes():
    ambientes = Ambiente.query.all()
    return jsonify([ambiente.serialize() for ambiente in ambientes]), 200

@api.route('/ambientes', methods=['POST'])
def create_ambiente():
    data = request.get_json()
    nuevo_ambiente = Ambiente(nombre=data['nombre'], descripcion=data.get('descripcion'))
    db.session.add(nuevo_ambiente)
    db.session.commit()
    return jsonify(nuevo_ambiente.serialize()), 201

@api.route('/dominios', methods=['GET'])
def get_dominios():
    dominios = Dominio.query.all()
    return jsonify([dominio.serialize() for dominio in dominios]), 200

@api.route('/dominios', methods=['POST'])
def create_dominio():
    data = request.get_json()
    nuevo_dominio = Dominio(nombre=data['nombre'], descripcion=data.get('descripcion'))
    db.session.add(nuevo_dominio)
    db.session.commit()
    return jsonify(nuevo_dominio.serialize()), 201

@api.route('/sistemas-operativos', methods=['GET'])
def get_sistemas_operativos():
    sistemas_operativos = SistemaOperativo.query.all()
    return jsonify([so.serialize() for so in sistemas_operativos]), 200

@api.route('/sistemas-operativos', methods=['POST'])
def create_sistema_operativo():
    data = request.get_json()
    nuevo_so = SistemaOperativo(
        nombre=data['nombre'], 
        version=data.get('version'), 
        descripcion=data.get('descripcion')
    )
    db.session.add(nuevo_so)
    db.session.commit()
    return jsonify(nuevo_so.serialize()), 201

@api.route('/estatus', methods=['GET'])
def get_estatus():
    estatus = Estatus.query.all()
    return jsonify([estatus.serialize() for estatus in estatus]), 200

@api.route('/estatus', methods=['POST'])
def create_estatus():
    data = request.get_json()
    nuevo_estatus = Estatus(nombre=data['nombre'], descripcion=data.get('descripcion'))
    db.session.add(nuevo_estatus)
    db.session.commit()
    return jsonify(nuevo_estatus.serialize()), 201