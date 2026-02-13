import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { VizDevice } from '../types';
import DeviceOrb from './DeviceOrb';
import { COLORS } from '../constants';

interface SceneProps {
  devices: VizDevice[];
  onSelectDevice: (device: VizDevice) => void;
}

const UserNode = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={COLORS.USER}
          emissive={COLORS.USER}
          emissiveIntensity={3}
          wireframe
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2} color={COLORS.USER} distance={10} />
    </group>
  );
};

const Scene: React.FC<SceneProps> = ({ devices, onSelectDevice }) => {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: false }}>
      <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
      <color attach="background" args={['#050505']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Objects */}
      <UserNode />
      {devices.map((device) => (
        <DeviceOrb 
          key={device.id} 
          device={device} 
          onSelect={onSelectDevice}
        />
      ))}

      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minDistance={5} 
        maxDistance={60} 
        autoRotate 
        autoRotateSpeed={0.5} 
      />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;