import click
from api.models import db, Servicio, Capa, Ambiente, Dominio, SistemaOperativo, Estatus, Servidor
from datetime import datetime

"""
Este archivo define comandos CLI en Flask para la gestión de servidores.
Permite insertar datos de prueba, listar registros y realizar borrado lógico.
"""

def setup_commands(app):

    # Comando para insertar servicios de prueba
    @app.cli.command("insert-test-services")
    @click.argument("count")
    def insert_test_services(count):
        print("Creando servicios de prueba...")
        for x in range(1, int(count) + 1):
            servicio = Servicio(
                nombre=f"Servicio Test {x}",
                descripcion=f"Descripción del servicio {x}",
                activo=True,
                fecha_creacion=datetime.utcnow()
            )
            db.session.add(servicio)
            db.session.commit()
            print(f"Servicio creado: {servicio.nombre} - Fecha de creación: {servicio.fecha_creacion}")
        print("Todos los servicios de prueba fueron creados.")

    # Comando para listar todos los servicios
    @app.cli.command("list-services")
    def list_services():
        servicios = Servicio.query.all()
        if not servicios:
            print("No hay servicios registrados.")
            return
        for servicio in servicios:
            print(servicio.serialize())

    # Comando para eliminar (borrado lógico) un servicio
    @app.cli.command("delete-service")
    @click.argument("servicio_id")
    def delete_service(servicio_id):
        servicio = Servicio.query.get(servicio_id)

        if not servicio:
            print(f"Servicio con ID {servicio_id} no encontrado.")
            return

        if not servicio.activo:
            print(f"Servicio con ID {servicio_id} ya está eliminado.")
            return

        servicio.activo = False  # 🔹 Borrado lógico
        servicio.fecha_modificacion = datetime.utcnow()  # 🔹 Se actualiza la fecha de modificación
        db.session.commit()
        print(f"Servicio con ID {servicio_id} eliminado correctamente.")

    # Comando para actualizar un servicio
    @app.cli.command("update-service")
    @click.argument("servicio_id")
    @click.argument("nuevo_nombre")
    @click.argument("nueva_descripcion")
    def update_service(servicio_id, nuevo_nombre, nueva_descripcion):
        servicio = Servicio.query.get(servicio_id)

        if not servicio:
            print(f"Servicio con ID {servicio_id} no encontrado.")
            return

        if not servicio.activo:
            print(f"Servicio con ID {servicio_id} está inactivo y no puede ser actualizado.")
            return

        servicio.nombre = nuevo_nombre
        servicio.descripcion = nueva_descripcion
        servicio.fecha_modificacion = datetime.utcnow()  # 🔹 Se actualiza la fecha de modificación
        db.session.commit()
        print(f"Servicio actualizado: {servicio.nombre} - Fecha de modificación: {servicio.fecha_modificacion}")

    # Comandos para insertar datos de prueba en las demás entidades
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

    # Comando para listar registros de cualquier tabla
    def list_generic(model):
        records = model.query.all()
        if not records:
            print(f"No hay registros en {model.__tablename__}.")
            return
        for record in records:
            print(record.serialize())

    @app.cli.command("list-capas")
    def list_capas():
        list_generic(Capa)

    @app.cli.command("list-ambientes")
    def list_ambientes():
        list_generic(Ambiente)

    @app.cli.command("list-dominios")
    def list_dominios():
        list_generic(Dominio)

    @app.cli.command("list-sistemas-operativos")
    def list_sistemas_operativos():
        list_generic(SistemaOperativo)

    @app.cli.command("list-estatus")
    def list_estatus():
        list_generic(Estatus)

    # Comando para eliminar (borrado lógico) registros de cualquier tabla
    def delete_generic(model, record_id):
        record = model.query.get(record_id)

        if not record:
            print(f"{model.__name__} con ID {record_id} no encontrado.")
            return

        if not record.activo:
            print(f"{model.__name__} con ID {record_id} ya está eliminado.")
            return

        record.activo = False
        record.fecha_modificacion = datetime.utcnow()
        db.session.commit()
        print(f"{model.__name__} con ID {record_id} eliminado correctamente.")

    @app.cli.command("delete-capa")
    @click.argument("capa_id")
    def delete_capa(capa_id):
        delete_generic(Capa, capa_id)

    @app.cli.command("delete-ambiente")
    @click.argument("ambiente_id")
    def delete_ambiente(ambiente_id):
        delete_generic(Ambiente, ambiente_id)

    @app.cli.command("delete-dominio")
    @click.argument("dominio_id")
    def delete_dominio(dominio_id):
        delete_generic(Dominio, dominio_id)

    @app.cli.command("delete-sistema-operativo")
    @click.argument("so_id")
    def delete_sistema_operativo(so_id):
        delete_generic(SistemaOperativo, so_id)

    @app.cli.command("delete-estatus")
    @click.argument("estatus_id")
    def delete_estatus(estatus_id):
        delete_generic(Estatus, estatus_id)