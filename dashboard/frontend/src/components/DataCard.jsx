import { useState, useEffect } from 'react';

/**
 * DataCard - Terminal-style status footer
 * Displays current sensor values and connection status
 */
function DataCard({ heartbeat, temperature, acceleration, position, room, systemOn, connected }) {
    const [timestamp, setTimestamp] = useState(new Date());

    // Update timestamp every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTimestamp(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date) => {
        return date.toISOString().replace('T', ' ').substring(0, 19);
    };

    return (
        <div style={{
            border: '1px solid #333333',
            backgroundColor: '#000000',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
        }}>
            {/* Sensor Values */}
            <div style={{
                display: 'flex',
                gap: '24px'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <span style={{
                        color: '#555555',
                        fontSize: '10px',
                        fontFamily: "'Courier New', Consolas, monospace",
                        letterSpacing: '0.05em'
                    }}>
                        HEART_RATE
                    </span>
                    <span style={{
                        color: '#FFB000',
                        fontSize: '14px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}>
                        {heartbeat} BPM
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <span style={{
                        color: '#555555',
                        fontSize: '10px',
                        fontFamily: "'Courier New', Consolas, monospace",
                        letterSpacing: '0.05em'
                    }}>
                        BODY_TEMP
                    </span>
                    <span style={{
                        color: '#FFB000',
                        fontSize: '14px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}>
                        {temperature}°C
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <span style={{
                        color: '#555555',
                        fontSize: '10px',
                        fontFamily: "'Courier New', Consolas, monospace",
                        letterSpacing: '0.05em'
                    }}>
                        MOTION
                    </span>
                    <span style={{
                        color: '#FFB000',
                        fontSize: '14px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}>
                        {acceleration} m/s²
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <span style={{
                        color: '#555555',
                        fontSize: '10px',
                        fontFamily: "'Courier New', Consolas, monospace",
                        letterSpacing: '0.05em'
                    }}>
                        POSITION
                    </span>
                    <span style={{
                        color: '#00FF00',
                        fontSize: '14px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}>
                        ({position.x}, {position.y})
                    </span>
                </div>
            </div>

            {/* Status Info */}
            <div style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <span style={{
                        color: '#555555',
                        fontSize: '10px',
                        fontFamily: "'Courier New', Consolas, monospace",
                        letterSpacing: '0.05em'
                    }}>
                        DEVICE_STATE
                    </span>
                    <span style={{
                        color: systemOn ? '#00FF00' : '#FF3333',
                        fontSize: '14px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}>
                        {systemOn ? 'SYSTEM_ON' : 'SYSTEM_OFF'}
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <span style={{
                        color: '#555555',
                        fontSize: '10px',
                        fontFamily: "'Courier New', Consolas, monospace",
                        letterSpacing: '0.05em'
                    }}>
                        ROOM
                    </span>
                    <span style={{
                        color: '#00FF00',
                        fontSize: '14px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}>
                        {room}
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <span style={{
                        color: '#555555',
                        fontSize: '10px',
                        fontFamily: "'Courier New', Consolas, monospace",
                        letterSpacing: '0.05em'
                    }}>
                        TIMESTAMP
                    </span>
                    <span style={{
                        color: '#FFB000',
                        fontSize: '14px',
                        fontFamily: "'Courier New', Consolas, monospace"
                    }}>
                        {formatTime(timestamp)}
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: connected ? '#00FF00' : '#FF3333',
                        borderRadius: '0'
                    }} />
                    <span style={{
                        color: connected ? '#00FF00' : '#FF3333',
                        fontSize: '12px',
                        fontFamily: "'Courier New', Consolas, monospace",
                        letterSpacing: '0.05em'
                    }}>
                        {connected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default DataCard;
