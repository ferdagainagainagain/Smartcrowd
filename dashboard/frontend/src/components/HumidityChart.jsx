import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Droplets } from 'lucide-react';

/**
 * Custom tooltip for humidity chart
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="text-slate-300 text-xs mb-1">{label}</p>
                <p className="text-cyan-400 font-mono font-semibold">
                    {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

/**
 * Humidity Chart - Area chart showing humidity trends
 */
export function HumidityChart({ data, currentValue }) {
    return (
        <div className="glass-card p-5 h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Droplets className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Humidity</h3>
                        <p className="text-xs text-slate-400">Environmental sensor</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="data-value text-cyan-400">{currentValue}</div>
                    <div className="data-label">%RH</div>
                </div>
            </div>

            <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
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
                            domain={[35, 55]}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(99, 102, 241, 0.2)' }}
                            tickLine={false}
                            ticks={[40, 45, 50]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            fill="url(#humidityGradient)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Status indicators */}
            <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span className="text-xs text-slate-400">Optimal: 40-50%</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-slate-400">Stable</span>
                </div>
            </div>
        </div>
    );
}

export default HumidityChart;
