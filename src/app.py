"""
Este módulo gestiona el inicio del servidor API, la carga de la base de datos y la adición de los endpoints.
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, SistemaOperativo, Servidor  # 🔹 Importar modelos
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # 🔹 Importar CORS

# Configuración de entorno
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# Configuración de base de datos
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Configuración de JWT
app.config["JWT_SECRET_KEY"] = "super-secret"  # Cambia esto!
jwt = JWTManager(app)

# 🔹 Habilitar CORS para permitir solicitudes desde el frontend
CORS(app, origins=["http://localhost:3000"])

# Inicialización de componentes
setup_admin(app)
setup_commands(app)
app.register_blueprint(api, url_prefix='/api')

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # Evita la caché en memoria
    return response

# 🔹 Ruta para obtener sistemas operativos
@app.route('/api/sistemas_operativos', methods=['GET'])
def get_sistemas_operativos():
    try:
        sistemas = SistemaOperativo.query.all()
        sistemas_json = [sistema.serialize() for sistema in sistemas]
        return jsonify(sistemas_json), 200
    except Exception as e:
        return jsonify({"error": f"Error obteniendo sistemas operativos: {str(e)}"}), 500

# 🔹 Ruta para obtener todos los servidores
@app.route('/api/servidores', methods=['GET'])
def get_servidores():
    try:
        servidores = Servidor.query.all()
        servidores_json = [servidor.serialize() for servidor in servidores]
        return jsonify(servidores_json), 200
    except Exception as e:
        return jsonify({"error": f"Error obteniendo servidores: {str(e)}"}), 500

# 🔹 Ruta para crear un nuevo servidor
@app.route('/api/servidores', methods=['POST'])
def create_servidor():
    try:
        data = request.get_json()
        
        # 🔹 Validar que los datos necesarios están presentes
        if "nombre" not in data or "tipo" not in data or "ip" not in data:
            return jsonify({"error": "Faltan datos obligatorios"}), 400
        
        nuevo_servidor = Servidor(**data)
        db.session.add(nuevo_servidor)
        db.session.commit()
        
        return jsonify(nuevo_servidor.serialize()), 201
    except Exception as e:
        return jsonify({"error": f"Error al guardar servidor: {str(e)}"}), 500
        

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)