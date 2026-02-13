import { Vector3 } from 'three';
import React from 'react';

// Web Bluetooth API Types (Partial)
export interface BluetoothDeviceEvent extends Event {
  device: BluetoothDevice;
  rssi?: number;
  txPower?: number;
  manufacturerData?: Map<number, DataView>;
  serviceData?: Map<string, DataView>;
  uuids?: string[];
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

// Global Augmentations
declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }

  // Global JSX Namespace (Legacy/Global Scope)
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      group: any;
      pointLight: any;
      ambientLight: any;
      spotLight: any;
      directionalLight: any;
      primitive: any;
      color: any;
      [elemName: string]: any;
    }
  }
}

// React Module Augmentation (React 18+ Scope)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      group: any;
      pointLight: any;
      ambientLight: any;
      spotLight: any;
      directionalLight: any;
      primitive: any;
      color: any;
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
  // Extra metadata for details view
  manufacturerData?: string;
  uuids?: string[];
  txPower?: number;
}

export enum DeviceCategory {
  AUDIO = 'AUDIO',
  PHONE = 'PHONE',
  WATCH = 'WATCH',
  COMPUTER = 'COMPUTER',
  GENERIC = 'GENERIC',
}