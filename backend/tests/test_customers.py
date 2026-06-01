def test_create_customer(client):
    response = client.post("/api/v1/customers", json={
        "full_name": "Alice Smith",
        "email": "alice@example.com",
        "phone": "555-1234"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Alice Smith"
    assert data["id"] is not None

def test_get_customers(client):
    client.post("/api/v1/customers", json={
        "full_name": "Bob Jones",
        "email": "bob@example.com",
    })
    
    response = client.get("/api/v1/customers")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_delete_customer(client):
    post_res = client.post("/api/v1/customers", json={
        "full_name": "Charlie",
        "email": "charlie@example.com",
    })
    customer_id = post_res.json()["id"]
    
    delete_res = client.delete(f"/api/v1/customers/{customer_id}")
    assert delete_res.status_code == 204
    
    get_res = client.get(f"/api/v1/customers/{customer_id}")
    assert get_res.status_code == 404

def test_delete_customer_with_orders(client):
    # Create customer
    post_res = client.post("/api/v1/customers", json={
        "full_name": "Dave",
        "email": "dave@example.com",
    })
    customer_id = post_res.json()["id"]
    
    # Create product
    prod_res = client.post("/api/v1/products", json={
        "name": "Prod", "sku": "P1", "price": 10.0, "quantity_in_stock": 100
    })
    product_id = prod_res.json()["id"]
    
    # Create order
    client.post("/api/v1/orders", headers={"Idempotency-Key": "testkey2"}, json={
        "customer_id": customer_id,
        "items": [
            {"product_id": product_id, "quantity": 1, "unit_price": 10.0}
        ],
        "shipping": 0,
        "tax": 0
    })
    
    # Try deleting customer
    delete_res = client.delete(f"/api/v1/customers/{customer_id}")
    assert delete_res.status_code == 400
