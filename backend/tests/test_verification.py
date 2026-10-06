import pytest
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.service_category import ServiceCategory
from app.models.technician import Technician
from app.models.credential import Credential
from app.utils.badge_generator import validate_badge_format, generate_random_badge_code

@pytest.fixture
def test_client():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        # Seed test category
        cat = ServiceCategory(code="electrical", name="Electrical", icon="⚡")
        db.session.add(cat)
        db.session.flush()

        # Seed verified technician
        u1 = User(email="test.verified@fixnearby.local", full_name="Ramesh Patil", phone="+919800000001", role="technician")
        u1.set_password("Pass@123")
        db.session.add(u1)
        db.session.flush()

        t1 = Technician(
            user_id=u1.id,
            category_id=cat.id,
            badge_code="FN-88492",
            trade="Licensed Electrician",
            phone="+919800000001",
            whatsapp_number="+919800000001",
            rating=4.9,
            jobs_completed=50,
            operating_radius_km=15.0,
            is_on_duty=True,
            is_verified=True,
            current_latitude=16.7050,
            current_longitude=74.2433
        )
        db.session.add(t1)
        db.session.flush()

        c1 = Credential(
            technician_id=t1.id,
            legal_name="Ramesh Patil",
            identity_verified=True,
            license_verified=True,
            license_number="MH-ELEC-12345",
            address_verified=True,
            police_verified=True
        )
        db.session.add(c1)

        # Seed unverified technician (failing rating & jobs threshold)
        u2 = User(email="test.unverified@fixnearby.local", full_name="Vijay More", phone="+919800000002", role="technician")
        u2.set_password("Pass@123")
        db.session.add(u2)
        db.session.flush()

        t2 = Technician(
            user_id=u2.id,
            category_id=cat.id,
            badge_code="FN-33211",
            trade="Assistant Electrician",
            phone="+919800000002",
            whatsapp_number="+919800000002",
            rating=3.5, # Failing (< 4.0)
            jobs_completed=2, # Failing (< 5)
            is_on_duty=True,
            is_verified=False,
            current_latitude=16.7100,
            current_longitude=74.2400
        )
        db.session.add(t2)
        db.session.flush()

        c2 = Credential(
            technician_id=t2.id,
            legal_name="Vijay More",
            identity_verified=True,
            license_verified=False,
            address_verified=True,
            police_verified=False,
            failure_reasons="License not certified; Police check missing"
        )
        db.session.add(c2)
        db.session.commit()

        yield app.test_client()
        db.drop_all()

def test_badge_format_validation():
    assert validate_badge_format("FN-88492") is True
    assert validate_badge_format("FN-ABCDE") is True
    assert validate_badge_format("FN-8849") is False  # 4 chars
    assert validate_badge_format("88492") is False     # no FN-
    assert validate_badge_format("fn-88492") is True   # case insensitive
    assert validate_badge_format("INVALID") is False

def test_verify_valid_technician(test_client):
    res = test_client.get("/api/v1/verify/FN-88492")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["overallStatus"] == "VERIFIED"
    assert data["data"]["isVerified"] is True
    assert data["data"]["audit"]["allPassed"] is True
    assert data["data"]["audit"]["checks"]["identityCheck"]["status"] == "PASS"
    assert data["data"]["audit"]["checks"]["licenseCheck"]["status"] == "PASS"
    assert data["data"]["audit"]["checks"]["policeCheck"]["status"] == "PASS"
    assert data["data"]["audit"]["checks"]["ratingCheck"]["status"] == "PASS"

def test_verify_unverified_technician(test_client):
    res = test_client.get("/api/v1/verify/FN-33211")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["overallStatus"] == "NOT_VERIFIED"
    assert data["data"]["isVerified"] is False
    assert data["data"]["audit"]["checks"]["licenseCheck"]["status"] == "FAIL"
    assert data["data"]["audit"]["checks"]["policeCheck"]["status"] == "FAIL"
    assert data["data"]["audit"]["checks"]["ratingCheck"]["status"] == "FAIL"

def test_verify_invalid_badge_format(test_client):
    res = test_client.get("/api/v1/verify/XYZ123")
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_FORMAT"

def test_verify_nonexistent_badge(test_client):
    res = test_client.get("/api/v1/verify/FN-99999")
    assert res.status_code == 404
    data = res.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"

