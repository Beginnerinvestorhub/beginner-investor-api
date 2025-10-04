from decimal import Decimal, ROUND_HALF_UP
from typing import Union, List, Optional
import statistics

def round_decimal(value: Decimal, places: int = 2) -> Decimal:
    """Round decimal to specified places"""
    quantize_str = '0.' + '0' * places
    return value.quantize(Decimal(quantize_str), rounding=ROUND_HALF_UP)

def format_currency(amount: Union[Decimal, float], symbol: str = "$") -> str:
    """Format number as currency"""
    value = Decimal(str(amount))
    rounded = round_decimal(value, 2)
    return f"{symbol}{rounded:,.2f}"

def format_percentage(value: float, decimals: int = 2) -> str:
    """Format number as percentage"""
    return f"{value:.{decimals}f}%"

def calculate_percentage_change(old: Union[Decimal, float], new: Union[Decimal, float]) -> float:
    """Calculate percentage change"""
    if old == 0:
        return 0.0 if new == 0 else float('inf')
    
    old_val = float(old)
    new_val = float(new)
    return ((new_val - old_val) / old_val) * 100

def clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp value between min and max"""
    return max(min_val, min(max_val, value))

def normalize(value: float, min_val: float, max_val: float) -> float:
    """Normalize value to 0-1 range"""
    if max_val == min_val:
        return 0.5
    return (value - min_val) / (max_val - min_val)

def weighted_average(values: List[float], weights: List[float]) -> float:
    """Calculate weighted average"""
    if len(values) != len(weights):
        raise ValueError("Values and weights must have same length")
    
    if sum(weights) == 0:
        return 0.0
    
    return sum(v * w for v, w in zip(values, weights)) / sum(weights)

def compound_return(returns: List[float]) -> float:
    """Calculate compound return from list of returns"""
    product = 1.0
    for r in returns:
        product *= (1 + r)
    return product - 1

def annualized_return(total_return: float, days: int) -> float:
    """Annualize a return"""
    if days == 0:
        return 0.0
    return ((1 + total_return) ** (365 / days)) - 1

def sharpe_ratio(returns: List[float], risk_free_rate: float = 0.0) -> Optional[float]:
    """Calculate Sharpe ratio"""
    if not returns or len(returns) < 2:
        return None
    
    excess_returns = [r - risk_free_rate for r in returns]
    mean_return = statistics.mean(excess_returns)
    std_dev = statistics.stdev(excess_returns)
    
    if std_dev == 0:
        return None
    
    return mean_return / std_dev

def max_drawdown(values: List[float]) -> float:
    """Calculate maximum drawdown"""
    if not values:
        return 0.0
    
    peak = values[0]
    max_dd = 0.0
    
    for value in values:
        if value > peak:
            peak = value
        dd = (peak - value) / peak
        max_dd = max(max_dd, dd)
    
    return max_dd
