"""
Este módulo gestiona el inicio del servidor API, la carga de la base de datos y la adición de los endpoints.
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, SistemaOperativo, Servidor
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import datetime

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

# Habilitar CORS para todas las rutas
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "*"]}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials", "Access-Control-Allow-Origin"])

# Inicialización de componentes
setup_admin(app)
setup_commands(app)
app.register_blueprint(api, url_prefix='/api')

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    return response, error.status_code

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
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.cache_control.max_age = 0  # Evita la caché en memoria
    return response


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)