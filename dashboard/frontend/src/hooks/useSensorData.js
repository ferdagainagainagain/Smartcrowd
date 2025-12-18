import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for sensor data with mock data generation
 * Generates realistic sensor readings with configurable spike probabilities
 */
export function useSensorData(spikeProb = 0.10) {
    // Current values
    const [heartbeat, setHeartbeat] = useState(75);
    const [temperature, setTemperature] = useState(37.0);
    const [acceleration, setAcceleration] = useState(9.8);
    const [position, setPosition] = useState({ x: 5, y: 5 });
    const [room] = useState("DANCE_ROOM");

    // History arrays for charts (60 data points)
    const [heartbeatHistory, setHeartbeatHistory] = useState([]);
    const [temperatureHistory, setTemperatureHistory] = useState([]);
    const [accelerationHistory, setAccelerationHistory] = useState([]);

    // Time counter for sine wave generation
    const [time, setTime] = useState(0);

    const HISTORY_SIZE = 60;

    // Generate new sensor data
    const updateData = useCallback(() => {
        const t = time / 10;

        // Heartbeat: 60-100 BPM with sine wave + noise
        // Spike: > 120 or < 50
        let newHR = 75 + 15 * Math.sin(t) + (Math.random() - 0.5) * 10;
        if (Math.random() < spikeProb / 2) {
            // High heartbeat spike
            newHR = 125 + Math.random() * 15;
        } else if (Math.random() < spikeProb / 2) {
            // Low heartbeat spike
            newHR = 40 + Math.random() * 8;
        }
        newHR = Math.max(40, Math.min(150, newHR));

        // Temperature: ~37°C with occasional spikes
        // Spike: > 38.5 or < 35.5
        let newTemp = 37.0 + 0.3 * Math.sin(t * 0.5) + (Math.random() - 0.5) * 0.4;
        if (Math.random() < spikeProb / 2) {
            // High temp spike
            newTemp = 38.8 + Math.random() * 0.5;
        } else if (Math.random() < spikeProb / 2) {
            // Low temp spike  
            newTemp = 35.0 + Math.random() * 0.4;
        }
        newTemp = Math.max(34, Math.min(41, newTemp));

        // Acceleration: ~9.8 with fall spikes > 25
        let newAcc = 9.8 + (Math.random() - 0.5) * 2;
        if (Math.random() < spikeProb) {
            // Fall spike
            newAcc = 26 + Math.random() * 5;
        }
        newAcc = Math.max(8, newAcc);

        // Position: Random walk within 0-10 meters
        const dx = (Math.random() - 0.5) * 0.5;
        const dy = (Math.random() - 0.5) * 0.5;
        const newX = Math.max(0, Math.min(10, position.x + dx));
        const newY = Math.max(0, Math.min(10, position.y + dy));

        // Update current values
        setHeartbeat(Math.round(newHR));
        setTemperature(parseFloat(newTemp.toFixed(1)));
        setAcceleration(parseFloat(newAcc.toFixed(1)));
        setPosition({ x: parseFloat(newX.toFixed(1)), y: parseFloat(newY.toFixed(1)) });
        setTime(t => t + 1);

        // Update history arrays with timestamp
        const timestamp = Date.now();

        setHeartbeatHistory(prev => {
            const updated = [...prev, { time: timestamp, value: Math.round(newHR) }];
            return updated.slice(-HISTORY_SIZE);
        });

        setTemperatureHistory(prev => {
            const updated = [...prev, { time: timestamp, value: parseFloat(newTemp.toFixed(1)) }];
            return updated.slice(-HISTORY_SIZE);
        });

        setAccelerationHistory(prev => {
            const updated = [...prev, { time: timestamp, value: parseFloat(newAcc.toFixed(1)) }];
            return updated.slice(-HISTORY_SIZE);
        });

    }, [time, position, spikeProb]);

    // Update every 500ms
    useEffect(() => {
        const interval = setInterval(updateData, 500);
        return () => clearInterval(interval);
    }, [updateData]);

    // Calculate distances to anchors (for triangulation display)
    const anchors = {
        A1: { x: 0, y: 0 },
        A2: { x: 10, y: 0 },
        A3: { x: 5, y: 10 }
    };

    const distances = {
        A1: Math.sqrt(Math.pow(position.x - anchors.A1.x, 2) + Math.pow(position.y - anchors.A1.y, 2)),
        A2: Math.sqrt(Math.pow(position.x - anchors.A2.x, 2) + Math.pow(position.y - anchors.A2.y, 2)),
        A3: Math.sqrt(Math.pow(position.x - anchors.A3.x, 2) + Math.pow(position.y - anchors.A3.y, 2))
    };

    return {
        // Current values
        heartbeat,
        temperature,
        acceleration,
        position,
        room,
        distances,

        // History for charts
        heartbeatHistory,
        temperatureHistory,
        accelerationHistory
    };
}

export default useSensorData;
