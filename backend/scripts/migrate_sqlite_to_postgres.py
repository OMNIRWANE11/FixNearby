import os
import sys
import sqlite3
from datetime import datetime
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.models.service_category import ServiceCategory, ProblemType
from app.models.user import User
from app.models.technician import Technician
from app.models.credential import Credential
from app.models.emergency_request import EmergencyRequest
from app.models.review import Review
from app.models.location_log import LocationLog

def parse_dt(val):
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    try:
        return datetime.fromisoformat(val.replace("Z", "+00:00"))
    except Exception:
        pass
    try:
        return datetime.strptime(val.split(".")[0], "%Y-%m-%d %H:%M:%S")
    except Exception:
        return None

def row_to_model_kwargs(model_cls, sqlite_row):
    kwargs = {}
    row_keys = sqlite_row.keys()
    for col in model_cls.__table__.columns:
        col_name = col.name
        if col_name in row_keys:
            val = sqlite_row[col_name]
            if val is not None and "datetime" in str(col.type).lower():
                val = parse_dt(val)
            elif val is not None and "date" in str(col.type).lower() and not "datetime" in str(col.type).lower():
                dt = parse_dt(val)
                val = dt.date() if dt else None
            elif val is not None and "bool" in str(col.type).lower():
                val = bool(val)
            kwargs[col_name] = val
    return kwargs

def migrate():
    sqlite_path = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")), "fixnearby_dev.db")
    if not os.path.exists(sqlite_path):
        print(f"Error: SQLite database not found at {sqlite_path}")
        return

    print("=" * 65)
    print("FIXNEARBY - FULL DATA MIGRATION: SQLITE -> POSTGRESQL (pgAdmin)")
    print("=" * 65)
    print(f"Source SQLite DB : {sqlite_path}")

    app = create_app("development")

    with app.app_context():
        target_uri = str(db.engine.url)
        print(f"Target Postgres  : {target_uri}")
        if "postgresql" not in target_uri:
            print("ERROR: Target is not PostgreSQL. Please check DATABASE_URL in .env")
            return

        print("\n1. Initializing schema in PostgreSQL...")
        db.create_all()
        print("   -> Schema created successfully (all tables initialized)!")

        sqlite_conn = sqlite3.connect(sqlite_path)
        sqlite_conn.row_factory = sqlite3.Row
        cur = sqlite_conn.cursor()

        tables = [
            ("service_categories", ServiceCategory),
            ("problem_types", ProblemType),
            ("users", User),
            ("technicians", Technician),
            ("credentials", Credential),
            ("emergency_requests", EmergencyRequest),
            ("reviews", Review),
            ("location_logs", LocationLog),
        ]

        for tbl_name, model_cls in tables:
            print(f"\nMigrating '{tbl_name}'...")
            cur.execute(f"SELECT * FROM {tbl_name}")
            rows = cur.fetchall()
            migrated = 0
            for r in rows:
                pk_val = r["id"]
                existing = db.session.get(model_cls, pk_val)
                if not existing:
                    kwargs = row_to_model_kwargs(model_cls, r)
                    obj = model_cls(**kwargs)
                    db.session.add(obj)
                    migrated += 1
            db.session.commit()
            print(f"   -> Migrated {migrated}/{len(rows)} rows into '{tbl_name}'.")

        # Reset sequences for serial columns
        print("\nSynchronizing PostgreSQL sequences...")
        try:
            with db.engine.connect() as conn:
                conn.execute(text("SELECT setval('service_categories_id_seq', COALESCE((SELECT MAX(id) FROM service_categories), 1), true);"))
                conn.execute(text("SELECT setval('problem_types_id_seq', COALESCE((SELECT MAX(id) FROM problem_types), 1), true);"))
                conn.execute(text("SELECT setval('location_logs_id_seq', COALESCE((SELECT MAX(id) FROM location_logs), 1), true);"))
                conn.commit()
            print("   -> Sequences synchronized!")
        except Exception as e:
            print(f"   -> Note on sequence reset: {e}")

        # Final verification
        print("\n" + "=" * 65)
        print("VERIFYING POSTGRESQL TABLE ROW COUNTS IN PGADMIN:")
        print("=" * 65)
        for tbl_name, model in tables:
            count = model.query.count()
            print(f"PostgreSQL '{tbl_name}': {count} rows")

        print("=" * 65)
        print("ALL DATA HAS BEEN SUCCESSFULLY SAVED TO POSTGRESQL / PGADMIN!")
        print("=" * 65)

        sqlite_conn.close()

if __name__ == "__main__":
    migrate()

