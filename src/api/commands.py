import click
from api.models import db, Servicio, Capa, Ambiente, Dominio, SistemaOperativo, Estatus, Servidor

"""
Este archivo define comandos CLI en Flask para la gestión de servidores.
Permite insertar datos de prueba, listar registros y ejecutar tareas administrativas.
"""

def setup_commands(app):

    # Comando para insertar servicios de prueba
    @app.cli.command("insert-test-services")
    @click.argument("count")
    def insert_test_services(count):
        print("Creando servicios de prueba...")
        for x in range(1, int(count) + 1):
            servicio = Servicio(nombre=f"Servicio Test {x}", descripcion=f"Descripción del servicio {x}")
            db.session.add(servicio)
            db.session.commit()
            print(f"Servicio creado: {servicio.nombre}")
        print("Todos los servicios de prueba fueron creados.")

    # Comando para insertar capas de prueba
    @app.cli.command("insert-test-capas")
    @click.argument("count")
    def insert_test_capas(count):
        print("Creando capas de prueba...")
        for x in range(1, int(count) + 1):
            capa = Capa(nombre=f"Capa Test {x}", descripcion=f"Descripción de la capa {x}")
            db.session.add(capa)
            db.session.commit()
            print(f"Capa creada: {capa.nombre}")
        print("Todas las capas de prueba fueron creadas.")

    # Comando para insertar ambientes de prueba
    @app.cli.command("insert-test-ambientes")
    @click.argument("count")
    def insert_test_ambientes(count):
        print("Creando ambientes de prueba...")
        for x in range(1, int(count) + 1):
            ambiente = Ambiente(nombre=f"Ambiente Test {x}", descripcion=f"Descripción del ambiente {x}")
            db.session.add(ambiente)
            db.session.commit()
            print(f"Ambiente creado: {ambiente.nombre}")
        print("Todos los ambientes de prueba fueron creados.")

    # Comando para insertar dominios de prueba
    @app.cli.command("insert-test-dominios")
    @click.argument("count")
    def insert_test_dominios(count):
        print("Creando dominios de prueba...")
        for x in range(1, int(count) + 1):
            dominio = Dominio(nombre=f"Dominio Test {x}", descripcion=f"Descripción del dominio {x}")
            db.session.add(dominio)
            db.session.commit()
            print(f"Dominio creado: {dominio.nombre}")
        print("Todos los dominios de prueba fueron creados.")

    # Comando para insertar sistemas operativos de prueba
    @app.cli.command("insert-test-sistemas-operativos")
    @click.argument("count")
    def insert_test_sistemas_operativos(count):
        print("Creando sistemas operativos de prueba...")
        for x in range(1, int(count) + 1):
            sistema_operativo = SistemaOperativo(nombre=f"SO Test {x}", version=f"{x}.0", descripcion=f"Detalles adicionales {x}")
            db.session.add(sistema_operativo)
            db.session.commit()
            print(f"Sistema Operativo creado: {sistema_operativo.nombre}")
        print("Todos los sistemas operativos de prueba fueron creados.")

    # Comando para insertar estatus de prueba
    @app.cli.command("insert-test-estatus")
    @click.argument("count")
    def insert_test_estatus(count):
        print("Creando estatus de prueba...")
        for x in range(1, int(count) + 1):
            estatus = Estatus(nombre=f"Estatus Test {x}", descripcion=f"Descripción del estatus {x}")
            db.session.add(estatus)
            db.session.commit()
            print(f"Estatus creado: {estatus.nombre}")
        print("Todos los estatus de prueba fueron creados.")

    # Comando para listar todos los servidores
    @app.cli.command("list-servers")
    def list_servers():
        servidores = Servidor.query.all()
        if not servidores:
            print("No hay servidores registrados.")
            return
        for servidor in servidores:
            print(servidor.serialize())

    # Comando para insertar un servidor de prueba
    @app.cli.command("insert-test-server")
    def insert_test_server():
        servidor = Servidor(
            nombre="Servidor Test",
            tipo="FÍSICO",
            ip="192.168.1.1",
            balanceador="Balanceador 1",
            vlan="VLAN 10",
            descripcion="Servidor de prueba generado vía CLI",
            link="http://ejemplo.com",
            servicio_id=1, 
            capa_id=1, 
            ambiente_id=1, 
            dominio_id=1, 
            sistema_operativo_id=1, 
            estatus_id=1
        )
        db.session.add(servidor)
        db.session.commit()
        print(f"Servidor creado: {servidor.nombre}")
