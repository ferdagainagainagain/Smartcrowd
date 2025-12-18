import React from 'react';

/**
 * RoomMap - SVG Triangulation Grid Component
 * Displays person position with triangulation lines to 3 anchors
 * Uses INLINE STYLES for guaranteed SVG rendering
 */
function RoomMap({ position, distances }) {
    // SVG dimensions and padding
    const width = 400;
    const height = 400;
    const padding = 40;

    // Room coordinates (0-10 meters)
    const roomSize = 10;

    // Scale function: room coords to SVG coords
    const scaleX = (x) => padding + (x / roomSize) * (width - 2 * padding);
    const scaleY = (y) => height - padding - (y / roomSize) * (height - 2 * padding);

    // Anchor positions in room coordinates
    const anchors = [
        { id: 'A1', x: 0, y: 0, label: 'ENTRANCE' },
        { id: 'A2', x: 10, y: 0, label: 'BACKSTAGE' },
        { id: 'A3', x: 5, y: 10, label: 'BACKSTAGE' }
    ];

    // Person position
    const personX = scaleX(position.x);
    const personY = scaleY(position.y);

    return (
        <div>
            <svg
                width={width}
                height={height}
                style={{
                    backgroundColor: '#000000',
                    display: 'block'
                }}
            >
                {/* Grid lines */}
                {[...Array(11)].map((_, i) => (
                    <React.Fragment key={`grid-${i}`}>
                        {/* Vertical lines */}
                        <line
                            x1={scaleX(i)}
                            y1={padding}
                            x2={scaleX(i)}
                            y2={height - padding}
                            style={{
                                stroke: '#333333',
                                strokeWidth: 1,
                                strokeDasharray: '2,2'
                            }}
                        />
                        {/* Horizontal lines */}
                        <line
                            x1={padding}
                            y1={scaleY(i)}
                            x2={width - padding}
                            y2={scaleY(i)}
                            style={{
                                stroke: '#333333',
                                strokeWidth: 1,
                                strokeDasharray: '2,2'
                            }}
                        />
                    </React.Fragment>
                ))}

                {/* Triangulation lines from anchors to person */}
                {anchors.map((anchor) => (
                    <line
                        key={`line-${anchor.id}`}
                        x1={scaleX(anchor.x)}
                        y1={scaleY(anchor.y)}
                        x2={personX}
                        y2={personY}
                        style={{
                            stroke: '#00FF00',
                            strokeWidth: 1,
                            strokeDasharray: '4,4'
                        }}
                    />
                ))}

                {/* Anchor points (green squares) */}
                {anchors.map((anchor) => (
                    <React.Fragment key={`anchor-${anchor.id}`}>
                        <rect
                            x={scaleX(anchor.x) - 6}
                            y={scaleY(anchor.y) - 6}
                            width={12}
                            height={12}
                            style={{
                                fill: 'transparent',
                                stroke: '#00FF00',
                                strokeWidth: 2
                            }}
                        />
                        <text
                            x={scaleX(anchor.x)}
                            y={scaleY(anchor.y) - 12}
                            style={{
                                fill: '#00FF00',
                                fontSize: '10px',
                                fontFamily: "'Courier New', Consolas, monospace",
                                textAnchor: 'middle'
                            }}
                        >
                            {anchor.id}
                        </text>
                    </React.Fragment>
                ))}

                {/* Person position (amber dot) */}
                <circle
                    cx={personX}
                    cy={personY}
                    r={8}
                    style={{
                        fill: '#FFB000',
                        stroke: '#FFB000',
                        strokeWidth: 2
                    }}
                />
                <text
                    x={personX}
                    y={personY - 14}
                    style={{
                        fill: '#FFB000',
                        fontSize: '10px',
                        fontFamily: "'Courier New', Consolas, monospace",
                        textAnchor: 'middle'
                    }}
                >
                    TARGET_01
                </text>

                {/* Room labels */}
                <text
                    x={padding + 5}
                    y={height - padding + 20}
                    style={{
                        fill: '#00FF00',
                        fontSize: '10px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}
                >
                    ENTRANCE (A1)
                </text>
                <text
                    x={width - padding - 80}
                    y={padding - 10}
                    style={{
                        fill: '#00FF00',
                        fontSize: '10px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}
                >
                    BACKSTAGE (A2/A3)
                </text>

                {/* Coordinate labels */}
                <text
                    x={padding - 25}
                    y={height - padding + 5}
                    style={{
                        fill: '#555555',
                        fontSize: '9px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}
                >
                    0m
                </text>
                <text
                    x={width - padding + 5}
                    y={height - padding + 5}
                    style={{
                        fill: '#555555',
                        fontSize: '9px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}
                >
                    10m
                </text>
            </svg>

            {/* Distance row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '8px 0',
                borderTop: '1px solid #333333',
                marginTop: '8px'
            }}>
                <span style={{
                    color: '#00FF00',
                    fontSize: '11px',
                    fontFamily: "'Courier New', Consolas, monospace"
                }}>
                    DIST_A1: {distances.A1.toFixed(1)}m
                </span>
                <span style={{
                    color: '#00FF00',
                    fontSize: '11px',
                    fontFamily: "'Courier New', Consolas, monospace"
                }}>
                    DIST_A2: {distances.A2.toFixed(1)}m
                </span>
                <span style={{
                    color: '#00FF00',
                    fontSize: '11px',
                    fontFamily: "'Courier New', Consolas, monospace"
                }}>
                    DIST_A3: {distances.A3.toFixed(1)}m
                </span>
            </div>
        </div>
    );
}

export default RoomMap;
