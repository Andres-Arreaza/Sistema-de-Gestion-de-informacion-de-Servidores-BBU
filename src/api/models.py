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

    servidores = db.relationship("Servidor", back_populates="servicio", lazy=True)

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
            "servicio": self.servicio.nombre if self.servicio else None,
            "capa": self.capa.nombre if self.capa else None,
            "ambiente": self.ambiente.nombre if self.ambiente else None,
            "dominio": self.dominio.nombre if self.dominio else None,
            "sistema_operativo": self.sistema_operativo.nombre if self.sistema_operativo else None,
            "estatus": self.estatus.nombre if self.estatus else None
        }