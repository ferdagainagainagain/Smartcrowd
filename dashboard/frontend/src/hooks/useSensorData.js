import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook that generates simulated sensor data for IoT dashboard
 * Uses random walk for position, sine wave + noise for heartbeat, 
 * and slow Brownian motion for humidity
 */
export function useSensorData() {
    const [position, setPosition] = useState({ x: 5, y: 5 }); // Start in center
    const [heartbeat, setHeartbeat] = useState(75);
    const [humidity, setHumidity] = useState(45);
    const [temperature, setTemperature] = useState(36.8);
    const [heartbeatHistory, setHeartbeatHistory] = useState([]);
    const [humidityHistory, setHumidityHistory] = useState([]);
    const [temperatureHistory, setTemperatureHistory] = useState([]);

    const timeRef = useRef(0);
    const humidityTrendRef = useRef(0); // Slow drift direction

    // Random walk for position - smooth movement
    const updatePosition = useCallback((prevPos) => {
        // Random step with momentum (smoother movement)
        const stepSize = 0.3; // Maximum step per second
        const dx = (Math.random() - 0.5) * 2 * stepSize;
        const dy = (Math.random() - 0.5) * 2 * stepSize;

        // Apply step with boundary constraints (0-10m room)
        let newX = prevPos.x + dx;
        let newY = prevPos.y + dy;

        // Soft boundary - bounce back when near edges
        const margin = 0.5;
        if (newX < margin) newX = margin + Math.random() * 0.2;
        if (newX > 10 - margin) newX = 10 - margin - Math.random() * 0.2;
        if (newY < margin) newY = margin + Math.random() * 0.2;
        if (newY > 10 - margin) newY = 10 - margin - Math.random() * 0.2;

        return { x: newX, y: newY };
    }, []);

    // Heartbeat: base + sine oscillation + noise (60-100 BPM range)
    const calculateHeartbeat = useCallback((time) => {
        const baseBPM = 80;
        const amplitude = 15;
        const frequency = 0.1; // Slow oscillation

        // Sine wave for natural rhythm
        const sineComponent = amplitude * Math.sin(time * frequency);

        // Random noise
        const noise = (Math.random() - 0.5) * 8;

        // Combine and clamp
        let bpm = baseBPM + sineComponent + noise;
        bpm = Math.max(60, Math.min(100, bpm));

        return Math.round(bpm);
    }, []);

    // Temperature: base + sine oscillation + noise (36.5-37.5°C range)
    const calculateTemperature = useCallback((time, prevTemp) => {
        const baseTemp = 37.0;
        const amplitude = 0.3;
        const frequency = 0.05; // Very slow oscillation

        // Sine wave for natural circadian rhythm
        const sineComponent = amplitude * Math.sin(time * frequency);

        // Small random noise
        const noise = (Math.random() - 0.5) * 0.15;

        // Slight tendency to return to baseline
        const pull = (baseTemp - prevTemp) * 0.05;

        // Combine and clamp
        let temp = prevTemp + sineComponent * 0.02 + noise + pull;
        temp = Math.max(36.2, Math.min(37.8, temp));

        return parseFloat(temp.toFixed(1));
    }, []);

    // Humidity: slow Brownian motion around 45%
    const calculateHumidity = useCallback((prevHumidity) => {
        // Very small random change
        const change = (Math.random() - 0.5) * 0.3;

        // Slight tendency to return to baseline (45%)
        const baseline = 45;
        const pull = (baseline - prevHumidity) * 0.02;

        let newHumidity = prevHumidity + change + pull;

        // Clamp to realistic range
        newHumidity = Math.max(40, Math.min(50, newHumidity));

        return parseFloat(newHumidity.toFixed(1));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            timeRef.current += 1;
            const now = new Date();
            const timestamp = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // Update position with random walk
            setPosition(prev => updatePosition(prev));

            // Update heartbeat
            const newHeartbeat = calculateHeartbeat(timeRef.current);
            setHeartbeat(newHeartbeat);

            // Update humidity
            setHumidity(prev => {
                const newHumidity = calculateHumidity(prev);
                return newHumidity;
            });

            // Update temperature
            setTemperature(prev => {
                const newTemperature = calculateTemperature(timeRef.current, prev);
                return newTemperature;
            });

            // Update histories (keep last 60 seconds)
            setHeartbeatHistory(prev => {
                const newHistory = [...prev, { time: timestamp, value: newHeartbeat, rawTime: timeRef.current }];
                return newHistory.slice(-60);
            });

            setHumidityHistory(prev => {
                setHumidity(currentHumidity => {
                    const newHistory = [...prev, { time: timestamp, value: currentHumidity, rawTime: timeRef.current }];
                    setHumidityHistory(newHistory.slice(-60));
                    return currentHumidity;
                });
                return prev;
            });

            setTemperatureHistory(prev => {
                setTemperature(currentTemp => {
                    const newHistory = [...prev, { time: timestamp, value: currentTemp, rawTime: timeRef.current }];
                    setTemperatureHistory(newHistory.slice(-60));
                    return currentTemp;
                });
                return prev;
            });

        }, 1000);

        return () => clearInterval(interval);
    }, [updatePosition, calculateHeartbeat, calculateHumidity, calculateTemperature]);

    // Fix humidity history update
    useEffect(() => {
        if (humidityHistory.length === 0) return;

        const lastEntry = humidityHistory[humidityHistory.length - 1];
        if (lastEntry && lastEntry.value !== humidity) {
            setHumidityHistory(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1] = { ...updated[updated.length - 1], value: humidity };
                }
                return updated;
            });
        }
    }, [humidity]);

    return {
        position,
        heartbeat,
        humidity,
        temperature,
        heartbeatHistory,
        humidityHistory,
        temperatureHistory,
    };
}

export default useSensorData;
