import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

/**
 * TemperatureChart - Terminal-style body temperature chart
 * Step-type lines with Bloomberg Terminal aesthetic
 * NO warning thresholds (sensor values are unreliable)
 */
function TemperatureChart({ data, currentValue }) {
    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
            }}>
                <span style={{
                    color: '#FFB000',
                    fontSize: '24px',
                    fontFamily: "'Courier New', Consolas, monospace",
                    fontWeight: 'bold'
                }}>
                    {currentValue}°C
                </span>
                <span style={{
                    color: '#555555',
                    fontSize: '10px',
                    fontFamily: "'Courier New', Consolas, monospace"
                }}>
                    RAW_SENSOR_DATA
                </span>
            </div>

            <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <CartesianGrid
                        stroke="#333333"
                        strokeDasharray="1 1"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="time"
                        hide={true}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fill: '#00FF00', fontSize: 10, fontFamily: "'Courier New', monospace" }}
                        axisLine={{ stroke: '#333333' }}
                        tickLine={{ stroke: '#333333' }}
                        width={35}
                    />
                    <Line
                        type="stepAfter"
                        dataKey="value"
                        stroke="#FFB000"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TemperatureChart;
