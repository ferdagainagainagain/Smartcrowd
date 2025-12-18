"""
SmartCrowd Backend Server
FastAPI + WebSocket for real-time sensor data streaming.
"""
import asyncio
import json
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import get_all_config, update_anchor_config, reset_config
from triangulation import calculate_distances, trilaterate
from ble_receiver import MockBLEReceiver, BLEReceiver

# Use mock receiver for testing, switch to BLEReceiver for real hardware
USE_MOCK = True  # Set to False when using real Arduino

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"Client disconnected. Total: {len(self.active_connections)}")
    
    async def broadcast(self, data: dict):
        """Send data to all connected clients."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except:
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()
ble_receiver = None

# Data history for charts
data_history = {
    "heartbeat": [],
    "temperature": [],
    "acceleration": []
}
HISTORY_SIZE = 60

async def on_sensor_data(data: dict):
    """Process incoming sensor data and broadcast to clients."""
    global data_history
    
    # Calculate distances from RSSI
    distances = calculate_distances(
        data.get("rssi1", -100),
        data.get("rssi2", -100),
        data.get("rssi3", -100)
    )
    
    # Calculate position using trilateration
    position = trilaterate(distances)
    
    # Get current timestamp
    import time
    timestamp = int(time.time() * 1000)
    
    # Update history
    hr = data.get("hr", 75)
    temp = data.get("temp", 37.0)
    acc = data.get("acc", 9.8)
    
    data_history["heartbeat"].append({"time": timestamp, "value": round(hr)})
    data_history["temperature"].append({"time": timestamp, "value": round(temp, 1)})
    data_history["acceleration"].append({"time": timestamp, "value": round(acc, 1)})
    
    # Trim history
    for key in data_history:
        data_history[key] = data_history[key][-HISTORY_SIZE:]
    
    # Build message for frontend
    message = {
        "type": "sensor_data",
        "data": {
            "fall": data.get("fall", 0),
            "systemOn": data.get("systemOn", 0),
            "heartbeat": round(hr),
            "temperature": round(temp, 1),
            "acceleration": round(acc, 1),
            "accX": round(data.get("accX", 0), 2),
            "accY": round(data.get("accY", 0), 2),
            "accZ": round(data.get("accZ", 0), 2),
            "position": {"x": position[0], "y": position[1]},
            "distances": distances,
            "rssi": {
                "rssi1": data.get("rssi1", -100),
                "rssi2": data.get("rssi2", -100),
                "rssi3": data.get("rssi3", -100),
            },
            "room": "DANCE_ROOM",
            "heartbeatHistory": data_history["heartbeat"],
            "temperatureHistory": data_history["temperature"],
            "accelerationHistory": data_history["acceleration"],
            "calibration": get_all_config()
        }
    }
    
    await manager.broadcast(message)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    global ble_receiver
    
    # Create receiver
    if USE_MOCK:
        print("Starting with MOCK BLE receiver")
        ble_receiver = MockBLEReceiver(on_data_callback=on_sensor_data)
    else:
        print("Starting with REAL BLE receiver")
        ble_receiver = BLEReceiver(on_data_callback=on_sensor_data)
    
    # Start receiver in background
    receiver_task = asyncio.create_task(ble_receiver.run())
    
    yield
    
    # Shutdown
    receiver_task.cancel()
    if ble_receiver:
        await ble_receiver.disconnect()

app = FastAPI(
    title="SmartCrowd Backend",
    description="Real-time BLE sensor data streaming",
    lifespan=lifespan
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CalibrationUpdate(BaseModel):
    anchor_id: str
    rssi_1m: Optional[float] = None
    n: Optional[float] = None

@app.get("/")
async def root():
    return {"status": "ok", "service": "SmartCrowd Backend"}

@app.get("/calibration")
async def get_calibration():
    """Get current RSSI calibration parameters."""
    return {"calibration": get_all_config()}

@app.post("/calibration")
async def update_calibration(update: CalibrationUpdate):
    """Update calibration parameters for an anchor."""
    update_anchor_config(
        update.anchor_id,
        rssi_1m=update.rssi_1m,
        n=update.n
    )
    
    # Broadcast updated config to all clients
    await manager.broadcast({
        "type": "calibration_update",
        "data": get_all_config()
    })
    
    return {"status": "updated", "calibration": get_all_config()}

@app.post("/calibration/reset")
async def reset_calibration():
    """Reset calibration to defaults."""
    reset_config()
    
    await manager.broadcast({
        "type": "calibration_update",
        "data": get_all_config()
    })
    
    return {"status": "reset", "calibration": get_all_config()}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time data streaming."""
    await manager.connect(websocket)
    
    # Send initial calibration config
    await websocket.send_json({
        "type": "calibration_update",
        "data": get_all_config()
    })
    
    try:
        while True:
            # Keep connection alive, handle any incoming messages
            data = await websocket.receive_text()
            
            # Handle calibration updates from frontend
            try:
                msg = json.loads(data)
                if msg.get("type") == "update_calibration":
                    anchor_id = msg.get("anchor_id")
                    rssi_1m = msg.get("rssi_1m")
                    n = msg.get("n")
                    
                    if anchor_id:
                        update_anchor_config(anchor_id, rssi_1m=rssi_1m, n=n)
                        await manager.broadcast({
                            "type": "calibration_update",
                            "data": get_all_config()
                        })
            except:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
