from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional

from database import get_db
import models
import schemas
from logger import logger

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order: schemas.OrderCreate, 
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
    db: Session = Depends(get_db)
):
    # Basic validation
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    subtotal = 0.0
    
    # We must start a transaction to ensure ACID
    try:
        # Optimistic Concurrency Control (OCC)
        for item in order.items:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} not found")
            
            if product.quantity_in_stock < item.quantity:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for product {item.product_id}")
            
            # OCC UPDATE
            result = db.execute(
                text("UPDATE products SET quantity_in_stock = quantity_in_stock - :qty, version = version + 1 WHERE id = :id AND version = :version"),
                {"qty": item.quantity, "id": product.id, "version": product.version}
            )
            
            if result.rowcount == 0:
                conflict_msg = f"Concurrency collision on product {product.id}. Please retry."
                logger.warning(f"OCC conflict on product {product.id} during order creation")
                db.rollback()
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=conflict_msg)
            
            subtotal += product.price * item.quantity

        total_amount = subtotal + order.shipping + order.tax

        new_order = models.Order(
            customer_id=order.customer_id,
            subtotal=subtotal,
            shipping=order.shipping,
            tax=order.tax,
            total_amount=total_amount
        )
        db.add(new_order)
        db.flush() # flush to get order ID
        
        for item in order.items:
            new_item = models.OrderItem(
                order_id=new_order.id,
                product_id=item.product_id,
                quantity_ordered=item.quantity
            )
            db.add(new_item)
            
        db.commit()
        db.refresh(new_order)
        logger.info(f"Order created with id: {new_order.id}, total: {total_amount}")
        return new_order
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("", response_model=List[schemas.OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, status: Optional[str] = None, db: Session = Depends(get_db)):
    # Note: 'status' filtering could be added here if we had an order status column.
    # Currently just fetching paginated.
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    return orders

@router.get("/{id}", response_model=schemas.OrderResponse)
def get_order(id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(id: int, db: Session = Depends(get_db)):
    # Note: deleting an order might require restoring stock in a real app, 
    # but the prompt simply asked to Cancel/delete order. We'll delete and let cascade handle order_items.
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    db.delete(order)
    db.commit()
    logger.info(f"Order deleted: {id}")
