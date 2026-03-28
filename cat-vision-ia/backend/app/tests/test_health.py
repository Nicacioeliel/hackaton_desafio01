from fastapi.testclient import TestClient

from app.main import create_app


def test_health_root():
    app = create_app()
    with TestClient(app) as client:
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"
