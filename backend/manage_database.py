"""
Script to manage database data - view, delete users, and get login details
Run this from the backend directory with virtual environment activated
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://crm_user:6648@localhost:5432/private_plane_crm")

def show_users():
    """Display all users with their login details"""
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            print("=" * 80)
            print("USER LOGIN DETAILS")
            print("=" * 80)
            print()
            
            result = conn.execute(text("""
                SELECT 
                    id,
                    email,
                    full_name,
                    role,
                    is_active,
                    created_at
                FROM users
                ORDER BY created_at DESC
            """))
            
            users = result.fetchall()
            
            if not users:
                print("No users found in database.")
                return
            
            print(f"{'ID':<5} {'Email':<35} {'Name':<25} {'Role':<12} {'Active':<8} {'Created'}")
            print("-" * 80)
            
            for user in users:
                print(f"{user[0]:<5} {user[1]:<35} {str(user[2] or 'N/A'):<25} {user[3]:<12} {'Yes' if user[4] else 'No':<8} {str(user[5])[:19]}")
            
            print()
            print("=" * 80)
            print("NOTE: Passwords are hashed and cannot be retrieved in plain text.")
            print("To reset a password, you need to update it through the application.")
            print("=" * 80)
            
    except Exception as e:
        print(f"[ERROR] Failed to fetch users: {e}")
        return False
    
    return True

def delete_user(email: str = None, user_id: int = None):
    """Delete a user by email or ID"""
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            trans = conn.begin()
            
            try:
                if email:
                    # Check if user exists
                    result = conn.execute(
                        text("SELECT id, email, role FROM users WHERE email = :email"),
                        {"email": email}
                    )
                    user = result.fetchone()
                    
                    if not user:
                        print(f"[ERROR] User with email '{email}' not found.")
                        trans.rollback()
                        return False
                    
                    user_id_to_delete = user[0]
                    user_email = user[1]
                    user_role = user[2]
                    
                elif user_id:
                    result = conn.execute(
                        text("SELECT id, email, role FROM users WHERE id = :id"),
                        {"id": user_id}
                    )
                    user = result.fetchone()
                    
                    if not user:
                        print(f"[ERROR] User with ID '{user_id}' not found.")
                        trans.rollback()
                        return False
                    
                    user_id_to_delete = user[0]
                    user_email = user[1]
                    user_role = user[2]
                else:
                    print("[ERROR] Please provide either email or user_id")
                    trans.rollback()
                    return False
                
                # Confirm deletion
                print(f"\n[WARNING] You are about to delete:")
                print(f"  ID: {user_id_to_delete}")
                print(f"  Email: {user_email}")
                print(f"  Role: {user_role}")
                print("\nThis will also delete:")
                print("  - Associated vendor record (if vendor)")
                print("  - All bookings")
                print("  - All related data")
                
                confirm = input("\nType 'DELETE' to confirm: ")
                
                if confirm != "DELETE":
                    print("[CANCELLED] Deletion cancelled.")
                    trans.rollback()
                    return False
                
                # Delete user (cascade will handle related records)
                conn.execute(
                    text("DELETE FROM users WHERE id = :id"),
                    {"id": user_id_to_delete}
                )
                
                trans.commit()
                
                print(f"\n[SUCCESS] User '{user_email}' (ID: {user_id_to_delete}) deleted successfully.")
                return True
                
            except Exception as e:
                trans.rollback()
                raise e
        
    except Exception as e:
        print(f"[ERROR] Failed to delete user: {e}")
        return False
    
    return True

def delete_all_users():
    """Delete all users (DANGEROUS - use with caution)"""
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Count users
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            count = result.fetchone()[0]
            
            if count == 0:
                print("No users to delete.")
                return True
            
            print(f"\n[WARNING] You are about to delete ALL {count} users from the database!")
            print("This will also delete:")
            print("  - All vendor records")
            print("  - All bookings")
            print("  - All related data")
            print("\nTHIS ACTION CANNOT BE UNDONE!")
            
            confirm = input("\nType 'DELETE ALL' to confirm: ")
            
            if confirm != "DELETE ALL":
                print("[CANCELLED] Deletion cancelled.")
                return False
            
            trans = conn.begin()
            try:
                conn.execute(text("DELETE FROM users"))
                trans.commit()
                print(f"\n[SUCCESS] All {count} users deleted successfully.")
                return True
            except Exception as e:
                trans.rollback()
                raise e
        
    except Exception as e:
        print(f"[ERROR] Failed to delete users: {e}")
        return False
    
    return True

def show_user_details(email: str = None, user_id: int = None):
    """Show detailed information about a specific user"""
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            if email:
                result = conn.execute(
                    text("""
                        SELECT 
                            u.id,
                            u.email,
                            u.full_name,
                            u.role,
                            u.is_active,
                            u.created_at,
                            u.updated_at
                        FROM users u
                        WHERE u.email = :email
                    """),
                    {"email": email}
                )
            elif user_id:
                result = conn.execute(
                    text("""
                        SELECT 
                            u.id,
                            u.email,
                            u.full_name,
                            u.role,
                            u.is_active,
                            u.created_at,
                            u.updated_at
                        FROM users u
                        WHERE u.id = :id
                    """),
                    {"id": user_id}
                )
            else:
                print("[ERROR] Please provide either email or user_id")
                return False
            
            user = result.fetchone()
            
            if not user:
                print(f"[ERROR] User not found.")
                return False
            
            print("=" * 80)
            print("USER DETAILS")
            print("=" * 80)
            print(f"ID: {user[0]}")
            print(f"Email: {user[1]}")
            print(f"Full Name: {user[2] or 'N/A'}")
            print(f"Role: {user[3]}")
            print(f"Active: {'Yes' if user[4] else 'No'}")
            print(f"Created: {user[5]}")
            print(f"Updated: {user[6]}")
            print()
            
            # If vendor, show vendor details
            if user[3] == "vendor":
                vendor_result = conn.execute(
                    text("""
                        SELECT 
                            company_name,
                            approval_status,
                            owner_name,
                            business_background,
                            contact_phone,
                            city,
                            state
                        FROM vendors
                        WHERE user_id = :user_id
                    """),
                    {"user_id": user[0]}
                )
                vendor = vendor_result.fetchone()
                
                if vendor:
                    print("VENDOR DETAILS:")
                    print("-" * 80)
                    print(f"Company Name: {vendor[0] or 'N/A'}")
                    print(f"Owner Name: {vendor[2] or 'N/A'}")
                    print(f"Business Background: {vendor[3] or 'N/A'}")
                    print(f"Approval Status: {vendor[1]}")
                    print(f"Contact Phone: {vendor[4] or 'N/A'}")
                    print(f"Location: {vendor[5] or 'N/A'}, {vendor[6] or 'N/A'}")
            
            print("=" * 80)
            print("NOTE: Password is hashed and cannot be displayed.")
            print("To reset password, use the application's password reset feature.")
            print("=" * 80)
            
    except Exception as e:
        print(f"[ERROR] Failed to fetch user details: {e}")
        return False
    
    return True

def main():
    import sys
    
    if len(sys.argv) < 2:
        print("=" * 80)
        print("DATABASE MANAGEMENT TOOL")
        print("=" * 80)
        print()
        print("Usage:")
        print("  python manage_database.py list                    - List all users")
        print("  python manage_database.py show <email>            - Show user details by email")
        print("  python manage_database.py show-id <user_id>       - Show user details by ID")
        print("  python manage_database.py delete <email>          - Delete user by email")
        print("  python manage_database.py delete-id <user_id>    - Delete user by ID")
        print("  python manage_database.py delete-all              - Delete ALL users (DANGEROUS)")
        print()
        print("Examples:")
        print("  python manage_database.py list")
        print("  python manage_database.py show vendor@example.com")
        print("  python manage_database.py delete vendor@example.com")
        print()
        return
    
    command = sys.argv[1].lower()
    
    if command == "list":
        show_users()
    elif command == "show":
        if len(sys.argv) < 3:
            print("[ERROR] Please provide email address")
            return
        show_user_details(email=sys.argv[2])
    elif command == "show-id":
        if len(sys.argv) < 3:
            print("[ERROR] Please provide user ID")
            return
        try:
            user_id = int(sys.argv[2])
            show_user_details(user_id=user_id)
        except ValueError:
            print("[ERROR] User ID must be a number")
    elif command == "delete":
        if len(sys.argv) < 3:
            print("[ERROR] Please provide email address")
            return
        delete_user(email=sys.argv[2])
    elif command == "delete-id":
        if len(sys.argv) < 3:
            print("[ERROR] Please provide user ID")
            return
        try:
            user_id = int(sys.argv[2])
            delete_user(user_id=user_id)
        except ValueError:
            print("[ERROR] User ID must be a number")
    elif command == "delete-all":
        delete_all_users()
    else:
        print(f"[ERROR] Unknown command: {command}")
        print("Run 'python manage_database.py' for usage information")

if __name__ == "__main__":
    main()

