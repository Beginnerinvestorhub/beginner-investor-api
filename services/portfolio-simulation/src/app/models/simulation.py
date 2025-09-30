"""Simulation model for running and storing portfolio simulations."""
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
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


class SimulationStatus(str, Enum):
    """Status of a simulation."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class SimulationType(str, Enum):
    """Type of simulation."""
    MONTE_CARLO = "monte_carlo"
    HISTORICAL = "historical"
    STRESS_TEST = "stress_test"
    WHAT_IF = "what_if"
    OPTIMIZATION = "optimization"


class Simulation(Base):
    """Represents a portfolio simulation."""
    
    __tablename__ = "simulations"
    
    # Basic Information
    name: Mapped[str] = Column(
        String(100), 
        nullable=False,
        doc="Name of the simulation"
    )
    
    description: Mapped[Optional[str]] = Column(
        Text, 
        nullable=True,
        doc="Description of the simulation"
    )
    
    # Simulation Type and Status
    simulation_type: Mapped[SimulationType] = Column(
        SQLEnum(SimulationType),
        nullable=False,
        index=True,
        doc="Type of simulation to run"
    )
    
    status: Mapped[SimulationStatus] = Column(
        SQLEnum(SimulationStatus),
        default=SimulationStatus.PENDING,
        nullable=False,
        index=True,
        doc="Current status of the simulation"
    )
    
    # Simulation Parameters
    parameters: Mapped[Dict] = Column(
        JSON,
        nullable=False,
        doc="Input parameters for the simulation"
    )
    
    # Simulation Results
    results: Mapped[Optional[Dict]] = Column(
        JSON,
        nullable=True,
        doc="Results of the simulation"
    )
    
    # Performance Metrics
    started_at: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        doc="When the simulation started running"
    )
    
    completed_at: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        doc="When the simulation completed"
    )
    
    error_message: Mapped[Optional[str]] = Column(
        Text,
        nullable=True,
        doc="Error message if the simulation failed"
    )
    
    # Relationships
    portfolio_id: Mapped[UUID] = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("portfolios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="ID of the portfolio this simulation belongs to"
    )
    
    portfolio: Mapped["Portfolio"] = relationship(
        "Portfolio",
        back_populates="simulations",
        lazy="selectin"
    )
    
    # Progress tracking
    progress: Mapped[float] = Column(
        Float,
        default=0.0,
        nullable=False,
        doc="Progress of the simulation (0.0 to 1.0)"
    )
    
    # Metadata
    tags: Mapped[Optional[Dict]] = Column(
        JSON,
        nullable=True,
        server_default="{}",
        doc="Additional metadata or tags for the simulation"
    )
    
    def to_dict(self, include_results: bool = True) -> Dict[str, Any]:
        """
        Convert simulation to dictionary.
        
        Args:
            include_results: Whether to include the results in the output
            
        Returns:
            Dictionary representation of the simulation
        """
        data = {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "simulation_type": self.simulation_type.value,
            "status": self.status.value,
            "parameters": self.parameters,
            "progress": self.progress,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "error_message": self.error_message,
            "portfolio_id": str(self.portfolio_id),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "tags": self.tags or {}
        }
        
        if include_results and self.results is not None:
            data["results"] = self.results
            
        return data
    
    def update_status(
        self, 
        status: SimulationStatus, 
        error_message: Optional[str] = None,
        progress: Optional[float] = None
    ) -> None:
        """
        Update the status of the simulation.
        
        Args:
            status: New status of the simulation
            error_message: Optional error message if status is FAILED
            progress: Optional progress value (0.0 to 1.0)
        """
        self.status = status
        
        if status == SimulationStatus.RUNNING and self.started_at is None:
            self.started_at = datetime.utcnow()
        elif status in (SimulationStatus.COMPLETED, SimulationStatus.FAILED, SimulationStatus.CANCELLED):
            self.completed_at = datetime.utcnow()
            
        if error_message is not None:
            self.error_message = error_message
            
        if progress is not None:
            self.progress = max(0.0, min(1.0, progress))
            
        if status == SimulationStatus.COMPLETED:
            self.progress = 1.0
    
    def is_finished(self) -> bool:
        """Check if the simulation has finished (completed, failed, or cancelled)."""
        return self.status in (
            SimulationStatus.COMPLETED,
            SimulationStatus.FAILED,
            SimulationStatus.CANCELLED
        )
    
    def get_estimated_time_remaining(self) -> Optional[float]:
        """
        Estimate the remaining time for the simulation to complete.
        
        Returns:
            Estimated time remaining in seconds, or None if not enough data
        """
        if not self.started_at or self.progress <= 0 or self.progress >= 1.0:
            return None
            
        elapsed = (datetime.utcnow() - self.started_at).total_seconds()
        estimated_total = elapsed / self.progress
        return max(0, estimated_total - elapsed)
