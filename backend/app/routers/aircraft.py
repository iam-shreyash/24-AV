import json
import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_role

router = APIRouter()

# Create uploads directory for aircraft images
AIRCRAFT_IMAGES_DIR = Path("uploads/aircraft_images")
AIRCRAFT_IMAGES_DIR.mkdir(parents=True, exist_ok=True)


async def save_aircraft_image(file: UploadFile, aircraft_id: int, image_type: str) -> str:
    """Save an aircraft image file and return the relative path"""
    # Generate unique filename
    file_ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"aircraft_{aircraft_id}_{image_type}_{os.urandom(8).hex()}{file_ext}"
    file_path = AIRCRAFT_IMAGES_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Return relative path for storage in database
    return f"/uploads/aircraft_images/{filename}"


@router.post("/", response_model=schemas.PlaneRead, status_code=status.HTTP_201_CREATED)
async def create_aircraft(
    aircraft_name: Optional[str] = Form(default=None),
    manufacturer: Optional[str] = Form(default=None),
    model: str = Form(...),
    model_number: Optional[str] = Form(default=None),
    year_of_manufacture: Optional[int] = Form(default=None),
    registration_number: str = Form(...),
    seat_capacity: int = Form(...),
    luggage_load_kg: Optional[float] = Form(default=None),
    maximum_speed: Optional[float] = Form(default=None),
    speed_unit: Optional[str] = Form(default=None),
    range_km: Optional[float] = Form(default=None),
    wifi_available: bool = Form(default=False),
    wifi_type: Optional[str] = Form(default=None),
    dining_service: bool = Form(default=False),
    entertainment_system: bool = Form(default=False),
    pet_onboard_allowed: bool = Form(default=False),
    air_conditioning: bool = Form(default=False),
    other_amenities: Optional[str] = Form(default=None),  # JSON string array
    amenities: Optional[str] = Form(default=None),  # JSON string array
    exterior_image: Optional[UploadFile] = File(default=None),
    interior_image: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.PlaneRead:
    """Create a new aircraft for the vendor with optional image uploads"""
    if current_user.role != models.UserRole.VENDOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only vendors can create aircraft")
    
    if not current_user.vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor profile not found")
    
    # Check if registration number already exists for this vendor
    existing = db.query(models.Plane).filter(
        models.Plane.vendor_id == current_user.vendor.id,
        models.Plane.registration_number == registration_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aircraft with this registration number already exists"
        )
    
    # Parse amenities lists
    amenities_list = []
    if amenities:
        try:
            amenities_list = json.loads(amenities) if isinstance(amenities, str) else amenities
        except (json.JSONDecodeError, TypeError):
            amenities_list = []
    
    other_amenities_list = []
    if other_amenities:
        try:
            other_amenities_list = json.loads(other_amenities) if isinstance(other_amenities, str) else other_amenities
        except (json.JSONDecodeError, TypeError):
            other_amenities_list = []
    
    # Store extended fields in amenities as JSON
    extended_data = {
        "aircraft_name": aircraft_name,
        "manufacturer": manufacturer,
        "model_number": model_number,
        "year_of_manufacture": year_of_manufacture,
        "luggage_load_kg": luggage_load_kg,
        "maximum_speed": maximum_speed,
        "speed_unit": speed_unit,
        "range_km": range_km,
        "wifi_available": wifi_available,
        "wifi_type": wifi_type,
        "dining_service": dining_service,
        "entertainment_system": entertainment_system,
        "pet_onboard_allowed": pet_onboard_allowed,
        "air_conditioning": air_conditioning,
        "other_amenities": other_amenities_list,
        "amenities_list": amenities_list,
        "aircraft_images": []  # Will be populated after plane creation
    }
    
    # Check if any extended data exists (excluding None, empty strings, and empty lists)
    # Note: False is a valid value for boolean fields, so we include it
    has_extended_data = any(
        v is not None and v != "" and (not isinstance(v, list) or len(v) > 0)
        for v in extended_data.values()
    )
    
    try:
        plane = models.Plane(
            vendor_id=current_user.vendor.id,
            model=model,
            registration_number=registration_number,
            seat_capacity=seat_capacity,
            amenities=json.dumps(extended_data)
        )
        db.add(plane)
        db.commit()
        db.refresh(plane)
        
        # Upload and save aircraft images
        aircraft_images = []
        if exterior_image and exterior_image.filename:
            try:
                image_path = await save_aircraft_image(exterior_image, plane.id, "exterior")
                aircraft_images.append(image_path)
            except Exception as e:
                # Log error but don't fail the request
                print(f"Error saving exterior image: {e}")
        
        # Handle multiple interior images
        if interior_image:
            for idx, img in enumerate(interior_image):
                if img and img.filename:
                    try:
                        image_path = await save_aircraft_image(img, plane.id, f"interior_{idx}")
                        aircraft_images.append(image_path)
                    except Exception as e:
                        # Log error but don't fail the request
                        print(f"Error saving interior image {idx}: {e}")
        
        # Update amenities JSON with image paths
        if aircraft_images:
            extended_data["aircraft_images"] = aircraft_images
            plane.amenities = json.dumps(extended_data)
            db.commit()
            db.refresh(plane)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create aircraft: {str(e)}"
        )
    
    # Create response with extended data
    amenities_list = []
    if plane.amenities:
        try:
            extended = json.loads(plane.amenities)
            amenities_list = extended.get("amenities_list", [])
        except (json.JSONDecodeError, TypeError):
            amenities_list = []
    
    plane_dict = {
        "id": plane.id,
        "model": plane.model,
        "registration_number": plane.registration_number,
        "seat_capacity": plane.seat_capacity,
        "amenities": amenities_list
    }
    
    # Populate extended fields in response
    if plane.amenities:
        try:
            extended = json.loads(plane.amenities)
            plane_dict.update({
                "aircraft_name": extended.get("aircraft_name"),
                "manufacturer": extended.get("manufacturer"),
                "model_number": extended.get("model_number"),
                "year_of_manufacture": extended.get("year_of_manufacture"),
                "luggage_load_kg": extended.get("luggage_load_kg"),
                "maximum_speed": extended.get("maximum_speed"),
                "speed_unit": extended.get("speed_unit"),
                "range_km": extended.get("range_km"),
                "wifi_available": extended.get("wifi_available", False),
                "wifi_type": extended.get("wifi_type"),
                "dining_service": extended.get("dining_service", False),
                "entertainment_system": extended.get("entertainment_system", False),
                "pet_onboard_allowed": extended.get("pet_onboard_allowed", False),
                "air_conditioning": extended.get("air_conditioning", False),
                "other_amenities": extended.get("other_amenities", [])
            })
        except (json.JSONDecodeError, TypeError) as e:
            # If JSON parsing fails, just use base data
            pass
    
    return schemas.PlaneRead(**plane_dict)


@router.get("/images/{filename}")
async def get_aircraft_image(filename: str):
    """Serve aircraft images"""
    file_path = AIRCRAFT_IMAGES_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return FileResponse(file_path)


@router.get("/", response_model=list[schemas.PlaneRead])
def list_aircraft(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[schemas.PlaneRead]:
    """List all aircraft for the current vendor, or all aircraft if admin"""
    # Admin can see all aircraft, vendors can only see their own
    if current_user.role == models.UserRole.ADMIN:
        planes = db.query(models.Plane).all()
    elif current_user.role == models.UserRole.VENDOR:
        if not current_user.vendor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor profile not found")
        planes = db.query(models.Plane).filter(
            models.Plane.vendor_id == current_user.vendor.id
        ).all()
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    
    result = []
    for plane in planes:
        try:
            amenities_list = []
            plane_dict = {
                "id": plane.id,
                "vendor_id": plane.vendor_id,
                "model": plane.model,
                "registration_number": plane.registration_number,
                "seat_capacity": plane.seat_capacity,
                "amenities": []
            }
            
            if plane.amenities:
                try:
                    extended = json.loads(plane.amenities)
                    amenities_list = extended.get("amenities_list", [])
                    plane_dict.update({
                        "aircraft_name": extended.get("aircraft_name"),
                        "manufacturer": extended.get("manufacturer"),
                        "model_number": extended.get("model_number"),
                        "year_of_manufacture": extended.get("year_of_manufacture"),
                        "luggage_load_kg": extended.get("luggage_load_kg"),
                        "maximum_speed": extended.get("maximum_speed"),
                        "speed_unit": extended.get("speed_unit"),
                        "range_km": extended.get("range_km"),
                        "wifi_available": extended.get("wifi_available", False),
                        "wifi_type": extended.get("wifi_type"),
                        "dining_service": extended.get("dining_service", False),
                        "entertainment_system": extended.get("entertainment_system", False),
                        "pet_onboard_allowed": extended.get("pet_onboard_allowed", False),
                        "air_conditioning": extended.get("air_conditioning", False),
                        "other_amenities": extended.get("other_amenities", []),
                        "amenities": amenities_list,
                        "aircraft_images": extended.get("aircraft_images", [])
                    })
                except (json.JSONDecodeError, TypeError) as e:
                    # If JSON parsing fails, continue with base data
                    print(f"Warning: Failed to parse amenities for plane {plane.id}: {e}")
            
            result.append(schemas.PlaneRead(**plane_dict))
        except Exception as e:
            # Skip planes that fail to serialize
            print(f"Error serializing plane {plane.id}: {e}")
            continue
    
    return result


@router.get("/{aircraft_id}", response_model=schemas.PlaneRead)
def get_aircraft(
    aircraft_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.PlaneRead:
    """Get a specific aircraft"""
    plane = db.get(models.Plane, aircraft_id)
    if not plane:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aircraft not found")
    
    # Check if user has access to this aircraft
    if current_user.role == models.UserRole.VENDOR:
        if not current_user.vendor or plane.vendor_id != current_user.vendor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return schemas.PlaneRead.model_validate(plane)


@router.patch("/{aircraft_id}", response_model=schemas.PlaneRead)
async def update_aircraft(
    aircraft_id: int,
    aircraft_name: Optional[str] = Form(default=None),
    manufacturer: Optional[str] = Form(default=None),
    model: Optional[str] = Form(default=None),
    model_number: Optional[str] = Form(default=None),
    year_of_manufacture: Optional[int] = Form(default=None),
    registration_number: Optional[str] = Form(default=None),
    seat_capacity: Optional[int] = Form(default=None),
    luggage_load_kg: Optional[float] = Form(default=None),
    maximum_speed: Optional[float] = Form(default=None),
    speed_unit: Optional[str] = Form(default=None),
    range_km: Optional[float] = Form(default=None),
    wifi_available: Optional[bool] = Form(default=None),
    wifi_type: Optional[str] = Form(default=None),
    dining_service: Optional[bool] = Form(default=None),
    entertainment_system: Optional[bool] = Form(default=None),
    pet_onboard_allowed: Optional[bool] = Form(default=None),
    air_conditioning: Optional[bool] = Form(default=None),
    other_amenities: Optional[str] = Form(default=None),  # JSON string array
    amenities: Optional[str] = Form(default=None),  # JSON string array
    exterior_image: Optional[UploadFile] = File(default=None),
    interior_image: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.PlaneRead:
    """Update an existing aircraft (including adding/updating images)"""
    if current_user.role != models.UserRole.VENDOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only vendors can update aircraft")
    
    if not current_user.vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor profile not found")
    
    plane = db.get(models.Plane, aircraft_id)
    if not plane:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aircraft not found")
    
    # Check if user owns this aircraft
    if plane.vendor_id != current_user.vendor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Check registration number uniqueness if being updated
    if registration_number and registration_number != plane.registration_number:
        existing = db.query(models.Plane).filter(
            models.Plane.vendor_id == current_user.vendor.id,
            models.Plane.registration_number == registration_number,
            models.Plane.id != aircraft_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aircraft with this registration number already exists"
            )
    
    # Load existing amenities JSON
    extended_data = {}
    if plane.amenities:
        try:
            extended_data = json.loads(plane.amenities)
        except (json.JSONDecodeError, TypeError):
            extended_data = {}
    
    # Update basic fields
    if model is not None:
        plane.model = model
    if registration_number is not None:
        plane.registration_number = registration_number
    if seat_capacity is not None:
        plane.seat_capacity = seat_capacity
    
    # Update extended fields in amenities JSON
    if aircraft_name is not None:
        extended_data["aircraft_name"] = aircraft_name
    if manufacturer is not None:
        extended_data["manufacturer"] = manufacturer
    if model_number is not None:
        extended_data["model_number"] = model_number
    if year_of_manufacture is not None:
        extended_data["year_of_manufacture"] = year_of_manufacture
    if luggage_load_kg is not None:
        extended_data["luggage_load_kg"] = luggage_load_kg
    if maximum_speed is not None:
        extended_data["maximum_speed"] = maximum_speed
    if speed_unit is not None:
        extended_data["speed_unit"] = speed_unit
    if range_km is not None:
        extended_data["range_km"] = range_km
    if wifi_available is not None:
        extended_data["wifi_available"] = wifi_available
    if wifi_type is not None:
        extended_data["wifi_type"] = wifi_type
    if dining_service is not None:
        extended_data["dining_service"] = dining_service
    if entertainment_system is not None:
        extended_data["entertainment_system"] = entertainment_system
    if pet_onboard_allowed is not None:
        extended_data["pet_onboard_allowed"] = pet_onboard_allowed
    if air_conditioning is not None:
        extended_data["air_conditioning"] = air_conditioning
    
    # Update amenities lists
    if amenities is not None:
        try:
            amenities_list = json.loads(amenities) if isinstance(amenities, str) else amenities
            extended_data["amenities_list"] = amenities_list
        except (json.JSONDecodeError, TypeError):
            pass
    
    if other_amenities is not None:
        try:
            other_amenities_list = json.loads(other_amenities) if isinstance(other_amenities, str) else other_amenities
            extended_data["other_amenities"] = other_amenities_list
        except (json.JSONDecodeError, TypeError):
            pass
    
    # Initialize aircraft_images if it doesn't exist
    if "aircraft_images" not in extended_data:
        extended_data["aircraft_images"] = []
    
    # Handle image uploads
    try:
        # Upload new images
        if exterior_image and exterior_image.filename:
            try:
                image_path = await save_aircraft_image(exterior_image, plane.id, "exterior")
                if image_path not in extended_data["aircraft_images"]:
                    extended_data["aircraft_images"].append(image_path)
            except Exception as e:
                print(f"Error saving exterior image: {e}")
        
        # Handle multiple interior images
        if interior_image:
            for idx, img in enumerate(interior_image):
                if img and img.filename:
                    try:
                        image_path = await save_aircraft_image(img, plane.id, f"interior_{idx}")
                        if image_path not in extended_data["aircraft_images"]:
                            extended_data["aircraft_images"].append(image_path)
                    except Exception as e:
                        print(f"Error saving interior image {idx}: {e}")
        
        # Update amenities JSON
        plane.amenities = json.dumps(extended_data)
        db.commit()
        db.refresh(plane)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update aircraft: {str(e)}"
        )
    
    # Return updated aircraft data
    amenities_list = extended_data.get("amenities_list", [])
    plane_dict = {
        "id": plane.id,
        "model": plane.model,
        "registration_number": plane.registration_number,
        "seat_capacity": plane.seat_capacity,
        "amenities": amenities_list
    }
    
    # Populate extended fields in response
    plane_dict.update({
        "aircraft_name": extended_data.get("aircraft_name"),
        "manufacturer": extended_data.get("manufacturer"),
        "model_number": extended_data.get("model_number"),
        "year_of_manufacture": extended_data.get("year_of_manufacture"),
        "luggage_load_kg": extended_data.get("luggage_load_kg"),
        "maximum_speed": extended_data.get("maximum_speed"),
        "speed_unit": extended_data.get("speed_unit"),
        "range_km": extended_data.get("range_km"),
        "wifi_available": extended_data.get("wifi_available", False),
        "wifi_type": extended_data.get("wifi_type"),
        "dining_service": extended_data.get("dining_service", False),
        "entertainment_system": extended_data.get("entertainment_system", False),
        "pet_onboard_allowed": extended_data.get("pet_onboard_allowed", False),
        "air_conditioning": extended_data.get("air_conditioning", False),
        "other_amenities": extended_data.get("other_amenities", [])
    })
    
    return schemas.PlaneRead(**plane_dict)

