def test_create_product(client):
    response = client.post("/api/v1/products", json={
        "name": "Test Product",
        "sku": "TEST-123",
        "price": 99.99,
        "quantity_in_stock": 50,
        "threshold": 10
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Product"
    assert data["sku"] == "TEST-123"
    assert data["id"] is not None

def test_get_products(client):
    client.post("/api/v1/products", json={
        "name": "Test Product",
        "sku": "TEST-124",
        "price": 99.99,
        "quantity_in_stock": 50,
        "threshold": 10
    })
    
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_update_product(client):
    post_res = client.post("/api/v1/products", json={
        "name": "Test Product",
        "sku": "TEST-125",
        "price": 99.99,
        "quantity_in_stock": 50,
        "threshold": 10
    })
    product_id = post_res.json()["id"]
    
    response = client.put(f"/api/v1/products/{product_id}", json={
        "name": "Updated Product",
        "sku": "TEST-125",
        "price": 100.00,
        "quantity_in_stock": 20,
        "threshold": 5
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Product"

def test_delete_product(client):
    post_res = client.post("/api/v1/products", json={
        "name": "To Be Deleted",
        "sku": "DEL-123",
        "price": 10.00,
        "quantity_in_stock": 10,
        "threshold": 5
    })
    product_id = post_res.json()["id"]
    
    delete_res = client.delete(f"/api/v1/products/{product_id}")
    assert delete_res.status_code == 204
    
    get_res = client.get(f"/api/v1/products/{product_id}")
    assert get_res.status_code == 404
