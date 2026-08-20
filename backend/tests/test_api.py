from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_golden_demo_api_flow() -> None:
    sample = client.post("/api/v1/datasets/sample", json={"sample_key": "demo-central-01"})
    assert sample.status_code == 201
    assert len(sample.json()["trains"]) == 10

    diagram = client.get("/api/v1/datasets/demo-central-01/diagram")
    assert diagram.status_code == 200
    assert len(diagram.json()["trains"]) == 10

    analysis = client.post(
        "/api/v1/analyses/conflicts", json={"dataset_id": "demo-central-01"}
    )
    assert analysis.status_code == 200
    body = analysis.json()
    assert body["metrics"]["conflict_count"] > 0
    assert client.get(f"/api/v1/reports/{body['run_id']}.csv").status_code == 200

    simulation = client.post(
        "/api/v1/simulations/delay",
        json={"dataset_id": "demo-central-01", "train_id": "g101", "delay_sec": 480},
    )
    assert simulation.status_code == 200
    assert simulation.json()["metrics"]["affected_train_count"] >= 3


def test_api_error_uses_uniform_chinese_payload() -> None:
    response = client.get("/api/v1/datasets/not-found")

    assert response.status_code == 404
    assert response.json()["message"] == "数据集不存在"
    assert response.json()["request_id"]
