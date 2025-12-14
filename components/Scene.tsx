import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeState } from '../types';
import { InteractiveTree } from './InteractiveTree';
import * as THREE from 'three';

interface SceneProps {
  treeState: TreeState;
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ReinhardToneMapping, 
        toneMappingExposure: 1.5,
        powerPreference: "high-performance"
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={45} />
      
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} color="#001a10" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.25} 
        penumbra={1} 
        intensity={20} 
        color="#fff5d6" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={5} color="#D4AF37" />
      <pointLight position={[0, -5, 5]} intensity={2} color="#00ff88" />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Background Elements */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#D4AF37" />

      {/* Core 3D Content */}
      <InteractiveTree state={treeState} />

      {/* Post Processing for the "Luxury Glow" */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        <Noise opacity={0.02} />
      </EffectComposer>

      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={5}
        maxDistance={20}
        autoRotate={treeState === TreeState.SCATTERED}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};