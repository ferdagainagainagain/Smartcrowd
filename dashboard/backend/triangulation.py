"""
Triangulation module for RSSI-to-distance and position calculation.
Uses trilateration with least-squares optimization.
"""
import numpy as np
from config import get_anchor_config, get_all_config

def rssi_to_distance(rssi: float, rssi_1m: float, n: float) -> float:
    """
    Convert RSSI to distance using log-distance path loss model.
    
    Formula: distance = 10 ^ ((RSSI_at_1m - RSSI) / (10 * n))
    
    Args:
        rssi: Current RSSI reading (negative dBm)
        rssi_1m: RSSI at 1 meter reference distance
        n: Path loss exponent (2.0 for free space, 2-4 for indoor)
    
    Returns:
        Estimated distance in meters
    """
    if rssi >= 0:  # Invalid RSSI
        return 0.0
    
    try:
        exponent = (rssi_1m - rssi) / (10.0 * n)
        distance = 10.0 ** exponent
        # Clamp to reasonable range (0.1m to 20m)
        return max(0.1, min(20.0, distance))
    except:
        return 0.0

def calculate_distances(rssi1: float, rssi2: float, rssi3: float) -> dict:
    """
    Calculate distances to all three anchors from RSSI values.
    Uses per-anchor calibration parameters.
    """
    a1_config = get_anchor_config("A1")
    a2_config = get_anchor_config("A2")
    a3_config = get_anchor_config("A3")
    
    return {
        "A1": rssi_to_distance(rssi1, a1_config.rssi_1m, a1_config.n),
        "A2": rssi_to_distance(rssi2, a2_config.rssi_1m, a2_config.n),
        "A3": rssi_to_distance(rssi3, a3_config.rssi_1m, a3_config.n),
    }

def trilaterate(distances: dict) -> tuple:
    """
    Calculate position using trilateration from 3 anchor distances.
    Uses least-squares optimization for better accuracy.
    
    Args:
        distances: Dict with keys A1, A2, A3 and distance values
    
    Returns:
        Tuple (x, y) position in meters
    """
    config = get_all_config()
    
    # Get anchor positions
    x1, y1 = config["A1"]["x"], config["A1"]["y"]
    x2, y2 = config["A2"]["x"], config["A2"]["y"]
    x3, y3 = config["A3"]["x"], config["A3"]["y"]
    
    # Get distances
    r1 = distances["A1"]
    r2 = distances["A2"]
    r3 = distances["A3"]
    
    # Use linear algebra approach for trilateration
    # Set up system of equations:
    # (x - x1)^2 + (y - y1)^2 = r1^2
    # (x - x2)^2 + (y - y2)^2 = r2^2
    # (x - x3)^2 + (y - y3)^2 = r3^2
    
    # Subtract first equation from others to get linear system
    # 2(x2-x1)x + 2(y2-y1)y = r1^2 - r2^2 - x1^2 + x2^2 - y1^2 + y2^2
    # 2(x3-x1)x + 2(y3-y1)y = r1^2 - r3^2 - x1^2 + x3^2 - y1^2 + y3^2
    
    A = np.array([
        [2*(x2-x1), 2*(y2-y1)],
        [2*(x3-x1), 2*(y3-y1)]
    ])
    
    b = np.array([
        r1**2 - r2**2 - x1**2 + x2**2 - y1**2 + y2**2,
        r1**2 - r3**2 - x1**2 + x3**2 - y1**2 + y3**2
    ])
    
    try:
        # Solve using least squares for robustness
        solution, residuals, rank, s = np.linalg.lstsq(A, b, rcond=None)
        x, y = solution
        
        # Clamp to room bounds (0-10 meters)
        x = max(0.0, min(10.0, x))
        y = max(0.0, min(10.0, y))
        
        return (round(x, 2), round(y, 2))
    except:
        # Fallback to center if calculation fails
        return (5.0, 5.0)
