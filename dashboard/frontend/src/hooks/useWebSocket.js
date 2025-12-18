import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * WebSocket hook for real-time sensor data from backend.
 * Handles connection, reconnection, and calibration updates.
 */
export function useWebSocket(url = 'ws://localhost:8000/ws') {
    // Connection state
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    // Sensor data
    const [fall, setFall] = useState(0);
    const [systemOn, setSystemOn] = useState(0);
    const [heartbeat, setHeartbeat] = useState(75);
    const [temperature, setTemperature] = useState(37.0);
    const [acceleration, setAcceleration] = useState(9.8);
    const [position, setPosition] = useState({ x: 5, y: 5 });
    const [distances, setDistances] = useState({ A1: 0, A2: 0, A3: 0 });
    const [rssi, setRssi] = useState({ rssi1: -50, rssi2: -50, rssi3: -50 });
    const [room] = useState("DANCE_ROOM");

    // History for charts
    const [heartbeatHistory, setHeartbeatHistory] = useState([]);
    const [temperatureHistory, setTemperatureHistory] = useState([]);
    const [accelerationHistory, setAccelerationHistory] = useState([]);

    // Calibration config
    const [calibration, setCalibration] = useState({
        A1: { rssi_1m: -40, n: 2.0, x: 0, y: 0, name: "ENTRANCE" },
        A2: { rssi_1m: -40, n: 2.0, x: 10, y: 0, name: "BACKSTAGE_1" },
        A3: { rssi_1m: -40, n: 2.0, x: 5, y: 10, name: "BACKSTAGE_2" },
    });

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // Update calibration parameter
    const updateCalibration = useCallback((anchorId, rssi_1m, n) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'update_calibration',
                anchor_id: anchorId,
                rssi_1m: rssi_1m,
                n: n
            }));
        }
    }, []);

    // Connect to WebSocket
    useEffect(() => {
        const connect = () => {
            try {
                const ws = new WebSocket(url);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.log('WebSocket connected');
                    setConnected(true);
                    setError(null);
                };

                ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    setConnected(false);

                    // Reconnect after 2 seconds
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('Reconnecting...');
                        connect();
                    }, 2000);
                };

                ws.onerror = (e) => {
                    console.error('WebSocket error:', e);
                    setError('Connection error');
                };

                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);

                        if (msg.type === 'sensor_data') {
                            const data = msg.data;
                            setFall(data.fall);
                            setSystemOn(data.systemOn);
                            setHeartbeat(data.heartbeat);
                            setTemperature(data.temperature);
                            setAcceleration(data.acceleration);
                            setPosition(data.position);
                            setDistances(data.distances);
                            setRssi(data.rssi);
                            setHeartbeatHistory(data.heartbeatHistory || []);
                            setTemperatureHistory(data.temperatureHistory || []);
                            setAccelerationHistory(data.accelerationHistory || []);

                            if (data.calibration) {
                                setCalibration(data.calibration);
                            }
                        }

                        if (msg.type === 'calibration_update') {
                            setCalibration(msg.data);
                        }

                    } catch (e) {
                        console.error('Error parsing message:', e);
                    }
                };

            } catch (e) {
                console.error('Connection failed:', e);
                setError('Failed to connect');
            }
        };

        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [url]);

    return {
        // Connection state
        connected,
        error,

        // Raw sensor data
        fall,
        systemOn,
        heartbeat,
        temperature,
        acceleration,
        position,
        distances,
        rssi,
        room,

        // History for charts
        heartbeatHistory,
        temperatureHistory,
        accelerationHistory,

        // Calibration
        calibration,
        updateCalibration
    };
}

export default useWebSocket;
