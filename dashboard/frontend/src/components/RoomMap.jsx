import React from 'react';

/**
 * 2D Room Map showing person position and Arduino anchors with triangulation lines
 */
export function RoomMap({ position, roomSize = 10 }) {
    const svgSize = 400;
    const padding = 40;
    const mapSize = svgSize - padding * 2;

    // Convert room coordinates (0-10m) to SVG coordinates
    const toSvgX = (x) => padding + (x / roomSize) * mapSize;
    const toSvgY = (y) => padding + ((roomSize - y) / roomSize) * mapSize; // Flip Y for visual

    // Anchor positions (Arduino devices) - 3 anchors for triangulation
    const anchors = [
        { id: 'A1', x: 0, y: 0, label: 'Anchor 1' },
        { id: 'A2', x: 10, y: 0, label: 'Anchor 2' },
        { id: 'A3', x: 5, y: 10, label: 'Anchor 3' },
    ];

    // Grid lines
    const gridLines = [];
    for (let i = 0; i <= roomSize; i += 2) {
        // Vertical lines
        gridLines.push(
            <line
                key={`v-${i}`}
                x1={toSvgX(i)}
                y1={toSvgY(0)}
                x2={toSvgX(i)}
                y2={toSvgY(roomSize)}
                className="grid-line"
            />
        );
        // Horizontal lines
        gridLines.push(
            <line
                key={`h-${i}`}
                x1={toSvgX(0)}
                y1={toSvgY(i)}
                x2={toSvgX(roomSize)}
                y2={toSvgY(i)}
                className="grid-line"
            />
        );
    }

    // Distance calculation for display
    const distances = anchors.map(anchor => {
        const dx = position.x - anchor.x;
        const dy = position.y - anchor.y;
        return Math.sqrt(dx * dx + dy * dy).toFixed(2);
    });

    return (
        <div className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Room Map
                </h2>
                <span className="text-xs text-slate-400 font-mono">10m × 10m</span>
            </div>

            <div className="relative flex justify-center">
                <svg
                    width={svgSize}
                    height={svgSize}
                    className="bg-slate-900/50 rounded-xl border border-slate-700/30"
                >
                    {/* Room boundary */}
                    <rect
                        x={padding}
                        y={padding}
                        width={mapSize}
                        height={mapSize}
                        fill="none"
                        stroke="rgba(99, 102, 241, 0.3)"
                        strokeWidth="2"
                        rx="8"
                    />

                    {/* Grid */}
                    {gridLines}

                    {/* Triangulation lines from anchors to person */}
                    {anchors.map((anchor, index) => (
                        <line
                            key={`tri-${anchor.id}`}
                            x1={toSvgX(anchor.x)}
                            y1={toSvgY(anchor.y)}
                            x2={toSvgX(position.x)}
                            y2={toSvgY(position.y)}
                            className="triangulation-line"
                            style={{
                                animation: `pulse 2s ease-in-out infinite`,
                                animationDelay: `${index * 0.5}s`
                            }}
                        />
                    ))}

                    {/* Anchor points */}
                    {anchors.map((anchor) => (
                        <g key={anchor.id}>
                            {/* Anchor glow ring */}
                            <circle
                                cx={toSvgX(anchor.x)}
                                cy={toSvgY(anchor.y)}
                                r="16"
                                fill="none"
                                stroke="rgba(34, 197, 94, 0.3)"
                                strokeWidth="2"
                            />
                            {/* Anchor point */}
                            <circle
                                cx={toSvgX(anchor.x)}
                                cy={toSvgY(anchor.y)}
                                r="8"
                                className="anchor-point"
                            />
                            {/* Anchor label */}
                            <text
                                x={toSvgX(anchor.x)}
                                y={toSvgY(anchor.y) - 24}
                                textAnchor="middle"
                                className="fill-green-400 text-xs font-medium"
                            >
                                {anchor.label}
                            </text>
                        </g>
                    ))}

                    {/* Person position - outer ring for pulse effect */}
                    <circle
                        cx={toSvgX(position.x)}
                        cy={toSvgY(position.y)}
                        r="20"
                        fill="none"
                        stroke="rgba(249, 115, 22, 0.3)"
                        strokeWidth="2"
                        className="pulse-ring"
                    />

                    {/* Person position - main dot */}
                    <circle
                        cx={toSvgX(position.x)}
                        cy={toSvgY(position.y)}
                        r="10"
                        className="person-dot"
                    />

                    {/* Person label */}
                    <text
                        x={toSvgX(position.x)}
                        y={toSvgY(position.y) - 20}
                        textAnchor="middle"
                        className="fill-orange-400 text-xs font-medium"
                    >
                        Person
                    </text>

                    {/* Axis labels */}
                    <text x={svgSize / 2} y={svgSize - 10} textAnchor="middle" className="fill-slate-500 text-xs">
                        X (meters)
                    </text>
                    <text
                        x={12}
                        y={svgSize / 2}
                        textAnchor="middle"
                        className="fill-slate-500 text-xs"
                        transform={`rotate(-90, 12, ${svgSize / 2})`}
                    >
                        Y (meters)
                    </text>
                </svg>
            </div>

            {/* Distance indicators */}
            <div className="mt-4 grid grid-cols-3 gap-3">
                {anchors.map((anchor, index) => (
                    <div key={anchor.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">Distance to {anchor.label}</div>
                        <div className="font-mono text-lg text-green-400">{distances[index]}m</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RoomMap;
