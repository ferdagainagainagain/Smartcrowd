import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { Thermometer } from 'lucide-react';

/**
 * Custom tooltip for temperature chart
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card px-4 py-3 text-sm">
                <p className="text-slate-300 text-xs mb-1">{label}</p>
                <p className="text-amber-400 font-mono font-semibold">
                    {payload[0].value}°C
                </p>
            </div>
        );
    }
    return null;
};

/**
 * Body Temperature Chart - Line chart showing last 60 seconds of temperature data
 */
export function TemperatureChart({ data, currentValue }) {
    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Thermometer className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Body Temperature</h3>
                        <p className="text-xs text-slate-400">Last 60 seconds</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-2xl font-semibold tracking-tight text-amber-400">{currentValue}</div>
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-medium">°C</div>
                </div>
            </div>

            <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(99, 102, 241, 0.1)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="time"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(99, 102, 241, 0.2)' }}
                            tickLine={false}
                            interval="preserveStartEnd"
                            minTickGap={50}
                        />
                        <YAxis
                            domain={[36, 38]}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(99, 102, 241, 0.2)' }}
                            tickLine={false}
                            ticks={[36.5, 37, 37.5]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            y={37}
                            stroke="rgba(99, 102, 241, 0.3)"
                            strokeDasharray="5 5"
                            label={{ value: 'Normal', fill: '#64748b', fontSize: 10, position: 'left' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Status indicators */}
            <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-slate-400">Normal: 36.5-37.5</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="text-xs text-slate-400">Fever: &gt;37.5</span>
                </div>
            </div>
        </div>
    );
}

export default TemperatureChart;
