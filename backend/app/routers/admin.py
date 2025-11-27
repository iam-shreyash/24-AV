from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_role


class BulkUpdateBookingsRequest(BaseModel):
    booking_ids: list[int]
    status: str


class BulkUpdateUsersRequest(BaseModel):
    user_ids: list[int]
    is_active: bool


router = APIRouter()


def create_audit_log(
    db: Session,
    admin_id: int,
    action: str,
    entity_type: str,
    entity_id: Optional[int] = None,
    meta: Optional[dict] = None
):
    """Helper function to create audit log entries"""
    log = models.AdminLog(
        admin_id=admin_id,
        action=action,
        meta=str(meta) if meta else None
    )
    db.add(log)
    db.commit()
    return log


@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Get dashboard statistics for admin"""
    print(f"Dashboard stats requested by admin {current_user.id}")
    try:
        # Total bookings
        total_bookings = db.query(func.count(models.Booking.id)).scalar() or 0
        
        # Today's bookings
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_bookings = db.query(func.count(models.Booking.id)).filter(
            models.Booking.booked_at >= today_start
        ).scalar() or 0
        
        # Booking status breakdown
        pending_bookings = db.query(func.count(models.Booking.id)).filter(
            models.Booking.status == models.BookingStatus.PENDING
        ).scalar() or 0
        
        confirmed_bookings = db.query(func.count(models.Booking.id)).filter(
            models.Booking.status == models.BookingStatus.CONFIRMED
        ).scalar() or 0
        
        cancelled_bookings = db.query(func.count(models.Booking.id)).filter(
            models.Booking.status == models.BookingStatus.CANCELLED
        ).scalar() or 0
        
        # Total revenue (from confirmed bookings)
        total_revenue = db.query(func.sum(models.Booking.total_amount)).filter(
            models.Booking.status == models.BookingStatus.CONFIRMED
        ).scalar() or 0
        
        # Total users
        total_users = db.query(func.count(models.User.id)).scalar() or 0
        active_vendors = db.query(func.count(models.User.id)).filter(
            and_(
                models.User.role == models.UserRole.VENDOR,
                models.User.is_active == True
            )
        ).scalar() or 0
        active_passengers = db.query(func.count(models.User.id)).filter(
            and_(
                models.User.role == models.UserRole.PASSENGER,
                models.User.is_active == True
            )
        ).scalar() or 0
        
        # Total aircraft and flights
        total_aircraft = db.query(func.count(models.Plane.id)).scalar() or 0
        total_flights = db.query(func.count(models.Flight.id)).scalar() or 0
        
        # Today's flights
        today_start_flights = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end_flights = today_start_flights + timedelta(days=1)
        today_flights = db.query(func.count(models.Flight.id)).filter(
            and_(
                models.Flight.departure_time >= today_start_flights,
                models.Flight.departure_time < today_end_flights
            )
        ).scalar() or 0
        
        # Revenue by day (last 7 days)
        revenue_by_day = []
        for i in range(6, -1, -1):
            day_start = (datetime.utcnow() - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            day_revenue = db.query(func.sum(models.Booking.total_amount)).filter(
                and_(
                    models.Booking.status == models.BookingStatus.CONFIRMED,
                    models.Booking.booked_at >= day_start,
                    models.Booking.booked_at < day_end
                )
            ).scalar() or 0
            
            revenue_by_day.append({
                "date": day_start.isoformat(),
                "revenue": float(day_revenue)
            })
        
        return {
            "total_bookings": total_bookings,
            "today_bookings": today_bookings,
            "pending_bookings": pending_bookings,
            "confirmed_bookings": confirmed_bookings,
            "cancelled_bookings": cancelled_bookings,
            "total_revenue": float(total_revenue),
            "total_users": total_users,
            "active_vendors": active_vendors,
            "active_passengers": active_passengers,
            "total_aircraft": total_aircraft,
            "total_flights": total_flights,
            "today_flights": today_flights,
            "revenue_by_day": revenue_by_day,
            "booking_status_breakdown": {
                "pending": pending_bookings,
                "confirmed": confirmed_bookings,
                "cancelled": cancelled_bookings,
                "refunded": db.query(func.count(models.Booking.id)).filter(
                    models.Booking.status == models.BookingStatus.REFUNDED
                ).scalar() or 0
            }
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error fetching dashboard stats: {str(e)}")
        print(f"Traceback: {error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard stats: {str(e)}"
        )


@router.get("/analytics")
def get_analytics(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Get analytics data for the specified number of days"""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Filter bookings by date range
        bookings_query = db.query(models.Booking).filter(
            models.Booking.booked_at >= start_date
        )
        
        confirmed_bookings = bookings_query.filter(
            models.Booking.status == models.BookingStatus.CONFIRMED
        ).all()
        
        total_bookings = bookings_query.count()
        total_revenue = sum(float(b.total_amount) for b in confirmed_bookings)
        avg_booking_value = total_revenue / len(confirmed_bookings) if confirmed_bookings else 0
        
        # Top routes
        route_stats = db.query(
            models.Flight.origin,
            models.Flight.destination,
            func.count(models.Booking.id).label('booking_count'),
            func.sum(models.Booking.total_amount).label('revenue')
        ).join(
            models.Booking, models.Booking.flight_id == models.Flight.id
        ).filter(
            and_(
                models.Booking.status == models.BookingStatus.CONFIRMED,
                models.Booking.booked_at >= start_date
            )
        ).group_by(
            models.Flight.origin, models.Flight.destination
        ).order_by(
            func.sum(models.Booking.total_amount).desc()
        ).limit(5).all()
        
        top_routes = [
            {
                "route": f"{route.origin} → {route.destination}",
                "bookings": route.booking_count,
                "revenue": float(route.revenue or 0)
            }
            for route in route_stats
        ]
        
        # User growth
        total_users = db.query(func.count(models.User.id)).scalar() or 0
        
        return {
            "total_revenue": total_revenue,
            "total_bookings": total_bookings,
            "average_booking_value": avg_booking_value,
            "booking_growth": 0,  # Would need historical data
            "revenue_growth": 0,  # Would need historical data
            "top_routes": top_routes,
            "booking_trends": [],  # Would need time-series aggregation
            "user_growth": total_users
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching analytics: {str(e)}"
        )


@router.get("/financial")
def get_financial_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Get financial data including revenue, payments, and refunds"""
    try:
        # Total revenue from confirmed bookings
        total_revenue = db.query(func.sum(models.Booking.total_amount)).filter(
            models.Booking.status == models.BookingStatus.CONFIRMED
        ).scalar() or 0
        
        # Pending payments
        pending_payments = db.query(func.count(models.Booking.id)).filter(
            models.Booking.status == models.BookingStatus.PENDING
        ).scalar() or 0
        
        # Refunded amount
        refunded_amount = db.query(func.sum(models.Booking.total_amount)).filter(
            models.Booking.status == models.BookingStatus.REFUNDED
        ).scalar() or 0
        
        net_revenue = float(total_revenue) - float(refunded_amount)
        
        # Monthly revenue breakdown
        # Get all confirmed bookings and group by month in Python for better compatibility
        confirmed_bookings = db.query(models.Booking).filter(
            models.Booking.status == models.BookingStatus.CONFIRMED,
            models.Booking.booked_at.isnot(None)
        ).order_by(models.Booking.booked_at.desc()).all()
        
        monthly_revenue_dict = {}
        for booking in confirmed_bookings:
            if booking.booked_at:
                month_key = booking.booked_at.strftime('%b %Y')
                if month_key not in monthly_revenue_dict:
                    monthly_revenue_dict[month_key] = 0
                monthly_revenue_dict[month_key] += float(booking.total_amount or 0)
        
        monthly_data = [
            {"month": month, "revenue": revenue}
            for month, revenue in sorted(monthly_revenue_dict.items(), reverse=True)[:12]
        ]
        
        # Recent transactions (last 50 bookings)
        recent_bookings = db.query(models.Booking).filter(
            models.Booking.status.in_([
                models.BookingStatus.CONFIRMED,
                models.BookingStatus.CANCELLED,
                models.BookingStatus.REFUNDED
            ])
        ).order_by(
            models.Booking.booked_at.desc()
        ).limit(50).all()
        
        transactions = [
            {
                "id": b.id,
                "passenger_name": b.passenger_name,
                "total_amount": float(b.total_amount),
                "status": b.status.value,
                "booked_at": b.booked_at.isoformat() if b.booked_at else None
            }
            for b in recent_bookings
        ]
        
        return {
            "total_revenue": float(total_revenue),
            "pending_payments": pending_payments,
            "refunded_amount": float(refunded_amount),
            "net_revenue": net_revenue,
            "monthly_revenue": monthly_data,
            "transactions": transactions
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching financial data: {str(e)}"
        )


@router.get("/audit-logs")
def get_audit_logs(
    action_type: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Get audit logs for admin activity tracking"""
    try:
        query = db.query(models.AdminLog)
        
        # Filter by action type if provided
        if action_type and action_type != "all":
            # Parse action type from meta or action field
            if action_type == "create":
                query = query.filter(models.AdminLog.action.ilike("%create%"))
            elif action_type == "update":
                query = query.filter(models.AdminLog.action.ilike("%update%"))
            elif action_type == "delete":
                query = query.filter(models.AdminLog.action.ilike("%delete%"))
            elif action_type == "approval":
                query = query.filter(models.AdminLog.action.ilike("%approve%"))
        
        logs = query.order_by(models.AdminLog.created_at.desc()).limit(limit).all()
        
        # Get admin user names
        admin_ids = {log.admin_id for log in logs if log.admin_id}
        admin_users = {}
        if admin_ids:
            users = db.query(models.User).filter(models.User.id.in_(admin_ids)).all()
            admin_users = {u.id: u.email for u in users}
        
        return [
            {
                "id": log.id,
                "user": admin_users.get(log.admin_id, "System") if log.admin_id else "System",
                "action": log.action,
                "entity": log.meta or "N/A",
                "timestamp": log.created_at.isoformat(),
                "type": (
                    "create" if "create" in log.action.lower() else
                    "update" if "update" in log.action.lower() else
                    "delete" if "delete" in log.action.lower() else
                    "approval" if "approve" in log.action.lower() else
                    "other"
                )
            }
            for log in logs
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching audit logs: {str(e)}"
        )


@router.post("/bookings/bulk-update")
def bulk_update_bookings(
    payload: BulkUpdateBookingsRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Bulk update booking statuses"""
    try:
        bookings = db.query(models.Booking).filter(models.Booking.id.in_(payload.booking_ids)).all()
        
        if not bookings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No bookings found"
            )
        
        updated_count = 0
        for booking in bookings:
            try:
                booking.status = models.BookingStatus(payload.status)
                updated_count += 1
            except ValueError:
                continue
        
        # Create audit log
        create_audit_log(
            db=db,
            admin_id=current_user.id,
            action=f"Bulk updated {updated_count} bookings to {payload.status}",
            entity_type="booking",
            meta={"booking_ids": payload.booking_ids, "status": payload.status}
        )
        
        db.commit()
        
        return {
            "message": f"Successfully updated {updated_count} booking(s)",
            "updated_count": updated_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error bulk updating bookings: {str(e)}"
        )


@router.post("/users/bulk-update")
def bulk_update_users(
    payload: BulkUpdateUsersRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Bulk update user active status"""
    try:
        users = db.query(models.User).filter(models.User.id.in_(payload.user_ids)).all()
        
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No users found"
            )
        
        updated_count = 0
        for user in users:
            user.is_active = payload.is_active
            updated_count += 1
        
        # Create audit log
        create_audit_log(
            db=db,
            admin_id=current_user.id,
            action=f"Bulk {'activated' if payload.is_active else 'deactivated'} {updated_count} users",
            entity_type="user",
            meta={"user_ids": payload.user_ids, "is_active": payload.is_active}
        )
        
        db.commit()
        
        return {
            "message": f"Successfully updated {updated_count} user(s)",
            "updated_count": updated_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error bulk updating users: {str(e)}"
        )


@router.get("/notifications")
def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Get admin notifications"""
    try:
        # For now, we'll create notifications from recent activities
        # In production, you'd have a dedicated notifications table
        
        notifications = []
        
        # Check for pending vendor applications
        pending_vendors = db.query(func.count(models.Vendor.id)).filter(
            models.Vendor.approval_status == "pending"
        ).scalar() or 0
        
        if pending_vendors > 0:
            notifications.append({
                "id": 1,
                "title": "New Vendor Applications",
                "message": f"{pending_vendors} vendor application(s) require review",
                "type": "info",
                "read": False,
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # Check for pending bookings
        pending_bookings = db.query(func.count(models.Booking.id)).filter(
            models.Booking.status == models.BookingStatus.PENDING
        ).scalar() or 0
        
        if pending_bookings > 0:
            notifications.append({
                "id": 2,
                "title": "Pending Bookings",
                "message": f"{pending_bookings} booking(s) pending confirmation",
                "type": "warning",
                "read": False,
                "timestamp": (datetime.utcnow() - timedelta(minutes=30)).isoformat()
            })
        
        # Recent cancellations (last hour)
        recent_cancellations = db.query(func.count(models.Booking.id)).filter(
            and_(
                models.Booking.status == models.BookingStatus.CANCELLED,
                models.Booking.booked_at >= datetime.utcnow() - timedelta(hours=1)
            )
        ).scalar() or 0
        
        if recent_cancellations > 0:
            notifications.append({
                "id": 3,
                "title": "Recent Cancellations",
                "message": f"{recent_cancellations} booking(s) cancelled in the last hour",
                "type": "error",
                "read": False,
                "timestamp": (datetime.utcnow() - timedelta(minutes=15)).isoformat()
            })
        
        if unread_only:
            notifications = [n for n in notifications if not n.get("read", False)]
        
        return notifications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching notifications: {str(e)}"
        )


@router.get("/payments")
def get_all_payments(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
):
    """Get all payments (admin only)"""
    try:
        query = db.query(models.Payment)
        
        if status:
            query = query.filter(models.Payment.status == status)
        
        payments = query.order_by(models.Payment.processed_at.desc()).limit(limit).all()
        
        return [
            {
                "id": p.id,
                "booking_id": p.booking_id,
                "amount": float(p.amount),
                "currency": p.currency,
                "status": p.status,
                "provider": p.provider.value,
                "processed_at": p.processed_at.isoformat() if p.processed_at else None
            }
            for p in payments
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching payments: {str(e)}"
        )

