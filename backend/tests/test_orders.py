import pytest
from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["db"] == "connected"

def test_create_order_success(client: TestClient):
    # Create customer
    c_res = client.post("/api/v1/customers", json={"full_name": "Test User", "email": "test1@example.com"})
    assert c_res.status_code == 201
    c_id = c_res.json()["id"]

    # Create product
    p_res = client.post("/api/v1/products", json={"name": "Widget", "sku": "WIDGET-1", "price": 10.0, "quantity_in_stock": 50})
    assert p_res.status_code == 201
    p_id = p_res.json()["id"]

    # Create order
    o_res = client.post("/api/v1/orders", headers={"Idempotency-Key": "test-key-1"}, json={
        "customer_id": c_id,
        "items": [{"product_id": p_id, "quantity": 10}]
    })
    assert o_res.status_code == 201
    assert o_res.json()["total_amount"] == 100.0

    # Verify stock deducted
    p_res2 = client.get(f"/api/v1/products/{p_id}")
    assert p_res2.json()["quantity_in_stock"] == 40
    assert p_res2.json()["version"] == 2

def test_create_order_insufficient_stock(client: TestClient):
    # Create customer
    c_res = client.post("/api/v1/customers", json={"full_name": "Test User", "email": "test2@example.com"})
    c_id = c_res.json()["id"]

    # Create product with 5 stock
    p_res = client.post("/api/v1/products", json={"name": "Widget", "sku": "WIDGET-2", "price": 10.0, "quantity_in_stock": 5})
    p_id = p_res.json()["id"]

    # Try to order 10
    o_res = client.post("/api/v1/orders", headers={"Idempotency-Key": "test-key-2"}, json={
        "customer_id": c_id,
        "items": [{"product_id": p_id, "quantity": 10}]
    })
    assert o_res.status_code == 400
    assert "Insufficient stock" in o_res.json()["detail"]

def test_create_order_occ_conflict(client: TestClient, db_session):
    # Setup
    c_res = client.post("/api/v1/customers", json={"full_name": "Test User", "email": "test3@example.com"})
    c_id = c_res.json()["id"]
    p_res = client.post("/api/v1/products", json={"name": "Widget", "sku": "WIDGET-3", "price": 10.0, "quantity_in_stock": 100})
    p_id = p_res.json()["id"]

    # Instead of mocking, we can use a small trick:
    # We patch `db.execute` to first run a real UPDATE that changes the version right before it executes the OCC UPDATE.
    # This simulates a race condition perfectly!
    
    from unittest.mock import patch
    from sqlalchemy import text
    
    original_execute = db_session.execute
    
    def fake_execute(statement, *args, **kwargs):
        if "UPDATE products SET quantity_in_stock" in str(statement):
            # Execute the real query to keep session state valid
            original_execute(statement, *args, **kwargs)
            # But return a mock result to simulate OCC conflict (rowcount=0)
            class MockResult:
                rowcount = 0
            return MockResult()
        return original_execute(statement, *args, **kwargs)

    with patch.object(db_session, 'execute', side_effect=fake_execute):
        o_res = client.post("/api/v1/orders", headers={"Idempotency-Key": "test-key-3"}, json={
            "customer_id": c_id,
            "items": [{"product_id": p_id, "quantity": 10}]
        })
        
    assert o_res.status_code == 409
    assert "Concurrency collision" in o_res.json()["detail"]
