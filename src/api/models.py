from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

db = SQLAlchemy()

class TipoServidorEnum(Enum):
    FISICO = "FÍSICO"
    VIRTUAL = "VIRTUAL"

class BaseModel(db.Model):
    """ Modelo base con fecha de creación, modificación y borrado lógico """
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # 🔹 Se asegura que el ID sea válido
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    fecha_modificacion = db.Column(db.DateTime, nullable=True)  # 🔹 Solo se actualiza cuando hay modificaciones
    activo = db.Column(db.Boolean, default=True, nullable=False)  # 🔹 Borrado lógico

    def serialize(self):
        return {
            "id": self.id,
            "fecha_creacion": self.fecha_creacion.isoformat(),
            "fecha_modificacion": self.fecha_modificacion.isoformat() if self.fecha_modificacion else None,
            "activo": self.activo
        }

class Servicio(BaseModel):
    __tablename__ = 'servicios'
    
    nombre = db.Column(db.String(120), nullable=False)  # 🔹 Campo obligatorio
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class Capa(BaseModel):
    __tablename__ = 'capas'

    nombre = db.Column(db.String(120), nullable=False)  # 🔹 Campo obligatorio
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class Ambiente(BaseModel):
    __tablename__ = 'ambientes'

    nombre = db.Column(db.String(120), nullable=False)  # 🔹 Campo obligatorio
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class Dominio(BaseModel):
    __tablename__ = 'dominios'

    nombre = db.Column(db.String(120), nullable=False)  # 🔹 Campo obligatorio
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class SistemaOperativo(BaseModel):
    __tablename__ = 'sistemas_operativos'

    nombre = db.Column(db.String(120), nullable=False)  # 🔹 Campo obligatorio
    año = db.Column(db.Integer, nullable=False)  # 🔹 Año de lanzamiento
    version = db.Column(db.String(50), nullable=False)  # 🔹 Campo obligatorio
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "año": self.año, "version": self.version, "descripcion": self.descripcion})
        return data

class Estatus(BaseModel):
    __tablename__ = 'estatus'

    nombre = db.Column(db.String(120), nullable=False)  # 🔹 Campo obligatorio
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class Servidor(BaseModel):  # 🔹 Ahora hereda de `BaseModel` para incluir `activo`, `fecha_creacion` y `fecha_modificacion`
    __tablename__ = 'servidores'

    nombre = db.Column(db.String(120), nullable=False)  # 🔹 Se permite reutilizar nombres eliminados
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
        data = super().serialize()
        data.update({
            "nombre": self.nombre,
            "tipo": self.tipo.value,
            "ip": self.ip,
            "balanceador": self.balanceador,
            "vlan": self.vlan,
            "descripcion": self.descripcion,
            "link": self.link,
            "servicio": self.servicio.serialize() if self.servicio else None,
            "capa": self.capa.serialize() if self.capa else None,
            "ambiente": self.ambiente.serialize() if self.ambiente else None,
            "dominio": self.dominio.serialize() if self.dominio else None,
            "sistema_operativo": self.sistema_operativo.serialize() if self.sistema_operativo else None,
            "estatus": self.estatus.serialize() if self.estatus else None
        })
        return data