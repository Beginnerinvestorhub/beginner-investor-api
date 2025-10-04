"""Database models for portfolio and simulation data."""
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
from uuid import UUID, uuid4

from sqlalchemy import Column, String, Float, Text, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base, TimestampMixin


class Portfolio(Base, TimestampMixin):
    """Represents an investment portfolio."""

    __tablename__ = "portfolios"

    # Basic Information
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Owner Information
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        index=True,
        nullable=False,
        doc="ID of the user who owns this portfolio"
    )

    # Portfolio Configuration
    base_currency: Mapped[str] = mapped_column(
        String(3),
        default="USD",
        nullable=False,
        doc="Base currency for the portfolio (ISO 4217 code)"
    )

    # Performance Settings
    target_return: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Target annual return for the portfolio (as a decimal, e.g., 0.07 for 7%)"
    )

    risk_tolerance: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        doc="Risk tolerance level (e.g., 'conservative', 'moderate', 'aggressive')"
    )
    
    # Asset Allocation
    assets: Mapped[List["PortfolioAsset"]] = relationship(
        "PortfolioAsset",
        back_populates="portfolio",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # Metadata
    tags: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        server_default="{}",
        doc="Additional metadata or tags for the portfolio"
    )

    # Relationships
    simulations: Mapped[List["Simulation"]] = relationship(
        "Simulation",
        back_populates="portfolio",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    def to_dict(self, include_assets: bool = True) -> dict:
        """
        Convert portfolio to dictionary.
        
        Args:
            include_assets: Whether to include assets in the output
            
        Returns:
            Dictionary representation of the portfolio
        """
        data = {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "user_id": str(self.user_id),
            "base_currency": self.base_currency,
            "target_return": self.target_return,
            "risk_tolerance": self.risk_tolerance,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "tags": self.tags or {},
        }
        
        if include_assets and self.assets:
            data["assets"] = [asset.to_dict() for asset in self.assets]
            
        return data


class PortfolioAsset(Base, TimestampMixin):
    """Database model for assets within a portfolio."""
    __tablename__ = "portfolio_assets"

    # Core asset information
    portfolio_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("portfolios.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    symbol: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    asset_class: Mapped[str] = mapped_column(String(20), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    average_cost: Mapped[float] = mapped_column(Float, nullable=False)
    current_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Relationships
    portfolio: Mapped[Portfolio] = relationship("Portfolio", back_populates="assets")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert asset to dictionary."""
        return {
            "id": str(self.id),
            "portfolio_id": str(self.portfolio_id),
            "symbol": self.symbol,
            "name": self.name,
            "asset_class": self.asset_class,
            "quantity": self.quantity,
            "average_cost": self.average_cost,
            "current_price": self.current_price,
            "market_value": self.quantity * (self.current_price or 0),
            "cost_basis": self.quantity * self.average_cost,
            "unrealized_pnl": (self.quantity * (self.current_price or 0)) - (self.quantity * self.average_cost)
        }


class Simulation(Base, TimestampMixin):
    """Database model for simulation runs."""
    __tablename__ = "simulations"

    # Core simulation information
    portfolio_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("portfolios.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)  # pending, running, completed, failed

    # Simulation parameters (stored as JSON for flexibility)
    parameters: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Results (stored as JSON for flexibility)
    results: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    portfolio: Mapped[Portfolio] = relationship("Portfolio", back_populates="simulations")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert simulation to dictionary with results."""
        return {
            "id": str(self.id),
            "portfolio_id": str(self.portfolio_id),
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "parameters": self.parameters,
            "results": self.results,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
