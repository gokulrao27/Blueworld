import React, { useState, useCallback, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import { BluetoothService } from './services/bluetoothService';
import { VizDevice } from './types';
import { playPing } from './utils/sound';

const App: React.FC = () => {
  const [devices, setDevices] = useState<Map<string, VizDevice>>(new Map());
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bluetoothService = useRef<BluetoothService | null>(null);

  // Initialize service
  useEffect(() => {
    bluetoothService.current = new BluetoothService((updatedDevice) => {
      setDevices((prev) => {
        const next = new Map(prev);
        // If it's a new device we haven't seen before, play a sound
        if (!prev.has(updatedDevice.id)) {
           playPing(1200, 'sine');
        } else {
           // Subtle tick for updates? maybe too noisy
        }
        next.set(updatedDevice.id, updatedDevice);
        return next;
      });
    });
  }, []);

  const handleScan = async () => {
    setError(null);
    setScanning(true);
    try {
      if (bluetoothService.current) {
        await bluetoothService.current.scanForDevice();
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') { // Ignore user cancellation
        setError(err.message || 'Failed to scan');
      }
    } finally {
      setScanning(false);
    }
  };

  const deviceList = Array.from(devices.values());

  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Scene devices={deviceList} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        
        {/* Header */}
        <div className="pointer-events-auto max-w-lg">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            INVISIBLE BLUETOOTH UNIVERSE
          </h1>
          <p className="mt-4 text-cyan-100/80 text-lg leading-relaxed max-w-md backdrop-blur-md bg-black/30 p-4 rounded-lg border-l-2 border-cyan-500">
            Visualize the invisible digital aura surrounding you. 
            Scan to detect Bluetooth LE devices and render them in real-time 3D space based on signal strength.
          </p>
        </div>

        {/* Device Counter & Info */}
        <div className="pointer-events-auto absolute top-6 right-6 flex flex-col items-end gap-2">
           <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 w-64">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Detected Signals</div>
              <div className="text-4xl font-mono font-bold text-cyan-400">{devices.size}</div>
              
              {deviceList.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {deviceList.map((d: VizDevice) => (
                    <div key={d.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-1">
                      <span className="truncate max-w-[120px] text-gray-300">{d.name}</span>
                      <span className="font-mono text-cyan-600">{d.rssi}dB</span>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Footer Controls */}
        <div className="pointer-events-auto flex flex-col items-center justify-end pb-8 w-full">
          
          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-md backdrop-blur-sm text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={scanning}
            className={`
              group relative overflow-hidden rounded-full px-12 py-4 
              bg-transparent border border-cyan-500/50 
              text-cyan-400 font-bold text-xl tracking-widest uppercase
              transition-all duration-300
              hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <span className="relative z-10 flex items-center gap-3">
              {scanning ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Scan Frequency
                </>
              )}
            </span>
            {/* Hover Glint */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
          </button>

          <div className="mt-4 text-xs text-gray-500 font-mono text-center max-w-lg">
             Requires a Bluetooth-enabled device and a browser that supports Web Bluetooth (Chrome, Edge, Opera).
             <br/>Click "Scan" multiple times to add more devices to the visualization.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;