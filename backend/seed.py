from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(models.Product).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    # 1. Seed Products
    products = [
        models.Product(name="Ergonomic Office Chair", sku="FUR-001", category="Furniture", description="Premium mesh office chair with lumbar support", price=199.99, quantity_in_stock=45, threshold=10, supplier_name="Nexus Corp", supplier_part_number="NC-OC-202"),
        models.Product(name="Mechanical Keyboard", sku="PER-002", category="Peripherals", description="RGB mechanical keyboard with brown switches", price=89.50, quantity_in_stock=120, threshold=20, supplier_name="TechSupply Inc", supplier_part_number="TS-MK-11"),
        models.Product(name="27-inch 4K Monitor", sku="DSP-003", category="Hardware", description="Ultra HD IPS monitor, 60Hz", price=349.00, quantity_in_stock=8, threshold=15, supplier_name="Nexus Corp", supplier_part_number="NC-4KM"),
        models.Product(name="Wireless Mouse", sku="PER-004", category="Peripherals", description="Ergonomic wireless mouse with 6 buttons", price=45.00, quantity_in_stock=2, threshold=10, supplier_name="TechSupply Inc", supplier_part_number="TS-WM-05"),
        models.Product(name="USB-C Hub", sku="ACC-005", category="Accessories", description="7-in-1 USB-C hub with HDMI and SD card reader", price=29.99, quantity_in_stock=200, threshold=50, supplier_name="Nexus Corp", supplier_part_number="NC-UH-7"),
        models.Product(name="Standing Desk", sku="FUR-006", category="Furniture", description="Adjustable height electric standing desk", price=499.00, quantity_in_stock=15, threshold=5, supplier_name="FurniCo", supplier_part_number="FC-SD-1"),
        models.Product(name="Noise Cancelling Headphones", sku="AUD-007", category="Audio", description="Over-ear wireless ANC headphones", price=159.99, quantity_in_stock=4, threshold=10, supplier_name="AudioTech", supplier_part_number="AT-NC-2"),
    ]
    db.add_all(products)
    db.commit()

    # 2. Seed Customers
    customers = [
        models.Customer(full_name="Rahul Sharma", email="rahul.s@example.com", phone_number="+91-9876543210"),
        models.Customer(full_name="Priya Patel", email="priya.p@example.com", phone_number="+91-9876543211"),
        models.Customer(full_name="Amit Singh", email="amit.s@example.com", phone_number="+91-9876543212"),
        models.Customer(full_name="Neha Gupta", email="neha.g@example.com", phone_number="+91-9876543213"),
        models.Customer(full_name="Rohan Desai", email="rohan.d@example.com", phone_number="+91-9876543214"),
    ]
    db.add_all(customers)
    db.commit()

    # 3. Seed Notifications
    notifications = [
        models.Notification(type="Inventory", title="Low Stock Alert: 27-inch 4K Monitor", message="Inventory has dropped to 8 units. Threshold is 15."),
        models.Notification(type="Inventory", title="Critical Stock: Wireless Mouse", message="Inventory has dropped to 2 units. Threshold is 10."),
        models.Notification(type="System", title="System Update Completed", message="Backend API successfully updated to v2.1.0"),
        models.Notification(type="Orders", title="Large Order Received", message="Customer Rahul Sharma just placed an order totaling ₹1,496.00"),
    ]
    db.add_all(notifications)
    db.commit()

    print("Database seeding completed!")
    db.close()

if __name__ == "__main__":
    seed()
