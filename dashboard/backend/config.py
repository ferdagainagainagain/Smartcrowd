"""
Configuration for RSSI calibration and anchor positions.
Per-device configurable parameters for distance calculation.
"""
from pydantic import BaseModel
from typing import Dict

class AnchorConfig(BaseModel):
    """Configuration for a single anchor/beacon."""
    rssi_1m: float = -40.0  # RSSI reading at 1 meter
    n: float = 2.0          # Path loss exponent
    x: float = 0.0          # X position in meters
    y: float = 0.0          # Y position in meters
    name: str = "Anchor"    # Display name

class CalibrationConfig(BaseModel):
    """Global calibration configuration."""
    anchors: Dict[str, AnchorConfig] = {}

# Default anchor configuration
# Positions match the RoomMap.jsx anchors
DEFAULT_ANCHORS = {
    "A1": AnchorConfig(rssi_1m=-40.0, n=2.0, x=0.0, y=0.0, name="ENTRANCE"),
    "A2": AnchorConfig(rssi_1m=-40.0, n=2.0, x=10.0, y=0.0, name="BACKSTAGE_1"),
    "A3": AnchorConfig(rssi_1m=-40.0, n=2.0, x=5.0, y=10.0, name="BACKSTAGE_2"),
}

# Global mutable config - can be updated at runtime
current_config = CalibrationConfig(anchors=DEFAULT_ANCHORS.copy())

def get_anchor_config(anchor_id: str) -> AnchorConfig:
    """Get configuration for a specific anchor."""
    return current_config.anchors.get(anchor_id, DEFAULT_ANCHORS.get(anchor_id))

def update_anchor_config(anchor_id: str, rssi_1m: float = None, n: float = None):
    """Update calibration parameters for a specific anchor."""
    if anchor_id in current_config.anchors:
        anchor = current_config.anchors[anchor_id]
        if rssi_1m is not None:
            anchor.rssi_1m = rssi_1m
        if n is not None:
            anchor.n = n

def get_all_config() -> dict:
    """Get all anchor configurations as a dictionary."""
    return {
        anchor_id: {
            "rssi_1m": anchor.rssi_1m,
            "n": anchor.n,
            "x": anchor.x,
            "y": anchor.y,
            "name": anchor.name
        }
        for anchor_id, anchor in current_config.anchors.items()
    }

def reset_config():
    """Reset to default configuration."""
    global current_config
    current_config = CalibrationConfig(anchors=DEFAULT_ANCHORS.copy())
