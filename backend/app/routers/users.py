import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..security import hash_password

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/me", response_model=schemas.UserRead)
def get_current_user_info(
    current_user: models.User = Depends(get_current_user),
) -> schemas.UserRead:
    """Get current authenticated user's information"""
    return schemas.UserRead.model_validate(current_user)


@router.get("/", response_model=list[schemas.UserRead])
def list_users(
    role: str | None = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> list[schemas.UserRead]:
    """List all users, optionally filtered by role. Admin only."""
    try:
        query = db.query(models.User)
        if role:
            try:
                role_enum = models.UserRole(role.lower())
                query = query.filter(models.User.role == role_enum)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid role. Must be one of: {[r.value for r in models.UserRole]}"
                )
        users = query.order_by(models.User.created_at.desc()).all()

        # Validate each user and skip invalid ones with logging
        result = []
        for user in users:
            try:
                user_data = schemas.UserRead.model_validate(user)
                result.append(user_data)
            except Exception as e:
                # Log the error but continue processing other users
                logger.error(
                    f"Error validating user {user.id} (email: {user.email}): {e}",
                    exc_info=True,
                )
                # Skip invalid users instead of failing the entire request
                continue

        return result
    except HTTPException:
        # Re-raise HTTP exceptions (like invalid role)
        raise
    except Exception as e:
        # Catch any other unexpected errors
        logger.error(f"Error in list_users endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load users: {str(e)}",
        )


@router.patch("/me", response_model=schemas.UserRead)
def update_current_user(
    payload: schemas.UserBase,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> schemas.UserRead:
    """Update current user's information"""
    if payload.email != current_user.email:
        # Check if email is already taken
        existing = db.query(models.User).filter(
            models.User.email == payload.email,
            models.User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    current_user.email = payload.email
    current_user.full_name = payload.full_name
    db.commit()
    db.refresh(current_user)
    return schemas.UserRead.model_validate(current_user)


@router.patch("/{user_id}", response_model=schemas.UserRead)
def update_user(
    user_id: int,
    payload: schemas.UserBase,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> schemas.UserRead:
    """Update any user's information (admin only)"""
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Check if email is already taken by another user
    if payload.email != user.email:
        existing = db.query(models.User).filter(
            models.User.email == payload.email,
            models.User.id != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    user.email = payload.email
    user.full_name = payload.full_name
    db.commit()
    db.refresh(user)
    return schemas.UserRead.model_validate(user)


@router.patch("/{user_id}/status", response_model=schemas.UserRead)
def update_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> schemas.UserRead:
    """Activate or deactivate a user (admin only)"""
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return schemas.UserRead.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> dict:
    """Delete a user from the system (admin only). This will cascade delete vendor profiles, bookings, etc."""
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account"
        )
    
    # Store user info for logging
    user_email = user.email
    user_role = user.role.value
    
    # Delete the user (cascade will handle vendor, bookings, etc. due to ondelete="CASCADE" in models)
    db.delete(user)
    db.commit()
    
    # Verify deletion was successful
    deleted_user = db.get(models.User, user_id)
    if deleted_user is not None:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user from database"
        )
    
    return {
        "success": True,
        "message": "User account deleted successfully"
    }


class PasswordResetRequest(BaseModel):
    new_password: str


@router.patch("/{user_id}/reset-password", status_code=status.HTTP_200_OK)
def reset_user_password(
    user_id: int,
    payload: PasswordResetRequest,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> dict:
    """Reset a user's password (admin only)"""
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "message": "Password reset successfully"
    }