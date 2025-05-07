from flask_sqlalchemy import SQLAlchemy
from enum import Enum

db = SQLAlchemy()

class TipoServidorEnum(Enum):
    FISICO = "FÍSICO"
    VIRTUAL = "VIRTUAL"

class Servicio(db.Model):
    __tablename__ = 'servicios'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)
    descripcion = db.Column(db.String(250))

    def serialize(self):
        return {"id": self.id, "nombre": self.nombre, "descripcion": self.descripcion}

class Capa(db.Model):
    __tablename__ = 'capas'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)
    descripcion = db.Column(db.String(250))

    def serialize(self):
        return {"id": self.id, "nombre": self.nombre, "descripcion": self.descripcion}

class Ambiente(db.Model):
    __tablename__ = 'ambientes'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)
    descripcion = db.Column(db.String(250))

    def serialize(self):
        return {"id": self.id, "nombre": self.nombre, "descripcion": self.descripcion}

class Dominio(db.Model):
    __tablename__ = 'dominios'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)
    descripcion = db.Column(db.String(250))

    def serialize(self):
        return {"id": self.id, "nombre": self.nombre, "descripcion": self.descripcion}

class SistemaOperativo(db.Model):
    __tablename__ = 'sistemas_operativos'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)
    version = db.Column(db.String(50))
    descripcion = db.Column(db.String(250))

    def serialize(self):
        return {"id": self.id, "nombre": self.nombre, "version": self.version, "descripcion": self.descripcion}

class Estatus(db.Model):
    __tablename__ = 'estatus'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)
    descripcion = db.Column(db.String(250))

    def serialize(self):
        return {"id": self.id, "nombre": self.nombre, "descripcion": self.descripcion}

class Servidor(db.Model):
    __tablename__ = 'servidores'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)
    tipo = db.Column(db.Enum(TipoServidorEnum), nullable=False)
    ip = db.Column(db.String(50), nullable=True)
    balanceador = db.Column(db.String(120), nullable=True)
    vlan = db.Column(db.String(50), nullable=True)
    descripcion = db.Column(db.String(250), nullable=True)
    link = db.Column(db.String(250), nullable=True)

    servicio_id = db.Column(db.Integer, db.ForeignKey("servicios.id"), nullable=False)
    capa_id = db.Column(db.Integer, db.ForeignKey("capas.id"), nullable=False)
    ambiente_id = db.Column(db.Integer, db.ForeignKey("ambientes.id"), nullable=False)
    dominio_id = db.Column(db.Integer, db.ForeignKey("dominios.id"), nullable=False)
    sistema_operativo_id = db.Column(db.Integer, db.ForeignKey("sistemas_operativos.id"), nullable=False)
    estatus_id = db.Column(db.Integer, db.ForeignKey("estatus.id"), nullable=False)

    servicio = db.relationship(Servicio)
    capa = db.relationship(Capa)
    ambiente = db.relationship(Ambiente)
    dominio = db.relationship(Dominio)
    sistema_operativo = db.relationship(SistemaOperativo)
    estatus = db.relationship(Estatus)

    historial = db.relationship("HistorialServidor", back_populates="servidor", lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "tipo": self.tipo.value,
            "ip": self.ip,
            "balanceador": self.balanceador,
            "vlan": self.vlan,
            "descripcion": self.descripcion,
            "link": self.link,
            "servicio_id": self.servicio_id,
            "capa_id": self.capa_id,
            "ambiente_id": self.ambiente_id,
            "dominio_id": self.dominio_id,
            "sistema_operativo_id": self.sistema_operativo_id,
            "estatus_id": self.estatus_id,
            "historial": [registro.serialize() for registro in self.historial]
        }

class HistorialServidor(db.Model):
    __tablename__ = 'historial_servidores'

    id = db.Column(db.Integer, primary_key=True)
    servidor_id = db.Column(db.Integer, db.ForeignKey("servidores.id"), nullable=False)
    fecha_modificacion = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())

    nombre = db.Column(db.String(120), nullable=False)
    tipo = db.Column(db.Enum(TipoServidorEnum), nullable=False)
    ip = db.Column(db.String(50), nullable=True)
    balanceador = db.Column(db.String(120), nullable=True)
    vlan = db.Column(db.String(50), nullable=True)
    descripcion = db.Column(db.String(250), nullable=True)
    link = db.Column(db.String(250), nullable=True)

    servicio_id = db.Column(db.Integer, db.ForeignKey("servicios.id"), nullable=False)
    capa_id = db.Column(db.Integer, db.ForeignKey("capas.id"), nullable=False)
    ambiente_id = db.Column(db.Integer, db.ForeignKey("ambientes.id"), nullable=False)
    dominio_id = db.Column(db.Integer, db.ForeignKey("dominios.id"), nullable=False)
    sistema_operativo_id = db.Column(db.Integer, db.ForeignKey("sistemas_operativos.id"), nullable=False)
    estatus_id = db.Column(db.Integer, db.ForeignKey("estatus.id"), nullable=False)

    servidor = db.relationship("Servidor", back_populates="historial")

    def serialize(self):
        return {
            "id": self.id,
            "servidor_id": self.servidor_id,
            "fecha_modificacion": self.fecha_modificacion.isoformat(),
            "nombre": self.nombre,
            "tipo": self.tipo.value,
            "ip": self.ip,
            "balanceador": self.balanceador,
            "vlan": self.vlan,
            "descripcion": self.descripcion,
            "link": self.link,
            "servicio_id": self.servicio_id,
            "capa_id": self.capa_id,
            "ambiente_id": self.ambiente_id,
            "dominio_id": self.dominio_id,
            "sistema_operativo_id": self.sistema_operativo_id,
            "estatus_id": self.estatus_id
        }