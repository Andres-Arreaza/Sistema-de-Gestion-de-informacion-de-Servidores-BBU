from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

db = SQLAlchemy()

class TipoServidorEnum(Enum):
    FISICO = "FISICO"
    VIRTUAL = "VIRTUAL"

    @classmethod
    def from_str(cls, value):
        if isinstance(value, cls):
            return value
        if isinstance(value, str):
            if value.upper() in ["FISICO", "FÍSICO"]:
                return cls.FISICO
            elif value.upper() == "VIRTUAL":
                return cls.VIRTUAL
        raise ValueError(f"TipoServidorEnum inválido: {value}")

class BaseModel(db.Model):
    """ Modelo base con fecha de creación, modificación y borrado lógico """
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    fecha_modificacion = db.Column(db.DateTime, nullable=True)
    activo = db.Column(db.Boolean, default=True, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "fecha_creacion": self.fecha_creacion.isoformat(),
            "fecha_modificacion": self.fecha_modificacion.isoformat() if self.fecha_modificacion else None,
            "activo": self.activo
        }
class Servicio(BaseModel):
    __tablename__ = 'servicios'
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class Ecosistema(BaseModel):
    __tablename__ = 'ecosistemas'
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class Capa(BaseModel):
    __tablename__ = 'capas'
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class Ambiente(BaseModel):
    __tablename__ = 'ambientes'
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class Dominio(BaseModel):
    __tablename__ = 'dominios'
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class Estatus(BaseModel):
    __tablename__ = 'estatus'
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({"nombre": self.nombre, "descripcion": self.descripcion})
        return data

class SistemaOperativo(BaseModel):
    __tablename__ = 'sistemas_operativos'
    nombre = db.Column(db.String(120), nullable=False)
    version = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.String(250), nullable=True)
    
    def serialize(self):
        data = super().serialize()
        data.update({
            "nombre": self.nombre,
            "version": self.version,
            "descripcion": self.descripcion
        })
        return data






class Aplicacion(BaseModel):
    __tablename__ = 'aplicaciones'
    nombre = db.Column(db.String(120), nullable=False)
    version = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.String(250), nullable=True)

    def serialize(self):
        data = super().serialize()
        data.update({
            "nombre": self.nombre,
            "version": self.version,
            "descripcion": self.descripcion
        })
        return data



class Servidor(BaseModel): 
    __tablename__ = 'servidores'

    nombre = db.Column(db.String(120), nullable=False)
    tipo = db.Column(db.Enum(TipoServidorEnum), nullable=False)
    ip_mgmt = db.Column(db.String(50), nullable=True)
    ip_real = db.Column(db.String(50), nullable=True)
    ip_mask25 = db.Column(db.String(50), nullable=True)
    balanceador = db.Column(db.String(120), nullable=True)
    vlan = db.Column(db.String(50), nullable=True)
    descripcion = db.Column(db.String(250), nullable=True)
    link = db.Column(db.String(250), nullable=True)

    ecosistema_id = db.Column(db.Integer, db.ForeignKey("ecosistemas.id"), nullable=True)
    servicio_id = db.Column(db.Integer, db.ForeignKey("servicios.id"), nullable=False)
    capa_id = db.Column(db.Integer, db.ForeignKey("capas.id"), nullable=False)
    ambiente_id = db.Column(db.Integer, db.ForeignKey("ambientes.id"), nullable=False)
    dominio_id = db.Column(db.Integer, db.ForeignKey("dominios.id"), nullable=False)
    sistema_operativo_id = db.Column(db.Integer, db.ForeignKey("sistemas_operativos.id"), nullable=False)
    aplicacion_id = db.Column(db.Integer, db.ForeignKey("aplicaciones.id"), nullable=False)
    estatus_id = db.Column(db.Integer, db.ForeignKey("estatus.id"), nullable=True)

    # Relaciones de uno a muchos
    ecosistema = db.relationship(Ecosistema)
    servicio = db.relationship(Servicio)
    capa = db.relationship(Capa)
    ambiente = db.relationship(Ambiente)
    dominio = db.relationship(Dominio)
    sistema_operativo = db.relationship(SistemaOperativo)
    aplicacion = db.relationship(Aplicacion)
    estatus = db.relationship(Estatus)

    __table_args__ = (
        db.UniqueConstraint('nombre', name='uq_servidor_nombre'),
        db.UniqueConstraint('ip_mgmt', name='uq_servidor_ip_mgmt'),
        db.UniqueConstraint('ip_real', name='uq_servidor_ip_real'),
    )

    def __init__(self, *args, **kwargs):
        if "tipo" in kwargs:
            tipo_val = kwargs["tipo"]
            if isinstance(tipo_val, str):
                kwargs["tipo"] = TipoServidorEnum.from_str(tipo_val)
        super().__init__(*args, **kwargs)
    
    def serialize(self):
        data = super().serialize()
        data.update({
            "nombre": self.nombre,
            "tipo": self.tipo.value,
            "ip_mgmt": self.ip_mgmt,
            "ip_real": self.ip_real,
            "ip_mask25": self.ip_mask25,
            "balanceador": self.balanceador,
            "vlan": self.vlan,
            "descripcion": self.descripcion,
            "link": self.link,
            "servicio_id": self.servicio_id,
            "capa_id": self.capa_id,
            "ambiente_id": self.ambiente_id,
            "dominio_id": self.dominio_id,
            "sistema_operativo_id": self.sistema_operativo_id,
            "aplicacion_id": self.aplicacion_id,
            "estatus_id": self.estatus_id,
            "ecosistema_id": self.ecosistema_id,
            "servicio": self.servicio.serialize() if self.servicio else None,
            "capa": self.capa.serialize() if self.capa else None,
            "ambiente": self.ambiente.serialize() if self.ambiente else None,
            "dominio": self.dominio.serialize() if self.dominio else None,
            "sistema_operativo": self.sistema_operativo.serialize() if self.sistema_operativo else None,
            "aplicacion": self.aplicacion.serialize() if self.aplicacion else None,
            "estatus": self.estatus.serialize() if self.estatus else None,
            "ecosistema": self.ecosistema.serialize() if self.ecosistema else None,
        })
        return data
