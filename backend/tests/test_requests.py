import pytest
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.service_category import ServiceCategory, ProblemType
from app.models.technician import Technician
from app.models.credential import Credential

@pytest.fixture
def req_client():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        # Setup category and problem
        cat = ServiceCategory(code="electrical", name="Electrical", icon="⚡")
        db.session.add(cat)
        db.session.flush()

        prob = ProblemType(
            category_id=cat.id,
            code="sparking",
            name="Sparking Outlet",
            safety_instructions="Turn off main breaker immediately."
        )
        db.session.add(prob)
        db.session.flush()

        # Setup nearby technician
        u = User(email="tech@fixnearby.local", full_name="Omkar Shinde", phone="+919822999999", role="technician")
        u.set_password("Pass@123")
        db.session.add(u)
        db.session.flush()

        t = Technician(
            user_id=u.id,
            category_id=cat.id,
            badge_code="FN-55441",
            trade="Licensed Electrician",
            phone="+919822999999",
            whatsapp_number="+919822999999",
            rating=4.8,
            jobs_completed=25,
            operating_radius_km=15.0,
            is_on_duty=True,
            is_verified=True,
            current_latitude=16.7050,
            current_longitude=74.2433
        )
        db.session.add(t)
        db.session.flush()

        cred = Credential(
            technician_id=t.id,
            legal_name="Omkar Shinde",
            identity_verified=True,
            license_verified=True,
            address_verified=True,
            police_verified=True
        )
        db.session.add(cred)
        db.session.commit()

        yield app.test_client(), cat.id, prob.id, t.id
        db.drop_all()

def test_create_emergency_request_and_assign(req_client):
    client, cat_id, prob_id, tech_id = req_client

    # 1. Submit emergency request
    res = client.post("/api/v1/requests", json={
        "categoryId": cat_id,
        "problemTypeId": prob_id,
        "severity": "CRITICAL",
        "customerName": "Pooja Deshmukh",
        "customerPhone": "+919811223344",
        "customerAddress": "Shahupuri, Kolhapur",
        "customerLatitude": 16.7040,
        "customerLongitude": 74.2420
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    req_id = data["data"]["request"]["id"]
    assert req_id is not None
    assert data["data"]["candidatesFound"] >= 1

    # 2. Assign technician
    assign_res = client.patch(f"/api/v1/requests/{req_id}/assign", json={
        "technicianId": tech_id
    })
    assert assign_res.status_code == 200
    assign_data = assign_res.get_json()
    assert assign_data["data"]["request"]["status"] == "ASSIGNED"
    assert assign_data["data"]["request"]["assignedTechnicianId"] == tech_id

    # 3. Retrieve tracking status
    track_res = client.get(f"/api/v1/tracking/{req_id}")
    assert track_res.status_code == 200
    track_data = track_res.get_json()["data"]
    assert track_data["status"] == "ASSIGNED"
    assert track_data["technician"]["badgeCode"] == "FN-55441"

