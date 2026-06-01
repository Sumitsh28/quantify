from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from logger import logger

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if existing:
        logger.warning(f"Customer with email {customer.email} already exists")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
    
    new_customer = models.Customer(**customer.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    logger.info(f"Customer created with id: {new_customer.id}")
    return new_customer

@router.get("", response_model=List[schemas.CustomerResponse])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    customers = db.query(models.Customer).offset(skip).limit(limit).all()
    return customers

@router.get("/{id}", response_model=schemas.CustomerResponse)
def get_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    # Check if customer has existing orders
    existing_orders = db.query(models.Order).filter(models.Order.customer_id == id).first()
    if existing_orders:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete customer with existing orders. Please delete their orders first.")
    
    db.delete(customer)
    db.commit()
    logger.info(f"Customer deleted: {id}")
