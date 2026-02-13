# Invisible Bluetooth Universe 🌌

**Invisible Bluetooth Universe** is a real-time, interactive 3D visualization that reveals the hidden digital aura surrounding you. Using the browser's **Web Bluetooth API**, it detects nearby Bluetooth Low Energy (BLE) devices and renders them as glowing, pulsating orbs in a sci-fi inspired 3D space.

The application calculates the distance of devices based on signal strength (RSSI) and categorizes them (Audio, Phones, Watches, etc.) using color-coded visual cues.

![Project Banner](https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)
*(Representative aesthetic)*

## ✨ Features

-   **Real-time Scanning**: Uses `navigator.bluetooth` to scan and connect to nearby BLE peripherals.
-   **3D Visualization**: Built with **Three.js** and **React Three Fiber**.
-   **Dynamic Signal Processing**:
    -   **Distance**: Calculated using logarithmic path loss models based on RSSI.
    -   **Pulse**: Orbs throb faster as signal strength increases.
    -   **Trails**: Movement trails show position history.
-   **Smart Categorization**: Automatically detects device types (Headphones, Phones, Watches) based on name keywords and assigns neon color palettes:
    -   🔵 **Cyan**: Audio Devices
    -   🟢 **Green**: Phones
    -   🟣 **Magenta**: Wearables/Watches
    -   🟡 **Yellow**: Computers
    -   ⚪ **White**: Generic/Unknown
-   **Cinematic Effects**: Post-processing includes Bloom, Noise, and Vignette for a deep-space atmosphere.
-   **Spatial Audio**: Subtle sci-fi chimes when new devices are discovered.

## ⚠️ Browser Support & Requirements

This project relies on the **Web Bluetooth API**, which is an experimental feature not available in all browsers.

| Browser | Status | Notes |
| :--- | :--- | :--- |
| **Google Chrome** | ✅ Supported | Desktop & Android |
| **Microsoft Edge** | ✅ Supported | Desktop |
| **Opera** | ✅ Supported | Desktop |
| **Safari** | ❌ Not Supported | iOS & macOS |
| **Firefox** | ❌ Not Supported | |

**Important Constraints:**
1.  **HTTPS**: The API only works when the site is served over HTTPS (or `localhost`).
2.  **User Gesture**: Scanning must be triggered by a user click (the "Start Scanning" button).
3.  **Device Selection**: Due to browser security implementations, the user must explicitly select a device from the browser's native chooser to "bridge" it to the app. You can repeat this process to add multiple devices to the scene.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16+)
-   A Bluetooth-enabled computer or Android phone.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/invisible-bluetooth-universe.git
    cd invisible-bluetooth-universe
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Navigate to `http://localhost:5173` (or the port shown in your terminal) using Chrome or Edge.

## 🎮 How to Use

1.  **Enter the Universe**: Open the application. You are represented by the bright green wireframe sphere in the center.
2.  **Start Scanning**: Click the **"SCAN FREQUENCY"** button in the bottom UI.
3.  **Select a Device**: The browser will open a native dialog showing nearby Bluetooth devices. Select one to "visualize" it.
    *   *Note: To populate the scene with multiple orbs, click Scan and select different devices repeatedly.*
4.  **Explore**:
    *   **Rotate**: Left-click and drag.
    *   **Zoom**: Scroll wheel.
    *   **Pan**: Right-click and drag.

## 🛠️ Technology Stack

-   **Frontend Framework**: [React 19](https://react.dev/)
-   **3D Engine**: [Three.js](https://threejs.org/)
-   **React 3D Bindings**: [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) & [@react-three/drei](https://github.com/pmndrs/drei)
-   **Post Processing**: [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Hardware Access**: [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)

## 📐 Math & Logic

The distance of the orbs is approximated using a simplified RSSI path loss formula:

```typescript
// RSSI typically ranges from -30 (close) to -100 (far)
const clampedRssi = Math.max(-100, Math.min(-30, rssi));
const factor = (Math.abs(clampedRssi) - 30) / 70; // Normalized 0-1
const distance = MIN_DISTANCE + factor * (MAX_DISTANCE - MIN_DISTANCE);
```

While not perfectly accurate to physical meters without calibration, this provides a relative visual scale of proximity.

## 📄 License

MIT License. Free to use for educational and creative purposes.