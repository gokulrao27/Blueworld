import { Vector3 } from 'three';

// Web Bluetooth API Types (Partial)
export interface BluetoothDeviceEvent extends Event {
  device: BluetoothDevice;
  rssi?: number;
  txPower?: number;
  manufacturerData?: Map<number, DataView>;
  serviceData?: Map<string, DataView>;
}

export interface BluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  watchAdvertisements(options?: { signal?: AbortSignal }): Promise<void>;
  unwatchAdvertisements(): void;
  watchingAdvertisements: boolean;
  addEventListener(type: string, listener: (event: BluetoothDeviceEvent) => void): void;
  removeEventListener(type: string, listener: (event: BluetoothDeviceEvent) => void): void;
}

export interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
}

export interface BluetoothRequestDeviceOptions {
  filters?: Array<{ name?: string; namePrefix?: string; services?: string[] }>;
  optionalServices?: string[];
  acceptAllDevices?: boolean;
}

export interface Bluetooth {
  requestDevice(options: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>;
  getAvailability(): Promise<boolean>;
}

declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }

  // Augment JSX IntrinsicElements to support React Three Fiber primitives
  // This resolves errors where TypeScript doesn't recognize R3F elements as valid JSX tags
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      group: any;
      pointLight: any;
      ambientLight: any;
      color: any;
      // Allow any other elements (HTML, SVG, etc) to avoid conflicts or missing definitions
      [elemName: string]: any;
    }
  }
}

// App Types
export interface VizDevice {
  id: string;
  name: string;
  rssi: number;
  lastSeen: number;
  position: Vector3; // Calculated target position
  color: string;
  category: DeviceCategory;
}

export enum DeviceCategory {
  AUDIO = 'AUDIO',
  PHONE = 'PHONE',
  WATCH = 'WATCH',
  COMPUTER = 'COMPUTER',
  GENERIC = 'GENERIC',
}