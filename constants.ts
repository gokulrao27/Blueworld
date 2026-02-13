import { DeviceCategory } from './types';

export const COLORS = {
  [DeviceCategory.AUDIO]: '#00ffff', // Cyan
  [DeviceCategory.PHONE]: '#00ff00', // Green
  [DeviceCategory.WATCH]: '#ff00ff', // Magenta
  [DeviceCategory.COMPUTER]: '#ffff00', // Yellow
  [DeviceCategory.GENERIC]: '#ffffff', // White
  USER: '#00ff88', // Bright Green for center
};

export const RSSI_THRESHOLD = -100; // Treat as "far away"
export const MAX_DISTANCE = 30; // 3D units
export const MIN_DISTANCE = 5; // 3D units

// Keywords to guess device type from name
export const DEVICE_KEYWORDS: Record<string, DeviceCategory> = {
  'headphone': DeviceCategory.AUDIO,
  'bud': DeviceCategory.AUDIO,
  'pod': DeviceCategory.AUDIO,
  'speaker': DeviceCategory.AUDIO,
  'sound': DeviceCategory.AUDIO,
  'phone': DeviceCategory.PHONE,
  'iphone': DeviceCategory.PHONE,
  'pixel': DeviceCategory.PHONE,
  'galaxy': DeviceCategory.PHONE,
  'watch': DeviceCategory.WATCH,
  'band': DeviceCategory.WATCH,
  'fit': DeviceCategory.WATCH,
  'mac': DeviceCategory.COMPUTER,
  'win': DeviceCategory.COMPUTER,
  'laptop': DeviceCategory.COMPUTER,
};
