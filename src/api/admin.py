import os
from flask_admin import Admin
from .models import db, Servicio, Capa, Ambiente, Dominio, SistemaOperativo, Estatus, Servidor, Ecosistema, Aplicacion, User, UserRole
from flask_admin.contrib.sqla import ModelView
from wtforms_sqlalchemy.fields import QuerySelectField
from wtforms import PasswordField, SelectField

def aplicacion_query():
    return Aplicacion.query.order_by(Aplicacion.nombre).all()

def get_aplicacion_label(model):
    return f"{model.nombre} - V{model.version}"

# 🔹 Funciones para cargar los datos basados en nombre

def servicio_query():
    return Servicio.query.order_by(Servicio.nombre).all()

def ecosistema_query():
    return Ecosistema.query.order_by(Ecosistema.nombre).all()

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
    column_list = ["id", "nombre", "descripcion", "activo", "fecha_creacion", "fecha_modificacion"]
    column_sortable_list = ["id", "fecha_creacion", "fecha_modificacion"]
    column_filters = ["activo", "fecha_creacion", "fecha_modificacion"]
    column_editable_list = ["activo"]  # 🔹 Permitir edición rápida del estado activo

    def _format_fecha_modificacion(view, context, model, name):
        """ Mostrar fecha_modificacion solo si existe, de lo contrario mostrar vacío """
        return model.fecha_modificacion.isoformat() if model.fecha_modificacion else ""

    column_formatters = {
        "fecha_modificacion": _format_fecha_modificacion
    }

class AplicacionView(BaseView):
    """ Vista personalizada para gestionar aplicaciones en Flask-Admin """
    column_list = ["id", "nombre", "version", "descripcion", "activo", "fecha_creacion", "fecha_modificacion"]
    form_args = {
        "nombre": {"validators": [lambda form, field: field.data or field.errors.append("El nombre es obligatorio")]},
        "version": {"validators": [lambda form, field: field.data or field.errors.append("La versión es obligatoria")]}
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


class EcosistemaView(BaseView):
    """ Vista personalizada para gestionar ecosistemas en Flask-Admin """
    pass

class DominioView(BaseView):
    """ Vista personalizada para gestionar dominios en Flask-Admin """
    pass

class SistemaOperativoView(BaseView):
    """ Vista personalizada para gestionar sistemas operativos en Flask-Admin """
    column_list = ["id", "nombre", "version", "descripcion", "activo", "fecha_creacion", "fecha_modificacion"]
    form_args = {
        "nombre": {"validators": [lambda form, field: field.data or field.errors.append("El nombre es obligatorio")]},
        "version": {"validators": [lambda form, field: field.data or field.errors.append("La versión es obligatoria")]}
    }

class EstatusView(BaseView):
    """ Vista personalizada para gestionar estatus en Flask-Admin """
    pass

class ServidorView(BaseView):
    """ Vista personalizada para gestionar servidores en Flask-Admin """
    column_list = [
        "id", "nombre", "tipo", "ip_mgmt", "vlan_mgmt", "ip_real", "vlan_real", "ip_mask25", "balanceador", "descripcion", "link",
        "servicio", "capa", "ecosistema", "ambiente", "dominio", "sistema_operativo", "estatus", "aplicacion", "activo", "fecha_creacion", "fecha_modificacion"
    ]
    column_filters = ["activo", "tipo", "servicio", "capa", "ecosistema", "ambiente", "dominio", "sistema_operativo", "aplicacion"]
    column_editable_list = ["activo"]

    # Mostrar los nombres en lugar de los IDs en la vista de administración
    column_formatters = {
        "servicio": lambda v, c, m, p: m.servicio.nombre if m.servicio else "",
        "capa": lambda v, c, m, p: m.capa.nombre if m.capa else "",
        "ecosistema": lambda v, c, m, p: m.ecosistema.nombre if hasattr(m, 'ecosistema') and m.ecosistema else "",
        "ambiente": lambda v, c, m, p: m.ambiente.nombre if m.ambiente else "",
        "dominio": lambda v, c, m, p: m.dominio.nombre if m.dominio else "",
        "sistema_operativo": lambda v, c, m, p: m.sistema_operativo.nombre if m.sistema_operativo else "",
        "estatus": lambda v, c, m, p: m.estatus.nombre if m.estatus else "",
        "aplicacion": lambda v, c, m, p: f"{m.aplicacion.nombre} - V{m.aplicacion.version}" if m.aplicacion else ""
    }

    # Hacer que los campos sean seleccionables por nombre al agregar registros
    form_overrides = {
        "servicio": QuerySelectField,
        "capa": QuerySelectField,
        "ecosistema": QuerySelectField,
        "ambiente": QuerySelectField,
        "dominio": QuerySelectField,
        "sistema_operativo": QuerySelectField,
        "aplicacion": QuerySelectField,
        "estatus": QuerySelectField
    }

    form_args = {
        "servicio": {"query_factory": servicio_query, "allow_blank": False, "get_label": "nombre"},
        "capa": {"query_factory": capa_query, "allow_blank": False, "get_label": "nombre"},
        "ecosistema": {"query_factory": ecosistema_query, "allow_blank": True, "get_label": "nombre"},
        "ambiente": {"query_factory": ambiente_query, "allow_blank": False, "get_label": "nombre"},
        "dominio": {"query_factory": dominio_query, "allow_blank": False, "get_label": "nombre"},
        "sistema_operativo": {"query_factory": sistema_operativo_query, "allow_blank": False, "get_label": "nombre"},
        "aplicacion": {"query_factory": aplicacion_query, "allow_blank": True, "get_label": get_aplicacion_label},
        "estatus": {"query_factory": estatus_query, "allow_blank": True, "get_label": "nombre"}
    }

class UserView(BaseView):
    """ Vista personalizada para gestionar usuarios en Flask-Admin """
    column_list = ["id", "username", "email", "role", "activo", "fecha_creacion", "fecha_modificacion"]
    form_excluded_columns = ["password_hash"]  # no exponer el hash
    form_extra_fields = {
        # campo virtual para que el admin pueda introducir contraseña en texto plano
        "password": PasswordField("Password")
    }
    # Mostrar role como select con opciones
    form_overrides = {
        "role": SelectField
    }
    form_args = {
        "username": {"validators": [lambda form, field: field.data or field.errors.append("El username es obligatorio")]},
        "role": {"choices": [(r.value, r.value) for r in UserRole]}
    }

    def on_model_change(self, form, model, is_created):
        """
        Antes de guardar el modelo, si el admin proporcionó 'password' la convertimos en hash
        y la guardamos en password_hash; si se está creando un usuario nuevo y no hay contraseña,
        lanzamos un error para evitar insertar NULL en password_hash.
        """
        # Si el formulario trae password (campo extra), aplicar hashing
        pw = getattr(form, "password", None)
        if pw and pw.data:
            model.set_password(pw.data)
        elif is_created:
            # crear sin contraseña no está permitido -> evitar NOT NULL violation
            raise ValueError("Es obligatorio establecer una contraseña al crear un usuario desde el administrador.")
        # Si no es creación y no se suministró password, dejar password_hash sin cambios

def setup_admin(app):
    """ Configurar Flask-Admin para gestionar modelos """
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='Gestión de Recursos', template_mode='bootstrap3')

    # Agregar modelos al panel de administración
    admin.add_view(ServicioView(Servicio, db.session))
    admin.add_view(EcosistemaView(Ecosistema, db.session))
    admin.add_view(CapaView(Capa, db.session))
    admin.add_view(AmbienteView(Ambiente, db.session))
    admin.add_view(DominioView(Dominio, db.session))
    admin.add_view(SistemaOperativoView(SistemaOperativo, db.session))
    admin.add_view(AplicacionView(Aplicacion, db.session))
    admin.add_view(EstatusView(Estatus, db.session))
    admin.add_view(ServidorView(Servidor, db.session))

    # Añadir UserView al final
    admin.add_view(UserView(User, db.session))