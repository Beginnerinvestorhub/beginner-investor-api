from .base import Base, ModelType

# Import all models here to ensure they are registered with SQLAlchemy
# This must be done before the database is initialized
from .user import User, UserRole, UserSession  # noqa: F401
from .portfolio import (
    Portfolio, 
    PortfolioAsset, 
    PortfolioTransaction, 
    PortfolioPerformance,
    PortfolioType,
    PortfolioStatus,
    PortfolioTransactionType
)  # noqa: F401
from .subscription import Subscription, SubscriptionPlan  # noqa: F401

# This will be populated by the model modules
__all__ = [
    "Base",
    "ModelType",
    "User",
    "UserRole",
    "UserSession",
    "Portfolio",
    "PortfolioAsset",
    "PortfolioTransaction",
    "PortfolioPerformance",
    "PortfolioType",
    "PortfolioStatus",
    "PortfolioTransactionType",
    "Subscription",
    "SubscriptionPlan",
