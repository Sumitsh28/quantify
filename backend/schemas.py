from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    quantity_in_stock: int = Field(default=0, ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, ge=0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)

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

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity_ordered: int

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]

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
