"""
BLE Receiver for SmartCrowd sensor data.
Connects to Arduino PortentaTracker and streams parsed data.
"""
import asyncio
import re
from typing import Callable, Optional
from bleak import BleakClient, BleakScanner

# Configuration matching Arduino firmware
TARGET_NAME = "PortentaTracker"
CHARACTERISTIC_UUID = "D7F10001-8F98-4B86-B9F2-C5E0D6526D3C"

# Regex to parse data from Arduino format: [v1; v2; ...]
DATA_PATTERN = re.compile(r'\[(.*?)\]')

# Data labels matching main.ino snprintf order:
# [fall; systemOn; acc; accX; accY; accZ; hr; temp; RSSI1; RSSI2; RSSI3]
DATA_LABELS = [
    "fall", "systemOn", "acc", "accX", "accY", "accZ",
    "hr", "temp", "rssi1", "rssi2", "rssi3"
]

class BLEReceiver:
    """Manages BLE connection and data streaming from Arduino."""
    
    def __init__(self, on_data_callback: Optional[Callable] = None):
        self.on_data_callback = on_data_callback
        self.client: Optional[BleakClient] = None
        self.device = None
        self.connected = False
        self.last_data = {}
        
    def parse_data(self, raw_data: bytes) -> dict:
        """Parse BLE notification data into structured dict."""
        try:
            line = raw_data.decode('utf-8').strip()
            match = DATA_PATTERN.search(line)
            
            if match:
                data_string = match.group(1)
                values = data_string.split('; ')
                
                data_dict = {}
                for i, label in enumerate(DATA_LABELS):
                    if i < len(values):
                        try:
                            # Parse as float, handle 'nan' values
                            val = values[i].strip()
                            if val.lower() == 'nan':
                                data_dict[label] = 0.0
                            elif label in ["fall", "systemOn"]:
                                data_dict[label] = int(float(val))
                            else:
                                data_dict[label] = float(val)
                        except ValueError:
                            data_dict[label] = 0.0
                
                self.last_data = data_dict
                return data_dict
                
        except Exception as e:
            print(f"Error parsing BLE data: {e}")
        
        return {}
    
    def _notification_handler(self, sender, data):
        """Handle incoming BLE notification."""
        parsed = self.parse_data(data)
        if parsed and self.on_data_callback:
            asyncio.create_task(self.on_data_callback(parsed))
    
    async def scan_and_connect(self) -> bool:
        """Scan for device and establish connection."""
        print(f"Scanning for BLE device: {TARGET_NAME}...")
        
        try:
            self.device = await BleakScanner.find_device_by_name(TARGET_NAME)
            
            if not self.device:
                print(f"Could not find device: {TARGET_NAME}")
                return False
            
            print(f"Found device: {self.device.address}")
            
            self.client = BleakClient(self.device.address)
            await self.client.connect()
            self.connected = self.client.is_connected
            
            if self.connected:
                print("Connected to PortentaTracker")
                await self.client.start_notify(
                    CHARACTERISTIC_UUID, 
                    self._notification_handler
                )
                print("Subscribed to notifications")
                return True
            
        except Exception as e:
            print(f"BLE connection error: {e}")
            self.connected = False
        
        return False
    
    async def disconnect(self):
        """Disconnect from BLE device."""
        if self.client and self.connected:
            try:
                await self.client.stop_notify(CHARACTERISTIC_UUID)
                await self.client.disconnect()
            except:
                pass
            self.connected = False
            print("Disconnected from BLE device")
    
    async def run(self):
        """Main loop - connect and maintain connection."""
        while True:
            if not self.connected:
                success = await self.scan_and_connect()
                if not success:
                    print("Retrying in 5 seconds...")
                    await asyncio.sleep(5)
                    continue
            
            # Keep checking connection
            while self.connected and self.client:
                if not self.client.is_connected:
                    self.connected = False
                    print("Connection lost, reconnecting...")
                    break
                await asyncio.sleep(1)


# Mock receiver for testing without hardware
class MockBLEReceiver:
    """Mock BLE receiver that generates test data."""
    
    def __init__(self, on_data_callback: Optional[Callable] = None):
        self.on_data_callback = on_data_callback
        self.connected = True
        self.time = 0
        
    async def run(self):
        """Generate mock sensor data matching Arduino output format."""
        import random
        import math
        
        while True:
            self.time += 1
            
            # Arduino calculates: acc = abs(|x| + |y| + |z| - 10)
            # So normal standing = ~0, falls = 8+ 
            # Individual axes still have gravity component
            accX = random.uniform(0, 0.5)
            accY = random.uniform(0, 0.5)
            accZ = 9.8 + random.uniform(-0.2, 0.2)  # Gravity on Z
            
            # Simulate Arduino formula: acc = abs(|x| + |y| + |z| - 10)
            acc = abs(accX + accY + accZ - 10.0)
            
            # Generate mock data similar to Arduino
            mock_data = {
                "fall": 1 if random.random() < 0.02 else 0,  # 2% emergency button
                "systemOn": 1,
                "acc": round(acc, 2),
                "accX": round(accX, 2),
                "accY": round(accY, 2),
                "accZ": round(accZ, 2),
                "hr": round(75 + 15 * math.sin(self.time / 10) + random.uniform(-5, 5)),
                "temp": round(37.0 + random.uniform(-0.3, 0.3), 1),
                "rssi1": round(-45 + random.uniform(-10, 10)),
                "rssi2": round(-50 + random.uniform(-10, 10)),
                "rssi3": round(-55 + random.uniform(-10, 10)),
            }
            
            # Occasional fall spike (5% chance) - simulates sudden impact
            if random.random() < 0.05:
                # During a fall, x and y spike while z might drop
                mock_data["accX"] = round(random.uniform(3, 6), 2)
                mock_data["accY"] = round(random.uniform(3, 6), 2)
                mock_data["accZ"] = round(random.uniform(5, 8), 2)
                # Recalculate acc with fall values
                mock_data["acc"] = round(abs(
                    mock_data["accX"] + mock_data["accY"] + mock_data["accZ"] - 10.0
                ), 2)
            
            if self.on_data_callback:
                await self.on_data_callback(mock_data)
            
            await asyncio.sleep(0.5)
    
    async def disconnect(self):
        self.connected = False

