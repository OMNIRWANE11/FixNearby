import pytest
from app import create_app
from app.extensions import db

@pytest.fixture
def client():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

def test_user_registration_and_login(client):
    # Register customer
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "sunil@example.com",
        "password": "Password@123",
        "fullName": "Sunil Patil",
        "phone": "+919876543210",
        "role": "customer"
    })
    assert reg_res.status_code == 201
    data = reg_res.get_json()
    assert data["success"] is True
    assert "token" in data["data"]
    assert data["data"]["user"]["email"] == "sunil@example.com"

    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "sunil@example.com",
        "password": "Password@123"
    })
    assert login_res.status_code == 200
    login_data = login_res.get_json()
    assert login_data["success"] is True
    token = login_data["data"]["token"]

    # Access /auth/me
    me_res = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert me_res.status_code == 200
    me_data = me_res.get_json()
    assert me_data["data"]["fullName"] == "Sunil Patil"

def test_login_invalid_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "user@example.com",
        "password": "CorrectPassword123",
        "fullName": "User One",
        "phone": "+919876543211"
    })
    res = client.post("/api/v1/auth/login", json={
        "email": "user@example.com",
        "password": "WrongPassword"
    })
    assert res.status_code == 401
    assert res.get_json()["success"] is False

