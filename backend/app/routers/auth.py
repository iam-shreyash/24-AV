from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import create_access_token, hash_password, verify_password


router = APIRouter()


@router.post("/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register_user(payload: schemas.UserCreate, db: Session = Depends(get_db)) -> schemas.UserRead:
    try:
        # Prevent admin registration through public endpoint
        if payload.role == models.UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin accounts cannot be created through public registration"
            )
        
        existing = db.query(models.User).filter(models.User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user = models.User(
            email=payload.email,
            full_name=payload.full_name,
            role=payload.role,
            hashed_password=hash_password(payload.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # If vendor, create vendor record with pending status
        if payload.role == models.UserRole.VENDOR:
            try:
                vendor = models.Vendor(
                    user_id=user.id,
                    company_name="Pending Application",  # Will be updated in vendor application
                    approval_status="pending"
                )
                db.add(vendor)
                db.commit()
                db.refresh(vendor)
            except Exception as e:
                db.rollback()
                # Log the full error for debugging
                import logging
                import traceback
                error_trace = traceback.format_exc()
                logging.error(f"Error creating vendor record: {e}\n{error_trace}")
                # Return detailed error message
                error_msg = str(e)
                if "column" in error_msg.lower() and "does not exist" in error_msg.lower():
                    error_msg = "Database schema mismatch. Please run: python migrate_all_vendor_columns.py"
                elif "duplicate key" in error_msg.lower() or "unique constraint" in error_msg.lower():
                    error_msg = "Vendor record already exists for this user"
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create vendor record: {error_msg}"
                )
        
        return schemas.UserRead.model_validate(user)
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Catch any other unexpected errors
        import logging
        import traceback
        error_trace = traceback.format_exc()
        logging.error(f"Unexpected error during registration: {e}\n{error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> schemas.Token:
    try:
        print(f"Login attempt for: {form_data.username}")
        user = db.query(models.User).filter(models.User.email == form_data.username).first()
        if not user:
            print(f"User not found: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account not found. Please create an account to continue."
            )
        
        if not verify_password(form_data.password, user.hashed_password):
            print(f"Invalid password for: {form_data.username}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

        # Check if user account is deactivated
        if not user.is_active:
            print(f"User deactivated: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is deactivated. Please contact admin."
            )

        # Additional check for vendor account deactivation
        if user.role == models.UserRole.VENDOR:
            vendor = db.query(models.Vendor).filter(models.Vendor.user_id == user.id).first()
            if vendor and not vendor.is_active:
                print(f"Vendor deactivated: {form_data.username}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your vendor account is deactivated. Please contact admin."
                )

        # Allow all vendors to login regardless of approval status
        # Rejected vendors can log in to reapply for vendor application
        # Approval status will be checked on frontend to redirect appropriately

        access_token, expires_in = create_access_token(subject=user.id, role=user.role.value)
        print(f"Login successful for: {form_data.username}")
        return schemas.Token(access_token=access_token, expires_in=expires_in, role=user.role)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

