import React from 'react';
import { useSensorData } from './hooks/useSensorData';
import { RoomMap } from './components/RoomMap';
import { HeartbeatChart } from './components/HeartbeatChart';
import { TemperatureChart } from './components/TemperatureChart';
import { HumidityChart } from './components/HumidityChart';
import { DataCard } from './components/DataCard';
import { Zap } from 'lucide-react';

function App() {
    const {
        position,
        heartbeat,
        humidity,
        temperature,
        heartbeatHistory,
        humidityHistory,
        temperatureHistory
    } = useSensorData();

    return (
        <div className="min-h-screen p-4 lg:p-6">
            {/* Header */}
            <header className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                        SmartCrowd
                    </h1>
                    <p className="text-sm text-slate-400">
                        Real-time smart environment monitoring
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-green-400 font-medium">System Online</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full">
                        <Zap className="w-3 h-3 text-indigo-400" />
                        <span className="text-xs text-indigo-400 font-medium">Edge Processing Active</span>
                    </div>
                </div>
            </header>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Room Map */}
                <div className="lg:col-span-2">
                    <RoomMap position={position} roomSize={10} />
                </div>

                {/* Right Column - All 3 Charts Stacked */}
                <div className="flex flex-col gap-4">
                    {/* Chart 1: Heart Rate */}
                    <HeartbeatChart
                        data={heartbeatHistory}
                        currentValue={heartbeat}
                    />

                    {/* Chart 2: Body Temperature */}
                    <TemperatureChart
                        data={temperatureHistory}
                        currentValue={temperature}
                    />

                    {/* Chart 3: Humidity */}
                    <HumidityChart
                        data={humidityHistory}
                        currentValue={humidity}
                    />
                </div>
            </div>

            {/* Data Card - Full width at bottom */}
            <div className="mt-4">
                <DataCard
                    position={position}
                    heartbeat={heartbeat}
                    humidity={humidity}
                    temperature={temperature}
                />
            </div>

            {/* Footer */}
            <footer className="mt-6 text-center text-xs text-slate-500">
                <p>IoT Edge Computing Dashboard • Simulated data for demonstration</p>
                <p className="mt-1">Arduino Anchors: (0,0) and (10,0) • Room: 10m × 10m</p>
            </footer>
        </div>
    );
}

export default App;
