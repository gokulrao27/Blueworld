import React, { useMemo } from 'react';
import { VizDevice } from '../types';

interface DeviceDetailsPanelProps {
  device: VizDevice;
  onClose: () => void;
}

const DeviceDetailsPanel: React.FC<DeviceDetailsPanelProps> = ({ device, onClose }) => {
  
  // Estimate distance in meters using Log-Distance Path Loss Model
  // Distance = 10 ^ ((TxPower - RSSI) / (10 * N))
  // We assume TxPower is -59 (1 meter reference) and N (environment factor) is 2.5
  const estimatedDistance = useMemo(() => {
    const txPower = device.txPower || -59;
    const n = 2.5; 
    const dist = Math.pow(10, (txPower - device.rssi) / (10 * n));
    return dist < 1 ? dist.toFixed(2) + " cm" : dist.toFixed(2) + " m";
  }, [device.rssi, device.txPower]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-black/80 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,255,0.1)] text-white overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold font-rajdhani text-cyan-400 tracking-wide drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
              {device.name}
            </h2>
            <div className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-wider">
              {device.category}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Signal Strength</div>
            <div className="text-2xl font-mono text-cyan-300">{device.rssi} <span className="text-sm text-gray-500">dBm</span></div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Est. Distance</div>
            <div className="text-2xl font-mono text-cyan-300">{estimatedDistance}</div>
          </div>
        </div>

        {/* Details Table */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex flex-col border-b border-white/10 pb-2">
            <span className="text-gray-500 mb-1">DEVICE ID</span>
            <span className="text-gray-300 break-all select-all">{device.id}</span>
          </div>

          {device.txPower !== undefined && (
             <div className="flex flex-col border-b border-white/10 pb-2">
              <span className="text-gray-500 mb-1">TX POWER</span>
              <span className="text-gray-300">{device.txPower} dBm</span>
            </div>
          )}

          {device.manufacturerData && (
             <div className="flex flex-col border-b border-white/10 pb-2">
              <span className="text-gray-500 mb-1">MANUFACTURER DATA</span>
              <pre className="text-gray-300 whitespace-pre-wrap font-mono bg-black/30 p-2 rounded">{device.manufacturerData}</pre>
            </div>
          )}

          {device.uuids && device.uuids.length > 0 && (
            <div className="flex flex-col border-b border-white/10 pb-2">
              <span className="text-gray-500 mb-1">SERVICE UUIDS</span>
              <div className="flex flex-wrap gap-1">
                {device.uuids.map(uuid => (
                  <span key={uuid} className="bg-cyan-900/30 text-cyan-200 px-1 rounded">{uuid}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col pt-2">
            <span className="text-gray-500 mb-1">LAST SEEN</span>
            <span className="text-gray-300">{new Date(device.lastSeen).toLocaleTimeString()}</span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
             <div className="text-[10px] text-cyan-500/50 animate-pulse">LIVE SIGNAL DATA STREAM</div>
        </div>

      </div>
    </div>
  );
};

export default DeviceDetailsPanel;