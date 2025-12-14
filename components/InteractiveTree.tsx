import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface InteractiveTreeProps {
  state: TreeState;
}

// Configuration
const NEEDLE_COUNT = 3000;
const ORNAMENT_COUNT = 200;
const SCATTER_RADIUS = 15;
const TREE_HEIGHT = 10;
const TREE_RADIUS_BASE = 4.5;

const tempObject = new THREE.Object3D();
const tempPosition = new THREE.Vector3();
const tempScatter = new THREE.Vector3();
const tempTree = new THREE.Vector3();

// Helper to generate random point in sphere
const getRandomSpherePoint = (r: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const radius = Math.cbrt(Math.random()) * r; // Uniform distribution
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi)
  };
};

export const InteractiveTree: React.FC<InteractiveTreeProps> = ({ state }) => {
  const needlesRef = useRef<THREE.InstancedMesh>(null);
  const ornamentsRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.Group>(null);

  // --- Data Generation ---
  
  const needleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < NEEDLE_COUNT; i++) {
      // Tree Shape: Spiral Cone
      const ratio = i / NEEDLE_COUNT; // 0 to 1 (top to bottom usually, but let's invert height)
      const heightPercent = 1 - ratio; // 1 at top, 0 at bottom
      
      // Calculate Tree Position
      const y = (heightPercent * TREE_HEIGHT) - (TREE_HEIGHT / 2);
      const r = ratio * TREE_RADIUS_BASE; // wider at bottom
      const angle = i * 0.5; // Spiral tightness
      
      const tx = Math.cos(angle) * r;
      const tz = Math.sin(angle) * r;

      // Add some random jitter to tree position for natural look
      const jitter = 0.3;
      
      // Calculate Scatter Position
      const sPos = getRandomSpherePoint(SCATTER_RADIUS);

      data.push({
        treePosition: new THREE.Vector3(tx + (Math.random()-0.5)*jitter, y, tz + (Math.random()-0.5)*jitter),
        scatterPosition: new THREE.Vector3(sPos.x, sPos.y, sPos.z),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale: 0.5 + Math.random() * 0.5
      });
    }
    return data;
  }, []);

  const ornamentData = useMemo(() => {
    const data = [];
    for (let i = 0; i < ORNAMENT_COUNT; i++) {
      const ratio = i / ORNAMENT_COUNT;
      const heightPercent = 1 - ratio;
      
      const y = (heightPercent * TREE_HEIGHT) - (TREE_HEIGHT / 2);
      const r = ratio * (TREE_RADIUS_BASE + 0.5); // Slightly outside needles
      const angle = i * 2.4; // Different spiral
      
      const tx = Math.cos(angle) * r;
      const tz = Math.sin(angle) * r;

      const sPos = getRandomSpherePoint(SCATTER_RADIUS);

      data.push({
        treePosition: new THREE.Vector3(tx, y, tz),
        scatterPosition: new THREE.Vector3(sPos.x, sPos.y, sPos.z),
        scale: 1 + Math.random() * 0.8
      });
    }
    return data;
  }, []);

  // --- Animation Loop ---

  useFrame((stateContext, delta) => {
    const t = stateContext.clock.getElapsedTime();
    const isTree = state === TreeState.TREE_SHAPE;
    
    // Smooth transition factor (lerp target)
    // 0 = Scattered, 1 = Tree
    // We use a simple approach: if isTree, approach 1, else approach 0
    const targetLerp = isTree ? 1 : 0;
    
    // We store the current lerp value in a static var or ref to persist between frames would be better,
    // but for simplicity, let's use a dampening approach on the actual positions? 
    // No, better to have a single progress value.
    // Let's use a ref for the progress.
  });

  // Use a ref to track transition progress independently of React render cycle
  const progressRef = useRef(1); // Start at tree (1)

  useFrame((stateContext, delta) => {
    const isTree = state === TreeState.TREE_SHAPE;
    const target = isTree ? 1 : 0;
    
    // Smoothly interpolate progress
    // Using simple lerp: current = current + (target - current) * speed
    progressRef.current += (target - progressRef.current) * (delta * 2); // Speed of transition

    const p = progressRef.current;
    
    // 1. Update Needles
    if (needlesRef.current) {
      needleData.forEach((data, i) => {
        const { treePosition, scatterPosition, rotation, scale } = data;
        
        // Interpolate position
        tempPosition.lerpVectors(scatterPosition, treePosition, p);
        
        // Add floating motion when scattered
        if (p < 0.95) {
            const time = stateContext.clock.getElapsedTime();
            const noise = Math.sin(time + i) * (1 - p);
            tempPosition.y += noise * 0.02;
            tempPosition.x += Math.cos(time * 0.5 + i) * 0.01 * (1 - p);
        }

        tempObject.position.copy(tempPosition);
        
        // Rotation: Align with normal when tree, random when scattered
        // For simplicity, we just rotate them constantly or set fixed rotation
        tempObject.rotation.copy(rotation);
        if (p < 1) {
             tempObject.rotation.x += delta * 0.2 * (1 - p);
             tempObject.rotation.y += delta * 0.2 * (1 - p);
        }

        tempObject.scale.setScalar(scale);
        tempObject.updateMatrix();
        needlesRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      needlesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Update Ornaments
    if (ornamentsRef.current) {
      ornamentData.forEach((data, i) => {
        const { treePosition, scatterPosition, scale } = data;
        
        tempPosition.lerpVectors(scatterPosition, treePosition, p);
        
        // Ornaments float more heavily when scattered
        if (p < 0.99) {
            const time = stateContext.clock.getElapsedTime();
            tempPosition.y += Math.sin(time * 0.8 + i) * 0.05 * (1 - p);
        }

        tempObject.position.copy(tempPosition);
        tempObject.rotation.set(0, 0, 0);
        tempObject.scale.setScalar(scale * 0.3); // Ornaments are smaller spheres
        tempObject.updateMatrix();
        ornamentsRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      ornamentsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Update Star
    if (starRef.current) {
      // Star position
      const treeTop = new THREE.Vector3(0, TREE_HEIGHT / 2 + 1, 0);
      const scatterTop = new THREE.Vector3(0, 8, 0); // High up in scatter mode
      
      starRef.current.position.lerpVectors(scatterTop, treeTop, p);
      starRef.current.scale.setScalar(p); // Hide star when scattered (scale 0)
      starRef.current.rotation.y += delta * 0.5;
    }
  });

  // Colors
  const emeraldColor = new THREE.Color("#022b1c");
  const goldColor = new THREE.Color("#FFD700");

  return (
    <group>
      {/* Needles: Deep Green, slightly metallic */}
      <instancedMesh ref={needlesRef} args={[undefined, undefined, NEEDLE_COUNT]}>
        <coneGeometry args={[0.15, 0.4, 4]} />
        <meshStandardMaterial 
          color={emeraldColor} 
          roughness={0.4} 
          metalness={0.6}
          emissive="#001a10"
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Ornaments: High Gloss Gold */}
      <instancedMesh ref={ornamentsRef} args={[undefined, undefined, ORNAMENT_COUNT]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={goldColor} 
          roughness={0.1} 
          metalness={1}
          emissive="#C5A059"
          emissiveIntensity={0.4}
        />
      </instancedMesh>

      {/* The Star Topper */}
      <group ref={starRef}>
        <mesh>
          <octahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={2} 
            toneMapped={false} 
          />
        </mesh>
        <pointLight color="#FFD700" intensity={5} distance={10} decay={2} />
      </group>
    </group>
  );
};