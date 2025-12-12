import React from 'react';
import { MapPin, Activity, Thermometer, Clock, Wifi, Cpu, Droplets } from 'lucide-react';

/**
 * DataCard - Displays current raw sensor values
 */
export function DataCard({ position, heartbeat, humidity, temperature }) {
    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    Live Sensor Data
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Wifi className="w-3 h-3 text-green-500 animate-pulse" />
                    <span>Connected</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Position X */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 transition-all hover:border-indigo-500/50">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <span className="data-label">Position X</span>
                    </div>
                    <div className="data-value text-orange-400">
                        {position.x.toFixed(2)}
                        <span className="text-sm text-slate-400 ml-1">m</span>
                    </div>
                </div>

                {/* Position Y */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 transition-all hover:border-indigo-500/50">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <span className="data-label">Position Y</span>
                    </div>
                    <div className="data-value text-orange-400">
                        {position.y.toFixed(2)}
                        <span className="text-sm text-slate-400 ml-1">m</span>
                    </div>
                </div>

                {/* Heartbeat */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 transition-all hover:border-rose-500/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-rose-400" />
                        <span className="data-label">Heart Rate</span>
                    </div>
                    <div className="data-value text-rose-400">
                        {heartbeat}
                        <span className="text-sm text-slate-400 ml-1">bpm</span>
                    </div>
                </div>

                {/* Temperature */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 transition-all hover:border-amber-500/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-4 h-4 text-amber-400" />
                        <span className="data-label">Body Temp</span>
                    </div>
                    <div className="data-value text-amber-400">
                        {temperature}
                        <span className="text-sm text-slate-400 ml-1">°C</span>
                    </div>
                </div>

                {/* Humidity */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 transition-all hover:border-cyan-500/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Droplets className="w-4 h-4 text-cyan-400" />
                        <span className="data-label">Humidity</span>
                    </div>
                    <div className="data-value text-cyan-400">
                        {humidity}
                        <span className="text-sm text-slate-400 ml-1">%</span>
                    </div>
                </div>
            </div>

            {/* Timestamp */}
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Last updated: {currentTime}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Real-time (1s interval)</span>
                </div>
            </div>
        </div>
    );
}

export default DataCard;
