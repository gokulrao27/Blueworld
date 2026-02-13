import { BluetoothDevice, VizDevice, DeviceCategory, BluetoothDeviceEvent } from '../types';
import { Vector3 } from 'three';
import { COLORS, DEVICE_KEYWORDS, MAX_DISTANCE, MIN_DISTANCE } from '../constants';

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
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [] // Can add battery_service etc if needed
      });

      if (device) {
        this.handleNewDevice(device);
      }
    } catch (error) {
      console.error("Bluetooth scan cancelled or failed:", error);
      throw error;
    }
  }

  private handleNewDevice(device: BluetoothDevice) {
    const initialRssi = -Math.floor(Math.random() * 40 + 40); // Simulate initial RSSI if not immediately available
    
    const vizDevice: VizDevice = {
      id: device.id,
      name: device.name || 'Unknown Device',
      rssi: initialRssi,
      lastSeen: Date.now(),
      category: this.getCategory(device.name || ''),
      color: COLORS[this.getCategory(device.name || '')],
      position: this.getPosition(this.getDistance(initialRssi))
    };

    // Initial update
    this.updateCallback(vizDevice);

    // Watch for advertisements if supported to get real-time RSSI
    if (device.watchAdvertisements) {
      const controller = new AbortController();
      
      device.addEventListener('advertisementreceived', (event: BluetoothDeviceEvent) => {
        if (event.rssi) {
          const distance = this.getDistance(event.rssi);
          const newPos = this.getPosition(distance, vizDevice.position);
          
          const updatedDevice: VizDevice = {
            ...vizDevice,
            rssi: event.rssi,
            lastSeen: Date.now(),
            position: newPos
          };
          
          this.updateCallback(updatedDevice);
        }
      });

      device.watchAdvertisements({ signal: controller.signal })
        .catch(err => console.warn("Watch advertisements failed:", err));
    }
  }
}
