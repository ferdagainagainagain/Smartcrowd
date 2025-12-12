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
import { Heart } from 'lucide-react';

/**
 * Custom tooltip for heartbeat chart
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="text-slate-300 text-xs mb-1">{label}</p>
                <p className="text-rose-400 font-mono font-semibold">
                    {payload[0].value} BPM
                </p>
            </div>
        );
    }
    return null;
};

/**
 * Heartbeat Graph - Line chart showing last 60 seconds of heart rate data
 */
export function HeartbeatChart({ data, currentValue }) {
    return (
        <div className="glass-card p-5 h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/20 rounded-lg">
                        <Heart className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Heart Rate</h3>
                        <p className="text-xs text-slate-400">Last 60 seconds</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="data-value text-rose-400">{currentValue}</div>
                    <div className="data-label">BPM</div>
                </div>
            </div>

            <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
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
                            domain={[55, 105]}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(99, 102, 241, 0.2)' }}
                            tickLine={false}
                            ticks={[60, 80, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            y={80}
                            stroke="rgba(99, 102, 241, 0.3)"
                            strokeDasharray="5 5"
                            label={{ value: 'Normal', fill: '#64748b', fontSize: 10, position: 'left' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#f43f5e"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Status indicators */}
            <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-slate-400">Normal: 60-80</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="text-xs text-slate-400">Elevated: 80-100</span>
                </div>
            </div>
        </div>
    );
}

export default HeartbeatChart;
