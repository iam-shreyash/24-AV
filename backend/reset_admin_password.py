#!/usr/bin/env python3
"""
Simple script to reset admin password
Uses only bcrypt, no SQLAlchemy imports
"""
import bcrypt
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

admin_password = os.getenv("ADMIN_DEFAULT_PASSWORD", "ChangeMe123!")
password_bytes = admin_password.encode('utf-8')

# Hash the password
hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
hashed_str = hashed.decode('utf-8')

print("=" * 60)
print("Admin Password Hash Generator")
print("=" * 60)
print(f"Password: {admin_password}")
print(f"Hashed: {hashed_str}")
print()
print("Run this SQL command to reset the admin password:")
print("=" * 60)
print(f"UPDATE users SET hashed_password = '{hashed_str}' WHERE email = 'admin@privateplane.app' AND role = 'ADMIN';")
print("=" * 60)

