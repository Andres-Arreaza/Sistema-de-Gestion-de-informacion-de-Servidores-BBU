import os
from flask_admin import Admin
from .models import db, Servicio, Capa, Ambiente, Dominio, SistemaOperativo, Estatus, Servidor
from flask_admin.contrib.sqla import ModelView
from wtforms_sqlalchemy.fields import QuerySelectField

# Funciones para cargar los datos basados en nombre
def servicio_query():
    return Servicio.query.order_by(Servicio.nombre).all()

def capa_query():
    return Capa.query.order_by(Capa.nombre).all()

def ambiente_query():
    return Ambiente.query.order_by(Ambiente.nombre).all()

def dominio_query():
    return Dominio.query.order_by(Dominio.nombre).all()

def sistema_operativo_query():
    return SistemaOperativo.query.order_by(SistemaOperativo.nombre).all()

def estatus_query():
    return Estatus.query.order_by(Estatus.nombre).all()

class BaseView(ModelView):
    """ Modelo base para vistas en Flask-Admin con fechas de creación, modificación y borrado lógico """
    column_list = ["nombre", "descripcion", "activo", "fecha_creacion", "fecha_modificacion"]
    column_sortable_list = ["fecha_creacion", "fecha_modificacion"]
    column_filters = ["activo", "fecha_creacion", "fecha_modificacion"]
    column_editable_list = ["activo"]  # 🔹 Permitir edición rápida del estado activo

    def _format_fecha_modificacion(view, context, model, name):
        """ Mostrar fecha_modificacion solo si existe, de lo contrario mostrar vacío """
        return model.fecha_modificacion.isoformat() if model.fecha_modificacion else ""

    column_formatters = {
        "fecha_modificacion": _format_fecha_modificacion
    }

class ServicioView(BaseView):
    """ Vista personalizada para gestionar servicios en Flask-Admin """
    pass

class CapaView(BaseView):
    """ Vista personalizada para gestionar capas en Flask-Admin """
    pass

class AmbienteView(BaseView):
    """ Vista personalizada para gestionar ambientes en Flask-Admin """
    pass

class DominioView(BaseView):
    """ Vista personalizada para gestionar dominios en Flask-Admin """
    pass

class SistemaOperativoView(BaseView):
    """ Vista personalizada para gestionar sistemas operativos en Flask-Admin """
    column_list = ["nombre", "version", "descripcion", "activo", "fecha_creacion", "fecha_modificacion"]
    form_args = {
        "nombre": {"validators": [lambda form, field: field.data or field.errors.append("El nombre es obligatorio")]},
        "version": {"validators": [lambda form, field: field.data or field.errors.append("La versión es obligatoria")]}
    }

class EstatusView(BaseView):
    """ Vista personalizada para gestionar estatus en Flask-Admin """
    pass

class ServidorView(ModelView):
    """ Vista personalizada para gestionar servidores en Flask-Admin """
    
    column_list = [
        "nombre", "tipo", "ip", "balanceador", "vlan", "descripcion", "link",
        "servicio", "capa", "ambiente", "dominio", "sistema_operativo", "estatus"
    ]

    # Mostrar los nombres en lugar de los IDs en la vista de administración
    column_formatters = {
        "servicio": lambda v, c, m, p: m.servicio.nombre if m.servicio else "",
        "capa": lambda v, c, m, p: m.capa.nombre if m.capa else "",
        "ambiente": lambda v, c, m, p: m.ambiente.nombre if m.ambiente else "",
        "dominio": lambda v, c, m, p: m.dominio.nombre if m.dominio else "",
        "sistema_operativo": lambda v, c, m, p: m.sistema_operativo.nombre if m.sistema_operativo else "",
        "estatus": lambda v, c, m, p: m.estatus.nombre if m.estatus else ""
    }

    # Hacer que los campos sean seleccionables por nombre al agregar registros
    form_overrides = {
        "servicio": QuerySelectField,
        "capa": QuerySelectField,
        "ambiente": QuerySelectField,
        "dominio": QuerySelectField,
        "sistema_operativo": QuerySelectField,
        "estatus": QuerySelectField
    }

    form_args = {
        "servicio": {"query_factory": servicio_query, "allow_blank": False, "get_label": "nombre"},
        "capa": {"query_factory": capa_query, "allow_blank": False, "get_label": "nombre"},
        "ambiente": {"query_factory": ambiente_query, "allow_blank": False, "get_label": "nombre"},
        "dominio": {"query_factory": dominio_query, "allow_blank": False, "get_label": "nombre"},
        "sistema_operativo": {"query_factory": sistema_operativo_query, "allow_blank": False, "get_label": "nombre"},
        "estatus": {"query_factory": estatus_query, "allow_blank": False, "get_label": "nombre"}
    }

def setup_admin(app):
    """ Configurar Flask-Admin para gestionar servidores """
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='Gestión de Servidores', template_mode='bootstrap3')

    # Agregar modelos al panel de administración
    admin.add_view(ServicioView(Servicio, db.session))
    admin.add_view(CapaView(Capa, db.session))
    admin.add_view(AmbienteView(Ambiente, db.session))
    admin.add_view(DominioView(Dominio, db.session))
    admin.add_view(SistemaOperativoView(SistemaOperativo, db.session))
    admin.add_view(EstatusView(Estatus, db.session))
    admin.add_view(ServidorView(Servidor, db.session))