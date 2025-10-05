"""
Firebase Authentication Service for Python/FastAPI
"""
import os
import json
from typing import Dict, Optional, Any
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, auth, exceptions
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)


class FirebaseAuthService:
    """Firebase Authentication Service"""

    def __init__(self):
        self._initialized = False
        self._init_firebase()

    def _init_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if already initialized
            if firebase_admin._apps:
                logger.info("Firebase already initialized")
                self._initialized = True
                return

            # Get Firebase configuration from environment
            project_id = os.getenv('FIREBASE_PROJECT_ID')
            client_email = os.getenv('FIREBASE_CLIENT_EMAIL')
            private_key = os.getenv('FIREBASE_PRIVATE_KEY')

            if not all([project_id, client_email, private_key]):
                logger.warning("Firebase credentials not found in environment variables")
                return

            # Create credentials
            cred_dict = {
                "type": "service_account",
                "project_id": project_id,
                "private_key_id": "firebase-key",
                "private_key": private_key.replace('\\n', '\n'),
                "client_email": client_email,
                "client_id": "firebase-client",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email}"
            }

            cred = credentials.Certificate(cred_dict)

            # Initialize Firebase
            firebase_admin.initialize_app(cred)
            self._initialized = True
            logger.info("Firebase Admin SDK initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            self._initialized = False

    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify Firebase ID token"""
        if not self._initialized:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase authentication not available"
            )

        try:
            decoded_token = auth.verify_id_token(token)
            return {
                "uid": decoded_token["uid"],
                "email": decoded_token.get("email"),
                "email_verified": decoded_token.get("email_verified", False),
                "name": decoded_token.get("name"),
                "picture": decoded_token.get("picture"),
                "iss": decoded_token.get("iss"),
                "exp": decoded_token.get("exp"),
                "iat": decoded_token.get("iat"),
            }
        except exceptions.ExpiredIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except exceptions.RevokedIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked"
            )
        except exceptions.InvalidIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token verification failed"
            )

    def create_user(self, email: str, password: str, display_name: Optional[str] = None) -> Dict[str, Any]:
        """Create a new Firebase user"""
        if not self._initialized:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase authentication not available"
            )

        try:
            user_record = auth.create_user(
                email=email,
                password=password,
                display_name=display_name
            )

            return {
                "uid": user_record.uid,
                "email": user_record.email,
                "display_name": user_record.display_name,
                "email_verified": user_record.email_verified,
                "created_at": user_record.user_metadata.creation_timestamp,
            }
        except exceptions.EmailAlreadyExistsError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists"
            )
        except exceptions.WeakPasswordError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too weak"
            )
        except Exception as e:
            logger.error(f"User creation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )

    def get_user(self, uid: str) -> Dict[str, Any]:
        """Get user by UID"""
        if not self._initialized:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase authentication not available"
            )

        try:
            user_record = auth.get_user(uid)
            return {
                "uid": user_record.uid,
                "email": user_record.email,
                "display_name": user_record.display_name,
                "email_verified": user_record.email_verified,
                "created_at": user_record.user_metadata.creation_timestamp,
                "last_sign_in": user_record.user_metadata.last_sign_in_timestamp,
            }
        except exceptions.UserNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        except Exception as e:
            logger.error(f"Failed to get user: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user"
            )

    def update_user(self, uid: str, **kwargs) -> Dict[str, Any]:
        """Update user information"""
        if not self._initialized:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase authentication not available"
            )

        try:
            user_record = auth.update_user(uid, **kwargs)
            return {
                "uid": user_record.uid,
                "email": user_record.email,
                "display_name": user_record.display_name,
                "email_verified": user_record.email_verified,
            }
        except exceptions.UserNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        except Exception as e:
            logger.error(f"Failed to update user: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update user"
            )

    def delete_user(self, uid: str) -> bool:
        """Delete a user"""
        if not self._initialized:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase authentication not available"
            )

        try:
            auth.delete_user(uid)
            return True
        except exceptions.UserNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        except Exception as e:
            logger.error(f"Failed to delete user: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete user"
            )

    def reset_password(self, email: str) -> bool:
        """Send password reset email"""
        if not self._initialized:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase authentication not available"
            )

        try:
            auth.generate_password_reset_link(email)
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to send password reset email"
            )

    def verify_email(self, token: str) -> bool:
        """Verify email with token"""
        if not self._initialized:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase authentication not available"
            )

        try:
            auth.verify_id_token(token)
            # Extract UID from token and mark email as verified
            decoded_token = auth.verify_id_token(token, check_revoked=True)
            auth.update_user(decoded_token['uid'], email_verified=True)
            return True
        except Exception as e:
            logger.error(f"Email verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email verification failed"
            )


# Global instance
firebase_auth = FirebaseAuthService()
