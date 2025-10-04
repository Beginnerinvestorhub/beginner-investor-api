from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
import enum

from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    Integer,
    CheckConstraint,
    Index,
    Text,
    event,
    func,
    and_,
    or_,
    select
)
# Note: ENUM is imported from postgresql dialects, which is correct for custom types
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB, ENUM
from sqlalchemy.orm import relationship, validates, Session

from .base import Base, ModelType


class SubscriptionStatus(enum.Enum):
    """Subscription status values."""
    ACTIVE = "active"
    TRIALING = "trialing"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    UNPAID = "unpaid"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"
    PAUSED = "paused"


class BillingInterval(enum.Enum):
    """Billing interval for subscription plans."""
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"


class PlanTier(enum.Enum):
    """Subscription plan tiers."""
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class SubscriptionPlan(Base):
    """
    Represents a subscription plan that users can subscribe to.
    """
    __tablename__ = "subscription_plans"
    
    # Plan identification
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # --- FIX APPLIED HERE ---
    tier = Column(
        # 1. Pass the Python Enum class (PlanTier)
        # 2. Set create_type=True to ensure PostgreSQL CREATE TYPE DDL is emitted
        ENUM(PlanTier, name='plan_tier', create_type=True),
        nullable=False,
        index=True
    )
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Pricing
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    
    # --- FIX APPLIED HERE ---
    interval = Column(
        ENUM(BillingInterval, name='billing_interval', create_type=True),
        default=BillingInterval.MONTH.value, # Use enum value for default
        nullable=False
    )
    interval_count = Column(Integer, default=1, nullable=False)
    
    # Trial settings
    trial_period_days = Column(Integer, default=0, nullable=False)
    
    # Metadata
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    features = relationship("PlanFeature", back_populates="plan", cascade="all, delete-orphan")
    subscriptions = relationship("UserSubscription", back_populates="plan")
    
    # Indexes
    __table_args__ = (
        Index('idx_plan_tier_active', 'tier', 'is_active'),
        CheckConstraint('amount >= 0', name='check_plan_amount_positive'),
        CheckConstraint('interval_count > 0', name='check_interval_count_positive'),
        CheckConstraint('trial_period_days >= 0', name='check_trial_days_non_negative'),
    )
    
    @property
    def price_display(self) -> str:
        """Get a formatted price string."""
        return f"${self.amount:.2f} / {self.interval}"
    
    def has_feature(self, feature_name: str) -> bool:
        """Check if this plan includes a specific feature."""
        return any(feature.name == feature_name for feature in self.features)
    
    def to_dict(self, include_features: bool = False) -> Dict[str, Any]:
        """Convert the plan to a dictionary."""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "tier": self.tier.value, # Return the string value
            "is_active": self.is_active,
            "amount": float(self.amount),
            "currency": self.currency,
            "interval": self.interval.value, # Return the string value
            "interval_count": self.interval_count,
            "trial_period_days": self.trial_period_days,
            "price_display": self.price_display,
            "features": [f.to_dict() for f in self.features] if include_features else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PlanFeature(Base):
    """
    Represents a feature that can be included in a subscription plan.
    """
    __tablename__ = "plan_features"
    
    plan_id = Column(PG_UUID(as_uuid=True), ForeignKey('subscription_plans.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    value = Column(JSONB, default=dict, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    plan = relationship("SubscriptionPlan", back_populates="features")
    
    __table_args__ = (
        Index('idx_plan_feature', 'plan_id', 'name', unique=True),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the feature to a dictionary."""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "value": self.value,
            "is_enabled": self.is_enabled,
            "plan_id": str(self.plan_id)
        }


class UserSubscription(Base):
    """
    Represents a user's subscription to a plan.
    """
    __tablename__ = "user_subscriptions"
    
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    plan_id = Column(PG_UUID(as_uuid=True), ForeignKey('subscription_plans.id', ondelete='RESTRICT'), nullable=False)
    
    # --- FIX APPLIED HERE ---
    status = Column(
        ENUM(SubscriptionStatus, name='subscription_status', create_type=True),
        nullable=False,
        default=SubscriptionStatus.INCOMPLETE.value, # Use enum value for default
        index=True
    )
    
    # Billing information
    current_period_start = Column(DateTime, nullable=False, default=datetime.utcnow)
    current_period_end = Column(DateTime, nullable=False)
    cancel_at_period_end = Column(Boolean, default=False, nullable=False)
    canceled_at = Column(DateTime, nullable=True)
    
    # Trial information
    trial_start = Column(DateTime, nullable=True)
    trial_end = Column(DateTime, nullable=True)
    
    # Payment information
    payment_method_id = Column(String(100), nullable=True)
    payment_status = Column(String(50), nullable=True)
    
    # Metadata
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    invoices = relationship("Invoice", back_populates="subscription", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_user_subscription_status', 'user_id', 'status'),
        Index('idx_subscription_period', 'current_period_start', 'current_period_end'),
    )
    
    @property
    def is_trialing(self) -> bool:
        """Check if the subscription is in trial period."""
        if not self.trial_end:
            return False
        return self.trial_end > datetime.utcnow()
    
    @property
    def is_active(self) -> bool:
        """Check if the subscription is currently active."""
        now = datetime.utcnow()
        # Note: If you are on SQLAlchemy 2.0 and using Python Enums, the comparison should be to the Enum members
        # e.g., self.status == SubscriptionStatus.ACTIVE
        # However, since you are defining the column with ENUM(class), it should automatically handle this.
        # Keeping the list comparison for safety, assuming self.status returns the string value.
        return (
            self.status in ['active', 'trialing'] and 
            (self.current_period_end is None or self.current_period_end > now) and
            not self.cancel_at_period_end
        )
    
    def to_dict(self, include_plan: bool = False) -> Dict[str, Any]:
        """Convert the subscription to a dictionary."""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "plan_id": str(self.plan_id),
            "status": self.status.value, # Return the string value
            "current_period_start": self.current_period_start.isoformat() if self.current_period_start else None,
            "current_period_end": self.current_period_end.isoformat() if self.current_period_end else None,
            "cancel_at_period_end": self.cancel_at_period_end,
            "canceled_at": self.canceled_at.isoformat() if self.canceled_at else None,
            "trial_start": self.trial_start.isoformat() if self.trial_start else None,
            "trial_end": self.trial_end.isoformat() if self.trial_end else None,
            "is_trialing": self.is_trialing,
            "is_active": self.is_active,
            "plan": self.plan.to_dict(include_features=True) if include_plan and self.plan else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class InvoiceStatus(enum.Enum):
    """Invoice status values."""
    DRAFT = "draft"
    OPEN = "open"
    PAID = "paid"
    UNCOLLECTIBLE = "uncollectible"
    VOID = "void"


class Invoice(Base):
    """
    Represents an invoice for a subscription.
    """
    __tablename__ = "invoices"
    
    subscription_id = Column(PG_UUID(as_uuid=True), ForeignKey('user_subscriptions.id', ondelete='CASCADE'), nullable=False, index=True)
    number = Column(String(50), unique=True, nullable=False)
    
    # --- FIX APPLIED HERE ---
    status = Column(
        ENUM(InvoiceStatus, name='invoice_status', create_type=True),
        nullable=False,
        default=InvoiceStatus.DRAFT.value, # Use enum value for default
        index=True
    )
    
    # Billing information
    amount_due = Column(Numeric(12, 2), nullable=False)
    amount_paid = Column(Numeric(12, 2), default=0, nullable=False)
    amount_remaining = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    
    # Dates
    due_date = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    
    # Payment information
    payment_intent_id = Column(String(100), nullable=True)
    receipt_number = Column(String(50), nullable=True)
    
    # Relationships
    subscription = relationship("UserSubscription", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_invoice_number', 'number', unique=True),
        Index('idx_invoice_status', 'status'),
        Index('idx_invoice_due_date', 'due_date'),
    )
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.number:
            self.number = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid4())[:8].upper()}"
    
    @property
    def is_paid(self) -> bool:
        """Check if the invoice is fully paid."""
        # Using enum member for comparison
        return self.status == InvoiceStatus.PAID and self.amount_remaining <= 0
    
    def to_dict(self, include_items: bool = True) -> Dict[str, Any]:
        """Convert the invoice to a dictionary."""
        return {
            "id": str(self.id),
            "number": self.number,
            "status": self.status.value, # Return the string value
            "amount_due": float(self.amount_due),
            "amount_paid": float(self.amount_paid),
            "amount_remaining": float(self.amount_remaining),
            "currency": self.currency,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "is_paid": self.is_paid,
            "subscription_id": str(self.subscription_id),
            "items": [item.to_dict() for item in self.items] if include_items and self.items else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class InvoiceItem(Base):
    """
    Represents an item on an invoice.
    """
    __tablename__ = "invoice_items"
    
    invoice_id = Column(PG_UUID(as_uuid=True), ForeignKey('invoices.id', ondelete='CASCADE'), nullable=False, index=True)
    description = Column(Text, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    invoice = relationship("Invoice", back_populates="items")
    
    @property
    def total(self) -> Decimal:
        """Calculate the total amount for this line item."""
        return self.amount * self.quantity
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the invoice item to a dictionary."""
        return {
            "id": str(self.id),
            "description": self.description,
            "amount": float(self.amount),
            "quantity": self.quantity,
            "total": float(self.total),
            "metadata": self.metadata_,
            "invoice_id": str(self.invoice_id),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
