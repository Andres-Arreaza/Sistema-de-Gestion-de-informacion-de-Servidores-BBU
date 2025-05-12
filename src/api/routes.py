from flask import Flask, request, jsonify, Blueprint
from api.models import db, Servicio, Capa, Ambiente, Dominio, SistemaOperativo, Estatus, Servidor
from flask_cors import CORS
from datetime import datetime

api = Blueprint('api', __name__)
CORS(api)

### **Funciones auxiliares**
def update_record(record, data):
    """ Actualiza los campos de un registro y su fecha de modificación """
    for key, value in data.items():
        if hasattr(record, key):
            setattr(record, key, value)
    record.fecha_modificacion = datetime.utcnow()
    db.session.commit()
    return record.serialize()

def delete_record(record):
    """ Borrado lógico de un registro """
    if not record:
        return jsonify({"msg": f"{record.__class__.__name__} no encontrado"}), 404
    if not record.activo:
        return jsonify({"msg": f"{record.__class__.__name__} ya está eliminado"}), 400

    record.activo = False
    record.fecha_modificacion = datetime.utcnow()
    db.session.commit()
    return jsonify({"msg": f"{record.__class__.__name__} eliminado correctamente", "fecha_modificacion": record.fecha_modificacion.isoformat()}), 200

def create_generic(model):
    """ Crear un nuevo registro, reutilizando nombres eliminados """
    data = request.get_json()
    
    # Verificar si ya existe un registro con el mismo nombre pero inactivo
    registro_existente = model.query.filter_by(nombre=data['nombre']).first()
    
    if registro_existente and not registro_existente.activo:
        # Reactivar el registro en lugar de crear uno nuevo
        registro_existente.activo = True
        registro_existente.descripcion = data.get('descripcion', registro_existente.descripcion)
        registro_existente.fecha_modificacion = datetime.utcnow()
        db.session.commit()
        return jsonify(registro_existente.serialize()), 200
    
    # Crear un nuevo registro si no existe
    nuevo_registro = model(
        nombre=data['nombre'],
        descripcion=data.get('descripcion'),
        activo=True,
        fecha_creacion=datetime.utcnow()
    )
    db.session.add(nuevo_registro)
    db.session.commit()
    return jsonify(nuevo_registro.serialize()), 201

def update_generic(model, record_id):
    """ Actualizar un registro existente """
    record = model.query.get(record_id)
    if not record:
        return jsonify({"msg": f"{model.__name__} con ID {record_id} no encontrado"}), 404
    if not record.activo:
        return jsonify({"msg": f"{model.__name__} con ID {record_id} está inactivo y no puede ser actualizado"}), 400

    return jsonify(update_record(record, request.get_json())), 200

def get_generic(model):
    """ Obtener todos los registros, con opción de incluir inactivos """
    incluir_inactivos = request.args.get('incluir_inactivos', 'false').lower() == 'true'
    records = model.query.all() if incluir_inactivos else model.query.filter_by(activo=True).all()
    return jsonify([record.serialize() for record in records]), 200

def get_generic_by_id(model, record_id):
    """ Obtener un registro por su ID """
    record = model.query.get(record_id)
    if not record:
        return jsonify({"msg": f"{model.__name__} con ID {record_id} no encontrado"}), 404
    return jsonify(record.serialize()), 200

def delete_generic(model, record_id):
    """ Borrado lógico de un registro """
    record = model.query.get(record_id)
    return delete_record(record)

### **Rutas para Servicio**

#########################################################################
@api.route('/servicios', methods=['GET'])
def get_servicios():
    """ Obtener todos los servicios con solo nombre y descripción """
    servicios = Servicio.query.filter_by(activo=True).all()
    return jsonify([{
        "id": servicio.id,
        "nombre": servicio.nombre,
        "descripcion": servicio.descripcion
    } for servicio in servicios]), 200

@api.route('/servicios/<int:servicio_id>', methods=['GET'])
def get_servicio(servicio_id):
    return get_generic_by_id(Servicio, servicio_id)

@api.route('/servicios', methods=['POST'])
def create_servicio():
    data = request.get_json()
    nombre_servicio = data.get("nombre")

    # 🔹 Verificar si el servicio ya existe
    servicio_existente = Servicio.query.filter_by(nombre=nombre_servicio).first()

    if servicio_existente and servicio_existente.activo:
        return jsonify({"error": "El nombre del servicio ya está registrado"}), 400

    # 🔹 Si el servicio existe pero está eliminado, reactivarlo
    if servicio_existente and not servicio_existente.activo:
        servicio_existente.activo = True
        servicio_existente.descripcion = data.get("descripcion", servicio_existente.descripcion)
        db.session.commit()
        return jsonify({"mensaje": "Servicio reactivado exitosamente", "servicio": servicio_existente.serialize()}), 200

    # 🔹 Crear un nuevo servicio si no existe
    nuevo_servicio = Servicio(nombre=nombre_servicio, descripcion=data.get("descripcion"), activo=True)
    db.session.add(nuevo_servicio)
    db.session.commit()

    return jsonify({"mensaje": "Servicio creado exitosamente", "servicio": nuevo_servicio.serialize()}), 201

@api.route('/servicios/<int:servicio_id>', methods=['PUT'])
def update_servicio(servicio_id):
    return update_generic(Servicio, servicio_id)

@api.route('/servicios/<int:servicio_id>', methods=['DELETE'])
def delete_servicio(servicio_id):
    return delete_generic(Servicio, servicio_id)

### **Rutas para Capa**
@api.route('/capas', methods=['GET'])
def get_capas():
    """ Obtener todas las capas con solo nombre y descripción """
    capas = Capa.query.filter_by(activo=True).all()
    return jsonify([{ 
        "id": capa.id, 
        "nombre": capa.nombre, 
        "descripcion": capa.descripcion 
    } for capa in capas]), 200

@api.route('/capas/<int:capa_id>', methods=['GET'])
def get_capa(capa_id):
    return get_generic_by_id(Capa, capa_id)

@api.route('/capas', methods=['POST'])
def create_capa():
    data = request.get_json()
    nombre_capa = data.get("nombre")

    # 🔹 Verificar si la capa ya existe
    capa_existente = Capa.query.filter_by(nombre=nombre_capa).first()

    if capa_existente and capa_existente.activo:
        return jsonify({"error": "El nombre de la capa ya está registrado"}), 400

    # 🔹 Si la capa existe pero está eliminada, reactivarla
    if capa_existente and not capa_existente.activo:
        capa_existente.activo = True
        capa_existente.descripcion = data.get("descripcion", capa_existente.descripcion)
        db.session.commit()
        return jsonify({"mensaje": "Capa reactivada exitosamente", "capa": capa_existente.serialize()}), 200

    # 🔹 Crear una nueva capa si no existe
    nueva_capa = Capa(nombre=nombre_capa, descripcion=data.get("descripcion"), activo=True)
    db.session.add(nueva_capa)
    db.session.commit()

    return jsonify({"mensaje": "Capa creada exitosamente", "capa": nueva_capa.serialize()}), 201

@api.route('/capas/<int:capa_id>', methods=['PUT'])
def update_capa(capa_id):
    return update_generic(Capa, capa_id)

@api.route('/capas/<int:capa_id>', methods=['DELETE'])
def delete_capa(capa_id):
    return delete_generic(Capa, capa_id)

### **Rutas para Ambiente**
@api.route('/ambientes', methods=['GET'])
def get_ambientes():
    """ Obtener todos los ambientes con solo nombre y descripción """
    ambientes = Ambiente.query.filter_by(activo=True).all()
    return jsonify([{ 
        "id": ambiente.id, 
        "nombre": ambiente.nombre, 
        "descripcion": ambiente.descripcion 
    } for ambiente in ambientes]), 200

@api.route('/ambientes/<int:ambiente_id>', methods=['GET'])
def get_ambiente(ambiente_id):
    return get_generic_by_id(Ambiente, ambiente_id)

@api.route('/ambientes', methods=['POST'])
def create_ambiente():
    data = request.get_json()
    nombre_ambiente = data.get("nombre")

    # 🔹 Verificar si el ambiente ya existe
    ambiente_existente = Ambiente.query.filter_by(nombre=nombre_ambiente).first()

    if ambiente_existente and ambiente_existente.activo:
        return jsonify({"error": "El nombre del ambiente ya está registrado"}), 400

    # 🔹 Si el ambiente existe pero está eliminado, reactivarlo
    if ambiente_existente and not ambiente_existente.activo:
        ambiente_existente.activo = True
        ambiente_existente.descripcion = data.get("descripcion", ambiente_existente.descripcion)
        db.session.commit()
        return jsonify({"mensaje": "Ambiente reactivado exitosamente", "ambiente": ambiente_existente.serialize()}), 200

    # 🔹 Crear un nuevo ambiente si no existe
    nuevo_ambiente = Ambiente(nombre=nombre_ambiente, descripcion=data.get("descripcion"), activo=True)
    db.session.add(nuevo_ambiente)
    db.session.commit()

    return jsonify({"mensaje": "Ambiente creado exitosamente", "ambiente": nuevo_ambiente.serialize()}), 201

@api.route('/ambientes/<int:ambiente_id>', methods=['PUT'])
def update_ambiente(ambiente_id):
    return update_generic(Ambiente, ambiente_id)

@api.route('/ambientes/<int:ambiente_id>', methods=['DELETE'])
def delete_ambiente(ambiente_id):
    return delete_generic(Ambiente, ambiente_id)

### **Rutas para Dominio**
@api.route('/dominios', methods=['GET'])
def get_dominios():
    """ Obtener todos los dominios con solo nombre y descripción """
    dominios = Dominio.query.filter_by(activo=True).all()
    return jsonify([{ 
        "id": dominio.id, 
        "nombre": dominio.nombre, 
        "descripcion": dominio.descripcion 
    } for dominio in dominios]), 200

@api.route('/dominios/<int:dominio_id>', methods=['GET'])
def get_dominio(dominio_id):
    return get_generic_by_id(Dominio, dominio_id)

@api.route('/dominios', methods=['POST'])
def create_dominio():
    data = request.get_json()
    nombre_dominio = data.get("nombre")

    # 🔹 Verificar si el dominio ya existe
    dominio_existente = Dominio.query.filter_by(nombre=nombre_dominio).first()

    if dominio_existente and dominio_existente.activo:
        return jsonify({"error": "El nombre del dominio ya está registrado"}), 400

    # 🔹 Si el dominio existe pero está eliminado, reactivarlo
    if dominio_existente and not dominio_existente.activo:
        dominio_existente.activo = True
        dominio_existente.descripcion = data.get("descripcion", dominio_existente.descripcion)
        db.session.commit()
        return jsonify({"mensaje": "Dominio reactivado exitosamente", "dominio": dominio_existente.serialize()}), 200

    # 🔹 Crear un nuevo dominio si no existe
    nuevo_dominio = Dominio(nombre=nombre_dominio, descripcion=data.get("descripcion"), activo=True)
    db.session.add(nuevo_dominio)
    db.session.commit()

    return jsonify({"mensaje": "Dominio creado exitosamente", "dominio": nuevo_dominio.serialize()}), 201

@api.route('/dominios/<int:dominio_id>', methods=['PUT'])
def update_dominio(dominio_id):
    return update_generic(Dominio, dominio_id)

@api.route('/dominios/<int:dominio_id>', methods=['DELETE'])
def delete_dominio(dominio_id):
    return delete_generic(Dominio, dominio_id)

### **Rutas para Sistemas Operativos**
@api.route('/sistemas-operativos', methods=['POST'])
def create_sistema_operativo():
    """ Crear un nuevo sistema operativo por ID, reutilizando nombres eliminados """
    data = request.get_json()

    nombre = data.get("nombre", "").strip()
    version = data.get("version", "").strip()
    descripcion = data.get("descripcion", "").strip()

    if not nombre or not version:
        return jsonify({"msg": "El nombre y la versión son obligatorios"}), 400

    # Verificar si ya existe un sistema operativo con el mismo nombre y versión pero inactivo
    sistema_existente = SistemaOperativo.query.filter_by(nombre=nombre, version=version, activo=False).first()

    if sistema_existente:
        # Reactivar el sistema operativo en lugar de crear uno nuevo
        sistema_existente.activo = True
        sistema_existente.descripcion = descripcion or sistema_existente.descripcion
        sistema_existente.fecha_modificacion = datetime.utcnow()
        db.session.commit()
        return jsonify(sistema_existente.serialize()), 200

    # Crear un nuevo sistema operativo si no existe
    nuevo_sistema_operativo = SistemaOperativo(
        nombre=nombre,
        version=version,
        descripcion=descripcion,
        activo=True,
        fecha_creacion=datetime.utcnow()
    )

    db.session.add(nuevo_sistema_operativo)
    db.session.commit()
    return jsonify(nuevo_sistema_operativo.serialize()), 201

@api.route('/sistemas-operativos/<int:so_id>', methods=['PUT'])
def update_sistema_operativo(so_id):
    """ Actualizar un sistema operativo por ID """
    data = request.get_json()
    sistema_operativo = SistemaOperativo.query.get(so_id)

    if not sistema_operativo:
        return jsonify({"msg": f"Sistema Operativo con ID {so_id} no encontrado"}), 404

    # Permitir reactivación si está inactivo
    if not sistema_operativo.activo and data.get("activo", False):
        sistema_operativo.activo = True

    sistema_operativo.nombre = data.get("nombre", sistema_operativo.nombre).strip()
    sistema_operativo.version = data.get("version", sistema_operativo.version).strip()
    sistema_operativo.descripcion = data.get("descripcion", sistema_operativo.descripcion).strip()
    sistema_operativo.fecha_modificacion = datetime.utcnow()

    db.session.commit()
    return jsonify(sistema_operativo.serialize()), 200

@api.route('/sistemas-operativos/<int:so_id>', methods=['DELETE'])
def delete_sistema_operativo(so_id):
    """ Borrado lógico de un sistema operativo por ID """
    sistema_operativo = SistemaOperativo.query.get(so_id)

    if not sistema_operativo:
        return jsonify({"msg": f"Sistema Operativo con ID {so_id} no encontrado"}), 404

    if not sistema_operativo.activo:
        return jsonify({"msg": f"Sistema Operativo con ID {so_id} ya está eliminado"}), 400

    sistema_operativo.activo = False
    sistema_operativo.fecha_modificacion = datetime.utcnow()
    db.session.commit()

    return jsonify({"msg": f"Sistema Operativo con ID {so_id} eliminado correctamente"}), 200

### **Rutas para Estatus**
@api.route('/estatus', methods=['GET'])
def get_estatus():
    return get_generic(Estatus)

@api.route('/estatus/<int:estatus_id>', methods=['GET'])
def get_estatus_by_id(estatus_id):
    return get_generic_by_id(Estatus, estatus_id)

@api.route('/estatus', methods=['POST'])
def create_estatus():
    return create_generic(Estatus)

@api.route('/estatus/<int:estatus_id>', methods=['PUT'])
def update_estatus(estatus_id):
    return update_generic(Estatus, estatus_id)

@api.route('/estatus/<int:estatus_id>', methods=['DELETE'])
def delete_estatus(estatus_id):
    return delete_generic(Estatus, estatus_id)

### **Rutas para Servidor**
@api.route('/servidores', methods=['POST'])
def create_servidor():
    """ Crear un nuevo servidor por ID, reutilizando nombres eliminados """
    data = request.get_json()

    nombre = data.get("nombre", "").strip()
    tipo = data.get("tipo", "").strip()
    servicio_id = data.get("servicio_id")
    capa_id = data.get("capa_id")
    ambiente_id = data.get("ambiente_id")
    dominio_id = data.get("dominio_id")
    sistema_operativo_id = data.get("sistema_operativo_id")
    estatus_id = data.get("estatus_id")

    if not nombre or not tipo or not servicio_id or not capa_id or not ambiente_id or not dominio_id or not sistema_operativo_id or not estatus_id:
        return jsonify({"msg": "Todos los campos obligatorios deben estar presentes"}), 400

    # Verificar si ya existe un servidor con el mismo nombre pero inactivo
    servidor_existente = Servidor.query.filter_by(nombre=nombre, activo=False).first()

    if servidor_existente:
        # Reactivar el servidor en lugar de crear uno nuevo
        servidor_existente.activo = True
        servidor_existente.fecha_modificacion = datetime.utcnow()
        db.session.commit()
        return jsonify(servidor_existente.serialize()), 200

    # Crear un nuevo servidor si no existe
    nuevo_servidor = Servidor(
        nombre=nombre,
        tipo=tipo,
        ip=data.get("ip"),
        balanceador=data.get("balanceador"),
        vlan=data.get("vlan"),
        descripcion=data.get("descripcion"),
        link=data.get("link"),
        servicio_id=servicio_id,
        capa_id=capa_id,
        ambiente_id=ambiente_id,
        dominio_id=dominio_id,
        sistema_operativo_id=sistema_operativo_id,
        estatus_id=estatus_id,
        activo=True,
        fecha_creacion=datetime.utcnow()
    )

    db.session.add(nuevo_servidor)
    db.session.commit()
    return jsonify(nuevo_servidor.serialize()), 201

@api.route('/servidores/<int:servidor_id>', methods=['PUT'])
def update_servidor(servidor_id):
    """ Actualizar un servidor por ID """
    data = request.get_json()
    servidor = Servidor.query.get(servidor_id)

    if not servidor:
        return jsonify({"msg": f"Servidor con ID {servidor_id} no encontrado"}), 404

    # Permitir reactivación si está inactivo
    if not servidor.activo and data.get("activo", False):
        servidor.activo = True

    servidor.nombre = data.get("nombre", servidor.nombre).strip()
    servidor.tipo = data.get("tipo", servidor.tipo).strip()
    servidor.ip = data.get("ip", servidor.ip)
    servidor.balanceador = data.get("balanceador", servidor.balanceador)
    servidor.vlan = data.get("vlan", servidor.vlan)
    servidor.descripcion = data.get("descripcion", servidor.descripcion)
    servidor.link = data.get("link", servidor.link)
    servidor.servicio_id = data.get("servicio_id", servidor.servicio_id)
    servidor.capa_id = data.get("capa_id", servidor.capa_id)
    servidor.ambiente_id = data.get("ambiente_id", servidor.ambiente_id)
    servidor.dominio_id = data.get("dominio_id", servidor.dominio_id)
    servidor.sistema_operativo_id = data.get("sistema_operativo_id", servidor.sistema_operativo_id)
    servidor.estatus_id = data.get("estatus_id", servidor.estatus_id)
    servidor.fecha_modificacion = datetime.utcnow()

    db.session.commit()
    return jsonify(servidor.serialize()), 200

@api.route('/servidores/<int:servidor_id>', methods=['DELETE'])
def delete_servidor(servidor_id):
    """ Borrado lógico de un servidor por ID """
    servidor = Servidor.query.get(servidor_id)

    if not servidor:
        return jsonify({"msg": f"Servidor con ID {servidor_id} no encontrado"}), 404

    if not servidor.activo:
        return jsonify({"msg": f"Servidor con ID {servidor_id} ya está eliminado"}), 400

    servidor.activo = False
    servidor.fecha_modificacion = datetime.utcnow()
    db.session.commit()

    return jsonify({"msg": f"Servidor con ID {servidor_id} eliminado correctamente"}), 200