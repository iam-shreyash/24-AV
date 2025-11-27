from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user


router = APIRouter()


@router.post("/{booking_id}", response_model=schemas.PaymentRead, status_code=status.HTTP_201_CREATED)
def capture_payment(
    booking_id: int,
    payload: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.PaymentRead:
    booking = db.get(models.Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if current_user.role == models.UserRole.PASSENGER and booking.passenger_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot pay for another passenger")

    payment = models.Payment(
        booking_id=booking.id,
        provider=payload.provider,
        provider_reference="demo-provider-ref",
        amount=payload.amount,
        currency=payload.currency,
        status="captured",
    )
    booking.status = models.BookingStatus.CONFIRMED
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return schemas.PaymentRead.model_validate(payment)


@router.post("/{booking_id}/refund", response_model=schemas.PaymentRead)
def refund_payment(
    booking_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
) -> schemas.PaymentRead:
    payment = db.query(models.Payment).filter(models.Payment.booking_id == booking_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    payment.status = "refunded"
    payment.refund_reference = "demo-refund"
    booking = payment.booking
    booking.status = models.BookingStatus.REFUNDED
    db.commit()
    db.refresh(payment)
    return schemas.PaymentRead.model_validate(payment)

