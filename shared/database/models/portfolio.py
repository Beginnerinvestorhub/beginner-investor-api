from datetime import datetime
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
    CheckConstraint,
    Index,
    Text,
    event,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB, ENUM
from sqlalchemy.orm import relationship, validates

from .base import Base

# Enums for portfolio types and statuses
class PortfolioType(enum.Enum):
    CASH = "cash"
    RETIREMENT = "retirement"
    TAXABLE = "taxable"
    EDUCATION = "education"
    TRUST = "trust"
    OTHER = "other"

class PortfolioStatus(enum.Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    FROZEN = "frozen"

class Portfolio(Base):
    """
    Portfolio model representing a collection of investments owned by a user.
    """
    __tablename__ = "portfolios"
    
    # Basic information
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    portfolio_type = Column(
        ENUM(*[e.value for e in PortfolioType], name='portfolio_type', create_type=False),
        nullable=False,
        default='taxable'
    )
    status = Column(
        ENUM(*[e.value for e in PortfolioStatus], name='portfolio_status', create_type=False),
        nullable=False,
        default='active'
    )
    
    # Ownership and access
    owner_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    is_public = Column(Boolean, default=False, nullable=False)
    
    # Financial metrics (cached for performance)
    total_value = Column(Numeric(20, 4), default=0, nullable=False)
    total_cost_basis = Column(Numeric(20, 4), default=0, nullable=False)
    total_gain_loss = Column(Numeric(20, 4), default=0, nullable=False)
    total_gain_loss_pct = Column(Numeric(10, 4), default=0, nullable=False)
    
    # Metadata
    currency = Column(String(3), default="USD", nullable=False)  # ISO 4217 currency code
    timezone = Column(String(50), default="UTC", nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="portfolios")
    assets = relationship("PortfolioAsset", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("PortfolioTransaction", back_populates="portfolio", cascade="all, delete-orphan")
    performance = relationship("PortfolioPerformance", back_populates="portfolio", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint(
            'total_value >= 0',
            name='check_portfolio_total_value_positive'
        ),
        Index('idx_portfolio_owner_status', 'owner_id', 'status'),
    )
    
    @property
    def asset_allocation(self) -> Dict[str, float]:
        """Calculate current asset allocation as percentages."""
        if self.total_value <= 0:
            return {}
            
        allocation = {}
        for asset in self.assets:
            if asset.current_value > 0:
                allocation[asset.asset_id] = float(asset.current_value / self.total_value)
        return allocation
    
    def update_totals(self) -> None:
        """Recalculate and update the portfolio's total values."""
        self.total_value = sum(asset.current_value for asset in self.assets)
        self.total_cost_basis = sum(asset.cost_basis for asset in self.assets)
        
        if self.total_cost_basis > 0:
            self.total_gain_loss = self.total_value - self.total_cost_basis
            self.total_gain_loss_pct = (self.total_gain_loss / self.total_cost_basis) * 100
        else:
            self.total_gain_loss = Decimal('0')
            self.total_gain_loss_pct = Decimal('0')
    
    def to_dict(self, include_assets: bool = False) -> Dict[str, Any]:
        """Convert portfolio to dictionary."""
        data = {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "type": self.portfolio_type,
            "status": self.status,
            "owner_id": str(self.owner_id),
            "is_public": self.is_public,
            "total_value": float(self.total_value),
            "total_cost_basis": float(self.total_cost_basis),
            "total_gain_loss": float(self.total_gain_loss),
            "total_gain_loss_pct": float(self.total_gain_loss_pct),
            "currency": self.currency,
            "timezone": self.timezone,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        
        if include_assets:
            data["assets"] = [asset.to_dict() for asset in self.assets]
            data["asset_allocation"] = self.asset_allocation
            
        return data


class PortfolioAsset(Base):
    """
    Represents an asset (stock, bond, crypto, etc.) within a portfolio.
    """
    __tablename__ = "portfolio_assets"
    
    # Asset identification
    portfolio_id = Column(PG_UUID(as_uuid=True), ForeignKey("portfolios.id"), primary_key=True)
    asset_id = Column(String(50), primary_key=True)  # Could be ticker symbol or other identifier
    asset_type = Column(String(20), nullable=False)  # stock, bond, crypto, etf, etc.
    
    # Position information
    quantity = Column(Numeric(20, 8), nullable=False, default=0)
    average_cost = Column(Numeric(20, 8), nullable=False, default=0)
    cost_basis = Column(Numeric(20, 4), nullable=False, default=0)
    
    # Current market data (cached)
    current_price = Column(Numeric(20, 4), nullable=True)
    current_value = Column(Numeric(20, 4), nullable=False, default=0)
    last_updated = Column(DateTime, nullable=True)
    
    # Performance metrics
    gain_loss = Column(Numeric(20, 4), default=0, nullable=False)
    gain_loss_pct = Column(Numeric(10, 4), default=0, nullable=False)
    
    # Metadata
    name = Column(String(100), nullable=True)
    currency = Column(String(3), default="USD", nullable=False)
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="assets")
    transactions = relationship("PortfolioTransaction", back_populates="asset", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_portfolio_asset', 'portfolio_id', 'asset_id'),
        Index('idx_asset_type', 'asset_type'),
    )
    
    @property
    def is_crypto(self) -> bool:
        """Check if this is a cryptocurrency asset."""
        return self.asset_type.lower() == 'crypto'
    
    def update_from_market_data(self, price: Decimal, timestamp: datetime) -> None:
        """Update the asset with current market data."""
        self.current_price = price
        self.current_value = self.quantity * price
        self.last_updated = timestamp
        
        if self.cost_basis > 0:
            self.gain_loss = self.current_value - self.cost_basis
            self.gain_loss_pct = (self.gain_loss / self.cost_basis) * 100
        else:
            self.gain_loss = Decimal('0')
            self.gain_loss_pct = Decimal('0')
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert asset to dictionary."""
        return {
            "asset_id": self.asset_id,
            "type": self.asset_type,
            "name": self.name or self.asset_id,
            "quantity": float(self.quantity),
            "average_cost": float(self.average_cost),
            "cost_basis": float(self.cost_basis),
            "current_price": float(self.current_price) if self.current_price is not None else None,
            "current_value": float(self.current_value),
            "gain_loss": float(self.gain_loss),
            "gain_loss_pct": float(self.gain_loss_pct),
            "currency": self.currency,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None,
        }


class PortfolioTransactionType(enum.Enum):
    BUY = "buy"
    SELL = "sell"
    DIVIDEND = "dividend"
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER_IN = "transfer_in"
    TRANSFER_OUT = "transfer_out"
    FEE = "fee"
    TAX = "tax"
    ADJUSTMENT = "adjustment"


class PortfolioTransaction(Base):
    """
    Represents a transaction (buy, sell, dividend, etc.) within a portfolio.
    """
    __tablename__ = "portfolio_transactions"
    
    # Transaction details
    portfolio_id = Column(PG_UUID(as_uuid=True), ForeignKey("portfolios.id"), index=True, nullable=False)
    transaction_type = Column(
        ENUM(*[e.value for e in PortfolioTransactionType], name='portfolio_transaction_type', create_type=False),
        nullable=False
    )
    transaction_date = Column(DateTime, nullable=False, index=True)
    
    # Asset information
    asset_id = Column(String(50), nullable=True)  # Null for cash transactions
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
    reference_id = Column(String(100), nullable=True, index=True)  # External reference ID
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="transactions")
    asset = relationship("PortfolioAsset", back_populates="transactions", 
                        foreign_keys=[portfolio_id, asset_id])
    
    # Indexes
    __table_args__ = (
        Index('idx_transaction_portfolio_date', 'portfolio_id', 'transaction_date'),
        Index('idx_transaction_reference', 'reference_id'),
    )
    
    @property
    def net_amount(self) -> Decimal:
        """Calculate the net amount after fees and taxes."""
        return self.amount - self.fee - self.tax
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert transaction to dictionary."""
        return {
            "id": str(self.id),
            "portfolio_id": str(self.portfolio_id),
            "transaction_type": self.transaction_type,
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


class PortfolioPerformance(Base):
    """
    Tracks historical performance metrics for a portfolio.
    """
    __tablename__ = "portfolio_performance"
    
    portfolio_id = Column(PG_UUID(as_uuid=True), ForeignKey("portfolios.id"), primary_key=True)
    date = Column(DateTime, primary_key=True, default=datetime.utcnow)
    
    # Performance metrics
    total_value = Column(Numeric(20, 4), nullable=False)
    total_deposits = Column(Numeric(20, 4), nullable=False, default=0)
    total_withdrawals = Column(Numeric(20, 4), nullable=False, default=0)
    
    # Risk metrics
    volatility = Column(Numeric(10, 6), nullable=True)
    sharpe_ratio = Column(Numeric(10, 4), nullable=True)
    max_drawdown = Column(Numeric(10, 4), nullable=True)
    
    # Asset allocation (stored as JSON)
    asset_allocation = Column(JSONB, nullable=True)
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="performance")
    
    # Indexes
    __table_args__ = (
        Index('idx_portfolio_performance_date', 'portfolio_id', 'date'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert performance record to dictionary."""
        return {
            "date": self.date.isoformat(),
            "total_value": float(self.total_value),
            "total_deposits": float(self.total_deposits),
            "total_withdrawals": float(self.total_withdrawals),
            "volatility": float(self.volatility) if self.volatility is not None else None,
            "sharpe_ratio": float(self.sharpe_ratio) if self.sharpe_ratio is not None else None,
            "max_drawdown": float(self.max_drawdown) if self.max_drawdown is not None else None,
            "asset_allocation": self.asset_allocation,
        }
