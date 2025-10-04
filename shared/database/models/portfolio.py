from uuid import uuid4
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Numeric,
    Text,
    Index,
    ForeignKeyConstraint,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from .base import Base



class PortfolioTransaction(Base):
    """
    Represents a transaction (buy, sell, dividend, etc.) within a portfolio.
    """
    __tablename__ = "portfolio_transactions"

    # Primary key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Transaction details
    portfolio_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    asset_id = Column(String(50), nullable=True)  # Null for cash-only transactions

    transaction_type = Column(
        ENUM(PortfolioTransactionType, 
             name="portfolio_transaction_type", 
             create_type=True),
        nullable=False
    )
    transaction_date = Column(DateTime, nullable=False, index=True)

    # Asset information
    asset_type = Column(String(20), nullable=True)

    # Transaction amounts
    quantity = Column(Numeric(20, 8), nullable=False, default=0)
    price_per_share = Column(Numeric(20, 8), nullable=True)
    amount = Column(Numeric(20, 4), nullable=False)
    fee = Column(Numeric(20, 4), default=0, nullable=False)
    tax = Column(Numeric(20, 4), default=0, nullable=False)

    # Currency information
    currency = Column(String(3), default="USD", nullable=False)
    fx_rate = Column(Numeric(20, 8), default=1, nullable=False)

    # Metadata
    description = Column(Text, nullable=True)
    reference_id = Column(String(100), nullable=True, index=True)

    # --- Composite FK to portfolio_assets ---
    __table_args__ = (
        ForeignKeyConstraint(
            ["portfolio_id", "asset_id"],
            ["portfolio_assets.portfolio_id", "portfolio_assets.asset_id"],
        ),
        Index("idx_transaction_portfolio_date", "portfolio_id", "transaction_date"),
        Index("idx_transaction_reference", "reference_id"),
    )

    # Relationships
    portfolio = relationship("Portfolio", back_populates="transactions")
    asset = relationship("PortfolioAsset", back_populates="transactions")

    @property
    def net_amount(self):
        """Calculate the net amount after fees and taxes."""
        return self.amount - self.fee - self.tax

    def to_dict(self):
        """Convert transaction to dictionary."""
        return {
            "id": str(self.id),
            "portfolio_id": str(self.portfolio_id),
            "transaction_type": self.transaction_type.value,
            "transaction_date": self.transaction_date.isoformat(),
            "asset_id": self.asset_id,
            "asset_type": self.asset_type,
            "quantity": float(self.quantity) if self.quantity is not None else None,
            "price_per_share": float(self.price_per_share) if self.price_per_share is not None else None,
            "amount": float(self.amount),
            "fee": float(self.fee),
            "tax": float(self.tax),
            "net_amount": float(self.net_amount),
            "currency": self.currency,
            "fx_rate": float(self.fx_rate),
            "description": self.description,
            "reference_id": self.reference_id,
            "created_at": self.created_at.isoformat(),
        }
