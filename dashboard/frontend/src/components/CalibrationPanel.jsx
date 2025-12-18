import { useState } from 'react';

/**
 * CalibrationPanel - RSSI calibration parameters display and editor
 * Shows current parameters for each anchor and allows live updates
 */
function CalibrationPanel({ calibration, rssi, onUpdate }) {
    const [editing, setEditing] = useState(null);
    const [tempRssi1m, setTempRssi1m] = useState('');
    const [tempN, setTempN] = useState('');

    const startEdit = (anchorId) => {
        setEditing(anchorId);
        setTempRssi1m(calibration[anchorId]?.rssi_1m?.toString() || '-40');
        setTempN(calibration[anchorId]?.n?.toString() || '2.0');
    };

    const saveEdit = () => {
        if (editing && onUpdate) {
            onUpdate(editing, parseFloat(tempRssi1m), parseFloat(tempN));
        }
        setEditing(null);
    };

    const cancelEdit = () => {
        setEditing(null);
    };

    const anchorOrder = ['A1', 'A2', 'A3'];
    const rssiMap = { 'A1': rssi?.rssi1, 'A2': rssi?.rssi2, 'A3': rssi?.rssi3 };

    return (
        <div style={{
            border: '1px solid var(--terminal-green)',
            backgroundColor: 'var(--terminal-bg)',
            padding: '12px',
            marginBottom: '8px'
        }}>
            <div style={{
                color: 'var(--terminal-green)',
                fontSize: '12px',
                letterSpacing: '0.1em',
                marginBottom: '12px',
                borderBottom: '1px solid var(--terminal-border)',
                paddingBottom: '4px'
            }}>
                RSSI_CALIBRATION_PARAMETERS
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
            }}>
                {anchorOrder.map((anchorId) => {
                    const anchor = calibration[anchorId];
                    if (!anchor) return null;

                    const isEditing = editing === anchorId;

                    return (
                        <div
                            key={anchorId}
                            style={{
                                border: '1px solid var(--terminal-border)',
                                padding: '8px'
                            }}
                        >
                            {/* Anchor Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px'
                            }}>
                                <span style={{
                                    color: 'var(--terminal-amber)',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}>
                                    {anchorId} - {anchor.name}
                                </span>
                                <span style={{
                                    color: 'var(--terminal-green)',
                                    fontSize: '11px'
                                }}>
                                    ({anchor.x}, {anchor.y})
                                </span>
                            </div>

                            {/* Current RSSI */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '4px'
                            }}>
                                <span style={{ color: '#555', fontSize: '10px' }}>CURRENT_RSSI:</span>
                                <span style={{
                                    color: 'var(--terminal-amber)',
                                    fontSize: '12px'
                                }}>
                                    {rssiMap[anchorId]?.toFixed(1) || 'N/A'} dBm
                                </span>
                            </div>

                            {isEditing ? (
                                <>
                                    {/* Edit Mode */}
                                    <div style={{ marginBottom: '4px' }}>
                                        <label style={{ color: '#555', fontSize: '10px', display: 'block' }}>
                                            RSSI_AT_1M:
                                        </label>
                                        <input
                                            type="number"
                                            value={tempRssi1m}
                                            onChange={(e) => setTempRssi1m(e.target.value)}
                                            style={{
                                                width: '100%',
                                                backgroundColor: 'var(--terminal-bg)',
                                                border: '1px solid var(--terminal-green)',
                                                color: 'var(--terminal-green)',
                                                padding: '4px',
                                                fontFamily: "'Courier New', monospace",
                                                fontSize: '12px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <label style={{ color: '#555', fontSize: '10px', display: 'block' }}>
                                            PATH_LOSS_N:
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={tempN}
                                            onChange={(e) => setTempN(e.target.value)}
                                            style={{
                                                width: '100%',
                                                backgroundColor: 'var(--terminal-bg)',
                                                border: '1px solid var(--terminal-green)',
                                                color: 'var(--terminal-green)',
                                                padding: '4px',
                                                fontFamily: "'Courier New', monospace",
                                                fontSize: '12px'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={saveEdit}
                                            style={{
                                                flex: 1,
                                                backgroundColor: 'var(--terminal-green)',
                                                border: 'none',
                                                color: 'var(--terminal-bg)',
                                                padding: '4px',
                                                fontFamily: "'Courier New', monospace",
                                                fontSize: '10px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            SAVE
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            style={{
                                                flex: 1,
                                                backgroundColor: 'transparent',
                                                border: '1px solid var(--terminal-border)',
                                                color: '#555',
                                                padding: '4px',
                                                fontFamily: "'Courier New', monospace",
                                                fontSize: '10px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* View Mode */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '4px'
                                    }}>
                                        <span style={{ color: '#555', fontSize: '10px' }}>RSSI_AT_1M:</span>
                                        <span style={{
                                            color: 'var(--terminal-green)',
                                            fontSize: '12px'
                                        }}>
                                            {anchor.rssi_1m} dBm
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{ color: '#555', fontSize: '10px' }}>PATH_LOSS_N:</span>
                                        <span style={{
                                            color: 'var(--terminal-green)',
                                            fontSize: '12px'
                                        }}>
                                            {anchor.n}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => startEdit(anchorId)}
                                        style={{
                                            width: '100%',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--terminal-green)',
                                            color: 'var(--terminal-green)',
                                            padding: '4px',
                                            fontFamily: "'Courier New', monospace",
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        [ EDIT ]
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Formula Reference */}
            <div style={{
                marginTop: '12px',
                padding: '8px',
                borderTop: '1px solid var(--terminal-border)',
                color: '#555',
                fontSize: '10px',
                fontFamily: "'Courier New', monospace"
            }}>
                FORMULA: distance = 10 ^ ((RSSI_1m - RSSI) / (10 * n))
            </div>
        </div>
    );
}

export default CalibrationPanel;
