import { BluetoothDevice, VizDevice, DeviceCategory, BluetoothDeviceEvent } from '../types';
import { Vector3 } from 'three';
import { COLORS, DEVICE_KEYWORDS, MAX_DISTANCE, MIN_DISTANCE } from '../constants';

// Helper to convert DataView to Hex String
const buf2hex = (buffer: ArrayBuffer) => {
  return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
};

export class BluetoothService {
  private updateCallback: (device: VizDevice) => void;

  constructor(onDeviceUpdate: (device: VizDevice) => void) {
    this.updateCallback = onDeviceUpdate;
  }

  // Determine category from name
  private getCategory(name: string): DeviceCategory {
    const lowerName = name.toLowerCase();
    for (const [key, category] of Object.entries(DEVICE_KEYWORDS)) {
      if (lowerName.includes(key)) {
        return category;
      }
    }
    return DeviceCategory.GENERIC;
  }

  // Map RSSI to distance (approximate log scale)
  private getDistance(rssi: number): number {
    // RSSI typically -30 (close) to -100 (far)
    const clampedRssi = Math.max(-100, Math.min(-30, rssi));
    const factor = (Math.abs(clampedRssi) - 30) / 70; // 0 to 1
    return MIN_DISTANCE + factor * (MAX_DISTANCE - MIN_DISTANCE);
  }

  // Generate a random position on a sphere surface at a specific radius
  private getPosition(distance: number, existingPos?: Vector3): Vector3 {
    if (existingPos) {
      // If we already have a direction, keep the direction but update distance
      return existingPos.clone().normalize().multiplyScalar(distance);
    }
    
    // Random direction
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    const x = distance * Math.sin(phi) * Math.cos(theta);
    const y = distance * Math.sin(phi) * Math.sin(theta);
    const z = distance * Math.cos(phi);
    
    return new Vector3(x, y, z);
  }

  public async scanForDevice(): Promise<void> {
    if (!navigator.bluetooth) {
      throw new Error("Web Bluetooth is not supported in this browser.");
    }

    try {
      // Note: optionalServices is required when acceptAllDevices is true
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [] 
      });

      if (device) {
        this.handleNewDevice(device);
      }
    } catch (error) {
      console.error("Bluetooth scan cancelled or failed:", error);
      throw error;
    }
  }

  public simulateDevice() {
    const fakeId = Math.random().toString(36).substring(7);
    const categories = Object.keys(DEVICE_KEYWORDS);
    // const randomKey = categories[Math.floor(Math.random() * categories.length)];
    const names = ['Galaxy S24', 'AirPods Pro', 'Fitbit Charge 5', 'MacBook Pro', 'Unknown Beacon', 'JBL Flip 6', 'Pixel Watch'];
    const name = names[Math.floor(Math.random() * names.length)];
    
    const fakeDevice: BluetoothDevice = {
      id: fakeId,
      name: name,
      addEventListener: () => {},
      removeEventListener: () => {},
      watchAdvertisements: async () => {},
      unwatchAdvertisements: () => {},
      watchingAdvertisements: false,
      dispatchEvent: () => true
    } as any;

    this.handleNewDevice(fakeDevice, true);
  }

  private handleNewDevice(device: BluetoothDevice, isSimulated = false) {
    const initialRssi = -Math.floor(Math.random() * 40 + 40); // Simulate initial RSSI
    
    // Simulate extra data for simulated devices
    let initialManData = undefined;
    if (isSimulated) {
        initialManData = `0x004c: 0215${Math.random().toString(16).substring(2,10)}...`;
    }

    const vizDevice: VizDevice = {
      id: device.id,
      name: device.name || 'Unknown Device',
      rssi: initialRssi,
      lastSeen: Date.now(),
      category: this.getCategory(device.name || ''),
      color: COLORS[this.getCategory(device.name || '')],
      position: this.getPosition(this.getDistance(initialRssi)),
      manufacturerData: initialManData
    };

    // Initial update
    this.updateCallback(vizDevice);

    // Watch for advertisements
    try {
      if (device.watchAdvertisements) {
        const controller = new AbortController();
        
        device.addEventListener('advertisementreceived', (event: BluetoothDeviceEvent) => {
          if (event.rssi) {
            const distance = this.getDistance(event.rssi);
            const newPos = this.getPosition(distance, vizDevice.position);
            
            // Extract Manufacturer Data
            let manDataStr: string | undefined = undefined;
            if (event.manufacturerData) {
               const parts: string[] = [];
               event.manufacturerData.forEach((dataView, id) => {
                 parts.push(`0x${id.toString(16).padStart(4, '0')}: ${buf2hex(dataView.buffer)}`);
               });
               if (parts.length > 0) manDataStr = parts.join('\n');
            }

            const updatedDevice: VizDevice = {
              ...vizDevice,
              rssi: event.rssi,
              txPower: event.txPower,
              uuids: event.uuids,
              lastSeen: Date.now(),
              position: newPos,
              manufacturerData: manDataStr || vizDevice.manufacturerData
            };
            
            this.updateCallback(updatedDevice);
          }
        });

        device.watchAdvertisements({ signal: controller.signal })
          .catch(err => console.warn("Watch advertisements failed (promise reject):", err));
      }
    } catch (err) {
      console.warn("Watch advertisements failed (sync error):", err);
    }
  }
}