from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from logger import logger

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if existing:
        logger.warning(f"Product with SKU {product.sku} already exists")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")
    
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    logger.info(f"Product created with id: {new_product.id}")
    return new_product

@router.get("", response_model=List[schemas.ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@router.get("/{id}", response_model=schemas.ProductResponse)
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product

@router.put("/{id}", response_model=schemas.ProductResponse)
def update_product(id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    
    # Increment version to help OCC on products
    product.version += 1
    
    db.commit()
    db.refresh(product)
    logger.info(f"Product updated: {id}")
    return product

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    db.delete(product)
    db.commit()
    logger.info(f"Product deleted: {id}")

@router.get("/{id}/history", response_model=List[schemas.InventoryAuditLogResponse])
def get_product_history(id: int, db: Session = Depends(get_db)):
    history = db.query(models.InventoryAuditLog).filter(models.InventoryAuditLog.product_id == id).order_by(models.InventoryAuditLog.timestamp.desc()).all()
    return history
