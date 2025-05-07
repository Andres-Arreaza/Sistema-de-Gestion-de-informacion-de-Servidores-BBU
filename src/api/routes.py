from flask import Flask, request, jsonify, Blueprint
from api.models import db, Servicio, Capa, Ambiente, Dominio, SistemaOperativo, Estatus, Servidor, HistorialServidor
from flask_cors import CORS

api = Blueprint('api', __name__)
CORS(api)

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

@api.route('/servidores/<int:servidor_id>', methods=['PUT'])
def update_servidor(servidor_id):
    data = request.get_json()
    servidor = Servidor.query.get(servidor_id)

    if not servidor:
        return jsonify({"msg": "Servidor no encontrado"}), 404

    # 📌 Guardamos los datos actuales ANTES de la modificación
    historial = HistorialServidor(
        servidor_id=servidor.id,
        nombre=servidor.nombre,
        tipo=servidor.tipo,
        ip=servidor.ip or "",
        balanceador=servidor.balanceador or "",
        vlan=servidor.vlan or "",
        descripcion=servidor.descripcion or "",
        link=servidor.link or "",
        servicio_id=servidor.servicio_id,
        capa_id=servidor.capa_id,
        ambiente_id=servidor.ambiente_id,
        dominio_id=servidor.dominio_id,
        sistema_operativo_id=servidor.sistema_operativo_id,
        estatus_id=servidor.estatus_id
    )

    db.session.add(historial)  # ✅ Se guarda el estado anterior antes de modificar

    # Aplicamos la modificación al servidor con datos nuevos, asegurando que sean válidos
    for campo in ["nombre", "tipo", "ip", "balanceador", "vlan", "descripcion", "link",
                  "servicio_id", "capa_id", "ambiente_id", "dominio_id", "sistema_operativo_id", "estatus_id"]:
        nuevo_valor = data.get(campo)
        if nuevo_valor is not None and db.session.query(eval(campo.split("_")[0].capitalize())).get(nuevo_valor):
            setattr(servidor, campo, nuevo_valor)

    db.session.commit()
    return jsonify(servidor.serialize()), 200

@api.route('/servidores/<int:servidor_id>/historial', methods=['GET'])
def get_servidor_historial(servidor_id):
    historial = HistorialServidor.query.filter_by(servidor_id=servidor_id).order_by(HistorialServidor.fecha_modificacion.desc()).all()
    if not historial:
        return jsonify({"msg": "No hay historial para este servidor"}), 404
    return jsonify([registro.serialize() for registro in historial]), 200

### **Capas, Ambientes, Dominios, Sistemas Operativos y Estatus**
@api.route('/capas', methods=['GET'])
def get_capas():
    capas = Capa.query.all()
    return jsonify([capa.serialize() for capa in capas]), 200

@api.route('/ambientes', methods=['GET'])
def get_ambientes():
    ambientes = Ambiente.query.all()
    return jsonify([ambiente.serialize() for ambiente in ambientes]), 200

@api.route('/dominios', methods=['GET'])
def get_dominios():
    dominios = Dominio.query.all()
    return jsonify([dominio.serialize() for dominio in dominios]), 200

@api.route('/sistemas-operativos', methods=['GET'])
def get_sistemas_operativos():
    sistemas_operativos = SistemaOperativo.query.all()
    return jsonify([so.serialize() for so in sistemas_operativos]), 200

@api.route('/estatus', methods=['GET'])
def get_estatus():
    estatus = Estatus.query.all()
    return jsonify([estatus.serialize() for estatus in estatus]), 200