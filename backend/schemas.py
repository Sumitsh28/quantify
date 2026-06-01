from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    quantity_in_stock: int = Field(default=0, ge=0)
    category: Optional[str] = None
    description: Optional[str] = None
    threshold: int = Field(default=10, ge=0)
    supplier_name: Optional[str] = None
    supplier_part_number: Optional[str] = None
    visibility_status: str = Field(default="Active")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, ge=0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)
    category: Optional[str] = None
    description: Optional[str] = None
    threshold: Optional[int] = Field(None, ge=0)
    supplier_name: Optional[str] = None
    supplier_part_number: Optional[str] = None
    visibility_status: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    version: int

    class Config:
        from_attributes = True

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    phone_number: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)
    shipping: float = Field(default=0.0, ge=0)
    tax: float = Field(default=0.0, ge=0)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity_ordered: int

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    subtotal: float
    shipping: float
    tax: float
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationBase(BaseModel):
    type: str
    title: str
    message: str

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    is_read: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Audit Log Schema ---
class InventoryAuditLogResponse(BaseModel):
    id: int
    product_id: int
    old_qty: int
    new_qty: int
    timestamp: datetime
    reason: Optional[str]

    class Config:
        from_attributes = True
