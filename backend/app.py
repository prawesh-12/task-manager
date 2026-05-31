from flask import Flask, jsonify
from flask_cors import CORS

from config import config
from routes.auth_routes import auth_bp
from routes.task_routes import tasks_bp
from routes.user_routes import users_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.FLASK_SECRET_KEY
    CORS(app, origins=[config.FRONTEND_URL], supports_credentials=True)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(tasks_bp)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
