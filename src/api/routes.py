from flask import Flask, request, jsonify, Blueprint
from api.models import db, Servicio, Capa, Ambiente, Dominio, SistemaOperativo, Estatus, Servidor, Ecosistema, TipoServidorEnum, Aplicacion
from flask_cors import CORS, cross_origin
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
    registro_existente = model.query.filter_by(nombre=data['nombre']).first()
    if registro_existente and not registro_existente.activo:
        registro_existente.activo = True
        registro_existente.descripcion = data.get('descripcion', registro_existente.descripcion)
        registro_existente.fecha_modificacion = datetime.utcnow()
        db.session.commit()
        return jsonify(registro_existente.serialize()), 200
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

# --- Rutas CRUD genéricas para cada modelo ---
@api.route("/servicios", methods=["GET"])
def get_servicios():
    return get_generic(Servicio)

@api.route("/servicios/<int:record_id>", methods=["GET"])
def get_servicio_by_id(record_id):
    return get_generic_by_id(Servicio, record_id)

@api.route("/servicios", methods=["POST"])
def create_servicio():
    return create_generic(Servicio)

@api.route("/servicios/<int:record_id>", methods=["PUT"])
def update_servicio(record_id):
    return update_generic(Servicio, record_id)

@api.route("/servicios/<int:record_id>", methods=["DELETE"])
def delete_servicio(record_id):
    return delete_generic(Servicio, record_id)

# Repite lo mismo para Capa, Ambiente, Dominio, SistemaOperativo, Estatus, Servidor...
# Ejemplo para Capa:
@api.route("/capas", methods=["GET"])
def get_capas():
    return get_generic(Capa)

@api.route("/capas/<int:record_id>", methods=["GET"])
def get_capa_by_id(record_id):
    return get_generic_by_id(Capa, record_id)

@api.route("/capas", methods=["POST"])
def create_capa():
    return create_generic(Capa)

@api.route("/capas/<int:record_id>", methods=["PUT"])
def update_capa(record_id):
    return update_generic(Capa, record_id)

@api.route("/capas/<int:record_id>", methods=["DELETE"])
def delete_capa(record_id):
    return delete_generic(Capa, record_id)

# ...continúa igual para Ambiente, Dominio, SistemaOperativo, Estatus, Servidor

# Ejemplo para Ambiente:
@api.route("/ambientes", methods=["GET"])
def get_ambientes():
    return get_generic(Ambiente)

@api.route("/ambientes/<int:record_id>", methods=["GET"])
def get_ambiente_by_id(record_id):
    return get_generic_by_id(Ambiente, record_id)

@api.route("/ambientes", methods=["POST"])
def create_ambiente():
    return create_generic(Ambiente)

@api.route("/ambientes/<int:record_id>", methods=["PUT"])
def update_ambiente(record_id):
    return update_generic(Ambiente, record_id)

@api.route("/ambientes/<int:record_id>", methods=["DELETE"])
def delete_ambiente(record_id):
    return delete_generic(Ambiente, record_id)

# Ejemplo para Dominio:
@api.route("/dominios", methods=["GET"])
def get_dominios():
    return get_generic(Dominio)

@api.route("/dominios/<int:record_id>", methods=["GET"])
def get_dominio_by_id(record_id):
    return get_generic_by_id(Dominio, record_id)

@api.route("/dominios", methods=["POST"])
def create_dominio():
    return create_generic(Dominio)

@api.route("/dominios/<int:record_id>", methods=["PUT"])
def update_dominio(record_id):
    return update_generic(Dominio, record_id)

@api.route("/dominios/<int:record_id>", methods=["DELETE"])
def delete_dominio(record_id):
    return delete_generic(Dominio, record_id)

# Ejemplo para SistemaOperativo:
@api.route("/sistemas_operativos", methods=["GET"])
def get_sistemas_operativos():
    return get_generic(SistemaOperativo)

@api.route("/sistemas_operativos/<int:record_id>", methods=["GET"])
def get_sistema_operativo_by_id(record_id):
    return get_generic_by_id(SistemaOperativo, record_id)

@api.route("/sistemas_operativos", methods=["POST"])
def create_sistema_operativo():
    data = request.get_json()

    if not data or "nombre" not in data or "version" not in data:
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    nuevo_sistema = SistemaOperativo(
        nombre=data["nombre"],
        version=data["version"].strip(),
        descripcion=data.get("descripcion", "")
    )

    db.session.add(nuevo_sistema)
    db.session.commit()

    return jsonify(nuevo_sistema.serialize()), 201

@api.route("/sistemas_operativos/<int:record_id>", methods=["PUT"])
def update_sistema_operativo(record_id):
    return update_generic(SistemaOperativo, record_id)

@api.route("/sistemas_operativos/<int:record_id>", methods=["DELETE"])
def delete_sistema_operativo(record_id):
    return delete_generic(SistemaOperativo, record_id)

# Endpoints CRUD para Aplicacion (debajo de sistemas_operativos)
@api.route("/aplicaciones", methods=["GET"])
def get_aplicaciones():
    return get_generic(Aplicacion)

@api.route("/aplicaciones/<int:record_id>", methods=["GET"])
def get_aplicacion_by_id(record_id):
    return get_generic_by_id(Aplicacion, record_id)

@api.route("/aplicaciones", methods=["POST"])
def create_aplicacion():
    data = request.get_json()
    if not data or "nombre" not in data or "version" not in data:
        return jsonify({"error": "Faltan datos obligatorios"}), 400
    nueva_aplicacion = Aplicacion(
        nombre=data["nombre"],
        version=data["version"].strip(),
        descripcion=data.get("descripcion", "")
    )
    db.session.add(nueva_aplicacion)
    db.session.commit()
    return jsonify(nueva_aplicacion.serialize()), 201

@api.route("/aplicaciones/<int:record_id>", methods=["PUT"])
def update_aplicacion(record_id):
    return update_generic(Aplicacion, record_id)

@api.route("/aplicaciones/<int:record_id>", methods=["DELETE"])
def delete_aplicacion(record_id):
    return delete_generic(Aplicacion, record_id)


# <<< CORRECCIÓN: Se reestructura toda la sección de Estatus para eliminar la indentación incorrecta
# Ejemplo para Estatus:
@api.route("/estatus", methods=["GET"])
def get_estatus():
    return get_generic(Estatus)

@api.route("/estatus/<int:record_id>", methods=["GET"])
def get_estatus_by_id(record_id):
    return get_generic_by_id(Estatus, record_id)

@api.route("/estatus", methods=["POST"])
def create_estatus():
    return create_generic(Estatus)

@api.route("/estatus/<int:record_id>", methods=["PUT"])
def update_estatus(record_id):
    return update_generic(Estatus, record_id)

@api.route("/estatus/<int:record_id>", methods=["DELETE"])
def delete_estatus(record_id):
    return delete_generic(Estatus, record_id)

# Ejemplo para Servidor:
@api.route("/servidores", methods=["GET"])
def get_servidores():
    try:
        query = Servidor.query.filter_by(activo=True)
        servidores = query.all()
        return jsonify([servidor.serialize() for servidor in servidores]), 200
    except Exception as e:
        print("ERROR EN GET SERVIDORES:", e)
        return jsonify({"error": str(e)}), 500

@api.route("/servidores/<int:record_id>", methods=["GET"])
def get_servidor_by_id(record_id):
    return get_generic_by_id(Servidor, record_id)

@api.route("/servidores", methods=["POST"])
def create_servidor():
    data = request.get_json()
    required_fields = ["nombre", "tipo", "servicio_id", "capa_id", "ambiente_id", "dominio_id", "sistema_operativo_id", "aplicacion_id"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"El campo '{field}' es obligatorio"}), 400

    # Validar que al menos una IP esté presente
    if not any(data.get(ip_field) for ip_field in ["ip_mgmt", "ip_real", "ip_mask25"]):
        return jsonify({"error": "Debe proporcionar al menos una dirección IP (ip_mgmt, ip_real, o ip_mask25)"}), 400

    nuevo_servidor = Servidor(
        nombre=data["nombre"],
        tipo=data["tipo"],
        servicio_id=data["servicio_id"],
        capa_id=data["capa_id"],
        ambiente_id=data["ambiente_id"],
        dominio_id=data["dominio_id"],
        sistema_operativo_id=data["sistema_operativo_id"],
        aplicacion_id=data["aplicacion_id"],
        ecosistema_id=data.get("ecosistema_id"),
        estatus_id=data.get("estatus_id"),
        ip_mgmt=data.get("ip_mgmt"),
        ip_real=data.get("ip_real"),
        ip_mask25=data.get("ip_mask25"),
        balanceador=data.get("balanceador"),
        vlan=data.get("vlan"),
        descripcion=data.get("descripcion"),
        link=data.get("link"),
        activo=True,
        fecha_creacion=datetime.utcnow()
    )

    db.session.add(nuevo_servidor)
    db.session.commit()
    return jsonify(nuevo_servidor.serialize()), 201

@api.route("/servidores/<int:record_id>", methods=["PUT"])
@cross_origin()
def update_servidor(record_id):
    try:
        servidor = Servidor.query.get(record_id)
        if not servidor:
            return jsonify({"error": "Servidor no encontrado"}), 404

        data = request.get_json()

        # Actualizar campos simples
        for field in ["nombre", "tipo", "ip_mgmt", "ip_real", "ip_mask25", "balanceador", "vlan", "descripcion", "link", "servicio_id", "capa_id", "ambiente_id", "dominio_id", "sistema_operativo_id", "aplicacion_id", "estatus_id", "ecosistema_id"]:
            if field in data:
                setattr(servidor, field, data[field])

        servidor.fecha_modificacion = datetime.utcnow()
        db.session.commit()
        return jsonify(servidor.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route("/servidores/<int:record_id>", methods=["DELETE"])
@cross_origin()
def delete_servidor(record_id):
    return delete_generic(Servidor, record_id)


@api.route("/servidores/busqueda", methods=["GET"])
def buscar_servidores():
    try:
        query = Servidor.query.filter_by(activo=True)
        busqueda_exacta = request.args.get("busquedaExacta", "false").lower() == "true"

        # Buscar por las tres IPs
        ip_fields = ["ip_mgmt", "ip_real", "ip_mask25"]
        for ip_field in ip_fields:
            ip_val = request.args.get(ip_field)
            if ip_val:
                if busqueda_exacta:
                    query = query.filter(getattr(Servidor, ip_field) == ip_val)
                else:
                    query = query.filter(getattr(Servidor, ip_field).ilike(f"%{ip_val}%"))

        # Si el checkbox está activado, buscar solo coincidencias exactas
        if busqueda_exacta:
            if request.args.get("nombre"): query = query.filter(Servidor.nombre == request.args["nombre"])
            if request.args.get("balanceador"): query = query.filter(Servidor.balanceador == request.args["balanceador"])
            if request.args.get("vlan"): query = query.filter(Servidor.vlan == request.args["vlan"])
            if request.args.get("link"): query = query.filter(Servidor.link == request.args["link"])
            if request.args.get("descripcion"): query = query.filter(Servidor.descripcion == request.args["descripcion"])
        else:
            if request.args.get("nombre"): query = query.filter(Servidor.nombre.ilike(f"%{request.args['nombre']}%"))
            if request.args.get("balanceador"): query = query.filter(Servidor.balanceador.ilike(f"%{request.args['balanceador']}%"))
            if request.args.get("vlan"): query = query.filter(Servidor.vlan.ilike(f"%{request.args['vlan']}%"))
            if request.args.get("link"): query = query.filter(Servidor.link.ilike(f"%{request.args['link']}%"))
            if request.args.get("descripcion"): query = query.filter(Servidor.descripcion.ilike(f"%{request.args['descripcion']}%"))

        if request.args.get("tipo"):
            try:
                tipo_val = TipoServidorEnum[request.args["tipo"].upper()]
                query = query.filter(Servidor.tipo == tipo_val)
            except KeyError:
                pass

        if request.args.getlist("servicios"): query = query.filter(Servidor.servicio_id.in_(request.args.getlist("servicios")))
        if request.args.getlist("capas"): query = query.filter(Servidor.capa_id.in_(request.args.getlist("capas")))
        if request.args.getlist("ambientes"): query = query.filter(Servidor.ambiente_id.in_(request.args.getlist("ambientes")))
        if request.args.getlist("dominios"): query = query.filter(Servidor.dominio_id.in_(request.args.getlist("dominios")))
        # CORRECCIÓN: Filtrar por la relación 'aplicaciones'
        if request.args.getlist("sistemas_operativos"): query = query.filter(Servidor.sistema_operativo_id.in_(request.args.getlist("sistemas_operativos")))
        if request.args.getlist("aplicacion_ids"):
            query = query.join(Servidor.aplicaciones).filter(Aplicacion.id.in_(request.args.getlist("aplicacion_ids")))
        if request.args.getlist("estatus"): query = query.filter(Servidor.estatus_id.in_(request.args.getlist("estatus")))

        servidores = query.all()
        return jsonify([servidor.serialize() for servidor in servidores]), 200
    except Exception as e:
        print("ERROR EN BUSQUEDA:", e)
        return jsonify({"error": str(e)}), 500

# --- RUTA DE VALIDACIÓN CORREGIDA ---
@api.route("/servidores/validar-actualizaciones", methods=["POST"])
def validar_actualizaciones():
    data = request.get_json()
    if not data or "validaciones" not in data:
        return jsonify({"error": "Petición inválida"}), 400

    validaciones = data["validaciones"]
    errores_detalle = []
    ip_fields = ["ip_mgmt", "ip_real", "ip_mask25"]

    for v in validaciones:
        servidor_id = v.get("id")
        
        # Validar Nombre si se está cambiando
        if v.get("nombre"):
            conflicto_nombre = Servidor.query.filter(
                Servidor.nombre == v["nombre"],
                Servidor.id != servidor_id,
                Servidor.activo == True
            ).first()
            if conflicto_nombre:
                errores_detalle.append(f"El nombre '{v['nombre']}' ya está en uso por otro servidor.")

        # Validar cada campo de IP si se está cambiando
        for ip_field in ip_fields:
            ip_value = v.get(ip_field)
            if ip_value: # Solo validar si hay un valor
                # Verificar si esta IP ya existe en cualquiera de los 3 campos de IP de otro servidor
                conflicto_ip = db.session.query(Servidor).filter(
                    Servidor.id != servidor_id,
                    Servidor.activo == True,
                    db.or_(
                        Servidor.ip_mgmt == ip_value,
                        Servidor.ip_real == ip_value,
                        Servidor.ip_mask25 == ip_value
                    )
                ).first()
                if conflicto_ip:
                    errores_detalle.append(f"La IP '{ip_value}' ya está asignada a otro servidor.")

        # Validar Link si se está cambiando
        if v.get("link"):
            conflicto_link = Servidor.query.filter(
                Servidor.link == v["link"],
                Servidor.id != servidor_id,
                Servidor.activo == True
            ).first()
            if conflicto_link:
                errores_detalle.append(f"El Link '{v['link']}' ya está en uso por otro servidor.")

    if errores_detalle:
        # Eliminar duplicados
        return jsonify({"detalles": list(set(errores_detalle))}), 400

    return jsonify({"msg": "Validación exitosa"}), 200

# Endpoints CRUD para Ecosistema
@api.route("/ecosistemas", methods=["GET"])
def get_ecosistemas():
    ecosistemas = Ecosistema.query.filter_by(activo=True).all()
    return jsonify([e.serialize() for e in ecosistemas]), 200

@api.route("/ecosistemas/<int:record_id>", methods=["GET"])
def get_ecosistema(record_id):
    ecosistema = Ecosistema.query.get(record_id)
    if not ecosistema or not ecosistema.activo:
        return jsonify({"error": "Ecosistema no encontrado"}), 404
    return jsonify(ecosistema.serialize()), 200

@api.route("/ecosistemas", methods=["POST"])
def create_ecosistema():
    data = request.get_json()
    nombre = data.get("nombre")
    descripcion = data.get("descripcion")
    if not nombre:
        return jsonify({"error": "El nombre es obligatorio"}), 400
    ecosistema = Ecosistema(nombre=nombre, descripcion=descripcion)
    db.session.add(ecosistema)
    db.session.commit()
    return jsonify(ecosistema.serialize()), 201

@api.route("/ecosistemas/<int:record_id>", methods=["PUT"])
@cross_origin()
def update_ecosistema(record_id):
    ecosistema = Ecosistema.query.get(record_id)
    if not ecosistema:
        return jsonify({"error": "Ecosistema no encontrado"}), 404
    data = request.get_json()
    ecosistema.nombre = data.get("nombre", ecosistema.nombre)
    ecosistema.descripcion = data.get("descripcion", ecosistema.descripcion)
    ecosistema.fecha_modificacion = datetime.utcnow()
    db.session.commit()
    return jsonify(ecosistema.serialize()), 200

@api.route("/ecosistemas/<int:record_id>", methods=["DELETE"])
def delete_ecosistema(record_id):
    return delete_generic(Ecosistema, record_id)
