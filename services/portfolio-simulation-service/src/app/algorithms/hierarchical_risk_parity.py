import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Union
from scipy.cluster.hierarchy import linkage, to_tree
from scipy.spatial.distance import squareform

from .base import PortfolioOptimizer, PortfolioWeights

class HierarchicalRiskParityOptimizer(PortfolioOptimizer):
    """
    Hierarchical Risk Parity (HRP) portfolio optimization.
    
    HRP is a modern portfolio optimization technique that uses machine learning
    to construct diversified portfolios. It works by:
    1. Hierarchically clustering assets based on their correlations
    2. Allocating risk across the hierarchical tree
    3. Diversifying within each cluster
    """
    
    def __init__(
        self,
        returns: pd.DataFrame,
        risk_free_rate: float = 0.0,
        weight_bounds: Tuple[float, float] = (0, 1),
        linkage_method: str = 'single',
        max_clusters: Optional[int] = None
    ):
        """
        Initialize the Hierarchical Risk Parity Optimizer.
        
        Args:
            returns: DataFrame with asset returns (rows=time, columns=assets)
            risk_free_rate: Annual risk-free rate (default: 0.0)
            weight_bounds: Bounds for asset weights (default: 0 to 1, no short selling)
            linkage_method: Linkage method for hierarchical clustering.
                          Options: 'single', 'complete', 'average', 'ward', etc.
            max_clusters: Maximum number of clusters to form (optional)
        """
        super().__init__(returns, risk_free_rate)
        self.weight_bounds = weight_bounds
        self.linkage_method = linkage_method
        self.max_clusters = max_clusters
        
        # Calculate correlation and covariance matrices
        self.corr_matrix = self.returns.corr().values
        self.cov_matrix = self.returns.cov().values
        
        # Initialize variables for clustering
        self.linkage_matrix = None
        self.clusters = None
    
    def _compute_linkage_matrix(self) -> np.ndarray:
        """
        Compute the linkage matrix for hierarchical clustering.
        
        Returns:
            Linkage matrix for hierarchical clustering
        """
        # Convert correlation to distance matrix
        distance_matrix = np.sqrt(0.5 * (1 - self.corr_matrix))
        
        # Make sure the distance matrix is symmetric and has zeros on diagonal
        distance_matrix = (distance_matrix + distance_matrix.T) / 2
        np.fill_diagonal(distance_matrix, 0)
        
        # Convert to condensed distance matrix (required by scipy's linkage)
        condensed_dist = squareform(distance_matrix, checks=False)
        
        # Perform hierarchical clustering
        return linkage(condensed_dist, method=self.linkage_method)
    
    def _compute_quasi_diagonal_order(self, link: np.ndarray) -> List[int]:
        """
        Compute quasi-diagonal order of the assets.
        
        Args:
            link: Linkage matrix from hierarchical clustering
            
        Returns:
            List of indices representing the quasi-diagonal order
        """
        # Convert linkage matrix to tree
        tree = to_tree(link, rd=False)
        
        # Initialize queue with the root of the tree
        queue = [tree]
        result = []
        
        # Perform breadth-first traversal
        while queue:
            node = queue.pop(0)
            
            if node.is_leaf():
                result.append(int(node.id))
            else:
                # Add left and right children to the queue
                queue.append(node.left)
                queue.append(node.right)
        
        return result
    
    def _compute_hrp_weights(self, cov: np.ndarray, sort_order: List[int]) -> np.ndarray:
        """
        Compute HRP weights using the hierarchical structure.
        
        Args:
            cov: Covariance matrix
            sort_order: Asset order from quasi-diagonalization
            
        Returns:
            Array of portfolio weights
        """
        # Initialize weights
        weights = np.ones(cov.shape[0])
        
        # Start with all assets in one cluster
        clusters = [sort_order]
        
        while len(clusters) > 0:
            # Get the next cluster to process
            cluster = clusters.pop(0)
            
            if len(cluster) == 1:
                continue  # Skip single-asset clusters
                
            # Split the cluster into two sub-clusters
            # (This is a simplified version - in practice, you'd use the hierarchical structure)
            split_point = len(cluster) // 2
            left_cluster = cluster[:split_point]
            right_cluster = cluster[split_point:]
            
            # Compute the variance of each sub-cluster
            var_left = self._compute_cluster_variance(cov, left_cluster)
            var_right = self._compute_cluster_variance(cov, right_cluster)
            
            # Update weights based on inverse variance
            alpha = 1 - var_left / (var_left + var_right)
            weights[left_cluster] *= alpha
            weights[right_cluster] *= 1 - alpha
            
            # Add sub-clusters to the queue if they have more than one asset
            if len(left_cluster) > 1:
                clusters.append(left_cluster)
            if len(right_cluster) > 1:
                clusters.append(right_cluster)
        
        # Normalize weights to sum to 1
        weights = weights / np.sum(weights)
        
        # Apply weight bounds
        min_weight, max_weight = self.weight_bounds
        weights = np.clip(weights, min_weight, max_weight)
        weights = weights / np.sum(weights)  # Renormalize
        
        return weights
    
    def _compute_cluster_variance(self, cov: np.ndarray, cluster: List[int]) -> float:
        """
        Compute the variance of a cluster of assets.
        
        Args:
            cov: Covariance matrix
            cluster: List of asset indices in the cluster
            
        Returns:
            Variance of the cluster
        """
        # Simple average variance of the cluster
        return np.mean(np.diag(cov)[cluster])
    
    def optimize(self) -> PortfolioWeights:
        """
        Optimize portfolio weights using Hierarchical Risk Parity.
        
        Returns:
            PortfolioWeights object containing optimized weights and metrics
        """
        # Compute linkage matrix for hierarchical clustering
        self.linkage_matrix = self._compute_linkage_matrix()
        
        # Get quasi-diagonal order of assets
        sort_order = self._compute_quasi_diagonal_order(self.linkage_matrix)
        
        # Compute HRP weights
        weights = self._compute_hrp_weights(self.cov_matrix, sort_order)
        
        # Calculate portfolio metrics
        expected_return, volatility, sharpe_ratio = self.calculate_portfolio_metrics(weights)
        
        # Create and return portfolio weights object
        return PortfolioWeights(
            weights=self.get_weights_dict(weights),
            expected_return=expected_return,
            volatility=volatility,
            sharpe_ratio=sharpe_ratio,
            risk_free_rate=self.risk_free_rate
        )


def calculate_hrp_weights(
    returns: pd.DataFrame,
    risk_free_rate: float = 0.0,
    weight_bounds: Tuple[float, float] = (0, 1),
    linkage_method: str = 'single',
    max_clusters: Optional[int] = None
) -> Dict:
    """
    Calculate portfolio weights using Hierarchical Risk Parity.
    
    Args:
        returns: DataFrame with asset returns (rows=time, columns=assets)
        risk_free_rate: Annual risk-free rate (default: 0.0)
        weight_bounds: Bounds for asset weights (default: 0 to 1, no short selling)
        linkage_method: Linkage method for hierarchical clustering.
                      Options: 'single', 'complete', 'average', 'ward', etc.
        max_clusters: Maximum number of clusters to form (optional)
        
    Returns:
        Dictionary with portfolio weights and metrics
    """
    # Initialize and run the HRP optimizer
    hrp = HierarchicalRiskParityOptimizer(
        returns=returns,
        risk_free_rate=risk_free_rate,
        weight_bounds=weight_bounds,
        linkage_method=linkage_method,
        max_clusters=max_clusters
    )
    
    # Get the optimized portfolio
    portfolio = hrp.optimize()
    
    # Convert to dictionary with additional metrics
    result = {
        'weights': portfolio.weights,
        'metrics': {
            'expected_return': portfolio.expected_return,
            'volatility': portfolio.volatility,
            'sharpe_ratio': portfolio.sharpe_ratio,
            'risk_free_rate': portfolio.risk_free_rate
        },
        'linkage_matrix': hrp.linkage_matrix.tolist() if hrp.linkage_matrix is not None else None
    }
    
    return result
