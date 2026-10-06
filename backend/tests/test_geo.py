from app.services.geo_service import haversine_distance_km, estimate_eta_minutes

def test_haversine_distance():
    # Distance between Kolhapur Shahupuri (16.7032, 74.2389) and Rajarampuri (16.6945, 74.2481)
    dist = haversine_distance_km(16.7032, 74.2389, 16.6945, 74.2481)
    # Expected distance is approx 1.3 - 1.5 km
    assert 1.0 <= dist <= 2.0

def test_estimate_eta():
    # For a distance of 3 km at 30 km/h: 6 min travel + 3 min prep = ~9 mins
    eta = estimate_eta_minutes(3.0, avg_speed_kmh=30.0, prep_time_min=3)
    assert eta == 9

    # For 0 km, minimum prep time should be returned
    assert estimate_eta_minutes(0.0) == 3

