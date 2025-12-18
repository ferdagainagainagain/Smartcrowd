import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * AccelerationChart - Terminal-style motion/acceleration chart
 * Step-type lines with Bloomberg Terminal aesthetic
 * Fall threshold is configurable (default 7.5)
 */
function AccelerationChart({ data, currentValue, fallThreshold = 7.5 }) {
    const isWarning = currentValue > fallThreshold;

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
            }}>
                <span style={{
                    color: isWarning ? '#FF3333' : '#FFB000',
                    fontSize: '24px',
                    fontFamily: "'Courier New', Consolas, monospace",
                    fontWeight: 'bold'
                }}>
                    {currentValue} m/s²
                </span>
                <span style={{
                    color: '#555555',
                    fontSize: '10px',
                    fontFamily: "'Courier New', Consolas, monospace"
                }}>
                    FALL_THRESHOLD: {fallThreshold}
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
                        domain={[0, 15]}
                        tick={{ fill: '#00FF00', fontSize: 10, fontFamily: "'Courier New', monospace" }}
                        axisLine={{ stroke: '#333333' }}
                        tickLine={{ stroke: '#333333' }}
                        width={30}
                    />
                    <ReferenceLine
                        y={fallThreshold}
                        stroke="#FF3333"
                        strokeDasharray="3 3"
                        label={{ value: 'FALL', fill: '#FF3333', fontSize: 8, position: 'right' }}
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

export default AccelerationChart;
