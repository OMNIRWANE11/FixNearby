import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

def get_database_uri():
    configured_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/fixnearby")
    
    # If explicitly SQLite, return it
    if configured_url.startswith("sqlite"):
        return configured_url

    # Check PostgreSQL reachability with configured credentials
    try:
        import psycopg
        conn = psycopg.connect(configured_url, connect_timeout=1)
        conn.close()
        return configured_url
    except Exception:
        # Graceful fallback to persistent SQLite database for seamless development
        sqlite_path = os.path.join(BASE_DIR, "fixnearby_dev.db")
        return f"sqlite:///{sqlite_path}"

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "fixnearby-dev-secret-key-302302390234")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fixnearby-jwt-secret-key-4920409204")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", "24")))

    # Database
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    # CORS
    FRONTEND_ORIGIN = [o.strip() for o in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173,http://127.0.0.1:5173").split(",")]

    # OSRM
    OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org/route/v1/driving")

    # Rate Limiting
    RATELIMIT_STORAGE_URI = os.getenv("RATE_LIMIT_STORAGE_URI", "memory://")
    RATELIMIT_STRATEGY = "moving-window"

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    RATELIMIT_ENABLED = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}

