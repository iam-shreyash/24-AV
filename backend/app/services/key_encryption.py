"""
Service for encrypting and decrypting API keys using Fernet symmetric encryption.
"""
import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


class KeyEncryptionService:
    """Service for encrypting and decrypting sensitive API keys."""
    
    _fernet: Fernet | None = None
    
    @classmethod
    def _get_fernet(cls) -> Fernet:
        """Get or create Fernet cipher instance."""
        if cls._fernet is None:
            # Use a master key from environment or generate from JWT_SECRET
            master_key = os.getenv("API_KEY_ENCRYPTION_KEY")
            if not master_key:
                # Fallback: derive from JWT_SECRET if available
                jwt_secret = os.getenv("JWT_SECRET", "default-secret-key-change-in-production")
                # Use PBKDF2 to derive a key from JWT_SECRET
                kdf = PBKDF2HMAC(
                    algorithm=hashes.SHA256(),
                    length=32,
                    salt=b'api_key_salt_12345678',  # In production, use a random salt stored securely
                    iterations=100000,
                )
                key = base64.urlsafe_b64encode(kdf.derive(jwt_secret.encode()))
            else:
                # Use provided master key (should be 32 bytes base64 encoded)
                if len(master_key) != 44:  # Base64 encoded 32 bytes = 44 chars
                    # If not base64, derive key from it
                    kdf = PBKDF2HMAC(
                        algorithm=hashes.SHA256(),
                        length=32,
                        salt=b'api_key_salt_12345678',
                        iterations=100000,
                    )
                    key = base64.urlsafe_b64encode(kdf.derive(master_key.encode()))
                else:
                    key = master_key.encode()
            
            cls._fernet = Fernet(key)
        return cls._fernet
    
    @classmethod
    def encrypt(cls, plaintext: str) -> str:
        """Encrypt a plaintext string."""
        if not plaintext:
            return ""
        fernet = cls._get_fernet()
        encrypted = fernet.encrypt(plaintext.encode())
        return base64.urlsafe_b64encode(encrypted).decode()
    
    @classmethod
    def decrypt(cls, ciphertext: str) -> str:
        """Decrypt a ciphertext string."""
        if not ciphertext:
            return ""
        try:
            fernet = cls._get_fernet()
            decoded = base64.urlsafe_b64decode(ciphertext.encode())
            decrypted = fernet.decrypt(decoded)
            return decrypted.decode()
        except Exception as e:
            raise ValueError(f"Failed to decrypt key: {str(e)}")

