import React, { useState, useCallback, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import DeviceDetailsPanel from './components/DeviceDetailsPanel';
import { BluetoothService } from './services/bluetoothService';
import { VizDevice } from './types';
import { playPing } from './utils/sound';

const App: React.FC = () => {
  const [devices, setDevices] = useState<Map<string, VizDevice>>(new Map());
  const [selectedDevice, setSelectedDevice] = useState<VizDevice | null>(null);
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
        }
        next.set(updatedDevice.id, updatedDevice);
        
        // Live update selected device if it's currently open
        if (selectedDevice && selectedDevice.id === updatedDevice.id) {
            setSelectedDevice(updatedDevice);
        }
        
        return next;
      });
    });
  }, [selectedDevice]); // Re-bind if selectedDevice changes to ensure closure captures it correctly? Actually better handled inside setDevices

  // We need to keep the ref consistent but update the internal callback logic if we want live updates in the panel
  // The above effect has a dependency on selectedDevice which might cause service recreation.
  // Better approach: Just use the devices map to update the selected device during render or use a ref for selectedID.
  // However, simpler for now:
  useEffect(() => {
      if (selectedDevice) {
          const liveDevice = devices.get(selectedDevice.id);
          if (liveDevice && liveDevice !== selectedDevice) {
              setSelectedDevice(liveDevice);
          }
      }
  }, [devices, selectedDevice]);


  const handleScan = async () => {
    setError(null);
    setScanning(true);
    
    // Safety timeout to reset scanning state if user ignores the dialog
    const timeoutId = setTimeout(() => {
        setScanning(false);
    }, 60000); // 1 minute timeout

    try {
      if (bluetoothService.current) {
        await bluetoothService.current.scanForDevice();
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError' && err.message !== 'User cancelled the requestDevice() chooser.') {
        setError(err.message || 'Failed to scan');
      }
    } finally {
      clearTimeout(timeoutId);
      setScanning(false);
    }
  };

  const handleDemo = () => {
    if (bluetoothService.current) {
        bluetoothService.current.simulateDevice();
    }
  };
  
  const handleSelectDevice = (device: VizDevice) => {
      setSelectedDevice(device);
  };
  
  const handleClosePanel = () => {
      setSelectedDevice(null);
  };

  const deviceList = Array.from(devices.values());

  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Scene devices={deviceList} onSelectDevice={handleSelectDevice} />
      </div>

      {/* Detail Panel Modal */}
      {selectedDevice && (
        <DeviceDetailsPanel device={selectedDevice} onClose={handleClosePanel} />
      )}

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
                    <div 
                        key={d.id} 
                        className="flex justify-between items-center text-xs border-b border-white/5 pb-1 cursor-pointer hover:bg-white/10 p-1 rounded"
                        onClick={() => handleSelectDevice(d)}
                    >
                      <span className="truncate max-w-[120px] text-gray-300">{d.name}</span>
                      <span className="font-mono text-cyan-600">{d.rssi}dB</span>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Footer Controls */}
        <div className="pointer-events-auto flex flex-col items-center justify-end pb-8 w-full gap-4">
          
          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-md backdrop-blur-sm text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
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
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
              </button>
          </div>
          
          <button 
             onClick={handleDemo}
             className="text-xs text-gray-600 hover:text-cyan-400 transition-colors uppercase tracking-widest border-b border-transparent hover:border-cyan-400"
          >
            Simulate Device (Demo)
          </button>

          <div className="text-[10px] text-gray-500 font-mono text-center max-w-lg leading-tight">
             Requires a Bluetooth-enabled device and a browser that supports Web Bluetooth (Chrome, Edge, Opera).
             <br/>Select a device from the list to visualize it.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;