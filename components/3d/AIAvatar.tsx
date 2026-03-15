"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Float } from "@react-three/drei";
import * as THREE from "three";
import { ASSETS } from "@/lib/constants";
import Image from "next/image";

interface AIAvatarProps {
  isTalking?: boolean;
}

// Model component
function AvatarModel({ isTalking }: { isTalking: boolean }) {
  const group = useRef<THREE.Group>(null);
  
  // Conditionally load the GLTF (some setups might struggle, so we catch errors gracefully if we were to add error boundaries)
  const { scene } = useGLTF(ASSETS.models3d.avtar);

  useFrame((state) => {
    if (group.current && !isTalking) {
      // Subtle ambient oscillation if not talking
      group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={group} position={[0, -0.5, 0]}>
      <primitive object={scene} scale={[1.2, 1.2, 1.2]} />
    </group>
  );
}

// Main Component Wrapper
export function AIAvatar({ isTalking = false }: AIAvatarProps) {
  // Preload the model to prevent jank
  useEffect(() => {
    useGLTF.preload(ASSETS.models3d.avtar);
  }, []);

  return (
    <div className="relative w-20 h-20 shrink-0">
      {/* Background glow */}
      <div className="absolute inset-0 blur-xl bg-violet-500/20 -z-10 rounded-full" />
      
      {/* 3D Canvas */}
      <div className="w-full h-full relative z-10">
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 40 }}
          gl={{ alpha: true, antialias: true }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.5} />
          {/* Violet point light */}
          <pointLight position={[2, 2, 2]} color="#8B5CF6" intensity={1} />
          {/* Cyan point light */}
          <pointLight position={[-2, -2, 2]} color="#06B6D4" intensity={0.8} />
          
          <Float 
            speed={isTalking ? 4 : 2} 
            rotationIntensity={0.2} 
            floatIntensity={isTalking ? 0.5 : 0.3}
          >
            <AvatarModel isTalking={isTalking} />
          </Float>
        </Canvas>
      </div>

      {/* Fallback Image (In case WebGL goes down in next versions, though Canvas handles it usually by throwing. We'll rely on Canvas for now) */}
    </div>
  );
}
