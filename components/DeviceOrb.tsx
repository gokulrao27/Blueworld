import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Html } from '@react-three/drei';
import * as THREE from 'three';
import { VizDevice } from '../types';

interface DeviceOrbProps {
  device: VizDevice;
}

const DeviceOrb: React.FC<DeviceOrbProps> = ({ device }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Create a stable random offset for "hovering" animation
  const hoverOffset = useMemo(() => Math.random() * 100, []);

  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      // Smoothly interpolate position
      meshRef.current.position.lerp(device.position, 0.05);
      
      // Pulse effect based on RSSI (stronger signal = faster pulse)
      // Normalize RSSI (-30 to -100) to a speed factor
      const pulseSpeed = Math.max(1, (100 + device.rssi) / 10); 
      const time = state.clock.elapsedTime;
      
      const scaleBase = 1;
      const pulse = Math.sin(time * pulseSpeed + hoverOffset) * 0.1 + 1;
      
      const finalScale = scaleBase * pulse;
      meshRef.current.scale.setScalar(finalScale);
      
      // Update glow pulse (inverse)
      glowRef.current.scale.setScalar(finalScale * 1.4);
      glowRef.current.position.copy(meshRef.current.position);
      
      // Rotate the orb slightly
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;
    }
  });

  return (
    <>
      <Trail
        width={1.5}
        length={8}
        color={new THREE.Color(device.color)}
        attenuation={(t) => t * t}
      >
        <mesh ref={meshRef} position={device.position}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color={device.color}
            emissive={device.color}
            emissiveIntensity={2}
            toneMapped={false}
          />
          {/* Label */}
          <Html position={[0, 1, 0]} center distanceFactor={15}>
            <div className="pointer-events-none select-none text-xs font-mono text-white bg-black/50 px-2 py-1 rounded border border-white/20 backdrop-blur-sm whitespace-nowrap">
              <div className="font-bold">{device.name}</div>
              <div className="text-[10px] opacity-70">{device.rssi} dBm</div>
            </div>
          </Html>
        </mesh>
      </Trail>

      {/* Outer Glow Halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={device.color}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};

export default DeviceOrb;
