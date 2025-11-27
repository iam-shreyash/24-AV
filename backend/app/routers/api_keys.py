"""
API Key Management Router
Allows admins to view and update API keys securely.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..services.key_manager import KeyManager
from ..services.key_encryption import KeyEncryptionService


router = APIRouter()


@router.get("/", response_model=list[schemas.ApiKeyRead])
def list_api_keys(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> list[schemas.ApiKeyRead]:
    """List all API keys (admin only). Values are never returned."""
    api_keys = db.query(models.ApiKey).order_by(models.ApiKey.key_name).all()
    return [schemas.ApiKeyRead.model_validate(key) for key in api_keys]


@router.get("/{key_name}", response_model=schemas.ApiKeyRead)
def get_api_key(
    key_name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> schemas.ApiKeyRead:
    """Get a specific API key by name (admin only). Value is never returned."""
    api_key = db.query(models.ApiKey).filter(models.ApiKey.key_name == key_name).first()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key '{key_name}' not found"
        )
    return schemas.ApiKeyRead.model_validate(api_key)


@router.get("/{key_name}/value")
def get_api_key_value(
    key_name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """
    Get the decrypted value of an API key (admin only).
    This endpoint is for admin UI to display/edit keys.
    """
    api_key = db.query(models.ApiKey).filter(models.ApiKey.key_name == key_name).first()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key '{key_name}' not found"
        )
    
    try:
        decrypted_value = KeyEncryptionService.decrypt(api_key.encrypted_value)
        return {"key_name": key_name, "value": decrypted_value}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to decrypt key: {str(e)}"
        )


@router.post("/", response_model=schemas.ApiKeyRead, status_code=status.HTTP_201_CREATED)
def create_api_key(
    payload: schemas.ApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> schemas.ApiKeyRead:
    """Create a new API key (admin only)."""
    # Check if key already exists
    existing = db.query(models.ApiKey).filter(
        models.ApiKey.key_name == payload.key_name
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"API key '{payload.key_name}' already exists"
        )
    
    # Encrypt the value
    try:
        encrypted_value = KeyEncryptionService.encrypt(payload.value)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to encrypt API key: {str(e)}"
        )
    
    api_key = models.ApiKey(
        key_name=payload.key_name,
        encrypted_value=encrypted_value,
        description=payload.description,
        is_active=payload.is_active,
        updated_by=current_user.id
    )
    
    try:
        db.add(api_key)
        db.commit()
        db.refresh(api_key)
        
        # Update KeyManager cache
        KeyManager.set(payload.key_name, payload.value, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save API key: {str(e)}"
        )
    
    return schemas.ApiKeyRead.model_validate(api_key)


@router.patch("/{key_name}", response_model=schemas.ApiKeyRead)
def update_api_key(
    key_name: str,
    payload: schemas.ApiKeyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
) -> schemas.ApiKeyRead:
    """Update an existing API key (admin only)."""
    api_key = db.query(models.ApiKey).filter(
        models.ApiKey.key_name == key_name
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key '{key_name}' not found"
        )
    
    # Update value if provided
    if payload.value is not None:
        try:
            api_key.encrypted_value = KeyEncryptionService.encrypt(payload.value)
            # Update KeyManager cache
            KeyManager.set(key_name, payload.value, db)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to encrypt API key: {str(e)}"
            )
    
    # Update other fields
    if payload.description is not None:
        api_key.description = payload.description
    if payload.is_active is not None:
        api_key.is_active = payload.is_active
    
    api_key.updated_by = current_user.id
    
    try:
        db.commit()
        db.refresh(api_key)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update API key in database: {str(e)}"
        )
    
    return schemas.ApiKeyRead.model_validate(api_key)


@router.delete("/{key_name}", status_code=status.HTTP_204_NO_CONTENT)
def delete_api_key(
    key_name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Delete an API key (admin only)."""
    api_key = db.query(models.ApiKey).filter(
        models.ApiKey.key_name == key_name
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key '{key_name}' not found"
        )
    
    db.delete(api_key)
    db.commit()
    
    # Remove from KeyManager cache
    if key_name in KeyManager._cache:
        del KeyManager._cache[key_name]
    
    return None


@router.post("/reload", status_code=status.HTTP_200_OK)
def reload_keys(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Reload all API keys from database into KeyManager cache (admin only)."""
    KeyManager.reload(db)
    return {"message": "Keys reloaded successfully"}

