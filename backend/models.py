from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    price = Column(Float, nullable=False)
    quantity_in_stock = Column(Integer, nullable=False, server_default="0")
    version = Column(Integer, nullable=False, server_default="1")
    
    # New UI fields
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    threshold = Column(Integer, nullable=False, server_default="10")
    supplier_name = Column(String, nullable=True)
    supplier_part_number = Column(String, nullable=True)
    visibility_status = Column(String, nullable=False, server_default="Active")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=True)

    orders = relationship("Order", back_populates="customer")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    subtotal = Column(Float, nullable=False, server_default="0.0")
    shipping = Column(Float, nullable=False, server_default="0.0")
    tax = Column(Float, nullable=False, server_default="0.0")
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=text("CURRENT_TIMESTAMP"))

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity_ordered = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # e.g. 'Inventory', 'Orders', 'System'
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Integer, nullable=False, server_default="0") # Boolean stored as Int 0/1
    timestamp = Column(DateTime, default=datetime.utcnow, server_default=text("CURRENT_TIMESTAMP"))

class InventoryAuditLog(Base):
    __tablename__ = "inventory_audit_log"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    old_qty = Column(Integer, nullable=False)
    new_qty = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, server_default=text("CURRENT_TIMESTAMP"))
    reason = Column(String, nullable=True)

    product = relationship("Product")
