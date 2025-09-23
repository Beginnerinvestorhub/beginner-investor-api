"""Asset model for representing financial instruments in the system."""
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy import (
    Column, 
    DateTime, 
    Enum as SQLEnum, 
    Float, 
    ForeignKey, 
    JSON, 
    String, 
    Text
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, relationship

from .base import Base


class AssetType(str, Enum):
    """Types of financial assets."""
    STOCK = "stock"
    ETF = "etf"
    MUTUAL_FUND = "mutual_fund"
    BOND = "bond"
    CRYPTO = "crypto"
    COMMODITY = "commodity"
    CASH = "cash"
    OTHER = "other"


class Asset(Base):
    """Represents a financial asset in the system."""
    
    __tablename__ = "assets"
    
    # Basic Information
    symbol: Mapped[str] = Column(
        String(20), 
        nullable=False, 
        index=True,
        doc="Ticker symbol of the asset"
    )
    
    name: Mapped[str] = Column(
        String(255), 
        nullable=False,
        doc="Full name of the asset"
    )
    
    asset_type: Mapped[AssetType] = Column(
        SQLEnum(AssetType),
        nullable=False,
        index=True,
        doc="Type of the asset (stock, etf, etc.)"
    )
    
    # Asset Details
    currency: Mapped[str] = Column(
        String(3),
        default="USD",
        nullable=False,
        doc="Trading currency of the asset (ISO 4217 code)"
    )
    
    exchange: Mapped[Optional[str]] = Column(
        String(50),
        nullable=True,
        doc="Primary exchange where the asset is traded"
    )
    
    isin: Mapped[Optional[str]] = Column(
        String(12),
        nullable=True,
        unique=True,
        index=True,
        doc="International Securities Identification Number"
    )
    
    # Performance Metrics (cached values, updated periodically)
    current_price: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        doc="Current market price of the asset"
    )
    
    price_updated_at: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        doc="Timestamp when the price was last updated"
    )
    
    # Metadata
    metadata: Mapped[Optional[Dict]] = Column(
        JSON,
        nullable=True,
        server_default="null",
        doc="Additional metadata about the asset"
    )
    
    # Relationships
    portfolio_assets: Mapped[List["PortfolioAsset"]] = relationship(
        "PortfolioAsset", 
        back_populates="asset"
    )
    
    def to_dict(self) -> Dict[str, any]:
        """
        Convert asset to dictionary.
        
        Returns:
            Dictionary representation of the asset
        """
        return {
            "id": str(self.id),
            "symbol": self.symbol,
            "name": self.name,
            "asset_type": self.asset_type.value,
            "currency": self.currency,
            "exchange": self.exchange,
            "isin": self.isin,
            "current_price": self.current_price,
            "price_updated_at": self.price_updated_at.isoformat() if self.price_updated_at else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "metadata": self.metadata or {}
        }
