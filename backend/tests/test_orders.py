def test_create_order(client):
    # Setup customer and product
    cust_res = client.post("/api/v1/customers", json={"full_name": "Test Cust", "email": "tc@tc.com"})
    cust_id = cust_res.json()["id"]
    
    prod_res = client.post("/api/v1/products", json={"name": "Prod", "sku": "SKU1", "price": 10.0, "quantity_in_stock": 50})
    prod_id = prod_res.json()["id"]
    
    # Create order
    order_res = client.post("/api/v1/orders", headers={"Idempotency-Key": "testkey3"}, json={
        "customer_id": cust_id,
        "items": [
            {"product_id": prod_id, "quantity": 5, "unit_price": 10.0}
        ],
        "shipping": 0,
        "tax": 0
    })
    
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["total_amount"] == 50.0
    assert len(order_data["items"]) == 1
    
    # Verify stock was decremented
    prod_check = client.get(f"/api/v1/products/{prod_id}")
    assert prod_check.json()["quantity_in_stock"] == 45

def test_create_order_insufficient_stock(client):
    cust_res = client.post("/api/v1/customers", json={"full_name": "Test Cust 2", "email": "tc2@tc.com"})
    cust_id = cust_res.json()["id"]
    
    prod_res = client.post("/api/v1/products", json={"name": "Prod 2", "sku": "SKU2", "price": 10.0, "quantity_in_stock": 5})
    prod_id = prod_res.json()["id"]
    
    order_res = client.post("/api/v1/orders", headers={"Idempotency-Key": "testkey4"}, json={
        "customer_id": cust_id,
        "items": [
            {"product_id": prod_id, "quantity": 10, "unit_price": 10.0}
        ],
        "shipping": 0,
        "tax": 0
    })
    
    assert order_res.status_code == 400
    assert "Insufficient stock" in order_res.json()["detail"]

def test_dashboard_metrics(client):
    # Verify the endpoint returns 200 and required fields
    res = client.get("/api/v1/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "total_products" in data
    assert "total_customers" in data
    assert "total_orders" in data
    assert "low_stock_count" in data
