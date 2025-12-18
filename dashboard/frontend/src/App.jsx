import { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import RoomMap from './components/RoomMap';
import HeartbeatChart from './components/HeartbeatChart';
import TemperatureChart from './components/TemperatureChart';
import AccelerationChart from './components/AccelerationChart';
import DataCard from './components/DataCard';
import CalibrationPanel from './components/CalibrationPanel';
import './index.css';

function App() {
  const {
    connected,
    fall,
    systemOn,
    heartbeat,
    temperature,
    acceleration,
    position,
    distances,
    rssi,
    room,
    heartbeatHistory,
    temperatureHistory,
    accelerationHistory,
    calibration,
    updateCalibration
  } = useWebSocket('ws://localhost:8000/ws');

  // Warning state - sticky until resolved
  const [warningActive, setWarningActive] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Calibration panel visibility
  const [showCalibration, setShowCalibration] = useState(false);

  // Fall threshold (configurable)
  const FALL_THRESHOLD = 7.5;

  // Check for warning conditions
  // ONLY fall and emergency button - NO temp/heartbeat thresholds
  useEffect(() => {
    if (!warningActive) {
      let message = '';

      // Priority: Emergency button > Fall detection
      if (fall === 1) {
        message = 'EMERGENCY BUTTON PRESSED';
      } else if (acceleration > FALL_THRESHOLD) {
        message = 'PERSON HAS FALLEN';
      }

      if (message) {
        setWarningActive(true);
        setWarningMessage(message);
      }
    }
  }, [fall, acceleration, warningActive]);

  const resolveAlert = () => {
    setWarningActive(false);
    setWarningMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--terminal-bg)',
      padding: '8px',
      fontFamily: "'Courier New', Consolas, monospace"
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--terminal-border)',
        paddingBottom: '8px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          color: 'var(--terminal-amber)',
          fontSize: '18px',
          fontWeight: 'bold',
          letterSpacing: '0.1em'
        }}>
          {'>'} SMARTCROWD_TERMINAL
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={() => setShowCalibration(!showCalibration)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--terminal-green)',
              color: 'var(--terminal-green)',
              padding: '4px 12px',
              fontFamily: "'Courier New', Consolas, monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            {showCalibration ? '[ HIDE CALIBRATION ]' : '[ CALIBRATION ]'}
          </button>
          <div style={{
            color: connected ? 'var(--terminal-green)' : 'var(--terminal-red)',
            fontSize: '12px',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: connected ? 'var(--terminal-green)' : 'var(--terminal-red)'
            }} />
            {connected ? 'CONNECTED' : 'DISCONNECTED'} | ROOM: {room}
          </div>
        </div>
      </header>

      {/* Calibration Panel */}
      {showCalibration && (
        <CalibrationPanel
          calibration={calibration}
          rssi={rssi}
          onUpdate={updateCalibration}
        />
      )}

      {/* Alert Banner */}
      {warningActive && (
        <div style={{
          backgroundColor: 'var(--terminal-red)',
          color: 'var(--terminal-bg)',
          padding: '8px 16px',
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'flash-alert 0.5s step-end infinite'
        }}>
          <span style={{
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            fontSize: '14px'
          }}>
            ⚠ ALERT: {warningMessage}
          </span>
          <button
            onClick={resolveAlert}
            style={{
              backgroundColor: 'var(--terminal-bg)',
              border: '1px solid var(--terminal-bg)',
              color: 'var(--terminal-red)',
              padding: '4px 12px',
              fontFamily: "'Courier New', Consolas, monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            [ RESOLVE ]
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: warningActive ? '2fr 1fr' : '1fr 1fr 1fr',
        gap: '8px',
        marginBottom: '8px'
      }}>
        {/* Map - only shown in warning mode */}
        {warningActive && (
          <div style={{
            border: '1px solid var(--terminal-border)',
            backgroundColor: 'var(--terminal-bg)',
            padding: '8px'
          }}>
            <div style={{
              color: 'var(--terminal-amber)',
              fontSize: '12px',
              letterSpacing: '0.1em',
              marginBottom: '8px',
              borderBottom: '1px solid var(--terminal-border)',
              paddingBottom: '4px'
            }}>
              TRIANGULATION_GRID
            </div>
            <RoomMap position={position} distances={distances} />
            {/* Warning Mode Label */}
            <div style={{
              marginTop: '8px',
              padding: '8px',
              border: '1px solid var(--terminal-red)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                color: 'var(--terminal-red)',
                fontSize: '12px',
                letterSpacing: '0.05em'
              }}>
                WARNING_MODE: {warningMessage}
              </span>
              <button
                onClick={resolveAlert}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--terminal-red)',
                  color: 'var(--terminal-red)',
                  padding: '4px 12px',
                  fontFamily: "'Courier New', Consolas, monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                [ ISSUE RESOLVED ]
              </button>
            </div>
          </div>
        )}

        {/* Charts Container */}
        <div style={{
          display: warningActive ? 'flex' : 'contents',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Heartbeat Chart */}
          <div style={{
            border: '1px solid var(--terminal-border)',
            backgroundColor: 'var(--terminal-bg)',
            padding: '8px'
          }}>
            <div style={{
              color: 'var(--terminal-amber)',
              fontSize: '12px',
              letterSpacing: '0.1em',
              marginBottom: '8px',
              borderBottom: '1px solid var(--terminal-border)',
              paddingBottom: '4px'
            }}>
              HEART_RATE_MONITOR
            </div>
            <HeartbeatChart data={heartbeatHistory} currentValue={heartbeat} />
          </div>

          {/* Temperature Chart */}
          <div style={{
            border: '1px solid var(--terminal-border)',
            backgroundColor: 'var(--terminal-bg)',
            padding: '8px'
          }}>
            <div style={{
              color: 'var(--terminal-amber)',
              fontSize: '12px',
              letterSpacing: '0.1em',
              marginBottom: '8px',
              borderBottom: '1px solid var(--terminal-border)',
              paddingBottom: '4px'
            }}>
              BODY_TEMP_SENSOR
            </div>
            <TemperatureChart data={temperatureHistory} currentValue={temperature} />
          </div>

          {/* Acceleration Chart */}
          <div style={{
            border: '1px solid var(--terminal-border)',
            backgroundColor: 'var(--terminal-bg)',
            padding: '8px'
          }}>
            <div style={{
              color: 'var(--terminal-amber)',
              fontSize: '12px',
              letterSpacing: '0.1em',
              marginBottom: '8px',
              borderBottom: '1px solid var(--terminal-border)',
              paddingBottom: '4px'
            }}>
              MOTION_SENSOR
            </div>
            <AccelerationChart data={accelerationHistory} currentValue={acceleration} fallThreshold={FALL_THRESHOLD} />
          </div>
        </div>
      </div>

      {/* Data Card Footer */}
      <DataCard
        heartbeat={heartbeat}
        temperature={temperature}
        acceleration={acceleration}
        position={position}
        room={room}
        systemOn={systemOn}
        connected={connected}
      />
    </div>
  );
}

export default App;
