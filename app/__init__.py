# import os
# import logging
# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from flask_cors import CORS

# # Set up logging
# logging.basicConfig(level=logging.DEBUG)

# # Initialize SQLAlchemy
# db = SQLAlchemy()

# def create_app(test_config=None):
#     # Create and configure the app
#     app = Flask(__name__, instance_relative_config=True)
    
#     # Get the database URL and add SSL configuration to prevent connection issues
#     database_url = os.environ.get('DATABASE_URL', 'sqlite:///:memory:')
    
#     # Default configuration
#     app.config.from_mapping(
#         SECRET_KEY=os.environ.get('SESSION_SECRET', 'dev_key'),
#         SQLALCHEMY_DATABASE_URI=database_url,
#         SQLALCHEMY_TRACK_MODIFICATIONS=False,
#         UPLOAD_FOLDER=os.path.join(app.static_folder, 'uploads') if app.static_folder else 'static/uploads'
#     )
    
#     # Configure SQLAlchemy engine options for better connection management
#     app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
#         'pool_recycle': 60,  # recycle connections after 60 seconds
#         'pool_timeout': 10,  # timeout after 10 seconds
#         'pool_pre_ping': True,  # verify connections before use
#         'connect_args': {'connect_timeout': 10},  # connection timeout
#     }
    
#     # Ensure upload folder exists
#     if not os.path.exists(app.config['UPLOAD_FOLDER']):
#         os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
#     # Enable CORS
#     CORS(app)
    
#     # Initialize the database
#     db.init_app(app)
    
#     # Set up error handling for database operations
#     @app.errorhandler(500)
#     def handle_db_error(e):
#         app.logger.error(f"Database error: {str(e)}")
#         return "Database error occurred. Please try again later.", 500
    
#     with app.app_context():
#         try:
#             # Import models
#             from app.models.models import User, Category, Note, Task, Reminder
            
#             # Create database tables
#             db.create_all()
            
#             # Check if there are any categories, if not, create some defaults
#             if Category.query.count() == 0:
#                 default_categories = []
#                 categories_data = [
#                     {"name": "Personal", "color": "#4CAF50"},
#                     {"name": "Work", "color": "#2196F3"},
#                     {"name": "Ideas", "color": "#FFC107"},
#                     {"name": "Important", "color": "#F44336"}
#                 ]
                
#                 for cat_data in categories_data:
#                     cat = Category()
#                     cat.name = cat_data["name"]
#                     cat.color = cat_data["color"]
#                     default_categories.append(cat)
                
#                 db.session.add_all(default_categories)
#                 db.session.commit()
#                 app.logger.info("Default categories created successfully")
#         except Exception as e:
#             app.logger.error(f"Error during database initialization: {str(e)}")
    
#     # Register blueprints
#     from app.routes.views import views_bp
#     from app.routes.api import api_bp
    
#     app.register_blueprint(views_bp)
#     app.register_blueprint(api_bp, url_prefix='/api')
    
#     return app
import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize SQLAlchemy
db = SQLAlchemy()

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    database_url = os.environ.get('DATABASE_URL', 'sqlite:///:memory:')

    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SESSION_SECRET', 'dev_key'),
        SQLALCHEMY_DATABASE_URI=database_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        UPLOAD_FOLDER=os.path.join(app.static_folder, 'uploads') if app.static_folder else 'static/uploads'
    )

    # ✅ استخدم خيارات مختلفة حسب نوع قاعدة البيانات
    if database_url.startswith("sqlite"):
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {}
    else:
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            'pool_recycle': 60,
            'pool_timeout': 10,
            'pool_pre_ping': True,
            'connect_args': {'connect_timeout': 10},
        }

    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    CORS(app)
    db.init_app(app)

    @app.errorhandler(500)
    def handle_db_error(e):
        app.logger.error(f"Database error: {str(e)}")
        return "Database error occurred. Please try again later.", 500

    with app.app_context():
        try:
            from app.models.models import User, Category, Note, Task, Reminder
            db.create_all()

            if Category.query.count() == 0:
                default_categories = []
                categories_data = [
                    {"name": "Personal", "color": "#4CAF50"},
                    {"name": "Work", "color": "#2196F3"},
                    {"name": "Ideas", "color": "#FFC107"},
                    {"name": "Important", "color": "#F44336"}
                ]
                for cat_data in categories_data:
                    cat = Category(name=cat_data["name"], color=cat_data["color"])
                    default_categories.append(cat)

                db.session.add_all(default_categories)
                db.session.commit()
                app.logger.info("Default categories created successfully")
        except Exception as e:
            app.logger.error(f"Error during database initialization: {str(e)}")

    from app.routes.views import views_bp
    from app.routes.api import api_bp

    app.register_blueprint(views_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
