from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from logger import logger

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[schemas.NotificationResponse])
def get_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    notifications = db.query(models.Notification).order_by(models.Notification.timestamp.desc()).offset(skip).limit(limit).all()
    return notifications

@router.post("", response_model=schemas.NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    new_notification = models.Notification(
        type=notification.type,
        title=notification.title,
        message=notification.message
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification

@router.post("/mark-all-read", status_code=status.HTTP_200_OK)
def mark_all_read(db: Session = Depends(get_db)):
    db.query(models.Notification).filter(models.Notification.is_read == 0).update({"is_read": 1})
    db.commit()
    return {"status": "ok"}
