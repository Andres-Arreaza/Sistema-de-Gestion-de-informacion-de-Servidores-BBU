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
# 🔹 Obtener todos los dominios con solo nombre y descripción
@api.route('/dominios', methods=['GET'])
def get_dominios():
    dominios = Dominio.query.filter_by(activo=True).all()
    return jsonify([{ 
        "id": dominio.id, 
        "nombre": dominio.nombre, 
        "descripcion": dominio.descripcion 
    } for dominio in dominios]), 200

# 🔹 Obtener un dominio por ID
@api.route('/dominios/<int:dominio_id>', methods=['GET'])
def get_dominio(dominio_id):
    return get_generic_by_id(Dominio, dominio_id)

# 🔹 Crear un nuevo dominio
@api.route('/dominios', methods=['POST'])
def create_dominio():
    data = request.get_json()
    nombre_dominio = data.get("nombre")

    # Verificar si el dominio ya existe
    dominio_existente = Dominio.query.filter_by(nombre=nombre_dominio).first()

    if dominio_existente and dominio_existente.activo:
        return jsonify({"error": "El nombre del dominio ya está registrado"}), 400

    # Si el dominio existe pero está eliminado, reactivarlo
    if dominio_existente and not dominio_existente.activo:
        dominio_existente.activo = True
        dominio_existente.descripcion = data.get("descripcion", dominio_existente.descripcion)
        db.session.commit()
        return jsonify({"mensaje": "Dominio reactivado exitosamente", "dominio": dominio_existente.serialize()}), 200

    # Crear un nuevo dominio si no existe
    nuevo_dominio = Dominio(nombre=nombre_dominio, descripcion=data.get("descripcion"), activo=True)
    db.session.add(nuevo_dominio)
    db.session.commit()

    return jsonify({"mensaje": "Dominio creado exitosamente", "dominio": nuevo_dominio.serialize()}), 201

# 🔹 Actualizar un dominio por ID
@api.route('/dominios/<int:dominio_id>', methods=['PUT'])
def update_dominio(dominio_id):
    return update_generic(Dominio, dominio_id)

# 🔹 Eliminar un dominio por ID
@api.route('/dominios/<int:dominio_id>', methods=['DELETE'])
def delete_dominio(dominio_id):
    return delete_generic(Dominio, dominio_id)

### **Rutas para Sistemas Operativos**
# 🔹 Obtener todos los sistemas operativos con nombre, año, versión y descripción
@api.route('/sistemas-operativos', methods=['GET'])
def get_sistemas_operativos():
    sistemas = SistemaOperativo.query.filter_by(activo=True).all()
    return jsonify([{ 
        "id": sistema.id, 
        "nombre": sistema.nombre, 
        "año": sistema.año,
        "version": sistema.version,
        "descripcion": sistema.descripcion 
    } for sistema in sistemas]), 200

# 🔹 Obtener un sistema operativo por ID
@api.route('/sistemas-operativos/<int:sistema_id>', methods=['GET'])
def get_sistema_operativo(sistema_id):
    return get_generic_by_id(SistemaOperativo, sistema_id)

# 🔹 Crear un nuevo sistema operativo
@api.route('/sistemas-operativos', methods=['POST'])
def create_sistema_operativo():
    data = request.get_json()
    nombre_sistema = data.get("nombre")
    año_sistema = data.get("año")
    version_sistema = data.get("version")

    # Verificar si el sistema operativo ya existe
    sistema_existente = SistemaOperativo.query.filter_by(nombre=nombre_sistema, año=año_sistema, version=version_sistema).first()

    if sistema_existente and sistema_existente.activo:
        return jsonify({"error": "El sistema operativo ya está registrado"}), 400

    # Si el sistema operativo existe pero está eliminado, reactivarlo
    if sistema_existente and not sistema_existente.activo:
        sistema_existente.activo = True
        sistema_existente.descripcion = data.get("descripcion", sistema_existente.descripcion)
        db.session.commit()
        return jsonify({"mensaje": "Sistema operativo reactivado exitosamente", "sistema_operativo": sistema_existente.serialize()}), 200

    # Crear un nuevo sistema operativo si no existe
    nuevo_sistema = SistemaOperativo(nombre=nombre_sistema, año=año_sistema, version=version_sistema, descripcion=data.get("descripcion"), activo=True)
    db.session.add(nuevo_sistema)
    db.session.commit()

    return jsonify({"mensaje": "Sistema operativo creado exitosamente", "sistema_operativo": nuevo_sistema.serialize()}), 201

# 🔹 Actualizar un sistema operativo por ID
@api.route('/sistemas-operativos/<int:sistema_id>', methods=['PUT'])
def update_sistema_operativo(sistema_id):
    return update_generic(SistemaOperativo, sistema_id)

# 🔹 Eliminar un sistema operativo por ID
@api.route('/sistemas-operativos/<int:sistema_id>', methods=['DELETE'])
def delete_sistema_operativo(sistema_id):
    return delete_generic(SistemaOperativo, sistema_id)

### **Rutas para Estatus**
# 🔹 Obtener todos los estatus con nombre y descripción
@api.route('/estatus', methods=['GET'])
def get_estatus():
    estatus_list = Estatus.query.filter_by(activo=True).all()
    return jsonify([{ 
        "id": estatus.id, 
        "nombre": estatus.nombre, 
        "descripcion": estatus.descripcion 
    } for estatus in estatus_list]), 200

# 🔹 Obtener un estatus por ID
@api.route('/estatus/<int:estatus_id>', methods=['GET'])
def get_estatus_by_id(estatus_id):
    return get_generic_by_id(Estatus, estatus_id)

# 🔹 Crear un nuevo estatus
@api.route('/estatus', methods=['POST'])
def create_estatus():
    data = request.get_json()
    nombre_estatus = data.get("nombre")

    # Verificar si el estatus ya existe
    estatus_existente = Estatus.query.filter_by(nombre=nombre_estatus).first()

    if estatus_existente and estatus_existente.activo:
        return jsonify({"error": "El estatus ya está registrado"}), 400

    # Si el estatus existe pero está eliminado, reactivarlo
    if estatus_existente and not estatus_existente.activo:
        estatus_existente.activo = True
        estatus_existente.descripcion = data.get("descripcion", estatus_existente.descripcion)
        db.session.commit()
        return jsonify({"mensaje": "Estatus reactivado exitosamente", "estatus": estatus_existente.serialize()}), 200

    # Crear un nuevo estatus si no existe
    nuevo_estatus = Estatus(nombre=nombre_estatus, descripcion=data.get("descripcion"), activo=True)
    db.session.add(nuevo_estatus)
    db.session.commit()

    return jsonify({"mensaje": "Estatus creado exitosamente", "estatus": nuevo_estatus.serialize()}), 201

# 🔹 Actualizar un estatus por ID
@api.route('/estatus/<int:estatus_id>', methods=['PUT'])
def update_estatus(estatus_id):
    return update_generic(Estatus, estatus_id)

# 🔹 Eliminar un estatus por ID
@api.route('/estatus/<int:estatus_id>', methods=['DELETE'])
def delete_estatus(estatus_id):
    return delete_generic(Estatus, estatus_id)

### **Rutas para Servidor**
# 🔹 Obtener todos los servidores activos
@api.route("/servidores", methods=["GET"])
def get_servidores():
    servidores = Servidor.query.filter_by(activo=True).all()
    return jsonify([servidor.serialize() for servidor in servidores]), 200

# 🔹 Obtener un servidor por ID
@api.route("/servidores/<int:servidor_id>", methods=["GET"])
def get_servidor(servidor_id):
    servidor = Servidor.query.get(servidor_id)
    if not servidor:
        return jsonify({"error": "Servidor no encontrado"}), 404
    return jsonify(servidor.serialize()), 200

# 🔹 Crear un nuevo servidor
@api.route("/servidores", methods=["POST"])
def create_servidor():
    try:
        data = request.get_json()

        # 🔹 Validar que todos los campos requeridos están presentes
        required_fields = ["nombre", "tipo", "ip", "servicio_id", "capa_id", "ambiente_id", "dominio_id", "sistema_operativo_id", "estatus_id"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Falta el campo {field}"}), 400

        nuevo_servidor = Servidor(**data)
        db.session.add(nuevo_servidor)
        db.session.commit()
        return jsonify({"mensaje": "Servidor creado exitosamente", "servidor": nuevo_servidor.serialize()}), 201

    except Exception as e:
        print(f"Error en create_servidor: {str(e)}")  # 🔹 Muestra el error en la consola
        return jsonify({"error": "Error interno en el servidor"}), 500  

# 🔹 Actualizar un servidor existente
@api.route("/servidores/<int:servidor_id>", methods=["PUT"])
def update_servidor(servidor_id):
    servidor = Servidor.query.get(servidor_id)
    if not servidor:
        return jsonify({"error": "Servidor no encontrado"}), 404

    data = request.get_json()

    # 🔹 Validar que los atributos existen en el modelo antes de actualizarlos
    for key, value in data.items():
        if hasattr(servidor, key):  # Verifica que el atributo esté definido en `Servidor`
            setattr(servidor, key, value)

    db.session.commit()

    response = jsonify({"mensaje": "Servidor actualizado correctamente", "servidor": servidor.serialize()})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 200

# 🔹 Eliminar un servidor (borrado lógico)
@api.route("/servidores/<int:servidor_id>", methods=["DELETE"])
def delete_servidor(servidor_id):
    servidor = Servidor.query.get(servidor_id)
    if not servidor:
        return jsonify({"error": "Servidor no encontrado"}), 404

    servidor.activo = False
    db.session.commit()
    return jsonify({"mensaje": "Servidor eliminado correctamente"}), 200