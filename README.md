# SmartCrowd

**IoT Wearable System for Indoor Personnel Tracking with Health Monitoring**

A real-time monitoring system that tracks personnel location using RSSI triangulation and monitors vital signs (heart rate, body temperature, motion) with automatic fall detection and emergency alerts.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SMARTCROWD SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐                      ┌─────────────────────────────┐  │
│   │  ACCESS POINTS  │                      │     WEARABLE DEVICE         │  │
│   │  (3x Portenta)  │ ◄──── WiFi RSSI ──── │    (Arduino Portenta)       │  │
│   │                 │                      │                              │  │
│   │  PortentaAP1    │                      │  ┌──────────────────────┐   │  │
│   │  PortentaAP2    │                      │  │ SENSORS              │   │  │
│   │  PortentaAP3    │                      │  │ ├─ MPU6050 (Accel)   │   │  │
│   └─────────────────┘                      │  │ ├─ MAX30105 (HR)     │   │  │
│                                            │  │ ├─ BME280 (Temp)     │   │  │
│                                            │  │ └─ Button (Emergency)│   │  │
│                                            │  └──────────────────────┘   │  │
│                                            │             │                │  │
│                                            │             ▼ BLE            │  │
│                                            │  ┌──────────────────────┐   │  │
│                                            │  │ Data Packet:         │   │  │
│                                            │  │ [fall;on;acc;x;y;z;  │   │  │
│                                            │  │  hr;temp;r1;r2;r3]   │   │  │
│                                            │  └──────────────────────┘   │  │
│                                            └─────────────────────────────┘  │
│                                                          │                   │
│                                                          ▼ BLE               │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                           BACKEND                                     │  │
│   │                      (Python FastAPI)                                 │  │
│   │  ┌─────────────┐   ┌──────────────────┐   ┌────────────────────┐    │  │
│   │  │BLE Receiver │──▶│ RSSI→Distance    │──▶│  Trilateration     │    │  │
│   │  │  (bleak)    │   │ Conversion       │   │  (Position Calc)   │    │  │
│   │  └─────────────┘   └──────────────────┘   └────────────────────┘    │  │
│   │         │                                           │                │  │
│   │         └───────────────┬───────────────────────────┘                │  │
│   │                         ▼ WebSocket                                   │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                          │                   │
│                                                          ▼                   │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                         DASHBOARD                                     │  │
│   │                    (React + Tailwind)                                 │  │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │  │
│   │  │Triangulation│  │ Heart Rate  │  │Temperature │  │  Acceleration │ │  │
│   │  │    Grid     │  │   Chart     │  │   Chart    │  │    Chart      │ │  │
│   │  └────────────┘  └────────────┘  └────────────┘  └────────────────┘ │  │
│   │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│   │  │  ALERTS: Fall Detection (>7.5 m/s²) | Emergency Button          │ │  │
│   │  └─────────────────────────────────────────────────────────────────┘ │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Smartcrowd/
├── firmware/
│   └── main/
│       ├── main.ino           # Main loop, state machine, BLE transmission
│       ├── ble_comms.ino      # BLE service & characteristic setup
│       ├── gyro.ino           # MPU6050 accelerometer (fall detection)
│       ├── heartrate.ino      # MAX30105 heart rate sensor
│       ├── temperature.ino    # BME280 temperature sensor
│       ├── RSSI.ino           # WiFi RSSI scanning (3 access points)
│       └── button.ino         # Emergency button (short/long press)
│
├── dashboard/
│   ├── backend/
│   │   ├── main.py            # FastAPI server + WebSocket
│   │   ├── config.py          # RSSI calibration parameters
│   │   ├── triangulation.py   # RSSI→distance + position calculation
│   │   ├── ble_receiver.py    # BLE client + mock data
│   │   └── requirements.txt
│   │
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx                    # Main dashboard layout
│       │   ├── hooks/useWebSocket.js      # Real-time data hook
│       │   └── components/
│       │       ├── RoomMap.jsx            # SVG triangulation grid
│       │       ├── CalibrationPanel.jsx   # RSSI parameter editor
│       │       ├── HeartbeatChart.jsx
│       │       ├── TemperatureChart.jsx
│       │       ├── AccelerationChart.jsx
│       │       └── DataCard.jsx
│       └── package.json
│
└── README.md
```

---

## Features

### Wearable Device (Firmware)
- **Fall Detection**: Accelerometer monitors for sudden impacts (>7.5 m/s² gravity-compensated)
- **Emergency Button**: Short press = power on, Long press (3s) = power off
- **Health Monitoring**: Heart rate (MAX30105) and body temperature (BME280)
- **Position Tracking**: WiFi RSSI from 3 fixed access points with moving average
- **BLE Streaming**: Continuous data transmission at ~2Hz

### Dashboard
- **Bloomberg Terminal Aesthetic**: Dark theme with amber/green terminal styling
- **Real-time Triangulation**: SVG map showing person position from RSSI distances
- **Live Charts**: Heart rate, temperature, and acceleration with step-line visualization
- **Alert System**: Sticky warnings for falls and emergency button presses
- **Calibration Panel**: Live-edit RSSI parameters (RSSI@1m, path loss exponent) per anchor

---

## Hardware Requirements

| Component | Model | Purpose |
|-----------|-------|---------|
| Microcontroller | Arduino Portenta H7 (x4) | 1 wearable + 3 access points |
| Accelerometer | MPU6050 | Fall detection |
| Heart Rate Sensor | MAX30105 | Pulse oximetry |
| Temperature Sensor | BME280 | Body temperature |
| Button | Momentary switch | Emergency trigger |
| LED | Standard LED | Status indicator |

---

## Data Protocol

### BLE Packet Format
```
[fall; systemOn; acc; accX; accY; accZ; hr; temp; RSSI1; RSSI2; RSSI3]
```

| Field | Type | Description |
|-------|------|-------------|
| `fall` | int | 1 = emergency/fall active |
| `systemOn` | int | 1 = device active |
| `acc` | float | Gravity-compensated acceleration: `abs(\|x\|+\|y\|+\|z\|-10)` |
| `accX/Y/Z` | float | Raw axis acceleration (m/s²) |
| `hr` | float | Heart rate (BPM) |
| `temp` | float | Body temperature (°C) |
| `RSSI1/2/3` | float | Signal strength from each access point (dBm) |

### RSSI to Distance Formula
```
distance = 10 ^ ((RSSI_at_1m - RSSI) / (10 * n))
```
- `RSSI_at_1m`: Reference RSSI at 1 meter (default: -40 dBm)
- `n`: Path loss exponent (default: 2.0, adjustable per anchor)

---

## Quick Start

### 1. Flash Firmware
```bash
# Open firmware/main/main.ino in Arduino IDE
# Select Board: Arduino Portenta H7
# Upload to wearable device
# Flash access point code to other 3 Portenta devices
```

### 2. Start Backend
```bash
cd dashboard/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# Server runs on http://localhost:8000
```

### 3. Start Frontend
```bash
cd dashboard/frontend
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

### 4. Connect Real Device
Edit `dashboard/backend/main.py` line 21:
```python
USE_MOCK = False  # Set to False for real BLE hardware
```

---

## Alert Logic

| Alert | Trigger | Priority |
|-------|---------|----------|
| Emergency Button | `fall == 1` (from firmware) | 1 (highest) |
| Person Has Fallen | `acceleration > 7.5` | 2 |

> **Note**: Temperature and heart rate thresholds are disabled as sensor values require calibration.

---

## Calibration

Access the calibration panel via the `[ CALIBRATION ]` button in the dashboard header.

Each anchor has configurable parameters:
- **RSSI_AT_1M**: Reference signal strength at 1 meter distance
- **PATH_LOSS_N**: Environment path loss exponent (2.0 = free space, 2-4 = indoor)

Changes take effect immediately and affect triangulation calculations in real-time.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| WebSocket | `/ws` | Real-time sensor data stream |
| GET | `/calibration` | Get current RSSI parameters |
| POST | `/calibration` | Update RSSI parameters |
| POST | `/calibration/reset` | Reset to defaults |

---

## License

See [LICENSE](LICENSE) file for details.
