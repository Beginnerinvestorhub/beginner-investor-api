"""
Database models package for the investment hub application.

This package contains all database models and the base model class.
"""
from .base import Base, ModelType

# Import all models here to ensure they are registered with SQLAlchemy
# This must be done before the database is initialized
from .user import User, UserRole, UserSession  # noqa: F401
from .portfolio import Portfolio, PortfolioAsset, PortfolioTransaction, PortfolioPerformance  # noqa: F401
from .subscription import SubscriptionPlan, UserSubscription, PlanFeature, Invoice, InvoiceItem  # noqa: F401

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
    "SubscriptionPlan",
    "UserSubscription",
    "PlanFeature",
    "Invoice",
    "InvoiceItem",
]
