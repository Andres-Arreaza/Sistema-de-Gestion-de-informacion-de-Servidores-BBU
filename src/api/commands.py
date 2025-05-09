import click
from api.models import db, Servicio, Capa, Ambiente, Dominio, SistemaOperativo, Estatus, Servidor
from datetime import datetime

"""
Este archivo define comandos CLI en Flask para la gestión de modelos.
Permite insertar datos de prueba, listar registros y realizar borrado lógico.
"""

def setup_commands(app):

    # Comando para insertar servidores de prueba
    @app.cli.command("insert-test-servidores")
    @click.argument("count")
    def insert_test_servidores(count):
        """ Insertar servidores de prueba con gestión por ID """
        print("Creando servidores de prueba...")
        for x in range(1, int(count) + 1):
            servidor_existente = Servidor.query.filter_by(nombre=f"Servidor Test {x}", activo=False).first()

            if servidor_existente:
                # Reactivar servidor eliminado
                servidor_existente.activo = True
                servidor_existente.fecha_modificacion = datetime.utcnow()
                db.session.commit()
                print(f"Servidor reactivado: {servidor_existente.nombre} - Fecha de modificación: {servidor_existente.fecha_modificacion}")
            else:
                # Crear nuevo servidor
                servidor = Servidor(
                    nombre=f"Servidor Test {x}",
                    tipo="VIRTUAL",
                    ip=f"192.168.1.{x}",
                    balanceador=f"LoadBalancer-{x}",
                    vlan=f"VLAN-{x}",
                    descripcion=f"Servidor de prueba {x}",
                    link=f"http://servidor{x}.com",
                    servicio_id=1,
                    capa_id=1,
                    ambiente_id=1,
                    dominio_id=1,
                    sistema_operativo_id=1,
                    estatus_id=1,
                    activo=True,
                    fecha_creacion=datetime.utcnow()
                )
                db.session.add(servidor)
                db.session.commit()
                print(f"Servidor creado: {servidor.nombre} - Fecha de creación: {servidor.fecha_creacion}")
        print("Todos los servidores de prueba fueron creados o reactivados.")

    # Comando para listar todos los servidores
    @app.cli.command("list-servidores")
    def list_servidores():
        """ Listar todos los servidores, incluyendo los inactivos """
        servidores = Servidor.query.all()
        if not servidores:
            print("No hay servidores registrados.")
            return
        for servidor in servidores:
            print(servidor.serialize())

    # Comando para eliminar (borrado lógico) un servidor por ID
    @app.cli.command("delete-servidor")
    @click.argument("servidor_id")
    def delete_servidor(servidor_id):
        """ Borrado lógico de un servidor por ID """
        servidor = Servidor.query.get(servidor_id)

        if not servidor:
            print(f"Servidor con ID {servidor_id} no encontrado.")
            return

        if not servidor.activo:
            print(f"Servidor con ID {servidor_id} ya está eliminado.")
            return

        servidor.activo = False
        servidor.fecha_modificacion = datetime.utcnow()
        db.session.commit()
        print(f"Servidor con ID {servidor_id} eliminado correctamente.")

    # Comando para actualizar un servidor por ID
    @app.cli.command("update-servidor")
    @click.argument("servidor_id")
    @click.argument("nuevo_nombre")
    @click.argument("nuevo_tipo")
    @click.argument("nueva_ip")
    @click.argument("nuevo_balanceador")
    @click.argument("nueva_vlan")
    @click.argument("nueva_descripcion")
    @click.argument("nuevo_link")
    @click.argument("nuevo_servicio_id")
    @click.argument("nuevo_capa_id")
    @click.argument("nuevo_ambiente_id")
    @click.argument("nuevo_dominio_id")
    @click.argument("nuevo_sistema_operativo_id")
    @click.argument("nuevo_estatus_id")
    def update_servidor(servidor_id, nuevo_nombre, nuevo_tipo, nueva_ip, nuevo_balanceador, nueva_vlan, nueva_descripcion, nuevo_link, nuevo_servicio_id, nuevo_capa_id, nuevo_ambiente_id, nuevo_dominio_id, nuevo_sistema_operativo_id, nuevo_estatus_id):
        """ Actualizar un servidor existente por ID """
        servidor = Servidor.query.get(servidor_id)

        if not servidor:
            print(f"Servidor con ID {servidor_id} no encontrado.")
            return

        # Permitir reactivación si está inactivo
        if not servidor.activo:
            servidor.activo = True

        servidor.nombre = nuevo_nombre
        servidor.tipo = nuevo_tipo
        servidor.ip = nueva_ip
        servidor.balanceador = nuevo_balanceador
        servidor.vlan = nueva_vlan
        servidor.descripcion = nueva_descripcion
        servidor.link = nuevo_link
        servidor.servicio_id = nuevo_servicio_id
        servidor.capa_id = nuevo_capa_id
        servidor.ambiente_id = nuevo_ambiente_id
        servidor.dominio_id = nuevo_dominio_id
        servidor.sistema_operativo_id = nuevo_sistema_operativo_id
        servidor.estatus_id = nuevo_estatus_id
        servidor.fecha_modificacion = datetime.utcnow()

        db.session.commit()
        print(f"Servidor actualizado: {servidor.nombre} - Fecha de modificación: {servidor.fecha_modificacion}")

    # Comandos para gestionar otros modelos
    def insert_test_generic(model, count, name_prefix):
        """ Función genérica para insertar datos de prueba en cualquier tabla """
        print(f"Creando registros de prueba para {model.__tablename__}...")
        for x in range(1, int(count) + 1):
            record = model(
                nombre=f"{name_prefix} Test {x}",
                descripcion=f"Descripción de {name_prefix.lower()} {x}",
                activo=True,
                fecha_creacion=datetime.utcnow()
            )
            db.session.add(record)
            db.session.commit()
            print(f"{name_prefix} creado: {record.nombre} - Fecha de creación: {record.fecha_creacion}")
        print(f"Todos los registros de prueba para {model.__tablename__} fueron creados.")

    @app.cli.command("insert-test-servicios")
    @click.argument("count")
    def insert_test_servicios(count):
        insert_test_generic(Servicio, count, "Servicio")

    @app.cli.command("insert-test-capas")
    @click.argument("count")
    def insert_test_capas(count):
        insert_test_generic(Capa, count, "Capa")

    @app.cli.command("insert-test-ambientes")
    @click.argument("count")
    def insert_test_ambientes(count):
        insert_test_generic(Ambiente, count, "Ambiente")

    @app.cli.command("insert-test-dominios")
    @click.argument("count")
    def insert_test_dominios(count):
        insert_test_generic(Dominio, count, "Dominio")

    @app.cli.command("insert-test-sistemas-operativos")
    @click.argument("count")
    def insert_test_sistemas_operativos(count):
        insert_test_generic(SistemaOperativo, count, "Sistema Operativo")

    @app.cli.command("insert-test-estatus")
    @click.argument("count")
    def insert_test_estatus(count):
        insert_test_generic(Estatus, count, "Estatus")